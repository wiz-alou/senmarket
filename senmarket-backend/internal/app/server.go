// internal/app/server.go - VERSION AVEC REDIS INTÉGRÉ
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
	"senmarket/internal/middleware"
	"senmarket/internal/models"
	"senmarket/internal/repository/redis"
	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
	redisClient "github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Application struct {
	config             *config.Config
	db                 *gorm.DB
	redis              *redisClient.Client
	router             *gin.Engine
	
	// Services
	authService        *auth.Service
	jwtService         *auth.JWTService
	listingService     *services.ListingService
	categoryService    *services.CategoryService
	paymentService     *services.PaymentService
	imageService       *services.ImageService
	contactService     *services.ContactService
	twilioSMSService   *services.TwilioSMSService
	cacheService       *services.CacheService
	
	// Middleware
	authMiddleware     *auth.Middleware
	cacheMiddleware    *middleware.CacheMiddleware
	
	// Handlers
	authHandler        *handlers.AuthHandler
	listingHandler     *handlers.ListingHandler
	categoryHandler    *handlers.CategoryHandler
	paymentHandler     *handlers.PaymentHandler
	imageHandler       *handlers.ImageHandler
	contactHandler     *handlers.ContactHandler
	cacheHandler       *handlers.CacheHandler
	monitoringHandler  *handlers.MonitoringHandler
}

func New(cfg *config.Config) *Application {
	// Initialiser la base de données
	db, err := config.NewDatabase(cfg.Database)
	if err != nil {
		log.Fatalf("Erreur initialisation base de données: %v", err)
	}

	// 🔴 Initialiser Redis
	redisClient, err := config.NewRedis(cfg.Redis)
	if err != nil {
		log.Fatalf("Erreur initialisation Redis: %v", err)
	}

	// Test de connexion Redis
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("Erreur ping Redis: %v", err)
	}
	log.Println("✅ Redis connecté avec succès")

	// Configurer Gin selon l'environnement
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 🔴 Initialiser le repository Redis
	redisRepo := redis.NewCacheRepository(redisClient)

	// 🔴 Initialiser le service de cache
	cacheService := services.NewCacheService(redisRepo)

	// Initialiser Twilio SMS
	twilioSMSService := services.NewTwilioSMSService()
	
	// Log de la configuration Twilio
	if twilioSMSService.IsConfigured() {
		log.Printf("✅ Twilio SMS configuré et prêt")
		info, _ := twilioSMSService.GetAccountInfo()
		log.Printf("📱 Account SID: %s", info["account_sid"])
		log.Printf("📞 Phone Number: %s", info["phone"])
		log.Printf("🆓 Free Tier: %s", info["free_tier"])
	} else {
		log.Printf("⚠️  Twilio SMS en mode développement (variables manquantes)")
	}

	// Initialiser les services core
	jwtService := auth.NewJWTService(cfg.JWT.Secret, cfg.JWT.Expiry)
	authService := auth.NewService(db, jwtService, twilioSMSService)
	
	// 🔴 Services avec cache intégré
	listingService := services.NewListingService(db, redisRepo)
	categoryService := services.NewCategoryService(db, redisRepo)
	contactService := services.NewContactService(db)
	
	// Services sans cache (pour l'instant)
	paymentService := services.NewPaymentService(
		db,
		os.Getenv("ORANGE_MONEY_API_URL"),
		os.Getenv("ORANGE_MONEY_MERCHANT_KEY"),
		os.Getenv("ORANGE_MONEY_MERCHANT_SECRET"),
	)
	imageService := services.NewImageService("uploads", "http://localhost:8080")

	// Initialiser les middlewares
	authMiddleware := auth.NewMiddleware(jwtService, authService)
	cacheMiddleware := middleware.NewCacheMiddleware(cacheService)

	// Initialiser les handlers
	authHandler := handlers.NewAuthHandler(authService)
	listingHandler := handlers.NewListingHandler(listingService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	imageHandler := handlers.NewImageHandler(imageService)
	contactHandler := handlers.NewContactHandler(contactService)
	cacheHandler := handlers.NewCacheHandler(cacheService)
	monitoringHandler := handlers.NewMonitoringHandler(cacheService, redisClient)

	// Migrer la base de données
	if err := db.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Listing{},
		&models.Payment{},
		&models.SMSVerification{},
		&models.Contact{},
	); err != nil {
		log.Fatalf("Erreur migration base de données: %v", err)
	}

	app := &Application{
		config:            cfg,
		db:                db,
		redis:             redisClient,
		router:            gin.New(),
		authService:       authService,
		jwtService:        jwtService,
		listingService:    listingService,
		categoryService:   categoryService,
		paymentService:    paymentService,
		imageService:      imageService,
		contactService:    contactService,
		twilioSMSService:  twilioSMSService,
		cacheService:      cacheService,
		authMiddleware:    authMiddleware,
		cacheMiddleware:   cacheMiddleware,
		authHandler:       authHandler,
		listingHandler:    listingHandler,
		categoryHandler:   categoryHandler,
		paymentHandler:    paymentHandler,
		imageHandler:      imageHandler,
		contactHandler:    contactHandler,
		cacheHandler:      cacheHandler,
		monitoringHandler: monitoringHandler,
	}

	// Configurer les middlewares et routes
	app.setupMiddleware()
	app.setupRoutes()

	// 🔴 Préchauffer le cache au démarrage
	go app.warmupCache()

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

	// 🔴 Rate limiting global
	a.router.Use(a.cacheMiddleware.RateLimit(100, time.Minute))

	// Servir les fichiers statiques
	a.router.Static("/public", "./public")
	a.router.StaticFile("/manifest.json", "./public/manifest.json")
	a.router.StaticFile("/sw.js", "./public/sw.js")
	a.router.StaticFile("/offline.html", "./public/offline.html")
	a.router.Static("/uploads", "./uploads")
}

