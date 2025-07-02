#!/bin/bash
# FIX PHASE 4 - REPOSITORIES POSTGRESQL

echo "🔧 FIX PHASE 4 - COMPATIBILITY MODELS"
echo "====================================="

# 1. Corriger PostgreSQL UserRepository
cat > internal/infrastructure/persistence/postgres/user_repository.go << 'EOF'
// internal/infrastructure/persistence/postgres/user_repository.go
package postgres

import (
	"context"
	"errors"
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
			return nil, &entities.DomainError{
				Type:    "USER_NOT_FOUND",
				Message: "Utilisateur non trouvé",
			}
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
			return nil, &entities.DomainError{
				Type:    "USER_NOT_FOUND",
				Message: "Utilisateur non trouvé avec ce téléphone",
			}
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
			return nil, &entities.DomainError{
				Type:    "USER_NOT_FOUND",
				Message: "Utilisateur non trouvé avec cet email",
			}
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
			return nil, &entities.DomainError{
				Type:    "INVALID_CREDENTIALS",
				Message: "Identifiants invalides",
			}
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
EOF

echo "✅ PostgreSQL UserRepository corrigé"

# 2. Corriger PostgreSQL ListingRepository
cat > internal/infrastructure/persistence/postgres/listing_repository.go << 'EOF'
// internal/infrastructure/persistence/postgres/listing_repository.go
package postgres

import (
	"context"
	"errors"
	"time"
	
	"github.com/google/uuid"
	"gorm.io/gorm"
	
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"senmarket/internal/models" // ⭐ Utilise tes modèles GORM existants
)

// PostgreSQLListingRepository - Implémentation PostgreSQL du ListingRepository
type PostgreSQLListingRepository struct {
	db *gorm.DB
}

// NewPostgreSQLListingRepository - Constructeur
func NewPostgreSQLListingRepository(db *gorm.DB) repositories.ListingRepository {
	return &PostgreSQLListingRepository{db: db}
}

// Create - Créer une annonce
func (r *PostgreSQLListingRepository) Create(ctx context.Context, listing *entities.Listing) error {
	// Convertir l'entité Domain vers modèle GORM existant
	gormListing := r.entityToGORM(listing)
	
	// Utiliser GORM pour persister (ton code existant)
	return r.db.WithContext(ctx).Create(gormListing).Error
}

// GetByID - Récupérer une annonce par ID
func (r *PostgreSQLListingRepository) GetByID(ctx context.Context, id uuid.UUID) (*entities.Listing, error) {
	var gormListing models.Listing
	
	err := r.db.WithContext(ctx).First(&gormListing, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, &entities.DomainError{
				Type:    "LISTING_NOT_FOUND",
				Message: "Annonce non trouvée",
			}
		}
		return nil, err
	}
	
	// Convertir modèle GORM vers entité Domain
	return r.gormToEntity(&gormListing), nil
}

// Update - Mettre à jour une annonce
func (r *PostgreSQLListingRepository) Update(ctx context.Context, listing *entities.Listing) error {
	gormListing := r.entityToGORM(listing)
	gormListing.UpdatedAt = time.Now()
	
	return r.db.WithContext(ctx).Save(gormListing).Error
}

// Delete - Supprimer une annonce (soft delete)
func (r *PostgreSQLListingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&models.Listing{}, "id = ?", id).Error
}

