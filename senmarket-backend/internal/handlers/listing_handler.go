// internal/handlers/listing_handler.go - VERSION MISE À JOUR AVEC QUOTAS
package handlers

import (
	"net/http"
	"strconv"

	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
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
// @Summary Créer une annonce avec gestion des quotas
// @Description Crée une nouvelle annonce en respectant les quotas et phases de monétisation
// @Tags listings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param listing body services.CreateListingRequest true "Données de l'annonce"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 403 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /listings [post]
func (h *ListingHandler) CreateListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID utilisateur invalide",
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

	// 🆕 Vérifier l'éligibilité avant création
	eligibility, err := h.listingService.CheckListingEligibility(userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur vérification éligibilité",
			"details": err.Error(),
		})
		return
	}

	// 🆕 Créer avec gestion des quotas
	listing, err := h.listingService.CreateListingWithQuota(userUUID, &req)
	if err != nil {
		// Gestion spécifique de l'erreur de quota épuisé
		if err == services.ErrNoFreeListingsLeft {
			c.JSON(http.StatusForbidden, gin.H{
				"error": "Quota d'annonces gratuites épuisé",
				"details": "Vous avez utilisé toutes vos annonces gratuites pour ce mois. Payez 200 FCFA pour publier une annonce supplémentaire.",
				"eligibility": eligibility,
			})
			return
		}
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur création annonce",
			"details": err.Error(),
		})
		return
	}

	// 🆕 Construire la réponse selon le statut de l'annonce
	response := gin.H{
		"success": true,
		"data": listing,
		"eligibility": eligibility,
	}

	if listing.Status == "active" {
		// Publication gratuite réussie
		response["status"] = "published_free"
		response["message"] = "🎉 Votre annonce a été publiée GRATUITEMENT !"
		response["info"] = "Votre annonce est maintenant visible par tous les utilisateurs"
		
		// Informations sur les quotas restants
		if quotaStatus, err := h.listingService.GetUserQuotaStatus(userUUID); err == nil {
			response["quota_status"] = quotaStatus
		}
		
	} else if listing.Status == "draft" {
		// Annonce créée en brouillon (paiement requis)
		response["status"] = "draft_payment_required"
		response["message"] = "Annonce créée en brouillon"
		response["info"] = "Votre annonce est sauvegardée. Effectuez un paiement pour la publier."
		response["payment_required"] = gin.H{
			"amount": 200.00,
			"currency": "XOF",
			"payment_url": "/api/v1/listings/" + listing.ID.String() + "/pay",
		}
	}

	c.JSON(http.StatusCreated, response)
}

// 🆕 CheckEligibility godoc
// @Summary Vérifier éligibilité création annonce
// @Description Vérifie si l'utilisateur peut créer une annonce gratuitement avant de commencer le processus
// @Tags listings
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /listings/check-eligibility [get]
func (h *ListingHandler) CheckEligibility(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID utilisateur invalide",
		})
		return
	}

	eligibility, err := h.listingService.CheckListingEligibility(userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur vérification éligibilité",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": eligibility,
	})
}

// 🆕 PublishListing godoc
// @Summary Publier une annonce en brouillon
// @Description Publie une annonce en brouillon après vérification du paiement
// @Tags listings
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de l'annonce"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /listings/{id}/publish [post]
func (h *ListingHandler) PublishListing(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID utilisateur invalide",
		})
		return
	}

	listingID := c.Param("id")
	listingUUID, err := uuid.Parse(listingID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID annonce invalide",
		})
		return
	}

	// Publier l'annonce (cette méthode vérifie automatiquement les paiements)
	err = h.listingService.PublishListingAfterPayment(listingUUID, userUUID)
	if err != nil {
		if err == services.ErrListingNotFound {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Annonce non trouvée ou non autorisée",
			})
			return
		}
		
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur publication annonce",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "💳 Annonce publiée avec succès après paiement !",
		"data": gin.H{
			"listing_id": listingID,
			"status": "active",
			"published_at": "now",
		},
	})
}

