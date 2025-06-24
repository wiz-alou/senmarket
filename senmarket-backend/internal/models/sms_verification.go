// internal/models/sms_verification.go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type SMSVerification struct {
	ID        uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	Phone     string    `json:"phone" gorm:"not null"`
	Code      string    `json:"code" gorm:"not null"`
	Verified  bool      `json:"verified" gorm:"default:false"`
	ExpiresAt time.Time `json:"expires_at"`
	CreatedAt time.Time `json:"created_at"`
}

// BeforeCreate hook
func (s *SMSVerification) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// TableName override
func (SMSVerification) TableName() string {
	return "sms_verifications"
}

// IsExpired vérifie si le code a expiré
func (s *SMSVerification) IsExpired() bool {
	return time.Now().After(s.ExpiresAt)
}

// IsValid vérifie si le code est valide
func (s *SMSVerification) IsValid() bool {
	return !s.Verified && !s.IsExpired()
}