// internal/domain/services/listing_validation_service.go
package services

import (
	"context"
	"senmarket/internal/domain/entities"
)

// ListingValidationService service de validation des annonces
type ListingValidationService interface {
	// ValidateListingContent valide le contenu d'une annonce
	ValidateListingContent(ctx context.Context, listing *entities.Listing) (*ValidationResult, error)
	
	// ValidateImages valide les images d'une annonce
	ValidateImages(ctx context.Context, imageURLs []string) (*ValidationResult, error)
	
	// CheckForSpam vérifie si une annonce est du spam
	CheckForSpam(ctx context.Context, listing *entities.Listing, user *entities.User) (*ValidationResult, error)
	
	// CheckForDuplicates vérifie les doublons
	CheckForDuplicates(ctx context.Context, listing *entities.Listing) (*ValidationResult, error)
	
	// ValidatePrice valide le prix selon la catégorie
	ValidatePrice(ctx context.Context, listing *entities.Listing) (*ValidationResult, error)
	
	// ValidateLocation valide la localisation
	ValidateLocation(ctx context.Context, region, location string) (*ValidationResult, error)
	
	// CheckContentModeration modération automatique du contenu
	CheckContentModeration(ctx context.Context, title, description string) (*ValidationResult, error)
}

// ValidationResult résultat de validation
type ValidationResult struct {
	IsValid          bool     `json:"is_valid"`
	Errors           []string `json:"errors"`
	Warnings         []string `json:"warnings"`
	Score            float64  `json:"score"` // Score de qualité (0-100)
	SuggestedChanges []string `json:"suggested_changes"`
	RiskLevel        string   `json:"risk_level"` // low, medium, high
	RequiresReview   bool     `json:"requires_review"`
	AutoApproved     bool     `json:"auto_approved"`
}

// ValidationRule règle de validation
type ValidationRule struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	IsActive    bool    `json:"is_active"`
	Priority    int     `json:"priority"`
	CategoryID  *string `json:"category_id,omitempty"` // Règle spécifique à une catégorie
	RuleType    string  `json:"rule_type"` // content, price, image, spam, duplicate
	Parameters  map[string]interface{} `json:"parameters"`
}

// ContentModerationResult résultat de modération
type ContentModerationResult struct {
	IsApproved       bool     `json:"is_approved"`
	ConfidenceScore  float64  `json:"confidence_score"`
	DetectedIssues   []string `json:"detected_issues"`
	SuggestedActions []string `json:"suggested_actions"`
	Categories       []string `json:"categories"` // profanity, spam, inappropriate, etc.
	Severity         string   `json:"severity"`   // low, medium, high, critical
}
