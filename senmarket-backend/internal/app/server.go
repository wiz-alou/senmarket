// internal/app/server.go
package app

import (
	"context"
	// "errors"
	"fmt"
	"log"
	"net/http"
	"os"
	// "strconv"
	"time"
	"strings"  
	"senmarket/internal/auth"
	"senmarket/internal/config"
	"senmarket/internal/handlers"
	"senmarket/internal/middleware"
	// "senmarket/internal/models"
	"senmarket/internal/repository/redis"
	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/minio/minio-go/v7"
	redislib "github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Application struct {
	config            *config.Config
	db                *gorm.DB
	redis             *redislib.Client
	minioClient       *minio.Client          // ⭐ Client MinIO
	router            *gin.Engine
	authService       *auth.Service
	jwtService        *auth.JWTService
	listingService    *services.ListingService
	categoryService   *services.CategoryService
	paymentService    *services.PaymentService
	imageService      *services.ImageService
	contactService    *services.ContactService
	twilioSMSService  *services.TwilioSMSService
	cacheService      *services.CacheService
	
	// 🆕 SERVICES POUR LA MONÉTISATION
	quotaService      *services.QuotaService
	
	authMiddleware    *auth.Middleware
	cacheMiddleware   *middleware.CacheMiddleware
	authHandler       *handlers.AuthHandler
	listingHandler    *handlers.ListingHandler
	categoryHandler   *handlers.CategoryHandler
	paymentHandler    *handlers.PaymentHandler
	imageHandler      *handlers.ImageHandler
	contactHandler    *handlers.ContactHandler
	cacheHandler      *handlers.CacheHandler
	monitoringHandler *handlers.MonitoringHandler
	
	// 🆕 HANDLERS POUR LA MONÉTISATION
	quotaHandler      *handlers.QuotaHandler
}

