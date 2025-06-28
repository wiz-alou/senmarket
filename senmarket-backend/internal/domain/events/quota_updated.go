// internal/domain/events/quota_updated.go
package events

import (
	"time"
)

const QuotaUpdatedEventType = "quota.updated"

// QuotaUpdatedEvent événement de mise à jour de quota
type QuotaUpdatedEvent struct {
	*BaseEvent
	UserID           string    `json:"user_id"`
	OldFreeListings  int       `json:"old_free_listings"`
	NewFreeListings  int       `json:"new_free_listings"`
	OldPaidListings  int       `json:"old_paid_listings"`
	NewPaidListings  int       `json:"new_paid_listings"`
	Reason           string    `json:"reason"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// NewQuotaUpdatedEvent crée un nouvel événement de mise à jour de quota
func NewQuotaUpdatedEvent(userID string, oldFree, newFree, oldPaid, newPaid int, reason string) *QuotaUpdatedEvent {
	updatedAt := time.Now()
	data := map[string]interface{}{
		"user_id":           userID,
		"old_free_listings": oldFree,
		"new_free_listings": newFree,
		"old_paid_listings": oldPaid,
		"new_paid_listings": newPaid,
		"reason":            reason,
		"updated_at":        updatedAt,
	}

	return &QuotaUpdatedEvent{
		BaseEvent:       NewBaseEvent(userID, QuotaUpdatedEventType, data),
		UserID:          userID,
		OldFreeListings: oldFree,
		NewFreeListings: newFree,
		OldPaidListings: oldPaid,
		NewPaidListings: newPaid,
		Reason:          reason,
		UpdatedAt:       updatedAt,
	}
}
