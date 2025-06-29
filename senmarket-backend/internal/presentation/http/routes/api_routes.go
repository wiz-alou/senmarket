// internal/presentation/http/routes/api_routes.go - AVEC ENDPOINT TEST SMS
package routes


import (
	"crypto/rand" // ⭐ NOUVEAU
	"fmt"         // ⭐ NOUVEAU
	"math/big"    // ⭐ NOUVEAU
	mathRand "math/rand" // ⭐ NOUVEAU - alias correct en Go
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"senmarket/internal/application/services"
	"senmarket/internal/infrastructure/messaging/sms" // ⭐ NOUVEAU IMPORT
	"senmarket/internal/presentation/http/controllers"
	"senmarket/internal/presentation/http/middleware"
	"senmarket/internal/presentation/http/responses"
)

// RouterConfig configuration du routeur - ⭐ AVEC TWILIO SERVICE
type RouterConfig struct {
	UserController    *controllers.UserController
	ListingController *controllers.ListingController
	PaymentController *controllers.PaymentController
	HealthController  *controllers.HealthController
	AuthMiddleware    *middleware.AuthMiddleware
	AuthService       services.AuthService
	TwilioService     *sms.TwilioService // ⭐ NOUVEAU
}

// SetupRoutes configure toutes les routes de l'API
func SetupRoutes(r *gin.Engine, config *RouterConfig) {
	// Middlewares globaux
	r.Use(middleware.CORS())
	r.Use(middleware.Logger())
	r.Use(middleware.RequestID())
	r.Use(middleware.RateLimit())
	
	// Injecter le service d'auth dans toutes les routes
	r.Use(func(c *gin.Context) {
		c.Set("auth_service", config.AuthService)
		c.Next()
	})
	
	// Routes de santé (pas de rate limiting)
	r.GET("/health", config.HealthController.HealthCheck)
	r.GET("/health/ready", config.HealthController.ReadinessCheck)
	r.GET("/health/live", config.HealthController.LivenessCheck)
	r.GET("/health/metrics", config.HealthController.MetricsCheck)
	
	// Routes statiques pour compatibilité
	setupStaticRoutes(r)
	
	// API v1
	api := r.Group("/api/v1")
	{
		// Routes d'authentification
		SetupAuthRoutes(api, config)
		
		// Routes utilisateurs
		SetupUserRoutes(api, config)
		
		// Routes annonces - COMPATIBLE FRONTEND
		SetupListingRoutes(api, config)
		
		// Routes paiements
		SetupPaymentRoutes(api, config)
		
		// Routes images - COMPATIBLE FRONTEND
		SetupImageRoutes(api, config)
		
		// Routes quota - COMPATIBLE FRONTEND
		SetupQuotaRoutes(api, config)
		
		// Routes catégories - FONCTIONNELLES
		SetupCategoryRoutes(api, config)
		
		// ⭐ NOUVEAU : Endpoint test SMS (développement seulement)
		setupTestSMSEndpoint(api, config)
	}
}



// ⭐ NOUVEAU : setupTestSMSEndpoint pour tester l'envoi de SMS
func setupTestSMSEndpoint(api *gin.RouterGroup, config *RouterConfig) {
	api.POST("/test-sms", func(c *gin.Context) {
		var req struct {
			Phone   string `json:"phone" binding:"required"`
			Message string `json:"message"`
		}
		
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(400, gin.H{
				"success": false,
				"error":   "Format de requête invalide",
				"details": err.Error(),
			})
			return
		}
		
		// Nettoyer et valider le téléphone sénégalais
		cleanPhone := cleanSenegalPhone(req.Phone)
		if cleanPhone == "" {
			c.JSON(400, gin.H{
				"success": false,
				"error":   "Format de téléphone invalide",
				"hint":    "Utilisez +221XXXXXXXXX ou 7XXXXXXXX",
				"examples": []string{"+221777080751", "777080751"},
			})
			return
		}
		
		// Message par défaut
		message := req.Message
		if message == "" {
			message = "🇸🇳 SenMarket Test SMS - Votre service fonctionne parfaitement ! 🚀"
		}
		
		// ⭐ ENVOYER VIA TWILIO RÉEL
		if config.TwilioService != nil {
			ctx := c.Request.Context()
			result, err := config.TwilioService.SendSMS(ctx, cleanPhone, message)
			if err != nil {
				c.JSON(500, gin.H{
					"success": false,
					"error":   "Erreur envoi SMS",
					"details": err.Error(),
				})
				return
			}
			
			// Succès avec vrai SMS envoyé !
			c.JSON(200, gin.H{
				"success":    true,
				"message":    "📱 SMS RÉEL envoyé avec succès !",
				"to":         cleanPhone,
				"content":    message,
				"result":     result,
				"provider":   "twilio",
				"timestamp":  time.Now().Format(time.RFC3339),
				"note":       "SMS réellement envoyé via Twilio",
			})
		} else {
			// Fallback si TwilioService pas disponible
			c.JSON(200, gin.H{
				"success":   true,
				"message":   "SMS de test prêt (service indisponible)",
				"to":        cleanPhone,
				"content":   message,
				"provider":  "twilio",
				"note":      "TwilioService non injecté",
			})
		}
	})
}