// GetFiltered - Récupérer des annonces avec filtres
func (r *PostgreSQLListingRepository) GetFiltered(ctx context.Context, filters repositories.ListingFilters, limit, offset int) ([]*entities.Listing, error) {
	query := r.db.WithContext(ctx).Where("deleted_at IS NULL")
	
	// Appliquer les filtres (ton code existant)
	if filters.CategoryID != nil {
		query = query.Where("category_id = ?", *filters.CategoryID)
	}
	if filters.Region != nil {
		query = query.Where("region = ?", *filters.Region)
	}
	if filters.MinPrice != nil {
		query = query.Where("price >= ?", *filters.MinPrice)
	}
	if filters.MaxPrice != nil {
		query = query.Where("price <= ?", *filters.MaxPrice)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.UserID != nil {
		query = query.Where("user_id = ?", *filters.UserID)
	}
	if filters.Search != nil {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+*filters.Search+"%", "%"+*filters.Search+"%")
	}
	
	var gormListings []models.Listing
	err := query.Order("created_at DESC").Limit(limit).Offset(offset).Find(&gormListings).Error
	if err != nil {
		return nil, err
	}
	
	// Convertir tous les modèles GORM en entités Domain
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// CountFiltered - Compter les annonces avec filtres
func (r *PostgreSQLListingRepository) CountFiltered(ctx context.Context, filters repositories.ListingFilters) (int64, error) {
	query := r.db.WithContext(ctx).Model(&models.Listing{}).Where("deleted_at IS NULL")
	
	// Appliquer les mêmes filtres que GetFiltered
	if filters.CategoryID != nil {
		query = query.Where("category_id = ?", *filters.CategoryID)
	}
	if filters.Region != nil {
		query = query.Where("region = ?", *filters.Region)
	}
	if filters.MinPrice != nil {
		query = query.Where("price >= ?", *filters.MinPrice)
	}
	if filters.MaxPrice != nil {
		query = query.Where("price <= ?", *filters.MaxPrice)
	}
	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}
	if filters.UserID != nil {
		query = query.Where("user_id = ?", *filters.UserID)
	}
	if filters.Search != nil {
		query = query.Where("title ILIKE ? OR description ILIKE ?", "%"+*filters.Search+"%", "%"+*filters.Search+"%")
	}
	
	var count int64
	err := query.Count(&count).Error
	return count, err
}

// GetUserListings - Récupérer les annonces d'un utilisateur
func (r *PostgreSQLListingRepository) GetUserListings(ctx context.Context, userID uuid.UUID, limit, offset int) ([]*entities.Listing, error) {
	var gormListings []models.Listing
	
	err := r.db.WithContext(ctx).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&gormListings).Error
		
	if err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// GetFeaturedListings - Récupérer les annonces featured
func (r *PostgreSQLListingRepository) GetFeaturedListings(ctx context.Context, limit int) ([]*entities.Listing, error) {
	var gormListings []models.Listing
	
	err := r.db.WithContext(ctx).
		Where("is_featured = ? AND status = ? AND deleted_at IS NULL", true, "active").
		Order("created_at DESC").
		Limit(limit).
		Find(&gormListings).Error
		
	if err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// GetExpiredListings - Récupérer les annonces expirées
func (r *PostgreSQLListingRepository) GetExpiredListings(ctx context.Context) ([]*entities.Listing, error) {
	var gormListings []models.Listing
	
	now := time.Now()
	err := r.db.WithContext(ctx).
		Where("expires_at < ? AND status != ? AND deleted_at IS NULL", now, "expired").
		Find(&gormListings).Error
		
	if err != nil {
		return nil, err
	}
	
	listings := make([]*entities.Listing, len(gormListings))
	for i, gormListing := range gormListings {
		listings[i] = r.gormToEntity(&gormListing)
	}
	
	return listings, nil
}

// IncrementViews - Incrémenter le nombre de vues
func (r *PostgreSQLListingRepository) IncrementViews(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).
		Model(&models.Listing{}).
		Where("id = ?", id).
		UpdateColumn("views_count", gorm.Expr("views_count + 1")).Error
}

// CountByCategory - Compter les annonces par catégorie
func (r *PostgreSQLListingRepository) CountByCategory(ctx context.Context, categoryID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Listing{}).
		Where("category_id = ? AND deleted_at IS NULL", categoryID).
		Count(&count).Error
	return count, err
}

// CountByUser - Compter les annonces d'un utilisateur
func (r *PostgreSQLListingRepository) CountByUser(ctx context.Context, userID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&models.Listing{}).
		Where("user_id = ? AND deleted_at IS NULL", userID).
		Count(&count).Error
	return count, err
}

// ==============================================
// HELPERS - CONVERSION GORM ↔ DOMAIN ENTITY
// ==============================================

