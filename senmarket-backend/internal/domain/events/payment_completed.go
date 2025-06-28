// internal/domain/events/payment_completed.go
package events

import (
	"time"
)

const PaymentCompletedEventType = "payment.completed"

// PaymentCompletedEvent événement de paiement complété
type PaymentCompletedEvent struct {
	*BaseEvent
	PaymentID     string    `json:"payment_id"`
	UserID        string    `json:"user_id"`
	ListingID     *string   `json:"listing_id,omitempty"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	Method        string    `json:"method"`
	TransactionID string    `json:"transaction_id"`
	CompletedAt   time.Time `json:"completed_at"`
}

// NewPaymentCompletedEvent crée un nouvel événement de paiement complété
func NewPaymentCompletedEvent(paymentID, userID string, listingID *string, amount float64, currency, method, transactionID string) *PaymentCompletedEvent {
	completedAt := time.Now()
	data := map[string]interface{}{
		"payment_id":     paymentID,
		"user_id":        userID,
		"listing_id":     listingID,
		"amount":         amount,
		"currency":       currency,
		"method":         method,
		"transaction_id": transactionID,
		"completed_at":   completedAt,
	}

	return &PaymentCompletedEvent{
		BaseEvent:     NewBaseEvent(paymentID, PaymentCompletedEventType, data),
		PaymentID:     paymentID,
		UserID:        userID,
		ListingID:     listingID,
		Amount:        amount,
		Currency:      currency,
		Method:        method,
		TransactionID: transactionID,
		CompletedAt:   completedAt,
	}
}