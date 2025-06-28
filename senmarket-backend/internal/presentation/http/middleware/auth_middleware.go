// internal/presentation/http/middleware/auth_middleware.go
package middleware

import (
	// "net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"senmarket/internal/application/services"
	"senmarket/internal/presentation/http/responses"
)

// AuthMiddleware middleware d'authentification
type AuthMiddleware struct {
	authService services.AuthService
}

// NewAuthMiddleware crée un nouveau middleware d'authentification
func NewAuthMiddleware(authService services.AuthService) *AuthMiddleware {
	return &AuthMiddleware{
		authService: authService,
	}
}

// RequireAuth middleware qui requiert une authentification
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := m.extractToken(c)
		if token == "" {
			responses.SendUnauthorized(c, "Token d'authentification requis")
			c.Abort()
			return
		}
		
		claims, err := m.authService.ValidateToken(token)
		if err != nil {
			responses.SendUnauthorized(c, "Token invalide: "+err.Error())
			c.Abort()
			return
		}
		
		// Injecter les informations utilisateur dans le contexte
		c.Set("user_id", claims.UserID)
		c.Set("user_phone", claims.Phone)
		c.Set("user_region", claims.Region)
		c.Set("user_verified", claims.IsVerified)
		c.Set("user_active", claims.IsActive)
		c.Set("user_claims", claims)
		
		c.Next()
	}
}

// OptionalAuth middleware d'authentification optionnelle
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := m.extractToken(c)
		if token != "" {
			claims, err := m.authService.ValidateToken(token)
			if err == nil {
				// Token valide, injecter les infos
				c.Set("user_id", claims.UserID)
				c.Set("user_phone", claims.Phone)
				c.Set("user_region", claims.Region)
				c.Set("user_verified", claims.IsVerified)
				c.Set("user_active", claims.IsActive)
				c.Set("user_claims", claims)
				c.Set("authenticated", true)
			}
		}
		
		c.Next()
	}
}

// RequireVerified middleware qui requiert un utilisateur vérifié
func (m *AuthMiddleware) RequireVerified() gin.HandlerFunc {
	return func(c *gin.Context) {
		// D'abord vérifier l'auth
		m.RequireAuth()(c)
		
		// Si déjà abort, ne pas continuer
		if c.IsAborted() {
			return
		}
		
		// Vérifier si l'utilisateur est vérifié
		verified, exists := c.Get("user_verified")
		if !exists || !verified.(bool) {
			responses.SendForbidden(c, "Compte non vérifié")
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// RequireAdmin middleware qui requiert des privilèges admin
func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// D'abord vérifier l'auth
		m.RequireAuth()(c)
		
		// Si déjà abort, ne pas continuer
		if c.IsAborted() {
			return
		}
		
		// TODO: Implémenter la logique admin
		// Pour l'instant, tous les utilisateurs vérifiés sont admins en dev
		verified, exists := c.Get("user_verified")
		if !exists || !verified.(bool) {
			responses.SendForbidden(c, "Privilèges administrateur requis")
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// extractToken extrait le token JWT de la requête
func (m *AuthMiddleware) extractToken(c *gin.Context) string {
	// 1. Vérifier l'en-tête Authorization
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		// Format: "Bearer <token>"
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			return parts[1]
		}
	}
	
	// 2. Vérifier le query parameter (pour les WebSocket ou cas spéciaux)
	token := c.Query("token")
	if token != "" {
		return token
	}
	
	// 3. Vérifier le cookie (optionnel)
	cookie, err := c.Cookie("auth_token")
	if err == nil && cookie != "" {
		return cookie
	}
	
	return ""
}

// GetUserID helper pour récupérer l'ID utilisateur depuis le contexte
func GetUserID(c *gin.Context) string {
	userID, exists := c.Get("user_id")
	if !exists {
		return ""
	}
	return userID.(string)
}

// GetUserClaims helper pour récupérer les claims utilisateur
func GetUserClaims(c *gin.Context) *services.UserClaims {
	claims, exists := c.Get("user_claims")
	if !exists {
		return nil
	}
	return claims.(*services.UserClaims)
}

// IsAuthenticated vérifie si l'utilisateur est authentifié
func IsAuthenticated(c *gin.Context) bool {
	_, exists := c.Get("user_id")
	return exists
}