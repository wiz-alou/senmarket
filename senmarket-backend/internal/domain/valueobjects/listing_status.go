// internal/domain/valueobjects/listing_status.go
package valueobjects

import "fmt"

// ListingStatus - Value Object pour le statut des annonces
type ListingStatus string

const (
	ListingStatusDraft   ListingStatus = "draft"
	ListingStatusActive  ListingStatus = "active"
	ListingStatusSold    ListingStatus = "sold"
	ListingStatusExpired ListingStatus = "expired"
)

// NewListingStatus crée et valide un statut d'annonce
func NewListingStatus(status string) (ListingStatus, error) {
	s := ListingStatus(status)
	if !s.IsValid() {
		return "", fmt.Errorf("statut d'annonce invalide: %s", status)
	}
	return s, nil
}

// IsValid vérifie si le statut est valide
func (s ListingStatus) IsValid() bool {
	switch s {
	case ListingStatusDraft, ListingStatusActive, ListingStatusSold, ListingStatusExpired:
		return true
	default:
		return false
	}
}

// String retourne le statut en string
func (s ListingStatus) String() string {
	return string(s)
}

// GetDisplayName retourne le nom à afficher
func (s ListingStatus) GetDisplayName() string {
	switch s {
	case ListingStatusDraft:
		return "Brouillon"
	case ListingStatusActive:
		return "Publiée"
	case ListingStatusSold:
		return "Vendue"
	case ListingStatusExpired:
		return "Expirée"
	default:
		return "Statut Inconnu"
	}
}