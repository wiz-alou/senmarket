// internal/application/queries/get_user_quota.go
package queries

import "github.com/google/uuid"

// GetUserQuotaQuery - Query pour récupérer le quota d'un utilisateur
type GetUserQuotaQuery struct {
	UserID uuid.UUID `json:"user_id" validate:"required"`
	Month  *int      `json:"month,omitempty"`
	Year   *int      `json:"year,omitempty"`
}
