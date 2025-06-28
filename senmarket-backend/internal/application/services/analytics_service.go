// internal/application/services/analytics_service.go
package services

import (
	"context"
	"senmarket/internal/domain/services"
)

// AnalyticsApplicationService service d'analytics de la couche application
type AnalyticsApplicationService interface {
	// TrackListingView enregistre une vue d'annonce
	TrackListingView(ctx context.Context, listingID, userID, source string) error
	
	// TrackListingContact enregistre un contact sur annonce
	TrackListingContact(ctx context.Context, listingID, userID, contactType string) error
	
	// GetUserAnalytics récupère les analytics d'un utilisateur
	GetUserAnalytics(ctx context.Context, userID string) (*services.UserAnalytics, error)
	
	// GetListingAnalytics récupère les analytics d'une annonce
	GetListingAnalytics(ctx context.Context, listingID string) (*services.ListingAnalytics, error)
	
	// GetPlatformAnalytics récupère les analytics globales
	GetPlatformAnalytics(ctx context.Context, period string) (*services.PlatformAnalytics, error)
}

// AnalyticsApplicationServiceImpl implémentation du service d'analytics
type AnalyticsApplicationServiceImpl struct {
	analyticsService services.AnalyticsService
}

// NewAnalyticsApplicationService crée un nouveau service d'analytics
func NewAnalyticsApplicationService(analyticsService services.AnalyticsService) AnalyticsApplicationService {
	return &AnalyticsApplicationServiceImpl{
		analyticsService: analyticsService,
	}
}

// TrackListingView enregistre une vue d'annonce
func (s *AnalyticsApplicationServiceImpl) TrackListingView(ctx context.Context, listingID, userID, source string) error {
	return s.analyticsService.TrackListingView(ctx, listingID, userID, source)
}

// TrackListingContact enregistre un contact sur annonce
func (s *AnalyticsApplicationServiceImpl) TrackListingContact(ctx context.Context, listingID, userID, contactType string) error {
	return s.analyticsService.TrackListingContact(ctx, listingID, userID, contactType)
}

// GetUserAnalytics récupère les analytics d'un utilisateur
func (s *AnalyticsApplicationServiceImpl) GetUserAnalytics(ctx context.Context, userID string) (*services.UserAnalytics, error) {
	return s.analyticsService.GetUserStats(ctx, userID)
}

// GetListingAnalytics récupère les analytics d'une annonce
func (s *AnalyticsApplicationServiceImpl) GetListingAnalytics(ctx context.Context, listingID string) (*services.ListingAnalytics, error) {
	return s.analyticsService.GetListingStats(ctx, listingID)
}

// GetPlatformAnalytics récupère les analytics globales
func (s *AnalyticsApplicationServiceImpl) GetPlatformAnalytics(ctx context.Context, period string) (*services.PlatformAnalytics, error) {
	// TODO: Parser le period et appeler GetPlatformStats avec les bonnes dates
	return nil, nil
}
