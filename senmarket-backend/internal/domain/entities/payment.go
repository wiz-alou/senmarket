// internal/domain/entities/payment.go
package entities

import (
	"time"
	"senmarket/internal/domain/valueobjects"
)

// PaymentStatus énumération des statuts de paiement
type PaymentStatus string

const (
	PaymentStatusPending   PaymentStatus = "pending"
	PaymentStatusSuccess   PaymentStatus = "success"
	PaymentStatusFailed    PaymentStatus = "failed"
	PaymentStatusCancelled PaymentStatus = "cancelled"
	PaymentStatusRefunded  PaymentStatus = "refunded"
)

// PaymentMethod énumération des méthodes de paiement
type PaymentMethod string

const (
	PaymentMethodOrangeMoney PaymentMethod = "orange_money"
	PaymentMethodWave        PaymentMethod = "wave"
	PaymentMethodFreeMoney   PaymentMethod = "free_money"
	PaymentMethodBankCard    PaymentMethod = "bank_card"
)

// Payment représente un paiement dans le domaine métier
type Payment struct {
	ID            string                   `json:"id"`
	UserID        string                   `json:"user_id"`
	ListingID     *string                  `json:"listing_id,omitempty"`
	TransactionID string                   `json:"transaction_id"`
	
	// Détails du paiement
	Amount        *valueobjects.Money      `json:"amount"`
	Method        PaymentMethod            `json:"method"`
	Status        PaymentStatus            `json:"status"`
	
	// Informations de traitement
	ProviderRef   string                   `json:"provider_ref,omitempty"`
	ProviderData  map[string]interface{}   `json:"provider_data,omitempty"`
	
	// Messages et erreurs
	SuccessMessage string                  `json:"success_message,omitempty"`
	ErrorMessage   string                  `json:"error_message,omitempty"`
	
	// Métadonnées
	Metadata      map[string]interface{}   `json:"metadata,omitempty"`
	
	// Dates importantes
	CreatedAt     time.Time                `json:"created_at"`
	UpdatedAt     time.Time                `json:"updated_at"`
	ProcessedAt   *time.Time               `json:"processed_at,omitempty"`
	ExpiresAt     *time.Time               `json:"expires_at,omitempty"`
}

// NewPayment crée un nouveau paiement
func NewPayment(userID string, amount float64, currency string, method PaymentMethod) (*Payment, error) {
	if userID == "" {
		return nil, NewDomainError("user_id est obligatoire")
	}
	
	// Créer le value object Money
	amountVO, err := valueobjects.NewMoney(amount, currency)
	if err != nil {
		return nil, err
	}
	
	// Valider la méthode de paiement
	if !isValidPaymentMethod(method) {
		return nil, NewDomainError("méthode de paiement invalide")
	}
	
	now := time.Now()
	expiresAt := now.Add(30 * time.Minute) // Le paiement expire dans 30 minutes
	
	return &Payment{
		UserID:       userID,
		Amount:       amountVO,
		Method:       method,
		Status:       PaymentStatusPending,
		ProviderData: make(map[string]interface{}),
		Metadata:     make(map[string]interface{}),
		CreatedAt:    now,
		UpdatedAt:    now,
		ExpiresAt:    &expiresAt,
	}, nil
}

// isValidPaymentMethod vérifie si la méthode de paiement est valide
func isValidPaymentMethod(method PaymentMethod) bool {
	validMethods := []PaymentMethod{
		PaymentMethodOrangeMoney,
		PaymentMethodWave,
		PaymentMethodFreeMoney,
		PaymentMethodBankCard,
	}
	
	for _, validMethod := range validMethods {
		if method == validMethod {
			return true
		}
	}
	return false
}

// SetTransactionID définit l'ID de transaction
func (p *Payment) SetTransactionID(transactionID string) {
	p.TransactionID = transactionID
	p.UpdatedAt = time.Now()
}

// SetProviderReference définit la référence du fournisseur
func (p *Payment) SetProviderReference(ref string) {
	p.ProviderRef = ref
	p.UpdatedAt = time.Now()
}

// AddProviderData ajoute des données du fournisseur
func (p *Payment) AddProviderData(key string, value interface{}) {
	if p.ProviderData == nil {
		p.ProviderData = make(map[string]interface{})
	}
	p.ProviderData[key] = value
	p.UpdatedAt = time.Now()
}

// AddMetadata ajoute des métadonnées
func (p *Payment) AddMetadata(key string, value interface{}) {
	if p.Metadata == nil {
		p.Metadata = make(map[string]interface{})
	}
	p.Metadata[key] = value
	p.UpdatedAt = time.Now()
}

// MarkAsSuccess marque le paiement comme réussi
func (p *Payment) MarkAsSuccess(message string) {
	p.Status = PaymentStatusSuccess
	p.SuccessMessage = message
	p.ErrorMessage = ""
	now := time.Now()
	p.ProcessedAt = &now
	p.UpdatedAt = now
}

// MarkAsFailed marque le paiement comme échoué
func (p *Payment) MarkAsFailed(errorMessage string) {
	p.Status = PaymentStatusFailed
	p.ErrorMessage = errorMessage
	p.SuccessMessage = ""
	now := time.Now()
	p.ProcessedAt = &now
	p.UpdatedAt = now
}

// Cancel annule le paiement
func (p *Payment) Cancel() {
	p.Status = PaymentStatusCancelled
	p.UpdatedAt = time.Now()
}

// Refund rembourse le paiement
func (p *Payment) Refund() error {
	if p.Status != PaymentStatusSuccess {
		return NewDomainError("seuls les paiements réussis peuvent être remboursés")
	}
	
	p.Status = PaymentStatusRefunded
	p.UpdatedAt = time.Now()
	return nil
}

// IsExpired vérifie si le paiement est expiré
func (p *Payment) IsExpired() bool {
	if p.ExpiresAt == nil {
		return false
	}
	return time.Now().After(*p.ExpiresAt) && p.Status == PaymentStatusPending
}

// CanBeProcessed vérifie si le paiement peut être traité
func (p *Payment) CanBeProcessed() bool {
	return p.Status == PaymentStatusPending && !p.IsExpired()
}

// GetAmountFormatted retourne le montant formaté
func (p *Payment) GetAmountFormatted() string {
	if p.Amount == nil {
		return "Montant non défini"
	}
	return p.Amount.String()
}

// Revenue statistiques de revenus
type Revenue struct {
	TotalAmount    float64 `json:"total_amount"`
	Currency       string  `json:"currency"`
	TransactionCount int64 `json:"transaction_count"`
	Period         string  `json:"period"`
}

// DailyPaymentStats statistiques journalières des paiements
type DailyPaymentStats struct {
	Date           time.Time `json:"date"`
	TotalAmount    float64   `json:"total_amount"`
	TransactionCount int64   `json:"transaction_count"`
	SuccessCount   int64     `json:"success_count"`
	FailedCount    int64     `json:"failed_count"`
	SuccessRate    float64   `json:"success_rate"`
}

// PaymentMethodStats statistiques par méthode de paiement
type PaymentMethodStats struct {
	Method         PaymentMethod `json:"method"`
	TotalAmount    float64       `json:"total_amount"`
	TransactionCount int64       `json:"transaction_count"`
	SuccessRate    float64       `json:"success_rate"`
	Percentage     float64       `json:"percentage"`
}

