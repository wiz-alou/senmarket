// internal/handlers/category_handler.go
package handlers

import (
	"net/http"

	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
)

type CategoryHandler struct {
	categoryService *services.CategoryService
}

func NewCategoryHandler(categoryService *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{
		categoryService: categoryService,
	}
}

// GetCategories godoc
// @Summary Lister les catégories
// @Description Récupère toutes les catégories actives
// @Tags categories
// @Produce json
// @Success 200 {array} models.Category
// @Router /categories [get]
func (h *CategoryHandler) GetCategories(c *gin.Context) {
	categories, err := h.categoryService.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": categories,
	})
}

// GetCategoriesWithStats godoc
// @Summary Catégories avec statistiques
// @Description Récupère les catégories avec le nombre d'annonces
// @Tags categories
// @Produce json
// @Success 200 {array} services.CategoryWithStats
// @Router /categories/stats [get]
func (h *CategoryHandler) GetCategoriesWithStats(c *gin.Context) {
	categories, err := h.categoryService.GetCategoriesWithStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": categories,
	})
}

// GetCategory godoc
// @Summary Détail d'une catégorie
// @Description Récupère une catégorie par ID
// @Tags categories
// @Produce json
// @Param id path string true "ID de la catégorie"
// @Success 200 {object} models.Category
// @Failure 404 {object} map[string]interface{}
// @Router /categories/{id} [get]
func (h *CategoryHandler) GetCategory(c *gin.Context) {
	id := c.Param("id")
	
	category, err := h.categoryService.GetCategoryByID(id)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrCategoryNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": category,
	})
}

// GetCategoryBySlug godoc
// @Summary Catégorie par slug
// @Description Récupère une catégorie par son slug
// @Tags categories
// @Produce json
// @Param slug path string true "Slug de la catégorie"
// @Success 200 {object} models.Category
// @Failure 404 {object} map[string]interface{}
// @Router /categories/slug/{slug} [get]
func (h *CategoryHandler) GetCategoryBySlug(c *gin.Context) {
	slug := c.Param("slug")
	
	category, err := h.categoryService.GetCategoryBySlug(slug)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrCategoryNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": category,
	})
}

// GetListingsByCategory godoc
// @Summary Annonces par catégorie
// @Description Récupère les annonces d'une catégorie
// @Tags categories
// @Produce json
// @Param id path string true "ID de la catégorie"
// @Param region query string false "Région"
// @Param min_price query number false "Prix minimum"
// @Param max_price query number false "Prix maximum"
// @Param search query string false "Terme de recherche"
// @Param sort query string false "Tri" Enums(date, price_asc, price_desc, views)
// @Param page query int false "Page" default(1)
// @Param limit query int false "Limite par page" default(20)
// @Success 200 {object} services.ListingResponse
// @Failure 404 {object} map[string]interface{}
// @Router /categories/{id}/listings [get]
func (h *CategoryHandler) GetListingsByCategory(c *gin.Context) {
	categoryID := c.Param("id")
	
	var query services.ListingQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Paramètres invalides",
			"details": err.Error(),
		})
		return
	}

	response, err := h.categoryService.GetListingsByCategory(categoryID, &query)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrCategoryNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": response,
	})
}

// GetCategoryStats godoc
// @Summary Statistiques d'une catégorie
// @Description Récupère les statistiques détaillées d'une catégorie
// @Tags categories
// @Produce json
// @Param id path string true "ID de la catégorie"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /categories/{id}/stats [get]
func (h *CategoryHandler) GetCategoryStats(c *gin.Context) {
	categoryID := c.Param("id")
	
	stats, err := h.categoryService.GetCategoryStats(categoryID)
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrCategoryNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}