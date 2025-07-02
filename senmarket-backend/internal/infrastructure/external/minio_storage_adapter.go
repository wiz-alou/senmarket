// internal/infrastructure/external/minio_storage_adapter.go
package external

import (
	"context"
	"fmt"
	"mime/multipart"
	
	"senmarket/internal/services" // ⭐ Ton service MinIO existant
)

// MinIOStorageAdapter - Adapteur pour connecter ton service MinIO existant
type MinIOStorageAdapter struct {
	imageService *services.ImageService
}

// NewMinIOStorageAdapter - Constructeur
func NewMinIOStorageAdapter(imageService *services.ImageService) *MinIOStorageAdapter {
	return &MinIOStorageAdapter{
		imageService: imageService,
	}
}

// UploadImage - Upload une image (utilise la vraie méthode de ton service)
func (a *MinIOStorageAdapter) UploadImage(ctx context.Context, file *multipart.FileHeader) (*services.UploadedImage, error) {
	// ✅ CORRIGÉ: Utilise UploadImage qui existe dans ton service
	uploadedImage, err := a.imageService.UploadImage(file)
	if err != nil {
		return nil, fmt.Errorf("erreur upload image %s: %w", file.Filename, err)
	}
	return uploadedImage, nil
}

// UploadMultipleImages - Upload plusieurs images (utilise la vraie méthode)
func (a *MinIOStorageAdapter) UploadMultipleImages(ctx context.Context, files []*multipart.FileHeader) ([]*services.UploadedImage, error) {
	// ✅ CORRIGÉ: Utilise UploadMultipleImages qui existe dans ton service
	uploadedImages, err := a.imageService.UploadMultipleImages(files)
	if err != nil {
		return nil, fmt.Errorf("erreur upload multiple images: %w", err)
	}
	
	// ✅ CORRIGÉ: Conversion []services.UploadedImage -> []*services.UploadedImage
	result := make([]*services.UploadedImage, len(uploadedImages))
	for i := range uploadedImages {
		result[i] = &uploadedImages[i] // Prendre l'adresse de chaque élément
	}
	
	return result, nil
}

// DeleteImage - Supprimer une image (utilise la vraie méthode)
func (a *MinIOStorageAdapter) DeleteImage(ctx context.Context, key string) error {
	// ✅ CORRIGÉ: Utilise DeleteImage qui existe dans ton service
	err := a.imageService.DeleteImage(key)
	if err != nil {
		return fmt.Errorf("erreur suppression image %s: %w", key, err)
	}
	return nil
}

// ValidateImageFile - Valider un fichier image (utilise la vraie méthode)
func (a *MinIOStorageAdapter) ValidateImageFile(file *multipart.FileHeader) error {
	// ✅ CORRIGÉ: Utilise ValidateImageFile qui existe dans ton service
	return a.imageService.ValidateImageFile(file)
}

// GetImageURL - Récupérer l'URL d'une image (méthode helper)
func (a *MinIOStorageAdapter) GetImageURL(ctx context.Context, key string) (string, error) {
	// Construire l'URL basée sur la configuration MinIO
	// Tu peux adapter selon ta configuration
	url := fmt.Sprintf("https://minio.senmarket.com/%s", key)
	return url, nil
}