func New(cfg *config.Config) *Application {
	// Configuration de la base de données PostgreSQL
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=UTC",
		cfg.Database.Host,
		cfg.Database.User,
		cfg.Database.Password,
		cfg.Database.Name,
		cfg.Database.Port,
		cfg.Database.SSLMode,
	)

	// Configurer le logger GORM selon l'environnement
	var gormLogger logger.Interface
	if cfg.Env == "development" {
		gormLogger = logger.Default.LogMode(logger.Info)
	} else {
		gormLogger = logger.Default.LogMode(logger.Error)
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		log.Fatalf("Erreur connexion base de données: %v", err)
	}

	log.Println("✅ Connexion PostgreSQL établie")

	// Configuration Redis
	redisClient := redislib.NewClient(&redislib.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})

	// Test de connexion Redis
	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Fatalf("Erreur ping Redis: %v", err)
	}
	log.Println("✅ Redis connecté avec succès")

	// ⭐ NOUVEAU: Configuration MinIO avec validation
	log.Println("🔧 Configuration MinIO...")
	if err := config.ValidateMinIOConfig(cfg.MinIO); err != nil {
		log.Fatalf("Erreur validation config MinIO: %v", err)
	}

	minioClient, err := config.NewMinIO(cfg.MinIO)
	if err != nil {
		log.Fatalf("Erreur connexion MinIO: %v", err)
	}
	log.Println("✅ MinIO connecté avec succès")

	// Configurer Gin selon l'environnement
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Initialiser le repository Redis
	redisRepo := redis.NewCacheRepository(redisClient)

	// Initialiser le service de cache
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
	
	// 🆕 SERVICE QUOTA - IMPORTANT: Créer avant ListingService
	quotaService := services.NewQuotaService(db)
	
	// 🔧 CORRIGÉ: Services avec les bons paramètres
	listingService := services.NewListingService(db, cacheService, quotaService)
	categoryService := services.NewCategoryService(db, redisRepo)
	contactService := services.NewContactService(db)
	
	// Services sans cache (pour l'instant)
	paymentService := services.NewPaymentService(
		db,
		os.Getenv("ORANGE_MONEY_API_URL"),
		os.Getenv("ORANGE_MONEY_MERCHANT_KEY"),
		os.Getenv("ORANGE_MONEY_MERCHANT_SECRET"),
	)

	// ⭐ NOUVEAU: ImageService avec MinIO
	minioBaseURL := fmt.Sprintf("http://%s", cfg.MinIO.Endpoint)
	if cfg.MinIO.UseSSL {
		minioBaseURL = fmt.Sprintf("https://%s", cfg.MinIO.Endpoint)
	}
	imageService := services.NewImageService(minioClient, cfg.MinIO.BucketName, minioBaseURL)

	// Initialiser les middlewares
	authMiddleware := auth.NewMiddleware(jwtService, authService)
	cacheMiddleware := middleware.NewCacheMiddleware(cacheService)

	// Initialiser les handlers existants
	authHandler := handlers.NewAuthHandler(authService)
	listingHandler := handlers.NewListingHandler(listingService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)
	paymentHandler := handlers.NewPaymentHandler(paymentService)
	imageHandler := handlers.NewImageHandler(imageService)
	contactHandler := handlers.NewContactHandler(contactService)
	cacheHandler := handlers.NewCacheHandler(cacheService)
	monitoringHandler := handlers.NewMonitoringHandler(cacheService, redisClient)

	// 🆕 HANDLER QUOTA
	quotaHandler := handlers.NewQuotaHandler(quotaService)

	// ============================================
	// MIGRATIONS DÉSACTIVÉES
	// ============================================
	// AutoMigrate désactivé à cause de problèmes de contraintes GORM
	// Les tables existent déjà via les migrations SQL dans /migrations/
	// La base de données est opérationnelle et toutes les tables sont créées
	
	log.Println("✅ Migrations GORM désactivées - utilisation de la DB existante")
	
	// Vérifier juste que la DB fonctionne correctement
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Erreur récupération DB connection: %v", err)
	}
	
	if err := sqlDB.Ping(); err != nil {
		log.Fatalf("Erreur ping base de données: %v", err)
	}
	
	log.Println("📊 Base de données PostgreSQL opérationnelle")
	log.Println("📋 Tables créées via migrations SQL (/migrations/*.sql)")

	// 🆕 VÉRIFIER LA CONFIGURATION DE MONÉTISATION AU DÉMARRAGE
	go func() {
		time.Sleep(2 * time.Second) // Attendre que tout soit initialisé
		
		config, err := quotaService.GetGlobalConfig()
		if err != nil {
			log.Printf("⚠️  Erreur récupération config monétisation: %v", err)
		} else {
			phase := config.GetCurrentPhase()
			log.Printf("🎯 Phase de monétisation actuelle: %s", phase)
			
			if config.IsFreeLaunchActive() {
				days := config.GetDaysUntilLaunchEnd()
				log.Printf("🎉 Phase de lancement ACTIVE - %d jours restants", days)
			} else {
				log.Printf("💳 Phase payante active - Prix: %.0f %s", config.StandardListingPrice, config.Currency)
			}
		}
	}()

	app := &Application{
		config:            cfg,
		db:                db,
		redis:             redisClient,
		minioClient:       minioClient,        // ⭐ NOUVEAU
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
		
		// 🆕 SERVICE
		quotaService:      quotaService,
		
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
		
		// 🆕 HANDLER
		quotaHandler:      quotaHandler,
	}

	// Configurer les middlewares et routes
	app.setupMiddleware()
	app.setupRoutes()

	// Préchauffer le cache au démarrage
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

	// Rate limiting global
	a.router.Use(a.cacheMiddleware.RateLimit(100, time.Minute))

	// Servir les fichiers statiques
	a.router.Static("/public", "./public")
	a.router.StaticFile("/manifest.json", "./public/manifest.json")
	a.router.StaticFile("/sw.js", "./public/sw.js")
	a.router.StaticFile("/offline.html", "./public/offline.html")
	// ⭐ SUPPRIMÉ: Plus besoin de servir /uploads car tout est sur MinIO
	// a.router.Static("/uploads", "./uploads")
}

