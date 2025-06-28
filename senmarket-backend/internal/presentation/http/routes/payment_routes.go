// internal/presentation/http/routes/payment_routes.go
package routes

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
)

// PaymentRoutes gestionnaire des routes paiements
type PaymentRoutes struct {
	paymentController *controllers.PaymentController
	authMiddleware    *middleware.AuthMiddleware
}

// NewPaymentRoutes crée un nouveau gestionnaire de routes paiements
func NewPaymentRoutes(paymentController *controllers.PaymentController, authMiddleware *middleware.AuthMiddleware) *PaymentRoutes {
	return &PaymentRoutes{
		paymentController: paymentController,
		authMiddleware:    authMiddleware,
	}
}

// Setup configure les routes paiements
func (pr *PaymentRoutes) Setup(rg *gin.RouterGroup) {
	payments := rg.Group("/payments")
	
	// Rate limiting strict pour les paiements
	payments.Use(middleware.RateLimitByUser(10, 60)) // 10 req/min par utilisateur
	
	{
		// Routes publiques (callbacks des fournisseurs)
		public := payments.Group("")
		{
			public.POST("/callback/orange-money", pr.paymentController.PaymentCallback)
			public.POST("/callback/wave", pr.paymentController.PaymentCallback)
			public.POST("/callback/free-money", pr.paymentController.PaymentCallback)
			public.GET("/methods", pr.GetPaymentMethods)
		}
		
		// Routes protégées
		protected := payments.Group("", pr.authMiddleware.RequireAuth())
		{
			protected.POST("/", pr.paymentController.CreatePayment)
			protected.GET("/", pr.paymentController.GetPayments)
			protected.GET("/:id", pr.paymentController.GetPayment)
			protected.GET("/:id/status", pr.paymentController.CheckPaymentStatus)
			protected.POST("/:id/cancel", pr.CancelPayment)
			protected.GET("/me", pr.paymentController.GetUserPayments)
			protected.GET("/user/:user_id", pr.paymentController.GetUserPayments)
			
			// Statistiques utilisateur
			protected.GET("/me/stats", pr.GetUserPaymentStats)
		}
		
		// Routes admin
		admin := payments.Group("", pr.authMiddleware.RequireAuth(), pr.authMiddleware.RequireAdmin())
		{
			admin.GET("/admin/all", pr.GetAllPayments)
			admin.PUT("/:id/status", pr.UpdatePaymentStatus)
			admin.POST("/:id/refund", pr.RefundPayment)
			admin.GET("/admin/stats", pr.GetPaymentStats)
			admin.GET("/admin/revenue", pr.GetRevenueStats)
			admin.GET("/admin/methods-stats", pr.GetMethodStats)
		}
	}
}

// GetPaymentMethods récupère les méthodes de paiement disponibles
func (pr *PaymentRoutes) GetPaymentMethods(c *gin.Context) {
	methods := []map[string]interface{}{
		{
			"id":          "orange_money",
			"name":        "Orange Money",
			"description": "Paiement via Orange Money",
			"logo":        "/images/orange-money.png",
			"available":   true,
		},
		{
			"id":          "wave",
			"name":        "Wave",
			"description": "Paiement via Wave",
			"logo":        "/images/wave.png",
			"available":   true,
		},
		{
			"id":          "free_money",
			"name":        "Free Money",
			"description": "Paiement via Free Money",
			"logo":        "/images/free-money.png",
			"available":   true,
		},
	}
	
	c.JSON(200, gin.H{
		"success": true,
		"data":    methods,
		"message": "Méthodes de paiement disponibles",
	})
}

// CancelPayment annule un paiement
func (pr *PaymentRoutes) CancelPayment(c *gin.Context) {
	// TODO: Implémenter l'annulation de paiement
	c.JSON(200, gin.H{"message": "Cancel payment - TODO"})
}

// GetUserPaymentStats récupère les stats de paiement utilisateur
func (pr *PaymentRoutes) GetUserPaymentStats(c *gin.Context) {
	// TODO: Implémenter les stats utilisateur
	c.JSON(200, gin.H{"message": "User payment stats - TODO"})
}

// GetAllPayments récupère tous les paiements (admin)
func (pr *PaymentRoutes) GetAllPayments(c *gin.Context) {
	// TODO: Implémenter la liste admin des paiements
	c.JSON(200, gin.H{"message": "All payments admin - TODO"})
}

// UpdatePaymentStatus met à jour le statut d'un paiement (admin)
func (pr *PaymentRoutes) UpdatePaymentStatus(c *gin.Context) {
	// TODO: Implémenter la mise à jour de statut admin
	c.JSON(200, gin.H{"message": "Update payment status -TODO"})
}

// RefundPayment rembourse un paiement (admin)
func (pr *PaymentRoutes) RefundPayment(c *gin.Context) {
   // TODO: Implémenter le remboursement
   c.JSON(200, gin.H{"message": "Refund payment - TODO"})
}

// GetPaymentStats récupère les statistiques de paiements (admin)
func (pr *PaymentRoutes) GetPaymentStats(c *gin.Context) {
   // TODO: Implémenter les stats de paiements
   c.JSON(200, gin.H{"message": "Payment stats - TODO"})
}

// GetRevenueStats récupère les statistiques de revenus (admin)
func (pr *PaymentRoutes) GetRevenueStats(c *gin.Context) {
   // TODO: Implémenter les stats de revenus
   c.JSON(200, gin.H{"message": "Revenue stats - TODO"})
}

// GetMethodStats récupère les statistiques par méthode (admin)
func (pr *PaymentRoutes) GetMethodStats(c *gin.Context) {
   // TODO: Implémenter les stats par méthode
   c.JSON(200, gin.H{"message": "Method stats - TODO"})
}
