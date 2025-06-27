package services

import (
	"bytes"
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/minio/minio-go/v7"
)

type MinIOService struct {
	client     *minio.Client
	bucketName string
	endpoint   string
	useSSL     bool
}

type UploadResult struct {
	URL      string `json:"url"`
	Key      string `json:"key"`
	Size     int64  `json:"size"`
	MimeType string `json:"mime_type"`
}

func NewMinIOService(client *minio.Client, bucketName, endpoint string, useSSL bool) *MinIOService {
	return &MinIOService{
		client:     client,
		bucketName: bucketName,
		endpoint:   endpoint,
		useSSL:     useSSL,
	}
}

// UploadImage - Upload d'une image vers MinIO
func (s *MinIOService) UploadImage(ctx context.Context, file multipart.File, header *multipart.FileHeader, folder string) (*UploadResult, error) {
	// Validation du type MIME
	allowedTypes := []string{"image/jpeg", "image/jpg", "image/png", "image/webp"}
	if !s.isValidMimeType(header.Header.Get("Content-Type"), allowedTypes) {
		return nil, fmt.Errorf("type de fichier non autorisé: %s", header.Header.Get("Content-Type"))
	}

	// Validation de la taille (5MB max)
	maxSize := int64(5 * 1024 * 1024) // 5MB
	if header.Size > maxSize {
		return nil, fmt.Errorf("fichier trop volumineux: %d bytes (max: %d)", header.Size, maxSize)
	}

	// Générer un nom unique
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%s_%d%s", 
		strings.TrimSuffix(header.Filename, ext), 
		time.Now().UnixNano(), 
		ext)
	
	// Construire le chemin complet
	objectKey := fmt.Sprintf("%s/%s", folder, filename)

	// Lire le contenu du fichier
	fileData, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("erreur lecture fichier: %v", err)
	}

	// Upload vers MinIO
	reader := bytes.NewReader(fileData)
	info, err := s.client.PutObject(ctx, s.bucketName, objectKey, reader, int64(len(fileData)), minio.PutObjectOptions{
		ContentType: header.Header.Get("Content-Type"),
	})
	if err != nil {
		return nil, fmt.Errorf("erreur upload MinIO: %v", err)
	}

	// Construire l'URL publique
	url := s.GetPublicURL(objectKey)

	log.Printf("✅ Image uploadée: %s (%d bytes)", objectKey, info.Size)

	return &UploadResult{
		URL:      url,
		Key:      objectKey,
		Size:     info.Size,
		MimeType: header.Header.Get("Content-Type"),
	}, nil
}

// UploadMultipleImages - Upload multiple d'images
func (s *MinIOService) UploadMultipleImages(ctx context.Context, files []*multipart.FileHeader, folder string) ([]*UploadResult, error) {
	var results []*UploadResult
	var errors []string

	for _, fileHeader := range files {
		// Ouvrir le fichier
		file, err := fileHeader.Open()
		if err != nil {
			errors = append(errors, fmt.Sprintf("Erreur ouverture %s: %v", fileHeader.Filename, err))
			continue
		}

		// Upload
		result, err := s.UploadImage(ctx, file, fileHeader, folder)
		file.Close()

		if err != nil {
			errors = append(errors, fmt.Sprintf("Erreur upload %s: %v", fileHeader.Filename, err))
			continue
		}

		results = append(results, result)
	}

	// Si toutes les images ont échoué
	if len(results) == 0 && len(errors) > 0 {
		return nil, fmt.Errorf("aucune image uploadée: %s", strings.Join(errors, "; "))
	}

	// Log des erreurs partielles
	if len(errors) > 0 {
		log.Printf("⚠️ Erreurs partielles upload: %s", strings.Join(errors, "; "))
	}

	return results, nil
}

// DeleteImage - Suppression d'une image
func (s *MinIOService) DeleteImage(ctx context.Context, imageKey string) error {
	err := s.client.RemoveObject(ctx, s.bucketName, imageKey, minio.RemoveObjectOptions{})
	if err != nil {
		return fmt.Errorf("erreur suppression image: %v", err)
	}

	log.Printf("✅ Image supprimée: %s", imageKey)
	return nil
}

// DeleteMultipleImages - Suppression multiple d'images
func (s *MinIOService) DeleteMultipleImages(ctx context.Context, imageKeys []string) error {
	var errors []string

	for _, key := range imageKeys {
		err := s.DeleteImage(ctx, key)
		if err != nil {
			errors = append(errors, err.Error())
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("erreurs suppression: %s", strings.Join(errors, "; "))
	}

	return nil
}

// GetSignedURL - URL signée temporaire (pour téléchargement privé)
func (s *MinIOService) GetSignedURL(ctx context.Context, imageKey string, expiry time.Duration) (string, error) {
	url, err := s.client.PresignedGetObject(ctx, s.bucketName, imageKey, expiry, nil)
	if err != nil {
		return "", fmt.Errorf("erreur génération URL signée: %v", err)
	}

	return url.String(), nil
}

// GetPublicURL - URL publique directe
func (s *MinIOService) GetPublicURL(imageKey string) string {
	if s.useSSL {
		return fmt.Sprintf("https://%s/%s/%s", s.endpoint, s.bucketName, imageKey)
	}
	return fmt.Sprintf("http://%s/%s/%s", s.endpoint, s.bucketName, imageKey)
}

// ListImages - Lister les images d'un dossier
func (s *MinIOService) ListImages(ctx context.Context, folder string, limit int) ([]string, error) {
	var imageKeys []string
	
	objectCh := s.client.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    folder + "/",
		Recursive: true,
	})

	count := 0
	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("erreur listage: %v", object.Err)
		}

		imageKeys = append(imageKeys, object.Key)
		count++

		if limit > 0 && count >= limit {
			break
		}
	}

	return imageKeys, nil
}

