// internal/infrastructure/persistence/postgres/base_repository.go
package postgres

import (
	"gorm.io/gorm"
)

// BaseRepository repository de base avec GORM
type BaseRepository struct {
	db *gorm.DB
}

// NewBaseRepository crée un nouveau repository de base
func NewBaseRepository(db *gorm.DB) *BaseRepository {
	return &BaseRepository{
		db: db,
	}
}

// GetDB retourne l'instance de base de données
func (r *BaseRepository) GetDB() *gorm.DB {
	return r.db
}
