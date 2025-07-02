package events

import (
	"time"
	"github.com/google/uuid"
)

type DomainEvent interface {
	GetID() uuid.UUID
	GetEventType() string
	GetOccurredAt() time.Time
	GetAggregateID() uuid.UUID
	GetVersion() int
}

type BaseEvent struct {
	ID          uuid.UUID `json:"id"`
	EventType   string    `json:"event_type"`
	OccurredAt  time.Time `json:"occurred_at"`
	AggregateID uuid.UUID `json:"aggregate_id"`
	Version     int       `json:"version"`
}

func (e BaseEvent) GetID() uuid.UUID { return e.ID }
func (e BaseEvent) GetEventType() string { return e.EventType }
func (e BaseEvent) GetOccurredAt() time.Time { return e.OccurredAt }
func (e BaseEvent) GetAggregateID() uuid.UUID { return e.AggregateID }
func (e BaseEvent) GetVersion() int { return e.Version }

func NewBaseEvent(eventType string, aggregateID uuid.UUID) BaseEvent {
	return BaseEvent{
		ID:          uuid.New(),
		EventType:   eventType,
		OccurredAt:  time.Now(),
		AggregateID: aggregateID,
		Version:     1,
	}
}
