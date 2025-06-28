// internal/domain/services/analytics_service.go
package services

import (
	"context"
	"time"
)

// AnalyticsService service d'analytics métier
type AnalyticsService interface {
	// TrackListingView enregistre une vue d'annonce
	TrackListingView(ctx context.Context, listingID, userID string, source string) error
	
	// TrackListingContact enregistre un contact sur annonce
	TrackListingContact(ctx context.Context, listingID, userID string, contactType string) error
	
	// TrackUserAction enregistre une action utilisateur
	TrackUserAction(ctx context.Context, userID, action string, metadata map[string]interface{}) error
	
	// GetListingStats retourne les stats d'une annonce
	GetListingStats(ctx context.Context, listingID string) (*ListingAnalytics, error)
	
	// GetUserStats retourne les stats d'un utilisateur
	GetUserStats(ctx context.Context, userID string) (*UserAnalytics, error)
	
	// GetCategoryTrends retourne les tendances par catégorie
	GetCategoryTrends(ctx context.Context, period int) ([]CategoryTrendData, error)
	
	// GetRegionalStats retourne les stats par région
	GetRegionalStats(ctx context.Context, period int) ([]RegionalStatsData, error)
	
	// GetPlatformStats retourne les stats globales de la plateforme
	GetPlatformStats(ctx context.Context, fromDate, toDate time.Time) (*PlatformAnalytics, error)
}

// ListingAnalytics analytics d'une annonce
type ListingAnalytics struct {
	ListingID       string    `json:"listing_id"`
	ViewsCount      int64     `json:"views_count"`
	ContactsCount   int64     `json:"contacts_count"`
	UniqueViews     int64     `json:"unique_views"`
	ConversionRate  float64   `json:"conversion_rate"`
	TopSources      []string  `json:"top_sources"`
	ViewsByDay      map[string]int64 `json:"views_by_day"`
	ContactsByDay   map[string]int64 `json:"contacts_by_day"`
	LastViewedAt    *time.Time `json:"last_viewed_at"`
	LastContactedAt *time.Time `json:"last_contacted_at"`
	AverageTimeOnPage int64   `json:"average_time_on_page"` // en secondes
}

// UserAnalytics analytics d'un utilisateur
type UserAnalytics struct {
	UserID              string    `json:"user_id"`
	TotalListings       int       `json:"total_listings"`
	ActiveListings      int       `json:"active_listings"`
	TotalViews          int64     `json:"total_views"`
	TotalContacts       int64     `json:"total_contacts"`
	AverageViewsPerListing int64  `json:"average_views_per_listing"`
	SuccessfulListings  int       `json:"successful_listings"`
	SuccessRate         float64   `json:"success_rate"`
	LastActivity        time.Time `json:"last_activity"`
	FavoriteCategories  []string  `json:"favorite_categories"`
	PreferredRegions    []string  `json:"preferred_regions"`
	ActivityScore       float64   `json:"activity_score"` // Score d'activité (0-100)
}

// CategoryTrendData données de tendance par catégorie
type CategoryTrendData struct {
	CategoryID      string    `json:"category_id"`
	CategoryName    string    `json:"category_name"`
	ListingsCount   int64     `json:"listings_count"`
	ViewsCount      int64     `json:"views_count"`
	ContactsCount   int64     `json:"contacts_count"`
	GrowthRate      float64   `json:"growth_rate"`
	PopularityScore float64   `json:"popularity_score"`
	AveragePrice    float64   `json:"average_price"`
	PriceRange      PriceRange `json:"price_range"`
	TopKeywords     []string  `json:"top_keywords"`
}

// RegionalStatsData données statistiques par région
type RegionalStatsData struct {
	RegionCode      string    `json:"region_code"`
	RegionName      string    `json:"region_name"`
	UsersCount      int64     `json:"users_count"`
	ListingsCount   int64     `json:"listings_count"`
	ViewsCount      int64     `json:"views_count"`
	ContactsCount   int64     `json:"contacts_count"`
	AveragePrice    float64   `json:"average_price"`
	TopCategories   []string  `json:"top_categories"`
	ActivityLevel   string    `json:"activity_level"` // low, medium, high
	GrowthRate      float64   `json:"growth_rate"`
	MarketShare     float64   `json:"market_share"` // Pourcentage du marché total
}

// PlatformAnalytics analytics globales de la plateforme
type PlatformAnalytics struct {
	Period              string    `json:"period"`
	TotalUsers          int64     `json:"total_users"`
	ActiveUsers         int64     `json:"active_users"`
	NewUsers            int64     `json:"new_users"`
	TotalListings       int64     `json:"total_listings"`
	ActiveListings      int64     `json:"active_listings"`
	NewListings         int64     `json:"new_listings"`
	TotalViews          int64     `json:"total_views"`
	TotalContacts       int64     `json:"total_contacts"`
	TotalRevenue        float64   `json:"total_revenue"`
	AverageSessionTime  int64     `json:"average_session_time"` // en secondes
	BounceRate          float64   `json:"bounce_rate"`
	ConversionRate      float64   `json:"conversion_rate"`
	TopCategories       []CategoryTrendData `json:"top_categories"`
	TopRegions          []RegionalStatsData `json:"top_regions"`
	GrowthMetrics       GrowthMetrics       `json:"growth_metrics"`
	UserRetention       UserRetention       `json:"user_retention"`
}

// PriceRange gamme de prix
type PriceRange struct {
	Min     float64 `json:"min"`
	Max     float64 `json:"max"`
	Median  float64 `json:"median"`
	Average float64 `json:"average"`
}

// GrowthMetrics métriques de croissance
type GrowthMetrics struct {
	UserGrowthRate     float64 `json:"user_growth_rate"`
	ListingGrowthRate  float64 `json:"listing_growth_rate"`
	RevenueGrowthRate  float64 `json:"revenue_growth_rate"`
	ViewsGrowthRate    float64 `json:"views_growth_rate"`
	ContactsGrowthRate float64 `json:"contacts_growth_rate"`
	MonthOverMonth     float64 `json:"month_over_month"`
	YearOverYear       float64 `json:"year_over_year"`
}

// UserRetention métriques de rétention utilisateur
type UserRetention struct {
	Day1Retention   float64 `json:"day1_retention"`
	Day7Retention   float64 `json:"day7_retention"`
	Day30Retention  float64 `json:"day30_retention"`
	Day90Retention  float64 `json:"day90_retention"`
	AverageLifetime int64   `json:"average_lifetime"` // en jours
	ChurnRate       float64 `json:"churn_rate"`
}
