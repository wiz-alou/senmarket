// internal/application/dto/dashboard_dto.go
package dto

import (
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/services"
)

// DashboardDTO DTO pour le tableau de bord utilisateur
type DashboardDTO struct {
	User           *UserDTO               `json:"user"`
	Stats          *UserStatsDTO          `json:"stats"`
	Quota          *QuotaStatusDTO        `json:"quota"`
	RecentListings []*ListingSummaryDTO   `json:"recent_listings"`
	RecentPayments []*PaymentSummaryDTO   `json:"recent_payments"`
}

// NewDashboardDTO crée un nouveau DashboardDTO
func NewDashboardDTO(
	user *entities.User,
	userStats *services.UserAnalytics,
	quotaStatus *services.QuotaStatus,
	recentListings []*entities.Listing,
	recentPayments []*entities.Payment,
) *DashboardDTO {
	// Convertir les stats d'analytics en UserListingStats
	listingStats := &entities.UserListingStats{
		TotalListings:   userStats.TotalListings,
		ActiveListings:  userStats.ActiveListings,
		TotalViews:      userStats.TotalViews,
		TotalContacts:   userStats.TotalContacts,
		SuccessRate:     userStats.SuccessRate,
	}
	
	// Convertir les listes
	listingDTOs := make([]*ListingSummaryDTO, len(recentListings))
	for i, listing := range recentListings {
		listingDTOs[i] = NewListingSummaryDTO(listing)
	}
	
	paymentDTOs := make([]*PaymentSummaryDTO, len(recentPayments))
	for i, payment := range recentPayments {
		paymentDTOs[i] = NewPaymentSummaryDTO(payment)
	}
	
	return &DashboardDTO{
		User:           NewUserDTO(user),
		Stats:          NewUserStatsDTO(user, listingStats),
		Quota:          NewQuotaStatusDTO(quotaStatus),
		RecentListings: listingDTOs,
		RecentPayments: paymentDTOs,
	}
}

// AdminDashboardDTO DTO pour le tableau de bord administrateur
type AdminDashboardDTO struct {
	PlatformStats    *PlatformStatsDTO    `json:"platform_stats"`
	RecentUsers      []*UserDTO           `json:"recent_users"`
	RecentListings   []*ListingDTO        `json:"recent_listings"`
	RecentPayments   []*PaymentDTO        `json:"recent_payments"`
	CategoryTrends   []*CategoryTrendDTO  `json:"category_trends"`
	RegionalStats    []*RegionalStatsDTO  `json:"regional_stats"`
}

// PlatformStatsDTO DTO pour les statistiques de la plateforme
type PlatformStatsDTO struct {
	TotalUsers          int64   `json:"total_users"`
	ActiveUsers         int64   `json:"active_users"`
	NewUsers            int64   `json:"new_users"`
	TotalListings       int64   `json:"total_listings"`
	ActiveListings      int64   `json:"active_listings"`
	NewListings         int64   `json:"new_listings"`
	TotalViews          int64   `json:"total_views"`
	TotalContacts       int64   `json:"total_contacts"`
	TotalRevenue        float64 `json:"total_revenue"`
	AverageSessionTime  int64   `json:"average_session_time"`
	ConversionRate      float64 `json:"conversion_rate"`
	UserGrowthRate      float64 `json:"user_growth_rate"`
	ListingGrowthRate   float64 `json:"listing_growth_rate"`
	RevenueGrowthRate   float64 `json:"revenue_growth_rate"`
}

// CategoryTrendDTO DTO pour les tendances de catégorie
type CategoryTrendDTO struct {
	CategoryID      string  `json:"category_id"`
	CategoryName    string  `json:"category_name"`
	ListingsCount   int64   `json:"listings_count"`
	ViewsCount      int64   `json:"views_count"`
	ContactsCount   int64   `json:"contacts_count"`
	GrowthRate      float64 `json:"growth_rate"`
	PopularityScore float64 `json:"popularity_score"`
	AveragePrice    float64 `json:"average_price"`
}

// RegionalStatsDTO DTO pour les statistiques régionales
type RegionalStatsDTO struct {
	RegionCode     string  `json:"region_code"`
	RegionName     string  `json:"region_name"`
	UsersCount     int64   `json:"users_count"`
	ListingsCount  int64   `json:"listings_count"`
	ViewsCount     int64   `json:"views_count"`
	ContactsCount  int64   `json:"contacts_count"`
	AveragePrice   float64 `json:"average_price"`
	ActivityLevel  string  `json:"activity_level"`
	GrowthRate     float64 `json:"growth_rate"`
	MarketShare    float64 `json:"market_share"`
}