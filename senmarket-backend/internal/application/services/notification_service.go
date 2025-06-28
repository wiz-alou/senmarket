// internal/application/services/notification_service.go
package services

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/services"
)

// NotificationApplicationService service de notifications de la couche application
type NotificationApplicationService interface {
	// SendListingNotifications envoie les notifications liées aux annonces
	SendListingNotifications(ctx context.Context, eventType string, listing *entities.Listing, user *entities.User) error
	
	// SendPaymentNotifications envoie les notifications liées aux paiements
	SendPaymentNotifications(ctx context.Context, eventType string, payment *entities.Payment, user *entities.User) error
	
	// SendUserNotifications envoie les notifications liées aux utilisateurs
	SendUserNotifications(ctx context.Context, eventType string, user *entities.User, data map[string]interface{}) error
	
	// SendCustomNotification envoie une notification personnalisée
	SendCustomNotification(ctx context.Context, userID, title, message string, channel services.NotificationChannel) error
}

// NotificationApplicationServiceImpl implémentation du service de notifications
type NotificationApplicationServiceImpl struct {
	notificationService services.NotificationService
}

// NewNotificationApplicationService crée un nouveau service de notifications
func NewNotificationApplicationService(notificationService services.NotificationService) NotificationApplicationService {
	return &NotificationApplicationServiceImpl{
		notificationService: notificationService,
	}
}

// SendListingNotifications envoie les notifications liées aux annonces
func (s *NotificationApplicationServiceImpl) SendListingNotifications(ctx context.Context, eventType string, listing *entities.Listing, user *entities.User) error {
	switch eventType {
	case "listing.created":
		return s.notificationService.SendListingCreatedNotification(ctx, listing, user)
	case "listing.expired":
		return s.notificationService.SendListingExpiredNotification(ctx, listing, user)
	default:
		return nil // Ignore les événements non gérés
	}
}

// SendPaymentNotifications envoie les notifications liées aux paiements
func (s *NotificationApplicationServiceImpl) SendPaymentNotifications(ctx context.Context, eventType string, payment *entities.Payment, user *entities.User) error {
	switch eventType {
	case "payment.success":
		return s.notificationService.SendPaymentSuccessNotification(ctx, payment, user)
	case "payment.failed":
		return s.notificationService.SendPaymentFailedNotification(ctx, payment, user)
	default:
		return nil // Ignore les événements non gérés
	}
}

// SendUserNotifications envoie les notifications liées aux utilisateurs
func (s *NotificationApplicationServiceImpl) SendUserNotifications(ctx context.Context, eventType string, user *entities.User, data map[string]interface{}) error {
	switch eventType {
	case "user.verification":
		if code, ok := data["verification_code"].(string); ok {
			return s.notificationService.SendUserVerificationNotification(ctx, user, code)
		}
	case "quota.exhausted":
		return s.notificationService.SendQuotaExhaustedNotification(ctx, user)
	default:
		return nil // Ignore les événements non gérés
	}
	return nil
}

// SendCustomNotification envoie une notification personnalisée
func (s *NotificationApplicationServiceImpl) SendCustomNotification(ctx context.Context, userID, title, message string, channel services.NotificationChannel) error {
	// TODO: Implémenter l'envoi de notification personnalisée
	// Nécessite d'étendre l'interface du domain service
	return nil
}
