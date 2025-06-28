// internal/domain/entities/user.go
package entities

import (
	"time"
	"senmarket/internal/domain/valueobjects"
)

// User représente un utilisateur dans le domaine métier
type User struct {
	ID                string                    `json:"id"`
	Phone             *valueobjects.Phone       `json:"phone"`
	Email             *valueobjects.Email       `json:"email,omitempty"`
	Region            *valueobjects.Region      `json:"region"`
	IsVerified        bool                      `json:"is_verified"`
	IsActive          bool                      `json:"is_active"`
	
	// Quotas pour la monétisation
	FreeListingsLeft  int                       `json:"free_listings_left"`
	PaidListings      int                       `json:"paid_listings"`
	TotalListings     int                       `json:"total_listings"`
	
	// Métadonnées
	CreatedAt         time.Time                 `json:"created_at"`
	UpdatedAt         time.Time                 `json:"updated_at"`
	LastLoginAt       *time.Time                `json:"last_login_at,omitempty"`
	VerifiedAt        *time.Time                `json:"verified_at,omitempty"`
}

// NewUser crée un nouvel utilisateur avec validation
func NewUser(phone string, region string) (*User, error) {
	phoneVO, err := valueobjects.NewPhone(phone)
	if err != nil {
		return nil, err
	}
	
	regionVO, err := valueobjects.NewRegion(region)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	
	return &User{
		Phone:            phoneVO,
		Region:           regionVO,
		IsVerified:       false,
		IsActive:         true,
		FreeListingsLeft: 3, // Par défaut 3 annonces gratuites
		PaidListings:     0,
		TotalListings:    0,
		CreatedAt:        now,
		UpdatedAt:        now,
	}, nil
}

// SetEmail définit l'email de l'utilisateur
func (u *User) SetEmail(email string) error {
	emailVO, err := valueobjects.NewEmail(email)
	if err != nil {
		return err
	}
	
	u.Email = emailVO
	u.UpdatedAt = time.Now()
	return nil
}

// Verify marque l'utilisateur comme vérifié
func (u *User) Verify() {
	u.IsVerified = true
	now := time.Now()
	u.VerifiedAt = &now
	u.UpdatedAt = now
}

// UpdateLastLogin met à jour la dernière connexion
func (u *User) UpdateLastLogin() {
	now := time.Now()
	u.LastLoginAt = &now
	u.UpdatedAt = now
}

// CanCreateFreeListing vérifie si l'utilisateur peut créer une annonce gratuite
func (u *User) CanCreateFreeListing() bool {
	return u.FreeListingsLeft > 0
}

// UseFreeListing utilise un slot d'annonce gratuite
func (u *User) UseFreeListing() error {
	if u.FreeListingsLeft <= 0 {
		return NewDomainError("plus d'annonces gratuites disponibles")
	}
	
	u.FreeListingsLeft--
	u.TotalListings++
	u.UpdatedAt = time.Now()
	return nil
}

// AddPaidListing ajoute une annonce payante
func (u *User) AddPaidListing() {
	u.PaidListings++
	u.TotalListings++
	u.UpdatedAt = time.Now()
}

// RefillFreeListings recharge les annonces gratuites (admin)
func (u *User) RefillFreeListings(count int) {
	u.FreeListingsLeft += count
	u.UpdatedAt = time.Now()
}

// Deactivate désactive l'utilisateur
func (u *User) Deactivate() {
	u.IsActive = false
	u.UpdatedAt = time.Now()
}

// Activate active l'utilisateur
func (u *User) Activate() {
	u.IsActive = true
	u.UpdatedAt = time.Now()
}

// GetPhoneNumber retourne le numéro de téléphone formaté
func (u *User) GetPhoneNumber() string {
	if u.Phone == nil {
		return ""
	}
	return u.Phone.String()
}

// GetEmailAddress retourne l'adresse email
func (u *User) GetEmailAddress() string {
	if u.Email == nil {
		return ""
	}
	return u.Email.String()
}

// GetRegionName retourne le nom de la région
func (u *User) GetRegionName() string {
	if u.Region == nil {
		return ""
	}
	return u.Region.String()
}

// UserListingStats statistiques des annonces d'un utilisateur
type UserListingStats struct {
	TotalListings    int     `json:"total_listings"`
	ActiveListings   int     `json:"active_listings"`
	ExpiredListings  int     `json:"expired_listings"`
	TotalViews       int64   `json:"total_views"`
	TotalContacts    int64   `json:"total_contacts"`
	SuccessRate      float64 `json:"success_rate"`
}