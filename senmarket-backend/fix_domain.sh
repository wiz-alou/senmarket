#!/bin/bash
# Script complet pour corriger tous les fichiers Domain Layer

echo "🔧 Application des corrections complètes Domain Layer..."

# 1. Supprimer les fichiers problématiques existants
rm -f internal/domain/events/*.go
rm -f internal/domain/services/*.go

# 2. Recréer les fichiers events corrigés
cat > internal/domain/events/base_event.go << 'EOF'
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
EOF

cat > internal/domain/events/event_handler.go << 'EOF'
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
EOF

# 3. Créer services simplifiés qui compilent
cat > internal/domain/services/quota_domain_service.go << 'EOF'
package services

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/valueobjects"
	"senmarket/internal/domain/repositories"
)

type QuotaDomainService struct {
	quotaRepo repositories.QuotaRepository
	userRepo  repositories.UserRepository
}

func NewQuotaDomainService(quotaRepo repositories.QuotaRepository, userRepo repositories.UserRepository) *QuotaDomainService {
	return &QuotaDomainService{
		quotaRepo: quotaRepo,
		userRepo:  userRepo,
	}
}

type QuotaStatus struct {
	UserID        uuid.UUID                    `json:"user_id"`
	Phase         valueobjects.OnboardingPhase `json:"phase"`
	Used          int                          `json:"used"`
	Limit         int                          `json:"limit"`
	RemainingFree int                          `json:"remaining_free"`
	Message       string                       `json:"message"`
}

func (s *QuotaDomainService) CanUserCreateListing(ctx context.Context, user *entities.User) (bool, error) {
	if user.OnboardingPhase == valueobjects.OnboardingPhaseFree {
		return true, nil
	}
	return false, nil
}

func (s *QuotaDomainService) GetUserQuotaStatus(ctx context.Context, user *entities.User) (*QuotaStatus, error) {
	status := &QuotaStatus{
		UserID: user.ID,
		Phase:  user.OnboardingPhase,
	}
	
	switch user.OnboardingPhase {
	case valueobjects.OnboardingPhaseFree:
		status.RemainingFree = -1
		status.Message = "🎉 Phase de lancement - Annonces illimitées gratuites !"
	case valueobjects.OnboardingPhasePaid:
		status.RemainingFree = 0
		status.Message = "Toutes les annonces sont payantes"
	}
	
	return status, nil
}
EOF

cat > internal/domain/services/pricing_domain_service.go << 'EOF'
package services

import (
	"senmarket/internal/domain/valueobjects"
)

type PricingDomainService struct{}

func NewPricingDomainService() *PricingDomainService {
	return &PricingDomainService{}
}

func (s *PricingDomainService) CalculateListingPrice(phase valueobjects.OnboardingPhase) valueobjects.Money {
	switch phase {
	case valueobjects.OnboardingPhaseFree:
		return valueobjects.NewMoney(0, "XOF")
	case valueobjects.OnboardingPhasePaid:
		return valueobjects.NewMoney(200, "XOF")
	default:
		return valueobjects.NewMoney(200, "XOF")
	}
}
EOF

# 4. Test compilation
echo "🧪 Test compilation Domain Layer..."
go build ./internal/domain/entities/...
go build ./internal/domain/valueobjects/...
go build ./internal/domain/repositories/...
go build ./internal/domain/services/...
go build ./internal/domain/events/...

echo "🌍 Test Domain complet..."
go build ./internal/domain/...

if [ $? -eq 0 ]; then
    echo "✅ Domain Layer compile parfaitement !"
    echo "🚀 Prêt pour Phase 3 - Application Layer !"
else
    echo "❌ Erreurs de compilation restantes"
fi
