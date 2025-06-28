// internal/infrastructure/config/minio.go
package config

// MinIOConfig configuration MinIO
type MinIOConfig struct {
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	UseSSL          bool
	BucketName      string
	Region          string
}

// LoadMinIOConfig charge la configuration MinIO
func LoadMinIOConfig() *MinIOConfig {
	return &MinIOConfig{
		Endpoint:        getEnv("MINIO_ENDPOINT", "localhost:9000"),
		AccessKeyID:     getEnv("MINIO_ACCESS_KEY", "minioadmin"),
		SecretAccessKey: getEnv("MINIO_SECRET_KEY", "minioadmin"),
		UseSSL:          getEnvAsBool("MINIO_USE_SSL", false),
		BucketName:      getEnv("MINIO_BUCKET_NAME", "senmarket"),
		Region:          getEnv("MINIO_REGION", "us-east-1"),
	}
}
