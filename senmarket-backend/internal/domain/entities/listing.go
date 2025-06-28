// internal/domain/entities/listing.go
package entities

import (
	"time"
	"strings"
	"senmarket/internal/domain/valueobjects"
)

// ListingStatus énumération des statuts d'annonce
type ListingStatus string

const (
	ListingStatusDraft     ListingStatus = "draft"
	ListingStatusActive    ListingStatus = "active"
	ListingStatusExpired   ListingStatus = "expired"
	ListingStatusSold      ListingStatus = "sold"
	ListingStatusSuspended ListingStatus = "suspended"
	ListingStatusDeleted   ListingStatus = "deleted"
)

// Listing représente une annonce dans le domaine métier
type Listing struct {
	ID          string                   `json:"id"`
	UserID      string                   `json:"user_id"`
	CategoryID  string                   `json:"category_id"`
	
	// Contenu de l'annonce
	Title       string                   `json:"title"`
	Description string                   `json:"description"`
	Price       *valueobjects.Money      `json:"price"`
	Images      []string                 `json:"images"`
	
	// Localisation
	Region      *valueobjects.Region     `json:"region"`
	Location    string                   `json:"location"` // Ville/quartier spécifique
	
	// Statut et métadonnées
	Status      ListingStatus            `json:"status"`
	IsPromoted  bool                     `json:"is_promoted"`
	IsPaid      bool                     `json:"is_paid"`
	
	// Statistiques
	ViewsCount    int64                  `json:"views_count"`
	ContactsCount int64                  `json:"contacts_count"`
	
	// Dates importantes
	CreatedAt   time.Time                `json:"created_at"`
	UpdatedAt   time.Time                `json:"updated_at"`
	ExpiresAt   time.Time                `json:"expires_at"`
	PromotedAt  *time.Time               `json:"promoted_at,omitempty"`
	SoldAt      *time.Time               `json:"sold_at,omitempty"`
}

// NewListing crée une nouvelle annonce
func NewListing(userID, categoryID, title, description string, price float64, currency, region, location string) (*Listing, error) {
	// Validation des champs obligatoires
	if userID == "" || categoryID == "" {
		return nil, NewDomainError("user_id et category_id sont obligatoires")
	}
	
	if strings.TrimSpace(title) == "" {
		return nil, NewDomainError("le titre est obligatoire")
	}
	
	if len(title) > 100 {
		return nil, NewDomainError("le titre ne peut pas dépasser 100 caractères")
	}
	
	if len(description) > 1000 {
		return nil, NewDomainError("la description ne peut pas dépasser 1000 caractères")
	}
	
	// Créer le value object Money
	priceVO, err := valueobjects.NewMoney(price, currency)
	if err != nil {
		return nil, err
	}
	
	// Créer le value object Region
	regionVO, err := valueobjects.NewRegion(region)
	if err != nil {
		return nil, err
	}
	
	now := time.Now()
	expiresAt := now.AddDate(0, 1, 0) // Expire dans 1 mois par défaut
	
	return &Listing{
		UserID:      userID,
		CategoryID:  categoryID,
		Title:       strings.TrimSpace(title),
		Description: strings.TrimSpace(description),
		Price:       priceVO,
		Region:      regionVO,
		Location:    strings.TrimSpace(location),
		Status:      ListingStatusDraft,
		IsPromoted:  false,
		IsPaid:      false,
		ViewsCount:  0,
		ContactsCount: 0,
		CreatedAt:   now,
		UpdatedAt:   now,
		ExpiresAt:   expiresAt,
		Images:      make([]string, 0),
	}, nil
}

// Publish publie l'annonce (la rend active)
func (l *Listing) Publish() error {
	if l.Status == ListingStatusDeleted {
		return NewDomainError("impossible de publier une annonce supprimée")
	}
	
	l.Status = ListingStatusActive
	l.UpdatedAt = time.Now()
	return nil
}

// AddImage ajoute une image à l'annonce
func (l *Listing) AddImage(imageURL string) error {
	if len(l.Images) >= 10 {
		return NewDomainError("maximum 10 images par annonce")
	}
	
	l.Images = append(l.Images, imageURL)
	l.UpdatedAt = time.Now()
	return nil
}

// RemoveImage supprime une image de l'annonce
func (l *Listing) RemoveImage(imageURL string) {
	for i, img := range l.Images {
		if img == imageURL {
			l.Images = append(l.Images[:i], l.Images[i+1:]...)
			l.UpdatedAt = time.Now()
			break
		}
	}
}

// UpdatePrice met à jour le prix
func (l *Listing) UpdatePrice(amount float64, currency string) error {
	priceVO, err := valueobjects.NewMoney(amount, currency)
	if err != nil {
		return err
	}
	
	l.Price = priceVO
	l.UpdatedAt = time.Now()
	return nil
}

// IncrementViews incrémente le compteur de vues
func (l *Listing) IncrementViews() {
	l.ViewsCount++
	// On ne met pas à jour UpdatedAt pour les vues (trop fréquent)
}

// IncrementContacts incrémente le compteur de contacts
func (l *Listing) IncrementContacts() {
	l.ContactsCount++
	// On ne met pas à jour UpdatedAt pour les contacts (trop fréquent)
}

// MarkAsSold marque l'annonce comme vendue
func (l *Listing) MarkAsSold() {
	l.Status = ListingStatusSold
	now := time.Now()
	l.SoldAt = &now
	l.UpdatedAt = now
}

// Promote promeut l'annonce
func (l *Listing) Promote() {
	l.IsPromoted = true
	now := time.Now()
	l.PromotedAt = &now
	l.UpdatedAt = now
}

// UnPromote supprime la promotion
func (l *Listing) UnPromote() {
	l.IsPromoted = false
	l.PromotedAt = nil
	l.UpdatedAt = time.Now()
}

// Suspend suspend l'annonce
func (l *Listing) Suspend() {
	l.Status = ListingStatusSuspended
	l.UpdatedAt = time.Now()
}

// Delete supprime l'annonce
func (l *Listing) Delete() {
	l.Status = ListingStatusDeleted
	l.UpdatedAt = time.Now()
}

// Extend prolonge l'annonce
func (l *Listing) Extend(days int) {
	l.ExpiresAt = l.ExpiresAt.AddDate(0, 0, days)
	l.UpdatedAt = time.Now()
}

// IsExpired vérifie si l'annonce est expirée
func (l *Listing) IsExpired() bool {
	return time.Now().After(l.ExpiresAt) && l.Status == ListingStatusActive
}

// IsActive vérifie si l'annonce est active
func (l *Listing) IsActive() bool {
	return l.Status == ListingStatusActive && !l.IsExpired()
}

// GetPriceFormatted retourne le prix formaté
func (l *Listing) GetPriceFormatted() string {
	if l.Price == nil {
		return "Prix non défini"
	}
	return l.Price.String()
}

// GetRegionName retourne le nom de la région
func (l *Listing) GetRegionName() string {
	if l.Region == nil {
		return ""
	}
	return l.Region.String()
}

// CategoryTrend statistiques de tendance par catégorie
type CategoryTrend struct {
	CategoryID   string  `json:"category_id"`
	CategoryName string  `json:"category_name"`
	Count        int64   `json:"count"`
	Percentage   float64 `json:"percentage"`
}
