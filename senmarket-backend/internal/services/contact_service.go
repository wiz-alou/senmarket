// internal/services/contact_service.go
package services

import (
	"errors"
	"fmt"
	"senmarket/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

var (
	ErrContactNotFound = errors.New("contact non trouvé")
)

type ContactService struct {
	db *gorm.DB
}

type CreateContactRequest struct {
	ListingID string `json:"listing_id" validate:"required,uuid"`
	Name      string `json:"name" validate:"required,min=2,max=100"`
	Phone     string `json:"phone" validate:"required"`
	Email     string `json:"email" validate:"email"`
	Message   string `json:"message" validate:"required,min=10,max=1000"`
}

func NewContactService(db *gorm.DB) *ContactService {
	return &ContactService{db: db}
}

// CreateContact crée un nouveau contact
func (s *ContactService) CreateContact(req *CreateContactRequest, senderID *string) (*models.Contact, error) {
	// Vérifier que l'annonce existe et est active
	var listing models.Listing
	if err := s.db.Where("id = ? AND status = ?", req.ListingID, "active").First(&listing).Error; err != nil {
		return nil, errors.New("annonce non trouvée ou inactive")
	}

	contact := models.Contact{
		ListingID: uuid.MustParse(req.ListingID),
		Name:      req.Name,
		Phone:     req.Phone,
		Email:     req.Email,
		Message:   req.Message,
	}

	// Si utilisateur connecté, associer le contact
	if senderID != nil {
		senderUUID := uuid.MustParse(*senderID)
		contact.SenderID = &senderUUID
	}

	if err := s.db.Create(&contact).Error; err != nil {
		return nil, fmt.Errorf("erreur création contact: %w", err)
	}

	// Charger les relations
	s.db.Preload("Listing").Preload("Listing.User").Preload("Sender").First(&contact, contact.ID)

	// TODO: Envoyer notification au vendeur (SMS/Email)
	go s.notifyOwner(&contact)

	return &contact, nil
}

// GetUserContacts récupère les contacts reçus par un utilisateur
func (s *ContactService) GetUserContacts(userID string) ([]models.Contact, error) {
	var contacts []models.Contact
	
	// Récupérer les contacts pour les annonces de l'utilisateur
	err := s.db.Preload("Listing").Preload("Sender").
		Joins("JOIN listings ON contacts.listing_id = listings.id").
		Where("listings.user_id = ?", userID).
		Order("contacts.created_at DESC").
		Find(&contacts).Error

	return contacts, err
}

// MarkAsRead marque un contact comme lu
func (s *ContactService) MarkAsRead(contactID, userID string) error {
	var contact models.Contact
	
	// Vérifier que le contact appartient à l'utilisateur
	err := s.db.Joins("JOIN listings ON contacts.listing_id = listings.id").
		Where("contacts.id = ? AND listings.user_id = ?", contactID, userID).
		First(&contact).Error
	
	if err != nil {
		return ErrContactNotFound
	}

	return s.db.Model(&contact).Update("is_read", true).Error
}

// GetContactStats récupère les statistiques de contact d'un utilisateur
func (s *ContactService) GetContactStats(userID string) (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total contacts reçus
	var totalContacts int64
	s.db.Model(&models.Contact{}).
		Joins("JOIN listings ON contacts.listing_id = listings.id").
		Where("listings.user_id = ?", userID).
		Count(&totalContacts)
	stats["total_contacts"] = totalContacts

	// Contacts non lus
	var unreadContacts int64
	s.db.Model(&models.Contact{}).
		Joins("JOIN listings ON contacts.listing_id = listings.id").
		Where("listings.user_id = ? AND contacts.is_read = ?", userID, false).
		Count(&unreadContacts)
	stats["unread_contacts"] = unreadContacts

	// Contacts par annonce (top 5)
	var contactsByListing []struct {
		ListingTitle string `json:"listing_title"`
		Count        int64  `json:"count"`
	}
	s.db.Model(&models.Contact{}).
		Select("listings.title as listing_title, COUNT(*) as count").
		Joins("JOIN listings ON contacts.listing_id = listings.id").
		Where("listings.user_id = ?", userID).
		Group("listings.id, listings.title").
		Order("count DESC").
		Limit(5).
		Scan(&contactsByListing)
	stats["contacts_by_listing"] = contactsByListing

	return stats, nil
}

// notifyOwner envoie une notification au propriétaire de l'annonce
func (s *ContactService) notifyOwner(contact *models.Contact) {
	// TODO: Implémenter l'envoi de SMS/Email
	fmt.Printf("📧 Nouveau contact pour %s: %s\n", 
		contact.Listing.Title, contact.Message[:50]+"...")
}