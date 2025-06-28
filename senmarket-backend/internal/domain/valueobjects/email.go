// internal/domain/valueobjects/email.go
package valueobjects

import (
	"errors"
	"regexp"
	"strings"
)

// Email représente une adresse email validée
type Email struct {
	Address    string
	LocalPart  string
	DomainPart string
	IsValid    bool
}

// NewEmail crée et valide une adresse email
func NewEmail(address string) (*Email, error) {
	address = strings.TrimSpace(strings.ToLower(address))
	
	if address == "" {
		return nil, errors.New("adresse email vide")
	}
	
	// Validation basique du format email
	emailRegex := `^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$`
	matched, _ := regexp.MatchString(emailRegex, address)
	
	if !matched {
		return nil, errors.New("format d'email invalide")
	}
	
	// Séparer local et domain
	parts := strings.Split(address, "@")
	if len(parts) != 2 {
		return nil, errors.New("format d'email invalide")
	}
	
	localPart := parts[0]
	domainPart := parts[1]
	
	// Validations supplémentaires
	if len(localPart) == 0 || len(localPart) > 64 {
		return nil, errors.New("partie locale de l'email invalide")
	}
	
	if len(domainPart) == 0 || len(domainPart) > 255 {
		return nil, errors.New("domaine de l'email invalide")
	}
	
	return &Email{
		Address:    address,
		LocalPart:  localPart,
		DomainPart: domainPart,
		IsValid:    true,
	}, nil
}

// GetDomain retourne le domaine de l'email
func (e *Email) GetDomain() string {
	return e.DomainPart
}

// IsGmail vérifie si c'est un email Gmail
func (e *Email) IsGmail() bool {
	return e.DomainPart == "gmail.com"
}

// IsYahoo vérifie si c'est un email Yahoo
func (e *Email) IsYahoo() bool {
	return strings.Contains(e.DomainPart, "yahoo.")
}

// IsCorporate vérifie si c'est un email d'entreprise (non Gmail/Yahoo/Hotmail)
func (e *Email) IsCorporate() bool {
	commonProviders := []string{
		"gmail.com", "yahoo.com", "yahoo.fr", "hotmail.com", 
		"hotmail.fr", "outlook.com", "live.com",
	}
	
	for _, provider := range commonProviders {
		if e.DomainPart == provider {
			return false
		}
	}
	
	return true
}

// String retourne l'adresse email
func (e *Email) String() string {
	return e.Address
}