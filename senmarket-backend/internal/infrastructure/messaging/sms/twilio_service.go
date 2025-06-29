// internal/infrastructure/messaging/sms/twilio_service.go
package sms

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

// TwilioService implémentation Twilio pour SMS
type TwilioService struct {
	accountSID  string
	authToken   string
	phoneNumber string
	client      *http.Client
}

// TwilioResponse réponse de l'API Twilio
type TwilioResponse struct {
	SID          string      `json:"sid"`
	Status       string      `json:"status"`
	ErrorCode    interface{} `json:"error_code"`
	ErrorMessage string      `json:"error_message,omitempty"`
	Body         string      `json:"body"`
	From         string      `json:"from"`
	To           string      `json:"to"`
}

// SMSResult résultat d'envoi SMS
type SMSResult struct {
	MessageID string `json:"message_id"`
	Status    string `json:"status"`
	Provider  string `json:"provider"`
	SentAt    string `json:"sent_at"`
}

// NewTwilioService crée un nouveau service Twilio
func NewTwilioService() *TwilioService {
	return &TwilioService{
		accountSID:  os.Getenv("TWILIO_ACCOUNT_SID"),
		authToken:   os.Getenv("TWILIO_AUTH_TOKEN"),
		phoneNumber: os.Getenv("TWILIO_PHONE_NUMBER"),
		client:      &http.Client{Timeout: 30 * time.Second},
	}
}

// SendSMS envoie un SMS via Twilio
func (s *TwilioService) SendSMS(ctx context.Context, to, message string) (*SMSResult, error) {
	// Mode développement si credentials manquants
	if s.accountSID == "" || s.authToken == "" || s.phoneNumber == "" {
		return &SMSResult{
			MessageID: fmt.Sprintf("dev_%d", time.Now().Unix()),
			Status:    "sent",
			Provider:  "twilio_dev",
			SentAt:    time.Now().Format(time.RFC3339),
		}, nil
	}

	// URL API Twilio
	apiURL := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", s.accountSID)

	// Préparer les données
	data := url.Values{}
	data.Set("To", to)
	data.Set("From", s.phoneNumber)
	data.Set("Body", message)

	// Créer la requête
	req, err := http.NewRequestWithContext(ctx, "POST", apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Headers
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	
	// Authentification Basic Auth
	credentials := s.accountSID + ":" + s.authToken
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(credentials))
	req.Header.Set("Authorization", "Basic "+encodedAuth)

	// Envoyer la requête
	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to send SMS: %w", err)
	}
	defer resp.Body.Close()

	// Lire la réponse
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Vérifier le statut HTTP
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return nil, fmt.Errorf("twilio API error %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parser la réponse
	var twilioResp TwilioResponse
	if err := json.Unmarshal(bodyBytes, &twilioResp); err != nil {
		return nil, fmt.Errorf("failed to parse response: %w", err)
	}

	// Vérifier les erreurs Twilio
	if twilioResp.ErrorCode != nil {
		return nil, fmt.Errorf("twilio error %v: %s", twilioResp.ErrorCode, twilioResp.ErrorMessage)
	}

	return &SMSResult{
		MessageID: twilioResp.SID,
		Status:    twilioResp.Status,
		Provider:  "twilio",
		SentAt:    time.Now().Format(time.RFC3339),
	}, nil
}

// IsConfigured vérifie si le service est configuré
func (s *TwilioService) IsConfigured() bool {
	return s.accountSID != "" && s.authToken != "" && s.phoneNumber != ""
}

// GetStatus retourne le statut du service
func (s *TwilioService) GetStatus() map[string]interface{} {
	status := map[string]interface{}{
		"provider":     "twilio",
		"configured":   s.IsConfigured(),
		"phone_number": s.phoneNumber,
	}

	if s.IsConfigured() {
		status["account_sid"] = s.accountSID[:8] + "..." // Masquer pour sécurité
		status["mode"] = "production"
		status["message"] = "Twilio configuré et prêt"
	} else {
		status["mode"] = "development"
		status["message"] = "Variables Twilio manquantes - mode simulation"
	}

	return status
}