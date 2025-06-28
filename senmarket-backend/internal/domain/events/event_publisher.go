// internal/domain/events/event_publisher.go
package events

import (
	"context"
)

// EventPublisher interface pour publier les événements
type EventPublisher interface {
	// Publish publie un événement
	Publish(ctx context.Context, event DomainEvent) error
	
	// PublishBatch publie plusieurs événements
	PublishBatch(ctx context.Context, events []DomainEvent) error
}

// EventHandler interface pour gérer les événements
type EventHandler interface {
	// Handle traite un événement
	Handle(ctx context.Context, event DomainEvent) error
	
	// CanHandle vérifie si le handler peut traiter cet événement
	CanHandle(eventType string) bool
}

// EventBus interface pour le bus d'événements
type EventBus interface {
	// Subscribe abonne un handler à un type d'événement
	Subscribe(eventType string, handler EventHandler) error
	
	// Unsubscribe désabonne un handler
	Unsubscribe(eventType string, handler EventHandler) error
	
	// Publish publie un événement sur le bus
	Publish(ctx context.Context, event DomainEvent) error
}
