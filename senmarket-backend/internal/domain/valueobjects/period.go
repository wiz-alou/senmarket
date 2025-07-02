// internal/domain/valueobjects/period.go
package valueobjects

import (
	"fmt"
	"time"
)

// Period - Value Object pour représenter une période (mois/année)
type Period struct {
	Month int `json:"month"`
	Year  int `json:"year"`
}

// NewPeriod crée une nouvelle période
func NewPeriod(month, year int) (Period, error) {
	if month < 1 || month > 12 {
		return Period{}, fmt.Errorf("mois invalide: %d", month)
	}
	if year < 2025 {
		return Period{}, fmt.Errorf("année invalide: %d", year)
	}
	
	return Period{Month: month, Year: year}, nil
}

// NewCurrentPeriod crée la période actuelle
func NewCurrentPeriod() Period {
	now := time.Now()
	return Period{
		Month: int(now.Month()),
		Year:  now.Year(),
	}
}

// String retourne la représentation string
func (p Period) String() string {
	return fmt.Sprintf("%02d/%d", p.Month, p.Year)
}

// Equals compare deux périodes
func (p Period) Equals(other Period) bool {
	return p.Month == other.Month && p.Year == other.Year
}

// IsBefore vérifie si cette période est avant l'autre
func (p Period) IsBefore(other Period) bool {
	if p.Year < other.Year {
		return true
	}
	if p.Year == other.Year && p.Month < other.Month {
		return true
	}
	return false
}