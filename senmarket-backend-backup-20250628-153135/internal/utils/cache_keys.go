// ============================================
// 4. NOUVEAU: internal/utils/cache_keys.go
// ============================================
package utils

import (
	"fmt"
	"strings"
)

// Générateur de clés de cache standardisées
type CacheKeyBuilder struct {
	prefix string
}

func NewCacheKeyBuilder(prefix string) *CacheKeyBuilder {
	return &CacheKeyBuilder{prefix: prefix}
}

// BuildListingKey génère une clé pour un listing
func (b *CacheKeyBuilder) BuildListingKey(listingID string) string {
	return fmt.Sprintf("%s:listing:%s", b.prefix, listingID)
}

// BuildListingsPageKey génère une clé pour une page de listings
func (b *CacheKeyBuilder) BuildListingsPageKey(page, limit int, filters map[string]string) string {
	key := fmt.Sprintf("%s:listings:page:%d:%d", b.prefix, page, limit)
	
	// Ajouter les filtres de manière déterministe
	if categoryID := filters["category_id"]; categoryID != "" {
		key += ":cat:" + categoryID
	}
	if region := filters["region"]; region != "" {
		key += ":reg:" + region
	}
	if sortBy := filters["sort_by"]; sortBy != "" {
		key += ":sort:" + sortBy
	}
	
	return key
}

// BuildSearchKey génère une clé pour une recherche
func (b *CacheKeyBuilder) BuildSearchKey(query string, filters map[string]string) string {
	// Normaliser la requête
	normalizedQuery := strings.ToLower(strings.TrimSpace(query))
	key := fmt.Sprintf("%s:search:%s", b.prefix, normalizedQuery)
	
	// Ajouter les filtres
	if categoryID := filters["category_id"]; categoryID != "" {
		key += ":cat:" + categoryID
	}
	
	return key
}

// BuildUserKey génère une clé pour un utilisateur
func (b *CacheKeyBuilder) BuildUserKey(userID string) string {
	return fmt.Sprintf("%s:user:%s", b.prefix, userID)
}

// BuildStatsKey génère une clé pour les statistiques
func (b *CacheKeyBuilder) BuildStatsKey(statsType string, identifier string) string {
	if identifier != "" {
		return fmt.Sprintf("%s:stats:%s:%s", b.prefix, statsType, identifier)
	}
	return fmt.Sprintf("%s:stats:%s", b.prefix, statsType)
}

// BuildRateLimitKey génère une clé pour le rate limiting
func (b *CacheKeyBuilder) BuildRateLimitKey(identifier string) string {
	return fmt.Sprintf("%s:rate:%s", b.prefix, identifier)
}

// BuildSessionKey génère une clé pour une session
func (b *CacheKeyBuilder) BuildSessionKey(sessionID string) string {
	return fmt.Sprintf("%s:session:%s", b.prefix, sessionID)
}
