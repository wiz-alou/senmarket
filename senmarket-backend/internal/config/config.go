<<<<<<< HEAD
// internal/config/config.go
=======
// internal/config/config.go - VERSION NETTOYÉE
>>>>>>> 60c2d70 (🔒 Security: Remove Twilio credentials from public files)
package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Port     string
	Env      string
	Database DatabaseConfig
	Redis    RedisConfig
	JWT      JWTConfig
<<<<<<< HEAD
	WhatsApp WhatsAppConfig  // ✨ NOUVEAU : Configuration WhatsApp
=======
	WhatsApp WhatsAppConfig
>>>>>>> 60c2d70 (🔒 Security: Remove Twilio credentials from public files)
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	Name     string
	SSLMode  string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret string
	Expiry time.Duration
}

<<<<<<< HEAD
// ✨ NOUVELLE STRUCTURE : Configuration WhatsApp
type WhatsAppConfig struct {
	Provider       string `json:"provider"`        // "twilio", "360dialog", "wati", "mock"
	Environment    string `json:"environment"`     // "development", "production"
	BusinessNumber string `json:"business_number"` // Numéro WhatsApp Business
	APIToken       string `json:"api_token"`       // Token API du provider
	APIURL         string `json:"api_url"`         // URL API du provider
	WebhookSecret  string `json:"webhook_secret"`  // Secret pour sécuriser les webhooks
=======
// Configuration WhatsApp/SMS
type WhatsAppConfig struct {
	Provider       string // twilio, mock
	Environment    string // development, production
	BusinessNumber string // Numéro Twilio
	AccountSID     string // Account SID Twilio
	AuthToken      string // Auth Token Twilio
	APIURL         string // URL API Twilio
>>>>>>> 60c2d70 (🔒 Security: Remove Twilio credentials from public files)
}

func Load() (*Config, error) {
	// Parse JWT expiry
	jwtExpiryStr := getEnv("JWT_EXPIRY", "24h")
	jwtExpiry, err := time.ParseDuration(jwtExpiryStr)
	if err != nil {
		jwtExpiry = 24 * time.Hour
	}

	// Parse Redis DB
	redisDB, err := strconv.Atoi(getEnv("REDIS_DB", "0"))
	if err != nil {
		redisDB = 0
	}

	config := &Config{
		Port: getEnv("PORT", "8080"),
		Env:  getEnv("ENV", "development"),
		
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "senmarket"),
			Password: getEnv("DB_PASSWORD", "senmarket123"),
			Name:     getEnv("DB_NAME", "senmarket"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		},
		
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       redisDB,
		},
		
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", "super-secret-jwt-key"),
			Expiry: jwtExpiry,
		},
<<<<<<< HEAD

		// ✨ NOUVELLE CONFIGURATION WHATSAPP
=======
		// ✅ CONFIGURATION TWILIO DEPUIS VARIABLES D'ENVIRONNEMENT
>>>>>>> 60c2d70 (🔒 Security: Remove Twilio credentials from public files)
		WhatsApp: WhatsAppConfig{
			Provider:       getEnv("WHATSAPP_PROVIDER", "mock"),
			Environment:    getEnv("WHATSAPP_ENVIRONMENT", "development"),
<<<<<<< HEAD
			BusinessNumber: getEnv("WHATSAPP_BUSINESS_NUMBER", "+221775551234"),
			APIToken:       getEnv("WHATSAPP_API_TOKEN", ""),
			APIURL:         getEnv("WHATSAPP_API_URL", ""),
			WebhookSecret:  getEnv("WHATSAPP_WEBHOOK_SECRET", ""),
=======
			BusinessNumber: getEnv("TWILIO_PHONE_NUMBER", ""),
			AccountSID:     getEnv("TWILIO_ACCOUNT_SID", ""),
			AuthToken:      getEnv("TWILIO_AUTH_TOKEN", ""),
			APIURL:         getEnv("TWILIO_API_URL", ""),
>>>>>>> 60c2d70 (🔒 Security: Remove Twilio credentials from public files)
		},
	}

	return config, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}