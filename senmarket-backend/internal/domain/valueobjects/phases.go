// internal/domain/valueobjects/phases.go
package valueobjects

import "fmt"

// ================================
// PHASES DE MONÉTISATION
// ================================

// OnboardingPhase représente la phase actuelle de monétisation de l'utilisateur
type OnboardingPhase string

const (
	OnboardingPhaseFree   OnboardingPhase = "free_launch" // Phase gratuite de lancement
	OnboardingPhaseCredit OnboardingPhase = "credit_system" // Phase avec système de crédits
	OnboardingPhasePaid   OnboardingPhase = "paid"         // Phase entièrement payante
)

// IsValid vérifie si la phase est valide
func (p OnboardingPhase) IsValid() bool {
	switch p {
	case OnboardingPhaseFree, OnboardingPhaseCredit, OnboardingPhasePaid:
		return true
	default:
		return false
	}
}

// String retourne la représentation string
func (p OnboardingPhase) String() string {
	return string(p)
}

// GetDisplayName retourne le nom à afficher
func (p OnboardingPhase) GetDisplayName() string {
	switch p {
	case OnboardingPhaseFree:
		return "Lancement Gratuit"
	case OnboardingPhaseCredit:
		return "Système de Crédits"
	case OnboardingPhasePaid:
		return "Système Payant"
	default:
		return "Phase Inconnue"
	}
}

// GetDescription retourne une description de la phase
func (p OnboardingPhase) GetDescription() string {
	switch p {
	case OnboardingPhaseFree:
		return "Annonces illimitées gratuites pendant le lancement"
	case OnboardingPhaseCredit:
		return "3 annonces gratuites par mois + annonces payantes"
	case OnboardingPhasePaid:
		return "Toutes les annonces sont payantes"
	default:
		return "Phase non définie"
	}
}

// ================================
// PHASE D'INSCRIPTION
// ================================

// RegistrationPhase représente la phase lors de l'inscription
type RegistrationPhase string

const (
	RegistrationPhaseLaunch     RegistrationPhase = "launch"     // Inscription pendant le lancement
	RegistrationPhaseTransition RegistrationPhase = "transition" // Inscription pendant la transition
	RegistrationPhasePaid       RegistrationPhase = "paid"       // Inscription en phase payante
)

// IsValid vérifie si la phase d'inscription est valide
func (r RegistrationPhase) IsValid() bool {
	switch r {
	case RegistrationPhaseLaunch, RegistrationPhaseTransition, RegistrationPhasePaid:
		return true
	default:
		return false
	}
}

// String retourne la représentation string
func (r RegistrationPhase) String() string {
	return string(r)
}

// ================================
// FACTORY FUNCTIONS
// ================================

// NewOnboardingPhase crée une nouvelle phase avec validation
func NewOnboardingPhase(phase string) (OnboardingPhase, error) {
	p := OnboardingPhase(phase)
	if !p.IsValid() {
		return "", fmt.Errorf("phase d'onboarding invalide: %s", phase)
	}
	return p, nil
}

// NewRegistrationPhase crée une nouvelle phase d'inscription avec validation
func NewRegistrationPhase(phase string) (RegistrationPhase, error) {
	r := RegistrationPhase(phase)
	if !r.IsValid() {
		return "", fmt.Errorf("phase d'inscription invalide: %s", phase)
	}
	return r, nil
}

// ================================
// HELPER FUNCTIONS
// ================================

// GetAllOnboardingPhases retourne toutes les phases d'onboarding
func GetAllOnboardingPhases() []OnboardingPhase {
	return []OnboardingPhase{
		OnboardingPhaseFree,
		OnboardingPhaseCredit,
		OnboardingPhasePaid,
	}
}

// GetAllRegistrationPhases retourne toutes les phases d'inscription
func GetAllRegistrationPhases() []RegistrationPhase {
	return []RegistrationPhase{
		RegistrationPhaseLaunch,
		RegistrationPhaseTransition,
		RegistrationPhasePaid,
	}
}