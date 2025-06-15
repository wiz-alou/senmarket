// internal/services/payment_service.go
package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"senmarket/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrPaymentFailed    = errors.New("paiement échoué")
	ErrPaymentNotFound  = errors.New("paiement non trouvé")
	ErrInvalidAmount    = errors.New("montant invalide")
)

type PaymentService struct {
	db                 *gorm.DB
	orangeMoneyAPIURL  string
	orangeMoneyKey     string
	orangeMoneySecret  string
}

type CreatePaymentRequest struct {
	ListingID     string  `json:"listing_id,omitempty"`
	Amount        float64 `json:"amount" validate:"required,min=200"`
	PaymentMethod string  `json:"payment_method" validate:"required,oneof=orange_money wave free_money"`
	Phone         string  `json:"phone" validate:"required"`
}

type OrangeMoneyPaymentRequest struct {
	MerchantKey    string  `json:"merchant_key"`
	Currency       string  `json:"currency"`
	OrderID        string  `json:"order_id"`
	Amount         float64 `json:"amount"`
	ReturnURL      string  `json:"return_url"`
	CancelURL      string  `json:"cancel_url"`
	NotifURL       string  `json:"notif_url"`
	Lang           string  `json:"lang"`
	Reference      string  `json:"reference"`
	CustomerPhone  string  `json:"customer_phone"`
	CustomerEmail  string  `json:"customer_email,omitempty"`
}

type OrangeMoneyResponse struct {
	Status      string `json:"status"`
	PaymentURL  string `json:"payment_url"`
	OrderID     string `json:"order_id"`
	Message     string `json:"message"`
	Error       string `json:"error,omitempty"`
}

type PaymentWebhook struct {
	OrderID       string  `json:"order_id"`
	Status        string  `json:"status"`
	Amount        float64 `json:"amount"`
	TransactionID string  `json:"transaction_id"`
	Reference     string  `json:"reference"`
	Signature     string  `json:"signature"`
}

func NewPaymentService(db *gorm.DB, orangeAPIURL, orangeKey, orangeSecret string) *PaymentService {
	return &PaymentService{
		db:                db,
		orangeMoneyAPIURL: orangeAPIURL,
		orangeMoneyKey:    orangeKey,
		orangeMoneySecret: orangeSecret,
	}
}

// InitiatePayment initie un paiement
func (s *PaymentService) InitiatePayment(userID string, req *CreatePaymentRequest) (*models.Payment, *OrangeMoneyResponse, error) {
	// Créer l'enregistrement de paiement
	payment := models.Payment{
		UserID:        uuid.MustParse(userID),
		Amount:        req.Amount,
		Currency:      "XOF",
		PaymentMethod: req.PaymentMethod,
		Status:        "pending",
	}

	// Si c'est pour une annonce
	if req.ListingID != "" {
		listingUUID := uuid.MustParse(req.ListingID)
		payment.ListingID = &listingUUID
	}

	if err := s.db.Create(&payment).Error; err != nil {
		return nil, nil, fmt.Errorf("erreur création paiement: %w", err)
	}

	// Traitement selon le mode de paiement
	switch req.PaymentMethod {
	case "orange_money":
		return s.processOrangeMoneyPayment(&payment, req.Phone)
	case "wave":
		return s.processWavePayment(&payment, req.Phone)
	case "free_money":
		return s.processFreeMoneyPayment(&payment, req.Phone)
	default:
		return nil, nil, errors.New("méthode de paiement non supportée")
	}
}

