// internal/domain/valueobjects/phone.go
package valueobjects

import (
	"errors"
	"regexp"
	"strings"
)

// Phone représente un numéro de téléphone validé
type Phone struct {
	Number      string
	CountryCode string
	IsValid     bool
}

// NewPhone crée et valide un numéro de téléphone
func NewPhone(number string) (*Phone, error) {
	// Nettoyer le numéro
	cleaned := cleanPhoneNumber(number)
	
	if cleaned == "" {
		return nil, errors.New("numéro de téléphone vide")
	}
	
	// Validation pour le Sénégal
	countryCode, isValid := validateSenegalPhone(cleaned)
	
	if !isValid {
		return nil, errors.New("format de téléphone invalide pour le Sénégal")
	}
	
	return &Phone{
		Number:      cleaned,
		CountryCode: countryCode,
		IsValid:     isValid,
	}, nil
}

// cleanPhoneNumber nettoie le numéro de téléphone
func cleanPhoneNumber(number string) string {
	// Supprimer les espaces, tirets, parenthèses
	cleaned := strings.ReplaceAll(number, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")
	cleaned = strings.ReplaceAll(cleaned, ".", "")
	
	return strings.TrimSpace(cleaned)
}

// validateSenegalPhone valide un numéro sénégalais
func validateSenegalPhone(number string) (string, bool) {
	// Formats acceptés pour le Sénégal:
	// +221XXXXXXXXX (international)
	// 221XXXXXXXXX (sans +)
	// 0XXXXXXXXX (national - 9 chiffres après le 0)
	// XXXXXXXXX (local - 9 chiffres)
	
	// Regex pour numéros sénégalais
	patterns := []struct {
		regex       string
		countryCode string
	}{
		{`^\+221[0-9]{9}$`, "+221"},           // +221XXXXXXXXX
		{`^221[0-9]{9}$`, "+221"},             // 221XXXXXXXXX
		{`^0[0-9]{8}$`, "+221"},               // 0XXXXXXXX (mobile)
		{`^[7][0-9]{8}$`, "+221"},             // 7XXXXXXXX (mobile direct)
		{`^[3][0-9]{8}$`, "+221"},             // 3XXXXXXXX (fixe direct)
	}
	
	for _, pattern := range patterns {
		matched, _ := regexp.MatchString(pattern.regex, number)
		if matched {
			return pattern.countryCode, true
		}
	}
	
	return "", false
}

// GetInternationalFormat retourne le format international
func (p *Phone) GetInternationalFormat() string {
	if !p.IsValid {
		return p.Number
	}
	
	// Si déjà au format international
	if strings.HasPrefix(p.Number, "+221") {
		return p.Number
	}
	
	// Si commence par 221
	if strings.HasPrefix(p.Number, "221") {
		return "+" + p.Number
	}
	
	// Si commence par 0 (format national)
	if strings.HasPrefix(p.Number, "0") {
		return "+221" + p.Number[1:]
	}
	
	// Si format local (7XXXXXXXX ou 3XXXXXXXX)
	if len(p.Number) == 9 {
		return "+221" + p.Number
	}
	
	return p.Number
}

// GetNationalFormat retourne le format national (0XXXXXXXX)
func (p *Phone) GetNationalFormat() string {
	international := p.GetInternationalFormat()
	if strings.HasPrefix(international, "+221") {
		return "0" + international[4:]
	}
	return p.Number
}

// String retourne la représentation string
func (p *Phone) String() string {
	return p.GetInternationalFormat()
}