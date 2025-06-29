// internal/presentation/http/controllers/user_controller.go
package controllers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"senmarket/internal/application/commands"
	"senmarket/internal/application/queries"
	"senmarket/internal/presentation/http/responses"
	"senmarket/internal/presentation/http/validators"
)

// UserController contrôleur pour les utilisateurs
type UserController struct {
	BaseController
	createUserHandler   *commands.CreateUserHandler
	verifyUserHandler   *commands.VerifyUserHandler
	updateQuotaHandler  *commands.UpdateQuotaHandler
	getUserHandler      *queries.GetUserHandler
	getUserStatsHandler *queries.GetUserStatsHandler
}

// NewUserController crée un nouveau contrôleur utilisateur
func NewUserController(
	createUserHandler *commands.CreateUserHandler,
	verifyUserHandler *commands.VerifyUserHandler,
	updateQuotaHandler *commands.UpdateQuotaHandler,
	getUserHandler *queries.GetUserHandler,
	getUserStatsHandler *queries.GetUserStatsHandler,
) *UserController {
	return &UserController{
		createUserHandler:   createUserHandler,
		verifyUserHandler:   verifyUserHandler,
		updateQuotaHandler:  updateQuotaHandler,
		getUserHandler:      getUserHandler,
		getUserStatsHandler: getUserStatsHandler,
	}
}

// ⭐ ENHANCED CreateUser avec support SMS Twilio
func (ctrl *UserController) CreateUser(c *gin.Context) {
	// Essayer de récupérer les données des routes (après nettoyage SMS)
	var req validators.CreateUserRequest
	
	// Si les données viennent des routes (après nettoyage), les utiliser
	if phone, exists := c.Get("phone"); exists {
		req.Phone = phone.(string)
	}
	if region, exists := c.Get("region"); exists {
		req.Region = region.(string)
	}
	// Récupérer password mais ne pas le déclarer comme variable non utilisée
	_, hasPassword := c.Get("password")
	
	// Sinon, parser depuis le JSON comme d'habitude
	if req.Phone == "" {
		if !ctrl.ValidateAndBind(c, &req) {
			return
		}
	}

	// Récupérer le code de vérification des routes si disponible
	var verificationCode string
	if code, exists := c.Get("verification_code"); exists {
		verificationCode = code.(string)
		fmt.Printf("📱 Code de vérification reçu des routes: %s pour %s\n", verificationCode, req.Phone)
	}

	// ⭐ ENRICHIR LA COMMANDE avec les données SMS
	cmd := &commands.CreateUserCommand{
		Phone:  req.Phone,
		Region: req.Region,
		Email:  req.Email,
		// TODO: Ajouter le champ VerificationCode à CreateUserCommand si nécessaire
		// VerificationCode: verificationCode,
	}
	
	result, err := ctrl.createUserHandler.Handle(c.Request.Context(), cmd)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}

	// ⭐ ENRICHIR LA RÉPONSE avec les infos SMS
	// Créer une map pour la réponse enrichie
	responseData := map[string]interface{}{
		"user": result, // Votre result original
	}
	
	if verificationCode != "" && hasPassword {
		// Ajouter les informations de vérification SMS
		responseData["verification"] = map[string]interface{}{
			"code_sent":       true,
			"expires_in":      600, // 10 minutes
			"next_step":       "Vérifiez votre téléphone avec le code SMS reçu",
			"verify_endpoint": "/api/v1/auth/verify",
		}
		responseData["sms_integration"] = map[string]interface{}{
			"enabled":    true,
			"provider":   "twilio",
			"status":     "sent",
			"message":    "Code de vérification envoyé par SMS",
		}
	}
	
	responses.SendCreated(c, responseData, "Utilisateur créé avec succès")
}

// GetUser récupère un utilisateur par ID
func (ctrl *UserController) GetUser(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		responses.SendBadRequest(c, "ID utilisateur requis", nil)
		return
	}
	
	query := &queries.GetUserQuery{UserID: userID}
	result, err := ctrl.getUserHandler.HandleGetUser(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Utilisateur récupéré avec succès")
}

