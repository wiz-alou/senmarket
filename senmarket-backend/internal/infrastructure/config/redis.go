// internal/infrastructure/config/redis.go
package config

// RedisConfig configuration Redis
type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
	PoolSize int
}

// LoadRedisConfig charge la configuration Redis
func LoadRedisConfig() *RedisConfig {
	return &RedisConfig{
		Host:     getEnv("REDIS_HOST", "localhost"),
		Port:     getEnv("REDIS_PORT", "6379"),
		Password: getEnv("REDIS_PASSWORD", ""),
		DB:       getEnvAsInt("REDIS_DB", 0),
		PoolSize: getEnvAsInt("REDIS_POOL_SIZE", 10),
	}
}

// GetAddr retourne l'adresse Redis
func (c *RedisConfig) GetAddr() string {
	return c.Host + ":" + c.Port
}
