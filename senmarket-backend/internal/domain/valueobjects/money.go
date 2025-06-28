// internal/domain/valueobjects/money.go
package valueobjects

import (
	"errors"
	"fmt"
)

// Money représente une valeur monétaire immutable
type Money struct {
	Amount   float64
	Currency string
}

// NewMoney crée une nouvelle instance Money avec validation
func NewMoney(amount float64, currency string) (*Money, error) {
	if amount < 0 {
		return nil, errors.New("le montant ne peut pas être négatif")
	}
	
	if currency == "" {
		currency = "XOF" // Devise par défaut pour le Sénégal
	}
	
	// Valider les devises supportées
	validCurrencies := map[string]bool{
		"XOF": true, // Franc CFA
		"EUR": true,
		"USD": true,
	}
	
	if !validCurrencies[currency] {
		return nil, fmt.Errorf("devise non supportée: %s", currency)
	}
	
	return &Money{
		Amount:   amount,
		Currency: currency,
	}, nil
}

// Add additionne deux montants de même devise
func (m *Money) Add(other *Money) (*Money, error) {
	if m.Currency != other.Currency {
		return nil, errors.New("impossible d'additionner des devises différentes")
	}
	
	return &Money{
		Amount:   m.Amount + other.Amount,
		Currency: m.Currency,
	}, nil
}

// Subtract soustrait deux montants de même devise
func (m *Money) Subtract(other *Money) (*Money, error) {
	if m.Currency != other.Currency {
		return nil, errors.New("impossible de soustraire des devises différentes")
	}
	
	if m.Amount < other.Amount {
		return nil, errors.New("le résultat ne peut pas être négatif")
	}
	
	return &Money{
		Amount:   m.Amount - other.Amount,
		Currency: m.Currency,
	}, nil
}

// IsZero vérifie si le montant est zéro
func (m *Money) IsZero() bool {
	return m.Amount == 0
}

// GreaterThan compare si ce montant est supérieur à un autre
func (m *Money) GreaterThan(other *Money) bool {
	if m.Currency != other.Currency {
		return false // Ne peut pas comparer des devises différentes
	}
	return m.Amount > other.Amount
}

// String retourne la représentation string du montant
func (m *Money) String() string {
	return fmt.Sprintf("%.2f %s", m.Amount, m.Currency)
}

// ToCents retourne le montant en centimes (pour éviter les problèmes de float)
func (m *Money) ToCents() int64 {
	return int64(m.Amount * 100)
}