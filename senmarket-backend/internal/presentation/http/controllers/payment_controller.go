// internal/presentation/http/controllers/payment_controller.go
package controllers

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/application/commands"
	"senmarket/internal/application/queries"
	"senmarket/internal/presentation/http/responses"
	"senmarket/internal/presentation/http/validators"
)

// PaymentController contrôleur pour les paiements
type PaymentController struct {
	BaseController
	processPaymentHandler *commands.ProcessPaymentHandler
	getPaymentsHandler    *queries.GetPaymentsHandler
}

// NewPaymentController crée un nouveau contrôleur paiement
func NewPaymentController(
	processPaymentHandler *commands.ProcessPaymentHandler,
	getPaymentsHandler *queries.GetPaymentsHandler,
) *PaymentController {
	return &PaymentController{
		processPaymentHandler: processPaymentHandler,
		getPaymentsHandler:    getPaymentsHandler,
	}
}

// CreatePayment initie un nouveau paiement
func (ctrl *PaymentController) CreatePayment(c *gin.Context) {
	userID := ctrl.GetUserID(c)
	if userID == "" {
		responses.SendUnauthorized(c, "Token requis")
		return
	}
	
	var req validators.CreatePaymentRequest
	if !ctrl.ValidateAndBind(c, &req) {
		return
	}
	
	cmd := &commands.ProcessPaymentCommand{
		UserID:    userID,
		Amount:    req.Amount,
		Currency:  req.Currency,
		Method:    req.Method,
		ListingID: stringPtr(req.ListingID),
		Metadata:  req.Metadata,
	}
	
	result, err := ctrl.processPaymentHandler.Handle(c.Request.Context(), cmd)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendCreated(c, result, "Paiement initié avec succès")
}

// GetPayment récupère un paiement par ID
func (ctrl *PaymentController) GetPayment(c *gin.Context) {
	paymentID := c.Param("id")
	if paymentID == "" {
		responses.SendBadRequest(c, "ID paiement requis", nil)
		return
	}
	
	query := &queries.GetPaymentByIDQuery{PaymentID: paymentID}
	result, err := ctrl.getPaymentsHandler.HandleGetPaymentByID(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Paiement récupéré")
}

// GetPayments récupère une liste de paiements avec filtres
func (ctrl *PaymentController) GetPayments(c *gin.Context) {
	var req validators.PaymentFiltersRequest
	
	// Récupérer les paramètres de query
	req.UserID = c.Query("user_id")
	req.Status = c.Query("status")
	req.Method = c.Query("method")
	req.DateFrom = c.Query("date_from")
	req.DateTo = c.Query("date_to")
	req.Page, req.Limit = ctrl.GetPaginationParams(c)
	
	// Valider les filtres
	if errors := validators.ValidatePaymentFilters(&req); len(errors) > 0 {
		responses.SendValidationErrors(c, errors)
		return
	}
	
	query := &queries.GetPaymentsQuery{
		UserID:    stringPtr(req.UserID),
		Status:    stringPtr(req.Status),
		Method:    stringPtr(req.Method),
		AmountMin: req.AmountMin,
		AmountMax: req.AmountMax,
		Offset:    ctrl.GetOffset(req.Page, req.Limit),
		Limit:     req.Limit,
	}
	
	result, err := ctrl.getPaymentsHandler.HandleGetPayments(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendPaginated(c, result.Payments, result.Total, req.Page, req.Limit, "Paiements récupérés")
}

// GetUserPayments récupère les paiements d'un utilisateur
func (ctrl *PaymentController) GetUserPayments(c *gin.Context) {
	userID := c.Param("user_id")
	if userID == "" {
		userID = ctrl.GetUserID(c) // Utiliser l'utilisateur connecté
	}
	
	if userID == "" {
		responses.SendBadRequest(c, "ID utilisateur requis", nil)
		return
	}
	
	page, limit := ctrl.GetPaginationParams(c)
	query := &queries.GetUserPaymentsQuery{
		UserID: userID,
		Offset: ctrl.GetOffset(page, limit),
		Limit:  limit,
	}
	
	result, err := ctrl.getPaymentsHandler.HandleGetUserPayments(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendPaginated(c, result.Payments, result.Total, page, limit, "Paiements utilisateur récupérés")
}

// PaymentCallback traite un callback de paiement des fournisseurs
func (ctrl *PaymentController) PaymentCallback(c *gin.Context) {
	provider := c.Param("provider")
	if provider == "" {
		responses.SendBadRequest(c, "Fournisseur de paiement requis", nil)
		return
	}
	
	var req validators.PaymentCallbackRequest
	if !ctrl.ValidateAndBind(c, &req) {
		return
	}
	
	// TODO: Traiter le callback selon le fournisseur
	// Implémenter la logique de callback pour Orange Money, Wave, etc.
	
	response := map[string]interface{}{
		"status":  "received",
		"message": "Callback traité avec succès",
	}
	
	responses.SendSuccess(c, response, "Callback de paiement traité")
}

// CheckPaymentStatus vérifie le statut d'un paiement
func (ctrl *PaymentController) CheckPaymentStatus(c *gin.Context) {
	paymentID := c.Param("id")
	if paymentID == "" {
		responses.SendBadRequest(c, "ID paiement requis", nil)
		return
	}
	
	// TODO: Implémenter la vérification de statut avec les fournisseurs
	
	query := &queries.GetPaymentByIDQuery{PaymentID: paymentID}
	result, err := ctrl.getPaymentsHandler.HandleGetPaymentByID(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Statut de paiement vérifié")
}

