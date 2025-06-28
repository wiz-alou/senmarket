package tests

import (
	"bytes"
	"context"
	"mime/multipart"
	"net/textproto"
	"testing"
	"time"

	"senmarket/config"
	"senmarket/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestMinIOService(t *testing.T) {
	// Configuration de test
	config.LoadConfig()
	minioClient := config.InitMinIO()
	minioService := services.NewMinIOService(minioClient)
	
	ctx := context.Background()
	testFolder := "test-images"
	
	t.Run("Upload Single Image", func(t *testing.T) {
		// Créer une image de test
		imageData := createTestImageData()
		header := createTestFileHeader("test-image.jpg", "image/jpeg", int64(len(imageData)))
		file := bytes.NewReader(imageData)
		
		// Upload
		result, err := minioService.UploadImage(ctx, file, header, testFolder)
		
		// Assertions
		require.NoError(t, err)
		assert.NotEmpty(t, result.URL)
		assert.NotEmpty(t, result.Key)
		assert.Equal(t, int64(len(imageData)), result.Size)
		assert.Equal(t, "image/jpeg", result.MimeType)
		
		// Nettoyer
		defer minioService.DeleteImage(ctx, result.Key)
	})
	
	t.Run("Upload Multiple Images", func(t *testing.T) {
		// Créer plusieurs images de test
		files := []*multipart.FileHeader{
			createTestFileHeader("test1.jpg", "image/jpeg", 1024),
			createTestFileHeader("test2.png", "image/png", 2048),
			createTestFileHeader("test3.webp", "image/webp", 1536),
		}
		
		// Upload
		results, err := minioService.UploadMultipleImages(ctx, files, testFolder)
		
		// Assertions
		require.NoError(t, err)
		assert.Len(t, results, 3)
		
		// Vérifier chaque résultat
		for i, result := range results {
			assert.NotEmpty(t, result.URL)
			assert.NotEmpty(t, result.Key)
			assert.Contains(t, result.Key, testFolder)
			assert.Contains(t, result.Key, files[i].Filename[:len(files[i].Filename)-4]) // sans extension
		}
		
		// Nettoyer
		var keys []string
		for _, result := range results {
			keys = append(keys, result.Key)
		}
		defer minioService.DeleteMultipleImages(ctx, keys)
	})
	
	t.Run("Delete Image", func(t *testing.T) {
		// Upload une image d'abord
		imageData := createTestImageData()
		header := createTestFileHeader("delete-test.jpg", "image/jpeg", int64(len(imageData)))
		file := bytes.NewReader(imageData)
		
		result, err := minioService.UploadImage(ctx, file, header, testFolder)
		require.NoError(t, err)
		
		// Vérifier que l'image existe
		_, err = minioService.GetImageInfo(ctx, result.Key)
		require.NoError(t, err)
		
		// Supprimer
		err = minioService.DeleteImage(ctx, result.Key)
		require.NoError(t, err)
		
		// Vérifier que l'image n'existe plus
		_, err = minioService.GetImageInfo(ctx, result.Key)
		assert.Error(t, err)
	})
	
	t.Run("Get Signed URL", func(t *testing.T) {
		// Upload une image d'abord
		imageData := createTestImageData()
		header := createTestFileHeader("signed-test.jpg", "image/jpeg", int64(len(imageData)))
		file := bytes.NewReader(imageData)
		
		result, err := minioService.UploadImage(ctx, file, header, testFolder)
		require.NoError(t, err)
		defer minioService.DeleteImage(ctx, result.Key)
		
		// Générer URL signée
		signedURL, err := minioService.GetSignedURL(ctx, result.Key, 1*time.Hour)
		
		// Assertions
		require.NoError(t, err)
		assert.NotEmpty(t, signedURL)
		assert.Contains(t, signedURL, result.Key)
	})
	
	t.Run("List Images", func(t *testing.T) {
		// Upload plusieurs images
		var uploadedKeys []string
		for i := 0; i < 3; i++ {
			imageData := createTestImageData()
			header := createTestFileHeader(fmt.Sprintf("list-test-%d.jpg", i), "image/jpeg", int64(len(imageData)))
			file := bytes.NewReader(imageData)
			
			result, err := minioService.UploadImage(ctx, file, header, testFolder)
			require.NoError(t, err)
			uploadedKeys = append(uploadedKeys, result.Key)
		}
		defer minioService.DeleteMultipleImages(ctx, uploadedKeys)
		
		// Lister les images
		images, err := minioService.ListImages(ctx, testFolder, 10)
		
		// Assertions
		require.NoError(t, err)
		assert.GreaterOrEqual(t, len(images), 3)
		
		// Vérifier que nos images uploadées sont dans la liste
		for _, uploadedKey := range uploadedKeys {
			found := false
			for _, listedImage := range images {
				if listedImage == uploadedKey {
					found = true
					break
				}
			}
			assert.True(t, found, "Image uploadée non trouvée dans la liste: %s", uploadedKey)
		}
	})
	
	t.Run("Backup Images", func(t *testing.T) {
		sourceFolder := "backup-source-test"
		backupFolder := "backup-dest-test"
		
		// Upload une image dans le dossier source
		imageData := createTestImageData()
		header := createTestFileHeader("backup-test.jpg", "image/jpeg", int64(len(imageData)))
		file := bytes.NewReader(imageData)
		
		result, err := minioService.UploadImage(ctx, file, header, sourceFolder)
		require.NoError(t, err)
		defer minioService.DeleteImage(ctx, result.Key)
		
		// Effectuer le backup
		err = minioService.BackupToStorage(ctx, sourceFolder, backupFolder)
		require.NoError(t, err)
		
		// Vérifier que l'image existe dans le backup
		backupImages, err := minioService.ListImages(ctx, backupFolder, 10)
		require.NoError(t, err)
		assert.Len(t, backupImages, 1)
		
		// Nettoyer le backup
		defer minioService.DeleteMultipleImages(ctx, backupImages)
	})
	
	t.Run("Invalid File Type", func(t *testing.T) {
		// Tenter d'uploader un fichier non-image
		fileData := []byte("This is not an image")
		header := createTestFileHeader("test.txt", "text/plain", int64(len(fileData)))
		file := bytes.NewReader(fileData)
		
		// Upload (doit échouer)
		_, err := minioService.UploadImage(ctx, file, header, testFolder)
		
		// Assertions
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "type de fichier non autorisé")
	})
	
	t.Run("File Too Large", func(t *testing.T) {
		// Créer un fichier de 6MB (max est 5MB)
		largeData := make([]byte, 6*1024*1024)
		header := createTestFileHeader("large.jpg", "image/jpeg", int64(len(largeData)))
		file := bytes.NewReader(largeData)
		
		// Upload (doit échouer)
		_, err := minioService.UploadImage(ctx, file, header, testFolder)
		
		// Assertions
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "fichier trop volumineux")
	})
}