// GetImageInfo - Informations sur une image
func (s *MinIOService) GetImageInfo(ctx context.Context, imageKey string) (*minio.ObjectInfo, error) {
	info, err := s.client.StatObject(ctx, s.bucketName, imageKey, minio.StatObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("image introuvable: %v", err)
	}

	return &info, nil
}

// BackupToStorage - Backup d'un dossier entier
func (s *MinIOService) BackupToStorage(ctx context.Context, sourceFolder, backupFolder string) error {
	images, err := s.ListImages(ctx, sourceFolder, 0) // 0 = pas de limite
	if err != nil {
		return fmt.Errorf("erreur listage source: %v", err)
	}

	var errors []string
	for _, imageKey := range images {
		// Construire le nouveau chemin
		filename := filepath.Base(imageKey)
		backupKey := fmt.Sprintf("%s/%s", backupFolder, filename)

		// Copier l'objet
		_, err := s.client.CopyObject(ctx, minio.CopyDestOptions{
			Bucket: s.bucketName,
			Object: backupKey,
		}, minio.CopySrcOptions{
			Bucket: s.bucketName,
			Object: imageKey,
		})

		if err != nil {
			errors = append(errors, fmt.Sprintf("Erreur backup %s: %v", imageKey, err))
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("erreurs backup: %s", strings.Join(errors, "; "))
	}

	log.Printf("✅ Backup terminé: %d images copiées de %s vers %s", len(images), sourceFolder, backupFolder)
	return nil
}

// MigrateFolderData - Migration des images d'un dossier vers un autre
func (s *MinIOService) MigrateFolderData(ctx context.Context, oldFolder, newFolder string, deleteSource bool) error {
	images, err := s.ListImages(ctx, oldFolder, 0)
	if err != nil {
		return fmt.Errorf("erreur listage dossier source: %v", err)
	}

	var errors []string
	migratedCount := 0

	for _, imageKey := range images {
		// Construire le nouveau chemin
		filename := filepath.Base(imageKey)
		newKey := fmt.Sprintf("%s/%s", newFolder, filename)

		// Copier vers le nouveau dossier
		_, err := s.client.CopyObject(ctx, minio.CopyDestOptions{
			Bucket: s.bucketName,
			Object: newKey,
		}, minio.CopySrcOptions{
			Bucket: s.bucketName,
			Object: imageKey,
		})

		if err != nil {
			errors = append(errors, fmt.Sprintf("Erreur copy %s: %v", imageKey, err))
			continue
		}

		// Supprimer l'ancien fichier si demandé
		if deleteSource {
			err = s.DeleteImage(ctx, imageKey)
			if err != nil {
				errors = append(errors, fmt.Sprintf("Erreur suppression %s: %v", imageKey, err))
			}
		}

		migratedCount++
	}

	if len(errors) > 0 {
		log.Printf("⚠️ Erreurs migration: %s", strings.Join(errors, "; "))
	}

	log.Printf("✅ Migration terminée: %d images migrées de %s vers %s", migratedCount, oldFolder, newFolder)
	return nil
}

// DeleteImagesByPrefix - Supprime toutes les images avec un préfixe donné
func (s *MinIOService) DeleteImagesByPrefix(ctx context.Context, prefix string) error {
	// Lister toutes les images avec ce préfixe
	objectCh := s.client.ListObjects(ctx, s.bucketName, minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	})

	var errors []string
	deletedCount := 0

	// Supprimer chaque objet
	for object := range objectCh {
		if object.Err != nil {
			return fmt.Errorf("erreur listage pour suppression: %v", object.Err)
		}

		err := s.client.RemoveObject(ctx, s.bucketName, object.Key, minio.RemoveObjectOptions{})
		if err != nil {
			errors = append(errors, fmt.Sprintf("Erreur suppression %s: %v", object.Key, err))
		} else {
			deletedCount++
		}
	}

	if len(errors) > 0 {
		log.Printf("⚠️ Erreurs suppression par préfixe: %s", strings.Join(errors, "; "))
	}

	log.Printf("✅ Suppression par préfixe terminée: %d images supprimées avec préfixe '%s'", deletedCount, prefix)
	return nil
}

// Helper function pour validation MIME
func (s *MinIOService) isValidMimeType(mimeType string, allowed []string) bool {
	for _, allowedType := range allowed {
		if mimeType == allowedType {
			return true
		}
	}
	return false
}