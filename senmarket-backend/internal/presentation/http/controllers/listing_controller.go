// internal/presentation/http/controllers/listing_controller.go
package controllers

import (
   "github.com/gin-gonic/gin"
   "senmarket/internal/application/commands"
   "senmarket/internal/application/queries"
   "senmarket/internal/presentation/http/responses"
   "senmarket/internal/presentation/http/validators"
)

// ListingController contrôleur pour les annonces
type ListingController struct {
   BaseController
   createListingHandler  *commands.CreateListingHandler
   updateListingHandler  *commands.UpdateListingHandler
   deleteListingHandler  *commands.DeleteListingHandler
   publishListingHandler *commands.PublishListingHandler
   getListingsHandler    *queries.GetListingsHandler
   searchListingsHandler *queries.SearchListingsHandler
}

// NewListingController crée un nouveau contrôleur annonce
func NewListingController(
   createListingHandler *commands.CreateListingHandler,
   updateListingHandler *commands.UpdateListingHandler,
   deleteListingHandler *commands.DeleteListingHandler,
   publishListingHandler *commands.PublishListingHandler,
   getListingsHandler *queries.GetListingsHandler,
   searchListingsHandler *queries.SearchListingsHandler,
) *ListingController {
   return &ListingController{
   	createListingHandler:  createListingHandler,
   	updateListingHandler:  updateListingHandler,
   	deleteListingHandler:  deleteListingHandler,
   	publishListingHandler: publishListingHandler,
   	getListingsHandler:    getListingsHandler,
   	searchListingsHandler: searchListingsHandler,
   }
}

// CreateListing crée une nouvelle annonce
func (ctrl *ListingController) CreateListing(c *gin.Context) {
   userID := ctrl.GetUserID(c)
   if userID == "" {
   	responses.SendUnauthorized(c, "Token requis")
   	return
   }
   
   var req validators.CreateListingRequest
   if !ctrl.ValidateAndBind(c, &req) {
   	return
   }
   
   cmd := &commands.CreateListingCommand{
   	UserID:      userID,
   	CategoryID:  req.CategoryID,
   	Title:       req.Title,
   	Description: req.Description,
   	Price:       req.Price,
   	Currency:    req.Currency,
   	Region:      req.Region,
   	Location:    req.Location,
   	Images:      req.Images,
   	IsPaid:      req.IsPaid,
   }
   
   result, err := ctrl.createListingHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendCreated(c, result, "Annonce créée avec succès")
}

