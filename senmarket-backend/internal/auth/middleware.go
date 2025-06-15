// internal/auth/middleware.go
package auth

import (
	"net/http"
	"strings"
	"senmarket/internal/models"
	"github.com/gin-gonic/gin"
)

type Middleware struct {
	jwtService *JWTService
	authService *Service
}

func NewMiddleware(jwtService *JWTService, authService *Service) *Middleware {
	return &Middleware{
		jwtService:  jwtService,
		authService: authService,
	}
}

// RequireAuth middleware qui exige une authentification
func (m *Middleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extraire le token du header Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token d'authentification requis",
			})
			c.Abort()
			return
		}

		// Vérifier le format "Bearer token"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Format de token invalide",
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Valider le token
		userID, err := m.jwtService.ValidateToken(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Token invalide",
			})
			c.Abort()
			return
		}

		// Récupérer l'utilisateur
		user, err := m.authService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"error": "Utilisateur non trouvé",
			})
			c.Abort()
			return
		}

		// Ajouter l'utilisateur au contexte
		c.Set("user", user)
		c.Set("user_id", userID)
		c.Next()
	}
}

// RequireVerifiedUser middleware qui exige un utilisateur vérifié
func (m *Middleware) RequireVerifiedUser() gin.HandlerFunc {
	return func(c *gin.Context) {
		// D'abord vérifier l'auth
		m.RequireAuth()(c)
		if c.IsAborted() {
			return
		}

		// Vérifier que l'utilisateur est vérifié
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Erreur récupération utilisateur",
			})
			c.Abort()
			return
		}

		userModel := user.(*models.User)
		if !userModel.IsVerified {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Compte non vérifié. Vérifiez votre téléphone.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}

// OptionalAuth middleware d'authentification optionnelle
func (m *Middleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		token := tokenParts[1]
		userID, err := m.jwtService.ValidateToken(token)
		if err != nil {
			c.Next()
			return
		}

		user, err := m.authService.GetUserByID(userID)
		if err != nil {
			c.Next()
			return
		}

		c.Set("user", user)
		c.Set("user_id", userID)
		c.Next()
	}
}