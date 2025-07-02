// 4. Fix internal/domain/repositories/payment_repository.go
package repositories

import (
	"context"
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
)

// PaymentRepository - Interface pour la persistance des paiements
type PaymentRepository interface {
	// CRUD de base
	Create(ctx context.Context, payment *entities.Payment) error
	GetByID(ctx context.Context, id uuid.UUID) (*entities.Payment, error)
	GetByTransactionID(ctx context.Context, transactionID string) (*entities.Payment, error)
	Update(ctx context.Context, payment *entities.Payment) error
	
	// Requêtes métier
	GetUserPayments(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.Payment, error)
	GetPendingPayments(ctx context.Context) ([]*entities.Payment, error)
	GetCompletedPayments(ctx context.Context, from, to *time.Time) ([]*entities.Payment, error)
	
	// Statistiques
	GetTotalRevenue(ctx context.Context, from, to *time.Time) (float64, error)
	CountByMethod(ctx context.Context, method string) (int64, error)
}