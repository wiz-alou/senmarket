// internal/services/image_service.go
package services

import (
	"fmt"
	"image"
	"image/jpeg"
	"image/png"
	// "io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/nfnt/resize"
)

type ImageService struct {
	uploadDir   string
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
	Path     string `json:"path"`
	Size     int64  `json:"size"`
	Width    int    `json:"width"`
	Height   int    `json:"height"`
}

func NewImageService(uploadDir, baseURL string) *ImageService {
	return &ImageService{
		uploadDir:   uploadDir,
		baseURL:     baseURL,
		maxFileSize: 5 * 1024 * 1024, // 5MB
		maxWidth:    1200,
		maxHeight:   800,
		quality:     85,
	}
}

// UploadImage upload et traite une image
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
	
	// Créer le répertoire si nécessaire
	yearMonth := time.Now().Format("2006/01")
	fullUploadDir := filepath.Join(s.uploadDir, yearMonth)
	if err := os.MkdirAll(fullUploadDir, 0755); err != nil {
		return nil, fmt.Errorf("erreur création répertoire: %w", err)
	}

	// Chemin complet du fichier
	fullPath := filepath.Join(fullUploadDir, filename)

	// Créer le fichier de destination
	dst, err := os.Create(fullPath)
	if err != nil {
		return nil, fmt.Errorf("erreur création fichier: %w", err)
	}
	defer dst.Close()

	// Encoder et sauvegarder l'image
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(dst, resizedImg, &jpeg.Options{Quality: s.quality})
	case "png":
		err = png.Encode(dst, resizedImg)
	default:
		return nil, fmt.Errorf("format non supporté: %s", format)
	}

	if err != nil {
		return nil, fmt.Errorf("erreur encodage image: %w", err)
	}

	// Calculer la taille finale
	fileInfo, err := dst.Stat()
	if err != nil {
		return nil, fmt.Errorf("erreur lecture informations fichier: %w", err)
	}

	// Construire l'URL publique
	relativePath := filepath.Join(yearMonth, filename)
	url := fmt.Sprintf("%s/uploads/%s", s.baseURL, strings.ReplaceAll(relativePath, "\\", "/"))

	return &UploadedImage{
		ID:       imageID,
		Filename: filename,
		URL:      url,
		Path:     relativePath,
		Size:     fileInfo.Size(),
		Width:    newWidth,
		Height:   newHeight,
	}, nil
}

// isValidExtension vérifie si l'extension est valide
func (s *ImageService) isValidExtension(ext string) bool {
	validExts := []string{".jpg", ".jpeg", ".png", ".webp"}
	for _, validExt := range validExts {
		if ext == validExt {
			return true
		}
	}
	return false
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


// UploadMultipleImages upload plusieurs images
func (s *ImageService) UploadMultipleImages(files []*multipart.FileHeader) ([]UploadedImage, error) {
	if len(files) > 5 {
		return nil, fmt.Errorf("maximum 5 images autorisées")
	}

	var uploadedImages []UploadedImage
	
	for _, file := range files {
		img, err := s.UploadImage(file)
		if err != nil {
			// Nettoyer les images déjà uploadées en cas d'erreur
			for _, uploaded := range uploadedImages {
				s.DeleteImage(uploaded.Path)
			}
			return nil, fmt.Errorf("erreur upload %s: %w", file.Filename, err)
		}
		uploadedImages = append(uploadedImages, *img)
	}

	return uploadedImages, nil
}

// DeleteImage supprime une image
func (s *ImageService) DeleteImage(imagePath string) error {
	fullPath := filepath.Join(s.uploadDir, imagePath)
	if err := os.Remove(fullPath); err != nil {
		return fmt.Errorf("erreur suppression image: %w", err)
	}
	return nil
}

// GetImageInfo récupère les informations d'une image
func (s *ImageService) GetImageInfo(imagePath string) (*UploadedImage, error) {
	fullPath := filepath.Join(s.uploadDir, imagePath)
	
	// Vérifier que le fichier existe
	fileInfo, err := os.Stat(fullPath)
	if err != nil {
		return nil, fmt.Errorf("image non trouvée: %w", err)
	}

	// Ouvrir et décoder l'image pour obtenir les dimensions
	file, err := os.Open(fullPath)
	if err != nil {
		return nil, fmt.Errorf("erreur ouverture image: %w", err)
	}
	defer file.Close()

	img, _, err := image.DecodeConfig(file)
	if err != nil {
		return nil, fmt.Errorf("erreur décodage config image: %w", err)
	}

	url := fmt.Sprintf("%s/uploads/%s", s.baseURL, strings.ReplaceAll(imagePath, "\\", "/"))

	return &UploadedImage{
		Filename: filepath.Base(imagePath),
		URL:      url,
		Path:     imagePath,
		Size:     fileInfo.Size(),
		Width:    img.Width,
		Height:   img.Height,
	}, nil
}

// CreateThumbnail crée une miniature
func (s *ImageService) CreateThumbnail(imagePath string, width, height uint) (string, error) {
	fullPath := filepath.Join(s.uploadDir, imagePath)
	
	// Ouvrir l'image originale
	file, err := os.Open(fullPath)
	if err != nil {
		return "", fmt.Errorf("erreur ouverture image: %w", err)
	}
	defer file.Close()

	// Décoder l'image
	img, format, err := image.Decode(file)
	if err != nil {
		return "", fmt.Errorf("erreur décodage image: %w", err)
	}

	// Redimensionner
	thumbnail := resize.Thumbnail(width, height, img, resize.Lanczos3)

	// Générer le nom du fichier miniature
	ext := filepath.Ext(imagePath)
	baseName := strings.TrimSuffix(imagePath, ext)
	thumbnailPath := fmt.Sprintf("%s_thumb_%dx%d%s", baseName, width, height, ext)
	
	fullThumbnailPath := filepath.Join(s.uploadDir, thumbnailPath)

	// Créer le répertoire si nécessaire
	if err := os.MkdirAll(filepath.Dir(fullThumbnailPath), 0755); err != nil {
		return "", fmt.Errorf("erreur création répertoire: %w", err)
	}

	// Créer le fichier miniature
	dst, err := os.Create(fullThumbnailPath)
	if err != nil {
		return "", fmt.Errorf("erreur création fichier miniature: %w", err)
	}
	defer dst.Close()

	// Encoder selon le format
	switch format {
	case "jpeg", "jpg":
		err = jpeg.Encode(dst, thumbnail, &jpeg.Options{Quality: s.quality})
	case "png":
		err = png.Encode(dst, thumbnail)
	default:
		return "", fmt.Errorf("format non supporté: %s", format)
	}

	if err != nil {
		return "", fmt.Errorf("erreur encodage miniature: %w", err)
	}

	return thumbnailPath, nil
}