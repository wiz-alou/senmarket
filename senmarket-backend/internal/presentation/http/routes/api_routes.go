// internal/presentation/http/routes/api_routes.go
package routes

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/application/services"
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
	"senmarket/internal/presentation/http/responses"
)

// RouterConfig configuration du routeur
type RouterConfig struct {
	UserController    *controllers.UserController
	ListingController *controllers.ListingController
	PaymentController *controllers.PaymentController
	HealthController  *controllers.HealthController
	AuthMiddleware    *middleware.AuthMiddleware
	AuthService       services.AuthService
}

// SetupRoutes configure toutes les routes de l'API
func SetupRoutes(r *gin.Engine, config *RouterConfig) {
	// Middlewares globaux
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.RequestID())
	r.Use(middleware.RateLimit())
	
	// Injecter le service d'auth dans toutes les routes
	r.Use(func(c *gin.Context) {
		c.Set("auth_service", config.AuthService)
		c.Next()
	})
	
	// Routes de santé (pas de rate limiting)
	r.GET("/health", config.HealthController.HealthCheck)
	r.GET("/health/ready", config.HealthController.ReadinessCheck)
	r.GET("/health/live", config.HealthController.LivenessCheck)
	r.GET("/health/metrics", config.HealthController.MetricsCheck)
	
	// Routes statiques pour compatibilité
	setupStaticRoutes(r)
	
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
		
		// 🔧 SUPPRIMÉ: setupAPIStaticRoutes(api) - causait le conflit
	}
}

// setupStaticRoutes pour maintenir la compatibilité (régions seulement)
func setupStaticRoutes(r *gin.Engine) {
	// Route regions directe (comme dans l'ancienne architecture)
	r.GET("/api/v1/regions", func(c *gin.Context) {
		regions := []map[string]interface{}{
			{"id": "dakar", "name": "Dakar", "code": "DK"},
			{"id": "thies", "name": "Thiès", "code": "TH"},
			{"id": "saint-louis", "name": "Saint-Louis", "code": "SL"},
			{"id": "diourbel", "name": "Diourbel", "code": "DB"},
			{"id": "louga", "name": "Louga", "code": "LG"},
			{"id": "tambacounda", "name": "Tambacounda", "code": "TC"},
			{"id": "kaolack", "name": "Kaolack", "code": "KL"},
			{"id": "kolda", "name": "Kolda", "code": "KD"},
			{"id": "ziguinchor", "name": "Ziguinchor", "code": "ZG"},
			{"id": "fatick", "name": "Fatick", "code": "FK"},
			{"id": "kaffrine", "name": "Kaffrine", "code": "KF"},
			{"id": "kedougou", "name": "Kédougou", "code": "KE"},
			{"id": "matam", "name": "Matam", "code": "MT"},
			{"id": "sedhiou", "name": "Sédhiou", "code": "SE"},
		}
		responses.SendSuccess(c, regions, "Régions du Sénégal")
	})
	
	// Route categories statique
	r.GET("/api/v1/categories", func(c *gin.Context) {
		categories := []map[string]interface{}{
			{"id": 1, "name": "Véhicules", "slug": "vehicules", "icon": "car"},
			{"id": 2, "name": "Immobilier", "slug": "immobilier", "icon": "home"},
			{"id": 3, "name": "Emploi", "slug": "emploi", "icon": "briefcase"},
			{"id": 4, "name": "Électronique", "slug": "electronique", "icon": "smartphone"},
			{"id": 5, "name": "Mode", "slug": "mode", "icon": "shirt"},
			{"id": 6, "name": "Maison & Jardin", "slug": "maison-jardin", "icon": "sofa"},
			{"id": 7, "name": "Loisirs", "slug": "loisirs", "icon": "gamepad2"},
			{"id": 8, "name": "Services", "slug": "services", "icon": "tools"},
		}
		responses.SendSuccess(c, categories, "Catégories disponibles")
	})
}

// SetupAuthRoutes configure les routes d'authentification
func SetupAuthRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	auth := rg.Group("/auth")
	{
		auth.POST("/register", config.UserController.CreateUser)
		
		// Login JWT complet
		auth.POST("/login", func(c *gin.Context) {
			var req struct {
				Phone string `json:"phone" validate:"required"`
			}
			
			if err := c.ShouldBindJSON(&req); err != nil {
				responses.SendBadRequest(c, "Format de requête invalide", err.Error())
				return
			}
			
			if req.Phone == "" {
				responses.SendBadRequest(c, "Numéro de téléphone requis", nil)
				return
			}
			
			// Utiliser le service d'authentification
			authService := c.MustGet("auth_service").(services.AuthService)
			loginResponse, err := authService.Login(c.Request.Context(), req.Phone)
			if err != nil {
				responses.SendDomainError(c, err)
				return
			}
			
			responses.SendSuccess(c, loginResponse, "Connexion réussie")
		})
		
		auth.POST("/verify", config.UserController.VerifyUser)
		
		// Refresh token
		auth.POST("/refresh", func(c *gin.Context) {
			var req struct {
				RefreshToken string `json:"refresh_token" validate:"required"`
			}
			
			if err := c.ShouldBindJSON(&req); err != nil {
				responses.SendBadRequest(c, "Format de requête invalide", err.Error())
				return
			}
			
			authService := c.MustGet("auth_service").(services.AuthService)
			loginResponse, err := authService.RefreshToken(c.Request.Context(), req.RefreshToken)
			if err != nil {
				responses.SendUnauthorized(c, "Refresh token invalide")
				return
			}
			
			responses.SendSuccess(c, loginResponse, "Token rafraîchi")
		})
		
		// Logout et profil
		auth.POST("/logout", config.AuthMiddleware.RequireAuth(), func(c *gin.Context) {
			// Pour JWT, le logout côté serveur est optionnel
			// Le client supprime simplement le token
			responses.SendSuccess(c, nil, "Déconnexion réussie")
		})
		
		auth.GET("/me", config.AuthMiddleware.RequireAuth(), func(c *gin.Context) {
			userID := middleware.GetUserID(c)
			claims := middleware.GetUserClaims(c)
			
			responses.SendSuccess(c, gin.H{
				"user_id":     userID,
				"phone":       claims.Phone,
				"region":      claims.Region,
				"is_verified": claims.IsVerified,
				"is_active":   claims.IsActive,
			}, "Profil utilisateur")
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

// SetupListingRoutes configure les routes annonces - VERSION CORRIGÉE
func SetupListingRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	listings := rg.Group("/listings")
	
	// Rate limiting spécifique aux annonces
	listings.Use(middleware.RateLimitByEndpoint(50, 60))
	
	{
		// 🔧 AJOUTÉ: Routes publiques manquantes
		listings.GET("", config.ListingController.GetListings)           // GET /api/v1/listings
		listings.GET("/:id", config.ListingController.GetListing)        // GET /api/v1/listings/:id
		listings.GET("/search", config.ListingController.SearchListings) // GET /api/v1/listings/search
		
		// Routes protégées pour création/modification
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
		// Routes publiques (callbacks des fournisseurs)
		public := payments.Group("")
		{
			public.POST("/callback/:provider", config.PaymentController.PaymentCallback)
			public.GET("/methods", func(c *gin.Context) {
				methods := []map[string]interface{}{
					{"id": "orange_money", "name": "Orange Money", "icon": "orange"},
					{"id": "wave", "name": "Wave", "icon": "wave"},
					{"id": "free_money", "name": "Free Money", "icon": "free"},
				}
				responses.SendSuccess(c, methods, "Méthodes de paiement")
			})
		}
		
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