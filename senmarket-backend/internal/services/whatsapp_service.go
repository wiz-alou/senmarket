// internal/services/whatsapp_service.go - VERSION CORRIGÉE
package services

import (
	// "bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"strings"
	"time"

	"senmarket/internal/models"
	"gorm.io/gorm"
)

type WhatsAppService struct {
	db              *gorm.DB
	apiToken        string
	apiURL          string
	businessNumber  string
	environment     string
	provider        string
}

type WhatsAppResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	Reference string `json:"reference,omitempty"`
	Error     string `json:"error,omitempty"`
}

// Structure pour Twilio Response (corrigée)
type TwilioWhatsAppResponse struct {
	SID          string      `json:"sid"`
	Status       interface{} `json:"status"`        // Peut être string ou number
	ErrorCode    interface{} `json:"error_code"`    // Peut être null
	ErrorMessage string      `json:"error_message,omitempty"`
	Body         string      `json:"body"`
	AccountSid   string      `json:"account_sid"`
	From         string      `json:"from"`
	To           string      `json:"to"`
}

func NewWhatsAppService(db *gorm.DB, apiToken, apiURL, businessNumber, environment, provider string) *WhatsAppService {
	return &WhatsAppService{
		db:             db,
		apiToken:       apiToken,
		apiURL:         apiURL,
		businessNumber: businessNumber,
		environment:    environment,
		provider:       provider,
	}
}

// SendVerificationCode génère et envoie un code de vérification via WhatsApp
func (s *WhatsAppService) SendVerificationCode(phone string) (*WhatsAppResponse, error) {
	// 1. Invalider les anciens codes
	if err := s.invalidateOldCodes(phone); err != nil {
		log.Printf("Erreur invalidation anciens codes WhatsApp: %v", err)
	}

	// 2. Générer un nouveau code à 6 chiffres
	code := s.generateVerificationCode()

	// 3. Sauvegarder en base (réutiliser la table SMS)
	verification := models.SMSVerification{
		Phone:     phone,
		Code:      code,
		Verified:  false,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}

	if err := s.db.Create(&verification).Error; err != nil {
		return nil, fmt.Errorf("erreur sauvegarde code WhatsApp: %w", err)
	}

	// 4. Créer le message WhatsApp
	message := s.createVerificationMessage(code)

	// 5. Envoyer via WhatsApp
	whatsappResponse, err := s.sendWhatsAppMessage(phone, message)
	if err != nil {
		// En mode développement, simuler le succès
		if s.environment == "development" || s.provider == "mock" {
			log.Printf("📱 WhatsApp DEV - Code %s envoyé vers %s", code, phone)
			return &WhatsAppResponse{
				Success:   true,
				Message:   fmt.Sprintf("Code WhatsApp envoyé (DEV - Code: %s)", code),
				Reference: verification.ID.String(),
			}, nil
		}
		
		log.Printf("❌ Erreur envoi WhatsApp: %v", err)
		return nil, fmt.Errorf("erreur envoi WhatsApp: %w", err)
	}

	return whatsappResponse, nil
}

// ResendVerificationCode renvoie un code avec limitation
func (s *WhatsAppService) ResendVerificationCode(phone string) (*WhatsAppResponse, error) {
	if !s.canResendCode(phone) {
		return nil, fmt.Errorf("limite de renvoi atteinte, veuillez attendre")
	}
	return s.SendVerificationCode(phone)
}

// VerifyCode vérifie un code de vérification
func (s *WhatsAppService) VerifyCode(phone, code string) error {
	var verification models.SMSVerification
	
	if err := s.db.Where("phone = ? AND code = ? AND verified = ? AND expires_at > ?", 
		phone, code, false, time.Now()).
		Order("created_at DESC").
		First(&verification).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return fmt.Errorf("code invalide ou expiré")
		}
		return fmt.Errorf("erreur vérification code: %w", err)
	}

	// Marquer comme vérifié
	verification.Verified = true
	return s.db.Save(&verification).Error
}

// SendWelcomeMessage envoie un message de bienvenue
func (s *WhatsAppService) SendWelcomeMessage(phone, firstName string) error {
	message := fmt.Sprintf(`🎉 Bienvenue sur *SenMarket*, %s !

Votre compte est maintenant vérifié ✅

🛍️ Commencez dès maintenant :
• Publier une annonce
• Parcourir les offres
• Contacter les vendeurs

📱 senmarket.sn

Bonne vente ! 🇸🇳`, firstName)

	_, err := s.sendWhatsAppMessage(phone, message)
	return err
}

