package events

import (
	"context"
	"time"
	"github.com/google/uuid"
)

type EventHandler interface {
	Handle(ctx context.Context, event DomainEvent) error
	CanHandle(eventType string) bool
}

type EventBus interface {
	Publish(ctx context.Context, event DomainEvent) error
	Subscribe(eventType string, handler EventHandler) error
	Unsubscribe(eventType string, handler EventHandler) error
}

type EventStore interface {
	Append(ctx context.Context, aggregateID uuid.UUID, events []DomainEvent) error
	GetEvents(ctx context.Context, aggregateID uuid.UUID, fromVersion int) ([]DomainEvent, error)
	GetAllEvents(ctx context.Context, fromTimestamp *time.Time, eventTypes []string) ([]DomainEvent, error)
}
