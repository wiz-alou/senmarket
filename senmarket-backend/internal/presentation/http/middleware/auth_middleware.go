// internal/presentation/http/middleware/auth_middleware.go
package middleware

import (
	"strings"
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/responses"
)

// AuthMiddleware middleware d'authentification JWT
type AuthMiddleware struct {
	// TODO: Ajouter JWTService quand il sera migré
}

// NewAuthMiddleware crée un nouveau middleware d'authentification
func NewAuthMiddleware() *AuthMiddleware {
	return &AuthMiddleware{}
}

// RequireAuth vérifie que l'utilisateur est authentifié
func (m *AuthMiddleware) RequireAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := m.extractToken(c)
		if token == "" {
			responses.SendUnauthorized(c, "Token d'authentification requis")
			c.Abort()
			return
		}
		
		// TODO: Valider le token JWT
		// Pour l'instant, on simule une validation
		userID := m.validateToken(token)
		if userID == "" {
			responses.SendUnauthorized(c, "Token invalide")
			c.Abort()
			return
		}
		
		// Ajouter l'ID utilisateur au contexte
		c.Set("user_id", userID)
		c.Set("token", token)
		
		c.Next()
	}
}

// OptionalAuth authentification optionnelle
func (m *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := m.extractToken(c)
		if token != "" {
			userID := m.validateToken(token)
			if userID != "" {
				c.Set("user_id", userID)
				c.Set("token", token)
			}
		}
		
		c.Next()
	}
}

// RequireAdmin vérifie que l'utilisateur est administrateur
func (m *AuthMiddleware) RequireAdmin() gin.HandlerFunc {
	return func(c *gin.Context) {
		// TODO: Vérifier les permissions admin
		// Pour l'instant, on simule
		
		userID := c.GetString("user_id")
		if userID == "" {
			responses.SendUnauthorized(c, "Authentification requise")
			c.Abort()
			return
		}
		
		// TODO: Vérifier si l'utilisateur est admin
		isAdmin := m.checkAdminPermissions(userID)
		if !isAdmin {
			responses.SendForbidden(c, "Permissions administrateur requises")
			c.Abort()
			return
		}
		
		c.Next()
	}
}

// extractToken extrait le token du header Authorization
func (m *AuthMiddleware) extractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}
	
	// Format: "Bearer <token>"
	if strings.HasPrefix(authHeader, "Bearer ") {
		return authHeader[7:]
	}
	
	return ""
}

// validateToken valide un token JWT (simulation)
func (m *AuthMiddleware) validateToken(token string) string {
	// TODO: Implémenter la validation JWT réelle
	// Pour l'instant, on simule en retournant un userID fixe
	if token == "valid-token" {
		return "user-123"
	}
	return ""
}

// checkAdminPermissions vérifie les permissions admin (simulation)
func (m *AuthMiddleware) checkAdminPermissions(userID string) bool {
	// TODO: Implémenter la vérification des permissions réelles
	// Pour l'instant, on simule
	return userID == "admin-user"
}
