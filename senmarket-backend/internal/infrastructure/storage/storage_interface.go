// internal/infrastructure/storage/storage_interface.go
package storage

import (
	"context"
	"io"
)

// StorageProvider interface pour les fournisseurs de stockage
type StorageProvider interface {
	// UploadFile upload un fichier
	UploadFile(ctx context.Context, bucketName, objectName string, reader io.Reader, objectSize int64, contentType string) (*UploadResult, error)
	
	// DownloadFile télécharge un fichier
	DownloadFile(ctx context.Context, bucketName, objectName string) (io.ReadCloser, error)
	
	// DeleteFile supprime un fichier
	DeleteFile(ctx context.Context, bucketName, objectName string) error
	
	// GetFileURL retourne l'URL d'un fichier
	GetFileURL(ctx context.Context, bucketName, objectName string, expiry int) (string, error)
	
	// ListFiles liste les fichiers d'un bucket
	ListFiles(ctx context.Context, bucketName, prefix string) ([]FileInfo, error)
	
	// CreateBucket crée un bucket
	CreateBucket(ctx context.Context, bucketName string) error
	
	// BucketExists vérifie si un bucket existe
	BucketExists(ctx context.Context, bucketName string) (bool, error)
}

// UploadResult résultat d'upload
type UploadResult struct {
	BucketName string `json:"bucket_name"`
	ObjectName string `json:"object_name"`
	Size       int64  `json:"size"`
	ETag       string `json:"etag"`
	URL        string `json:"url"`
	UploadedAt string `json:"uploaded_at"`
}

// FileInfo informations d'un fichier
type FileInfo struct {
	Name         string `json:"name"`
	Size         int64  `json:"size"`
	LastModified string `json:"last_modified"`
	ContentType  string `json:"content_type"`
	ETag         string `json:"etag"`
}
