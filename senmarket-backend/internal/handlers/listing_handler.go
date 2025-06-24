// internal/handlers/listing_handler.go - MISE À JOUR COMPATIBLE
package handlers

import (
	"net/http"
	"strconv"

	"senmarket/internal/services"
	"github.com/google/uuid"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type ListingHandler struct {
	listingService *services.ListingService
	validator      *validator.Validate
}

func NewListingHandler(listingService *services.ListingService) *ListingHandler {
	return &ListingHandler{
		listingService: listingService,
		validator:      validator.New(),
	}
}

// CreateListing godoc
// @Summary Créer une annonce
// @Description Crée une nouvelle annonce
// @Tags listings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param listing body services.CreateListingRequest true "Données de l'annonce"
// @Success 201 {object} models.Listing
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /listings [post]
func (h *ListingHandler) CreateListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	var req services.CreateListingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Données invalides",
			"details": err.Error(),
		})
		return
	}

	// Validation
	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation échouée",
			"details": err.Error(),
		})
		return
	}

	// Créer l'annonce
	listing, err := h.listingService.CreateListing(userID.(string), &req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrInvalidCategory || err == services.ErrInvalidRegion {
			status = http.StatusBadRequest
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Annonce créée avec succès",
		"data": listing,
	})
}

// GetListings godoc
// @Summary Lister les annonces
// @Description Récupère la liste des annonces avec filtres et pagination
// @Tags listings
// @Produce json
// @Param category_id query string false "ID de la catégorie"
// @Param region query string false "Région"
// @Param min_price query number false "Prix minimum"
// @Param max_price query number false "Prix maximum"
// @Param search query string false "Terme de recherche"
// @Param sort query string false "Tri" Enums(date, price_asc, price_desc, views)
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} services.ListingResponse
// @Router /listings [get]
func (h *ListingHandler) GetListings(c *gin.Context) {
	var query services.ListingQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Paramètres invalides",
			"details": err.Error(),
		})
		return
	}

	// 🔴 Utiliser la nouvelle méthode GetListings2 qui retourne ListingResponse
	response, err := h.listingService.GetListings2(&query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// GetListing godoc
// @Summary Détail d'une annonce
// @Description Récupère les détails d'une annonce par ID
// @Tags listings
// @Produce json
// @Param id path string true "ID de l'annonce (UUID)"
// @Success 200 {object} models.Listing
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /listings/{id} [get]
func (h *ListingHandler) GetListing(c *gin.Context) {
	id := c.Param("id")
	
	// VALIDATION UUID
	if !isValidUUID(id) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID d'annonce invalide",
			"details": "L'ID doit être un UUID valide",
		})
		return
	}

	listing, err := h.listingService.GetListingByID(id)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrListingNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Incrémenter le compteur de vues (optionnel - en arrière-plan)
	go func() {
		// Note: Tu peux implémenter cette méthode dans ton service si elle n'existe pas
		// h.listingService.IncrementViews(id)
	}()

	c.JSON(http.StatusOK, gin.H{
		"data": listing,
	})
}

// UpdateListing godoc
// @Summary Modifier une annonce
// @Description Met à jour une annonce existante
// @Tags listings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de l'annonce"
// @Param listing body services.UpdateListingRequest true "Données à modifier"
// @Success 200 {object} models.Listing
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /listings/{id} [put]
func (h *ListingHandler) UpdateListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	id := c.Param("id")
	
	// VALIDATION UUID
	if !isValidUUID(id) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID d'annonce invalide",
			"details": "L'ID doit être un UUID valide",
		})
		return
	}
	
	var req services.UpdateListingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Données invalides",
			"details": err.Error(),
		})
		return
	}

	// Validation
	if err := h.validator.Struct(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Validation échouée",
			"details": err.Error(),
		})
		return
	}

	listing, err := h.listingService.UpdateListing(id, userID.(string), &req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case services.ErrListingNotFound:
			status = http.StatusNotFound
		case services.ErrUnauthorized:
			status = http.StatusForbidden
		case services.ErrInvalidRegion:
			status = http.StatusBadRequest
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Annonce mise à jour",
		"data": listing,
	})
}

// DeleteListing godoc
// @Summary Supprimer une annonce
// @Description Supprime une annonce
// @Tags listings
// @Security BearerAuth
// @Param id path string true "ID de l'annonce"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /listings/{id} [delete]
func (h *ListingHandler) DeleteListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	id := c.Param("id")
	
	// VALIDATION UUID
	if !isValidUUID(id) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID d'annonce invalide",
			"details": "L'ID doit être un UUID valide",
		})
		return
	}
	
	err := h.listingService.DeleteListing(id, userID.(string))
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case services.ErrListingNotFound:
			status = http.StatusNotFound
		case services.ErrUnauthorized:
			status = http.StatusForbidden
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Annonce supprimée",
	})
}

