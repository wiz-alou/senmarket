// internal/container/container.go
package container

import (
	"log"
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
	Config *config.Environment
	DBConfig *config.DatabaseConfig
	RedisConfig *config.RedisConfig
	MinIOConfig *config.MinIOConfig
	
	// Infrastructure
	DB          *gorm.DB
	Redis       *redis.Client
	MinIOClient *minio.Client
	
	// Repositories
	UserRepository     repositories.UserRepository
	ListingRepository  repositories.ListingRepository
	PaymentRepository  repositories.PaymentRepository
	CacheRepository    repositories.CacheRepository
	
	// Domain Services (interfaces - seront implémentés plus tard)
	// QuotaService    services.QuotaService
	// PricingService  services.PricingService
	
	// Application Services
	AuthService         services.AuthService
	ImageService        services.ImageService
	AnalyticsService    services.AnalyticsApplicationService
	NotificationService services.NotificationApplicationService
	
	// Infrastructure Services
	SMSService     sms.SMSProvider
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

// initInfrastructureServices initialise les services d'infrastructure
func (c *Container) initInfrastructureServices() {
	// SMS Service
	c.SMSService = sms.NewTwilioSMSService(
		"", // TODO: Récupérer depuis env
		"", // TODO: Récupérer depuis env
		"", // TODO: Récupérer depuis env
	)
	
	// Email Service
	c.EmailService = email.NewSMTPEmailService(
		"", // TODO: Récupérer depuis env
		587, // TODO: Récupérer depuis env
		"", "", "", "",
	)
	
	// Payment Service - Orange Money par défaut
	c.PaymentService = payments.NewOrangeMoneyService(
		"", // TODO: Récupérer depuis env
		"", // TODO: Récupérer depuis env
		"", // TODO: Récupérer depuis env
	)
	
	// Storage Service
	c.StorageService = storage.NewMinIOService(
		c.MinIOClient,
		c.MinIOConfig.Endpoint,
		c.MinIOConfig.UseSSL,
	)
	
	log.Println("🔧 Services d'infrastructure initialisés")
}

// initApplicationServices initialise les services d'application
func (c *Container) initApplicationServices() {
	// Auth Service
	c.AuthService = services.NewAuthService(c.UserRepository)
	
	// Image Service
	c.ImageService = services.NewImageService()
	
	// Analytics Service - sera implémenté plus tard
	// c.AnalyticsService = services.NewAnalyticsApplicationService(...)
	
	// Notification Service - sera implémenté plus tard
	// c.NotificationService = services.NewNotificationApplicationService(...)
	
	log.Println("📱 Services d'application initialisés")
}

// initCommandHandlers initialise les handlers de commandes
func (c *Container) initCommandHandlers() {
	// Create User Handler
	c.CreateUserHandler = commands.NewCreateUserHandler(
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
		nil, // quotaService - TODO: implémenter
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
	c.AuthMiddleware = middleware.NewAuthMiddleware()
	
	log.Println("🛡️ Middlewares initialisés")
}

// initControllers initialise les controllers
func (c *Container) initControllers() {
	// User Controller
	c.UserController = controllers.NewUserController(
		c.CreateUserHandler,
		c.VerifyUserHandler,
		c.UpdateQuotaHandler,
		c.GetUserHandler,
		c.GetUserStatsHandler,
	)
	
	// Listing Controller
	c.ListingController = controllers.NewListingController(
		c.CreateListingHandler,
		c.UpdateListingHandler,
		c.DeleteListingHandler,
		c.PublishListingHandler,
		c.GetListingsHandler,
		c.SearchListingsHandler,
	)
	
	// Payment Controller
	c.PaymentController = controllers.NewPaymentController(
		c.ProcessPaymentHandler,
		c.GetPaymentsHandler,
	)
	
	// Health Controller
	c.HealthController = controllers.NewHealthController()
	
	log.Println("🎮 Controllers initialisés")
}
