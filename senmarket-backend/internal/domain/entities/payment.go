// internal/domain/entities/payment.go
package entities

import (
	"time"
	"github.com/google/uuid"
)

// Payment - Entité paiement
type Payment struct {
	ID              uuid.UUID  `json:"id"`
	UserID          uuid.UUID  `json:"user_id"`
	ListingID       *uuid.UUID `json:"listing_id"`
	Amount          float64    `json:"amount"`
	Currency        string     `json:"currency"`
	PaymentMethod   string     `json:"payment_method"`
	PaymentProvider *string    `json:"payment_provider"`
	TransactionID   *string    `json:"transaction_id"`
	Status          string     `json:"status"`
	FailureReason   *string    `json:"failure_reason"`
	CreatedAt       time.Time  `json:"created_at"`
	CompletedAt     *time.Time `json:"completed_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

// NewPayment crée un nouveau paiement
func NewPayment(userID uuid.UUID, amount float64, currency, paymentMethod string) *Payment {
	now := time.Now()
	
	return &Payment{
		ID:            uuid.New(),
		UserID:        userID,
		Amount:        amount,
		Currency:      currency,
		PaymentMethod: paymentMethod,
		Status:        "pending",
		CreatedAt:     now,
		UpdatedAt:     now,
	}
}

// Complete finalise le paiement
func (p *Payment) Complete(transactionID string, provider *string) {
	p.Status = "completed"
	p.TransactionID = &transactionID
	p.PaymentProvider = provider
	now := time.Now()
	p.CompletedAt = &now
	p.UpdatedAt = now
}

// Fail marque le paiement comme échoué
func (p *Payment) Fail(reason string) {
	p.Status = "failed"
	p.FailureReason = &reason
	p.UpdatedAt = time.Now()
}