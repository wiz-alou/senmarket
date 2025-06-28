// internal/handlers/quota_handler.go
package handlers

import (
	"net/http"
	"strconv"

	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/go-playground/validator/v10"
)

type QuotaHandler struct {
	quotaService *services.QuotaService
	validator    *validator.Validate
}

func NewQuotaHandler(quotaService *services.QuotaService) *QuotaHandler {
	return &QuotaHandler{
		quotaService: quotaService,
		validator:    validator.New(),
	}
}

// GetQuotaStatus godoc
// @Summary Statut quota utilisateur
// @Description Récupère le statut complet du quota d'annonces de l'utilisateur connecté
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/status [get]
func (h *QuotaHandler) GetQuotaStatus(c *gin.Context) {
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
	
	status, err := h.quotaService.GetUserQuotaStatus(userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération statut quota",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": status,
	})
}

// CheckEligibility godoc
// @Summary Vérifier éligibilité création annonce
// @Description Vérifie si l'utilisateur peut créer une annonce gratuitement ou doit payer
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/check [get]
func (h *QuotaHandler) CheckEligibility(c *gin.Context) {
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
	
	eligibility, err := h.quotaService.CheckListingEligibility(userUUID)
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

// GetQuotaSummary godoc
// @Summary Résumé quota utilisateur
// @Description Récupère un résumé simplifié du quota pour l'interface utilisateur
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/summary [get]
func (h *QuotaHandler) GetQuotaSummary(c *gin.Context) {
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
	
	summary, err := h.quotaService.GetQuotaSummaryForUser(userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération résumé quota",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": summary,
	})
}

// GetQuotaHistory godoc
// @Summary Historique des quotas
// @Description Récupère l'historique des quotas mensuels de l'utilisateur
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Param months query int false "Nombre de mois d'historique" default(6)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/history [get]
func (h *QuotaHandler) GetQuotaHistory(c *gin.Context) {
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
	
	// Paramètre optionnel pour le nombre de mois
	months, _ := strconv.Atoi(c.DefaultQuery("months", "6"))
	if months <= 0 || months > 24 {
		months = 6
	}
	
	history, err := h.quotaService.GetUserQuotaHistory(userUUID, months)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération historique",
			"details": err.Error(),
		})
		return
	}
	
	// Formater la réponse avec des statistiques
	response := gin.H{
		"months_requested": months,
		"periods_found":    len(history),
		"history":          make([]gin.H, len(history)),
	}
	
	var totalFree, totalPaid int64
	for i, quota := range history {
		response["history"].([]gin.H)[i] = gin.H{
			"period":           quota.GetPeriodString(),
			"month":            quota.Month,
			"year":             quota.Year,
			"free_used":        quota.FreeListingsUsed,
			"free_limit":       quota.FreeListingsLimit,
			"paid_listings":    quota.PaidListings,
			"total_listings":   quota.FreeListingsUsed + quota.PaidListings,
			"quota_progress":   quota.GetProgress(),
			"is_current_month": quota.IsCurrentMonth(),
		}
		
		totalFree += int64(quota.FreeListingsUsed)
		totalPaid += int64(quota.PaidListings)
	}
	
	response["summary"] = gin.H{
		"total_free_used":  totalFree,
		"total_paid":       totalPaid,
		"total_listings":   totalFree + totalPaid,
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": response,
	})
}

// GetPlatformStats godoc
// @Summary Statistiques plateforme
// @Description Récupère les statistiques globales de la plateforme (quotas, utilisateurs, revenus)
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/platform-stats [get]
func (h *QuotaHandler) GetPlatformStats(c *gin.Context) {
	// Note: Dans une vraie application, vous voudriez probablement 
	// restreindre cet endpoint aux administrateurs seulement
	
	stats, err := h.quotaService.GetPlatformStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération statistiques",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": stats,
	})
}

// GetCurrentPhase godoc
// @Summary Phase actuelle
// @Description Récupère la phase actuelle de monétisation de la plateforme
// @Tags quota
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/current-phase [get]
func (h *QuotaHandler) GetCurrentPhase(c *gin.Context) {
	config, err := h.quotaService.GetGlobalConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération configuration",
			"details": err.Error(),
		})
		return
	}
	
	phaseInfo := gin.H{
		"current_phase":         config.GetCurrentPhase(),
		"is_launch_active":      config.IsFreeLaunchActive(),
		"launch_end_date":       config.LaunchPhaseEndDate,
		"days_until_launch_end": config.GetDaysUntilLaunchEnd(),
		"credit_system_active":  config.CreditSystemActive,
		"paid_system_active":    config.PaidSystemActive,
		"monthly_free_limit":    config.MonthlyFreeListings,
		"standard_price":        config.StandardListingPrice,
		"currency":              config.Currency,
	}
	
	// Messages selon la phase
	switch config.GetCurrentPhase() {
	case "launch":
		phaseInfo["phase_name"] = "Lancement gratuit"
		phaseInfo["phase_description"] = "Publication illimitée et gratuite pendant la période de lancement"
		phaseInfo["benefits"] = []string{
			"Annonces illimitées gratuites",
			"Toutes les fonctionnalités",
			"Aucun frais caché",
		}
		
	case "credit_system":
		phaseInfo["phase_name"] = "Système de crédits"
		phaseInfo["phase_description"] = "3 annonces gratuites par mois, puis payantes"
		phaseInfo["benefits"] = []string{
			"3 annonces gratuites/mois",
			"Prix compétitif pour les suivantes",
			"Réinitialisation mensuelle",
		}
		
	case "paid_system":
		phaseInfo["phase_name"] = "Système payant complet"
		phaseInfo["phase_description"] = "Toutes les annonces sont payantes avec options premium"
		phaseInfo["benefits"] = []string{
			"Packs avantageux disponibles",
			"Options premium (boost, couleur)",
			"Tarifs dégressifs",
		}
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": phaseInfo,
	})
}

// UpdateUserPhase godoc
// @Summary Mettre à jour phase utilisateur
// @Description Fait passer un utilisateur à la phase suivante (usage interne/admin)
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/update-phase [post]
func (h *QuotaHandler) UpdateUserPhase(c *gin.Context) {
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
	
	if err := h.quotaService.TransitionUserToNextPhase(userUUID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur transition phase",
			"details": err.Error(),
		})
		return
	}
	
	// Récupérer le nouveau statut
	newStatus, err := h.quotaService.GetUserQuotaStatus(userUUID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération nouveau statut",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Phase utilisateur mise à jour",
		"data": newStatus,
	})
}

// GetPricingInfo godoc
// @Summary Informations de tarification
// @Description Récupère toutes les informations de tarification actuelles
// @Tags quota
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/pricing [get]
func (h *QuotaHandler) GetPricingInfo(c *gin.Context) {
	config, err := h.quotaService.GetGlobalConfig()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur récupération configuration",
			"details": err.Error(),
		})
		return
	}
	
	pricingInfo := config.GetPricingInfo()
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": pricingInfo,
	})
}

// CleanupQuotas godoc
// @Summary Nettoyer anciens quotas
// @Description Supprime les quotas anciens (plus de 12 mois) - endpoint admin
// @Tags quota
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Router /quota/cleanup [post]
func (h *QuotaHandler) CleanupQuotas(c *gin.Context) {
	// Note: Dans une vraie application, cet endpoint devrait être 
	// restreint aux administrateurs et appelé par un cron job
	
	if err := h.quotaService.CleanupOldQuotas(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur nettoyage quotas",
			"details": err.Error(),
		})
		return
	}
	
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Nettoyage des anciens quotas effectué",
	})
}