// GetListing récupère une annonce par ID
func (ctrl *ListingController) GetListing(c *gin.Context) {
   listingID := c.Param("id")
   if listingID == "" {
   	responses.SendBadRequest(c, "ID annonce requis", nil)
   	return
   }
   
   query := &queries.GetListingByIDQuery{ListingID: listingID}
   result, err := ctrl.getListingsHandler.HandleGetListingByID(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Annonce récupérée")
}

// GetListings récupère une liste d'annonces avec filtres
func (ctrl *ListingController) GetListings(c *gin.Context) {
   var req validators.ListingFiltersRequest
   
   // Récupérer les paramètres de query
   req.CategoryID = c.Query("category_id")
   req.Region = c.Query("region")
   req.Status = c.Query("status")
   req.Page, req.Limit = ctrl.GetPaginationParams(c)
   
   // Valider les filtres
   if errors := validators.ValidateListingFilters(&req); len(errors) > 0 {
   	responses.SendValidationErrors(c, errors)
   	return
   }
   
   query := &queries.GetListingsQuery{
   	CategoryID:   stringPtr(req.CategoryID),
   	Region:       stringPtr(req.Region),
   	PriceMin:     req.PriceMin,
   	PriceMax:     req.PriceMax,
   	Status:       stringPtr(req.Status),
   	IsPromoted:   req.IsPromoted,
   	Offset:       ctrl.GetOffset(req.Page, req.Limit),
   	Limit:        req.Limit,
   }
   
   result, err := ctrl.getListingsHandler.HandleGetListings(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendPaginated(c, result.Listings, result.Total, req.Page, req.Limit, "Annonces récupérées")
}

// GetUserListings récupère les annonces d'un utilisateur
func (ctrl *ListingController) GetUserListings(c *gin.Context) {
   userID := c.Param("user_id")
   if userID == "" {
   	userID = ctrl.GetUserID(c) // Utiliser l'utilisateur connecté
   }
   
   if userID == "" {
   	responses.SendBadRequest(c, "ID utilisateur requis", nil)
   	return
   }
   
   page, limit := ctrl.GetPaginationParams(c)
   query := &queries.GetUserListingsQuery{
   	UserID: userID,
   	Offset: ctrl.GetOffset(page, limit),
   	Limit:  limit,
   }
   
   result, err := ctrl.getListingsHandler.HandleGetUserListings(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendPaginated(c, result.Listings, result.Total, page, limit, "Annonces utilisateur récupérées")
}

// SearchListings recherche des annonces
func (ctrl *ListingController) SearchListings(c *gin.Context) {
   var req validators.SearchListingRequest
   
   // Récupérer les paramètres
   req.Query = c.Query("q")
   req.CategoryID = c.Query("category_id")
   req.Region = c.Query("region")
   req.Page, req.Limit = ctrl.GetPaginationParams(c)
   
   // Valider la recherche
   if errors := validators.ValidateSearchListing(&req); len(errors) > 0 {
   	responses.SendValidationErrors(c, errors)
   	return
   }
   
   query := &queries.SearchListingsQuery{
   	Query:      req.Query,
   	CategoryID: stringPtr(req.CategoryID),
   	Region:     stringPtr(req.Region),
   	PriceMin:   req.PriceMin,
   	PriceMax:   req.PriceMax,
   	Offset:     ctrl.GetOffset(req.Page, req.Limit),
   	Limit:      req.Limit,
   }
   
   result, err := ctrl.searchListingsHandler.HandleSearchListings(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendPaginated(c, result.Listings, result.Total, req.Page, req.Limit, "Résultats de recherche")
}

// UpdateListing met à jour une annonce
func (ctrl *ListingController) UpdateListing(c *gin.Context) {
   userID := ctrl.GetUserID(c)
   if userID == "" {
   	responses.SendUnauthorized(c, "Token requis")
   	return
   }
   
   listingID := c.Param("id")
   if listingID == "" {
   	responses.SendBadRequest(c, "ID annonce requis", nil)
   	return
   }
   
   var req validators.UpdateListingRequest
   if !ctrl.ValidateAndBind(c, &req) {
   	return
   }
   
   cmd := &commands.UpdateListingCommand{
   	ListingID:   listingID,
   	UserID:      userID,
   	Title:       stringPtr(req.Title),
   	Description: stringPtr(req.Description),
   	Price:       req.Price,
   	Currency:    stringPtr(req.Currency),
   	Location:    stringPtr(req.Location),
   	Images:      req.Images,
   }
   
   result, err := ctrl.updateListingHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Annonce mise à jour")
}

// PublishListing publie une annonce
func (ctrl *ListingController) PublishListing(c *gin.Context) {
   userID := ctrl.GetUserID(c)
   if userID == "" {
   	responses.SendUnauthorized(c, "Token requis")
   	return
   }
   
   listingID := c.Param("id")
   if listingID == "" {
   	responses.SendBadRequest(c, "ID annonce requis", nil)
   	return
   }
   
   cmd := &commands.PublishListingCommand{
   	ListingID: listingID,
   	UserID:    userID,
   }
   
   result, err := ctrl.publishListingHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Annonce publiée avec succès")
}

// DeleteListing supprime une annonce
func (ctrl *ListingController) DeleteListing(c *gin.Context) {
   userID := ctrl.GetUserID(c)
   if userID == "" {
   	responses.SendUnauthorized(c, "Token requis")
   	return
   }
   
   listingID := c.Param("id")
   if listingID == "" {
   	responses.SendBadRequest(c, "ID annonce requis", nil)
   	return
   }
   
   cmd := &commands.DeleteListingCommand{
   	ListingID: listingID,
   	UserID:    userID,
   }
   
   result, err := ctrl.deleteListingHandler.Handle(c.Request.Context(), cmd)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendSuccess(c, result, "Annonce supprimée")
}

// GetPromoted récupère les annonces promues
func (ctrl *ListingController) GetPromoted(c *gin.Context) {
   limit := 10
   if l := c.Query("limit"); l != "" {
   	// Parse limit avec validation
   }
   
   query := &queries.GetPromotedListingsQuery{Limit: limit}
   result, err := ctrl.searchListingsHandler.HandleGetPromotedListings(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendList(c, result.Listings, result.Total, "Annonces promues")
}

// GetRecent récupère les annonces récentes
func (ctrl *ListingController) GetRecent(c *gin.Context) {
   limit := 20
   if l := c.Query("limit"); l != "" {
   	// Parse limit avec validation
   }
   
   query := &queries.GetRecentListingsQuery{Limit: limit}
   result, err := ctrl.searchListingsHandler.HandleGetRecentListings(c.Request.Context(), query)
   if err != nil {
   	responses.SendDomainError(c, err)
   	return
   }
   
   responses.SendList(c, result.Listings, result.Total, "Annonces récentes")
}

