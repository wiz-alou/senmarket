// internal/application/commands/process_payment.go - CORRIGÉ AVEC LA VRAIE STRUCTURE
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
	
	// 🔧 CORRIGÉ: Créer le paiement avec PaymentMethod
	payment, err := entities.NewPayment(
		cmd.UserID,
		cmd.Amount,
		cmd.Currency,
		entities.PaymentMethod(cmd.Method), // 🔧 CORRIGÉ: Cast vers PaymentMethod
	)
	if err != nil {
		return nil, err
	}
	
	// Ajouter le listing ID si fourni
	if cmd.ListingID != nil {
		payment.ListingID = cmd.ListingID
	}
	
	// 🔧 CORRIGÉ: Ajouter les métadonnées directement
	if cmd.Metadata != nil {
		payment.Metadata = cmd.Metadata
	}
	
	// Sauvegarder le paiement
	if err := h.paymentRepo.Create(ctx, payment); err != nil {
		return nil, err
	}
	
	// 🔧 CORRIGÉ: Publier l'événement SEULEMENT si eventPublisher n'est pas nil
	if h.eventPublisher != nil {
		// Utiliser l'événement PaymentCompleted existant
		event := events.NewPaymentCompletedEvent(
			payment.ID,
			payment.UserID,
			payment.ListingID,
			payment.Amount.Amount,   // 🔧 CORRIGÉ: Accès direct aux champs
			payment.Amount.Currency, // 🔧 CORRIGÉ: Accès direct aux champs
			string(payment.Method),
			payment.TransactionID,
		)
		if err := h.eventPublisher.Publish(ctx, event); err != nil {
			// Log l'erreur mais ne pas faire échouer la commande
		}
	}
	
	return &ProcessPaymentResult{
		PaymentID:     payment.ID,
		TransactionID: payment.TransactionID,
		Status:        string(payment.Status),
		Amount:        payment.Amount.String(), // 🔧 CORRIGÉ: Utilise String() pour le formatage
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