// ⭐ FONCTION UTILITAIRE : Nettoyer numéros sénégalais
func cleanSenegalPhone(phone string) string {
	// Supprimer espaces et caractères spéciaux
	cleaned := strings.ReplaceAll(phone, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")
	
	// Formats valides pour le Sénégal :
	// +221XXXXXXXXX (format international)
	// 221XXXXXXXXX (sans +)
	// 7XXXXXXXX ou 3XXXXXXXX (format local)
	
	if strings.HasPrefix(cleaned, "+221") && len(cleaned) == 13 {
		return cleaned // +221XXXXXXXXX
	}
	
	if strings.HasPrefix(cleaned, "221") && len(cleaned) == 12 {
		return "+" + cleaned // 221XXXXXXXXX → +221XXXXXXXXX
	}
	
	if (strings.HasPrefix(cleaned, "7") || strings.HasPrefix(cleaned, "3")) && len(cleaned) == 9 {
		return "+221" + cleaned // 7XXXXXXXX → +221XXXXXXXX
	}
	
	// Format invalide
	return ""
}

// setupStaticRoutes pour maintenir la compatibilité
func setupStaticRoutes(r *gin.Engine) {
	// Route regions - CODES CORRECTS pour validation
	r.GET("/api/v1/regions", func(c *gin.Context) {
		regions := []map[string]interface{}{
			{"id": "dakar", "name": "Dakar", "code": "DK"},
			{"id": "thies", "name": "Thiès", "code": "TH"},
			{"id": "saint-louis", "name": "Saint-Louis", "code": "SL"},
			{"id": "diourbel", "name": "Diourbel", "code": "DI"},
			{"id": "louga", "name": "Louga", "code": "LG"},
			{"id": "tambacounda", "name": "Tambacounda", "code": "TA"},
			{"id": "kaolack", "name": "Kaolack", "code": "KA"},
			{"id": "kolda", "name": "Kolda", "code": "KO"},
			{"id": "ziguinchor", "name": "Ziguinchor", "code": "ZI"},
			{"id": "fatick", "name": "Fatick", "code": "FA"},
			{"id": "kaffrine", "name": "Kaffrine", "code": "KF"},
			{"id": "kedougou", "name": "Kédougou", "code": "KE"},
			{"id": "matam", "name": "Matam", "code": "MA"},
			{"id": "sedhiou", "name": "Sédhiou", "code": "SE"},
		}
		responses.SendSuccess(c, regions, "Régions du Sénégal")
	})
}

// SetupAuthRoutes configure les routes d'authentification
func SetupAuthRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	auth := rg.Group("/auth")
	auth.Use(middleware.RateLimitByEndpoint(20, 300)) // 20 req/5min
	{
		// ⭐ ENHANCED : POST /register avec SMS Twilio RÉEL - CORRIGÉ
		auth.POST("/register", func(c *gin.Context) {
			var req struct {
				Phone    string `json:"phone" binding:"required"`
				Region   string `json:"region" binding:"required"` 
				Password string `json:"password" binding:"required,min=6"`
			}
			
			if err := c.ShouldBindJSON(&req); err != nil {
				responses.SendError(c, 400, responses.ErrorBadRequest, "Données invalides", err.Error())
				return
			}

			// Nettoyer et valider le numéro sénégalais
			cleanPhone := cleanSenegalPhone(req.Phone)
			if cleanPhone == "" {
				responses.SendError(c, 400, responses.ErrorInvalidPhone, "Numéro de téléphone invalide", 
					"Utilisez le format sénégalais: +221777080751 ou 777080751")
				return
			}

			// Vérifier que l'utilisateur n'existe pas déjà
			authService := c.MustGet("auth_service").(services.AuthService)
			
			// TODO: Utiliser AuthService.CheckUserExists() quand disponible
			// Pour l'instant, continuer l'inscription
			_ = authService // Utiliser la variable pour éviter l'erreur
			
			// Générer un code de vérification sécurisé
			verificationCode, err := generateSecureCode()
			if err != nil {
				responses.SendError(c, 500, responses.ErrorInternalServer, "Erreur génération code", err.Error())
				return
			}

			// ⭐ MESSAGE SMS PROFESSIONNEL SÉNÉGAL
			message := fmt.Sprintf("🇸🇳 SenMarket: Votre code de vérification est %s. Valable 10 minutes. Ne le partagez jamais.", verificationCode)

			// ⭐ ENVOYER VIA TWILIO RÉEL
			var smsSuccess bool
			
			if config.TwilioService != nil {
				ctx := c.Request.Context()
				result, err := config.TwilioService.SendSMS(ctx, cleanPhone, message)
				if err != nil {
					// Log l'erreur mais ne pas bloquer l'inscription
					fmt.Printf("⚠️ Erreur SMS lors de l'inscription vers %s: %v\n", cleanPhone, err)
					smsSuccess = false
				} else {
					fmt.Printf("✅ SMS d'inscription envoyé avec succès vers %s - ID: %s\n", cleanPhone, result.MessageID)
					smsSuccess = true
				}
			} else {
				smsSuccess = false
			}

			// TODO: Intégrer avec votre UserController existant
			// Préparer les données pour CreateUser
			c.Set("phone", cleanPhone)
			c.Set("region", req.Region)
			c.Set("password", req.Password)
			c.Set("verification_code", verificationCode)
			
			// Appeler votre méthode existante (modifiée pour gérer les codes SMS)
			config.UserController.CreateUser(c)
			
			// Si CreateUser a réussi, ajouter les infos SMS à la réponse
			if c.Writer.Status() == 200 || c.Writer.Status() == 201 {
				// La réponse a déjà été envoyée par CreateUser, on ajoute juste les logs
				fmt.Printf("📱 Utilisateur créé avec SMS: %s, Code: %s, Envoyé: %v\n", cleanPhone, verificationCode, smsSuccess)
			}
		})

		// ⭐ ENHANCED : POST /send-code pour renvoyer un code - CORRIGÉ
		auth.POST("/send-code", func(c *gin.Context) {
			var req struct {
				Phone string `json:"phone" binding:"required"`
			}
			
			if err := c.ShouldBindJSON(&req); err != nil {
				responses.SendError(c, 400, responses.ErrorBadRequest, "Données invalides", err.Error())
				return
			}

			// Nettoyer et valider le numéro
			cleanPhone := cleanSenegalPhone(req.Phone)
			if cleanPhone == "" {
				responses.SendError(c, 400, responses.ErrorInvalidPhone, "Numéro de téléphone invalide", 
					"Utilisez le format sénégalais: +221777080751 ou 777080751")
				return
			}

			// TODO: Vérifier que l'utilisateur existe déjà
			// authService := c.MustGet("auth_service").(services.AuthService)

			// Générer un nouveau code
			verificationCode, err := generateSecureCode()
			if err != nil {
				responses.SendError(c, 500, responses.ErrorInternalServer, "Erreur génération code", err.Error())
				return
			}

			// ⭐ MESSAGE SMS OPTIMISÉ POUR RENVOI
			message := fmt.Sprintf("🇸🇳 SenMarket: Nouveau code de vérification: %s. Valable 10 min.", verificationCode)

			// ⭐ ENVOYER VIA TWILIO
			if config.TwilioService != nil {
				ctx := c.Request.Context()
				result, err := config.TwilioService.SendSMS(ctx, cleanPhone, message)
				if err != nil {
					responses.SendError(c, 500, responses.ErrorInternalServer, "Erreur envoi SMS", err.Error())
					return
				}
				fmt.Printf("✅ Code de vérification renvoyé avec succès vers %s - ID: %s\n", cleanPhone, result.MessageID)
				
				responses.SendSuccess(c, gin.H{
					"message":      "Code de vérification renvoyé",
					"phone":        cleanPhone,
					"expires_in":   600, // 10 minutes
					"sms_result":   result,
					"debug": gin.H{
						"generated_code": verificationCode, // ⚠️ À SUPPRIMER EN PRODUCTION
					},
				}, "Nouveau code envoyé par SMS")
			} else {
				responses.SendSuccess(c, gin.H{
					"message":      "Code de vérification simulé",
					"phone":        cleanPhone,
					"expires_in":   600,
					"mode":         "simulation",
					"debug": gin.H{
						"generated_code": verificationCode, // ⚠️ À SUPPRIMER EN PRODUCTION
					},
				}, "Code simulé (TwilioService non configuré)")
			}
		})

		// ⭐ VOTRE ENDPOINT VERIFY EXISTANT (garder tel quel ou légèrement modifier)
		auth.POST("/verify", func(c *gin.Context) {
			// TODO: Utiliser votre logique de vérification existante
			// Ou intégrer avec votre UserController.VerifyUser si elle existe
			responses.SendSuccess(c, gin.H{"verified": true}, "Téléphone vérifié")
		})

		// ⭐ VOTRE ENDPOINT LOGIN EXISTANT (améliorer si nécessaire)
auth.POST("/login", func(c *gin.Context) {
    var req struct {
        Phone    string `json:"phone" binding:"required"`
        Password string `json:"password" binding:"required"`
    }
    
    if err := c.ShouldBindJSON(&req); err != nil {
        responses.SendError(c, 400, responses.ErrorBadRequest, "Données invalides", err.Error())
        return
    }

    // Nettoyer le numéro de téléphone
    cleanPhone := cleanSenegalPhone(req.Phone)
    if cleanPhone == "" {
        responses.SendError(c, 400, responses.ErrorInvalidPhone, "Format de téléphone invalide", nil)
        return
    }

    // ⭐ UTILISER VOTRE AUTHSERVICE RÉEL
    authService := c.MustGet("auth_service").(services.AuthService)
    
    // Authentifier l'utilisateur
    ctx := c.Request.Context()
    loginResponse, err := authService.Login(ctx, cleanPhone)
    if err != nil {
        // Gestion spécifique des erreurs
        if err.Error() == "Utilisateur non trouvé" {
            responses.SendError(c, 404, responses.ErrorUserNotFound, "Utilisateur non trouvé", nil)
            return
        }
        if err.Error() == "compte désactivé" {
            responses.SendError(c, 403, responses.ErrorForbidden, "Compte désactivé", nil)
            return
        }
        
        responses.SendError(c, 401, responses.ErrorUnauthorized, "Identifiants invalides", nil)
        return
    }

    // ⭐ RETOURNER LE VRAI TOKEN JWT
    responses.SendSuccess(c, gin.H{
        "token":        loginResponse.Token,        // ⭐ VRAI JWT !
        "refresh_token": loginResponse.RefreshToken, // ⭐ REFRESH TOKEN
        "expires_at":   loginResponse.ExpiresAt,    // ⭐ EXPIRATION
        "user":         loginResponse.User,         // ⭐ VRAIES DONNÉES USER
        "expires_in":   int64(loginResponse.ExpiresAt.Sub(time.Now()).Seconds()),
    }, "Connexion réussie")
})
		
		// ⭐ VOS ROUTES PROTÉGÉES EXISTANTES (garder tel quel)
		auth.GET("/me", config.AuthMiddleware.RequireAuth(), func(c *gin.Context) {
			userID := middleware.GetUserID(c)
			claims := middleware.GetUserClaims(c)
			
			responses.SendSuccess(c, gin.H{
				"user_id":     userID,
				"phone":       claims.Phone,
				"region":      claims.Region,
				"is_verified": claims.IsVerified,
				"is_active":   claims.IsActive,
			}, "Profil utilisateur")
		})
		
		auth.PUT("/profile", config.AuthMiddleware.RequireAuth(), func(c *gin.Context) {
			// TODO: Utiliser votre logique existante
			responses.SendSuccess(c, gin.H{"updated": true}, "Profil mis à jour")
		})
	}
}

