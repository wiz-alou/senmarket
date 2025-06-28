// internal/presentation/http/controllers/base_controller.go
package controllers

import (
	"strconv"
	"github.com/gin-gonic/gin"
	"senmarket/internal/presentation/http/responses"
	"senmarket/internal/presentation/http/validators"
)

// BaseController contrôleur de base avec méthodes utilitaires
type BaseController struct{}

// GetPaginationParams extrait les paramètres de pagination
func (bc *BaseController) GetPaginationParams(c *gin.Context) (page int, limit int) {
	page = 1
	limit = 20
	
	if p := c.Query("page"); p != "" {
		if parsed, err := strconv.Atoi(p); err == nil && parsed > 0 {
			page = parsed
		}
	}
	
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}
	
	return page, limit
}

// GetUserID extrait l'ID utilisateur du contexte JWT
func (bc *BaseController) GetUserID(c *gin.Context) string {
	if userID, exists := c.Get("user_id"); exists {
		return userID.(string)
	}
	return ""
}

// ValidateAndBind valide et bind une requête JSON
func (bc *BaseController) ValidateAndBind(c *gin.Context, req interface{}) bool {
	// Bind la requête JSON
	if err := c.ShouldBindJSON(req); err != nil {
		responses.SendBadRequest(c, "Invalid JSON format", err.Error())
		return false
	}
	
	// Valider la structure
	if errors := validators.ValidateStruct(req); len(errors) > 0 {
		responses.SendValidationErrors(c, errors)
		return false
	}
	
	return true
}

// GetOffset calcule l'offset pour la pagination
func (bc *BaseController) GetOffset(page, limit int) int {
	return (page - 1) * limit
}
