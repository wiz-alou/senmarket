// internal/app/server.go
package app

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"senmarket/internal/auth"
	"senmarket/internal/config"
	"senmarket/internal/handlers"
	"senmarket/internal/models"
	"senmarket/internal/services"
	"senmarket/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Application struct {
	config          *config.Config
	db              *gorm.DB
	redis           *redis.Client
	router          *gin.Engine
	authService     *auth.Service
	jwtService      *auth.JWTService
	middleware      *auth.Middleware
	listingService  *services.ListingService
	categoryService *services.CategoryService
	paymentService  *services.PaymentService
	imageService    *services.ImageService
	contactService  *services.ContactService
	whatsappService *services.WhatsAppService  // ✨ NOUVEAU SERVICE WHATSAPP
}

func New(cfg *config.Config) *Application {
	// Initialiser la base de données
	db, err := config.NewDatabase(cfg.Database)
	if err != nil {
		log.Fatalf("Erreur initialisation base de données: %v", err)
	}

	// Initialiser Redis
	redisClient, err := config.NewRedis(cfg.Redis)
	if err != nil {
		log.Fatalf("Erreur initialisation Redis: %v", err)
	}

	// Configurer Gin selon l'environnement
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialiser les services
	jwtService := auth.NewJWTService(cfg.JWT.Secret, cfg.JWT.Expiry)
	smsService := utils.NewMockSMSService()
	
	// ✨ NOUVEAU : Service WhatsApp
	whatsappService := services.NewWhatsAppService(
		db,
		cfg.WhatsApp.APIToken,
		cfg.WhatsApp.APIURL,
		cfg.WhatsApp.BusinessNumber,
		cfg.WhatsApp.Environment,
		cfg.WhatsApp.Provider,
	)
	
	authService := auth.NewService(db, jwtService, smsService)
	authMiddleware := auth.NewMiddleware(jwtService, authService)
	listingService := services.NewListingService(db)
	categoryService := services.NewCategoryService(db)
	contactService := services.NewContactService(db)
	
	// Services paiements et images
	paymentService := services.NewPaymentService(
		db,
		os.Getenv("ORANGE_MONEY_API_URL"),
		os.Getenv("ORANGE_MONEY_MERCHANT_KEY"),
		os.Getenv("ORANGE_MONEY_MERCHANT_SECRET"),
	)
	imageService := services.NewImageService("uploads", "http://localhost:8080")

	app := &Application{
		config:          cfg,
		db:              db,
		redis:           redisClient,
		router:          gin.New(),
		authService:     authService,
		jwtService:      jwtService,
		middleware:      authMiddleware,
		listingService:  listingService,
		categoryService: categoryService,
		paymentService:  paymentService,
		imageService:    imageService,
		contactService:  contactService,
		whatsappService: whatsappService,  // ✨ AJOUTER AU STRUCT
	}

	// Configurer les middlewares et routes
	app.setupMiddleware()
	app.setupRoutes()

	return app
}

func (a *Application) setupMiddleware() {
	// Logger middleware
	a.router.Use(gin.Logger())
	
	// Recovery middleware
	a.router.Use(gin.Recovery())
	
	// CORS middleware
	a.router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusOK)
			return
		}
		
		c.Next()
	})

	// Servir les fichiers PWA
	a.router.Static("/public", "./public")
	a.router.StaticFile("/manifest.json", "./public/manifest.json")
	a.router.StaticFile("/sw.js", "./public/sw.js")
	a.router.StaticFile("/offline.html", "./public/offline.html")
	
	// Servir les fichiers statiques (images)
	a.router.Static("/uploads", "./uploads")
}

