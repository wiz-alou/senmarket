// internal/domain/entities/contact.go
package entities

import (
	"time"
	"github.com/google/uuid"
)

// Contact - Entité contact/message
type Contact struct {
	ID        uuid.UUID  `json:"id"`
	ListingID uuid.UUID  `json:"listing_id"`
	SenderID  *uuid.UUID `json:"sender_id"`
	Name      string     `json:"name"`
	Phone     string     `json:"phone"`
	Email     *string    `json:"email"`
	Message   string     `json:"message"`
	IsRead    bool       `json:"is_read"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// NewContact crée un nouveau contact
func NewContact(listingID uuid.UUID, senderID *uuid.UUID, name, phone, message string, email *string) *Contact {
	now := time.Now()
	
	return &Contact{
		ID:        uuid.New(),
		ListingID: listingID,
		SenderID:  senderID,
		Name:      name,
		Phone:     phone,
		Email:     email,
		Message:   message,
		IsRead:    false,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// MarkAsRead marque le contact comme lu
func (c *Contact) MarkAsRead() {
	c.IsRead = true
	c.UpdatedAt = time.Now()
}