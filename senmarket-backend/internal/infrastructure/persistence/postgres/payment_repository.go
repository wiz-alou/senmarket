// internal/infrastructure/persistence/postgres/payment_repository.go
package postgres

import (
   "context"
   "encoding/json"
   "time"
   "senmarket/internal/domain/entities"
   "senmarket/internal/domain/repositories"
   "senmarket/internal/domain/valueobjects"
   "gorm.io/gorm"
   "github.com/google/uuid"
)

// PaymentModel modèle de base de données pour les paiements
type PaymentModel struct {
   ID             string                 `gorm:"primaryKey;type:varchar(36)"`
   UserID         string                 `gorm:"not null;type:varchar(36);index"`
   ListingID      *string                `gorm:"type:varchar(36);index"`
   TransactionID  string                 `gorm:"uniqueIndex;type:varchar(100)"`
   Amount         float64                `gorm:"not null"`
   Currency       string                 `gorm:"not null;default:'XOF';type:varchar(3)"`
   Method         string                 `gorm:"not null;type:varchar(20);index"`
   Status         string                 `gorm:"not null;default:'pending';type:varchar(20);index"`
   ProviderRef    string                 `gorm:"type:varchar(255)"`
   ProviderData   string                 `gorm:"type:text"` // JSON
   SuccessMessage string                 `gorm:"type:text"`
   ErrorMessage   string                 `gorm:"type:text"`
   Metadata       string                 `gorm:"type:text"` // JSON
   CreatedAt      time.Time              `gorm:"autoCreateTime;index"`
   UpdatedAt      time.Time              `gorm:"autoUpdateTime"`
   ProcessedAt    *time.Time
   ExpiresAt      *time.Time             `gorm:"index"`
}

// TableName retourne le nom de la table
func (PaymentModel) TableName() string {
   return "payments"
}

// ToEntity convertit le modèle en entité domain
func (p *PaymentModel) ToEntity() (*entities.Payment, error) {
   // Créer le value object Money
   amount, err := valueobjects.NewMoney(p.Amount, p.Currency)
   if err != nil {
   	return nil, err
   }
   
   // Parser les JSONs
   var providerData map[string]interface{}
   if p.ProviderData != "" {
   	if err := json.Unmarshal([]byte(p.ProviderData), &providerData); err != nil {
   		providerData = make(map[string]interface{})
   	}
   } else {
   	providerData = make(map[string]interface{})
   }
   
   var metadata map[string]interface{}
   if p.Metadata != "" {
   	if err := json.Unmarshal([]byte(p.Metadata), &metadata); err != nil {
   		metadata = make(map[string]interface{})
   	}
   } else {
   	metadata = make(map[string]interface{})
   }
   
   payment := &entities.Payment{
   	ID:             p.ID,
   	UserID:         p.UserID,
   	ListingID:      p.ListingID,
   	TransactionID:  p.TransactionID,
   	Amount:         amount,
   	Method:         entities.PaymentMethod(p.Method),
   	Status:         entities.PaymentStatus(p.Status),
   	ProviderRef:    p.ProviderRef,
   	ProviderData:   providerData,
   	SuccessMessage: p.SuccessMessage,
   	ErrorMessage:   p.ErrorMessage,
   	Metadata:       metadata,
   	CreatedAt:      p.CreatedAt,
   	UpdatedAt:      p.UpdatedAt,
   	ProcessedAt:    p.ProcessedAt,
   	ExpiresAt:      p.ExpiresAt,
   }
   
   return payment, nil
}