func (a *Application) setupRoutes() {
	// Health check avec info Redis + Twilio
	a.router.GET("/health", func(c *gin.Context) {
		twilioInfo, _ := a.twilioSMSService.GetAccountInfo()
		
		// 🔴 Test Redis
		ctx := context.Background()
		redisStatus := "DOWN"
		if err := a.redis.Ping(ctx).Err(); err == nil {
			redisStatus = "UP"
		}
		
		c.JSON(http.StatusOK, gin.H{
			"status":    "UP",
			"service":   "SenMarket API",
			"version":   "2.2.0",
			"timestamp": time.Now().Format(time.RFC3339),
			"checks": gin.H{
				"database":   a.checkDatabase(),
				"redis":      redisStatus,
				"twilio_sms": twilioInfo["status"],
			},
			"features": gin.H{
				"redis_cache":        true,
				"rate_limiting":      true,
				"response_caching":   true,
				"twilio_sms_free":    true,
				"sms_verification":   true,
			},
		})
	})

	// API routes group
	api := a.router.Group("/api/v1")
	{
		// Test endpoint avec info Twilio + Redis
		api.GET("/test", func(c *gin.Context) {
			twilioStats := a.twilioSMSService.GetUsageStats()
			
			// Stats Redis
			ctx := context.Background()
			totalKeys, _ := a.redis.DBSize(ctx).Result()
			
			c.JSON(http.StatusOK, gin.H{
				"message": "🇸🇳 SenMarket API fonctionne !",
				"env":     a.config.Env,
				"version": "2.2.0",
				"redis": gin.H{
					"connected":  true,
					"total_keys": totalKeys,
				},
				"sms": gin.H{
					"provider":                "twilio_free",
					"configured":              a.twilioSMSService.IsConfigured(),
					"free_messages_remaining": twilioStats["free_messages_remaining"],
				},
			})
		})

		// Endpoint Twilio SMS status
		api.GET("/sms/status", func(c *gin.Context) {
			info, _ := a.twilioSMSService.GetAccountInfo()
			stats := a.twilioSMSService.GetUsageStats()
			
			c.JSON(http.StatusOK, gin.H{
				"success": true,
				"twilio":  info,
				"usage":   stats,
			})
		})

		// 🔴 Endpoints avec cache optimisé
		api.GET("/categories", a.cacheMiddleware.CacheResponse(24*time.Hour), a.categoryHandler.GetCategories)
		api.GET("/categories/stats", a.cacheMiddleware.CacheResponse(30*time.Minute), a.categoryHandler.GetCategoriesWithStats)

		// 🔴 Rate limiting spécifique pour auth
		auth := api.Group("/auth")
		auth.Use(a.cacheMiddleware.RateLimit(10, time.Minute))
		{
			auth.POST("/register", a.authHandler.Register)
			auth.POST("/login", a.authHandler.Login)
			auth.POST("/verify", a.authHandler.VerifyPhone)
			auth.POST("/send-code", a.authHandler.SendVerificationCode)
		}

		// Routes protégées (authentification requise)
		protected := api.Group("/")
		protected.Use(a.authMiddleware.RequireAuth())
		{
			protected.GET("/auth/profile", a.authHandler.Profile)
			protected.PUT("/auth/profile", a.authHandler.UpdateProfile)
		}

		// Routes catégories (publiques avec cache)
		categories := api.Group("/categories")
		{
			categories.GET("/:id", a.categoryHandler.GetCategory)
			categories.GET("/slug/:slug", a.categoryHandler.GetCategoryBySlug)
			categories.GET("/:id/listings", a.categoryHandler.GetListingsByCategory)
			categories.GET("/:id/stats", a.cacheMiddleware.CacheResponse(30*time.Minute), a.categoryHandler.GetCategoryStats)
		}

		// Routes annonces (publiques avec auth optionnelle)
		listings := api.Group("/listings")
		listings.Use(a.authMiddleware.OptionalAuth())
		{
			listings.GET("", a.listingHandler.GetListings)           // Cache géré dans le service
			listings.GET("/search", a.listingHandler.SearchListings) // Cache géré dans le service
			listings.GET("/:id", a.listingHandler.GetListing)        // Cache géré dans le service
		}

		// 🔴 Endpoint listings featured avec cache
		api.GET("/listings/featured", a.cacheMiddleware.CacheResponse(30*time.Minute), func(c *gin.Context) {
			// Appeler directement le service pour les featured
			featured, err := a.listingService.GetFeaturedListings(6)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"data": featured})
		})

		// Routes annonces protégées
		listingsProtected := api.Group("/listings")
		listingsProtected.Use(a.authMiddleware.RequireAuth())
		{
			listingsProtected.POST("", a.listingHandler.CreateListing)
			listingsProtected.PUT("/:id", a.listingHandler.UpdateListing)
			listingsProtected.DELETE("/:id", a.listingHandler.DeleteListing)
			listingsProtected.POST("/:id/publish", a.listingHandler.PublishListing)
			listingsProtected.GET("/my", a.listingHandler.GetMyListings)
			listingsProtected.POST("/:id/pay", a.paymentHandler.PayForListing)
		}

		// Routes contact
		contacts := api.Group("/contacts")
		contacts.Use(a.authMiddleware.OptionalAuth())
		{
			contacts.POST("", a.contactHandler.ContactSeller)
		}

		contactsProtected := api.Group("/contacts")
		contactsProtected.Use(a.authMiddleware.RequireAuth())
		{
			contactsProtected.GET("/my", a.contactHandler.GetMyContacts)
			contactsProtected.PUT("/:id/read", a.contactHandler.MarkContactAsRead)
			contactsProtected.GET("/stats", a.contactHandler.GetContactStats)
		}

		// Routes paiements
		payments := api.Group("/payments")
		{
			payments.POST("/webhook/orange-money", a.paymentHandler.OrangeMoneyWebhook)
			payments.POST("/webhook/wave", a.paymentHandler.WaveWebhook)
			payments.POST("/webhook/free-money", a.paymentHandler.FreeMoneyWebhook)
		}

		paymentsProtected := api.Group("/payments")
		paymentsProtected.Use(a.authMiddleware.RequireVerifiedUser())
		{
			paymentsProtected.POST("/initiate", a.paymentHandler.InitiatePayment)
			paymentsProtected.GET("/:id", a.paymentHandler.GetPayment)
			paymentsProtected.GET("/my", a.paymentHandler.GetMyPayments)
		}

		// Routes images
		images := api.Group("/images")
		{
			images.POST("/validate", a.imageHandler.ValidateImage)
		}

		imagesProtected := api.Group("/images")
		imagesProtected.Use(a.authMiddleware.RequireAuth())
		{
			imagesProtected.POST("/upload", a.imageHandler.UploadImage)
			imagesProtected.POST("/upload-multiple", a.imageHandler.UploadMultipleImages)
			imagesProtected.DELETE("/delete", a.imageHandler.DeleteImage)
			imagesProtected.GET("/info", a.imageHandler.GetImageInfo)
		}

		// 🔴 Cache management (admin endpoints)
		if a.config.Env != "production" {
			cache := api.Group("/cache")
			{
				cache.GET("/stats", a.cacheHandler.GetCacheStats)
				cache.POST("/clear", a.cacheHandler.ClearCache)
				cache.POST("/warmup", a.cacheHandler.WarmupCache)
			}
		}

		// 🔴 Monitoring endpoints
		monitoring := api.Group("/monitoring")
		{
			monitoring.GET("/redis", a.monitoringHandler.GetRedisMetrics)
			monitoring.GET("/hit-ratio", a.monitoringHandler.GetCacheHitRatio)
			monitoring.GET("/top-keys", a.monitoringHandler.GetTopKeys)
			monitoring.GET("/memory", a.monitoringHandler.GetMemoryUsage)
		}

		// Dashboard avec cache utilisateur
		dashboard := api.Group("/dashboard")
		dashboard.Use(a.authMiddleware.RequireVerifiedUser())
		{
dashboard.GET("", func(c *gin.Context) {
    user, _ := c.Get("user")
    userID := c.GetString("user_id")
    
    // 🔴 Essayer de récupérer les stats depuis le cache
    ctx := context.Background()
    
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
    
    // Essayer le cache d'abord (correction du retour double)
    cachedStats, err := a.cacheService.GetCachedUserStats(ctx, userID)
    if err == nil {
        // Convertir les stats du cache
        if totalListings, ok := cachedStats["total_listings"].(int64); ok {
            stats.TotalListings = totalListings
        }
        if activeListings, ok := cachedStats["active_listings"].(int64); ok {
            stats.ActiveListings = activeListings
        }
        // ... etc pour les autres champs
        
        c.JSON(http.StatusOK, gin.H{
            "message": "Bienvenue sur votre dashboard !",
            "user":    user,
            "stats":   stats,
        })
        return
    }
    
    // Cache miss, calculer depuis la DB
    
    // Statistiques annonces
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
    
    // Mettre en cache pour 10 minutes
    go func() {
        statsMap := map[string]interface{}{
            "total_listings":     stats.TotalListings,
            "active_listings":    stats.ActiveListings,
            "sold_listings":      stats.SoldListings,
            "draft_listings":     stats.DraftListings,
            "total_views":        stats.TotalViews,
            "total_payments":     stats.TotalPayments,
            "completed_payments": stats.CompletedPayments,
            "total_revenue":      stats.TotalRevenue,
            "total_contacts":     stats.TotalContacts,
            "unread_contacts":    stats.UnreadContacts,
        }
        a.cacheService.CacheUserStats(ctx, userID, statsMap)
    }()
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Bienvenue sur votre dashboard !",
        "user":    user,
        "stats":   stats,
    })
})
		}

		// Route régions avec cache très long
		api.GET("/regions", a.cacheMiddleware.CacheResponse(24*time.Hour), func(c *gin.Context) {
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

func (a *Application) Run() error {
	srv := &http.Server{
		Addr:    ":" + a.config.Port,
		Handler: a.router,
	}

	go func() {
		log.Printf("🚀 Serveur démarré sur http://localhost:%s", a.config.Port)
		log.Printf("🔍 Health check: http://localhost:%s/health", a.config.Port)
		log.Printf("🧪 Test endpoint: http://localhost:%s/api/v1/test", a.config.Port)
		log.Printf("📱 SMS Status: http://localhost:%s/api/v1/sms/status", a.config.Port)
		log.Printf("🔴 Redis Monitor: http://localhost:%s/api/v1/monitoring/redis", a.config.Port)
		log.Printf("📊 Cache Stats: http://localhost:%s/api/v1/cache/stats", a.config.Port)
		log.Printf("🔐 Auth endpoints:")
		log.Printf("   POST /api/v1/auth/register")
		log.Printf("   POST /api/v1/auth/login") 
		log.Printf("   POST /api/v1/auth/verify")
		log.Printf("   POST /api/v1/auth/send-code")
		log.Printf("   GET  /api/v1/auth/profile (protected)")
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Erreur démarrage serveur: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	
	log.Println("🛑 Arrêt du serveur...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	
	// Fermer Redis proprement
	if err := a.redis.Close(); err != nil {
		log.Printf("Erreur fermeture Redis: %v", err)
	}
	
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Erreur arrêt forcé du serveur:", err)
	}
	
	log.Println("✅ Serveur arrêté proprement")
	return nil
}

// 🔴 Préchauffage du cache au démarrage
func (a *Application) warmupCache() {
    ctx := context.Background()
    log.Println("🔥 Préchauffage du cache Redis...")
    
    // Préchauffer les catégories (correction du nom de méthode)
    if _, err := a.categoryService.GetCategories(); err != nil {
        log.Printf("Erreur warmup categories: %v", err)
    } else {
        log.Println("✅ Categories préchauffées")
    }
    
    // Préchauffer les catégories avec stats
    if _, err := a.categoryService.GetCategoriesWithCounts(); err != nil {
        log.Printf("Erreur warmup categories stats: %v", err)
    } else {
        log.Println("✅ Categories stats préchauffées")
    }
    
    // Préchauffer les listings featured
    if _, err := a.listingService.GetFeaturedListings(6); err != nil {
        log.Printf("Erreur warmup featured: %v", err)
    } else {
        log.Println("✅ Featured listings préchauffés")
    }
    
    // Préchauffer les stats globales
    if err := a.warmupGlobalStats(ctx); err != nil {
        log.Printf("Erreur warmup stats: %v", err)
    } else {
        log.Println("✅ Stats globales préchauffées")
    }
    
    log.Println("🔥 Préchauffage terminé !")
}

func (a *Application) warmupGlobalStats(ctx context.Context) error {
	var totalListings, activeListings, totalUsers int64
	
	a.db.Model(&models.Listing{}).Count(&totalListings)
	a.db.Model(&models.Listing{}).Where("status = ? AND expires_at > NOW()", "published").Count(&activeListings)
	a.db.Model(&models.User{}).Count(&totalUsers)
	
	stats := map[string]interface{}{
		"total_listings":  totalListings,
		"active_listings": activeListings,
		"total_users":     totalUsers,
		"updated_at":      time.Now().Unix(),
	}
	
	return a.cacheService.CacheGlobalStats(ctx, stats)
}