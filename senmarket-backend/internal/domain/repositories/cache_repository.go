// internal/domain/repositories/cache_repository.go
package repositories

import (
	"context"
	"time"
)

// CacheRepository interface pour la gestion du cache
type CacheRepository interface {
	// Set stocke une valeur dans le cache avec expiration
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	
	// Get récupère une valeur du cache
	Get(ctx context.Context, key string) (interface{}, error)
	
	// GetString récupère une valeur string du cache
	GetString(ctx context.Context, key string) (string, error)
	
	// GetInt récupère une valeur int du cache
	GetInt(ctx context.Context, key string) (int, error)
	
	// GetFloat récupère une valeur float du cache
	GetFloat(ctx context.Context, key string) (float64, error)
	
	// GetBool récupère une valeur bool du cache
	GetBool(ctx context.Context, key string) (bool, error)
	
	// Delete supprime une clé du cache
	Delete(ctx context.Context, key string) error
	
	// Exists vérifie si une clé existe
	Exists(ctx context.Context, key string) (bool, error)
	
	// DeletePattern supprime toutes les clés correspondant au pattern
	DeletePattern(ctx context.Context, pattern string) error
	
	// Increment incrémente une valeur numérique
	Increment(ctx context.Context, key string) (int64, error)
	
	// IncrementBy incrémente une valeur numérique par un montant
	IncrementBy(ctx context.Context, key string, value int64) (int64, error)
	
	// Decrement décrémente une valeur numérique
	Decrement(ctx context.Context, key string) (int64, error)
	
	// SetExpiration définit une expiration sur une clé existante
	SetExpiration(ctx context.Context, key string, expiration time.Duration) error
	
	// GetTTL retourne le temps de vie restant d'une clé
	GetTTL(ctx context.Context, key string) (time.Duration, error)
	
	// GetKeys retourne toutes les clés correspondant au pattern
	GetKeys(ctx context.Context, pattern string) ([]string, error)
	
	// FlushAll vide tout le cache
	FlushAll(ctx context.Context) error
	
	// GetInfo retourne les informations du cache
	GetInfo(ctx context.Context) (map[string]string, error)
	
	// Ping teste la connexion au cache
	Ping(ctx context.Context) error
	
	// SetJSON stocke un objet JSON dans le cache
	SetJSON(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	
	// GetJSON récupère un objet JSON du cache
	GetJSON(ctx context.Context, key string, dest interface{}) error
	
	// SetHash stocke un hash dans le cache
	SetHash(ctx context.Context, key string, field string, value interface{}) error
	
	// GetHash récupère une valeur de hash
	GetHash(ctx context.Context, key string, field string) (string, error)
	
	// GetAllHash récupère tout un hash
	GetAllHash(ctx context.Context, key string) (map[string]string, error)
	
	// DeleteHash supprime un champ de hash
	DeleteHash(ctx context.Context, key string, field string) error
	
	// AddToList ajoute un élément à une liste
	AddToList(ctx context.Context, key string, value interface{}) error
	
	// GetList récupère une liste
	GetList(ctx context.Context, key string, start, stop int64) ([]string, error)
	
	// GetListLength retourne la taille d'une liste
	GetListLength(ctx context.Context, key string) (int64, error)
	
	// RemoveFromList supprime un élément d'une liste
	RemoveFromList(ctx context.Context, key string, count int64, value interface{}) (int64, error)
}