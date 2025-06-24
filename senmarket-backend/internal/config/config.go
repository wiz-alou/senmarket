// internal/config/config.go
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
	WhatsApp WhatsAppConfig
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

type WhatsAppConfig struct {
	Provider        string // twilio, mock
	Environment     string // development, production
	BusinessNumber  string
	AccountSID      string
	AuthToken       string
	APIURL          string
}

func Load() (*Config, error) {
	env := getEnv("ENV", "development")
	
	// Parse JWT expiry
	jwtExpiryStr := getEnv("JWT_EXPIRY", "24h")
	jwtExpiry, err := time.ParseDuration(jwtExpiryStr)
	if err != nil {
		jwtExpiry = 24 * time.Hour
	}

	// Parse Redis DB
		// redisDB, err := strconv.Atoi(getEnv("REDIS_DB", "0"))
		// if err != nil {
		// 	redisDB = 0
		// }

	config := &Config{
		Port: getEnv("PORT", "8080"),
		Env:  env,
		Database: getDatabaseConfig(env),
		Redis:    getRedisConfig(env),
		JWT: JWTConfig{
			Secret: getEnv("JWT_SECRET", getDefaultJWTSecret(env)),
			Expiry: jwtExpiry,
		},
		WhatsApp: getWhatsAppConfig(env),
	}

	return config, nil
}

// Configuration base de données selon l'environnement
func getDatabaseConfig(env string) DatabaseConfig {
	switch env {
	case "production":
		return DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "senmarket_prod"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "senmarket_prod"),
			SSLMode:  getEnv("DB_SSL_MODE", "require"),
		}
	case "staging":
		return DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "senmarket_staging"),
			Password: getEnv("DB_PASSWORD", ""),
			Name:     getEnv("DB_NAME", "senmarket_staging"),
			SSLMode:  getEnv("DB_SSL_MODE", "prefer"),
		}
	default: // development
		return DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "senmarket"),
			Password: getEnv("DB_PASSWORD", "senmarket123"),
			Name:     getEnv("DB_NAME", "senmarket"),
			SSLMode:  getEnv("DB_SSL_MODE", "disable"),
		}
	}
}

// Configuration Redis selon l'environnement
func getRedisConfig(env string) RedisConfig {
	redisDB, _ := strconv.Atoi(getEnv("REDIS_DB", getDefaultRedisDB(env)))
	
	return RedisConfig{
		Host:     getEnv("REDIS_HOST", getDefaultRedisHost(env)),
		Port:     getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", getDefaultRedisPassword(env)),
		DB:       redisDB,
	}
}

// Configuration WhatsApp selon l'environnement
func getWhatsAppConfig(env string) WhatsAppConfig {
	switch env {
	case "production":
		return WhatsAppConfig{
			Provider:       getEnv("WHATSAPP_PROVIDER", "twilio"),
			Environment:    env,
			BusinessNumber: getEnv("TWILIO_PHONE_NUMBER", "+14788278859"),
			AccountSID:     getEnv("TWILIO_ACCOUNT_SID", "AC0c98c786688083e31752129e3af4bfb8"),
			AuthToken:      getEnv("TWILIO_AUTH_TOKEN", "9a4b257e333d107c54cc50da43e44868"),
			APIURL:         getEnv("TWILIO_API_URL", "https://api.twilio.com/2010-04-01/Accounts/AC0c98c786688083e31752129e3af4bfb8"),
		}
	case "staging":
		return WhatsAppConfig{
			Provider:       getEnv("WHATSAPP_PROVIDER", "twilio"),
			Environment:    env,
			BusinessNumber: getEnv("TWILIO_PHONE_NUMBER", ""),
			AccountSID:     getEnv("TWILIO_ACCOUNT_SID", ""),
			AuthToken:      getEnv("TWILIO_AUTH_TOKEN", ""),
			APIURL:         getEnv("TWILIO_API_URL", ""),
		}
	default: // development
		return WhatsAppConfig{
			Provider:       getEnv("WHATSAPP_PROVIDER", "mock"),
			Environment:    env,
			BusinessNumber: getEnv("TWILIO_PHONE_NUMBER", ""),
			AccountSID:     getEnv("TWILIO_ACCOUNT_SID", ""),
			AuthToken:      getEnv("TWILIO_AUTH_TOKEN", ""),
			APIURL:         getEnv("TWILIO_API_URL", ""),
		}
	}
}

// Fonctions utilitaires pour les valeurs par défaut
func getDefaultJWTSecret(env string) string {
	switch env {
	case "production":
		return "" // Force l'utilisation d'une variable d'environnement
	default:
		return "super-secret-jwt-key"
	}
}

func getDefaultRedisHost(env string) string {
	switch env {
	case "production":
		return "redis-prod"
	case "staging":
		return "redis-staging"
	default:
		return "localhost"
	}
}

func getDefaultRedisPassword(env string) string {
	switch env {
	case "production", "staging":
		return "" // Force l'utilisation d'une variable d'environnement
	default:
		return ""
	}
}

func getDefaultRedisDB(env string) string {
	switch env {
	case "production":
		return "1"
	case "staging":
		return "2"
	default:
		return "0"
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}