// FromEntity convertit une entité en modèle
func (p *PaymentModel) FromEntity(payment *entities.Payment) error {
   p.ID = payment.ID
   p.UserID = payment.UserID
   p.ListingID = payment.ListingID
   p.TransactionID = payment.TransactionID
   p.Amount = payment.Amount.Amount
   p.Currency = payment.Amount.Currency
   p.Method = string(payment.Method)
   p.Status = string(payment.Status)
   p.ProviderRef = payment.ProviderRef
   p.SuccessMessage = payment.SuccessMessage
   p.ErrorMessage = payment.ErrorMessage
   p.CreatedAt = payment.CreatedAt
   p.UpdatedAt = payment.UpdatedAt
   p.ProcessedAt = payment.ProcessedAt
   p.ExpiresAt = payment.ExpiresAt
   
   // Convertir les maps en JSON
   if len(payment.ProviderData) > 0 {
   	providerDataJSON, err := json.Marshal(payment.ProviderData)
   	if err != nil {
   		return err
   	}
   	p.ProviderData = string(providerDataJSON)
   }
   
   if len(payment.Metadata) > 0 {
   	metadataJSON, err := json.Marshal(payment.Metadata)
   	if err != nil {
   		return err
   	}
   	p.Metadata = string(metadataJSON)
   }
   
   return nil
}

// PaymentRepository implémentation PostgreSQL du repository paiement
type PaymentRepository struct {
   *BaseRepository
}

// NewPaymentRepository crée un nouveau repository paiement
func NewPaymentRepository(db *gorm.DB) repositories.PaymentRepository {
   return &PaymentRepository{
   	BaseRepository: NewBaseRepository(db),
   }
}

// Create crée un nouveau paiement
func (r *PaymentRepository) Create(ctx context.Context, payment *entities.Payment) error {
   if payment.ID == "" {
   	payment.ID = uuid.New().String()
   }
   
   model := &PaymentModel{}
   if err := model.FromEntity(payment); err != nil {
   	return err
   }
   
   if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
   	return err
   }
   
   return nil
}

// GetByID récupère un paiement par son ID
func (r *PaymentRepository) GetByID(ctx context.Context, id string) (*entities.Payment, error) {
   var model PaymentModel
   if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
   	if err == gorm.ErrRecordNotFound {
   		return nil, nil
   	}
   	return nil, err
   }
   
   return model.ToEntity()
}

// GetByTransactionID récupère un paiement par son ID de transaction
func (r *PaymentRepository) GetByTransactionID(ctx context.Context, transactionID string) (*entities.Payment, error) {
   var model PaymentModel
   if err := r.db.WithContext(ctx).Where("transaction_id = ?", transactionID).First(&model).Error; err != nil {
   	if err == gorm.ErrRecordNotFound {
   		return nil, nil
   	}
   	return nil, err
   }
   
   return model.ToEntity()
}

// Update met à jour un paiement
func (r *PaymentRepository) Update(ctx context.Context, payment *entities.Payment) error {
   model := &PaymentModel{}
   if err := model.FromEntity(payment); err != nil {
   	return err
   }
   
   if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
   	return err
   }
   
   return nil
}

// List retourne une liste paginée de paiements
func (r *PaymentRepository) List(ctx context.Context, filters repositories.PaymentFilters, offset, limit int) ([]*entities.Payment, error) {
   query := r.db.WithContext(ctx).Model(&PaymentModel{})
   
   // Appliquer les filtres
   r.applyFilters(query, filters)
   
   var models []PaymentModel
   if err := query.Offset(offset).Limit(limit).Order("created_at DESC").Find(&models).Error; err != nil {
   	return nil, err
   }
   
   payments := make([]*entities.Payment, len(models))
   for i, model := range models {
   	payment, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	payments[i] = payment
   }
   
   return payments, nil
}

// Count retourne le nombre de paiements
func (r *PaymentRepository) Count(ctx context.Context, filters repositories.PaymentFilters) (int64, error) {
   query := r.db.WithContext(ctx).Model(&PaymentModel{})
   r.applyFilters(query, filters)
   
   var count int64
   if err := query.Count(&count).Error; err != nil {
   	return 0, err
   }
   return count, nil
}

