// internal/presentation/http/routes/listing_routes.go
package routes

import (
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
)

// ListingRoutes gestionnaire des routes annonces
type ListingRoutes struct {
	listingController *controllers.ListingController
	authMiddleware    *middleware.AuthMiddleware
}

// NewListingRoutes crée un nouveau gestionnaire de routes annonces
func NewListingRoutes(listingController *controllers.ListingController, authMiddleware *middleware.AuthMiddleware) *ListingRoutes {
	return &ListingRoutes{
		listingController: listingController,
		authMiddleware:    authMiddleware,
	}
}

// Setup configure les routes annonces
func (lr *ListingRoutes) Setup(rg *gin.RouterGroup) {
	listings := rg.Group("/listings")
	
	// Rate limiting spécifique aux annonces
	listings.Use(middleware.RateLimitByEndpoint(50, 60)) // 50 req/min
	
	{
		// Routes publiques
		public := listings.Group("")
		{
			public.GET("/", lr.listingController.GetListings)
			public.GET("/search", lr.listingController.SearchListings)
			public.GET("/promoted", lr.listingController.GetPromoted)
			public.GET("/recent", lr.listingController.GetRecent)
			public.GET("/popular", lr.GetPopular)
			public.GET("/categories/:category_id", lr.GetByCategory)
			public.GET("/regions/:region", lr.GetByRegion)
			public.GET("/:id", lr.listingController.GetListing)
			public.POST("/:id/view", lr.authMiddleware.OptionalAuth(), lr.RecordView)
			public.POST("/:id/contact", lr.authMiddleware.OptionalAuth(), lr.RecordContact)
		}
		
		// Routes protégées
		protected := listings.Group("", lr.authMiddleware.RequireAuth())
		{
			protected.POST("/", lr.listingController.CreateListing)
			protected.PUT("/:id", lr.listingController.UpdateListing)
			protected.DELETE("/:id", lr.listingController.DeleteListing)
			protected.POST("/:id/publish", lr.listingController.PublishListing)
			protected.POST("/:id/promote", lr.PromoteListing)
			protected.POST("/:id/mark-sold", lr.MarkAsSold)
			protected.POST("/:id/extend", lr.ExtendListing)
			protected.GET("/me", lr.listingController.GetUserListings)
			protected.GET("/user/:user_id", lr.listingController.GetUserListings)
		}
		
		// Routes admin
		admin := listings.Group("", lr.authMiddleware.RequireAuth(), lr.authMiddleware.RequireAdmin())
		{
			admin.GET("/admin/all", lr.GetAllListingsAdmin)
			admin.PUT("/:id/status", lr.UpdateListingStatus)
			admin.DELETE("/:id/admin", lr.AdminDeleteListing)
			admin.GET("/admin/stats", lr.GetListingStats)
		}
	}
}

// GetPopular récupère les annonces populaires
func (lr *ListingRoutes) GetPopular(c *gin.Context) {
	// TODO: Implémenter les annonces populaires
	c.JSON(200, gin.H{"message": "Popular listings - TODO"})
}

// GetByCategory récupère les annonces par catégorie
func (lr *ListingRoutes) GetByCategory(c *gin.Context) {
	// TODO: Implémenter les annonces par catégorie
	c.JSON(200, gin.H{"message": "Listings by category - TODO"})
}

// GetByRegion récupère les annonces par région
func (lr *ListingRoutes) GetByRegion(c *gin.Context) {
	// TODO: Implémenter les annonces par région
	c.JSON(200, gin.H{"message": "Listings by region - TODO"})
}

// RecordView enregistre une vue d'annonce
func (lr *ListingRoutes) RecordView(c *gin.Context) {
	// TODO: Implémenter l'enregistrement de vue
	c.JSON(200, gin.H{"message": "View recorded - TODO"})
}

// RecordContact enregistre un contact sur annonce
func (lr *ListingRoutes) RecordContact(c *gin.Context) {
	// TODO: Implémenter l'enregistrement de contact
	c.JSON(200, gin.H{"message": "Contact recorded - TODO"})
}

// PromoteListing promeut une annonce
func (lr *ListingRoutes) PromoteListing(c *gin.Context) {
	// TODO: Implémenter la promotion d'annonce
	c.JSON(200, gin.H{"message": "Promote listing - TODO"})
}

// MarkAsSold marque une annonce comme vendue
func (lr *ListingRoutes) MarkAsSold(c *gin.Context) {
	// TODO: Implémenter marquer comme vendu
	c.JSON(200, gin.H{"message": "Mark as sold - TODO"})
}

// ExtendListing prolonge une annonce
func (lr *ListingRoutes) ExtendListing(c *gin.Context) {
	// TODO: Implémenter la prolongation d'annonce
	c.JSON(200, gin.H{"message": "Extend listing - TODO"})
}

// GetAllListingsAdmin récupère toutes les annonces (admin)
func (lr *ListingRoutes) GetAllListingsAdmin(c *gin.Context) {
	// TODO: Implémenter la liste admin des annonces
	c.JSON(200, gin.H{"message": "All listings admin - TODO"})
}

// UpdateListingStatus met à jour le statut d'une annonce (admin)
func (lr *ListingRoutes) UpdateListingStatus(c *gin.Context) {
	// TODO: Implémenter la mise à jour de statut admin
	c.JSON(200, gin.H{"message": "Update listing status - TODO"})
}

// AdminDeleteListing supprime une annonce (admin)
func (lr *ListingRoutes) AdminDeleteListing(c *gin.Context) {
	// TODO: Implémenter la suppression admin
	c.JSON(200, gin.H{"message": "Admin delete listing - TODO"})
}

// GetListingStats récupère les statistiques des annonces (admin)
func (lr *ListingRoutes) GetListingStats(c *gin.Context) {
	// TODO: Implémenter les stats d'annonces
	c.JSON(200, gin.H{"message": "Listing stats - TODO"})
}
