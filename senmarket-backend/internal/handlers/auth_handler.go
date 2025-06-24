// internal/handlers/auth_handler.go
package handlers

import (
	"net/http"

	"senmarket/internal/auth"
	"senmarket/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type AuthHandler struct {
	authService *auth.Service
	validator   *validator.Validate
}

func NewAuthHandler(authService *auth.Service) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		validator:   validator.New(),
	}
}

// Register godoc
// @Summary Inscription d'un nouvel utilisateur
// @Description Crée un nouveau compte utilisateur
// @Tags auth
// @Accept json
// @Produce json
// @Param user body auth.RegisterRequest true "Données d'inscription"
// @Success 201 {object} auth.AuthResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 409 {object} map[string]interface{}
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req auth.RegisterRequest
	
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

	// Inscription
	response, err := h.authService.Register(&req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == auth.ErrUserExists {
			status = http.StatusConflict
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Inscription réussie. Un code de vérification a été envoyé par SMS.",
		"data": response,
	})
}

// Login godoc
// @Summary Connexion utilisateur
// @Description Authentifie un utilisateur
// @Tags auth
// @Accept json
// @Produce json
// @Param credentials body auth.LoginRequest true "Identifiants de connexion"
// @Success 200 {object} auth.AuthResponse
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req auth.LoginRequest
	
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

	// Connexion
	response, err := h.authService.Login(&req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == auth.ErrInvalidCredentials {
			status = http.StatusUnauthorized
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Connexion réussie",
		"data": response,
	})
}

// VerifyPhone godoc
// @Summary Vérification du numéro de téléphone
// @Description Vérifie le code SMS pour activer le compte
// @Tags auth
// @Accept json
// @Produce json
// @Param verification body auth.VerifyRequest true "Code de vérification"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/verify [post]
func (h *AuthHandler) VerifyPhone(c *gin.Context) {
	var req auth.VerifyRequest
	
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

	// Vérification
	if err := h.authService.VerifyPhone(&req); err != nil {
		status := http.StatusBadRequest
		if err == auth.ErrInvalidCode || err == auth.ErrCodeExpired {
			status = http.StatusBadRequest
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Téléphone vérifié avec succès",
	})
}

// SendVerificationCode godoc
// @Summary Renvoyer le code de vérification
// @Description Envoie un nouveau code de vérification SMS
// @Tags auth
// @Accept json
// @Produce json
// @Param phone body map[string]string true "Numéro de téléphone"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /auth/send-code [post]
func (h *AuthHandler) SendVerificationCode(c *gin.Context) {
	var req struct {
		Phone string `json:"phone" validate:"required"`
	}
	
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
			"details": req.Phone,
		})
		return
	}

	// Envoyer le code
	if err := h.authService.SendVerificationCode(req.Phone); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur envoi du code",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Code de vérification envoyé",
	})
}

// Profile godoc
// @Summary Profil utilisateur
// @Description Récupère le profil de l'utilisateur connecté
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User
// @Failure 401 {object} map[string]interface{}
// @Router /auth/profile [get]
func (h *AuthHandler) Profile(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération utilisateur",
		})
		return
	}

	userModel := user.(*models.User)
	c.JSON(http.StatusOK, gin.H{
		"data": userModel,
	})
}

// UpdateProfile godoc
// @Summary Mise à jour du profil
// @Description Met à jour le profil de l'utilisateur connecté
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param profile body map[string]interface{} true "Données à mettre à jour"
// @Success 200 {object} models.User
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /auth/profile [put]
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération utilisateur",
		})
		return
	}

	userModel := user.(*models.User)
	
	var updates map[string]interface{}
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Données invalides",
			"details": err.Error(),
		})
		return
	}

	// TODO: Implémenter la mise à jour du profil
	c.JSON(http.StatusOK, gin.H{
		"message": "Profil mis à jour",
		"data": userModel,
	})
}