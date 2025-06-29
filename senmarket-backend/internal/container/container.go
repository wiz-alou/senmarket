// internal/container/container.go
package container

import (
	"log"
	"time"
	
	"gorm.io/gorm"
	"github.com/redis/go-redis/v9"
	"github.com/minio/minio-go/v7"
	
	// Domain
	"senmarket/internal/domain/repositories"
	
	// Application
	"senmarket/internal/application/commands"
	"senmarket/internal/application/queries"
	"senmarket/internal/application/services"
	
	// Infrastructure
	"senmarket/internal/infrastructure/persistence/postgres"
	redisRepo "senmarket/internal/infrastructure/persistence/redis"
	"senmarket/internal/infrastructure/storage"
	"senmarket/internal/infrastructure/messaging/sms"
	"senmarket/internal/infrastructure/messaging/email"
	"senmarket/internal/infrastructure/messaging/payments"
	"senmarket/internal/infrastructure/config"
	
	// Presentation
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
)

// Container conteneur d'injection de dépendances
type Container struct {
	// Configuration
	Config      *config.Environment
	DBConfig    *config.DatabaseConfig
	RedisConfig *config.RedisConfig
	MinIOConfig *config.MinIOConfig
	
	// Infrastructure
	DB          *gorm.DB
	Redis       *redis.Client
	MinIOClient *minio.Client
	
	// Repositories
	UserRepository    repositories.UserRepository
	ListingRepository repositories.ListingRepository
	PaymentRepository repositories.PaymentRepository
	CacheRepository   repositories.CacheRepository
	
	// Application Services
	AuthService         services.AuthService
	ImageService        services.ImageService
	AnalyticsService    services.AnalyticsApplicationService
	NotificationService services.NotificationApplicationService
	
	// Infrastructure Services - AVEC VOTRE TWILIO SERVICE
	TwilioService  *sms.TwilioService       // ⭐ VOTRE SERVICE
	EmailService   email.EmailProvider
	PaymentService payments.PaymentProvider
	StorageService storage.StorageProvider
	
	// Command Handlers
	CreateUserHandler     *commands.CreateUserHandler
	CreateListingHandler  *commands.CreateListingHandler
	UpdateListingHandler  *commands.UpdateListingHandler
	DeleteListingHandler  *commands.DeleteListingHandler
	PublishListingHandler *commands.PublishListingHandler
	ProcessPaymentHandler *commands.ProcessPaymentHandler
	VerifyUserHandler     *commands.VerifyUserHandler
	UpdateQuotaHandler    *commands.UpdateQuotaHandler
	
	// Query Handlers
	GetUserHandler        *queries.GetUserHandler
	GetListingsHandler    *queries.GetListingsHandler
	SearchListingsHandler *queries.SearchListingsHandler
	GetUserStatsHandler   *queries.GetUserStatsHandler
	GetCategoriesHandler  *queries.GetCategoriesHandler
	GetPaymentsHandler    *queries.GetPaymentsHandler
	GetDashboardHandler   *queries.GetDashboardHandler
	
	// Controllers
	UserController    *controllers.UserController
	ListingController *controllers.ListingController
	PaymentController *controllers.PaymentController
	HealthController  *controllers.HealthController
	
	// Middleware
	AuthMiddleware *middleware.AuthMiddleware
}

// NewContainer crée un nouveau container avec toutes les dépendances
func NewContainer(db *gorm.DB, redisClient *redis.Client, minioClient *minio.Client) *Container {
	log.Println("🏗️ Création du container...")
	
	container := &Container{
		DB:          db,
		Redis:       redisClient,
		MinIOClient: minioClient,
	}
	
	// Initialiser dans l'ordre des dépendances
	container.initConfig()
	container.initRepositories()
	container.initInfrastructureServices()
	container.initApplicationServices()
	container.initCommandHandlers()
	container.initQueryHandlers()
	container.initMiddleware()
	container.initControllers()
	
	log.Println("✅ Container DI initialisé avec succès")
	return container
}

// initConfig initialise la configuration
func (c *Container) initConfig() {
	c.Config = config.LoadEnvironment()
	c.DBConfig = config.LoadDatabaseConfig()
	c.RedisConfig = config.LoadRedisConfig()
	c.MinIOConfig = config.LoadMinIOConfig()
	
	log.Println("📋 Configuration chargée")
}

// initRepositories initialise les repositories
func (c *Container) initRepositories() {
	c.UserRepository = postgres.NewUserRepository(c.DB)
	c.ListingRepository = postgres.NewListingRepository(c.DB)
	c.PaymentRepository = postgres.NewPaymentRepository(c.DB)
	c.CacheRepository = redisRepo.NewCacheRepository(c.Redis)
	
	log.Println("🗄️ Repositories initialisés")
}

// ⭐ SECTION MODIFIÉE : initInfrastructureServices
func (c *Container) initInfrastructureServices() {
	log.Println("🔧 Initialisation des services d'infrastructure...")
	
	// ⭐ VOTRE SERVICE TWILIO SMS (ne pas toucher)
	c.TwilioService = sms.NewTwilioService()
	
	// ⭐ Storage Service (ne pas toucher)
	if c.MinIOClient != nil && c.MinIOConfig != nil {
		c.StorageService = storage.NewMinIOService(
			c.MinIOClient,
			c.MinIOConfig.Endpoint,
			c.MinIOConfig.UseSSL,
		)
		log.Printf("✅ MinIO Storage configuré: %s", c.MinIOConfig.Endpoint) // ⭐ JUSTE CETTE LIGNE AJOUTÉE
	}
	
	log.Println("✅ Services d'infrastructure initialisés")
	log.Printf("📱 Twilio SMS configuré: %v", c.TwilioService.IsConfigured())
}

