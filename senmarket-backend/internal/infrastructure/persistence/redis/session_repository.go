// internal/infrastructure/persistence/redis/session_repository.go
package redis

import (
   "context"
   "encoding/json"
   "fmt"
   "time"
   "github.com/redis/go-redis/v9"
)

// SessionData données de session
type SessionData struct {
   UserID    string                 `json:"user_id"`
   Phone     string                 `json:"phone"`
   IsVerified bool                  `json:"is_verified"`
   CreatedAt time.Time              `json:"created_at"`
   LastAccess time.Time             `json:"last_access"`
   Data      map[string]interface{} `json:"data"`
}

// SessionRepository repository pour les sessions
type SessionRepository struct {
   client *redis.Client
   prefix string
   defaultExpiration time.Duration
}

// NewSessionRepository crée un nouveau repository session
func NewSessionRepository(client *redis.Client) *SessionRepository {
   return &SessionRepository{
   	client: client,
   	prefix: "session:",
   	defaultExpiration: 24 * time.Hour, // 24h par défaut
   }
}

// CreateSession crée une nouvelle session
func (r *SessionRepository) CreateSession(ctx context.Context, sessionID string, userID, phone string, isVerified bool) error {
   sessionData := &SessionData{
   	UserID:     userID,
   	Phone:      phone,
   	IsVerified: isVerified,
   	CreatedAt:  time.Now(),
   	LastAccess: time.Now(),
   	Data:       make(map[string]interface{}),
   }
   
   jsonData, err := json.Marshal(sessionData)
   if err != nil {
   	return err
   }
   
   key := r.prefix + sessionID
   return r.client.Set(ctx, key, jsonData, r.defaultExpiration).Err()
}

// GetSession récupère une session
func (r *SessionRepository) GetSession(ctx context.Context, sessionID string) (*SessionData, error) {
   key := r.prefix + sessionID
   val, err := r.client.Get(ctx, key).Result()
   if err != nil {
   	if err == redis.Nil {
   		return nil, nil
   	}
   	return nil, err
   }
   
   var sessionData SessionData
   if err := json.Unmarshal([]byte(val), &sessionData); err != nil {
   	return nil, err
   }
   
   // Mettre à jour le dernier accès
   sessionData.LastAccess = time.Now()
   r.UpdateSession(ctx, sessionID, &sessionData)
   
   return &sessionData, nil
}

// UpdateSession met à jour une session
func (r *SessionRepository) UpdateSession(ctx context.Context, sessionID string, sessionData *SessionData) error {
   jsonData, err := json.Marshal(sessionData)
   if err != nil {
   	return err
   }
   
   key := r.prefix + sessionID
   return r.client.Set(ctx, key, jsonData, r.defaultExpiration).Err()
}

// DeleteSession supprime une session
func (r *SessionRepository) DeleteSession(ctx context.Context, sessionID string) error {
   key := r.prefix + sessionID
   return r.client.Del(ctx, key).Err()
}

// ExtendSession prolonge l'expiration d'une session
func (r *SessionRepository) ExtendSession(ctx context.Context, sessionID string, duration time.Duration) error {
   key := r.prefix + sessionID
   return r.client.Expire(ctx, key, duration).Err()
}

// GetUserSessions récupère toutes les sessions d'un utilisateur
func (r *SessionRepository) GetUserSessions(ctx context.Context, userID string) ([]*SessionData, error) {
   pattern := r.prefix + "*"
   keys, err := r.client.Keys(ctx, pattern).Result()
   if err != nil {
   	return nil, err
   }
   
   var sessions []*SessionData
   for _, key := range keys {
   	val, err := r.client.Get(ctx, key).Result()
   	if err != nil {
   		continue
   	}
   	
   	var sessionData SessionData
   	if err := json.Unmarshal([]byte(val), &sessionData); err != nil {
   		continue
   	}
   	
   	if sessionData.UserID == userID {
   		sessions = append(sessions, &sessionData)
   	}
   }
   
   return sessions, nil
}

// DeleteUserSessions supprime toutes les sessions d'un utilisateur
func (r *SessionRepository) DeleteUserSessions(ctx context.Context, userID string) error {
	pattern := r.prefix + "*"
	keys, err := r.client.Keys(ctx, pattern).Result()
	if err != nil {
		return err
	}
	
	// Supprimer les clés correspondant aux sessions de l'utilisateur
	for _, key := range keys {
		val, err := r.client.Get(ctx, key).Result()
		if err != nil {
			continue
		}
		
		var sessionData SessionData
		if err := json.Unmarshal([]byte(val), &sessionData); err != nil {
			continue
		}
		
		if sessionData.UserID == userID {
			r.client.Del(ctx, key)
		}
	}
	
	return nil
}

// SetSessionData définit une donnée spécifique dans la session
func (r *SessionRepository) SetSessionData(ctx context.Context, sessionID, key string, value interface{}) error {
   sessionData, err := r.GetSession(ctx, sessionID)
   if err != nil || sessionData == nil {
   	return fmt.Errorf("session not found")
   }
   
   sessionData.Data[key] = value
   return r.UpdateSession(ctx, sessionID, sessionData)
}

// GetSessionData récupère une donnée spécifique de la session
func (r *SessionRepository) GetSessionData(ctx context.Context, sessionID, key string) (interface{}, error) {
   sessionData, err := r.GetSession(ctx, sessionID)
   if err != nil || sessionData == nil {
   	return nil, fmt.Errorf("session not found")
   }
   
   value, exists := sessionData.Data[key]
   if !exists {
   	return nil, nil
   }
   
   return value, nil
}

// CleanupExpiredSessions nettoie les sessions expirées
func (r *SessionRepository) CleanupExpiredSessions(ctx context.Context) error {
   // Redis gère automatiquement l'expiration des clés
   // Cette méthode peut être utilisée pour des nettoyages additionnels si nécessaire
   return nil
}
