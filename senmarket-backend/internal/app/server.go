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
	"senmarket/internal/utils"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Application struct {
	config      *config.Config
	db          *gorm.DB
	redis       *redis.Client
	router      *gin.Engine
	authService *auth.Service
	jwtService  *auth.JWTService
	middleware  *auth.Middleware
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
	smsService := utils.NewMockSMSService() // Mock pour le développement
	authService := auth.NewService(db, jwtService, smsService)
	authMiddleware := auth.NewMiddleware(jwtService, authService)

	app := &Application{
		config:      cfg,
		db:          db,
		redis:       redisClient,
		router:      gin.New(),
		authService: authService,
		jwtService:  jwtService,
		middleware:  authMiddleware,
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

		// Routes d'authentification (publiques)
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/verify", authHandler.VerifyPhone)
			auth.POST("/send-code", authHandler.SendVerificationCode)
		}

		// Routes protégées (authentification requise)
		protected := api.Group("/")
		protected.Use(a.middleware.RequireAuth())
		{
			protected.GET("/auth/profile", authHandler.Profile)
			protected.PUT("/auth/profile", authHandler.UpdateProfile)
		}

		// Routes nécessitant une vérification (utilisateur vérifié)
		verified := api.Group("/")
		verified.Use(a.middleware.RequireVerifiedUser())
		{
			// TODO: Ajouter les routes pour listings, payments, etc.
			verified.GET("/dashboard", func(c *gin.Context) {
				user, _ := c.Get("user")
				c.JSON(http.StatusOK, gin.H{
					"message": "Bienvenue sur votre dashboard !",
					"user":    user,
				})
			})
		}

		// Routes avec authentification optionnelle
		public := api.Group("/")
		public.Use(a.middleware.OptionalAuth())
		{
			// TODO: Routes publiques avec auth optionnelle (listings publics)
			public.GET("/listings", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{
					"message": "Liste des annonces (publique)",
				})
			})
		}
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