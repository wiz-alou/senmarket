// internal/domain/entities/listing.go
package entities

import (
	"time"
	"github.com/google/uuid"
	"senmarket/internal/domain/valueobjects"
)

// Listing - Entité annonce
type Listing struct {
	ID          uuid.UUID `json:"id"`
	UserID      uuid.UUID `json:"user_id"`
	CategoryID  uuid.UUID `json:"category_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	Currency    string    `json:"currency"`
	Region      string    `json:"region"`
	Status      string    `json:"status"` // draft, active, sold, expired
	ViewsCount  int       `json:"views_count"`
	IsFeatured  bool      `json:"is_featured"`
	Images      []string  `json:"images"`
	ExpiresAt   time.Time `json:"expires_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   *time.Time `json:"deleted_at"`
}

// NewListing crée une nouvelle annonce
func NewListing(userID, categoryID uuid.UUID, title, description string, 
	price float64, currency, region string) *Listing {
	
	now := time.Now()
	
	return &Listing{
		ID:          uuid.New(),
		UserID:      userID,
		CategoryID:  categoryID,
		Title:       title,
		Description: description,
		Price:       price,
		Currency:    currency,
		Region:      region,
		Status:      string(valueobjects.ListingStatusDraft),
		ViewsCount:  0,
		IsFeatured:  false,
		Images:      []string{},
		ExpiresAt:   now.Add(30 * 24 * time.Hour), // 30 jours
		CreatedAt:   now,
		UpdatedAt:   now,
	}
}

// Publish publie l'annonce
func (l *Listing) Publish() error {
	if l.Status != string(valueobjects.ListingStatusDraft) {
		return ErrListingNotDraft
	}
	
	if err := l.IsValid(); err != nil {
		return err
	}
	
	l.Status = string(valueobjects.ListingStatusActive)
	l.UpdatedAt = time.Now()
	
	return nil
}

// MarkAsSold marque l'annonce comme vendue
func (l *Listing) MarkAsSold() {
	l.Status = string(valueobjects.ListingStatusSold)
	l.UpdatedAt = time.Now()
}

// IncrementViews incrémente le compteur de vues
func (l *Listing) IncrementViews() {
	l.ViewsCount++
	l.UpdatedAt = time.Now()
}

// AddImage ajoute une image
func (l *Listing) AddImage(imageURL string) error {
	if len(l.Images) >= 8 {
		return ErrTooManyImages
	}
	
	l.Images = append(l.Images, imageURL)
	l.UpdatedAt = time.Now()
	
	return nil
}

// IsValid vérifie si l'annonce est valide
func (l *Listing) IsValid() error {
	if len(l.Title) < 10 {
		return ErrTitleTooShort
	}
	if len(l.Title) > 200 {
		return ErrTitleTooLong
	}
	if len(l.Description) < 20 {
		return ErrDescriptionTooShort
	}
	if l.Price <= 0 {
		return ErrInvalidPrice
	}
	if len(l.Images) == 0 {
		return ErrNoImages
	}
	
	return nil
}

// IsExpired vérifie si l'annonce est expirée
func (l *Listing) IsExpired() bool {
	return time.Now().After(l.ExpiresAt) && 
		   l.Status == string(valueobjects.ListingStatusActive)
}

