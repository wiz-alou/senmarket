// internal/infrastructure/messaging/payments/payment_interface.go
package payments

import (
	"context"
)

// PaymentProvider interface pour les fournisseurs de paiement
type PaymentProvider interface {
	// InitiatePayment initie un paiement
	InitiatePayment(ctx context.Context, request *PaymentRequest) (*PaymentResponse, error)
	
	// CheckPaymentStatus vérifie le statut d'un paiement
	CheckPaymentStatus(ctx context.Context, transactionID string) (*PaymentStatusResponse, error)
	
	// ProcessCallback traite un callback de paiement
	ProcessCallback(ctx context.Context, data map[string]interface{}) (*CallbackResult, error)
	
	// GetProviderName retourne le nom du fournisseur
	GetProviderName() string
	
	// IsAvailable vérifie si le service est disponible
	IsAvailable(ctx context.Context) bool
}

// PaymentRequest requête de paiement
type PaymentRequest struct {
	Amount      float64 `json:"amount"`
	Currency    string  `json:"currency"`
	Phone       string  `json:"phone"`
	Description string  `json:"description"`
	Reference   string  `json:"reference"`
	CallbackURL string  `json:"callback_url"`
}

// PaymentResponse réponse de paiement
type PaymentResponse struct {
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	PaymentURL    string `json:"payment_url,omitempty"`
	Message       string `json:"message"`
	Provider      string `json:"provider"`
}

// PaymentStatusResponse réponse de statut de paiement
type PaymentStatusResponse struct {
	TransactionID string  `json:"transaction_id"`
	Status        string  `json:"status"`
	Amount        float64 `json:"amount"`
	Currency      string  `json:"currency"`
	Message       string  `json:"message"`
	ProcessedAt   string  `json:"processed_at,omitempty"`
}

// CallbackResult résultat de callback
type CallbackResult struct {
	TransactionID string `json:"transaction_id"`
	Status        string `json:"status"`
	IsValid       bool   `json:"is_valid"`
	Message       string `json:"message"`
}
