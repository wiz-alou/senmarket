// internal/presentation/http/routes/api_routes.go
package routes

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
)

// RouterConfig configuration du routeur
type RouterConfig struct {
	UserController    *controllers.UserController
	ListingController *controllers.ListingController
	PaymentController *controllers.PaymentController
	HealthController  *controllers.HealthController
	AuthMiddleware    *middleware.AuthMiddleware
}

// SetupRoutes configure toutes les routes de l'API
func SetupRoutes(r *gin.Engine, config *RouterConfig) {
	// Middlewares globaux
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.RequestID())
	r.Use(middleware.RateLimit())
	
	// Routes de santé (pas de rate limiting)
	r.GET("/health", config.HealthController.HealthCheck)
	r.GET("/health/ready", config.HealthController.ReadinessCheck)
	r.GET("/health/live", config.HealthController.LivenessCheck)
	r.GET("/health/metrics", config.HealthController.MetricsCheck)
	
	// API v1
	api := r.Group("/api/v1")
	{
		// Routes d'authentification
		SetupAuthRoutes(api, config)
		
		// Routes utilisateurs
		SetupUserRoutes(api, config)
		
		// Routes annonces
		SetupListingRoutes(api, config)
		
		// Routes paiements
		SetupPaymentRoutes(api, config)
	}
}

// SetupAuthRoutes configure les routes d'authentification
func SetupAuthRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	auth := rg.Group("/auth")
	{
		auth.POST("/register", config.UserController.CreateUser)
		auth.POST("/login", func(c *gin.Context) {
			// TODO: Implémenter la logique de login
			c.JSON(200, gin.H{"message": "Login endpoint - TODO"})
		})
		auth.POST("/verify", config.UserController.VerifyUser)
		auth.POST("/refresh", func(c *gin.Context) {
			// TODO: Implémenter le refresh token
			c.JSON(200, gin.H{"message": "Refresh token endpoint - TODO"})
		})
		auth.POST("/logout", config.AuthMiddleware.RequireAuth(), func(c *gin.Context) {
			// TODO: Implémenter la logique de logout
			c.JSON(200, gin.H{"message": "Logout successful"})
		})
	}
}

// SetupUserRoutes configure les routes utilisateurs
func SetupUserRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	users := rg.Group("/users")
	{
		// Routes publiques
		users.GET("/phone", config.UserController.GetUserByPhone)
		
		// Routes protégées
		protected := users.Group("", config.AuthMiddleware.RequireAuth())
		{
			protected.GET("/me", config.UserController.GetCurrentUser)
			protected.GET("/me/stats", config.UserController.GetUserStats)
			protected.GET("/me/quota", config.UserController.GetUserQuota)
			protected.GET("/:id", config.UserController.GetUser)
			protected.GET("/:id/stats", config.UserController.GetUserStats)
		}
		
		// Routes admin
		admin := users.Group("", config.AuthMiddleware.RequireAuth(), config.AuthMiddleware.RequireAdmin())
		{
			admin.PUT("/:id/quota", config.UserController.UpdateUserQuota)
		}
	}
}

// SetupListingRoutes configure les routes annonces
func SetupListingRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	listings := rg.Group("/listings")
	
	// Appliquer rate limiting spécifique aux annonces
	listings.Use(middleware.RateLimitByEndpoint(50, 60))
	
	{
		// Routes publiques
		listings.GET("", config.ListingController.GetListings)
		listings.GET("/search", config.ListingController.SearchListings)
		listings.GET("/promoted", config.ListingController.GetPromoted)
		listings.GET("/recent", config.ListingController.GetRecent)
		listings.GET("/:id", config.ListingController.GetListing)
		
		// Routes protégées
		protected := listings.Group("", config.AuthMiddleware.RequireAuth())
		{
			protected.POST("", config.ListingController.CreateListing)
			protected.PUT("/:id", config.ListingController.UpdateListing)
			protected.DELETE("/:id", config.ListingController.DeleteListing)
			protected.POST("/:id/publish", config.ListingController.PublishListing)
			protected.GET("/user/:user_id", config.ListingController.GetUserListings)
			protected.GET("/me", config.ListingController.GetUserListings)
		}
	}
}

// SetupPaymentRoutes configure les routes paiements
func SetupPaymentRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	payments := rg.Group("/payments")
	
	// Rate limiting strict pour les paiements
	payments.Use(middleware.RateLimitByUser(10, 60))
	
	{
		// Routes publiques (callbacks)
		payments.POST("/callback/:provider", config.PaymentController.PaymentCallback)
		payments.GET("/methods", func(c *gin.Context) {
			methods := []map[string]interface{}{
				{
					"id":          "orange_money",
					"name":        "Orange Money",
					"description": "Paiement via Orange Money",
					"available":   true,
				},
				{
					"id":          "wave",
					"name":        "Wave",
					"description": "Paiement via Wave",
					"available":   true,
				},
			}
			c.JSON(200, gin.H{
				"success": true,
				"data":    methods,
			})
		})
		
		// Routes protégées
		protected := payments.Group("", config.AuthMiddleware.RequireAuth())
		{
			protected.POST("", config.PaymentController.CreatePayment)
			protected.GET("", config.PaymentController.GetPayments)
			protected.GET("/:id", config.PaymentController.GetPayment)
			protected.GET("/:id/status", config.PaymentController.CheckPaymentStatus)
			protected.GET("/user/:user_id", config.PaymentController.GetUserPayments)
			protected.GET("/me", config.PaymentController.GetUserPayments)
		}
	}
}