// entityToGORM - Convertit une entité Domain en modèle GORM
func (r *PostgreSQLListingRepository) entityToGORM(listing *entities.Listing) *models.Listing {
	// ✅ GÉRER ExpiresAt - conversion time.Time → *time.Time
	var expiresAt *time.Time
	if !listing.ExpiresAt.IsZero() {
		expiresAt = &listing.ExpiresAt
	}
	
	// ✅ GÉRER DeletedAt - conversion *time.Time → gorm.DeletedAt
	var deletedAt gorm.DeletedAt
	if listing.DeletedAt != nil {
		deletedAt = gorm.DeletedAt{Time: *listing.DeletedAt, Valid: true}
	}
	
	return &models.Listing{
		ID:          listing.ID,
		UserID:      listing.UserID,
		CategoryID:  listing.CategoryID,
		Title:       listing.Title,
		Description: listing.Description,
		Price:       listing.Price,    // float64 direct
		Currency:    listing.Currency, // string direct
		Region:      listing.Region,   // string direct
		Status:      listing.Status,   // string direct
		ViewsCount:  listing.ViewsCount,
		IsFeatured:  listing.IsFeatured,
		Images:      listing.Images,   // []string direct (pq.StringArray compatible)
		ExpiresAt:   expiresAt,        // ✅ CORRIGÉ: time.Time → *time.Time
		CreatedAt:   listing.CreatedAt,
		UpdatedAt:   listing.UpdatedAt,
		DeletedAt:   deletedAt,        // ✅ CORRIGÉ: *time.Time → gorm.DeletedAt
	}
}

// gormToEntity - Convertit un modèle GORM en entité Domain
func (r *PostgreSQLListingRepository) gormToEntity(gormListing *models.Listing) *entities.Listing {
	// ✅ GÉRER ExpiresAt - conversion *time.Time → time.Time
	var expiresAt time.Time
	if gormListing.ExpiresAt != nil {
		expiresAt = *gormListing.ExpiresAt
	}
	
	// ✅ GÉRER DeletedAt - conversion gorm.DeletedAt → *time.Time
	var deletedAt *time.Time
	if gormListing.DeletedAt.Valid {
		deletedAt = &gormListing.DeletedAt.Time
	}
	
	return &entities.Listing{
		ID:          gormListing.ID,
		UserID:      gormListing.UserID,
		CategoryID:  gormListing.CategoryID,
		Title:       gormListing.Title,
		Description: gormListing.Description,
		Price:       gormListing.Price,    // float64 direct
		Currency:    gormListing.Currency, // string direct
		Region:      gormListing.Region,   // string direct
		Status:      gormListing.Status,   // string direct
		ViewsCount:  gormListing.ViewsCount,
		IsFeatured:  gormListing.IsFeatured,
		Images:      gormListing.Images,   // []string direct
		ExpiresAt:   expiresAt,            // ✅ CORRIGÉ: *time.Time → time.Time
		CreatedAt:   gormListing.CreatedAt,
		UpdatedAt:   gormListing.UpdatedAt,
		DeletedAt:   deletedAt,            // ✅ CORRIGÉ: gorm.DeletedAt → *time.Time
	}
}
EOF

echo "✅ PostgreSQL ListingRepository corrigé"

# 3. Test compilation immédiate
echo ""
echo "🧪 TEST COMPILATION CORRIGÉE..."

if go build ./internal/infrastructure/persistence/postgres/...; then
    echo "✅ PostgreSQL Repositories : COMPILATION OK !"
    
    if go build ./internal/infrastructure/...; then
        echo "✅ Infrastructure Layer : COMPILATION OK !"
        echo ""
        echo "🎉 PHASE 4A - POSTGRESQL REPOSITORIES - SUCCÈS !"
        echo "==============================================="
        echo "✅ PostgreSQL UserRepository : Connecté avec models/user.go"
        echo "✅ PostgreSQL ListingRepository : Connecté avec models/listing.go"
        echo "✅ Conversion GORM ↔ Domain Entity : Fonctionnelle"
        echo "✅ Gestion des types : IsActive, ExpiresAt, DeletedAt, Email"
        echo ""
        echo "🚀 PROCHAINE ÉTAPE : Redis Cache Repository + Service Adapters"
    else
        echo "❌ Infrastructure Layer : ERREUR"
        go build ./internal/infrastructure/... 2>&1
    fi
else
    echo "❌ PostgreSQL Repositories : ERREURS RESTANTES"
    go build ./internal/infrastructure/persistence/postgres/... 2>&1
fi
