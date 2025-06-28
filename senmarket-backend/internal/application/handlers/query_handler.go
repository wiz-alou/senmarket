// internal/application/handlers/query_handler.go
package handlers

import (
	"context"
	"senmarket/internal/application/queries"
)

// QueryHandler interface générique pour les handlers de requêtes
type QueryHandler[TQuery any, TResult any] interface {
	Handle(ctx context.Context, query TQuery) (TResult, error)
}

// QueryBus bus de requêtes
type QueryBus interface {
	// Send envoie une requête et retourne le résultat
	Send(ctx context.Context, query interface{}) (interface{}, error)
	
	// Register enregistre un handler pour un type de requête
	Register(queryType string, handler interface{}) error
}

// QueryBusImpl implémentation du bus de requêtes
type QueryBusImpl struct {
	handlers map[string]interface{}
}

// NewQueryBus crée un nouveau bus de requêtes
func NewQueryBus() QueryBus {
	return &QueryBusImpl{
		handlers: make(map[string]interface{}),
	}
}

// Send envoie une requête
func (b *QueryBusImpl) Send(ctx context.Context, query interface{}) (interface{}, error) {
	// TODO: Implémenter la logique de routing des requêtes
	return nil, nil
}

// Register enregistre un handler
func (b *QueryBusImpl) Register(queryType string, handler interface{}) error {
	b.handlers[queryType] = handler
	return nil
}

// QueryHandlers structure qui contient tous les handlers de requêtes
type QueryHandlers struct {
	GetUser           *queries.GetUserHandler
	GetListings       *queries.GetListingsHandler
	SearchListings    *queries.SearchListingsHandler
	GetUserStats      *queries.GetUserStatsHandler
	GetCategories     *queries.GetCategoriesHandler
	GetPayments       *queries.GetPaymentsHandler
	GetDashboard      *queries.GetDashboardHandler
}

// NewQueryHandlers crée une nouvelle instance des handlers de requêtes
func NewQueryHandlers(
	getUser *queries.GetUserHandler,
	getListings *queries.GetListingsHandler,
	searchListings *queries.SearchListingsHandler,
	getUserStats *queries.GetUserStatsHandler,
	getCategories *queries.GetCategoriesHandler,
	getPayments *queries.GetPaymentsHandler,
	getDashboard *queries.GetDashboardHandler,
) *QueryHandlers {
	return &QueryHandlers{
		GetUser:        getUser,
		GetListings:    getListings,
		SearchListings: searchListings,
		GetUserStats:   getUserStats,
		GetCategories:  getCategories,
		GetPayments:    getPayments,
		GetDashboard:   getDashboard,
	}
}
