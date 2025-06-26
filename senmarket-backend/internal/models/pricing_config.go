// internal/models/pricing_config.go
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PricingConfig représente la configuration globale de la stratégie de monétisation
type PricingConfig struct {
	ID                   uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	
	// Phase 1: Lancement gratuit
	LaunchPhaseEndDate   time.Time      `json:"launch_phase_end_date" comment:"Date de fin de la phase de lancement gratuit"`
	IsLaunchPhaseActive  bool           `json:"is_launch_phase_active" gorm:"default:true" comment:"Si la phase de lancement est active"`
	LaunchPhaseMessage   string         `json:"launch_phase_message" gorm:"default:'🎉 Phase de lancement - Annonces 100% gratuites !'" comment:"Message affiché pendant la phase de lancement"`
	
	// Phase 2: Système de crédits
	CreditSystemActive   bool           `json:"credit_system_active" gorm:"default:false" comment:"Si le système de crédits mensuels est actif"`
	MonthlyFreeListings  int            `json:"monthly_free_listings" gorm:"default:3" comment:"Nombre d'annonces gratuites par mois en phase 2"`
	CreditSystemMessage  string         `json:"credit_system_message" gorm:"default:'Vous avez {remaining} annonce(s) gratuite(s) ce mois'" comment:"Message du système de crédits"`
	
	// Phase 3: Tarification complète
	PaidSystemActive     bool           `json:"paid_system_active" gorm:"default:false" comment:"Si le système payant complet est actif"`
	
	// Tarifs de base
	StandardListingPrice float64        `json:"standard_listing_price" gorm:"default:200.00" comment:"Prix d'une annonce standard en FCFA"`
	Currency             string         `json:"currency" gorm:"default:'XOF'" comment:"Devise utilisée"`
	
	// Options premium
	PremiumBoostPrice    float64        `json:"premium_boost_price" gorm:"default:100.00" comment:"Prix pour mettre en avant une annonce"`
	FeaturedColorPrice   float64        `json:"featured_color_price" gorm:"default:50.00" comment:"Prix pour la mise en couleur"`
	
	// Packs promotionnels
	Pack5ListingsPrice   float64        `json:"pack_5_listings_price" gorm:"default:800.00" comment:"Prix du pack 5 annonces"`
	Pack10ListingsPrice  float64        `json:"pack_10_listings_price" gorm:"default:1500.00" comment:"Prix du pack 10 annonces"`
	Pack5Discount        float64        `json:"pack_5_discount" gorm:"default:20.00" comment:"Pourcentage de remise pack 5 (calculé auto)"`
	Pack10Discount       float64        `json:"pack_10_discount" gorm:"default:25.00" comment:"Pourcentage de remise pack 10 (calculé auto)"`
	
	// Métadonnées
	LastModifiedBy       *uuid.UUID     `json:"last_modified_by" gorm:"type:uuid" comment:"ID de l'admin qui a modifié"`
	CreatedAt            time.Time      `json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	
	// Relations
	LastModifiedByUser *User `json:"last_modified_by_user,omitempty" gorm:"foreignKey:LastModifiedBy"`
}

// BeforeCreate hook
func (pc *PricingConfig) BeforeCreate(tx *gorm.DB) error {
	if pc.ID == uuid.Nil {
		pc.ID = uuid.New()
	}
	
	// Calculer les remises automatiquement
	pc.calculateDiscounts()
	
	return nil
}

// BeforeUpdate hook
func (pc *PricingConfig) BeforeUpdate(tx *gorm.DB) error {
	// Recalculer les remises à chaque mise à jour
	pc.calculateDiscounts()
	return nil
}

// TableName override
func (PricingConfig) TableName() string {
	return "pricing_configs"
}

// calculateDiscounts calcule automatiquement les pourcentages de remise
func (pc *PricingConfig) calculateDiscounts() {
	if pc.StandardListingPrice > 0 {
		// Pack 5: remise par rapport au prix unitaire
		standardFor5 := pc.StandardListingPrice * 5
		if standardFor5 > 0 && pc.Pack5ListingsPrice < standardFor5 {
			pc.Pack5Discount = ((standardFor5 - pc.Pack5ListingsPrice) / standardFor5) * 100
		}
		
		// Pack 10: remise par rapport au prix unitaire
		standardFor10 := pc.StandardListingPrice * 10
		if standardFor10 > 0 && pc.Pack10ListingsPrice < standardFor10 {
			pc.Pack10Discount = ((standardFor10 - pc.Pack10ListingsPrice) / standardFor10) * 100
		}
	}
}

// GetCurrentPhase retourne la phase actuelle du système
func (pc *PricingConfig) GetCurrentPhase() string {
	now := time.Now()
	
	if pc.IsLaunchPhaseActive && now.Before(pc.LaunchPhaseEndDate) {
		return "launch"
	}
	
	if pc.CreditSystemActive && !pc.PaidSystemActive {
		return "credit_system"
	}
	
	if pc.PaidSystemActive {
		return "paid_system"
	}
	
	// Par défaut, retour à la phase de crédits
	return "credit_system"
}

// IsFreeLaunchActive vérifie si la phase de lancement gratuit est active
func (pc *PricingConfig) IsFreeLaunchActive() bool {
	now := time.Now()
	return pc.IsLaunchPhaseActive && now.Before(pc.LaunchPhaseEndDate)
}

// GetPhaseMessage retourne le message approprié selon la phase
func (pc *PricingConfig) GetPhaseMessage(remainingFree int) string {
	phase := pc.GetCurrentPhase()
	
	switch phase {
	case "launch":
		return pc.LaunchPhaseMessage
	case "credit_system":
		// Remplacer {remaining} par le nombre réel
		message := pc.CreditSystemMessage
		if remainingFree >= 0 {
			message = fmt.Sprintf("Vous avez %d annonce(s) gratuite(s) ce mois", remainingFree)
		}
		return message
	case "paid_system":
		return fmt.Sprintf("Prix: %.0f FCFA par annonce", pc.StandardListingPrice)
	default:
		return "Configuration de prix en cours..."
	}
}

// GetDaysUntilLaunchEnd retourne le nombre de jours avant la fin du lancement
func (pc *PricingConfig) GetDaysUntilLaunchEnd() int {
	if !pc.IsFreeLaunchActive() {
		return 0
	}
	
	now := time.Now()
	duration := pc.LaunchPhaseEndDate.Sub(now)
	days := int(duration.Hours() / 24)
	
	if days < 0 {
		return 0
	}
	
	return days
}

// GetPricingInfo retourne toutes les informations de tarification
func (pc *PricingConfig) GetPricingInfo() map[string]interface{} {
	return map[string]interface{}{
		"current_phase":         pc.GetCurrentPhase(),
		"is_launch_active":      pc.IsFreeLaunchActive(),
		"days_until_launch_end": pc.GetDaysUntilLaunchEnd(),
		"launch_end_date":       pc.LaunchPhaseEndDate,
		
		// Tarifs
		"standard_price":        pc.StandardListingPrice,
		"premium_boost_price":   pc.PremiumBoostPrice,
		"featured_color_price":  pc.FeaturedColorPrice,
		"currency":              pc.Currency,
		
		// Packs
		"pack_5_price":          pc.Pack5ListingsPrice,
		"pack_10_price":         pc.Pack10ListingsPrice,
		"pack_5_discount":       pc.Pack5Discount,
		"pack_10_discount":      pc.Pack10Discount,
		
		// Phase 2
		"monthly_free_limit":    pc.MonthlyFreeListings,
		"credit_system_active":  pc.CreditSystemActive,
		
		// Messages
		"phase_message":         pc.GetPhaseMessage(-1), // Message générique
	}
}

// TransitionToNextPhase fait passer à la phase suivante
func (pc *PricingConfig) TransitionToNextPhase(db *gorm.DB, adminUserID *uuid.UUID) error {
	currentPhase := pc.GetCurrentPhase()
	
	updates := map[string]interface{}{
		"last_modified_by": adminUserID,
		"updated_at":       time.Now(),
	}
	
	switch currentPhase {
	case "launch":
		// Passer à la phase de crédits
		updates["is_launch_phase_active"] = false
		updates["credit_system_active"] = true
		
	case "credit_system":
		// Passer à la phase payante complète
		updates["credit_system_active"] = false
		updates["paid_system_active"] = true
		
	default:
		return fmt.Errorf("déjà à la phase finale")
	}
	
	return db.Model(pc).Updates(updates).Error
}

// ExtendLaunchPhase prolonge la phase de lancement
func (pc *PricingConfig) ExtendLaunchPhase(db *gorm.DB, newEndDate time.Time, adminUserID *uuid.UUID) error {
	if newEndDate.Before(time.Now()) {
		return fmt.Errorf("la nouvelle date doit être dans le futur")
	}
	
	updates := map[string]interface{}{
		"launch_phase_end_date": newEndDate,
		"is_launch_phase_active": true,
		"last_modified_by":      adminUserID,
		"updated_at":            time.Now(),
	}
	
	return db.Model(pc).Updates(updates).Error
}

// UpdatePrices met à jour les tarifs
func (pc *PricingConfig) UpdatePrices(db *gorm.DB, newPrices map[string]float64, adminUserID *uuid.UUID) error {
	updates := map[string]interface{}{
		"last_modified_by": adminUserID,
		"updated_at":       time.Now(),
	}
	
	// Mettre à jour les prix fournis
	if price, exists := newPrices["standard"]; exists && price > 0 {
		updates["standard_listing_price"] = price
	}
	
	if price, exists := newPrices["premium_boost"]; exists && price >= 0 {
		updates["premium_boost_price"] = price
	}
	
	if price, exists := newPrices["featured_color"]; exists && price >= 0 {
		updates["featured_color_price"] = price
	}
	
	if price, exists := newPrices["pack_5"]; exists && price > 0 {
		updates["pack_5_listings_price"] = price
	}
	
	if price, exists := newPrices["pack_10"]; exists && price > 0 {
		updates["pack_10_listings_price"] = price
	}
	
	// Appliquer les mises à jour
	if err := db.Model(pc).Updates(updates).Error; err != nil {
		return err
	}
	
	// Recharger pour recalculer les remises
	return db.First(pc, pc.ID).Error
}

// GetDefaultPricingConfig retourne la configuration par défaut
func GetDefaultPricingConfig() *PricingConfig {
	return &PricingConfig{
		LaunchPhaseEndDate:   time.Date(2025, 8, 26, 23, 59, 59, 0, time.UTC),
		IsLaunchPhaseActive:  true,
		LaunchPhaseMessage:   "🎉 Phase de lancement - Annonces 100% gratuites !",
		
		CreditSystemActive:   false,
		MonthlyFreeListings:  3,
		CreditSystemMessage:  "Vous avez {remaining} annonce(s) gratuite(s) ce mois",
		
		PaidSystemActive:     false,
		
		StandardListingPrice: 200.00,
		Currency:             "XOF",
		PremiumBoostPrice:    100.00,
		FeaturedColorPrice:   50.00,
		
		Pack5ListingsPrice:   800.00,
		Pack10ListingsPrice:  1500.00,
	}
}

// GetOrCreateGlobalConfig récupère ou crée la configuration globale
func GetOrCreateGlobalConfig(db *gorm.DB) (*PricingConfig, error) {
	var config PricingConfig
	
	// Il ne devrait y avoir qu'une seule configuration globale
	err := db.First(&config).Error
	
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Créer la configuration par défaut
			config = *GetDefaultPricingConfig()
			
			if err := db.Create(&config).Error; err != nil {
				return nil, fmt.Errorf("erreur création config par défaut: %w", err)
			}
		} else {
			return nil, fmt.Errorf("erreur récupération config: %w", err)
		}
	}
	
	return &config, nil
}