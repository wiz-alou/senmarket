// internal/handlers/contact_handler.go
package handlers

import (
	"net/http"
	"senmarket/internal/services"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type ContactHandler struct {
	contactService *services.ContactService
	validator      *validator.Validate
}

func NewContactHandler(contactService *services.ContactService) *ContactHandler {
	return &ContactHandler{
		contactService: contactService,
		validator:      validator.New(),
	}
}

// ContactSeller godoc
// @Summary Contacter le vendeur
// @Description Envoie un message au vendeur d'une annonce
// @Tags contacts
// @Accept json
// @Produce json
// @Param contact body services.CreateContactRequest true "Message de contact"
// @Success 201 {object} models.Contact
// @Failure 400 {object} map[string]interface{}
// @Router /contacts [post]
func (h *ContactHandler) ContactSeller(c *gin.Context) {
	var req services.CreateContactRequest
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

	// Obtenir l'ID utilisateur (optionnel pour contact)
	var senderID *string
	if userID, exists := c.Get("user_id"); exists {
		id := userID.(string)
		senderID = &id
	}

	contact, err := h.contactService.CreateContact(&req, senderID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Message envoyé au vendeur avec succès",
		"data": contact,
	})
}

// GetMyContacts godoc
// @Summary Mes contacts reçus
// @Description Récupère les contacts reçus pour mes annonces
// @Tags contacts
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.Contact
// @Failure 401 {object} map[string]interface{}
// @Router /contacts/my [get]
func (h *ContactHandler) GetMyContacts(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	contacts, err := h.contactService.GetUserContacts(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": contacts,
	})
}

// MarkContactAsRead godoc
// @Summary Marquer contact comme lu
// @Description Marque un contact comme lu
// @Tags contacts
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID du contact"
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Router /contacts/{id}/read [put]
func (h *ContactHandler) MarkContactAsRead(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	contactID := c.Param("id")
	
	err := h.contactService.MarkAsRead(contactID, userID.(string))
	if err != nil {
		status := http.StatusInternalServerError
		if err == services.ErrContactNotFound {
			status = http.StatusNotFound
		}
		
		c.JSON(status, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Contact marqué comme lu",
	})
}

// GetContactStats godoc
// @Summary Statistiques des contacts
// @Description Récupère les statistiques de contact de l'utilisateur
// @Tags contacts
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /contacts/stats [get]
func (h *ContactHandler) GetContactStats(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	stats, err := h.contactService.GetContactStats(userID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": stats,
	})
}