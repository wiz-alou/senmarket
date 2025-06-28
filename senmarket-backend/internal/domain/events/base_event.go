// internal/domain/events/base_event.go
package events

import (
	"time"
	"github.com/google/uuid"
)

// DomainEvent interface de base pour tous les événements
type DomainEvent interface {
	GetID() string
	GetAggregateID() string
	GetEventType() string
	GetOccurredAt() time.Time
	GetVersion() int
	GetData() interface{}
}

// BaseEvent structure de base pour les événements
type BaseEvent struct {
	ID          string                 `json:"id"`
	AggregateID string                 `json:"aggregate_id"`
	EventType   string                 `json:"event_type"`
	OccurredAt  time.Time              `json:"occurred_at"`
	Version     int                    `json:"version"`
	Data        map[string]interface{} `json:"data"`
}

// NewBaseEvent crée un nouvel événement de base
func NewBaseEvent(aggregateID, eventType string, data map[string]interface{}) *BaseEvent {
	return &BaseEvent{
		ID:          uuid.New().String(),
		AggregateID: aggregateID,
		EventType:   eventType,
		OccurredAt:  time.Now(),
		Version:     1,
		Data:        data,
	}
}

func (e *BaseEvent) GetID() string          { return e.ID }
func (e *BaseEvent) GetAggregateID() string { return e.AggregateID }
func (e *BaseEvent) GetEventType() string   { return e.EventType }
func (e *BaseEvent) GetOccurredAt() time.Time { return e.OccurredAt }
func (e *BaseEvent) GetVersion() int        { return e.Version }
func (e *BaseEvent) GetData() interface{}   { return e.Data }
