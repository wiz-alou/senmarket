// internal/config/minio.go
package config

import (
	"context"
	"fmt"
	"log"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

// NewMinIO initialise et configure le client MinIO
func NewMinIO(cfg MinIOConfig) (*minio.Client, error) {
	// Créer le client MinIO
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("erreur création client MinIO: %w", err)
	}

	// Vérifier la connexion
	ctx := context.Background()
	_, err = client.ListBuckets(ctx)
	if err != nil {
		return nil, fmt.Errorf("erreur connexion MinIO: %w", err)
	}

	// Créer et configurer le bucket
	err = setupBucket(ctx, client, cfg.BucketName, cfg.Region)
	if err != nil {
		return nil, fmt.Errorf("erreur configuration bucket: %w", err)
	}

	log.Printf("✅ MinIO connecté - Endpoint: %s, Bucket: %s", cfg.Endpoint, cfg.BucketName)
	return client, nil
}

// setupBucket crée le bucket s'il n'existe pas et configure les permissions
func setupBucket(ctx context.Context, client *minio.Client, bucketName, region string) error {
	// Vérifier si le bucket existe
	exists, err := client.BucketExists(ctx, bucketName)
	if err != nil {
		return fmt.Errorf("erreur vérification bucket: %w", err)
	}

	if !exists {
		// Créer le bucket
		err = client.MakeBucket(ctx, bucketName, minio.MakeBucketOptions{
			Region: region,
		})
		if err != nil {
			return fmt.Errorf("erreur création bucket: %w", err)
		}

		log.Printf("✅ Bucket MinIO créé: %s", bucketName)
	}

	// Configurer la politique publique pour l'accès en lecture aux images
	err = setBucketPolicy(ctx, client, bucketName)
	if err != nil {
		// Log warning mais ne pas faire échouer la configuration
		log.Printf("⚠️ Attention: Impossible de définir la politique publique: %v", err)
	}

	return nil
}

// setBucketPolicy configure la politique d'accès public en lecture pour les images
func setBucketPolicy(ctx context.Context, client *minio.Client, bucketName string) error {
	// Politique permettant l'accès public en lecture à tous les objets du bucket
	policy := fmt.Sprintf(`{
		"Version": "2012-10-17",
		"Statement": [
			{
				"Effect": "Allow",
				"Principal": "*",
				"Action": "s3:GetObject",
				"Resource": "arn:aws:s3:::%s/*"
			}
		]
	}`, bucketName)

	err := client.SetBucketPolicy(ctx, bucketName, policy)
	if err != nil {
		return fmt.Errorf("erreur définition politique bucket: %w", err)
	}

	log.Printf("✅ Politique publique configurée pour le bucket: %s", bucketName)
	return nil
}

// ValidateMinIOConfig valide la configuration MinIO
func ValidateMinIOConfig(cfg MinIOConfig) error {
	if cfg.Endpoint == "" {
		return fmt.Errorf("MINIO_ENDPOINT requis")
	}
	if cfg.AccessKey == "" {
		return fmt.Errorf("MINIO_ACCESS_KEY requis")
	}
	if cfg.SecretKey == "" {
		return fmt.Errorf("MINIO_SECRET_KEY requis")
	}
	if cfg.BucketName == "" {
		return fmt.Errorf("MINIO_BUCKET requis")
	}
	return nil
}

// GetMinIOHealthCheck retourne les informations de santé MinIO
func GetMinIOHealthCheck(client *minio.Client, bucketName string) map[string]interface{} {
	ctx := context.Background()
	
	health := map[string]interface{}{
		"status": "down",
		"bucket_exists": false,
		"total_buckets": 0,
	}

	// Test connexion
	buckets, err := client.ListBuckets(ctx)
	if err != nil {
		health["error"] = err.Error()
		return health
	}

	health["status"] = "up"
	health["total_buckets"] = len(buckets)

	// Vérifier si le bucket principal existe
	for _, bucket := range buckets {
		if bucket.Name == bucketName {
			health["bucket_exists"] = true
			health["bucket_created"] = bucket.CreationDate
			break
		}
	}

	return health
}