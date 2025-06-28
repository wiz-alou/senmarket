// internal/presentation/http/controllers/user_controller.go
package controllers

import (
   "github.com/gin-gonic/gin"
   "senmarket/internal/application/commands"
   "senmarket/internal/application/queries"
   "senmarket/internal/presentation/http/responses"
   "senmarket/internal/presentation/http/validators"
)

// UserController contrôleur pour les utilisateurs
type UserController struct {
   BaseController
   createUserHandler  *commands.CreateUserHandler
   verifyUserHandler  *commands.VerifyUserHandler
   updateQuotaHandler *commands.UpdateQuotaHandler
   getUserHandler     *queries.GetUserHandler
   getUserStatsHandler *queries.GetUserStatsHandler
}

// NewUserController crée un nouveau contrôleur utilisateur
func NewUserController(
   createUserHandler *commands.CreateUserHandler,
   verifyUserHandler *commands.VerifyUserHandler,
   updateQuotaHandler *commands.UpdateQuotaHandler,
   getUserHandler *queries.GetUserHandler,
   getUserStatsHandler *queries.GetUserStatsHandler,
) *UserController {
   return &UserController{
   	createUserHandler:   createUserHandler,
   	verifyUserHandler:   verifyUserHandler,
   	updateQuotaHandler:  updateQuotaHandler,
   	getUserHandler:      getUserHandler,
   	getUserStatsHandler: getUserStatsHandler,
   }
}

// CreateUser crée un nouvel utilisateur
func (ctrl *UserController) CreateUser(c *gin.Context) {
   var req validators.CreateUserRequest
   if !ctrl.ValidateAndBind(c, &req) {
   	return
   }
   
   cmd := &commands.CreateUserCommand{
   	Phone:  req.Phone,
   	Region: req.Region,
   	Email:  req.Email,
   }
   
   result, err := ctrl.createUserHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendCreated(c, result, "Utilisateur créé avec succès")
}

// GetUser récupère un utilisateur par ID
func (ctrl *UserController) GetUser(c *gin.Context) {
   userID := c.Param("id")
   if userID == "" {
   	responses.SendBadRequest(c, "ID utilisateur requis", nil)
   	return
   }
   
   query := &queries.GetUserQuery{UserID: userID}
   result, err := ctrl.getUserHandler.HandleGetUser(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Utilisateur récupéré avec succès")
}

// GetCurrentUser récupère l'utilisateur connecté
func (ctrl *UserController) GetCurrentUser(c *gin.Context) {
   userID := ctrl.GetUserID(c)
   if userID == "" {
   	responses.SendUnauthorized(c, "Token requis")
   	return
   }
   
   query := &queries.GetUserQuery{UserID: userID}
   result, err := ctrl.getUserHandler.HandleGetUser(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Profil utilisateur récupéré")
}

// GetUserByPhone récupère un utilisateur par téléphone
func (ctrl *UserController) GetUserByPhone(c *gin.Context) {
   phone := c.Query("phone")
   if phone == "" {
   	responses.SendBadRequest(c, "Numéro de téléphone requis", nil)
   	return
   }
   
   query := &queries.GetUserByPhoneQuery{Phone: phone}
   result, err := ctrl.getUserHandler.HandleGetUserByPhone(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Utilisateur trouvé")
}

// VerifyUser vérifie un utilisateur avec un code
func (ctrl *UserController) VerifyUser(c *gin.Context) {
   var req validators.VerifyUserRequest
   if !ctrl.ValidateAndBind(c, &req) {
   	return
   }
   
   cmd := &commands.VerifyUserCommand{
   	UserID:           req.UserID,
   	VerificationCode: req.VerificationCode,
   	Method:           req.Method,
   }
   
   result, err := ctrl.verifyUserHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Utilisateur vérifié avec succès")
}

// GetUserStats récupère les statistiques d'un utilisateur
func (ctrl *UserController) GetUserStats(c *gin.Context) {
   userID := c.Param("id")
   if userID == "" {
   	userID = ctrl.GetUserID(c) // Utiliser l'utilisateur connecté
   }
   
   if userID == "" {
   	responses.SendBadRequest(c, "ID utilisateur requis", nil)
   	return
   }
   
   query := &queries.GetUserStatsQuery{UserID: userID}
   result, err := ctrl.getUserStatsHandler.HandleGetUserStats(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Statistiques récupérées")
}

// GetUserQuota récupère les quotas d'un utilisateur
func (ctrl *UserController) GetUserQuota(c *gin.Context) {
   userID := ctrl.GetUserID(c)
   if userID == "" {
   	responses.SendUnauthorized(c, "Token requis")
   	return
   }
   
   query := &queries.GetUserQuotaQuery{UserID: userID}
   result, err := ctrl.getUserStatsHandler.HandleGetUserQuota(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Quotas récupérés")
}

// UpdateUserQuota met à jour les quotas (admin seulement)
func (ctrl *UserController) UpdateUserQuota(c *gin.Context) {
   userID := c.Param("id")
   if userID == "" {
   	responses.SendBadRequest(c, "ID utilisateur requis", nil)
   	return
   }
   
   var req struct {
   	FreeListings *int   `json:"free_listings"`
   	PaidListings *int   `json:"paid_listings"`
   	Reason       string `json:"reason"`
   }
   
   if !ctrl.ValidateAndBind(c, &req) {
   	return
   }
   
   adminUserID := ctrl.GetUserID(c)
   cmd := &commands.UpdateQuotaCommand{
   	UserID:       userID,
   	FreeListings: req.FreeListings,
   	PaidListings: req.PaidListings,
   	Reason:       req.Reason,
   	AdminUserID:  adminUserID,
   }
   
   result, err := ctrl.updateQuotaHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Quotas mis à jour")
}
