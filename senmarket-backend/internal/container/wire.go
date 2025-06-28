// internal/container/wire.go
package container

import (
	"context"
	"log"
)

// WireUp connecte toutes les dépendances et retourne un container prêt
func WireUp() (*Container, error) {
	log.Println("🔌 Démarrage du wire-up des dépendances...")
	
	// 1. Initialiser les providers d'infrastructure
	db, err := DatabaseProvider()
	if err != nil {
		return nil, err
	}
	log.Println("✅ Base de données PostgreSQL connectée")
	
	redisClient, err := RedisProvider()
	if err != nil {
		return nil, err
	}
	log.Println("✅ Redis connecté")
	
	minioClient, err := MinIOProvider()
	if err != nil {
		return nil, err
	}
	log.Println("✅ MinIO connecté")
	
	// 2. Créer le container avec toutes les dépendances
	container := NewContainer(db, redisClient, minioClient)
	
	// 3. Vérifications post-initialisation
	if err := container.HealthCheck(); err != nil {
		return nil, err
	}
	
	log.Println("🎉 Wire-up terminé avec succès !")
	return container, nil
}

// HealthCheck vérifie que tous les services sont opérationnels
func (c *Container) HealthCheck() error {
	ctx := context.Background()
	
	// Test Database
	sqlDB, err := c.DB.DB()
	if err != nil {
		return err
	}
	if err := sqlDB.Ping(); err != nil {
		return err
	}
	
	// Test Redis
	if err := c.Redis.Ping(ctx).Err(); err != nil {
		return err
	}
	
	// Test MinIO
	if _, err := c.MinIOClient.ListBuckets(ctx); err != nil {
		log.Printf("⚠️ MinIO warning: %v", err)
		// Ne pas faire échouer pour MinIO (peut être indisponible en dev)
	}
	
	log.Println("✅ Health check réussi")
	return nil
}