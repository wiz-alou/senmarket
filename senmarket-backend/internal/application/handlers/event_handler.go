// internal/application/handlers/event_handler.go
package handlers

import (
	"context"
	"senmarket/internal/domain/events"
)

// DomainEventHandler handler pour les événements du domaine
type DomainEventHandler interface {
	// Handle traite un événement du domaine
	Handle(ctx context.Context, event events.DomainEvent) error
	
	// CanHandle vérifie si le handler peut traiter cet événement
	CanHandle(eventType string) bool
}

// EventHandlers structure qui contient tous les handlers d'événements
type EventHandlers struct {
	// Ici on ajoutera les handlers spécifiques pour chaque type d'événement
}

// NewEventHandlers crée une nouvelle instance des handlers d'événements
func NewEventHandlers() *EventHandlers {
	return &EventHandlers{}
}
