#!/bin/bash
# FIX PHASE 3 - COMPATIBILITÉ AVEC DOMAIN LAYER EXISTANT

echo "🔧 FIX PHASE 3 - COMPATIBILITÉ"
echo "==============================="

# 1. Corriger CreateListingCommand
cat > internal/application/commands/create_listing.go << 'EOF'
// internal/application/commands/create_listing.go  
package commands

import (
	"github.com/google/uuid"
	"senmarket/internal/domain/valueobjects"
)

// CreateListingCommand - Command pour créer une annonce
type CreateListingCommand struct {
	UserID      uuid.UUID `json:"user_id" validate:"required"`
	CategoryID  uuid.UUID `json:"category_id" validate:"required"`
	Title       string    `json:"title" validate:"required,min=5,max=200"`
	Description string    `json:"description" validate:"required,min=20"`
	Price       float64   `json:"price" validate:"required,gt=0"`
	Currency    string    `json:"currency" validate:"required"`
	Region      string    `json:"region" validate:"required"`
	Images      []string  `json:"images,omitempty"`
}

// Validate - Validation métier
func (cmd *CreateListingCommand) Validate() error {
	// Valider le prix avec value object (mais sans assignation multiple)
	_, err := valueobjects.NewMoney(cmd.Price, cmd.Currency)
	if err != nil {
		return err
	}
	
	// Valider la région
	_, err = valueobjects.NewRegion(cmd.Region)
	if err != nil {
		return err
	}
	
	return nil
}
EOF

# 2. Corriger CreateUserCommand  
cat > internal/application/commands/create_user.go << 'EOF'
// internal/application/commands/create_user.go
package commands

import (
	"senmarket/internal/domain/valueobjects"
)

// CreateUserCommand - Command pour créer un utilisateur
type CreateUserCommand struct {
	Phone        string `json:"phone" validate:"required"`
	Email        string `json:"email,omitempty"`
	FirstName    string `json:"first_name" validate:"required"`
	LastName     string `json:"last_name" validate:"required"`
	PasswordHash string `json:"password_hash" validate:"required"`
	Region       string `json:"region" validate:"required"`
}

// Validate - Validation métier
func (cmd *CreateUserCommand) Validate() error {
	// Valider le téléphone sénégalais
	_, err := valueobjects.NewPhone(cmd.Phone)
	if err != nil {
		return err
	}
	
	// Valider la région
	_, err = valueobjects.NewRegion(cmd.Region)
	if err != nil {
		return err
	}
	
	return nil
}
EOF

# 3. Corriger UserDTO - Compatible avec entité User actuelle
cat > internal/application/dto/user.go << 'EOF'
// internal/application/dto/user.go
package dto

import (
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// UserDTO - DTO pour les réponses utilisateur
type UserDTO struct {
	ID              uuid.UUID `json:"id"`
	Phone           string    `json:"phone"`
	Email           string    `json:"email,omitempty"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Region          string    `json:"region"`
	IsVerified      bool      `json:"is_verified"`
	OnboardingPhase string    `json:"onboarding_phase"`
	CreatedAt       time.Time `json:"created_at"`
}

// UserDTOFromEntity - Convertit une entité User en DTO
func UserDTOFromEntity(user *entities.User) *UserDTO {
	dto := &UserDTO{
		ID:              user.ID,
		Phone:           user.Phone,        // string direct
		FirstName:       user.FirstName,
		LastName:        user.LastName,
		Region:          user.Region,       // string direct
		IsVerified:      user.IsVerified,
		OnboardingPhase: user.OnboardingPhase.String(), // value object
		CreatedAt:       user.CreatedAt,
	}
	
	if user.Email != nil {
		dto.Email = *user.Email
	}
	
	return dto
}
EOF

# 4. Corriger ListingDTO - Compatible avec entité Listing actuelle
cat > internal/application/dto/listing.go << 'EOF'
// internal/application/dto/listing.go
package dto

import (
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// ListingDTO - DTO pour les réponses annonce
type ListingDTO struct {
	ID          uuid.UUID   `json:"id"`
	UserID      uuid.UUID   `json:"user_id"`
	CategoryID  uuid.UUID   `json:"category_id"`
	Title       string      `json:"title"`
	Description string      `json:"description"`
	Price       float64     `json:"price"`
	Currency    string      `json:"currency"`
	Region      string      `json:"region"`
	Status      string      `json:"status"`
	ViewsCount  int         `json:"views_count"`
	IsFeatured  bool        `json:"is_featured"`
	Images      []string    `json:"images"`
	ExpiresAt   *time.Time  `json:"expires_at"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

// ListingDTOFromEntity - Convertit une entité Listing en DTO
func ListingDTOFromEntity(listing *entities.Listing) *ListingDTO {
	// Gérer ExpiresAt (time.Time vers *time.Time)
	var expiresAt *time.Time
	if !listing.ExpiresAt.IsZero() {
		expiresAt = &listing.ExpiresAt
	}
	
	return &ListingDTO{
		ID:          listing.ID,
		UserID:      listing.UserID,
		CategoryID:  listing.CategoryID,
		Title:       listing.Title,
		Description: listing.Description,
		Price:       listing.Price,    // float64 direct
		Currency:    listing.Currency, // string direct
		Region:      listing.Region,   // string direct
		Status:      listing.Status,   // string direct
		ViewsCount:  listing.ViewsCount,
		IsFeatured:  listing.IsFeatured,
		Images:      listing.Images,
		ExpiresAt:   expiresAt,        // Conversion time.Time -> *time.Time
		CreatedAt:   listing.CreatedAt,
		UpdatedAt:   listing.UpdatedAt,
	}
}
EOF

# 5. Test compilation corrigée
echo ""
echo "🧪 TEST COMPILATION CORRIGÉE..."

if go build ./internal/application/...; then
    echo "✅ PHASE 3 - COMPILATION RÉUSSIE !"
    echo ""
    echo "🎉 CORRECTIONS APPLIQUÉES :"
    echo "✅ Commands corrigées (compatible value objects)"
    echo "✅ DTOs corrigées (compatible entités primitives)"
    echo "✅ Gestion ExpiresAt (time.Time -> *time.Time)"
    echo "✅ Phone/Region/Price gérés correctement"
    echo ""
    echo "🚀 PHASE 3 APPLICATION LAYER - TERMINÉE !"
    echo ""
    echo "📋 PROCHAINE ÉTAPE : Phase 3B - Command/Query Handlers"
else
    echo "❌ ERREURS RESTANTES :"
    go build ./internal/application/... 2>&1
fi
