// internal/infrastructure/external/twilio_sms_adapter.go
package external

import (
	"context"
	"fmt"
	
	"senmarket/internal/services" // ⭐ Ton service Twilio existant
)

// TwilioSMSAdapter - Adapteur pour connecter ton service Twilio existant
type TwilioSMSAdapter struct {
	twilioService *services.TwilioSMSService
}

// NewTwilioSMSAdapter - Constructeur
func NewTwilioSMSAdapter(twilioService *services.TwilioSMSService) *TwilioSMSAdapter {
	return &TwilioSMSAdapter{
		twilioService: twilioService,
	}
}

// SendSMS - Envoyer un SMS (utilise la vraie méthode de ton service)
func (a *TwilioSMSAdapter) SendSMS(ctx context.Context, phone, message string) error {
	// ✅ CORRIGÉ: Utilise SendSMS qui existe dans ton service
	err := a.twilioService.SendSMS(phone, message)
	if err != nil {
		return fmt.Errorf("erreur envoi SMS vers %s: %w", phone, err)
	}
	return nil
}

// IsConfigured - Vérifier si Twilio est configuré
func (a *TwilioSMSAdapter) IsConfigured() bool {
	// ✅ CORRIGÉ: Utilise IsConfigured qui existe dans ton service
	return a.twilioService.IsConfigured()
}

// GetAccountInfo - Récupérer les infos du compte
func (a *TwilioSMSAdapter) GetAccountInfo() (map[string]interface{}, error) {
	// ✅ CORRIGÉ: Utilise GetAccountInfo qui existe dans ton service
	return a.twilioService.GetAccountInfo()
}

// GetUsageStats - Récupérer les statistiques d'utilisation
func (a *TwilioSMSAdapter) GetUsageStats() map[string]interface{} {
	// ✅ CORRIGÉ: Utilise GetUsageStats qui existe dans ton service
	return a.twilioService.GetUsageStats()
}

// SendBulkSMS - Envoyer plusieurs SMS (méthode helper)
func (a *TwilioSMSAdapter) SendBulkSMS(ctx context.Context, messages map[string]string) error {
	for phone, message := range messages {
		if err := a.SendSMS(ctx, phone, message); err != nil {
			return err // Stopper au premier échec pour simplifier
		}
	}
	return nil
}