func TestImageService(t *testing.T) {
	// Configuration de test
	config.LoadConfig()
	minioClient := config.InitMinIO()
	imageService := services.NewImageService(minioClient)
	
	ctx := context.Background()
	testListingID := uint(12345)
	
	t.Run("Upload Images for Listing", func(t *testing.T) {
		// Créer des images de test
		files := []*multipart.FileHeader{
			createTestFileHeader("listing1.jpg", "image/jpeg", 1024),
			createTestFileHeader("listing2.png", "image/png", 2048),
		}
		
		// Upload
		response, err := imageService.UploadImages(ctx, files, testListingID)
		
		// Assertions
		require.NoError(t, err)
		assert.Len(t, response.URLs, 2)
		assert.Len(t, response.Keys, 2)
		
		for _, url := range response.URLs {
			assert.NotEmpty(t, url)
			assert.Contains(t, url, fmt.Sprintf("listings/%d", testListingID))
		}
		
		// Nettoyer
		defer imageService.DeleteImages(ctx, response.Keys)
	})
	
	t.Run("Delete Listing Images", func(t *testing.T) {
		// Upload quelques images d'abord
		files := []*multipart.FileHeader{
			createTestFileHeader("delete1.jpg", "image/jpeg", 1024),
			createTestFileHeader("delete2.jpg", "image/jpeg", 1024),
		}
		
		response, err := imageService.UploadImages(ctx, files, testListingID)
		require.NoError(t, err)
		
		// Supprimer toutes les images de l'annonce
		err = imageService.DeleteListingImages(ctx, testListingID)
		require.NoError(t, err)
		
		// Vérifier qu'elles n'existent plus
		for _, key := range response.Keys {
			_, err := imageService.GetImageInfo(ctx, key)
			assert.Error(t, err)
		}
	})
	
	t.Run("Too Many Images", func(t *testing.T) {
		// Tenter d'uploader plus de 5 images
		files := make([]*multipart.FileHeader, 6)
		for i := 0; i < 6; i++ {
			files[i] = createTestFileHeader(fmt.Sprintf("too-many-%d.jpg", i), "image/jpeg", 1024)
		}
		
		// Upload (doit échouer)
		_, err := imageService.UploadImages(ctx, files, testListingID)
		
		// Assertions
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "maximum 5 images")
	})
}

// Fonctions utilitaires pour les tests

func createTestImageData() []byte {
	// Créer des données d'image minimales (JPEG header basique)
	return []byte{
		0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,
		0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
		0x00, 0x48, 0x00, 0x00, 0xFF, 0xD9,
	}
}

func createTestFileHeader(filename, contentType string, size int64) *multipart.FileHeader {
	header := &multipart.FileHeader{
		Filename: filename,
		Size:     size,
		Header:   make(textproto.MIMEHeader),
	}
	header.Header.Set("Content-Type", contentType)
	return header
}

// Benchmark pour performance

func BenchmarkMinIOUpload(b *testing.B) {
	config.LoadConfig()
	minioClient := config.InitMinIO()
	minioService := services.NewMinIOService(minioClient)
	
	ctx := context.Background()
	imageData := createTestImageData()
	header := createTestFileHeader("benchmark.jpg", "image/jpeg", int64(len(imageData)))
	
	b.ResetTimer()
	
	for i := 0; i < b.N; i++ {
		file := bytes.NewReader(imageData)
		result, err := minioService.UploadImage(ctx, file, header, "benchmark")
		if err != nil {
			b.Fatal(err)
		}
		
		// Nettoyer immédiatement pour éviter l'accumulation
		minioService.DeleteImage(ctx, result.Key)
	}
}