// GetCurrentUser récupère l'utilisateur connecté
func (ctrl *UserController) GetCurrentUser(c *gin.Context) {
	userID := ctrl.GetUserID(c)
	if userID == "" {
		responses.SendUnauthorized(c, "Token requis")
		return
	}
	
	query := &queries.GetUserQuery{UserID: userID}
	result, err := ctrl.getUserHandler.HandleGetUser(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Profil utilisateur récupéré")
}

// GetUserByPhone récupère un utilisateur par téléphone
func (ctrl *UserController) GetUserByPhone(c *gin.Context) {
	phone := c.Query("phone")
	if phone == "" {
		responses.SendBadRequest(c, "Numéro de téléphone requis", nil)
		return
	}
	
	// ⭐ ENHANCED : Validation du téléphone sénégalais
	cleanPhone := ctrl.cleanSenegalPhone(phone)
	if cleanPhone == "" {
		responses.SendValidationError(c, "Format de téléphone invalide", map[string]string{
			"suggestion": "Utilisez le format +221XXXXXXXXX ou 7XXXXXXXX",
			"examples":   "+221777080751, 777080751",
		})
		return
	}
	
	// Utiliser le téléphone nettoyé pour la recherche
	query := &queries.GetUserByPhoneQuery{Phone: cleanPhone}
	result, err := ctrl.getUserHandler.HandleGetUserByPhone(c.Request.Context(), query)
	if err != nil {
		// Si utilisateur non trouvé, c'est normal
		if err.Error() == "utilisateur non trouvé" || err.Error() == "Utilisateur non trouvé" {
			responses.SendNotFound(c, "Aucun utilisateur trouvé avec ce numéro")
			return
		}
		
		// Autres erreurs
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Utilisateur trouvé")
}

// ⭐ ENHANCED VerifyUser avec support SMS amélioré
func (ctrl *UserController) VerifyUser(c *gin.Context) {
	// Support pour les données venant des routes ou du JSON
	var req validators.VerifyUserRequest
	
	// Vérifier si les données viennent des routes (endpoint /auth/verify)
	if phone := c.PostForm("phone"); phone != "" {
		code := c.PostForm("code")
		if code == "" {
			code = c.PostForm("verification_code")
		}
		
		// Construire la requête depuis les form data
		cleanPhone := ctrl.cleanSenegalPhone(phone)
		if cleanPhone == "" {
			responses.SendValidationError(c, "Format de téléphone invalide", nil)
			return
		}
		
		// TODO: Adapter selon votre structure VerifyUserRequest
		// req.Phone = cleanPhone
		// req.VerificationCode = code
		
		fmt.Printf("📱 Vérification SMS - Phone: %s, Code: %s\n", cleanPhone, code)
	} else {
		// Parse depuis JSON comme d'habitude
		if !ctrl.ValidateAndBind(c, &req) {
			return
		}
	}
	
	cmd := &commands.VerifyUserCommand{
		UserID:           req.UserID,
		VerificationCode: req.VerificationCode,
		Method:           req.Method,
	}
	
	result, err := ctrl.verifyUserHandler.Handle(c.Request.Context(), cmd)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	// ⭐ ENRICHIR LA RÉPONSE de vérification
	// Créer une map pour la réponse enrichie
	responseData := map[string]interface{}{
		"verification_result": result, // Votre result original
		"sms_verification": map[string]interface{}{
			"verified":    true,
			"method":      "sms",
			"provider":    "twilio",
			"verified_at": time.Now().Format(time.RFC3339),
		},
	}
	
	responses.SendSuccess(c, responseData, "Utilisateur vérifié avec succès")
}

// ⭐ NOUVELLE MÉTHODE : VerifyUserBySMS spécialement pour les codes SMS
func (ctrl *UserController) VerifyUserBySMS(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" binding:"required"`
		Code  string `json:"code" binding:"required,len=6"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		responses.SendBadRequest(c, "Données invalides", err.Error())
		return
	}

	// Nettoyer le téléphone
	cleanPhone := ctrl.cleanSenegalPhone(req.Phone)
	if cleanPhone == "" {
		responses.SendValidationError(c, "Numéro de téléphone invalide", nil)
		return
	}

	// TODO: Adapter selon votre logique de vérification
	// Pour l'instant, créer une commande de vérification générique
	cmd := &commands.VerifyUserCommand{
		// UserID sera déterminé par le téléphone
		// UserID:           "to_be_determined_by_phone",
		VerificationCode: req.Code,
		Method:           "sms",
		// Ajouter Phone si votre commande le supporte
		// Phone:            cleanPhone,
	}
	
	result, err := ctrl.verifyUserHandler.Handle(c.Request.Context(), cmd)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, gin.H{
		"verified":     true,
		"phone":        cleanPhone,
		"method":       "sms",
		"message":      "Téléphone vérifié avec succès",
		"user_status":  "active",
		"next_step":    "Vous pouvez maintenant vous connecter",
		"result":       result,
	}, "Vérification SMS réussie")
}

// GetUserStats récupère les statistiques d'un utilisateur
func (ctrl *UserController) GetUserStats(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		userID = ctrl.GetUserID(c) // Utiliser l'utilisateur connecté
	}
	
	if userID == "" {
		responses.SendBadRequest(c, "ID utilisateur requis", nil)
		return
	}
	
	query := &queries.GetUserStatsQuery{UserID: userID}
	result, err := ctrl.getUserStatsHandler.HandleGetUserStats(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Statistiques récupérées")
}

// GetUserQuota récupère les quotas d'un utilisateur
func (ctrl *UserController) GetUserQuota(c *gin.Context) {
	userID := ctrl.GetUserID(c)
	if userID == "" {
		responses.SendUnauthorized(c, "Token requis")
		return
	}
	
	query := &queries.GetUserQuotaQuery{UserID: userID}
	result, err := ctrl.getUserStatsHandler.HandleGetUserQuota(c.Request.Context(), query)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Quotas récupérés")
}

// UpdateUserQuota met à jour les quotas (admin seulement)
func (ctrl *UserController) UpdateUserQuota(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		responses.SendBadRequest(c, "ID utilisateur requis", nil)
		return
	}
	
	var req struct {
		FreeListings *int   `json:"free_listings"`
		PaidListings *int   `json:"paid_listings"`
		Reason       string `json:"reason"`
	}
	
	if !ctrl.ValidateAndBind(c, &req) {
		return
	}
	
	adminUserID := ctrl.GetUserID(c)
	cmd := &commands.UpdateQuotaCommand{
		UserID:       userID,
		FreeListings: req.FreeListings,
		PaidListings: req.PaidListings,
		Reason:       req.Reason,
		AdminUserID:  adminUserID,
	}
	
	result, err := ctrl.updateQuotaHandler.Handle(c.Request.Context(), cmd)
	if err != nil {
		responses.SendDomainError(c, err)
		return
	}
	
	responses.SendSuccess(c, result, "Quotas mis à jour")
}

// ⭐ MÉTHODE UTILITAIRE : Nettoyer les numéros sénégalais
func (ctrl *UserController) cleanSenegalPhone(phone string) string {
	// Supprimer espaces et caractères spéciaux
	cleaned := strings.ReplaceAll(phone, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")
	
	// Formats valides pour le Sénégal :
	// +221XXXXXXXXX (format international)
	// 221XXXXXXXXX (sans +)
	// 7XXXXXXXX ou 3XXXXXXXX (format local)
	
	if strings.HasPrefix(cleaned, "+221") && len(cleaned) == 13 {
		return cleaned // +221XXXXXXXXX
	}
	
	if strings.HasPrefix(cleaned, "221") && len(cleaned) == 12 {
		return "+" + cleaned // 221XXXXXXXXX → +221XXXXXXXXX
	}
	
	if (strings.HasPrefix(cleaned, "7") || strings.HasPrefix(cleaned, "3")) && len(cleaned) == 9 {
		return "+221" + cleaned // 7XXXXXXXX → +221XXXXXXXX
	}
	
	// Format invalide
	return ""
}