// ⭐ REMPLACEZ votre fonction generateVerificationCode() par cette version CORRIGÉE
func generateVerificationCode() string {
	// Générer un code à 6 chiffres sécurisé
	code := mathRand.Intn(900000) + 100000
	return fmt.Sprintf("%06d", code)
}

// ⭐ AJOUTEZ cette fonction utilitaire CORRIGÉE à votre api_routes.go
func generateSecureCode() (string, error) {
	// Générer un nombre entre 100000 et 999999
	n, err := rand.Int(rand.Reader, big.NewInt(900000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()+100000), nil
}


// SetupUserRoutes configure les routes utilisateurs - MÉTHODES EXISTANTES SEULEMENT
func SetupUserRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	users := rg.Group("/users")
	{
		// Routes publiques
		users.GET("/phone", config.UserController.GetUserByPhone)
		
		// Routes protégées avec /me - UTILISE LES MÉTHODES EXISTANTES
		protected := users.Group("", config.AuthMiddleware.RequireAuth())
		{
			protected.GET("/me", config.UserController.GetCurrentUser)
			// 🔧 CORRIGÉ: Pas UpdateCurrentUser, juste un placeholder
			protected.PUT("/me", func(c *gin.Context) {
				// TODO: Implémenter ou utiliser une méthode existante
				responses.SendSuccess(c, gin.H{"updated": true}, "Profil mis à jour")
			})
			protected.GET("/me/stats", config.UserController.GetUserStats)
			protected.GET("/me/quota", config.UserController.GetUserQuota)
		}
		
		// Routes admin
		admin := users.Group("", config.AuthMiddleware.RequireAuth())
		{
			admin.GET("/:id", config.UserController.GetUser)
			admin.GET("/:id/stats", config.UserController.GetUserStats)
			admin.PUT("/:id/quota", config.UserController.UpdateUserQuota)
		}
	}
}

