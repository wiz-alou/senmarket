// internal/infrastructure/messaging/email/email_interface.go
package email

import (
	"context"
)

// EmailProvider interface pour les fournisseurs d'email
type EmailProvider interface {
	// SendEmail envoie un email
	SendEmail(ctx context.Context, to, subject, body string) (*EmailResult, error)
	
	// SendHTML envoie un email HTML
	SendHTML(ctx context.Context, to, subject, htmlBody string) (*EmailResult, error)
	
	// SendTemplate envoie un email basé sur un template
	SendTemplate(ctx context.Context, to, subject, templateName string, data map[string]interface{}) (*EmailResult, error)
	
	// GetProviderName retourne le nom du fournisseur
	GetProviderName() string
	
	// IsAvailable vérifie si le service est disponible
	IsAvailable(ctx context.Context) bool
}

// EmailResult résultat d'envoi d'email
type EmailResult struct {
	MessageID string `json:"message_id"`
	Status    string `json:"status"`
	Provider  string `json:"provider"`
	SentAt    string `json:"sent_at"`
}

// EmailConfig configuration email
type EmailConfig struct {
	Provider string `json:"provider"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	Username string `json:"username"`
	Password string `json:"password"`
	FromEmail string `json:"from_email"`
	FromName  string `json:"from_name"`
	IsEnabled bool   `json:"is_enabled"`
}
