// internal/application/services/base.go
package services

import (
	"context"
	"fmt"
)

// BaseService - Service de base avec fonctionnalités communes
type BaseService struct{}

// ValidateCommand - Validation générique des commandes
func (s *BaseService) ValidateCommand(ctx context.Context, cmd interface{}) error {
	// Vérifier si la commande a une méthode Validate()
	if validator, ok := cmd.(interface{ Validate() error }); ok {
		return validator.Validate()
	}
	return nil
}

// LogInfo - Log d'information
func (s *BaseService) LogInfo(ctx context.Context, operation, message string) {
	fmt.Printf("INFO [%s]: %s\n", operation, message)
}

// LogError - Log d'erreur  
func (s *BaseService) LogError(ctx context.Context, operation string, err error) {
	fmt.Printf("ERROR [%s]: %v\n", operation, err)
}
