// internal/domain/entities/utils.go
package entities

import "github.com/google/uuid"

// NewUUID génère un nouvel UUID
func NewUUID() uuid.UUID {
	return uuid.New()
}