func (a *Application) setupRoutes() {
	// Health check
	a.router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "UP",
			"service":   "SenMarket API",
			"version":   "1.0.0",
			"timestamp": time.Now().Format(time.RFC3339),
			"checks": gin.H{
				"database": a.checkDatabase(),
				"redis":    a.checkRedis(),
			},
		})
	})

	// API routes group
	api := a.router.Group("/api/v1")
	{
		// Test endpoint
		api.GET("/test", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "🇸🇳 SenMarket API fonctionne !",
				"env":     a.config.Env,
			})
		})

		// Initialiser les handlers
		authHandler := handlers.NewAuthHandler(a.authService)
		listingHandler := handlers.NewListingHandler(a.listingService)
		categoryHandler := handlers.NewCategoryHandler(a.categoryService)
		paymentHandler := handlers.NewPaymentHandler(a.paymentService)
		imageHandler := handlers.NewImageHandler(a.imageService)
		contactHandler := handlers.NewContactHandler(a.contactService)
		whatsappHandler := handlers.NewWhatsAppHandler(a.whatsappService)  // ✨ NOUVEAU HANDLER

		// Routes d'authentification (publiques)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/verify", authHandler.VerifyPhone)
			auth.POST("/send-code", authHandler.SendVerificationCode)
		}

		// ✨ NOUVELLES ROUTES WHATSAPP
		whatsapp := api.Group("/whatsapp")
		{
			whatsapp.POST("/send-code", whatsappHandler.SendVerificationCode)
			whatsapp.POST("/resend-code", whatsappHandler.ResendVerificationCode)
			whatsapp.POST("/verify-code", whatsappHandler.VerifyCode)
			whatsapp.POST("/webhook/:provider", whatsappHandler.WebhookReceiver)

			// Routes protégées WhatsApp
			protected := whatsapp.Group("/")
			protected.Use(a.middleware.RequireAuth())
			{
				protected.POST("/welcome", whatsappHandler.SendWelcomeMessage)
			}
		}

		// Routes protégées (authentification requise)
		protected := api.Group("/")
		protected.Use(a.middleware.RequireAuth())
		{
			protected.GET("/auth/profile", authHandler.Profile)
			protected.PUT("/auth/profile", authHandler.UpdateProfile)
		}

		// Routes catégories (publiques)
		categories := api.Group("/categories")
		{
			categories.GET("", categoryHandler.GetCategories)
			categories.GET("/stats", categoryHandler.GetCategoriesWithStats)
			categories.GET("/:id", categoryHandler.GetCategory)
			categories.GET("/slug/:slug", categoryHandler.GetCategoryBySlug)
			categories.GET("/:id/listings", categoryHandler.GetListingsByCategory)
			categories.GET("/:id/stats", categoryHandler.GetCategoryStats)
		}

		// Routes annonces (publiques avec auth optionnelle)
		listings := api.Group("/listings")
		listings.Use(a.middleware.OptionalAuth())
		{
			// Routes publiques
			listings.GET("", listingHandler.GetListings)
			listings.GET("/search", listingHandler.SearchListings)
			listings.GET("/:id", listingHandler.GetListing)
		}

		// Routes annonces protégées (utilisateur vérifié)
		listingsProtected := api.Group("/listings")
		// listingsProtected.Use(a.middleware.RequireVerifiedUser())
		listingsProtected.Use(a.middleware.RequireAuth())
		{
			listingsProtected.POST("", listingHandler.CreateListing)
			listingsProtected.PUT("/:id", listingHandler.UpdateListing)
			listingsProtected.DELETE("/:id", listingHandler.DeleteListing)
			listingsProtected.POST("/:id/publish", listingHandler.PublishListing)
			listingsProtected.GET("/my", listingHandler.GetMyListings)
			listingsProtected.POST("/:id/pay", paymentHandler.PayForListing)
		}

		// Routes contact (publiques avec auth optionnelle)
		contacts := api.Group("/contacts")
		contacts.Use(a.middleware.OptionalAuth())
		{
			contacts.POST("", contactHandler.ContactSeller)
		}

		// Routes contact protégées
		contactsProtected := api.Group("/contacts")
		contactsProtected.Use(a.middleware.RequireAuth())
		{
			contactsProtected.GET("/my", contactHandler.GetMyContacts)
			contactsProtected.PUT("/:id/read", contactHandler.MarkContactAsRead)
			contactsProtected.GET("/stats", contactHandler.GetContactStats)
		}

		// Routes paiements
		payments := api.Group("/payments")
		{
			// Webhooks publics
			payments.POST("/webhook/orange-money", paymentHandler.OrangeMoneyWebhook)
			payments.POST("/webhook/wave", paymentHandler.WaveWebhook)
			payments.POST("/webhook/free-money", paymentHandler.FreeMoneyWebhook)
		}

		// Routes paiements protégées
		paymentsProtected := api.Group("/payments")
		paymentsProtected.Use(a.middleware.RequireVerifiedUser())
		{
			paymentsProtected.POST("/initiate", paymentHandler.InitiatePayment)
			paymentsProtected.GET("/:id", paymentHandler.GetPayment)
			paymentsProtected.GET("/my", paymentHandler.GetMyPayments)
		}

		// Routes images
		images := api.Group("/images")
		{
			// Route publique pour validation
			images.POST("/validate", imageHandler.ValidateImage)
		}

		// Routes images protégées
		imagesProtected := api.Group("/images")
		imagesProtected.Use(a.middleware.RequireAuth())
		{
			imagesProtected.POST("/upload", imageHandler.UploadImage)
			imagesProtected.POST("/upload-multiple", imageHandler.UploadMultipleImages)
			imagesProtected.DELETE("/delete", imageHandler.DeleteImage)
			imagesProtected.GET("/info", imageHandler.GetImageInfo)
		}

		// Dashboard (utilisateur vérifié)
		dashboard := api.Group("/dashboard")
		dashboard.Use(a.middleware.RequireVerifiedUser())
		{
			dashboard.GET("", func(c *gin.Context) {
				user, _ := c.Get("user")
				
				// Statistiques utilisateur
				userID := c.GetString("user_id")
				
				var stats struct {
					TotalListings     int64   `json:"total_listings"`
					ActiveListings    int64   `json:"active_listings"`
					SoldListings      int64   `json:"sold_listings"`
					DraftListings     int64   `json:"draft_listings"`
					TotalViews        int64   `json:"total_views"`
					TotalPayments     int64   `json:"total_payments"`
					CompletedPayments int64   `json:"completed_payments"`
					TotalRevenue      float64 `json:"total_revenue"`
					TotalContacts     int64   `json:"total_contacts"`
					UnreadContacts    int64   `json:"unread_contacts"`
				}
				
				// Comptage des annonces
				a.db.Model(&models.Listing{}).Where("user_id = ?", userID).Count(&stats.TotalListings)
				a.db.Model(&models.Listing{}).Where("user_id = ? AND status = ?", userID, "active").Count(&stats.ActiveListings)
				a.db.Model(&models.Listing{}).Where("user_id = ? AND status = ?", userID, "sold").Count(&stats.SoldListings)
				a.db.Model(&models.Listing{}).Where("user_id = ? AND status = ?", userID, "draft").Count(&stats.DraftListings)
				
				// Total des vues
				a.db.Model(&models.Listing{}).Select("COALESCE(SUM(views_count), 0)").
					Where("user_id = ?", userID).Scan(&stats.TotalViews)
				
				// Statistiques paiements
				a.db.Model(&models.Payment{}).Where("user_id = ?", userID).Count(&stats.TotalPayments)
				a.db.Model(&models.Payment{}).Where("user_id = ? AND status = ?", userID, "completed").Count(&stats.CompletedPayments)
				a.db.Model(&models.Payment{}).Select("COALESCE(SUM(amount), 0)").
					Where("user_id = ? AND status = ?", userID, "completed").Scan(&stats.TotalRevenue)
				
				// Statistiques contacts
				a.db.Model(&models.Contact{}).
					Joins("JOIN listings ON contacts.listing_id = listings.id").
					Where("listings.user_id = ?", userID).Count(&stats.TotalContacts)
				a.db.Model(&models.Contact{}).
					Joins("JOIN listings ON contacts.listing_id = listings.id").
					Where("listings.user_id = ? AND contacts.is_read = ?", userID, false).Count(&stats.UnreadContacts)
				
				c.JSON(http.StatusOK, gin.H{
					"message": "Bienvenue sur votre dashboard !",
					"user":    user,
					"stats":   stats,
				})
			})
		}

		// Route pour lister les régions
		api.GET("/regions", func(c *gin.Context) {
			regions := []string{
				"Dakar - Plateau", "Dakar - Almadies", "Dakar - Parcelles Assainies",
				"Dakar - Ouakam", "Dakar - Point E", "Dakar - Pikine", "Dakar - Guédiawaye",
				"Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Diourbel",
				"Louga", "Fatick", "Kolda", "Tambacounda",
			}
			c.JSON(http.StatusOK, gin.H{
				"data": regions,
			})
		})
	}
}

