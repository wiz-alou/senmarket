// internal/domain/valueobjects/phone.go
package valueobjects

import (
	"fmt"
	"regexp"
	"strings"
)

// Phone - Value Object pour numéro de téléphone validé
type Phone struct {
	Number string `json:"number"`
}

// NewPhone crée et valide un numéro de téléphone sénégalais
func NewPhone(number string) (Phone, error) {
	cleaned := strings.ReplaceAll(number, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	
	// Validation format sénégalais
	senegalPattern := `^(\+221|221)?[0-9]{9}$`
	matched, _ := regexp.MatchString(senegalPattern, cleaned)
	
	if !matched {
		return Phone{}, fmt.Errorf("numéro de téléphone sénégalais invalide: %s", number)
	}
	
	// Normaliser avec +221
	if !strings.HasPrefix(cleaned, "+221") {
		if strings.HasPrefix(cleaned, "221") {
			cleaned = "+" + cleaned
		} else {
			cleaned = "+221" + cleaned
		}
	}
	
	return Phone{Number: cleaned}, nil
}

// String retourne le numéro formaté
func (p Phone) String() string {
	return p.Number
}