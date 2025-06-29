// internal/application/commands/create_listing.go - CORRIGÉ AVEC LA VRAIE STRUCTURE
package commands

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/events"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/domain/services"
	"time"
)

// CreateListingCommand commande pour créer une annonce
type CreateListingCommand struct {
	UserID      string   `json:"user_id" validate:"required"`
	CategoryID  string   `json:"category_id" validate:"required"`
	Title       string   `json:"title" validate:"required,max=100"`
	Description string   `json:"description" validate:"required,max=1000"`
	Price       float64  `json:"price" validate:"min=0"`
	Currency    string   `json:"currency"`
	Region      string   `json:"region" validate:"required"`
	Location    string   `json:"location"`
	Images      []string `json:"images"`
	IsPaid      bool     `json:"is_paid"`
}

// CreateListingHandler handler pour créer une annonce
type CreateListingHandler struct {
	userRepo           repositories.UserRepository
	listingRepo        repositories.ListingRepository
	quotaService       services.QuotaService
	validationService  services.ListingValidationService
	eventPublisher     events.EventPublisher
}

// NewCreateListingHandler crée un nouveau handler
func NewCreateListingHandler(
	userRepo repositories.UserRepository,
	listingRepo repositories.ListingRepository,
	quotaService services.QuotaService,
	validationService services.ListingValidationService,
	eventPublisher events.EventPublisher,
) *CreateListingHandler {
	return &CreateListingHandler{
		userRepo:          userRepo,
		listingRepo:       listingRepo,
		quotaService:      quotaService,
		validationService: validationService,
		eventPublisher:    eventPublisher,
	}
}

// Handle traite la commande de création d'annonce
func (h *CreateListingHandler) Handle(ctx context.Context, cmd *CreateListingCommand) (*CreateListingResult, error) {
	// Récupérer l'utilisateur
	user, err := h.userRepo.GetByID(ctx, cmd.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// 🔧 CORRIGÉ: Vérifier les quotas SEULEMENT si quotaService n'est pas nil
	if h.quotaService != nil {
		canCreate, reason, err := h.quotaService.CheckCanCreateListing(ctx, user)
		if err != nil {
			return nil, err
		}
		if !canCreate {
			return nil, entities.NewDomainError(reason)
		}
	}
	
	// Créer l'annonce
	listing, err := entities.NewListing(
		cmd.UserID,
		cmd.CategoryID,
		cmd.Title,
		cmd.Description,
		cmd.Price,
		cmd.Currency,
		cmd.Region,
		cmd.Location,
	)
	if err != nil {
		return nil, err
	}
	
	// Ajouter les images
	for _, imageURL := range cmd.Images {
		if err := listing.AddImage(imageURL); err != nil {
			return nil, err
		}
	}
	
	// 🔧 CORRIGÉ: Valider le contenu SEULEMENT si validationService n'est pas nil
	if h.validationService != nil {
		validationResult, err := h.validationService.ValidateListingContent(ctx, listing)
		if err != nil {
			return nil, err
		}
		if !validationResult.IsValid {
			return nil, entities.NewDomainError("Contenu de l'annonce invalide")
		}
	}
	
	// Marquer comme payante si nécessaire
	if cmd.IsPaid {
		listing.IsPaid = true
	}
	
	// Sauvegarder l'annonce
	if err := h.listingRepo.Create(ctx, listing); err != nil {
		return nil, err
	}
	
	// 🔧 CORRIGÉ: Traiter la création SEULEMENT si quotaService n'est pas nil
	if h.quotaService != nil {
		if err := h.quotaService.ProcessListingCreation(ctx, user, cmd.IsPaid); err != nil {
			return nil, err
		}
	}
	
	// 🔧 CORRIGÉ: Publier l'événement SEULEMENT si eventPublisher n'est pas nil
	if h.eventPublisher != nil {
		event := events.NewListingCreatedEvent(
			listing.ID,
			listing.UserID,
			listing.CategoryID,
			listing.Title,
			listing.GetRegionName(), // 🔧 CORRIGÉ: Utilise GetRegionName() au lieu de Region.Code()
			listing.Price.Amount,    // 🔧 CORRIGÉ: Price.Amount sans parenthèses
			listing.Price.Currency,  // 🔧 CORRIGÉ: Price.Currency sans parenthèses
			cmd.IsPaid,
		)
		if err := h.eventPublisher.Publish(ctx, event); err != nil {
			// Log l'erreur mais ne pas faire échouer la commande
			// TODO: Implement proper logging
		}
	}
	
	// Retourner le résultat
	return &CreateListingResult{
		ListingID:   listing.ID,
		UserID:      listing.UserID,
		CategoryID:  listing.CategoryID,
		Title:       listing.Title,
		Description: listing.Description,
		Price:       listing.Price.Amount,    // 🔧 CORRIGÉ: Price.Amount sans parenthèses
		Currency:    listing.Price.Currency,  // 🔧 CORRIGÉ: Price.Currency sans parenthèses
		Region:      listing.GetRegionName(), // 🔧 CORRIGÉ: GetRegionName() au lieu de Region.Code()
		Location:    listing.Location,
		Status:      string(listing.Status),
		CreatedAt:   listing.CreatedAt,
		ExpiresAt:   listing.ExpiresAt,
		IsPaid:      listing.IsPaid,
	}, nil
}

// CreateListingResult résultat de création d'annonce
type CreateListingResult struct {
	ListingID   string    `json:"listing_id"`
	UserID      string    `json:"user_id"`
	CategoryID  string    `json:"category_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Currency    string    `json:"currency"`
	Region      string    `json:"region"`
	Location    string    `json:"location"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	ExpiresAt   time.Time `json:"expires_at"`
	IsPaid      bool      `json:"is_paid"`
}