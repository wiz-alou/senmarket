// internal/domain/events/user_created.go
package events

import (
	"time"
)

const UserCreatedEventType = "user.created"

// UserCreatedEvent événement de création d'utilisateur
type UserCreatedEvent struct {
	*BaseEvent
	UserID         string    `json:"user_id"`
	Phone          string    `json:"phone"`
	Region         string    `json:"region"`
	FreeListings   int       `json:"free_listings"`
	CreatedAt      time.Time `json:"created_at"`
}

// NewUserCreatedEvent crée un nouvel événement de création d'utilisateur
func NewUserCreatedEvent(userID, phone, region string, freeListings int) *UserCreatedEvent {
	createdAt := time.Now()
	data := map[string]interface{}{
		"user_id":       userID,
		"phone":         phone,
		"region":        region,
		"free_listings": freeListings,
		"created_at":    createdAt,
	}

	return &UserCreatedEvent{
		BaseEvent:     NewBaseEvent(userID, UserCreatedEventType, data),
		UserID:        userID,
		Phone:         phone,
		Region:        region,
		FreeListings:  freeListings,
		CreatedAt:     createdAt,
	}
}