// processOrangeMoneyPayment traite le paiement Orange Money
func (s *PaymentService) processOrangeMoneyPayment(payment *models.Payment, phone string) (*models.Payment, *OrangeMoneyResponse, error) {
	// Récupérer l'utilisateur pour l'email
	var user models.User
	if err := s.db.First(&user, payment.UserID).Error; err != nil {
		return nil, nil, fmt.Errorf("erreur récupération utilisateur: %w", err)
	}

	// Préparer la requête Orange Money
	orderID := payment.ID.String()
	reference := fmt.Sprintf("SENMARKET-%s", orderID[:8])

	orangeReq := OrangeMoneyPaymentRequest{
		MerchantKey:   s.orangeMoneyKey,
		Currency:      "XOF",
		OrderID:       orderID,
		Amount:        payment.Amount,
		ReturnURL:     "https://senmarket.sn/payment/success",
		CancelURL:     "https://senmarket.sn/payment/cancel",
		NotifURL:      "https://api.senmarket.sn/api/v1/payments/webhook/orange-money",
		Lang:          "fr",
		Reference:     reference,
		CustomerPhone: phone,
		CustomerEmail: user.Email,
	}

	// Appel API Orange Money
	response, err := s.callOrangeMoneyAPI(orangeReq)
	if err != nil {
		// Marquer le paiement comme échoué
		s.db.Model(payment).Updates(map[string]interface{}{
			"status":         "failed",
			"failure_reason": err.Error(),
		})
		return payment, nil, err
	}

	// Mettre à jour le paiement avec la référence
	s.db.Model(payment).Updates(map[string]interface{}{
		"transaction_id":   reference,
		"payment_provider": "orange_money",
	})

	return payment, response, nil
}

// callOrangeMoneyAPI appelle l'API Orange Money
func (s *PaymentService) callOrangeMoneyAPI(req OrangeMoneyPaymentRequest) (*OrangeMoneyResponse, error) {
	// En mode développement, simuler la réponse
	if s.orangeMoneyAPIURL == "" || s.orangeMoneyAPIURL == "sandbox" {
		return &OrangeMoneyResponse{
			Status:     "success",
			PaymentURL: fmt.Sprintf("https://sandbox.orange.money/pay?order_id=%s", req.OrderID),
			OrderID:    req.OrderID,
			Message:    "Paiement initié avec succès",
		}, nil
	}

	// Appel API réel
	jsonData, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("erreur sérialisation JSON: %w", err)
	}

	resp, err := http.Post(s.orangeMoneyAPIURL+"/payment/init", "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("erreur appel API Orange Money: %w", err)
	}
	defer resp.Body.Close()

	var orangeResp OrangeMoneyResponse
	if err := json.NewDecoder(resp.Body).Decode(&orangeResp); err != nil {
		return nil, fmt.Errorf("erreur décodage réponse: %w", err)
	}

	if orangeResp.Status != "success" {
		return nil, fmt.Errorf("échec Orange Money: %s", orangeResp.Error)
	}

	return &orangeResp, nil
}

// processWavePayment traite le paiement Wave (placeholder)
func (s *PaymentService) processWavePayment(payment *models.Payment, phone string) (*models.Payment, *OrangeMoneyResponse, error) {
	// TODO: Implémenter Wave API
	// Pour l'instant, simulation
	response := &OrangeMoneyResponse{
		Status:     "success",
		PaymentURL: fmt.Sprintf("https://wave.sn/pay?amount=%.0f&phone=%s", payment.Amount, phone),
		OrderID:    payment.ID.String(),
		Message:    "Redirection vers Wave",
	}
	
	s.db.Model(payment).Updates(map[string]interface{}{
		"payment_provider": "wave",
		"transaction_id":   fmt.Sprintf("WAVE-%s", payment.ID.String()[:8]),
	})

	return payment, response, nil
}

// processFreeMoneyPayment traite le paiement Free Money (placeholder)
func (s *PaymentService) processFreeMoneyPayment(payment *models.Payment, phone string) (*models.Payment, *OrangeMoneyResponse, error) {
	// TODO: Implémenter Free Money API
	response := &OrangeMoneyResponse{
		Status:     "success",
		PaymentURL: fmt.Sprintf("https://freemoney.sn/pay?amount=%.0f&phone=%s", payment.Amount, phone),
		OrderID:    payment.ID.String(),
		Message:    "Redirection vers Free Money",
	}
	
	s.db.Model(payment).Updates(map[string]interface{}{
		"payment_provider": "free_money",
		"transaction_id":   fmt.Sprintf("FREE-%s", payment.ID.String()[:8]),
	})

	return payment, response, nil
}

