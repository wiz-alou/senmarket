// internal/domain/repositories/payment_repository.go
package repositories

import (
	"context"
	"senmarket/internal/domain/entities"
	"time"
)

// PaymentFilters filtres pour les paiements
type PaymentFilters struct {
	UserID       *string
	Status       *string
	Method       *string
	AmountMin    *float64
	AmountMax    *float64
	CreatedAfter *time.Time
	CreatedBefore *time.Time
}

// PaymentRepository interface pour la gestion des paiements
type PaymentRepository interface {
	// Create crée un nouveau paiement
	Create(ctx context.Context, payment *entities.Payment) error
	
	// GetByID récupère un paiement par son ID
	GetByID(ctx context.Context, id string) (*entities.Payment, error)
	
	// GetByTransactionID récupère un paiement par son ID de transaction
	GetByTransactionID(ctx context.Context, transactionID string) (*entities.Payment, error)
	
	// Update met à jour un paiement
	Update(ctx context.Context, payment *entities.Payment) error
	
	// List retourne une liste paginée de paiements
	List(ctx context.Context, filters PaymentFilters, offset, limit int) ([]*entities.Payment, error)
	
	// Count retourne le nombre de paiements
	Count(ctx context.Context, filters PaymentFilters) (int64, error)
	
	// GetByUserID retourne les paiements d'un utilisateur
	GetByUserID(ctx context.Context, userID string, offset, limit int) ([]*entities.Payment, error)
	
	// UpdateStatus met à jour le statut d'un paiement
	UpdateStatus(ctx context.Context, id string, status string) error
	
	// GetPending retourne les paiements en attente
	GetPending(ctx context.Context) ([]*entities.Payment, error)
	
	// GetSuccessful retourne les paiements réussis
	GetSuccessful(ctx context.Context, userID string) ([]*entities.Payment, error)
	
	// GetFailed retourne les paiements échoués
	GetFailed(ctx context.Context, from, to time.Time) ([]*entities.Payment, error)
	
	// GetRevenue calcule le chiffre d'affaires sur une période
	GetRevenue(ctx context.Context, from, to time.Time) (*entities.Revenue, error)
	
	// GetDailyStats retourne les statistiques journalières
	GetDailyStats(ctx context.Context, from, to time.Time) ([]entities.DailyPaymentStats, error)
	
	// GetMethodStats retourne les statistiques par méthode de paiement
	GetMethodStats(ctx context.Context, from, to time.Time) ([]entities.PaymentMethodStats, error)
	
	// MarkAsProcessed marque un paiement comme traité
	MarkAsProcessed(ctx context.Context, id string, processedAt time.Time) error
	
	// GetUnprocessed retourne les paiements non traités
	GetUnprocessed(ctx context.Context) ([]*entities.Payment, error)
	
	// CreateRefund crée un remboursement
	CreateRefund(ctx context.Context, originalPaymentID string, amount float64, reason string) error
	
	// GetRefunds retourne les remboursements d'un paiement
	GetRefunds(ctx context.Context, paymentID string) ([]*entities.Payment, error)
}
