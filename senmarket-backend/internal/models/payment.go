// internal/models/payment.go
package models

import (
	"fmt" 
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Payment struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID          uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	ListingID       *uuid.UUID     `json:"listing_id" gorm:"type:uuid;index"` // Peut être null pour d'autres types de paiements
	Amount          float64        `json:"amount" gorm:"type:decimal(10,2);not null;default:200.00"`
	Currency        string         `json:"currency" gorm:"default:'XOF'"`
	PaymentMethod   string         `json:"payment_method" gorm:"not null" validate:"oneof=orange_money wave free_money card"`
	PaymentProvider string         `json:"payment_provider"`
	TransactionID   string         `json:"transaction_id" gorm:"uniqueIndex"`
	Status          string         `json:"status" gorm:"default:'pending'" validate:"oneof=pending completed failed cancelled"`
	FailureReason   string         `json:"failure_reason,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	CompletedAt     *time.Time     `json:"completed_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	User    User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Listing *Listing `json:"listing,omitempty" gorm:"foreignKey:ListingID"`
}

// BeforeCreate hook
func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

// TableName override
func (Payment) TableName() string {
	return "payments"
}

// IsCompleted vérifie si le paiement est terminé
func (p *Payment) IsCompleted() bool {
	return p.Status == "completed" && p.CompletedAt != nil
}

// IsPending vérifie si le paiement est en attente
func (p *Payment) IsPending() bool {
	return p.Status == "pending"
}

// MarkAsCompleted marque le paiement comme terminé
func (p *Payment) MarkAsCompleted(db *gorm.DB) error {
	now := time.Now()
	p.Status = "completed"
	p.CompletedAt = &now
	return db.Save(p).Error
}

// MarkAsFailed marque le paiement comme échoué
func (p *Payment) MarkAsFailed(db *gorm.DB, reason string) error {
	p.Status = "failed"
	p.FailureReason = reason
	return db.Save(p).Error
}

// GetFormattedAmount retourne le montant formaté
func (p *Payment) GetFormattedAmount() string {
	if p.Currency == "XOF" {
		return fmt.Sprintf("%.0f FCFA", p.Amount)
	}
	return fmt.Sprintf("%.2f %s", p.Amount, p.Currency)
}