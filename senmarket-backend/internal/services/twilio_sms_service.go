// internal/services/twilio_sms_service.go
package services

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

type TwilioSMSService struct {
	accountSID  string
	authToken   string
	phoneNumber string
}

type TwilioSMSResponse struct {
	SID          string      `json:"sid"`
	Status       string      `json:"status"`
	ErrorCode    interface{} `json:"error_code"`
	ErrorMessage string      `json:"error_message,omitempty"`
	Body         string      `json:"body"`
	From         string      `json:"from"`
	To           string      `json:"to"`
}

func NewTwilioSMSService() *TwilioSMSService {
	return &TwilioSMSService{
		accountSID:  os.Getenv("TWILIO_ACCOUNT_SID"),
		authToken:   os.Getenv("TWILIO_AUTH_TOKEN"),
		phoneNumber: os.Getenv("TWILIO_PHONE_NUMBER"),
	}
}

// SendSMS envoie un SMS via Twilio (gratuit: 250 SMS/mois)
func (t *TwilioSMSService) SendSMS(phone, message string) error {
	
	// Vérifications
	if t.accountSID == "" || t.authToken == "" || t.phoneNumber == "" {
		log.Printf("📱 TWILIO SMS DEV MODE - Vers %s: %s", phone, message)
		log.Printf("⚠️  Variables Twilio manquantes, mode simulation activé")
		return nil
	}

	// Nettoyer le numéro de téléphone
	cleanedPhone := t.cleanPhoneNumber(phone)
	
	log.Printf("🚀 Envoi Twilio SMS vers %s", cleanedPhone)
	log.Printf("🔑 Account SID: %s", t.accountSID)
	log.Printf("📞 From: %s", t.phoneNumber)

	// URL de l'API Twilio
	apiURL := fmt.Sprintf("https://api.twilio.com/2010-04-01/Accounts/%s/Messages.json", t.accountSID)

	// Données du formulaire
	data := url.Values{}
	data.Set("To", cleanedPhone)
	data.Set("From", t.phoneNumber)
	data.Set("Body", message)

	// Créer la requête HTTP
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("POST", apiURL, strings.NewReader(data.Encode()))
	if err != nil {
		return fmt.Errorf("erreur création requête: %w", err)
	}

	// Headers
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	
	// Authentification Basic Auth
	credentials := t.accountSID + ":" + t.authToken
	encodedAuth := base64.StdEncoding.EncodeToString([]byte(credentials))
	req.Header.Set("Authorization", "Basic "+encodedAuth)

	// Log sécurisé de l'auth
	logAuth := encodedAuth
	if len(logAuth) > 20 {
		logAuth = logAuth[:20] + "..."
	}
	log.Printf("🔐 Auth header: Basic %s", logAuth)

	// Envoyer la requête
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("erreur appel Twilio: %w", err)
	}
	defer resp.Body.Close()

	// Lire la réponse
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("erreur lecture réponse: %w", err)
	}

	log.Printf("🔍 Twilio SMS Status: %d", resp.StatusCode)
	log.Printf("🔍 Twilio SMS Response: %s", string(bodyBytes))

	// Vérifier le statut HTTP
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return fmt.Errorf("erreur Twilio HTTP %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Parser la réponse JSON
	var twilioResp TwilioSMSResponse
	if err := json.Unmarshal(bodyBytes, &twilioResp); err != nil {
		log.Printf("❌ Erreur JSON decode: %v", err)
		log.Printf("📄 Response brute: %s", string(bodyBytes))
		return fmt.Errorf("erreur décodage Twilio: %w", err)
	}

	// Vérifier les erreurs Twilio
	if twilioResp.ErrorCode != nil {
		return fmt.Errorf("erreur Twilio: %s (code: %v)", twilioResp.ErrorMessage, twilioResp.ErrorCode)
	}

	log.Printf("✅ Twilio SMS Success - SID: %s, Status: %s", twilioResp.SID, twilioResp.Status)
	return nil
}

// cleanPhoneNumber nettoie et formate le numéro de téléphone
func (t *TwilioSMSService) cleanPhoneNumber(phone string) string {
	// Supprimer espaces, tirets, parenthèses
	cleaned := strings.ReplaceAll(phone, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")
	
	// Ajouter +221 si nécessaire pour le Sénégal
	if !strings.HasPrefix(cleaned, "+") {
		if strings.HasPrefix(cleaned, "221") {
			cleaned = "+" + cleaned
		} else if strings.HasPrefix(cleaned, "7") || strings.HasPrefix(cleaned, "3") {
			cleaned = "+221" + cleaned
		} else {
			cleaned = "+" + cleaned
		}
	}
	
	return cleaned
}

// GetAccountInfo récupère les infos du compte Twilio
func (t *TwilioSMSService) GetAccountInfo() (map[string]interface{}, error) {
	if t.accountSID == "" || t.authToken == "" {
		return map[string]interface{}{
			"status":   "dev_mode",
			"balance":  "N/A",
			"phone":    "N/A",
			"messages": "Simulation activée",
		}, nil
	}

	// TODO: Appeler l'API Twilio pour récupérer les infos du compte
	// Pour l'instant, retourner des infos basiques
	return map[string]interface{}{
		"status":     "active",
		"account_sid": t.accountSID,
		"phone":      t.phoneNumber,
		"free_tier":  "250 SMS/mois",
	}, nil
}

// IsConfigured vérifie si Twilio est correctement configuré
func (t *TwilioSMSService) IsConfigured() bool {
	return t.accountSID != "" && t.authToken != "" && t.phoneNumber != ""
}

// GetUsageStats récupère les statistiques d'utilisation (simulées)
func (t *TwilioSMSService) GetUsageStats() map[string]interface{} {
	// TODO: Intégrer avec l'API Twilio Usage pour les vraies stats
	return map[string]interface{}{
		"messages_sent_today":    0,
		"messages_sent_month":    0,
		"free_messages_remaining": 250, // Limite gratuite
		"last_message_sent":      nil,
	}
}