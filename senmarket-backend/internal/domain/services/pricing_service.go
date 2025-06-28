// internal/domain/services/pricing_service.go
package services

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
	"time"
)

// PricingService service métier pour la tarification
type PricingService interface {
	// CalculateListingPrice calcule le prix d'une annonce
	CalculateListingPrice(ctx context.Context, user *entities.User, listingType ListingType) (*valueobjects.Money, error)
	
	// CalculatePromotionPrice calcule le prix d'une promotion
	CalculatePromotionPrice(ctx context.Context, promotionType PromotionType, duration int) (*valueobjects.Money, error)
	
	// GetPricingPlan retourne le plan tarifaire pour un utilisateur
	GetPricingPlan(ctx context.Context, user *entities.User) (*PricingPlan, error)
	
	// IsInLaunchPhase vérifie si on est en phase de lancement
	IsInLaunchPhase(ctx context.Context) (bool, error)
	
	// GetLaunchPhaseEndDate retourne la date de fin de la phase de lancement
	GetLaunchPhaseEndDate(ctx context.Context) (time.Time, error)
	
	// ApplyDiscount applique une remise sur un prix
	ApplyDiscount(price *valueobjects.Money, discountPercent float64) (*valueobjects.Money, error)
	
	// CalculatePlatformFee calcule les frais de plateforme
	CalculatePlatformFee(transactionAmount *valueobjects.Money) (*valueobjects.Money, error)
}

// ListingType type d'annonce
type ListingType string

const (
	ListingTypeStandard ListingType = "standard"
	ListingTypePremium  ListingType = "premium"
	ListingTypeVIP      ListingType = "vip"
)

// PromotionType type de promotion
type PromotionType string

const (
	PromotionTypeHighlight PromotionType = "highlight"
	PromotionTypeFeatured  PromotionType = "featured"
	PromotionTypeTop       PromotionType = "top"
)

// PricingPlan plan tarifaire
type PricingPlan struct {
	UserID               string                  `json:"user_id"`
	PlanType             string                  `json:"plan_type"`
	StandardListingPrice *valueobjects.Money     `json:"standard_listing_price"`
	PremiumListingPrice  *valueobjects.Money     `json:"premium_listing_price"`
	FreeListingsIncluded int                     `json:"free_listings_included"`
	DiscountPercent      float64                 `json:"discount_percent"`
	ValidUntil           time.Time               `json:"valid_until"`
}