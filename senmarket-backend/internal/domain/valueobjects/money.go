// internal/domain/valueobjects/money.go
package valueobjects

import "fmt"

// Money - Value Object pour représenter un montant avec devise
type Money struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}

// NewMoney crée un nouveau Money
func NewMoney(amount float64, currency string) Money {
	return Money{
		Amount:   amount,
		Currency: currency,
	}
}

// String retourne la représentation string
func (m Money) String() string {
	return fmt.Sprintf("%.2f %s", m.Amount, m.Currency)
}

// Equals compare deux Money
func (m Money) Equals(other Money) bool {
	return m.Amount == other.Amount && m.Currency == other.Currency
}