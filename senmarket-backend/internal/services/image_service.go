// internal/services/image_service.go
package services

import (
	"bytes"
	"context"
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/nfnt/resize"
)

type ImageService struct {
	minioClient *minio.Client
	bucketName  string
	baseURL     string
	maxFileSize int64
	maxWidth    uint
	maxHeight   uint
	quality     int
}

type UploadedImage struct {
	ID       string `json:"id"`
	Filename string `json:"filename"`
	URL      string `json:"url"`
	Key      string `json:"key"`       // Nouveau: clé MinIO
	Size     int64  `json:"size"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
}

func NewImageService(minioClient *minio.Client, bucketName, baseURL string) *ImageService {
	return &ImageService{
		minioClient: minioClient,
		bucketName:  bucketName,
		baseURL:     baseURL,
		maxFileSize: 5 * 1024 * 1024, // 5MB
		maxWidth:    1200,
		maxHeight:   800,
		quality:     85,
	}
}

// UploadImage upload et traite une image vers MinIO
func (s *ImageService) UploadImage(file *multipart.FileHeader) (*UploadedImage, error) {
	// Vérification de la taille
	if file.Size > s.maxFileSize {
		return nil, fmt.Errorf("fichier trop volumineux (max: %d bytes)", s.maxFileSize)
	}

	// Vérification de l'extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !s.isValidExtension(ext) {
		return nil, fmt.Errorf("extension non supportée: %s", ext)
	}

	// Ouvrir le fichier
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("erreur ouverture fichier: %w", err)
	}
	defer src.Close()

	// Décoder l'image
	img, format, err := image.Decode(src)
	if err != nil {
		return nil, fmt.Errorf("erreur décodage image: %w", err)
	}

	// Redimensionner si nécessaire
	bounds := img.Bounds()
	originalWidth := bounds.Dx()
	originalHeight := bounds.Dy()

	var resizedImg image.Image = img
	newWidth := originalWidth
	newHeight := originalHeight

	if uint(originalWidth) > s.maxWidth || uint(originalHeight) > s.maxHeight {
		resizedImg = resize.Thumbnail(s.maxWidth, s.maxHeight, img, resize.Lanczos3)
		newBounds := resizedImg.Bounds()
		newWidth = newBounds.Dx()
		newHeight = newBounds.Dy()
	}

	// Générer un nom de fichier unique
	imageID := uuid.New().String()
	filename := fmt.Sprintf("%s_%d%s", imageID, time.Now().Unix(), ext)
	
	// Créer le chemin dans MinIO avec structure date
	yearMonth := time.Now().Format("2006/01")
	objectKey := fmt.Sprintf("images/%s/%s", yearMonth, filename)

	// Encoder l'image redimensionnée en buffer
	var buf bytes.Buffer
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(&buf, resizedImg, &jpeg.Options{Quality: s.quality})
	case "png":
		err = png.Encode(&buf, resizedImg)
	default:
		return nil, fmt.Errorf("format non supporté: %s", format)
	}

	if err != nil {
		return nil, fmt.Errorf("erreur encodage image: %w", err)
	}

	// Upload vers MinIO
	ctx := context.Background()
	reader := bytes.NewReader(buf.Bytes())
	
	// Déterminer le Content-Type
	contentType := "image/jpeg"
	if format == "png" {
		contentType = "image/png"
	}

	info, err := s.minioClient.PutObject(ctx, s.bucketName, objectKey, reader, int64(buf.Len()), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return nil, fmt.Errorf("erreur upload MinIO: %w", err)
	}

	// Construire l'URL publique
	url := s.GetImageURL(objectKey)

	return &UploadedImage{
		ID:       imageID,
		Filename: filename,
		URL:      url,
		Key:      objectKey,
		Size:     info.Size,
		Width:    newWidth,
		Height:   newHeight,
	}, nil
}

// UploadMultipleImages upload plusieurs images vers MinIO
func (s *ImageService) UploadMultipleImages(files []*multipart.FileHeader) ([]UploadedImage, error) {
	if len(files) > 5 {
		return nil, fmt.Errorf("maximum 5 images autorisées")
	}

	var uploadedImages []UploadedImage
	var uploadedKeys []string // Pour nettoyage en cas d'erreur
	
	for _, file := range files {
		img, err := s.UploadImage(file)
		if err != nil {
			// Nettoyer les images déjà uploadées en cas d'erreur
			s.deleteMultipleImages(uploadedKeys)
			return nil, fmt.Errorf("erreur upload %s: %w", file.Filename, err)
		}
		uploadedImages = append(uploadedImages, *img)
		uploadedKeys = append(uploadedKeys, img.Key)
	}

	return uploadedImages, nil
}

// DeleteImage supprime une image de MinIO
func (s *ImageService) DeleteImage(imageKey string) error {
	ctx := context.Background()
	err := s.minioClient.RemoveObject(ctx, s.bucketName, imageKey, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("erreur suppression image MinIO: %w", err)
	}
	return nil
}

// deleteMultipleImages supprime plusieurs images (utilitaire interne)
func (s *ImageService) deleteMultipleImages(imageKeys []string) {
	ctx := context.Background()
	for _, key := range imageKeys {
		s.minioClient.RemoveObject(ctx, s.bucketName, key, minio.RemoveObjectOptions{})
	}
}

// GetImageInfo récupère les informations d'une image depuis MinIO
func (s *ImageService) GetImageInfo(imageKey string) (*UploadedImage, error) {
	ctx := context.Background()
	
	// Obtenir les métadonnées de l'objet
	objInfo, err := s.minioClient.StatObject(ctx, s.bucketName, imageKey, minio.StatObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("image non trouvée dans MinIO: %w", err)
	}

	// Télécharger l'image pour obtenir les dimensions
	obj, err := s.minioClient.GetObject(ctx, s.bucketName, imageKey, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("erreur lecture image MinIO: %w", err)
	}
	defer obj.Close()

	// Décoder l'image pour obtenir les dimensions
	imgConfig, _, err := image.DecodeConfig(obj)
	if err != nil {
		return nil, fmt.Errorf("erreur décodage config image: %w", err)
	}

	url := s.GetImageURL(imageKey)

	return &UploadedImage{
		Filename: filepath.Base(imageKey),
		URL:      url,
		Key:      imageKey,
		Size:     objInfo.Size,
		Width:    imgConfig.Width,
		Height:   imgConfig.Height,
	}, nil
}

// CreateThumbnail crée une miniature dans MinIO
func (s *ImageService) CreateThumbnail(imageKey string, width, height uint) (string, error) {
	ctx := context.Background()
	
	// Télécharger l'image originale depuis MinIO
	obj, err := s.minioClient.GetObject(ctx, s.bucketName, imageKey, minio.GetObjectOptions{})
	if err != nil {
		return "", fmt.Errorf("erreur téléchargement image MinIO: %w", err)
	}
	defer obj.Close()

	// Décoder l'image
	img, format, err := image.Decode(obj)
	if err != nil {
		return "", fmt.Errorf("erreur décodage image: %w", err)
	}

	// Redimensionner
	thumbnail := resize.Thumbnail(width, height, img, resize.Lanczos3)

	// Générer le nom du fichier miniature
	ext := filepath.Ext(imageKey)
	baseName := strings.TrimSuffix(imageKey, ext)
	thumbnailKey := fmt.Sprintf("%s_thumb_%dx%d%s", baseName, width, height, ext)

	// Encoder la miniature
	var buf bytes.Buffer
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(&buf, thumbnail, &jpeg.Options{Quality: s.quality})
	case "png":
		err = png.Encode(&buf, thumbnail)
	default:
		return "", fmt.Errorf("format non supporté: %s", format)
	}

	if err != nil {
		return "", fmt.Errorf("erreur encodage miniature: %w", err)
	}

	// Upload de la miniature vers MinIO
	reader := bytes.NewReader(buf.Bytes())
	contentType := "image/jpeg"
	if format == "png" {
		contentType = "image/png"
	}

	_, err = s.minioClient.PutObject(ctx, s.bucketName, thumbnailKey, reader, int64(buf.Len()), minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		return "", fmt.Errorf("erreur upload miniature MinIO: %w", err)
	}

	return thumbnailKey, nil
}

// ValidateImageFile valide un fichier image sans l'uploader
func (s *ImageService) ValidateImageFile(file *multipart.FileHeader) error {
	// Vérification de la taille
	if file.Size > s.maxFileSize {
		return fmt.Errorf("fichier trop volumineux (max: %.1f MB)", float64(s.maxFileSize)/(1024*1024))
	}

	// Vérification de l'extension
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !s.isValidExtension(ext) {
		return fmt.Errorf("extension non supportée: %s", ext)
	}

	return nil
}

// ⭐ NOUVEAU: GetImageURL - Obtenir l'URL publique d'une image
func (s *ImageService) GetImageURL(imageKey string) string {
	// Format URL publique MinIO
	return fmt.Sprintf("http://localhost:9000/%s/%s", s.bucketName, imageKey)
}

// ⭐ NOUVEAU: GetSignedImageURL - Obtenir une URL signée temporaire
func (s *ImageService) GetSignedImageURL(ctx context.Context, imageKey string) (string, error) {
	// URL valide 24h pour les téléchargements privés
	expiry := 24 * time.Hour
	url, err := s.minioClient.PresignedGetObject(ctx, s.bucketName, imageKey, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("erreur génération URL signée: %w", err)
	}
	return url.String(), nil
}

// ListImages liste les images d'un préfixe
func (s *ImageService) ListImages(prefix string, maxKeys int) ([]string, error) {
	ctx := context.Background()
	var imageKeys []string
	
	objectCh := s.minioClient.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})

	count := 0
	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("erreur listage MinIO: %w", object.Err)
		}

		imageKeys = append(imageKeys, object.Key)
		count++

		if maxKeys > 0 && count >= maxKeys {
			break
		}
	}

	return imageKeys, nil
}

// DeleteImagesByPrefix supprime toutes les images avec un préfixe donné
func (s *ImageService) DeleteImagesByPrefix(prefix string) error {
	ctx := context.Background()
	
	// Lister toutes les images avec ce préfixe
	objectCh := s.minioClient.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})

	// Supprimer chaque objet
	for object := range objectCh {
		if object.Err != nil {
			return fmt.Errorf("erreur listage pour suppression: %w", object.Err)
		}

		err := s.minioClient.RemoveObject(ctx, s.bucketName, object.Key, minio.RemoveObjectOptions{})
		if err != nil {
			return fmt.Errorf("erreur suppression %s: %w", object.Key, err)
		}
	}

	return nil
}

// Helper functions

func (s *ImageService) isValidExtension(ext string) bool {
	validExts := []string{".jpg", ".jpeg", ".png", ".webp"}
	for _, validExt := range validExts {
		if ext == validExt {
			return true
		}
	}
	return false
}