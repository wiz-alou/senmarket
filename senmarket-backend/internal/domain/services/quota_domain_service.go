package services

import (
	"context"
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
