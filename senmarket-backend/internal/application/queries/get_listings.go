// internal/application/queries/get_listings.go
package queries

import "github.com/google/uuid"

// GetListingsQuery - Query pour récupérer des annonces avec filtres
type GetListingsQuery struct {
	CategoryID *uuid.UUID `json:"category_id,omitempty"`
	Region     *string    `json:"region,omitempty"`
	MinPrice   *float64   `json:"min_price,omitempty"`
	MaxPrice   *float64   `json:"max_price,omitempty"`
	Status     *string    `json:"status,omitempty"`
	Search     *string    `json:"search,omitempty"`
	Limit      int        `json:"limit" validate:"min=1,max=100"`
	Offset     int        `json:"offset" validate:"min=0"`
}

// SetDefaults - Applique les valeurs par défaut
func (q *GetListingsQuery) SetDefaults() {
	if q.Limit == 0 {
		q.Limit = 20
	}
	if q.Status == nil {
		status := "active"
		q.Status = &status
	}
}
