// internal/infrastructure/config/database.go
package config

// DatabaseConfig configuration de la base de données
type DatabaseConfig struct {
	Host         string
	Port         string
	User         string
	Password     string
	Name         string
	SSLMode      string
	MaxOpenConns int
	MaxIdleConns int
	MaxLifetime  int
}

// LoadDatabaseConfig charge la configuration de la base de données
func LoadDatabaseConfig() *DatabaseConfig {
	return &DatabaseConfig{
		Host:         getEnv("DB_HOST", "localhost"),
		Port:         getEnv("DB_PORT", "5432"),
		User:         getEnv("DB_USER", "postgres"),
		Password:     getEnv("DB_PASSWORD", ""),
		Name:         getEnv("DB_NAME", "senmarket"),
		SSLMode:      getEnv("DB_SSLMODE", "disable"),
		MaxOpenConns: getEnvAsInt("DB_MAX_OPEN_CONNS", 25),
		MaxIdleConns: getEnvAsInt("DB_MAX_IDLE_CONNS", 5),
		MaxLifetime:  getEnvAsInt("DB_MAX_LIFETIME", 300),
	}
}

// GetDSN retourne la chaîne de connexion PostgreSQL
func (c *DatabaseConfig) GetDSN() string {
	return getEnv("DATABASE_URL", 
		"host="+c.Host+" user="+c.User+" password="+c.Password+" dbname="+c.Name+" port="+c.Port+" sslmode="+c.SSLMode+" TimeZone=UTC")
}
