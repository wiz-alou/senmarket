// cmd/server/main.go
package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"senmarket/internal/container"
	"senmarket/internal/presentation/http/routes"
)

func main() {
	log.Println("🚀 Démarrage SenMarket Clean Architecture...")

	// Charger les variables d'environnement
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ Fichier .env non trouvé, utilisation des variables système")
	}

	// Wire-up de toutes les dépendances
	app, err := container.WireUp()
	if err != nil {
		log.Fatalf("❌ Erreur d'initialisation: %v", err)
	}

	// Configuration du mode Gin
	if app.Config.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	// Créer le routeur
	router := gin.New()

	// ⭐ CORRIGÉ: Configuration des routes avec TOUS les composants
	routerConfig := &routes.RouterConfig{
		UserController:    app.UserController,
		ListingController: app.ListingController,
		PaymentController: app.PaymentController,
		HealthController:  app.HealthController,
		CacheController:   app.CacheController,   // ⭐ AJOUTÉ !
		AuthMiddleware:    app.AuthMiddleware,
		CacheMiddleware:   app.CacheMiddleware,   // ⭐ AJOUTÉ !
		AuthService:       app.AuthService,
		TwilioService:     app.TwilioService,
	}

	routes.SetupRoutes(router, routerConfig)

	// Configuration du serveur HTTP
	server := &http.Server{
		Addr:         ":" + app.Config.Port,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Démarrage du serveur dans une goroutine
	go func() {
		log.Printf("🌟 SenMarket API démarrée sur le port %s", app.Config.Port)
		log.Printf("🏠 Environment: %s", app.Config.Environment)
		log.Printf("📍 Health check: http://localhost:%s/health", app.Config.Port)
		log.Printf("📚 API v1: http://localhost:%s/api/v1", app.Config.Port)
		log.Printf("🔐 JWT Auth disponible: http://localhost:%s/api/v1/auth/login", app.Config.Port)
		log.Printf("📱 SMS Test disponible: http://localhost:%s/api/v1/test-sms", app.Config.Port)
		log.Printf("🔴 Cache Redis disponible: http://localhost:%s/api/v1/cache/stats", app.Config.Port) // ⭐ NOUVEAU
		
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("❌ Erreur serveur: %v", err)
		}
	}()

	// Gestion gracieuse de l'arrêt
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("🛑 Arrêt du serveur...")

	// Arrêt gracieux avec timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("❌ Erreur lors de l'arrêt: %v", err)
	}

	log.Println("✅ SenMarket arrêté proprement")
}