// PublishListing godoc
// @Summary Publier une annonce
// @Description Change le statut d'une annonce vers "published"
// @Tags listings
// @Security BearerAuth
// @Param id path string true "ID de l'annonce"
// @Success 200 {object} models.Listing
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /listings/{id}/publish [post]
func (h *ListingHandler) PublishListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	id := c.Param("id")
	
	// VALIDATION UUID
	if !isValidUUID(id) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID d'annonce invalide",
			"details": "L'ID doit être un UUID valide",
		})
		return
	}
	
	// 🔴 Utiliser UpdateListing pour changer le statut
	req := services.UpdateListingRequest{
		Status: stringPtr("published"),
	}
	
	listing, err := h.listingService.UpdateListing(id, userID.(string), &req)
	if err != nil {
		status := http.StatusInternalServerError
		switch err {
		case services.ErrListingNotFound:
			status = http.StatusNotFound
		case services.ErrUnauthorized:
			status = http.StatusForbidden
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Annonce publiée",
		"data": listing,
	})
}

// SearchListings godoc
// @Summary Rechercher des annonces
// @Description Recherche full-text dans les annonces
// @Tags listings
// @Produce json
// @Param q query string true "Terme de recherche"
// @Param category_id query string false "ID de la catégorie"
// @Param region query string false "Région"
// @Param min_price query number false "Prix minimum"
// @Param max_price query number false "Prix maximum"
// @Param sort query string false "Tri" Enums(date, price_asc, price_desc, views)
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} services.ListingResponse
// @Router /listings/search [get]
func (h *ListingHandler) SearchListings(c *gin.Context) {
	searchTerm := c.Query("q")
	if searchTerm == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Terme de recherche requis",
		})
		return
	}

	// 🔴 Construire les filtres à partir des query params
	filters := make(map[string]interface{})
	if categoryID := c.Query("category_id"); categoryID != "" {
		filters["category_id"] = categoryID
	}
	if region := c.Query("region"); region != "" {
		filters["region"] = region
	}
	if minPriceStr := c.Query("min_price"); minPriceStr != "" {
		if minPrice, err := strconv.ParseFloat(minPriceStr, 64); err == nil {
			filters["min_price"] = minPrice
		}
	}
	if maxPriceStr := c.Query("max_price"); maxPriceStr != "" {
		if maxPrice, err := strconv.ParseFloat(maxPriceStr, 64); err == nil {
			filters["max_price"] = maxPrice
		}
	}
	if sort := c.Query("sort"); sort != "" {
		filters["sort_by"] = sort
	}

	// 🔴 Utiliser la méthode SearchListings existante
	listings, err := h.listingService.SearchListings(searchTerm, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 🔴 Construire une réponse similaire à ListingResponse
	response := map[string]interface{}{
		"data": listings,
		"search_term": searchTerm,
		"count": len(listings),
	}

	c.JSON(http.StatusOK, response)
}

// GetMyListings godoc
// @Summary Mes annonces
// @Description Récupère les annonces de l'utilisateur connecté
// @Tags listings
// @Security BearerAuth
// @Produce json
// @Param status query string false "Statut" Enums(draft, published, sold, expired)
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} services.ListingResponse
// @Router /listings/my [get]
func (h *ListingHandler) GetMyListings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	// 🔴 Paramètres de pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	
	// 🔴 Construire les filtres
	filters := make(map[string]interface{})
	filters["user_id"] = userID.(string)
	
	if status := c.Query("status"); status != "" {
		filters["status"] = status
	}
	
	// 🔴 Utiliser la méthode GetListings existante
	listings, total, err := h.listingService.GetListings(page, limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 🔴 Construire la réponse
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	response := services.ListingResponse{
		Data: listings,
		Pagination: services.PaginationInfo{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// GetUserStats récupère les statistiques utilisateur
func (h *ListingHandler) GetUserStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	// 🔴 Placeholder pour les stats utilisateur
	// TODO: Implémenter la logique de récupération des stats
	stats := map[string]interface{}{
		"total_listings":     0,
		"active_listings":    0,
		"sold_listings":      0,
		"draft_listings":     0,
		"total_views":        0,
		"total_contacts":     0,
	}

	c.JSON(http.StatusOK, gin.H{
		"data": stats,
		"user_id": userID,
	})
}

// GetUserListings alias pour GetMyListings
func (h *ListingHandler) GetUserListings(c *gin.Context) {
	h.GetMyListings(c)
}

// Fonction utilitaire pour valider UUID
func isValidUUID(u string) bool {
	_, err := uuid.Parse(u)
	return err == nil
}

// Fonction utilitaire pour créer un pointeur vers string
func stringPtr(s string) *string {
	return &s
}