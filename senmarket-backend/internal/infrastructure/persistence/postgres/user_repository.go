// internal/infrastructure/persistence/postgres/user_repository.go
package postgres

import (
	"context"
	"time"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/domain/valueobjects"
	"gorm.io/gorm"
	"github.com/google/uuid"
)

// UserModel modèle de base de données pour les utilisateurs
type UserModel struct {
	ID               string     `gorm:"primaryKey;type:varchar(36)"`
	Phone            string     `gorm:"uniqueIndex;not null;type:varchar(20)"`
	Email            *string    `gorm:"type:varchar(255)"`
	Region           string     `gorm:"not null;type:varchar(10)"`
	IsVerified       bool       `gorm:"default:false"`
	IsActive         bool       `gorm:"default:true"`
	FreeListingsLeft int        `gorm:"default:3"`
	PaidListings     int        `gorm:"default:0"`
	TotalListings    int        `gorm:"default:0"`
	CreatedAt        time.Time  `gorm:"autoCreateTime"`
	UpdatedAt        time.Time  `gorm:"autoUpdateTime"`
	LastLoginAt      *time.Time
	VerifiedAt       *time.Time
}

// TableName retourne le nom de la table
func (UserModel) TableName() string {
	return "users"
}

// ToEntity convertit le modèle en entité domain
func (u *UserModel) ToEntity() (*entities.User, error) {
	// Créer les value objects
	phone, err := valueobjects.NewPhone(u.Phone)
	if err != nil {
		return nil, err
	}
	
	region, err := valueobjects.NewRegion(u.Region)
	if err != nil {
		return nil, err
	}
	
	user := &entities.User{
		ID:               u.ID,
		Phone:            phone,
		Region:           region,
		IsVerified:       u.IsVerified,
		IsActive:         u.IsActive,
		FreeListingsLeft: u.FreeListingsLeft,
		PaidListings:     u.PaidListings,
		TotalListings:    u.TotalListings,
		CreatedAt:        u.CreatedAt,
		UpdatedAt:        u.UpdatedAt,
		LastLoginAt:      u.LastLoginAt,
		VerifiedAt:       u.VerifiedAt,
	}
	
	// Ajouter l'email s'il existe
	if u.Email != nil && *u.Email != "" {
		if err := user.SetEmail(*u.Email); err != nil {
			return nil, err
		}
	}
	
	return user, nil
}

// FromEntity convertit une entité en modèle
func (u *UserModel) FromEntity(user *entities.User) {
	u.ID = user.ID
	u.Phone = user.GetPhoneNumber()
	u.Region = user.GetRegionName()
	u.IsVerified = user.IsVerified
	u.IsActive = user.IsActive
	u.FreeListingsLeft = user.FreeListingsLeft
	u.PaidListings = user.PaidListings
	u.TotalListings = user.TotalListings
	u.CreatedAt = user.CreatedAt
	u.UpdatedAt = user.UpdatedAt
	u.LastLoginAt = user.LastLoginAt
	u.VerifiedAt = user.VerifiedAt
	
	email := user.GetEmailAddress()
	if email != "" {
		u.Email = &email
	}
}

// UserRepository implémentation PostgreSQL du repository utilisateur
type UserRepository struct {
	*BaseRepository
}

// NewUserRepository crée un nouveau repository utilisateur
func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &UserRepository{
		BaseRepository: NewBaseRepository(db),
	}
}

// Create crée un nouvel utilisateur
func (r *UserRepository) Create(ctx context.Context, user *entities.User) error {
	if user.ID == "" {
		user.ID = uuid.New().String()
	}
	
	model := &UserModel{}
	model.FromEntity(user)
	
	if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
		return err
	}
	
	return nil
}

// GetByID récupère un utilisateur par son ID
func (r *UserRepository) GetByID(ctx context.Context, id string) (*entities.User, error) {
	var model UserModel
	if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	
	return model.ToEntity()
}

// GetByPhone récupère un utilisateur par son téléphone
func (r *UserRepository) GetByPhone(ctx context.Context, phone string) (*entities.User, error) {
	var model UserModel
	if err := r.db.WithContext(ctx).Where("phone = ?", phone).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	
	return model.ToEntity()
}

// GetByEmail récupère un utilisateur par son email
func (r *UserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	var model UserModel
	if err := r.db.WithContext(ctx).Where("email = ?", email).First(&model).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	
	return model.ToEntity()
}

// Update met à jour un utilisateur
func (r *UserRepository) Update(ctx context.Context, user *entities.User) error {
	model := &UserModel{}
	model.FromEntity(user)
	
	if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
		return err
	}
	
	return nil
}

// Delete supprime un utilisateur
func (r *UserRepository) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&UserModel{}, "id = ?", id).Error
}

// List retourne une liste paginée d'utilisateurs
func (r *UserRepository) List(ctx context.Context, offset, limit int) ([]*entities.User, error) {
	var models []UserModel
	if err := r.db.WithContext(ctx).Offset(offset).Limit(limit).Find(&models).Error; err != nil {
		return nil, err
	}
	
	users := make([]*entities.User, len(models))
	for i, model := range models {
		user, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		users[i] = user
	}
	
	return users, nil
}

// Count retourne le nombre total d'utilisateurs
func (r *UserRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&UserModel{}).Count(&count).Error; err != nil {
		return 0, err
	}
	return count, nil
}

// ExistsByPhone vérifie si un utilisateur existe avec ce téléphone
func (r *UserRepository) ExistsByPhone(ctx context.Context, phone string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&UserModel{}).Where("phone = ?", phone).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// ExistsByEmail vérifie si un utilisateur existe avec cet email
func (r *UserRepository) ExistsByEmail(ctx context.Context, email string) (bool, error) {
	var count int64
	if err := r.db.WithContext(ctx).Model(&UserModel{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// UpdateQuota met à jour les quotas d'un utilisateur
func (r *UserRepository) UpdateQuota(ctx context.Context, userID string, freeListings int, paidListings int) error {
	return r.db.WithContext(ctx).Model(&UserModel{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"free_listings_left": freeListings,
		"paid_listings":      paidListings,
		"updated_at":         time.Now(),
	}).Error
}

// GetActiveUsers retourne les utilisateurs actifs
func (r *UserRepository) GetActiveUsers(ctx context.Context) ([]*entities.User, error) {
	var models []UserModel
	if err := r.db.WithContext(ctx).Where("is_active = ?", true).Find(&models).Error; err != nil {
		return nil, err
	}
	
	users := make([]*entities.User, len(models))
	for i, model := range models {
		user, err := model.ToEntity()
		if err != nil {
			return nil, err
		}
		users[i] = user
	}
	
	return users, nil
}
