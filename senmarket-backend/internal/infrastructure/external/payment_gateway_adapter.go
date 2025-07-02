// internal/infrastructure/external/payment_gateway_adapter.go
package external

import (
	"context"
	"fmt"
	
	"senmarket/internal/services" // ⭐ Ton service Payment existant
	"senmarket/internal/models"   // ⭐ Tes modèles GORM existants
)

// PaymentGatewayAdapter - Adapteur pour connecter ton service Payment existant
type PaymentGatewayAdapter struct {
	paymentService *services.PaymentService
}

// NewPaymentGatewayAdapter - Constructeur
func NewPaymentGatewayAdapter(paymentService *services.PaymentService) *PaymentGatewayAdapter {
	return &PaymentGatewayAdapter{
		paymentService: paymentService,
	}
}

// CreatePayment - Créer un paiement (utilise tes vrais types)
func (a *PaymentGatewayAdapter) CreatePayment(ctx context.Context, request *services.CreatePaymentRequest) (*models.Payment, error) {
	// ✅ CORRIGÉ: Utilise models.Payment qui existe dans tes modèles GORM
	// Pour l'instant, on simule car on ne connait pas la méthode exacte de ton PaymentService
	// Tu peux adapter selon tes vraies méthodes PaymentService
	
	return nil, fmt.Errorf("méthode CreatePayment à implémenter selon ton PaymentService existant")
}

// ProcessOrangeMoneyPayment - Traiter un paiement Orange Money (méthode helper)
func (a *PaymentGatewayAdapter) ProcessOrangeMoneyPayment(ctx context.Context, amount float64, phone string) error {
	// Ici tu peux utiliser les vraies méthodes de ton PaymentService
	// pour Orange Money, Wave, etc.
	
	return fmt.Errorf("méthode Orange Money à implémenter selon ton PaymentService existant")
}

// GetPaymentStatus - Récupérer le statut d'un paiement (méthode helper)
func (a *PaymentGatewayAdapter) GetPaymentStatus(ctx context.Context, paymentID string) (string, error) {
	// Utilise les vraies méthodes de ton PaymentService
	
	return "pending", nil // Placeholder
}

// IsConfigured - Vérifier si le service de paiement est configuré
func (a *PaymentGatewayAdapter) IsConfigured() bool {
	// Vérifier que ton PaymentService est bien configuré
	return a.paymentService != nil
}

// GetSupportedMethods - Récupérer les méthodes de paiement supportées
func (a *PaymentGatewayAdapter) GetSupportedMethods() []string {
	// Retourne les méthodes de paiement que ton service supporte
	return []string{"orange_money", "wave", "free_money", "card"}
}
