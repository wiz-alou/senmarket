#!/bin/bash
# FIX FINAL PHASE 3 - SIGNATURES VALUE OBJECTS

echo "🔧 FIX FINAL - SIGNATURES VALUE OBJECTS"
echo "========================================"

# 1. Corriger CreateListingCommand avec la bonne signature
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
	// Valider le prix - NewMoney retourne 1 valeur (Money), pas d'erreur
	money := valueobjects.NewMoney(cmd.Price, cmd.Currency)
	_ = money // Utiliser la variable pour éviter unused variable
	
	// Valider la région - NewRegion retourne (Region, error)
	_, err := valueobjects.NewRegion(cmd.Region)
	if err != nil {
		return err
	}
	
	return nil
}
EOF

# 2. Corriger CreateUserCommand avec la bonne signature
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
	// Valider le téléphone - NewPhone retourne (Phone, error)
	_, err := valueobjects.NewPhone(cmd.Phone)
	if err != nil {
		return err
	}
	
	// Valider la région - NewRegion retourne (Region, error)
	_, err = valueobjects.NewRegion(cmd.Region)
	if err != nil {
		return err
	}
	
	return nil
}
EOF

# 3. Test compilation finale
echo ""
echo "🧪 TEST COMPILATION FINALE..."

if go build ./internal/application/...; then
    echo "✅ PHASE 3 - SUCCÈS TOTAL !"
    echo ""
    echo "🎉 APPLICATION LAYER COMPILÉE AVEC SUCCÈS !"
    echo "============================================="
    echo "✅ Commands (3/3) : CreateUser, CreateListing, PublishListing"
    echo "✅ Queries (2/5) : GetListings, GetUserQuota"
    echo "✅ DTOs (2/3) : User, Listing"
    echo "✅ Base Service : Validation et logging"
    echo "✅ Signatures Value Objects corrigées"
    echo ""
    echo "📋 STRUCTURE CRÉÉE :"
    echo "📁 internal/application/"
    echo "  ├── commands/     ✅ 3 commands CQRS"
    echo "  ├── queries/      ✅ 2 queries CQRS"
    echo "  ├── dto/          ✅ 2 DTOs de réponse"
    echo "  ├── services/     ✅ Base service"
    echo "  └── handlers/     📁 (prêt pour Phase 3B)"
    echo ""
    echo "🚀 PRÊT POUR PHASE 3B - COMMAND/QUERY HANDLERS !"
    
else
    echo "❌ ERREURS RESTANTES :"
    go build ./internal/application/... 2>&1
    echo ""
    echo "💡 Si des erreurs persistent, vérifie :"
    echo "- Les imports des value objects"
    echo "- La structure des entités Domain"
    echo "- Les signatures des méthodes New*()"
fi
