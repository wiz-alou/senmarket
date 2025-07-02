// internal/infrastructure/persistence/postgres/user_repository.go
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"
	
	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/domain/valueobjects"
	"senmarket/internal/models" // ⭐ Utilise tes modèles GORM existants
)

// PostgreSQLUserRepository - Implémentation PostgreSQL du UserRepository
type PostgreSQLUserRepository struct {
	db *gorm.DB
}

// NewPostgreSQLUserRepository - Constructeur
func NewPostgreSQLUserRepository(db *gorm.DB) repositories.UserRepository {
	return &PostgreSQLUserRepository{db: db}
}

// Create - Créer un utilisateur
func (r *PostgreSQLUserRepository) Create(ctx context.Context, user *entities.User) error {
	// Convertir l'entité Domain vers modèle GORM existant
	gormUser := r.entityToGORM(user)
	
	// Utiliser GORM pour persister (ton code existant)
	return r.db.WithContext(ctx).Create(gormUser).Error
}

// GetByID - Récupérer un utilisateur par ID
func (r *PostgreSQLUserRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.User, error) {
	var gormUser models.User
	
	err := r.db.WithContext(ctx).First(&gormUser, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("utilisateur non trouvé avec ID: %s", id.String())
		}
		return nil, err
	}
	
	// Convertir modèle GORM vers entité Domain
	return r.gormToEntity(&gormUser)
}

// GetByPhone - Récupérer un utilisateur par téléphone
func (r *PostgreSQLUserRepository) GetByPhone(ctx context.Context, phone string) (*entities.User, error) {
	var gormUser models.User
	
	err := r.db.WithContext(ctx).First(&gormUser, "phone = ?", phone).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("utilisateur non trouvé avec téléphone: %s", phone)
		}
		return nil, err
	}
	
	return r.gormToEntity(&gormUser)
}

// GetByEmail - Récupérer un utilisateur par email
func (r *PostgreSQLUserRepository) GetByEmail(ctx context.Context, email string) (*entities.User, error) {
	var gormUser models.User
	
	err := r.db.WithContext(ctx).First(&gormUser, "email = ?", email).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("utilisateur non trouvé avec email: %s", email)
		}
		return nil, err
	}
	
	return r.gormToEntity(&gormUser)
}

// Update - Mettre à jour un utilisateur
func (r *PostgreSQLUserRepository) Update(ctx context.Context, user *entities.User) error {
	gormUser := r.entityToGORM(user)
	gormUser.UpdatedAt = time.Now()
	
	return r.db.WithContext(ctx).Save(gormUser).Error
}

// Delete - Supprimer un utilisateur (soft delete)
func (r *PostgreSQLUserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.User{}, "id = ?", id).Error
}

// GetActiveUsers - Récupérer les utilisateurs actifs
func (r *PostgreSQLUserRepository) GetActiveUsers(ctx context.Context, limit, offset int) ([]*entities.User, error) {
	var gormUsers []models.User
	
	err := r.db.WithContext(ctx).
		Where("is_verified = ?", true).  // ✅ CORRIGÉ: Utilise is_verified au lieu de is_active
		Where("deleted_at IS NULL").
		Limit(limit).
		Offset(offset).
		Find(&gormUsers).Error
		
	if err != nil {
		return nil, err
	}
	
	// Convertir tous les modèles GORM en entités Domain
	users := make([]*entities.User, len(gormUsers))
	for i, gormUser := range gormUsers {
		user, err := r.gormToEntity(&gormUser)
		if err != nil {
			return nil, err
		}
		users[i] = user
	}
	
	return users, nil
}

// GetUsersNeedingQuotaReset - Récupérer les utilisateurs nécessitant une réinitialisation
func (r *PostgreSQLUserRepository) GetUsersNeedingQuotaReset(ctx context.Context) ([]*entities.User, error) {
	var gormUsers []models.User
	
	// Utilisateurs dont le last_free_reset est antérieur au début du mois actuel
	firstDayOfMonth := time.Now().AddDate(0, 0, -time.Now().Day()+1)
	
	err := r.db.WithContext(ctx).
		Where("onboarding_phase != ?", "free_launch").
		Where("last_free_reset < ?", firstDayOfMonth).
		Find(&gormUsers).Error
		
	if err != nil {
		return nil, err
	}
	
	users := make([]*entities.User, len(gormUsers))
	for i, gormUser := range gormUsers {
		user, err := r.gormToEntity(&gormUser)
		if err != nil {
			return nil, err
		}
		users[i] = user
	}
	
	return users, nil
}

// CountByOnboardingPhase - Compter les utilisateurs par phase
func (r *PostgreSQLUserRepository) CountByOnboardingPhase(ctx context.Context, phase string) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.User{}).
		Where("onboarding_phase = ?", phase).
		Where("deleted_at IS NULL").
		Count(&count).Error
	return count, err
}

