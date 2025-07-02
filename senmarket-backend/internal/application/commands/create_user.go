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