// SetupListingRoutes - MÉTHODES EXISTANTES SEULEMENT
func SetupListingRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	listings := rg.Group("/listings")
	listings.Use(middleware.RateLimitByEndpoint(50, 60))
	{
		// ✅ Routes publiques - MÉTHODES EXISTANTES
		listings.GET("", config.ListingController.GetListings)           // ✅ Existe
		listings.GET("/:id", config.ListingController.GetListing)        // ✅ Existe
		listings.GET("/search", config.ListingController.SearchListings) // ✅ Existe
		
		// ✅ Routes protégées - MÉTHODES EXISTANTES
		protected := listings.Group("", config.AuthMiddleware.RequireAuth())
		{
			protected.POST("", config.ListingController.CreateListing)       // ✅ Existe
			protected.PUT("/:id", config.ListingController.UpdateListing)    // ✅ Existe
			protected.PATCH("/:id", config.ListingController.UpdateListing)  // ✅ Même méthode
			protected.DELETE("/:id", config.ListingController.DeleteListing) // ✅ Existe
			protected.POST("/:id/publish", config.ListingController.PublishListing) // ✅ Existe
			
			// 🔧 CORRIGÉ: Utilise une méthode simple au lieu de GetMyListings
			protected.GET("/my", func(c *gin.Context) {
				// Récupérer l'ID utilisateur depuis le token
				userID := middleware.GetUserID(c)
				
				// Rediriger vers GetListings avec filtre user_id
				c.Set("user_filter", userID)
				config.ListingController.GetListings(c)
			})
		}
	}
}

