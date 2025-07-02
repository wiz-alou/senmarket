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