// initApplicationServices initialise les services d'application
func (c *Container) initApplicationServices() {
	log.Println("🎯 Initialisation des services d'application...")
	
	// AuthService avec JWT
	jwtSecret := "senmarket-dev-secret-2025"
	if c.Config != nil && c.Config.JWTSecret != "" {
		jwtSecret = c.Config.JWTSecret
	}
	
	jwtExpiry := 24 * time.Hour
	if c.Config != nil && c.Config.JWTExpiry > 0 {
		jwtExpiry = c.Config.JWTExpiry
	}
	
	c.AuthService = services.NewAuthService(
		c.UserRepository,
		jwtSecret,
		jwtExpiry,
	)
	
	log.Println("✅ Services d'application initialisés")
}

// initCommandHandlers initialise les handlers de commandes
func (c *Container) initCommandHandlers() {
	// Create User Handler
	c.CreateUserHandler = commands.NewCreateUserHandler(
		c.UserRepository,
		nil, // eventPublisher - TODO: implémenter
	)
	
	// Verify User Handler
	c.VerifyUserHandler = commands.NewVerifyUserHandler(
		c.UserRepository,
		nil, // eventPublisher - TODO: implémenter
	)
	
	// Update Quota Handler
	c.UpdateQuotaHandler = commands.NewUpdateQuotaHandler(
		c.UserRepository,
		nil, // eventPublisher - TODO: implémenter
	)
	
	// Create Listing Handler
	c.CreateListingHandler = commands.NewCreateListingHandler(
		c.UserRepository,
		c.ListingRepository,
		nil, // quotaService - TODO: implémenter
		nil, // validationService - TODO: implémenter
		nil, // eventPublisher - TODO: implémenter
	)
	
	// Update Listing Handler
	c.UpdateListingHandler = commands.NewUpdateListingHandler(c.ListingRepository)
	
	// Delete Listing Handler
	c.DeleteListingHandler = commands.NewDeleteListingHandler(c.ListingRepository)
	
	// Publish Listing Handler
	c.PublishListingHandler = commands.NewPublishListingHandler(
		c.ListingRepository,
		c.UserRepository,
		nil, // eventPublisher - TODO: implémenter
	)
	
	// Process Payment Handler
	c.ProcessPaymentHandler = commands.NewProcessPaymentHandler(
		c.PaymentRepository,
		c.UserRepository,
		nil, // eventPublisher - TODO: implémenter
	)
	
	log.Println("⚡ Command handlers initialisés")
}

// initQueryHandlers initialise les handlers de requêtes
func (c *Container) initQueryHandlers() {
	// Get User Handler
	c.GetUserHandler = queries.NewGetUserHandler(c.UserRepository)
	
	// Get Listings Handler
	c.GetListingsHandler = queries.NewGetListingsHandler(c.ListingRepository)
	
	// Search Listings Handler
	c.SearchListingsHandler = queries.NewSearchListingsHandler(c.ListingRepository)
	
	// Get User Stats Handler
	c.GetUserStatsHandler = queries.NewGetUserStatsHandler(
		c.UserRepository,
		c.ListingRepository,
	)
	
	// Get Categories Handler
	c.GetCategoriesHandler = queries.NewGetCategoriesHandler()
	
	// Get Payments Handler
	c.GetPaymentsHandler = queries.NewGetPaymentsHandler(c.PaymentRepository)
	
	// Get Dashboard Handler
	c.GetDashboardHandler = queries.NewGetDashboardHandler(
		c.UserRepository,
		c.ListingRepository,
		c.PaymentRepository,
		nil, // quotaService - TODO: implémenter
		nil, // analyticsService - TODO: implémenter
	)
	
	log.Println("🔍 Query handlers initialisés")
}

// initMiddleware initialise les middlewares
func (c *Container) initMiddleware() {
	// AuthMiddleware avec le service d'authentification
	c.AuthMiddleware = middleware.NewAuthMiddleware(c.AuthService)
	
	log.Println("🛡️ Middlewares initialisés")
}

// ⭐ SECTION MODIFIÉE : initControllers
func (c *Container) initControllers() {
	// User Controller (ne pas toucher)
	c.UserController = controllers.NewUserController(
		c.CreateUserHandler,
		c.VerifyUserHandler,
		c.UpdateQuotaHandler,
		c.GetUserHandler,
		c.GetUserStatsHandler,
	)
	
	// Listing Controller (ne pas toucher)
	c.ListingController = controllers.NewListingController(
		c.CreateListingHandler,
		c.UpdateListingHandler,
		c.DeleteListingHandler,
		c.PublishListingHandler,
		c.GetListingsHandler,
		c.SearchListingsHandler,
	)
	
	// Payment Controller (ne pas toucher)
	c.PaymentController = controllers.NewPaymentController(
		c.ProcessPaymentHandler,
		c.GetPaymentsHandler,
	)
	
	// ⭐ SEULE MODIFICATION : Health Controller avec type assertion sécurisée
	var minioService *storage.MinIOService
	if c.StorageService != nil {
		// Type assertion sécurisée
		if ms, ok := c.StorageService.(*storage.MinIOService); ok {
			minioService = ms
		}
	}
	
	c.HealthController = controllers.NewHealthController(c.TwilioService, minioService)
	
	log.Println("🎮 Controllers initialisés")
}