func (a *Application) setupRoutes() {
	// Health check avec info Redis + Twilio + Monétisation + MinIO
	a.router.GET("/health", func(c *gin.Context) {
		twilioInfo, _ := a.twilioSMSService.GetAccountInfo()
		
		// Test Redis
		ctx := context.Background()
		redisStatus := "DOWN"
		if err := a.redis.Ping(ctx).Err(); err == nil {
			redisStatus = "UP"
		}

		// ⭐ NOUVEAU: Test MinIO avec fonction dédiée
		minioHealth := config.GetMinIOHealthCheck(a.minioClient, a.config.MinIO.BucketName)
		
		// 🆕 Info monétisation
		monetizationInfo := gin.H{
			"status": "unknown",
			"phase":  "unknown",
		}
		
		if config, err := a.quotaService.GetGlobalConfig(); err == nil {
			monetizationInfo["status"] = "configured"
			monetizationInfo["phase"] = config.GetCurrentPhase()
			monetizationInfo["launch_active"] = config.IsFreeLaunchActive()
			if config.IsFreeLaunchActive() {
				monetizationInfo["days_until_launch_end"] = config.GetDaysUntilLaunchEnd()
			}
		}
		
		c.JSON(http.StatusOK, gin.H{
			"status":    "UP",
			"service":   "SenMarket API",
			"version":   "3.1.0", // ⭐ Version avec MinIO
			"timestamp": time.Now().Format(time.RFC3339),
			"checks": gin.H{
				"database":      a.checkDatabase(),
				"redis":         redisStatus,
				"minio":         minioHealth["status"],        // ⭐ NOUVEAU
				"twilio_sms":    twilioInfo["status"],
				"monetization":  monetizationInfo["status"],
			},
			"features": gin.H{
				"redis_cache":        true,
				"rate_limiting":      true,
				"response_caching":   true,
				"twilio_sms_free":    true,
				"sms_verification":   true,
				"quota_management":   true, // 🆕
				"phase_monetization": true, // 🆕
				"pricing_config":     true, // 🆕
				"minio_storage":      true, // ⭐ NOUVEAU
				"cloud_images":       true, // ⭐ NOUVEAU
			},
			"storage": gin.H{                       // ⭐ NOUVEAU
				"provider":    "minio",
				"bucket":      a.config.MinIO.BucketName,
				"endpoint":    a.config.MinIO.Endpoint,
				"ssl":         a.config.MinIO.UseSSL,
				"health":      minioHealth,
			},
			"monetization": monetizationInfo,
		})
	})

	// API routes group
	api := a.router.Group("/api/v1")
	{
		// Test endpoint avec info complète
		api.GET("/test", func(c *gin.Context) {
			twilioStats := a.twilioSMSService.GetUsageStats()
			
			// Stats Redis
			ctx := context.Background()
			totalKeys, _ := a.redis.DBSize(ctx).Result()

			// ⭐ NOUVEAU: Stats MinIO détaillées
			minioStats := config.GetMinIOHealthCheck(a.minioClient, a.config.MinIO.BucketName)
			
			// 🆕 Stats monétisation
			monetizationStats := gin.H{}
			if stats, err := a.quotaService.GetPlatformStats(); err == nil {
				monetizationStats = stats
			}
			
			c.JSON(http.StatusOK, gin.H{
				"message": "🇸🇳 SenMarket API v3.1 avec MinIO !",
				"env":     a.config.Env,
				"version": "3.1.0",
				"redis": gin.H{
					"connected":  true,
					"total_keys": totalKeys,
				},
				"minio": minioStats, // ⭐ NOUVEAU
				"sms": gin.H{
					"provider":                "twilio_free",
					"configured":              a.twilioSMSService.IsConfigured(),
					"free_messages_remaining": twilioStats["free_messages_remaining"],
				},
				"monetization": monetizationStats, // 🆕
			})
		})

		// ⭐ NOUVEAU: Endpoint MinIO status détaillé
		api.GET("/storage/status", func(c *gin.Context) {
			ctx := context.Background()
			
			buckets, err := a.minioClient.ListBuckets(ctx)
			if err != nil {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"error": "MinIO non accessible",
					"details": err.Error(),
				})
				return
			}

			// Informations sur le bucket principal
			bucketInfo := gin.H{
				"name": a.config.MinIO.BucketName,
				"exists": false,
			}

			for _, bucket := range buckets {
				if bucket.Name == a.config.MinIO.BucketName {
					bucketInfo["exists"] = true
					bucketInfo["created"] = bucket.CreationDate
					break
				}
			}

			// Compter les objets dans le bucket principal
			objectCount := 0
			objectCh := a.minioClient.ListObjects(ctx, a.config.MinIO.BucketName, minio.ListObjectsOptions{
				Recursive: true,
			})

			for object := range objectCh {
				if object.Err != nil {
					break
				}
				objectCount++
			}

			c.JSON(http.StatusOK, gin.H{
				"status": "connected",
				"endpoint": a.config.MinIO.Endpoint,
				"ssl": a.config.MinIO.UseSSL,
				"total_buckets": len(buckets),
				"main_bucket": bucketInfo,
				"object_count": objectCount,
				"config": gin.H{
					"bucket_name": a.config.MinIO.BucketName,
					"region": a.config.MinIO.Region,
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

		// ENDPOINTS CATEGORIES (SANS MIDDLEWARE POUR L'INSTANT)
		api.GET("/categories", a.categoryHandler.GetCategories)
		api.GET("/categories/stats", a.categoryHandler.GetCategoriesWithStats)

		// Rate limiting spécifique pour auth
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
			categories.GET("/:id/stats", a.categoryHandler.GetCategoryStats)
		}

		// 🆕 ROUTES QUOTA (NOUVELLES)
		quota := api.Group("/quota")
		{
			// Routes publiques pour info générale
			quota.GET("/current-phase", a.quotaHandler.GetCurrentPhase)
			quota.GET("/pricing", a.quotaHandler.GetPricingInfo)
		}

		// Routes quota protégées (authentification requise)
		quotaProtected := api.Group("/quota")
		quotaProtected.Use(a.authMiddleware.RequireAuth())
		{
			quotaProtected.GET("/status", a.quotaHandler.GetQuotaStatus)
			quotaProtected.GET("/check", a.quotaHandler.CheckEligibility)
			quotaProtected.GET("/summary", a.quotaHandler.GetQuotaSummary)
			quotaProtected.GET("/history", a.quotaHandler.GetQuotaHistory)
			quotaProtected.GET("/platform-stats", a.quotaHandler.GetPlatformStats)
			quotaProtected.POST("/update-phase", a.quotaHandler.UpdateUserPhase)
			quotaProtected.POST("/cleanup", a.quotaHandler.CleanupQuotas)
		}

		// Routes annonces (publiques avec auth optionnelle)
		listings := api.Group("/listings")
		listings.Use(a.authMiddleware.OptionalAuth())
		{
			listings.GET("", a.listingHandler.GetListings)           // Cache géré dans le service
			listings.GET("/search", a.listingHandler.SearchListings) // Cache géré dans le service
			listings.GET("/:id", a.listingHandler.GetListing)        // Cache géré dans le service
		}

		// Endpoint listings featured (SANS MIDDLEWARE POUR L'INSTANT)
		api.GET("/listings/featured", func(c *gin.Context) {
			// Appeler directement le service pour les featured
			featured, err := a.listingService.GetFeaturedListings(6)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, gin.H{"data": featured})
		})

		// Routes annonces protégées (MISES À JOUR AVEC QUOTAS)
		listingsProtected := api.Group("/listings")
		listingsProtected.Use(a.authMiddleware.RequireAuth())
		{
			listingsProtected.GET("/check-eligibility", a.listingHandler.CheckEligibility) // 🆕
			listingsProtected.POST("", a.listingHandler.CreateListing)                     // 🆕 Modifié avec quotas
			listingsProtected.PUT("/:id", a.listingHandler.UpdateListing)
			listingsProtected.DELETE("/:id", a.listingHandler.DeleteListing)
			listingsProtected.POST("/:id/publish", a.listingHandler.PublishListing)       // 🆕 Nouveau
			listingsProtected.GET("/my", a.listingHandler.GetMyListings)                  // 🆕 Modifié avec quotas
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

		// Routes images avec MinIO
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
			// ⭐ NOUVEAUX endpoints MinIO
			imagesProtected.GET("/signed-url", a.imageHandler.GetSignedURL)
			imagesProtected.GET("/list", a.imageHandler.ListImages)
			imagesProtected.DELETE("/delete-prefix", a.imageHandler.DeleteByPrefix)
		}

		// Cache management (admin endpoints)
		if a.config.Env != "production" {
			cache := api.Group("/cache")
			{
				cache.GET("/stats", a.cacheHandler.GetCacheStats)
				cache.DELETE("/clear", a.cacheHandler.ClearCache)
				cache.POST("/warmup", a.cacheHandler.WarmupCache)
			}
		}

		// Monitoring endpoints
		if a.config.Env != "production" {
			monitoring := api.Group("/monitoring")
			{
				monitoring.GET("/redis", a.monitoringHandler.GetRedisMetrics)
				monitoring.GET("/cache/hit-ratio", a.monitoringHandler.GetCacheHitRatio)
				monitoring.GET("/cache/top-keys", a.monitoringHandler.GetTopKeys)
				monitoring.GET("/memory", a.monitoringHandler.GetMemoryUsage)
				// ⭐ NOUVEAU: Monitoring MinIO
				monitoring.GET("/minio", a.getMinIOMetrics)
			}
		}
	}

	// Routes pour les régions sénégalaises
	a.router.GET("/api/v1/regions", func(c *gin.Context) {
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
		c.JSON(http.StatusOK, gin.H{"data": regions})
	})
}

// ⭐ NOUVEAU: Métriques MinIO détaillées
func (a *Application) getMinIOMetrics(c *gin.Context) {
	ctx := context.Background()
	
	// Utiliser la fonction dédiée pour les métriques
	health := config.GetMinIOHealthCheck(a.minioClient, a.config.MinIO.BucketName)
	
	// Ajouter des métriques supplémentaires
	if health["status"] == "up" {
		// Compter les objets par dossier
		folderStats := make(map[string]int)
		
		objectCh := a.minioClient.ListObjects(ctx, a.config.MinIO.BucketName, minio.ListObjectsOptions{
			Recursive: true,
		})

		totalObjects := 0
		for object := range objectCh {
			if object.Err != nil {
				break
			}
			
			// Extraire le premier niveau du dossier
			parts := strings.Split(object.Key, "/")
			if len(parts) > 0 {
				folder := parts[0]
				folderStats[folder]++
			}
			totalObjects++
		}
		
		health["total_objects"] = totalObjects
		health["folder_stats"] = folderStats
	}
	
	c.JSON(http.StatusOK, health)
}

func (a *Application) checkDatabase() string {
	sqlDB, err := a.db.DB()
	if err != nil {
		return "DOWN"
	}
	
	if err := sqlDB.Ping(); err != nil {
		return "DOWN"
	}
	
	return "UP"
}

// warmupCache préchauffe le cache au démarrage
func (a *Application) warmupCache() {
	log.Println("🔴 Préchauffage du cache...")
	
	ctx := context.Background()
	
	// Préchauffer les catégories
	if categories, err := a.categoryService.GetCategories(); err == nil {
		log.Printf("✅ Cache categories: %d éléments", len(categories))
	}
	
	// Préchauffer les catégories avec stats
	if categoriesStats, err := a.categoryService.GetCategoriesWithStats(); err == nil {
		log.Printf("✅ Cache categories stats: %d éléments", len(categoriesStats))
	}
	
	// Préchauffer quelques listings
	if featured, err := a.listingService.GetFeaturedListings(6); err == nil {
		log.Printf("✅ Cache featured listings: %d éléments", len(featured))
	}
	
	// 🆕 Préchauffer la configuration de monétisation
	if config, err := a.quotaService.GetGlobalConfig(); err == nil {
		log.Printf("🎯 Config monétisation chargée: phase %s", config.GetCurrentPhase())
	}

	// ⭐ NOUVEAU: Vérifier MinIO et afficher stats
	minioHealth := config.GetMinIOHealthCheck(a.minioClient, a.config.MinIO.BucketName)
	if minioHealth["status"] == "up" {
		log.Printf("📁 MinIO opérationnel: %d buckets", minioHealth["total_buckets"])
		if minioHealth["bucket_exists"] == true {
			log.Printf("✅ Bucket principal '%s' disponible", a.config.MinIO.BucketName)
		} else {
			log.Printf("⚠️ Bucket principal '%s' non trouvé", a.config.MinIO.BucketName)
		}
	} else {
		log.Printf("❌ MinIO non accessible")
	}
	
	// Vérifier le total des clés en cache
	if totalKeys, err := a.redis.DBSize(ctx).Result(); err == nil {
		log.Printf("🔴 Cache préchauffé: %d clés totales", totalKeys)
	}

	log.Println("🎉 Préchauffage terminé - Tous les services prêts")
}

func (a *Application) Run() error {
	port := a.config.Port
	if port == "" {
		port = "8080"
	}
	
	log.Printf("🚀 SenMarket API v3.1 avec MinIO démarré sur le port %s", port)
	log.Printf("🌐 Health check: http://localhost:%s/health", port)
	log.Printf("🎯 Phase monétisation: http://localhost:%s/api/v1/quota/current-phase", port)
	log.Printf("📁 MinIO status: http://localhost:%s/api/v1/storage/status", port)
	log.Printf("🎛️ MinIO Console: http://localhost:9001 (senmarket/senmarket123)")
	
	// Afficher un résumé des services
	log.Println("📊 Services actifs:")
	log.Println("   ✅ PostgreSQL - Base de données")
	log.Println("   ✅ Redis - Cache et sessions")
	log.Println("   ✅ MinIO - Stockage d'images cloud")
	log.Println("   ✅ Twilio - SMS et vérifications")
	log.Println("   ✅ Quotas - Système de monétisation")
	
	return a.router.Run(":" + port)
}