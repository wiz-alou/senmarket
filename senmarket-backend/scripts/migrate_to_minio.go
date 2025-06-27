package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"senmarket/config"
	"senmarket/models"
	"senmarket/services"

	"gorm.io/gorm"
)

func main() {
	log.Println("🚀 Démarrage migration images vers MinIO...")

	// Initialiser les services
	config.LoadConfig()
	db := config.InitDatabase()
	minioClient := config.InitMinIO()
	
	imageService := services.NewImageService(minioClient)
	
	// Migration
	err := migrateExistingImages(db, imageService)
	if err != nil {
		log.Fatalf("❌ Erreur migration: %v", err)
	}
	
	log.Println("✅ Migration terminée avec succès!")
}

func migrateExistingImages(db *gorm.DB, imageService *services.ImageService) error {
	ctx := context.Background()
	
	// 1. Récupérer toutes les annonces avec des images locales
	var listings []models.Listing
	err := db.Find(&listings).Error
	if err != nil {
		return fmt.Errorf("erreur récupération annonces: %v", err)
	}

	log.Printf("📊 Trouvé %d annonces à traiter", len(listings))

	migrated := 0
	errors := 0
	
	for _, listing := range listings {
		// Vérifier si l'annonce a des images locales
		if len(listing.Images) == 0 {
			continue
		}
		
		log.Printf("🔄 Migration annonce %d (%s)...", listing.ID, listing.Title)
		
		var newImageURLs []string
		var imagesToDelete []string
		
		for _, imageURL := range listing.Images {
			// Skip si l'image est déjà sur MinIO
			if strings.Contains(imageURL, "minio") || strings.Contains(imageURL, config.MinIO.Endpoint) {
				newImageURLs = append(newImageURLs, imageURL)
				continue
			}
			
			// Construire le chemin local
			localPath := "./uploads/" + strings.TrimPrefix(imageURL, "/uploads/")
			
			// Vérifier si le fichier existe
			if _, err := os.Stat(localPath); os.IsNotExist(err) {
				log.Printf("⚠️ Fichier introuvable: %s", localPath)
				continue
			}
			
			// Migrer l'image vers MinIO
			newURL, err := migrateImageFile(ctx, imageService, localPath, listing.ID)
			if err != nil {
				log.Printf("❌ Erreur migration %s: %v", localPath, err)
				errors++
				continue
			}
			
			newImageURLs = append(newImageURLs, newURL)
			imagesToDelete = append(imagesToDelete, localPath)
		}
		
		// Mettre à jour la base de données
		if len(newImageURLs) > 0 {
			err = db.Model(&listing).Update("images", newImageURLs).Error
			if err != nil {
				log.Printf("❌ Erreur mise à jour BDD annonce %d: %v", listing.ID, err)
				errors++
				continue
			}
			
			// Supprimer les fichiers locaux après succès
			for _, localPath := range imagesToDelete {
				err = os.Remove(localPath)
				if err != nil {
					log.Printf("⚠️ Erreur suppression fichier local %s: %v", localPath, err)
				}
			}
			
			migrated++
			log.Printf("✅ Annonce %d migrée (%d images)", listing.ID, len(newImageURLs))
		}
		
		// Pause pour éviter la surcharge
		time.Sleep(100 * time.Millisecond)
	}
	
	log.Printf("📊 Résultats migration:")
	log.Printf("   ✅ Annonces migrées: %d", migrated)
	log.Printf("   ❌ Erreurs: %d", errors)
	log.Printf("   📁 Total annonces: %d", len(listings))
	
	return nil
}

func migrateImageFile(ctx context.Context, imageService *services.ImageService, localPath string, listingID uint) (string, error) {
	// Ouvrir le fichier local
	file, err := os.Open(localPath)
	if err != nil {
		return "", fmt.Errorf("erreur ouverture fichier: %v", err)
	}
	defer file.Close()
	
	// Obtenir les informations du fichier
	fileInfo, err := file.Stat()
	if err != nil {
		return "", fmt.Errorf("erreur info fichier: %v", err)
	}
	
	// Déterminer le type MIME
	ext := strings.ToLower(filepath.Ext(localPath))
	var mimeType string
	switch ext {
	case ".jpg", ".jpeg":
		mimeType = "image/jpeg"
	case ".png":
		mimeType = "image/png"
	case ".webp":
		mimeType = "image/webp"
	default:
		return "", fmt.Errorf("type de fichier non supporté: %s", ext)
	}
	
	// Créer un multipart.FileHeader simulé
	header := &multipart.FileHeader{
		Filename: filepath.Base(localPath),
		Size:     fileInfo.Size(),
		Header:   make(map[string][]string),
	}
	header.Header.Set("Content-Type", mimeType)
	
	// Définir le dossier de destination
	folder := fmt.Sprintf("listings/%d", listingID)
	
	// Upload vers MinIO
	newURL, err := imageService.UploadSingleImage(ctx, file, header, folder)
	if err != nil {
		return "", fmt.Errorf("erreur upload MinIO: %v", err)
	}
	
	return newURL, nil
}

// Fonction utilitaire pour nettoyer le dossier uploads vide
func cleanupEmptyDirectories(rootPath string) error {
	return filepath.Walk(rootPath, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		
		if info.IsDir() && path != rootPath {
			// Vérifier si le dossier est vide
			entries, err := os.ReadDir(path)
			if err != nil {
				return err
			}
			
			if len(entries) == 0 {
				log.Printf("🗑️ Suppression dossier vide: %s", path)
				return os.Remove(path)
			}
		}
		
		return nil
	})
}

// Fonction de validation post-migration
func validateMigration(db *gorm.DB) error {
	var listings []models.Listing
	err := db.Find(&listings).Error
	if err != nil {
		return err
	}
	
	localImages := 0
	minioImages := 0
	
	for _, listing := range listings {
		for _, imageURL := range listing.Images {
			if strings.Contains(imageURL, "minio") || strings.Contains(imageURL, config.MinIO.Endpoint) {
				minioImages++
			} else if strings.Contains(imageURL, "/uploads/") {
				localImages++
			}
		}
	}
	
	log.Printf("📊 Validation migration:")
	log.Printf("   📁 Images MinIO: %d", minioImages)
	log.Printf("   💾 Images locales restantes: %d", localImages)
	
	if localImages > 0 {
		return fmt.Errorf("⚠️ %d images locales non migrées", localImages)
	}
	
	log.Println("✅ Toutes les images sont sur MinIO")
	return nil
}