func (a *Application) checkDatabase() string {
	sqlDB, err := a.db.DB()
	if err != nil {
		return "ERROR"
	}
	
	if err := sqlDB.Ping(); err != nil {
		return "ERROR"
	}
	
	return "OK"
}

func (a *Application) checkRedis() string {
	_, err := a.redis.Ping(context.Background()).Result()
	if err != nil {
		return "ERROR"
	}
	return "OK"
}

func (a *Application) Run() error {
	// Configuration du serveur HTTP
	srv := &http.Server{
		Addr:    ":" + a.config.Port,
		Handler: a.router,
	}

	// Goroutine pour démarrer le serveur
	go func() {
		log.Printf("🚀 Serveur démarré sur http://localhost:%s", a.config.Port)
		log.Printf("🔍 Health check: http://localhost:%s/health", a.config.Port)
		log.Printf("🧪 Test endpoint: http://localhost:%s/api/v1/test", a.config.Port)
		log.Printf("🔐 Auth endpoints:")
		log.Printf("   POST /api/v1/auth/register")
		log.Printf("   POST /api/v1/auth/login") 
		log.Printf("   POST /api/v1/auth/verify")
		log.Printf("   GET  /api/v1/auth/profile (protected)")
		log.Printf("📱 WhatsApp endpoints:")  // ✨ NOUVELLES ROUTES LOGGÉES
		log.Printf("   POST /api/v1/whatsapp/send-code")
		log.Printf("   POST /api/v1/whatsapp/resend-code")
		log.Printf("   POST /api/v1/whatsapp/verify-code")
		log.Printf("   POST /api/v1/whatsapp/welcome (protected)")
		log.Printf("   POST /api/v1/whatsapp/webhook/:provider")
		log.Printf("📊 Category endpoints:")
		log.Printf("   GET  /api/v1/categories")
		log.Printf("   GET  /api/v1/categories/stats")
		log.Printf("📝 Listing endpoints:")
		log.Printf("   GET  /api/v1/listings")
		log.Printf("   GET  /api/v1/listings/search")
		log.Printf("   POST /api/v1/listings (protected)")
		log.Printf("   GET  /api/v1/listings/my (protected)")
		log.Printf("💰 Payment endpoints:")
		log.Printf("   POST /api/v1/payments/initiate (protected)")
		log.Printf("   POST /api/v1/listings/:id/pay (protected)")
		log.Printf("   GET  /api/v1/payments/my (protected)")
		log.Printf("📷 Image endpoints:")
		log.Printf("   POST /api/v1/images/upload (protected)")
		log.Printf("   POST /api/v1/images/upload-multiple (protected)")
		log.Printf("💬 Contact endpoints:")
		log.Printf("   POST /api/v1/contacts (public)")
		log.Printf("   GET  /api/v1/contacts/my (protected)")
		log.Printf("   GET  /api/v1/contacts/stats (protected)")
		log.Printf("🏠 Dashboard:")
		log.Printf("   GET  /api/v1/dashboard (protected)")
		log.Printf("📁 Static files:")
		log.Printf("   GET  /uploads/* (images)")
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Erreur démarrage serveur: %v", err)
		}
	}()

	// Canal pour écouter les signaux d'arrêt
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	log.Println("🛑 Arrêt du serveur...")

	// Arrêt gracieux avec timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Erreur arrêt forcé du serveur:", err)
	}
	
	log.Println("✅ Serveur arrêté proprement")
	return nil
}