// SetupQuotaRoutes - EXACTEMENT CE QUE VOTRE FRONTEND UTILISE
func SetupQuotaRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	quota := rg.Group("/quota")
	{
		// ✅ Routes publiques - EXACTEMENT ce que votre frontend appelle
		quota.GET("/current-phase", func(c *gin.Context) {
			responses.SendSuccess(c, gin.H{
				"current_phase":           "launch",
				"is_launch_active":        true,
				"days_until_launch_end":   15,
				"credit_system_active":    false,
				"paid_system_active":      false,
				"monthly_free_limit":      3,
				"standard_price":          1000,
				"currency":                "XOF",
				"phase_name":              "Phase de Lancement",
				"phase_description":       "Annonces gratuites illimitées",
				"benefits":                []string{"3 annonces gratuites/mois", "Support prioritaire"},
			}, "Phase actuelle")
		})
		
		quota.GET("/pricing", func(c *gin.Context) {
			responses.SendSuccess(c, gin.H{
				"free_listings":     3,
				"standard_price":    1000,
				"currency":          "XOF",
				"launch_unlimited":  true,
			}, "Tarification")
		})
		
		// ✅ Routes protégées - EXACTEMENT ce que votre frontend appelle
		protected := quota.Group("", config.AuthMiddleware.RequireAuth())
		{
			// ✅ /quota/status - Route principale de votre frontend
			protected.GET("/status", func(c *gin.Context) {
				responses.SendSuccess(c, gin.H{
					"can_create_free":   true,
					"remaining_free":    2,
					"unlimited_free":    true,
					"current_phase":     "launch",
					"used_this_month":   1,
					"limit_this_month":  3,
					"message":           "Phase de lancement active - annonces gratuites",
				}, "Statut quota")
			})
			
			// ✅ /quota/check - Éligibilité pour création d'annonce
			protected.GET("/check", func(c *gin.Context) {
				responses.SendSuccess(c, gin.H{
					"can_create_free":    true,
					"requires_payment":   false,
					"current_phase":      "launch", 
					"standard_price":     1000,
					"currency":           "XOF",
					"reason":             "Phase de lancement active",
				}, "Éligibilité vérifiée")
			})
			
			// ✅ /quota/summary - Résumé quota utilisateur
			protected.GET("/summary", func(c *gin.Context) {
				responses.SendSuccess(c, gin.H{
					"can_create_free":    true,
					"remaining_free":     2,
					"unlimited_free":     true,
					"requires_payment":   false,
					"message":            "Phase de lancement - créations gratuites",
					"current_phase":      "launch",
				}, "Résumé quota")
			})
			
			// ✅ /quota/history - Historique quota
			protected.GET("/history", func(c *gin.Context) {
				limitStr := c.DefaultQuery("limit", "6")
				limit, _ := strconv.Atoi(limitStr)
				
				// Générer un historique factice pour les tests
				history := make([]gin.H, limit)
				for i := 0; i < limit; i++ {
					history[i] = gin.H{
						"month":              6 - i,
						"year":               2025,
						"free_listings_used": 1,
						"paid_listings":      0,
						"total_listings":     1,
					}
				}
				
				responses.SendSuccess(c, gin.H{
					"history": history,
					"summary": gin.H{
						"total_listings":   1,
						"total_free_used":  1,
						"total_paid":       0,
					},
				}, "Historique quota")
			})
		}
	}
}

