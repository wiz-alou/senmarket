// internal/application/handlers/command_handler.go
package handlers

import (
	"context"
	"senmarket/internal/application/commands"
)

// CommandHandler interface générique pour les handlers de commandes
type CommandHandler[TCommand any, TResult any] interface {
	Handle(ctx context.Context, command TCommand) (TResult, error)
}

// CommandBus bus de commandes
type CommandBus interface {
	// Send envoie une commande et retourne le résultat
	Send(ctx context.Context, command interface{}) (interface{}, error)
	
	// Register enregistre un handler pour un type de commande
	Register(commandType string, handler interface{}) error
}

// CommandBusImpl implémentation du bus de commandes
type CommandBusImpl struct {
	handlers map[string]interface{}
}

// NewCommandBus crée un nouveau bus de commandes
func NewCommandBus() CommandBus {
	return &CommandBusImpl{
		handlers: make(map[string]interface{}),
	}
}

// Send envoie une commande
func (b *CommandBusImpl) Send(ctx context.Context, command interface{}) (interface{}, error) {
	// TODO: Implémenter la logique de routing des commandes
	// Pour l'instant, retourner nil
	return nil, nil
}

// Register enregistre un handler
func (b *CommandBusImpl) Register(commandType string, handler interface{}) error {
	b.handlers[commandType] = handler
	return nil
}

// CommandHandlers structure qui contient tous les handlers de commandes
type CommandHandlers struct {
	CreateUser      *commands.CreateUserHandler
	CreateListing   *commands.CreateListingHandler
	UpdateListing   *commands.UpdateListingHandler
	DeleteListing   *commands.DeleteListingHandler
	PublishListing  *commands.PublishListingHandler
	ProcessPayment  *commands.ProcessPaymentHandler
	VerifyUser      *commands.VerifyUserHandler
	UpdateQuota     *commands.UpdateQuotaHandler
}

// NewCommandHandlers crée une nouvelle instance des handlers de commandes
func NewCommandHandlers(
	createUser *commands.CreateUserHandler,
	createListing *commands.CreateListingHandler,
	updateListing *commands.UpdateListingHandler,
	deleteListing *commands.DeleteListingHandler,
	publishListing *commands.PublishListingHandler,
	processPayment *commands.ProcessPaymentHandler,
	verifyUser *commands.VerifyUserHandler,
	updateQuota *commands.UpdateQuotaHandler,
) *CommandHandlers {
	return &CommandHandlers{
		CreateUser:     createUser,
		CreateListing:  createListing,
		UpdateListing:  updateListing,
		DeleteListing:  deleteListing,
		PublishListing: publishListing,
		ProcessPayment: processPayment,
		VerifyUser:     verifyUser,
		UpdateQuota:    updateQuota,
	}
}
