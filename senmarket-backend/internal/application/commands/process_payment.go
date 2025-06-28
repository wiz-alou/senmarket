// internal/application/commands/process_payment.go
package commands

import (
	"context"
	"time"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/events"
	"senmarket/internal/domain/repositories"
)

// ProcessPaymentCommand commande pour traiter un paiement
type ProcessPaymentCommand struct {
	UserID        string                 `json:"user_id" validate:"required"`
	Amount        float64                `json:"amount" validate:"min=0"`
	Currency      string                 `json:"currency" validate:"required"`
	Method        string                 `json:"method" validate:"required"`
	ListingID     *string                `json:"listing_id,omitempty"`
	Metadata      map[string]interface{} `json:"metadata,omitempty"`
}

// ProcessPaymentHandler handler pour traiter un paiement
type ProcessPaymentHandler struct {
	paymentRepo    repositories.PaymentRepository
	userRepo       repositories.UserRepository
	eventPublisher events.EventPublisher
}

// NewProcessPaymentHandler crée un nouveau handler
func NewProcessPaymentHandler(
	paymentRepo repositories.PaymentRepository,
	userRepo repositories.UserRepository,
	eventPublisher events.EventPublisher,
) *ProcessPaymentHandler {
	return &ProcessPaymentHandler{
		paymentRepo:    paymentRepo,
		userRepo:       userRepo,
		eventPublisher: eventPublisher,
	}
}

// Handle traite la commande de paiement
func (h *ProcessPaymentHandler) Handle(ctx context.Context, cmd *ProcessPaymentCommand) (*ProcessPaymentResult, error) {
	// Vérifier que l'utilisateur existe
	user, err := h.userRepo.GetByID(ctx, cmd.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// Créer le paiement
	payment, err := entities.NewPayment(
		cmd.UserID,
		cmd.Amount,
		cmd.Currency,
		entities.PaymentMethod(cmd.Method),
	)
	if err != nil {
		return nil, err
	}
	
	// Ajouter le listing ID si fourni
	if cmd.ListingID != nil {
		payment.ListingID = cmd.ListingID
	}
	
	// Ajouter les métadonnées
	for key, value := range cmd.Metadata {
		payment.AddMetadata(key, value)
	}
	
	// Sauvegarder le paiement
	if err := h.paymentRepo.Create(ctx, payment); err != nil {
		return nil, err
	}
	
	return &ProcessPaymentResult{
		PaymentID:     payment.ID,
		TransactionID: payment.TransactionID,
		Status:        string(payment.Status),
		Amount:        payment.GetAmountFormatted(),
		CreatedAt:     payment.CreatedAt,
		ExpiresAt:     payment.ExpiresAt,
	}, nil
}

// ProcessPaymentResult résultat de traitement de paiement
type ProcessPaymentResult struct {
	PaymentID     string     `json:"payment_id"`
	TransactionID string     `json:"transaction_id"`
	Status        string     `json:"status"`
	Amount        string     `json:"amount"`
	CreatedAt     time.Time  `json:"created_at"`
	ExpiresAt     *time.Time `json:"expires_at,omitempty"`
}
