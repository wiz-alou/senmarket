// internal/domain/services/notification_service.go
package services

import (
	"context"
	"senmarket/internal/domain/entities"
)

// NotificationService service métier pour les notifications
type NotificationService interface {
	// SendListingCreatedNotification envoie une notification de création d'annonce
	SendListingCreatedNotification(ctx context.Context, listing *entities.Listing, user *entities.User) error
	
	// SendListingExpiredNotification envoie une notification d'expiration
	SendListingExpiredNotification(ctx context.Context, listing *entities.Listing, user *entities.User) error
	
	// SendPaymentSuccessNotification envoie une notification de paiement réussi
	SendPaymentSuccessNotification(ctx context.Context, payment *entities.Payment, user *entities.User) error
	
	// SendPaymentFailedNotification envoie une notification de paiement échoué
	SendPaymentFailedNotification(ctx context.Context, payment *entities.Payment, user *entities.User) error
	
	// SendUserVerificationNotification envoie une notification de vérification
	SendUserVerificationNotification(ctx context.Context, user *entities.User, verificationCode string) error
	
	// SendQuotaExhaustedNotification envoie une notification de quota épuisé
	SendQuotaExhaustedNotification(ctx context.Context, user *entities.User) error
	
	// SendListingContactNotification envoie une notification de contact sur annonce
	SendListingContactNotification(ctx context.Context, listing *entities.Listing, contactMessage string) error
	
	// SendPromotionExpiredNotification envoie une notification d'expiration de promotion
	SendPromotionExpiredNotification(ctx context.Context, listing *entities.Listing, user *entities.User) error
}

// NotificationChannel canal de notification
type NotificationChannel string

const (
	NotificationChannelSMS     NotificationChannel = "sms"
	NotificationChannelEmail   NotificationChannel = "email"
	NotificationChannelPush    NotificationChannel = "push"
	NotificationChannelInApp   NotificationChannel = "in_app"
)

// NotificationTemplate template de notification
type NotificationTemplate struct {
	ID       string              `json:"id"`
	Name     string              `json:"name"`
	Channel  NotificationChannel `json:"channel"`
	Subject  string              `json:"subject"`
	Body     string              `json:"body"`
	Language string              `json:"language"`
}

// NotificationPreferences préférences de notification d'un utilisateur
type NotificationPreferences struct {
	UserID                    string `json:"user_id"`
	EnableSMS                 bool   `json:"enable_sms"`
	EnableEmail               bool   `json:"enable_email"`
	EnablePush                bool   `json:"enable_push"`
	ListingCreatedNotify      bool   `json:"listing_created_notify"`
	ListingExpiredNotify      bool   `json:"listing_expired_notify"`
	PaymentNotify             bool   `json:"payment_notify"`
	ContactNotify             bool   `json:"contact_notify"`
	PromotionNotify           bool   `json:"promotion_notify"`
	MarketingNotify           bool   `json:"marketing_notify"`
}