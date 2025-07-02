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