// applyFilters applique les filtres à la requête
func (r *PaymentRepository) applyFilters(query *gorm.DB, filters repositories.PaymentFilters) {
   if filters.UserID != nil {
   	query.Where("user_id = ?", *filters.UserID)
   }
   if filters.Status != nil {
   	query.Where("status = ?", *filters.Status)
   }
   if filters.Method != nil {
   	query.Where("method = ?", *filters.Method)
   }
   if filters.AmountMin != nil {
   	query.Where("amount >= ?", *filters.AmountMin)
   }
   if filters.AmountMax != nil {
   	query.Where("amount <= ?", *filters.AmountMax)
   }
   if filters.CreatedAfter != nil {
   	query.Where("created_at >= ?", *filters.CreatedAfter)
   }
   if filters.CreatedBefore != nil {
   	query.Where("created_at <= ?", *filters.CreatedBefore)
   }
}

// GetByUserID retourne les paiements d'un utilisateur
func (r *PaymentRepository) GetByUserID(ctx context.Context, userID string, offset, limit int) ([]*entities.Payment, error) {
   filters := repositories.PaymentFilters{
   	UserID: &userID,
   }
   return r.List(ctx, filters, offset, limit)
}

// UpdateStatus met à jour le statut d'un paiement
func (r *PaymentRepository) UpdateStatus(ctx context.Context, id string, status string) error {
   return r.db.WithContext(ctx).Model(&PaymentModel{}).Where("id = ?", id).Updates(map[string]interface{}{
   	"status":     status,
   	"updated_at": time.Now(),
   }).Error
}

// GetPending retourne les paiements en attente
func (r *PaymentRepository) GetPending(ctx context.Context) ([]*entities.Payment, error) {
   var models []PaymentModel
   if err := r.db.WithContext(ctx).Where("status = ?", "pending").Find(&models).Error; err != nil {
   	return nil, err
   }
   
   payments := make([]*entities.Payment, len(models))
   for i, model := range models {
   	payment, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	payments[i] = payment
   }
   
   return payments, nil
}

// GetSuccessful retourne les paiements réussis
func (r *PaymentRepository) GetSuccessful(ctx context.Context, userID string) ([]*entities.Payment, error) {
   var models []PaymentModel
   query := r.db.WithContext(ctx).Where("status = ?", "success")
   if userID != "" {
   	query.Where("user_id = ?", userID)
   }
   
   if err := query.Find(&models).Error; err != nil {
   	return nil, err
   }
   
   payments := make([]*entities.Payment, len(models))
   for i, model := range models {
   	payment, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	payments[i] = payment
   }
   
   return payments, nil
}

// GetFailed retourne les paiements échoués
func (r *PaymentRepository) GetFailed(ctx context.Context, from, to time.Time) ([]*entities.Payment, error) {
   var models []PaymentModel
   if err := r.db.WithContext(ctx).Where("status = ? AND created_at BETWEEN ? AND ?", "failed", from, to).Find(&models).Error; err != nil {
   	return nil, err
   }
   
   payments := make([]*entities.Payment, len(models))
   for i, model := range models {
   	payment, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	payments[i] = payment
   }
   
   return payments, nil
}

// GetRevenue calcule le chiffre d'affaires sur une période
func (r *PaymentRepository) GetRevenue(ctx context.Context, from, to time.Time) (*entities.Revenue, error) {
   var result struct {
   	TotalAmount      float64 `gorm:"column:total_amount"`
   	TransactionCount int64   `gorm:"column:transaction_count"`
   }
   
   query := `
   	SELECT 
   		COALESCE(SUM(amount), 0) as total_amount,
   		COUNT(*) as transaction_count
   	FROM payments 
   	WHERE status = 'success' AND created_at BETWEEN ? AND ?
   `
   
   if err := r.db.WithContext(ctx).Raw(query, from, to).Scan(&result).Error; err != nil {
   	return nil, err
   }
   
   return &entities.Revenue{
   	TotalAmount:      result.TotalAmount,
   	Currency:         "XOF", // TODO: Gérer les multi-devises
   	TransactionCount: result.TransactionCount,
   	Period:           from.Format("2006-01-02") + " to " + to.Format("2006-01-02"),
   }, nil
}