// GetListings godoc (existant, pas de changement majeur)
// @Summary Récupérer les annonces
// @Description Récupère la liste des annonces avec pagination et filtres
// @Tags listings
// @Produce json
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Param category_id query string false "ID catégorie"
// @Param region query string false "Région"
// @Param min_price query number false "Prix minimum"
// @Param max_price query number false "Prix maximum"
// @Param search query string false "Recherche"
// @Param sort query string false "Tri" Enums(newest, oldest, price_asc, price_desc, views)
// @Success 200 {object} map[string]interface{}
// @Router /listings [get]
func (h *ListingHandler) GetListings(c *gin.Context) {
	// Paramètres de pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	// Paramètres de filtrage
	filters := map[string]interface{}{}
	
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
	
	if search := c.Query("search"); search != "" {
		filters["search"] = search
	}
	
	if sort := c.Query("sort"); sort != "" {
		filters["sort"] = sort
	}

	listings, total, err := h.listingService.GetListings(page, limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Calcul des pages
	pages := int((total + int64(limit) - 1) / int64(limit))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"listings": listings,
			"pagination": gin.H{
				"page":        page,
				"limit":       limit,
				"total":       total,
				"pages":       pages,
				"has_next":    page < pages,
				"has_prev":    page > 1,
			},
		},
	})
}

// GetListing godoc (existant, pas de changement)
// @Summary Récupérer une annonce
// @Description Récupère les détails d'une annonce par son ID
// @Tags listings
// @Produce json
// @Param id path string true "ID de l'annonce"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /listings/{id} [get]
func (h *ListingHandler) GetListing(c *gin.Context) {
	id := c.Param("id")
	
	listing, err := h.listingService.GetListing(id)
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

	// Incrémenter les vues
	go func() {
		h.listingService.IncrementViews(id)
	}()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": listing,
	})
}

// GetMyListings godoc (existant avec ajout du statut quota)
// @Summary Mes annonces
// @Description Récupère les annonces de l'utilisateur connecté avec statut des quotas
// @Tags listings
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /listings/my [get]
func (h *ListingHandler) GetMyListings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	userUUID, err := uuid.Parse(userID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID utilisateur invalide",
		})
		return
	}

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	listings, total, err := h.listingService.GetMyListings(userID.(string), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// 🆕 Ajouter le statut des quotas dans la réponse
	quotaStatus, err := h.listingService.GetUserQuotaStatus(userUUID)
	if err != nil {
		// Log l'erreur mais ne pas échouer la requête
		quotaStatus = gin.H{"error": "Impossible de récupérer le statut des quotas"}
	}

	// Calcul des pages
	pages := int((total + int64(limit) - 1) / int64(limit))

	// Statistiques rapides des annonces
	var activeCount, draftCount, expiredCount int64
	for _, listing := range listings {
		switch listing.Status {
		case "active":
			activeCount++
		case "draft":
			draftCount++
		case "expired":
			expiredCount++
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"listings": listings,
			"pagination": gin.H{
				"page":     page,
				"limit":    limit,
				"total":    total,
				"pages":    pages,
				"has_next": page < pages,
				"has_prev": page > 1,
			},
			"stats": gin.H{
				"total_listings":  total,
				"active_listings": activeCount,
				"draft_listings":  draftCount,
				"expired_listings": expiredCount,
			},
			"quota_status": quotaStatus,
		},
	})
}

// UpdateListing, DeleteListing, SearchListings restent identiques...
// (Je les inclus pour la complétude mais sans changement majeur)

// UpdateListing godoc
// @Summary Mettre à jour une annonce
// @Description Met à jour une annonce existante
// @Tags listings
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID de l'annonce"
// @Param listing body services.UpdateListingRequest true "Données à mettre à jour"
// @Success 200 {object} map[string]interface{}
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

	listingID := c.Param("id")
	
	var req services.UpdateListingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Données invalides",
			"details": err.Error(),
		})
		return
	}

	listing, err := h.listingService.UpdateListing(listingID, userID.(string), &req)
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Annonce mise à jour avec succès",
		"data": listing,
	})
}

// DeleteListing godoc
// @Summary Supprimer une annonce
// @Description Supprime une annonce (soft delete)
// @Tags listings
// @Produce json
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

	listingID := c.Param("id")
	
	err := h.listingService.DeleteListing(listingID, userID.(string))
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

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Annonce supprimée avec succès",
	})
}

// SearchListings godoc
// @Summary Rechercher des annonces
// @Description Recherche dans les titres et descriptions des annonces
// @Tags listings
// @Produce json
// @Param q query string true "Terme de recherche"
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /listings/search [get]
func (h *ListingHandler) SearchListings(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Paramètre de recherche 'q' requis",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	listings, total, err := h.listingService.SearchListings(query, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	pages := int((total + int64(limit) - 1) / int64(limit))

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"listings": listings,
			"search_query": query,
			"pagination": gin.H{
				"page":     page,
				"limit":    limit,
				"total":    total,
				"pages":    pages,
				"has_next": page < pages,
				"has_prev": page > 1,
			},
		},
	})
}