// internal/infrastructure/storage/minio_service.go
package storage

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/minio/minio-go/v7"
)

// MinIOService service de stockage MinIO
type MinIOService struct {
	client   *minio.Client
	endpoint string
	useSSL   bool
	bucket   string // ⭐ NOUVEAU : bucket par défaut
}

// NewMinIOService crée un nouveau service MinIO
func NewMinIOService(client *minio.Client, endpoint string, useSSL bool) StorageProvider {
	return &MinIOService{
		client:   client,
		endpoint: endpoint,
		useSSL:   useSSL,
		bucket:   "senmarket-images", // ⭐ NOUVEAU : bucket par défaut
	}
}

// ⭐ NOUVELLE MÉTHODE : IsHealthy vérifie la santé de MinIO
func (s *MinIOService) IsHealthy(ctx context.Context) bool {
	if s.client == nil {
		return false
	}
	
	// Test 1: Vérifier que MinIO répond
	if !s.checkMinIOConnection(ctx) {
		return false
	}
	
	// Test 2: Vérifier que le bucket existe ou peut être créé
	if !s.checkBucketExists(ctx) {
		return false
	}
	
	return true
}

// ⭐ NOUVELLE MÉTHODE : checkMinIOConnection teste la connexion HTTP à MinIO
func (s *MinIOService) checkMinIOConnection(ctx context.Context) bool {
	// Construire l'URL de health check MinIO
	scheme := "http"
	if s.useSSL {
		scheme = "https"
	}
	
	healthURL := fmt.Sprintf("%s://%s/minio/health/live", scheme, s.endpoint)
	
	// Créer une requête HTTP avec timeout
	client := &http.Client{
		Timeout: 3 * time.Second,
	}
	
	req, err := http.NewRequestWithContext(ctx, "GET", healthURL, nil)
	if err != nil {
		return false
	}
	
	// Faire la requête
	resp, err := client.Do(req)
	if err != nil {
		return false
	}
	defer resp.Body.Close()
	
	// MinIO health endpoint retourne 200 si OK
	return resp.StatusCode == http.StatusOK
}

// ⭐ NOUVELLE MÉTHODE : checkBucketExists vérifie que le bucket par défaut existe
func (s *MinIOService) checkBucketExists(ctx context.Context) bool {
	if s.client == nil {
		return false
	}
	
	// Utiliser BucketExists de MinIO SDK
	exists, err := s.client.BucketExists(ctx, s.bucket)
	if err != nil {
		return false
	}
	
	// Si le bucket n'existe pas, essayer de le créer
	if !exists {
		err = s.client.MakeBucket(ctx, s.bucket, minio.MakeBucketOptions{})
		if err != nil {
			return false
		}
	}
	
	return true
}

// ⭐ NOUVELLE MÉTHODE : GetStatus retourne le statut détaillé
func (s *MinIOService) GetStatus(ctx context.Context) map[string]interface{} {
	status := map[string]interface{}{
		"provider": "minio",
		"endpoint": s.endpoint,
		"bucket":   s.bucket,
		"ssl":      s.useSSL,
	}
	
	if s.IsHealthy(ctx) {
		status["status"] = "up"
		status["message"] = "MinIO opérationnel"
		status["configured"] = true
	} else {
		status["status"] = "down"
		status["message"] = "MinIO non accessible"
		status["configured"] = s.client != nil
	}
	
	return status
}

// UploadFile upload un fichier vers MinIO
func (s *MinIOService) UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, contentType string) (*UploadResult, error) {
	// Options d'upload
	opts := minio.PutObjectOptions{
		ContentType: contentType,
	}
	
	// Upload du fichier
	info, err := s.client.PutObject(ctx, bucketName, objectName, reader, objectSize, opts)
	if err != nil {
		return nil, fmt.Errorf("failed to upload file: %w", err)
	}
	
	// Générer l'URL du fichier
	url := s.generatePublicURL(bucketName, objectName)
	
	result := &UploadResult{
		BucketName: bucketName,
		ObjectName: objectName,
		Size:       info.Size,
		ETag:       info.ETag,
		URL:        url,
		UploadedAt: time.Now().Format(time.RFC3339),
	}
	
	return result, nil
}

// DownloadFile télécharge un fichier depuis MinIO
func (s *MinIOService) DownloadFile(ctx context.Context, bucketName, objectName string) (io.ReadCloser, error) {
	object, err := s.client.GetObject(ctx, bucketName, objectName, minio.GetObjectOptions{})
	if err != nil {
		return nil, fmt.Errorf("failed to download file: %w", err)
	}
	
	return object, nil
}

// DeleteFile supprime un fichier de MinIO
func (s *MinIOService) DeleteFile(ctx context.Context, bucketName, objectName string) error {
	opts := minio.RemoveObjectOptions{}
	err := s.client.RemoveObject(ctx, bucketName, objectName, opts)
	if err != nil {
		return fmt.Errorf("failed to delete file: %w", err)
	}
	
	return nil
}

// GetFileURL retourne l'URL pré-signée d'un fichier
func (s *MinIOService) GetFileURL(ctx context.Context, bucketName, objectName string, expiry int) (string, error) {
	// Générer une URL pré-signée avec expiration
	reqParams := make(map[string][]string)
	url, err := s.client.PresignedGetObject(ctx, bucketName, objectName, time.Duration(expiry)*time.Second, reqParams)
	if err != nil {
		return "", fmt.Errorf("failed to generate presigned URL: %w", err)
	}
	
	return url.String(), nil
}

// ListFiles liste les fichiers d'un bucket
func (s *MinIOService) ListFiles(ctx context.Context, bucketName, prefix string) ([]FileInfo, error) {
	opts := minio.ListObjectsOptions{
		Prefix:    prefix,
		Recursive: true,
	}
	
	var files []FileInfo
	objectCh := s.client.ListObjects(ctx, bucketName, opts)
	
	for object := range objectCh {
		if object.Err != nil {
			return nil, fmt.Errorf("failed to list objects: %w", object.Err)
		}
		
		file := FileInfo{
			Name:         object.Key,
			Size:         object.Size,
			LastModified: object.LastModified.Format(time.RFC3339),
			ContentType:  object.ContentType,
			ETag:         object.ETag,
		}
		files = append(files, file)
	}
	
	return files, nil
}

// CreateBucket crée un bucket
func (s *MinIOService) CreateBucket(ctx context.Context, bucketName string) error {
	opts := minio.MakeBucketOptions{}
	err := s.client.MakeBucket(ctx, bucketName, opts)
	if err != nil {
		return fmt.Errorf("failed to create bucket: %w", err)
	}
	
	return nil
}

// BucketExists vérifie si un bucket existe
func (s *MinIOService) BucketExists(ctx context.Context, bucketName string) (bool, error) {
	exists, err := s.client.BucketExists(ctx, bucketName)
	if err != nil {
		return false, fmt.Errorf("failed to check bucket existence: %w", err)
	}
	
	return exists, nil
}

// generatePublicURL génère l'URL publique d'un objet
func (s *MinIOService) generatePublicURL(bucketName, objectName string) string {
	protocol := "http"
	if s.useSSL {
		protocol = "https"
	}
	
	return fmt.Sprintf("%s://%s/%s/%s", protocol, s.endpoint, bucketName, objectName)
}