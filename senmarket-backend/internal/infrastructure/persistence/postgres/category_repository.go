// internal/infrastructure/persistence/postgres/category_repository.go
package postgres

import (
   "context"
   "time"
   "senmarket/internal/domain/entities"
   "gorm.io/gorm"
   "github.com/google/uuid"
)

// CategoryModel modèle de base de données pour les catégories
type CategoryModel struct {
   ID            string    `gorm:"primaryKey;type:varchar(36)"`
   Name          string    `gorm:"not null;uniqueIndex;type:varchar(50)"`
   Description   string    `gorm:"type:varchar(200)"`
   Icon          string    `gorm:"type:varchar(50)"`
   Color         string    `gorm:"type:varchar(20)"`
   ParentID      *string   `gorm:"type:varchar(36);index"`
   IsActive      bool      `gorm:"default:true;index"`
   SortOrder     int       `gorm:"default:0"`
   ListingsCount int64     `gorm:"default:0"`
   CreatedAt     time.Time `gorm:"autoCreateTime"`
   UpdatedAt     time.Time `gorm:"autoUpdateTime"`
}

// TableName retourne le nom de la table
func (CategoryModel) TableName() string {
   return "categories"
}

// ToEntity convertit le modèle en entité domain
func (c *CategoryModel) ToEntity() (*entities.Category, error) {
   category := &entities.Category{
   	ID:            c.ID,
   	Name:          c.Name,
   	Description:   c.Description,
   	Icon:          c.Icon,
   	Color:         c.Color,
   	ParentID:      c.ParentID,
   	IsActive:      c.IsActive,
   	SortOrder:     c.SortOrder,
   	ListingsCount: c.ListingsCount,
   	CreatedAt:     c.CreatedAt,
   	UpdatedAt:     c.UpdatedAt,
   }
   
   return category, nil
}

// FromEntity convertit une entité en modèle
func (c *CategoryModel) FromEntity(category *entities.Category) {
   c.ID = category.ID
   c.Name = category.Name
   c.Description = category.Description
   c.Icon = category.Icon
   c.Color = category.Color
   c.ParentID = category.ParentID
   c.IsActive = category.IsActive
   c.SortOrder = category.SortOrder
   c.ListingsCount = category.ListingsCount
   c.CreatedAt = category.CreatedAt
   c.UpdatedAt = category.UpdatedAt
}

// CategoryRepository implémentation PostgreSQL du repository catégorie
type CategoryRepository struct {
   *BaseRepository
}

// NewCategoryRepository crée un nouveau repository catégorie
func NewCategoryRepository(db *gorm.DB) *CategoryRepository {
   return &CategoryRepository{
   	BaseRepository: NewBaseRepository(db),
   }
}

// Create crée une nouvelle catégorie
func (r *CategoryRepository) Create(ctx context.Context, category *entities.Category) error {
   if category.ID == "" {
   	category.ID = uuid.New().String()
   }
   
   model := &CategoryModel{}
   model.FromEntity(category)
   
   if err := r.db.WithContext(ctx).Create(model).Error; err != nil {
   	return err
   }
   
   return nil
}

// GetByID récupère une catégorie par son ID
func (r *CategoryRepository) GetByID(ctx context.Context, id string) (*entities.Category, error) {
   var model CategoryModel
   if err := r.db.WithContext(ctx).Where("id = ?", id).First(&model).Error; err != nil {
   	if err == gorm.ErrRecordNotFound {
   		return nil, nil
   	}
   	return nil, err
   }
   
   return model.ToEntity()
}

// GetByName récupère une catégorie par son nom
func (r *CategoryRepository) GetByName(ctx context.Context, name string) (*entities.Category, error) {
   var model CategoryModel
   if err := r.db.WithContext(ctx).Where("name = ?", name).First(&model).Error; err != nil {
   	if err == gorm.ErrRecordNotFound {
   		return nil, nil
   	}
   	return nil, err
   }
   
   return model.ToEntity()
}

// Update met à jour une catégorie
func (r *CategoryRepository) Update(ctx context.Context, category *entities.Category) error {
   model := &CategoryModel{}
   model.FromEntity(category)
   
   if err := r.db.WithContext(ctx).Save(model).Error; err != nil {
   	return err
   }
   
   return nil
}

// Delete supprime une catégorie
func (r *CategoryRepository) Delete(ctx context.Context, id string) error {
   return r.db.WithContext(ctx).Delete(&CategoryModel{}, "id = ?", id).Error
}

// List retourne toutes les catégories
func (r *CategoryRepository) List(ctx context.Context) ([]*entities.Category, error) {
   var models []CategoryModel
   if err := r.db.WithContext(ctx).Order("sort_order ASC, name ASC").Find(&models).Error; err != nil {
   	return nil, err
   }
   
   categories := make([]*entities.Category, len(models))
   for i, model := range models {
   	category, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	categories[i] = category
   }
   
   return categories, nil
}

// GetActive retourne les catégories actives
func (r *CategoryRepository) GetActive(ctx context.Context) ([]*entities.Category, error) {
   var models []CategoryModel
   if err := r.db.WithContext(ctx).Where("is_active = ?", true).Order("sort_order ASC, name ASC").Find(&models).Error; err != nil {
   	return nil, err
   }
   
   categories := make([]*entities.Category, len(models))
   for i, model := range models {
   	category, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	categories[i] = category
   }
   
   return categories, nil
}

// GetByParent retourne les sous-catégories d'une catégorie parent
func (r *CategoryRepository) GetByParent(ctx context.Context, parentID string) ([]*entities.Category, error) {
   var models []CategoryModel
   query := r.db.WithContext(ctx)
   
   if parentID == "" {
   	query = query.Where("parent_id IS NULL")
   } else {
   	query = query.Where("parent_id = ?", parentID)
   }
   
   if err := query.Order("sort_order ASC, name ASC").Find(&models).Error; err != nil {
   	return nil, err
   }
   
   categories := make([]*entities.Category, len(models))
   for i, model := range models {
   	category, err := model.ToEntity()
   	if err != nil {
   		return nil, err
   	}
   	categories[i] = category
   }
   
   return categories, nil
}

// IncrementListingsCount incrémente le compteur d'annonces
func (r *CategoryRepository) IncrementListingsCount(ctx context.Context, id string) error {
   return r.db.WithContext(ctx).Model(&CategoryModel{}).Where("id = ?", id).Update("listings_count", gorm.Expr("listings_count + ?", 1)).Error
}

// DecrementListingsCount décrémente le compteur d'annonces
func (r *CategoryRepository) DecrementListingsCount(ctx context.Context, id string) error {
   return r.db.WithContext(ctx).Model(&CategoryModel{}).Where("id = ? AND listings_count > 0", id).Update("listings_count", gorm.Expr("listings_count - ?", 1)).Error
}
