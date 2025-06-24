// internal/models/user.go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
Phone       string         `json:"phone" gorm:"unique;not null" validate:"required,e164"`
Email       string         `json:"email" gorm:"unique" validate:"email"`
	PasswordHash string        `json:"-" gorm:"not null"`
	FirstName   string         `json:"first_name" gorm:"not null" validate:"required,min=2,max=50"`
	LastName    string         `json:"last_name" gorm:"not null" validate:"required,min=2,max=50"`
	AvatarURL   string         `json:"avatar_url"`
	Region      string         `json:"region" gorm:"not null" validate:"required"`
	IsVerified  bool           `json:"is_verified" gorm:"default:false"`
	IsPremium   bool           `json:"is_premium" gorm:"default:false"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
	
	// Relations
	Listings []Listing `json:"listings,omitempty" gorm:"foreignKey:UserID"`
	Payments []Payment `json:"payments,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook pour générer l'UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// TableName override le nom de table
func (User) TableName() string {
	return "users"
}

// GetFullName retourne le nom complet
func (u *User) GetFullName() string {
	return u.FirstName + " " + u.LastName
}

// IsActive vérifie si l'utilisateur est actif
func (u *User) IsActive() bool {
	return u.IsVerified && u.DeletedAt.Time.IsZero()
}