// HandleWebhook traite les webhooks de paiement
func (s *PaymentService) HandleWebhook(provider string, payload map[string]interface{}) error {
	switch provider {
	case "orange_money":
		return s.handleOrangeMoneyWebhook(payload)
	case "wave":
		return s.handleWaveWebhook(payload)
	case "free_money":
		return s.handleFreeMoneyWebhook(payload)
	default:
		return errors.New("provider non supporté")
	}
}

// handleOrangeMoneyWebhook traite les webhooks Orange Money - VERSION CORRIGÉE
func (s *PaymentService) handleOrangeMoneyWebhook(payload map[string]interface{}) error {
	orderID, ok := payload["order_id"].(string)
	if !ok {
		return errors.New("order_id manquant")
	}

	status, ok := payload["status"].(string)
	if !ok {
		return errors.New("status manquant")
	}

	// Récupérer le paiement - accepter à la fois UUID complet et transaction_id
	var payment models.Payment
	err := s.db.Where("id = ?", orderID).First(&payment).Error
	if err != nil {
		// Si pas trouvé par ID, essayer par transaction_id
		if len(orderID) >= 8 {
			err = s.db.Where("transaction_id LIKE ?", "SENMARKET-"+orderID[:8]+"%").First(&payment).Error
		}
		if err != nil {
			return fmt.Errorf("paiement non trouvé: %w", err)
		}
	}

	// Mettre à jour selon le statut
	updates := map[string]interface{}{
		"updated_at": time.Now(),
	}

	switch status {
	case "completed", "success":
		updates["status"] = "completed"
		updates["completed_at"] = time.Now()
		
		// Si c'est pour une annonce, l'activer
		if payment.ListingID != nil {
			s.db.Model(&models.Listing{}).Where("id = ?", payment.ListingID).
				Update("status", "active")
		}

	case "failed", "cancelled":
		updates["status"] = "failed"
		if reason, ok := payload["failure_reason"].(string); ok {
			updates["failure_reason"] = reason
		}

	case "pending":
		updates["status"] = "pending"
	}

	return s.db.Model(&payment).Updates(updates).Error
}

// handleWaveWebhook traite les webhooks Wave
func (s *PaymentService) handleWaveWebhook(payload map[string]interface{}) error {
	// TODO: Implémenter selon l'API Wave
	return s.handleOrangeMoneyWebhook(payload) // Temporaire
}

// handleFreeMoneyWebhook traite les webhooks Free Money
func (s *PaymentService) handleFreeMoneyWebhook(payload map[string]interface{}) error {
	// TODO: Implémenter selon l'API Free Money
	return s.handleOrangeMoneyWebhook(payload) // Temporaire
}

// GetPaymentByID récupère un paiement par ID
func (s *PaymentService) GetPaymentByID(paymentID string) (*models.Payment, error) {
	var payment models.Payment
	if err := s.db.Preload("User").Preload("Listing").
		Where("id = ?", paymentID).First(&payment).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaymentNotFound
		}
		return nil, fmt.Errorf("erreur récupération paiement: %w", err)
	}
	return &payment, nil
}

// GetUserPayments récupère les paiements d'un utilisateur avec relations complètes
func (s *PaymentService) GetUserPayments(userID string, page, limit int) ([]models.Payment, int64, error) {
	if page <= 0 {
		page = 1
	}
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	var payments []models.Payment
	var total int64

	// Comptage
	s.db.Model(&models.Payment{}).Where("user_id = ?", userID).Count(&total)

	// Récupération avec relations complètes
	offset := (page - 1) * limit
	err := s.db.Preload("User").
		Preload("Listing").
		Preload("Listing.Category").
		Preload("Listing.User", func(db *gorm.DB) *gorm.DB {
			return db.Select("id", "first_name", "last_name", "phone", "region", "is_verified")
		}).
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).Limit(limit).
		Find(&payments).Error

	return payments, total, err
}