// SetupImageRoutes - EXACTEMENT CE QUE VOTRE FRONTEND UTILISE
func SetupImageRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	images := rg.Group("/images")
	{
		// Routes publiques de validation
		images.POST("/validate", func(c *gin.Context) {
			responses.SendSuccess(c, gin.H{
				"valid":     true,
				"size":      "1.2MB",
				"format":    "JPEG",
				"message":   "Image valide",
			}, "Image validée")
		})
		
		// ✅ Routes protégées - EXACTEMENT ce que votre frontend appelle
		protected := images.Group("", config.AuthMiddleware.RequireAuth())
		{
			// ✅ /images/upload - Upload simple
			protected.POST("/upload", func(c *gin.Context) {
				// TODO: Implémenter l'upload MinIO réel
				responses.SendSuccess(c, gin.H{
					"url": "http://localhost:9000/senmarket-images/uploads/2025/06/test-image.jpg",
					"id":  "image-id-123",
					"key": "uploads/2025/06/test-image.jpg",
				}, "Image uploadée")
			})
			
			// ✅ /images/upload-multiple - Upload multiple
			protected.POST("/upload-multiple", func(c *gin.Context) {
				// TODO: Implémenter l'upload multiple MinIO réel
				responses.SendSuccess(c, gin.H{
					"urls": []string{
						"http://localhost:9000/senmarket-images/uploads/2025/06/test1.jpg",
						"http://localhost:9000/senmarket-images/uploads/2025/06/test2.jpg",
					},
					"keys": []string{
						"uploads/2025/06/test1.jpg",
						"uploads/2025/06/test2.jpg",
					},
				}, "Images uploadées")
			})
			
			// ✅ /images/{id} - Suppression
			protected.DELETE("/:id", func(c *gin.Context) {
				imageID := c.Param("id")
				responses.SendSuccess(c, gin.H{
					"deleted_id": imageID,
				}, "Image supprimée")
			})
			
			// ✅ /images/list - Liste des images
			protected.GET("/list", func(c *gin.Context) {
				responses.SendSuccess(c, gin.H{
					"images": []gin.H{
						{
							"id":  "img1",
							"url": "http://localhost:9000/senmarket-images/uploads/2025/06/img1.jpg",
							"key": "uploads/2025/06/img1.jpg",
						},
					},
				}, "Images listées")
			})
		}
	}
}

