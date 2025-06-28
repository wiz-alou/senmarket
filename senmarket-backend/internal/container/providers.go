// internal/container/providers.go
package container

import (
	"context"
	"fmt"
	"time"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
	"github.com/redis/go-redis/v9"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	
	"senmarket/internal/infrastructure/config"
)

// DatabaseProvider fournit une connexion à la base de données
func DatabaseProvider() (*gorm.DB, error) {
	dbConfig := config.LoadDatabaseConfig()
	
	db, err := gorm.Open(postgres.Open(dbConfig.GetDSN()), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}
	
	// Configuration de la pool de connexions
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get database instance: %w", err)
	}
	
	sqlDB.SetMaxOpenConns(dbConfig.MaxOpenConns)
	sqlDB.SetMaxIdleConns(dbConfig.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Duration(dbConfig.MaxLifetime) * time.Second)
	
	return db, nil
}

// RedisProvider fournit une connexion Redis
func RedisProvider() (*redis.Client, error) {
	redisConfig := config.LoadRedisConfig()
	
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisConfig.GetAddr(),
		Password: redisConfig.Password,
		DB:       redisConfig.DB,
		PoolSize: redisConfig.PoolSize,
	})
	
	// Test de la connexion
	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("failed to connect to Redis: %w", err)
	}
	
	return rdb, nil
}

// MinIOProvider fournit un client MinIO
func MinIOProvider() (*minio.Client, error) {
	minioConfig := config.LoadMinIOConfig()
	
	client, err := minio.New(minioConfig.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(minioConfig.AccessKeyID, minioConfig.SecretAccessKey, ""),
		Secure: minioConfig.UseSSL,
	})
	
	if err != nil {
		return nil, fmt.Errorf("failed to create MinIO client: %w", err)
	}
	
	return client, nil
}