// ===============================
// MÉTHODES PRIVÉES
// ===============================

func (s *WhatsAppService) generateVerificationCode() string {
	code := rand.Intn(900000) + 100000
	return fmt.Sprintf("%06d", code)
}

func (s *WhatsAppService) createVerificationMessage(code string) string {
	return fmt.Sprintf(`🇸🇳 *SenMarket* - Code de Vérification

Votre code est : *%s*

⏰ Valable 10 minutes
🔒 Ne partagez jamais ce code

Besoin d'aide ? Répondez HELP`, code)
}

func (s *WhatsAppService) invalidateOldCodes(phone string) error {
	return s.db.Model(&models.SMSVerification{}).
		Where("phone = ? AND verified = ? AND expires_at > ?", phone, false, time.Now()).
		Update("verified", true).Error
}

func (s *WhatsAppService) canResendCode(phone string) bool {
	var count int64
	s.db.Model(&models.SMSVerification{}).
		Where("phone = ? AND created_at > ?", phone, time.Now().Add(-1*time.Hour)).
		Count(&count)
	return count < 3
}

func (s *WhatsAppService) sendWhatsAppMessage(phone, message string) (*WhatsAppResponse, error) {
	// Mode développement
	if s.environment == "development" && s.provider == "mock" {
		log.Printf("📱 WhatsApp MOCK - Vers %s: %s", phone, message)
		return &WhatsAppResponse{
			Success:   true,
			Message:   "Message WhatsApp envoyé (mode développement)",
			Reference: fmt.Sprintf("mock_%d", time.Now().Unix()),
		}, nil
	}

	// Production - Router selon le provider
	switch s.provider {
	case "twilio":
		return s.sendTwilioMessage(phone, message)
	default:
		return nil, fmt.Errorf("provider non supporté: %s", s.provider)
	}
}

// ✅ CORRECTION : Implémentation Twilio qui fonctionne (basée sur votre curl)
func (s *WhatsAppService) sendTwilioMessage(phone, message string) (*WhatsAppResponse, error) {
	log.Printf("🚀 Envoi Twilio vers %s", phone)

	// Préparer les données comme votre curl qui fonctionne
	data := url.Values{}
	data.Set("To", "whatsapp:"+phone)
	data.Set("From", "whatsapp:"+s.businessNumber)
	data.Set("Body", message)

	// Créer la requête HTTP
	client := &http.Client{Timeout: 30 * time.Second}
	req, err := http.NewRequest("POST", s.apiURL+"/Messages.json", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("erreur création requête: %w", err)
	}

	// Headers comme votre curl
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	
	// Authentification Basic Auth (comme votre curl)
	auth := s.apiToken + ":"
	req.Header.Set("Authorization", "Basic "+base64.StdEncoding.EncodeToString([]byte(auth)))

	// Envoyer la requête
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erreur appel Twilio: %w", err)
	}
	defer resp.Body.Close()

	// Lire la réponse brute pour debug
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("erreur lecture réponse: %w", err)
	}
	
	log.Printf("🔍 Twilio Response: %s", string(bodyBytes))
	
	// Vérifier le statut HTTP d'abord
	if resp.StatusCode != 200 && resp.StatusCode != 201 {
		return nil, fmt.Errorf("erreur Twilio HTTP %d: %s", resp.StatusCode, string(bodyBytes))
	}

	// Décoder la réponse JSON
	var twilioResp TwilioWhatsAppResponse
	if err := json.Unmarshal(bodyBytes, &twilioResp); err != nil {
		log.Printf("❌ Erreur JSON decode: %v", err)
		log.Printf("📄 Response brute: %s", string(bodyBytes))
		return nil, fmt.Errorf("erreur décodage Twilio: %w", err)
	}

	log.Printf("✅ Twilio Success - SID: %s, Status: %v", twilioResp.SID, twilioResp.Status)

	return &WhatsAppResponse{
		Success:   true,
		Message:   "WhatsApp envoyé via Twilio",
		Reference: twilioResp.SID,
	}, nil
}