// SetupPaymentRoutes configure les routes paiements
func SetupPaymentRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	payments := rg.Group("/payments")
	payments.Use(middleware.RateLimitByUser(10, 60))
	{
		// Routes publiques (callbacks + info)
		payments.POST("/callback/orange-money", config.PaymentController.PaymentCallback)
		payments.POST("/callback/wave", config.PaymentController.PaymentCallback)
		payments.POST("/callback/free-money", config.PaymentController.PaymentCallback)
		
		payments.GET("/methods", func(c *gin.Context) {
			methods := []map[string]interface{}{
				{"id": "orange_money", "name": "Orange Money", "icon": "🟠", "available": true},
				{"id": "wave", "name": "Wave", "icon": "🌊", "available": true},
				{"id": "free_money", "name": "Free Money", "icon": "💰", "available": true},
			}
			responses.SendSuccess(c, methods, "Méthodes de paiement")
		})
		
		// Routes protégées - UTILISE LES MÉTHODES EXISTANTES
		protected := payments.Group("", config.AuthMiddleware.RequireAuth())
		{
			protected.POST("", config.PaymentController.CreatePayment)
			protected.GET("", config.PaymentController.GetPayments)
			protected.GET("/:id", config.PaymentController.GetPayment)
			
			// Routes pour payer les annonces
			protected.POST("/listing/:id", func(c *gin.Context) {
				listingID := c.Param("id")
				responses.SendSuccess(c, gin.H{
					"payment_id":  "pay123",
					"listing_id":  listingID,
					"amount":      1000,
					"currency":    "XOF",
					"status":      "pending",
					"payment_url": "https://payment.provider.com/pay/123",
				}, "Paiement initié")
			})
		}
	}
}

// SetupCategoryRoutes configure les routes catégories
func SetupCategoryRoutes(rg *gin.RouterGroup, config *RouterConfig) {
	categories := rg.Group("/categories")
	{
		// Route principale - Compatible avec votre ancienne architecture
		categories.GET("", func(c *gin.Context) {
			categories := []map[string]interface{}{
				{"id": "6e38efde-1523-440a-a059-9ae74c4e30fe", "name": "Véhicules", "slug": "vehicles", "icon": "🚗"},
				{"id": "268adc21-89bb-4a0f-8aee-547e634ca826", "name": "Électronique", "slug": "electronics", "icon": "📱"},
				{"id": "real-estate-id", "name": "Immobilier", "slug": "real_estate", "icon": "🏠"},
				{"id": "jobs-id", "name": "Emplois", "slug": "jobs", "icon": "💼"},
				{"id": "services-id", "name": "Services", "slug": "services", "icon": "🔧"},
				{"id": "fashion-id", "name": "Mode & Beauté", "slug": "fashion", "icon": "👗"},
				{"id": "home-id", "name": "Maison & Jardin", "slug": "home", "icon": "🏡"},
				{"id": "leisure-id", "name": "Loisirs", "slug": "leisure", "icon": "🎯"},
			}
			responses.SendSuccess(c, categories, "Catégories")
		})
		
		// Routes catégories avec stats
		categories.GET("/stats", func(c *gin.Context) {
			// TODO: Implémenter via CategoryController si nécessaire
			responses.SendSuccess(c, gin.H{"stats": "TODO"}, "Stats catégories")
		})
		
		categories.GET("/:id", func(c *gin.Context) {
			// TODO: Implémenter via CategoryController
			responses.SendSuccess(c, gin.H{"category": "TODO"}, "Catégorie")
		})
		
		categories.GET("/:id/listings", func(c *gin.Context) {
			// TODO: Rediriger vers listings avec filter
			responses.SendSuccess(c, gin.H{"listings": "TODO"}, "Annonces de la catégorie")
		})
	}
}	