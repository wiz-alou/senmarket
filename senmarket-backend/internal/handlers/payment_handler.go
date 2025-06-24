// internal/handlers/payment_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type PaymentHandler struct {
	paymentService *services.PaymentService
	validator      *validator.Validate
}

func NewPaymentHandler(paymentService *services.PaymentService) *PaymentHandler {
	return &PaymentHandler{
		paymentService: paymentService,
		validator:      validator.New(),
	}
}

// InitiatePayment godoc
// @Summary Initier un paiement
// @Description Initie un paiement via Orange Money, Wave ou Free Money
// @Tags payments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param payment body services.CreatePaymentRequest true "Données du paiement"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /payments/initiate [post]
func (h *PaymentHandler) InitiatePayment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	var req services.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Données invalides",
			"details": err.Error(),
		})
		return
	}

	// Validation
	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation échouée",
			"details": err.Error(),
		})
		return
	}

	// Initier le paiement
	payment, response, err := h.paymentService.InitiatePayment(userID.(string), &req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Paiement initié avec succès",
		"payment": payment,
		"payment_url": response.PaymentURL,
		"provider_response": response,
	})
}

// GetPayment godoc
// @Summary Détail d'un paiement
// @Description Récupère les détails d'un paiement
// @Tags payments
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID du paiement"
// @Success 200 {object} models.Payment
// @Failure 404 {object} map[string]interface{}
// @Router /payments/{id} [get]
func (h *PaymentHandler) GetPayment(c *gin.Context) {
	paymentID := c.Param("id")
	
	payment, err := h.paymentService.GetPaymentByID(paymentID)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrPaymentNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": payment,
	})
}

// GetMyPayments godoc
// @Summary Mes paiements
// @Description Récupère les paiements de l'utilisateur connecté
// @Tags payments
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /payments/my [get]
func (h *PaymentHandler) GetMyPayments(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	payments, total, err := h.paymentService.GetUserPayments(userID.(string), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Calcul des pages
	pages := int((total + int64(limit) - 1) / int64(limit))

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"payments": payments,
			"total":    total,
			"page":     page,
			"limit":    limit,
			"pages":    pages,
		},
	})
}

// OrangeMoneyWebhook godoc
// @Summary Webhook Orange Money
// @Description Traite les notifications de paiement Orange Money
// @Tags payments
// @Accept json
// @Produce json
// @Param webhook body map[string]interface{} true "Données du webhook"
// @Success 200 {object} map[string]interface{}
// @Router /payments/webhook/orange-money [post]
func (h *PaymentHandler) OrangeMoneyWebhook(c *gin.Context) {
	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payload invalide",
		})
		return
	}

	if err := h.paymentService.HandleWebhook("orange_money", payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
	})
}

// WaveWebhook godoc
// @Summary Webhook Wave
// @Description Traite les notifications de paiement Wave
// @Tags payments
// @Accept json
// @Produce json
// @Param webhook body map[string]interface{} true "Données du webhook"
// @Success 200 {object} map[string]interface{}
// @Router /payments/webhook/wave [post]
func (h *PaymentHandler) WaveWebhook(c *gin.Context) {
	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payload invalide",
		})
		return
	}

	if err := h.paymentService.HandleWebhook("wave", payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
	})
}

// FreeMoneyWebhook godoc
// @Summary Webhook Free Money
// @Description Traite les notifications de paiement Free Money
// @Tags payments
// @Accept json
// @Produce json
// @Param webhook body map[string]interface{} true "Données du webhook"
// @Success 200 {object} map[string]interface{}
// @Router /payments/webhook/free-money [post]
func (h *PaymentHandler) FreeMoneyWebhook(c *gin.Context) {
	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Payload invalide",
		})
		return
	}

	if err := h.paymentService.HandleWebhook("free_money", payload); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
	})
}

// PayForListing godoc
// @Summary Payer pour publier une annonce
// @Description Paiement de 200 FCFA pour publier une annonce
// @Tags payments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de l'annonce"
// @Param payment body map[string]string true "Méthode de paiement"
// @Success 200 {object} map[string]interface{}
// @Router /listings/{id}/pay [post]
func (h *PaymentHandler) PayForListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	listingID := c.Param("id")
	
	var req struct {
		PaymentMethod string `json:"payment_method" validate:"required,oneof=orange_money wave free_money"`
		Phone         string `json:"phone" validate:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Données invalides",
		})
		return
	}

	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation échouée",
			"details": err.Error(),
		})
		return
	}

	// Créer la requête de paiement
	paymentReq := services.CreatePaymentRequest{
		ListingID:     listingID,
		Amount:        200.00, // Prix fixe pour publier
		PaymentMethod: req.PaymentMethod,
		Phone:         req.Phone,
	}

	payment, response, err := h.paymentService.InitiatePayment(userID.(string), &paymentReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Paiement initié pour publier l'annonce",
		"amount": "200 FCFA",
		"payment": payment,
		"payment_url": response.PaymentURL,
	})
}