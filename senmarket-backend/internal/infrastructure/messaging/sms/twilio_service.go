// internal/infrastructure/messaging/sms/twilio_service.go
package sms

import (
	"context"
	"fmt"
	"time"
)

// TwilioSMSService service SMS Twilio
type TwilioSMSService struct {
	accountSID string
	authToken  string
	fromNumber string
	isEnabled  bool
}

// NewTwilioSMSService crée un nouveau service Twilio SMS
func NewTwilioSMSService(accountSID, authToken, fromNumber string) SMSProvider {
	return &TwilioSMSService{
		accountSID: accountSID,
		authToken:  authToken,
		fromNumber: fromNumber,
		isEnabled:  true,
	}
}

// SendSMS envoie un SMS via Twilio
func (s *TwilioSMSService) SendSMS(ctx context.Context, to, message string) (*SMSResult, error) {
	if !s.isEnabled {
		return nil, fmt.Errorf("twilio SMS service is disabled")
	}
	
	// TODO: Implémenter l'appel à l'API Twilio
	// Pour l'instant, simuler l'envoi
	
	result := &SMSResult{
		MessageID: fmt.Sprintf("tw_%d", time.Now().Unix()),
		Status:    "sent",
		Provider:  "twilio",
		SentAt:    time.Now().Format(time.RFC3339),
	}
	
	return result, nil
}

// SendVerificationCode envoie un code de vérification
func (s *TwilioSMSService) SendVerificationCode(ctx context.Context, to, code string) (*SMSResult, error) {
	message := fmt.Sprintf("Votre code de vérification SenMarket: %s", code)
	return s.SendSMS(ctx, to, message)
}

// GetProviderName retourne le nom du fournisseur
func (s *TwilioSMSService) GetProviderName() string {
	return "twilio"
}

// IsAvailable vérifie si le service est disponible
func (s *TwilioSMSService) IsAvailable(ctx context.Context) bool {
	return s.isEnabled && s.accountSID != "" && s.authToken != ""
}
