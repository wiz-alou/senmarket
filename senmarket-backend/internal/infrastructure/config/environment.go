// internal/infrastructure/config/environment.go
package config

import (
	"os"
	"strconv"
)

// Environment configuration de l'environnement
type Environment struct {
	Environment string
	Port        string
	Debug       bool
}

// LoadEnvironment charge la configuration de l'environnement
func LoadEnvironment() *Environment {
	env := &Environment{
		Environment: getEnv("ENVIRONMENT", "development"),
		Port:        getEnv("PORT", "8080"),
		Debug:       getEnvAsBool("DEBUG", true),
	}
	
	return env
}

// IsDevelopment vérifie si on est en développement
func (e *Environment) IsDevelopment() bool {
	return e.Environment == "development"
}

// IsProduction vérifie si on est en production
func (e *Environment) IsProduction() bool {
	return e.Environment == "production"
}

// getEnv récupère une variable d'environnement avec valeur par défaut
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// getEnvAsBool récupère une variable d'environnement comme booléen
func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolValue, err := strconv.ParseBool(value); err == nil {
			return boolValue
		}
	}
	return defaultValue
}

// getEnvAsInt récupère une variable d'environnement comme entier
func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
