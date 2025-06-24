# ============================================
# 6. SCRIPT: scripts/cache_warmup.go
# ============================================

package main

import (
	"log"
	"senmarket/internal/app"
	"senmarket/internal/config"
)

// Script de préchauffage du cache
// Usage: go run scripts/cache_warmup.go

func main() {
	log.Println("🔥 Démarrage du préchauffage cache Redis...")
	
	// Charger la config
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Erreur config: %v", err)
	}
	
	// Initialiser l'app (sans démarrer le serveur)
	application := app.New(cfg)
	
	// Préchauffer les données importantes
	if err := warmupCache(application); err != nil {
		log.Fatalf("Erreur warmup: %v", err)
	}
	
	log.Println("✅ Préchauffage terminé !")
}

func warmupCache(app *app.Application) error {
	log.Println("📂 Préchauffage des catégories...")
	if _, err := app.CategoryService.GetAllCategories(); err != nil {
		return err
	}
	
	log.Println("📂 Préchauffage des catégories avec compteurs...")
	if _, err := app.CategoryService.GetCategoriesWithCounts(); err != nil {
		return err
	}
	
	log.Println("📋 Préchauffage des listings featured...")
	if _, err := app.ListingService.GetFeaturedListings(6); err != nil {
		return err
	}
	
	log.Println("📋 Préchauffage première page listings...")
	filters := make(map[string]interface{})
	if _, _, err := app.ListingService.GetListings(1, 20, filters); err != nil {
		return err
	}
	
	return nil
}

