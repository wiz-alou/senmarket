// internal/domain/events/payment_failed.go
package events

import (
	"time"
)

const PaymentFailedEventType = "payment.failed"

// PaymentFailedEvent événement de paiement échoué
type PaymentFailedEvent struct {
	*BaseEvent
	PaymentID     string    `json:"payment_id"`
	UserID        string    `json:"user_id"`
	Amount        float64   `json:"amount"`
	Currency      string    `json:"currency"`
	Method        string    `json:"method"`
	ErrorMessage  string    `json:"error_message"`
	FailedAt      time.Time `json:"failed_at"`
}

// NewPaymentFailedEvent crée un nouvel événement de paiement échoué
func NewPaymentFailedEvent(paymentID, userID string, amount float64, currency, method, errorMessage string) *PaymentFailedEvent {
	failedAt := time.Now()
	data := map[string]interface{}{
		"payment_id":    paymentID,
		"user_id":       userID,
		"amount":        amount,
		"currency":      currency,
		"method":        method,
		"error_message": errorMessage,
		"failed_at":     failedAt,
	}

	return &PaymentFailedEvent{
		BaseEvent:    NewBaseEvent(paymentID, PaymentFailedEventType, data),
		PaymentID:    paymentID,
		UserID:       userID,
		Amount:       amount,
		Currency:     currency,
		Method:       method,
		ErrorMessage: errorMessage,
		FailedAt:     failedAt,
	}
}
