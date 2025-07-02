// internal/infrastructure/container/container.go
package container

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
	
	// Domain
	"senmarket/internal/domain/repositories"
	domainservices "senmarket/internal/domain/services"
	
	// Application
	appservices "senmarket/internal/application/services"
	"senmarket/internal/application/handlers"
	
	// Infrastructure
	"senmarket/internal/infrastructure/persistence/postgres"
	redisrepo "senmarket/internal/infrastructure/persistence/redis"
	"senmarket/internal/infrastructure/external"
	
	// Services existants
	"senmarket/internal/services"
)

// Container - Conteneur d'injection de dépendances
type Container struct {
	// Database connections
	DB    *gorm.DB
	Redis *redis.Client
	
	// ===== REPOSITORIES =====
	UserRepo     repositories.UserRepository
	ListingRepo  repositories.ListingRepository
	CacheRepo    repositories.CacheRepository
	
	// ===== DOMAIN SERVICES =====
	QuotaDomainService   *domainservices.QuotaDomainService
	PricingDomainService *domainservices.PricingDomainService
	
	// ===== APPLICATION SERVICES =====
	BaseAppService *appservices.BaseService
	
	// ===== HANDLERS =====
	CreateUserHandler       *handlers.CreateUserHandler
	CreateListingHandler    *handlers.CreateListingHandler
	PublishListingHandler   *handlers.PublishListingHandler
	GetListingsHandler      *handlers.GetListingsHandler
	GetUserQuotaHandler     *handlers.GetUserQuotaHandler
	
	// ===== EXTERNAL SERVICE ADAPTERS =====
	TwilioAdapter  *external.TwilioSMSAdapter
	MinIOAdapter   *external.MinIOStorageAdapter
	PaymentAdapter *external.PaymentGatewayAdapter
}

// NewContainer - Constructeur du conteneur avec tes services existants
func NewContainer(
	db *gorm.DB,
	redisClient *redis.Client,
	twilioService *services.TwilioSMSService,
	imageService *services.ImageService,
	paymentService *services.PaymentService,
) *Container {
	
	// ===== 1. CRÉER LES REPOSITORY IMPLEMENTATIONS =====
	userRepo := postgres.NewPostgreSQLUserRepository(db)
	listingRepo := postgres.NewPostgreSQLListingRepository(db)
	cacheRepo := redisrepo.NewRedisCacheRepository(redisClient)
	
	// ===== 2. CRÉER LES DOMAIN SERVICES =====
	// Note: Tes Domain Services actuels n'ont pas besoin de repos pour la demo
	quotaDomainService := &domainservices.QuotaDomainService{}
	pricingDomainService := &domainservices.PricingDomainService{}
	
	// ===== 3. CRÉER LES APPLICATION SERVICES =====
	baseAppService := &appservices.BaseService{}
	
	// ===== 4. CRÉER LES HANDLERS =====
	createUserHandler := handlers.NewCreateUserHandler()
	createListingHandler := handlers.NewCreateListingHandler()
	publishListingHandler := handlers.NewPublishListingHandler()
	getListingsHandler := handlers.NewGetListingsHandler()
	getUserQuotaHandler := handlers.NewGetUserQuotaHandler()
	
	// ===== 5. CRÉER LES EXTERNAL SERVICE ADAPTERS =====
	twilioAdapter := external.NewTwilioSMSAdapter(twilioService)
	minioAdapter := external.NewMinIOStorageAdapter(imageService)
	paymentAdapter := external.NewPaymentGatewayAdapter(paymentService)
	
	return &Container{
		// Database connections
		DB:    db,
		Redis: redisClient,
		
		// Repositories
		UserRepo:    userRepo,
		ListingRepo: listingRepo,
		CacheRepo:   cacheRepo,
		
		// Domain Services
		QuotaDomainService:   quotaDomainService,
		PricingDomainService: pricingDomainService,
		
		// Application Services
		BaseAppService: baseAppService,
		
		// Handlers
		CreateUserHandler:     createUserHandler,
		CreateListingHandler:  createListingHandler,
		PublishListingHandler: publishListingHandler,
		GetListingsHandler:    getListingsHandler,
		GetUserQuotaHandler:   getUserQuotaHandler,
		
		// External Service Adapters
		TwilioAdapter:  twilioAdapter,
		MinIOAdapter:   minioAdapter,
		PaymentAdapter: paymentAdapter,
	}
}

// ===== GETTERS POUR FACILITER L'ACCÈS =====

// GetUserRepository - Récupérer le UserRepository
func (c *Container) GetUserRepository() repositories.UserRepository {
	return c.UserRepo
}

// GetListingRepository - Récupérer le ListingRepository
func (c *Container) GetListingRepository() repositories.ListingRepository {
	return c.ListingRepo
}

// GetCacheRepository - Récupérer le CacheRepository
func (c *Container) GetCacheRepository() repositories.CacheRepository {
	return c.CacheRepo
}

// GetCreateUserHandler - Récupérer le CreateUserHandler
func (c *Container) GetCreateUserHandler() *handlers.CreateUserHandler {
	return c.CreateUserHandler
}

// GetCreateListingHandler - Récupérer le CreateListingHandler
func (c *Container) GetCreateListingHandler() *handlers.CreateListingHandler {
	return c.CreateListingHandler
}

// GetGetListingsHandler - Récupérer le GetListingsHandler
func (c *Container) GetGetListingsHandler() *handlers.GetListingsHandler {
	return c.GetListingsHandler
}

// GetTwilioAdapter - Récupérer l'adapteur Twilio
func (c *Container) GetTwilioAdapter() *external.TwilioSMSAdapter {
	return c.TwilioAdapter
}

// GetMinIOAdapter - Récupérer l'adapteur MinIO
func (c *Container) GetMinIOAdapter() *external.MinIOStorageAdapter {
	return c.MinIOAdapter
}

// GetPaymentAdapter - Récupérer l'adapteur Payment
func (c *Container) GetPaymentAdapter() *external.PaymentGatewayAdapter {
	return c.PaymentAdapter
}
