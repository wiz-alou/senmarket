// internal/infrastructure/messaging/sms/sms_interface.go
package sms

import (
	"context"
)

// SMSProvider interface pour les fournisseurs SMS
type SMSProvider interface {
	// SendSMS envoie un SMS
	SendSMS(ctx context.Context, to, message string) (*SMSResult, error)
	
	// SendVerificationCode envoie un code de vérification
	SendVerificationCode(ctx context.Context, to, code string) (*SMSResult, error)
	
	// GetProviderName retourne le nom du fournisseur
	GetProviderName() string
	
	// IsAvailable vérifie si le service est disponible
	IsAvailable(ctx context.Context) bool
}

// SMSResult résultat d'envoi SMS
type SMSResult struct {
	MessageID string `json:"message_id"`
	Status    string `json:"status"`
	Cost      string `json:"cost,omitempty"`
	Provider  string `json:"provider"`
	SentAt    string `json:"sent_at"`
}

// SMSConfig configuration SMS
type SMSConfig struct {
	Provider    string `json:"provider"`
	AccountSID  string `json:"account_sid"`
	AuthToken   string `json:"auth_token"`
	FromNumber  string `json:"from_number"`
	IsEnabled   bool   `json:"is_enabled"`
}
