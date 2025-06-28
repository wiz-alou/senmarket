// internal/utils/sms.go
package utils

import (
	"fmt"
	"log"
)

// MockSMSService simule l'envoi de SMS pour le développement
type MockSMSService struct{}

func NewMockSMSService() *MockSMSService {
	return &MockSMSService{}
}

// SendSMS simule l'envoi d'un SMS
func (s *MockSMSService) SendSMS(phone, message string) error {
	// En développement, on log juste le message
	log.Printf("📱 SMS MOCK - Envoi vers %s: %s", phone, message)
	
	// Simuler un délai d'envoi
	// time.Sleep(500 * time.Millisecond)
	
	// En production, ici tu intégrerais l'API SMS du Sénégal
	// Exemples d'APIs SMS populaires au Sénégal :
	// - Orange API
	// - Tigo API  
	// - Free API
	// - ou un service comme Twilio
	
	return nil
}

// RealSMSService structure pour l'implémentation réelle
type RealSMSService struct {
	APIKey    string
	APISecret string
	BaseURL   string
	Sender    string
}

func NewRealSMSService(apiKey, apiSecret, baseURL, sender string) *RealSMSService {
	return &RealSMSService{
		APIKey:    apiKey,
		APISecret: apiSecret,
		BaseURL:   baseURL,
		Sender:    sender,
	}
}

// SendSMS implémentation réelle (à compléter avec l'API choisie)
func (s *RealSMSService) SendSMS(phone, message string) error {
	// TODO: Implémenter l'envoi SMS réel
	// Exemple avec l'API Orange Money Sénégal :
	
	/*
	payload := map[string]interface{}{
		"from": s.Sender,
		"to": phone,
		"text": message,
	}
	
	// Faire la requête HTTP vers l'API SMS
	// ...
	*/
	
	// Pour l'instant, on utilise le mock
	return fmt.Errorf("service SMS réel non implémenté")
}