// GetDailyStats retourne les statistiques journalières
func (r *PaymentRepository) GetDailyStats(ctx context.Context, from, to time.Time) ([]entities.DailyPaymentStats, error) {
   var stats []entities.DailyPaymentStats
   
   query := `
   	SELECT 
   		DATE(created_at) as date,
   		COALESCE(SUM(CASE WHEN status = 'success' THEN amount END), 0) as total_amount,
   		COUNT(*) as transaction_count,
   		COUNT(CASE WHEN status = 'success' THEN 1 END) as success_count,
   		COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
   		CASE 
   			WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*)
   			ELSE 0 
   		END as success_rate
   	FROM payments 
   	WHERE created_at BETWEEN ? AND ?
   	GROUP BY DATE(created_at)
   	ORDER BY date
   `
   
   if err := r.db.WithContext(ctx).Raw(query, from, to).Scan(&stats).Error; err != nil {
   	return nil, err
   }
   
   return stats, nil
}

// GetMethodStats retourne les statistiques par méthode de paiement
func (r *PaymentRepository) GetMethodStats(ctx context.Context, from, to time.Time) ([]entities.PaymentMethodStats, error) {
   var stats []entities.PaymentMethodStats
   
   query := `
   	SELECT 
   		method,
   		COALESCE(SUM(CASE WHEN status = 'success' THEN amount END), 0) as total_amount,
   		COUNT(*) as transaction_count,
   		CASE 
   			WHEN COUNT(*) > 0 THEN COUNT(CASE WHEN status = 'success' THEN 1 END) * 100.0 / COUNT(*)
   			ELSE 0 
   		END as success_rate,
   		COUNT(*) * 100.0 / (SELECT COUNT(*) FROM payments WHERE created_at BETWEEN ? AND ?) as percentage
   	FROM payments 
   	WHERE created_at BETWEEN ? AND ?
   	GROUP BY method
   	ORDER BY total_amount DESC
   `
   
   if err := r.db.WithContext(ctx).Raw(query, from, to, from, to).Scan(&stats).Error; err != nil {
   	return nil, err
   }
   
   return stats, nil
}

// MarkAsProcessed marque un paiement comme traité
func (r *PaymentRepository) MarkAsProcessed(ctx context.Context, id string, processedAt time.Time) error {
   return r.db.WithContext(ctx).Model(&PaymentModel{}).Where("id = ?", id).Updates(map[string]interface{}{
   	"processed_at": processedAt,
   	"updated_at":   time.Now(),
   }).Error
}

// GetUnprocessed retourne les paiements non traités
func (r *PaymentRepository) GetUnprocessed(ctx context.Context) ([]*entities.Payment, error) {
   var models []PaymentModel
   if err := r.db.WithContext(ctx).Where("processed_at IS NULL AND status = ?", "success").Find(&models).Error; err != nil {
   	return nil, err
   }
   
   payments := make([]*entities.Payment, len(models))
   for i, model := range models {
   	payment, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	payments[i] = payment
   }
   
   return payments, nil
}

// CreateRefund crée un remboursement
func (r *PaymentRepository) CreateRefund(ctx context.Context, originalPaymentID string, amount float64, reason string) error {
   // TODO: Implémenter la logique de remboursement
   // Créer un nouveau paiement avec status "refunded" et référence au paiement original
   return nil
}

// GetRefunds retourne les remboursements d'un paiement
func (r *PaymentRepository) GetRefunds(ctx context.Context, paymentID string) ([]*entities.Payment, error) {
   // TODO: Implémenter quand on aura la logique de remboursement
   return []*entities.Payment{}, nil
}
