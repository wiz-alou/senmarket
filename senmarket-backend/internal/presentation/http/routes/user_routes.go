// internal/presentation/http/routes/user_routes.go
package routes

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
)

// UserRoutes gestionnaire des routes utilisateurs
type UserRoutes struct {
	userController *controllers.UserController
	authMiddleware *middleware.AuthMiddleware
}

// NewUserRoutes crée un nouveau gestionnaire de routes utilisateurs
func NewUserRoutes(userController *controllers.UserController, authMiddleware *middleware.AuthMiddleware) *UserRoutes {
	return &UserRoutes{
		userController: userController,
		authMiddleware: authMiddleware,
	}
}

// Setup configure les routes utilisateurs
func (ur *UserRoutes) Setup(rg *gin.RouterGroup) {
	users := rg.Group("/users")
	
	{
		// Routes publiques
		public := users.Group("")
		{
			public.GET("/phone", ur.userController.GetUserByPhone)
			public.GET("/:id/public", ur.GetPublicProfile)
		}
		
		// Routes protégées (utilisateur connecté)
		protected := users.Group("", ur.authMiddleware.RequireAuth())
		{
			protected.GET("/me", ur.userController.GetCurrentUser)
			protected.PUT("/me", ur.UpdateProfile)
			protected.GET("/me/stats", ur.userController.GetUserStats)
			protected.GET("/me/quota", ur.userController.GetUserQuota)
			protected.GET("/me/listings", ur.GetMyListings)
			protected.GET("/me/payments", ur.GetMyPayments)
			protected.GET("/me/dashboard", ur.GetDashboard)
			
			// Gestion du profil
			protected.PUT("/me/phone", ur.UpdatePhone)
			protected.PUT("/me/email", ur.UpdateEmail)
			protected.DELETE("/me", ur.DeleteAccount)
		}
		
		// Routes admin
		admin := users.Group("", ur.authMiddleware.RequireAuth(), ur.authMiddleware.RequireAdmin())
		{
			admin.GET("/", ur.GetAllUsers)
			admin.GET("/:id", ur.userController.GetUser)
			admin.GET("/:id/stats", ur.userController.GetUserStats)
			admin.PUT("/:id/quota", ur.userController.UpdateUserQuota)
			admin.PUT("/:id/status", ur.UpdateUserStatus)
			admin.DELETE("/:id", ur.AdminDeleteUser)
		}
	}
}

// GetPublicProfile récupère le profil public d'un utilisateur
func (ur *UserRoutes) GetPublicProfile(c *gin.Context) {
	// TODO: Implémenter le profil public (sans infos sensibles)
	c.JSON(200, gin.H{"message": "Public profile - TODO"})
}

// UpdateProfile met à jour le profil
func (ur *UserRoutes) UpdateProfile(c *gin.Context) {
	// TODO: Implémenter la mise à jour de profil
	c.JSON(200, gin.H{"message": "Update profile - TODO"})
}

// GetMyListings récupère les annonces de l'utilisateur connecté
func (ur *UserRoutes) GetMyListings(c *gin.Context) {
	// Rediriger vers le controller listings avec l'ID utilisateur
	c.JSON(200, gin.H{"message": "My listings - TODO"})
}

// GetMyPayments récupère les paiements de l'utilisateur connecté
func (ur *UserRoutes) GetMyPayments(c *gin.Context) {
	// Rediriger vers le controller payments avec l'ID utilisateur
	c.JSON(200, gin.H{"message": "My payments - TODO"})
}

// GetDashboard récupère le tableau de bord utilisateur
func (ur *UserRoutes) GetDashboard(c *gin.Context) {
	// TODO: Implémenter le dashboard utilisateur
	c.JSON(200, gin.H{"message": "User dashboard - TODO"})
}

// UpdatePhone met à jour le numéro de téléphone
func (ur *UserRoutes) UpdatePhone(c *gin.Context) {
	// TODO: Implémenter la mise à jour du téléphone avec vérification
	c.JSON(200, gin.H{"message": "Update phone - TODO"})
}

// UpdateEmail met à jour l'email
func (ur *UserRoutes) UpdateEmail(c *gin.Context) {
	// TODO: Implémenter la mise à jour de l'email avec vérification
	c.JSON(200, gin.H{"message": "Update email - TODO"})
}

// DeleteAccount supprime le compte utilisateur
func (ur *UserRoutes) DeleteAccount(c *gin.Context) {
	// TODO: Implémenter la suppression de compte avec confirmation
	c.JSON(200, gin.H{"message": "Delete account - TODO"})
}

// GetAllUsers récupère tous les utilisateurs (admin)
func (ur *UserRoutes) GetAllUsers(c *gin.Context) {
	// TODO: Implémenter la liste des utilisateurs avec pagination
	c.JSON(200, gin.H{"message": "All users - TODO"})
}

// UpdateUserStatus met à jour le statut d'un utilisateur (admin)
func (ur *UserRoutes) UpdateUserStatus(c *gin.Context) {
	// TODO: Implémenter la mise à jour de statut (actif/inactif/suspendu)
	c.JSON(200, gin.H{"message": "Update user status - TODO"})
}

// AdminDeleteUser supprime un utilisateur (admin)
func (ur *UserRoutes) AdminDeleteUser(c *gin.Context) {
	// TODO: Implémenter la suppression admin avec logging
	c.JSON(200, gin.H{"message": "Admin delete user - TODO"})
}
