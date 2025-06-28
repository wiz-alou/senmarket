// cmd/server/main.go
package main

import (
	"log"
	"os"

	"senmarket/internal/app"
	"senmarket/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	// Charger le fichier .env en développement
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("Fichier .env non trouvé, utilisation des variables d'environnement")
		}
	}

	// Charger la configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Erreur lors du chargement de la configuration: %v", err)
	}

	// Initialiser l'application
	app := app.New(cfg)

	// Démarrer le serveur
	log.Printf("🇸🇳 SenMarket API démarré sur le port %s", cfg.Port)
	log.Printf("🌐 Environnement: %s", cfg.Env)
	log.Printf("📊 Base de données: %s:%s", cfg.Database.Host, cfg.Database.Port)
	
	if err := app.Run(); err != nil {
		log.Fatalf("Erreur lors du démarrage du serveur: %v", err)
	}
}