// ValidateCredentials - Valider les identifiants
func (r *PostgreSQLUserRepository) ValidateCredentials(ctx context.Context, phone, passwordHash string) (*entities.User, error) {
	var gormUser models.User
	
	err := r.db.WithContext(ctx).
		First(&gormUser, "phone = ? AND password_hash = ?", phone, passwordHash).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("identifiants invalides pour: %s", phone)
		}
		return nil, err
	}
	
	return r.gormToEntity(&gormUser)
}

// ==============================================
// HELPERS - CONVERSION GORM ↔ DOMAIN ENTITY
// ==============================================

// entityToGORM - Convertit une entité Domain en modèle GORM
func (r *PostgreSQLUserRepository) entityToGORM(user *entities.User) *models.User {
	gormUser := &models.User{
		ID:                 user.ID,
		Phone:              user.Phone,        // string direct
		FirstName:          user.FirstName,
		LastName:           user.LastName,
		PasswordHash:       user.PasswordHash,
		Region:             user.Region,       // string direct
		IsVerified:         user.IsVerified,
		IsPremium:          user.IsPremium,
		// ✅ SUPPRIMÉ: IsActive (n'existe pas dans models.User)
		FreeListingsUsed:   user.FreeListingsUsed,
		FreeListingsLimit:  user.FreeListingsLimit,
		TotalListingsCount: user.TotalListingsCount,
		OnboardingPhase:    user.OnboardingPhase.String(),    // value object → string
		RegistrationPhase:  user.RegistrationPhase.String(),  // value object → string
		LastFreeReset:      user.LastFreeReset,
		PremiumExpiresAt:   user.PremiumExpiresAt,
		CreatedAt:          user.CreatedAt,
		UpdatedAt:          user.UpdatedAt,
	}
	
	// Gérer email optionnel
	if user.Email != nil {
		gormUser.Email = *user.Email  // ✅ CORRIGÉ: Dereference du pointer
	}
	
	// ✅ GÉRER DeletedAt - conversion *time.Time → gorm.DeletedAt
	if user.DeletedAt != nil {
		gormUser.DeletedAt = gorm.DeletedAt{Time: *user.DeletedAt, Valid: true}
	}
	
	return gormUser
}

// gormToEntity - Convertit un modèle GORM en entité Domain
func (r *PostgreSQLUserRepository) gormToEntity(gormUser *models.User) (*entities.User, error) {
	// Créer les value objects avec validation
	onboardingPhase, err := valueobjects.NewOnboardingPhase(gormUser.OnboardingPhase)
	if err != nil {
		// Si erreur, utiliser valeur par défaut
		onboardingPhase = valueobjects.OnboardingPhaseFree
	}
	
	registrationPhase, err := valueobjects.NewRegistrationPhase(gormUser.RegistrationPhase)
	if err != nil {
		// Si erreur, utiliser valeur par défaut
		registrationPhase = valueobjects.RegistrationPhaseLaunch
	}
	
	// ✅ GÉRER Email - models.User.Email est string, entities.User.Email est *string
	var email *string
	if gormUser.Email != "" {
		email = &gormUser.Email
	}
	
	// ✅ GÉRER DeletedAt - conversion gorm.DeletedAt → *time.Time
	var deletedAt *time.Time
	if gormUser.DeletedAt.Valid {
		deletedAt = &gormUser.DeletedAt.Time
	}
	
	// Créer l'entité Domain
	user := &entities.User{
		ID:                 gormUser.ID,
		Phone:              gormUser.Phone,        // string direct
		Email:              email,                 // ✅ CORRIGÉ: Conversion string → *string
		FirstName:          gormUser.FirstName,
		LastName:           gormUser.LastName,
		PasswordHash:       gormUser.PasswordHash,
		Region:             gormUser.Region,       // string direct
		IsVerified:         gormUser.IsVerified,
		IsActive:           gormUser.IsVerified,   // ✅ CORRIGÉ: Utilise IsVerified comme IsActive
		IsPremium:          gormUser.IsPremium,
		FreeListingsUsed:   gormUser.FreeListingsUsed,
		FreeListingsLimit:  gormUser.FreeListingsLimit,
		TotalListingsCount: gormUser.TotalListingsCount,
		OnboardingPhase:    onboardingPhase,    // value object
		RegistrationPhase:  registrationPhase,  // value object
		LastFreeReset:      gormUser.LastFreeReset,
		PremiumExpiresAt:   gormUser.PremiumExpiresAt,
		CreatedAt:          gormUser.CreatedAt,
		UpdatedAt:          gormUser.UpdatedAt,
		DeletedAt:          deletedAt,             // ✅ CORRIGÉ: Conversion gorm.DeletedAt → *time.Time
	}
	
	return user, nil
}
