// internal/presentation/http/routes/auth_routes.go
package routes

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
	"senmarket/internal/presentation/http/responses"
	"senmarket/internal/presentation/http/validators"
)

// AuthRoutes gestionnaire des routes d'authentification
type AuthRoutes struct {
	userController *controllers.UserController
	authMiddleware *middleware.AuthMiddleware
}

// NewAuthRoutes crée un nouveau gestionnaire de routes auth
func NewAuthRoutes(userController *controllers.UserController, authMiddleware *middleware.AuthMiddleware) *AuthRoutes {
	return &AuthRoutes{
		userController: userController,
		authMiddleware: authMiddleware,
	}
}

// Setup configure les routes d'authentification
func (ar *AuthRoutes) Setup(rg *gin.RouterGroup) {
	auth := rg.Group("/auth")
	
	// Rate limiting pour les routes d'auth
	auth.Use(middleware.RateLimitByEndpoint(20, 300)) // 20 req/5min
	
	{
		auth.POST("/register", ar.Register)
		auth.POST("/login", ar.Login)
		auth.POST("/verify", ar.Verify)
		auth.POST("/resend-code", ar.ResendVerificationCode)
		auth.POST("/refresh", ar.RefreshToken)
		auth.POST("/logout", ar.authMiddleware.RequireAuth(), ar.Logout)
		auth.POST("/forgot-password", ar.ForgotPassword)
		auth.POST("/reset-password", ar.ResetPassword)
	}
}

// Register inscription d'un nouvel utilisateur
func (ar *AuthRoutes) Register(c *gin.Context) {
	ar.userController.CreateUser(c)
}

// Login connexion d'un utilisateur
func (ar *AuthRoutes) Login(c *gin.Context) {
	var req validators.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		responses.SendBadRequest(c, "Format de requête invalide", err.Error())
		return
	}
	
	if errors := validators.ValidateLogin(&req); len(errors) > 0 {
		responses.SendValidationErrors(c, errors)
		return
	}
	
	// TODO: Implémenter la logique de login complète
	// 1. Vérifier si l'utilisateur existe
	// 2. Générer un code de vérification SMS
	// 3. Retourner un token temporaire
	
	response := map[string]interface{}{
		"message":     "Code de vérification envoyé",
		"phone":       req.Phone,
		"expires_in":  300, // 5 minutes
		"temp_token":  "temp_token_placeholder",
	}
	
	responses.SendSuccess(c, response, "Code de connexion envoyé")
}

// Verify vérification du code
func (ar *AuthRoutes) Verify(c *gin.Context) {
	ar.userController.VerifyUser(c)
}

// ResendVerificationCode renvoie le code de vérification
func (ar *AuthRoutes) ResendVerificationCode(c *gin.Context) {
	var req struct {
		Phone  string `json:"phone" validate:"required,senegal_phone"`
		Method string `json:"method" validate:"required,oneof=sms email"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		responses.SendBadRequest(c, "Format de requête invalide", err.Error())
		return
	}
	
	// TODO: Implémenter la logique de renvoi de code
	
	responses.SendSuccess(c, nil, "Code de vérification renvoyé")
}

// RefreshToken renouvellement du token
func (ar *AuthRoutes) RefreshToken(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" validate:"required"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		responses.SendBadRequest(c, "Token de rafraîchissement requis", nil)
		return
	}
	
	// TODO: Implémenter la logique de refresh token
	
	response := map[string]interface{}{
		"access_token":  "new_access_token",
		"refresh_token": "new_refresh_token",
		"expires_in":    3600,
		"token_type":    "Bearer",
	}
	
	responses.SendSuccess(c, response, "Token renouvelé")
}

// Logout déconnexion
func (ar *AuthRoutes) Logout(c *gin.Context) {
	userID := c.GetString("user_id")
	token := c.GetString("token")
	
	// TODO: Invalider le token (blacklist, supprimer de Redis, etc.)
	_ = userID
	_ = token
	
	responses.SendSuccess(c, nil, "Déconnexion réussie")
}

// ForgotPassword mot de passe oublié
func (ar *AuthRoutes) ForgotPassword(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" validate:"required,senegal_phone"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		responses.SendBadRequest(c, "Numéro de téléphone requis", nil)
		return
	}
	
	// TODO: Implémenter la logique de mot de passe oublié
	
	responses.SendSuccess(c, nil, "Instructions envoyées par SMS")
}

// ResetPassword réinitialisation du mot de passe
func (ar *AuthRoutes) ResetPassword(c *gin.Context) {
	var req struct {
		Phone       string `json:"phone" validate:"required,senegal_phone"`
		Code        string `json:"code" validate:"required,len=6"`
		NewPassword string `json:"new_password" validate:"required,min=6"`
	}
	
	if err := c.ShouldBindJSON(&req); err != nil {
		responses.SendBadRequest(c, "Données de réinitialisation invalides", nil)
		return
	}
	
	// TODO: Implémenter la logique de réinitialisation
	
	responses.SendSuccess(c, nil, "Mot de passe réinitialisé avec succès")
}
