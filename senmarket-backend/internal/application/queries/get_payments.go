// internal/application/queries/get_payments.go
package queries

import (
	"context"
	"senmarket/internal/application/dto"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"time"
)

// GetPaymentsQuery requête pour récupérer des paiements
type GetPaymentsQuery struct {
	UserID       *string    `json:"user_id,omitempty"`
	Status       *string    `json:"status,omitempty"`
	Method       *string    `json:"method,omitempty"`
	AmountMin    *float64   `json:"amount_min,omitempty"`
	AmountMax    *float64   `json:"amount_max,omitempty"`
	CreatedAfter *time.Time `json:"created_after,omitempty"`
	CreatedBefore *time.Time `json:"created_before,omitempty"`
	Offset       int        `json:"offset" validate:"min=0"`
	Limit        int        `json:"limit" validate:"min=1,max=100"`
}

// GetPaymentByIDQuery requête pour récupérer un paiement par ID
type GetPaymentByIDQuery struct {
	PaymentID string `json:"payment_id" validate:"required"`
}

// GetUserPaymentsQuery requête pour récupérer les paiements d'un utilisateur
type GetUserPaymentsQuery struct {
	UserID string `json:"user_id" validate:"required"`
	Offset int    `json:"offset" validate:"min=0"`
	Limit  int    `json:"limit" validate:"min=1,max=100"`
}

// GetPaymentsHandler handler pour récupérer des paiements
type GetPaymentsHandler struct {
	paymentRepo repositories.PaymentRepository
}

// NewGetPaymentsHandler crée un nouveau handler
func NewGetPaymentsHandler(paymentRepo repositories.PaymentRepository) *GetPaymentsHandler {
	return &GetPaymentsHandler{
		paymentRepo: paymentRepo,
	}
}

// HandleGetPayments traite la requête de récupération de paiements
func (h *GetPaymentsHandler) HandleGetPayments(ctx context.Context, query *GetPaymentsQuery) (*dto.PaymentListDTO, error) {
	filters := repositories.PaymentFilters{
		UserID:        query.UserID,
		Status:        query.Status,
		Method:        query.Method,
		AmountMin:     query.AmountMin,
		AmountMax:     query.AmountMax,
		CreatedAfter:  query.CreatedAfter,
		CreatedBefore: query.CreatedBefore,
	}
	
	payments, err := h.paymentRepo.List(ctx, filters, query.Offset, query.Limit)
	if err != nil {
		return nil, err
	}
	
	total, err := h.paymentRepo.Count(ctx, filters)
	if err != nil {
		return nil, err
	}
	
	return dto.NewPaymentListDTO(payments, total, query.Offset, query.Limit), nil
}

// HandleGetPaymentByID traite la requête de récupération de paiement par ID
func (h *GetPaymentsHandler) HandleGetPaymentByID(ctx context.Context, query *GetPaymentByIDQuery) (*dto.PaymentDTO, error) {
	payment, err := h.paymentRepo.GetByID(ctx, query.PaymentID)
	if err != nil {
		return nil, err
	}
	if payment == nil {
		return nil, entities.ErrPaymentNotFound
	}
	
	return dto.NewPaymentDTO(payment), nil
}

// HandleGetUserPayments traite la requête de récupération de paiements utilisateur
func (h *GetPaymentsHandler) HandleGetUserPayments(ctx context.Context, query *GetUserPaymentsQuery) (*dto.PaymentListDTO, error) {
	payments, err := h.paymentRepo.GetByUserID(ctx, query.UserID, query.Offset, query.Limit)
	if err != nil {
		return nil, err
	}
	
	// Compter le total pour cet utilisateur
	filters := repositories.PaymentFilters{
		UserID: &query.UserID,
	}
	total, err := h.paymentRepo.Count(ctx, filters)
	if err != nil {
		return nil, err
	}
	
	return dto.NewPaymentListDTO(payments, total, query.Offset, query.Limit), nil
}
