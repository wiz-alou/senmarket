// internal/application/dto/payment_dto.go
package dto

import (
	"senmarket/internal/domain/entities"
	"time"
)

// PaymentDTO DTO pour les paiements
type PaymentDTO struct {
	ID             string                 `json:"id"`
	UserID         string                 `json:"user_id"`
	ListingID      *string                `json:"listing_id,omitempty"`
	TransactionID  string                 `json:"transaction_id"`
	Amount         string                 `json:"amount"`
	Method         string                 `json:"method"`
	Status         string                 `json:"status"`
	ProviderRef    string                 `json:"provider_ref,omitempty"`
	SuccessMessage string                 `json:"success_message,omitempty"`
	ErrorMessage   string                 `json:"error_message,omitempty"`
	Metadata       map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt      time.Time              `json:"created_at"`
	UpdatedAt      time.Time              `json:"updated_at"`
	ProcessedAt    *time.Time             `json:"processed_at,omitempty"`
	ExpiresAt      *time.Time             `json:"expires_at,omitempty"`
}

// NewPaymentDTO crée un nouveau PaymentDTO depuis une entité Payment
func NewPaymentDTO(payment *entities.Payment) *PaymentDTO {
	return &PaymentDTO{
		ID:             payment.ID,
		UserID:         payment.UserID,
		ListingID:      payment.ListingID,
		TransactionID:  payment.TransactionID,
		Amount:         payment.GetAmountFormatted(),
		Method:         string(payment.Method),
		Status:         string(payment.Status),
		ProviderRef:    payment.ProviderRef,
		SuccessMessage: payment.SuccessMessage,
		ErrorMessage:   payment.ErrorMessage,
		Metadata:       payment.Metadata,
		CreatedAt:      payment.CreatedAt,
		UpdatedAt:      payment.UpdatedAt,
		ProcessedAt:    payment.ProcessedAt,
		ExpiresAt:      payment.ExpiresAt,
	}
}

// PaymentListDTO DTO pour une liste de paiements avec pagination
type PaymentListDTO struct {
	Payments []*PaymentDTO `json:"payments"`
	Total    int64         `json:"total"`
	Offset   int           `json:"offset"`
	Limit    int           `json:"limit"`
	HasMore  bool          `json:"has_more"`
}

// NewPaymentListDTO crée un nouveau PaymentListDTO
func NewPaymentListDTO(payments []*entities.Payment, total int64, offset, limit int) *PaymentListDTO {
	dtos := make([]*PaymentDTO, len(payments))
	for i, payment := range payments {
		dtos[i] = NewPaymentDTO(payment)
	}
	
	hasMore := int64(offset+limit) < total
	
	return &PaymentListDTO{
		Payments: dtos,
		Total:    total,
		Offset:   offset,
		Limit:    limit,
		HasMore:  hasMore,
	}
}

// PaymentSummaryDTO DTO pour un résumé de paiement
type PaymentSummaryDTO struct {
	ID        string    `json:"id"`
	Amount    string    `json:"amount"`
	Method    string    `json:"method"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

// NewPaymentSummaryDTO crée un nouveau PaymentSummaryDTO
func NewPaymentSummaryDTO(payment *entities.Payment) *PaymentSummaryDTO {
	return &PaymentSummaryDTO{
		ID:        payment.ID,
		Amount:    payment.GetAmountFormatted(),
		Method:    string(payment.Method),
		Status:    string(payment.Status),
		CreatedAt: payment.CreatedAt,
	}
}


