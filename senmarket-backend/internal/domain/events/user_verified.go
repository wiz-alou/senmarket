// internal/domain/events/user_verified.go
package events

import (
	"time"
)

const UserVerifiedEventType = "user.verified"

// UserVerifiedEvent événement de vérification d'utilisateur
type UserVerifiedEvent struct {
	*BaseEvent
	UserID      string    `json:"user_id"`
	Phone       string    `json:"phone"`
	Region      string    `json:"region"`
	VerifiedAt  time.Time `json:"verified_at"`
	Method      string    `json:"method"` // sms, email, etc.
}

// NewUserVerifiedEvent crée un nouvel événement de vérification
func NewUserVerifiedEvent(userID, phone, region, method string) *UserVerifiedEvent {
	verifiedAt := time.Now()
	data := map[string]interface{}{
		"user_id":     userID,
		"phone":       phone,
		"region":      region,
		"verified_at": verifiedAt,
		"method":      method,
	}

	return &UserVerifiedEvent{
		BaseEvent:  NewBaseEvent(userID, UserVerifiedEventType, data),
		UserID:     userID,
		Phone:      phone,
		Region:     region,
		VerifiedAt: verifiedAt,
		Method:     method,
	}
}