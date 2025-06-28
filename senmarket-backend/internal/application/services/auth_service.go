// internal/application/services/auth_service.go
package services

import (
	"context"
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
	"time"
)

// AuthService service d'authentification de la couche application
type AuthService interface {
	// AuthenticateUser authentifie un utilisateur
	AuthenticateUser(ctx context.Context, phone string) (*AuthResult, error)
	
	// GenerateToken génère un token JWT
	GenerateToken(ctx context.Context, userID string) (*TokenResult, error)
	
	// ValidateToken valide un token JWT
	ValidateToken(ctx context.Context, token string) (*TokenClaims, error)
	
	// RefreshToken renouvelle un token
	RefreshToken(ctx context.Context, refreshToken string) (*TokenResult, error)
	
	// RevokeToken révoque un token
	RevokeToken(ctx context.Context, token string) error
}

// AuthResult résultat d'authentification
type AuthResult struct {
	UserID      string    `json:"user_id"`
	IsVerified  bool      `json:"is_verified"`
	NeedsVerification bool `json:"needs_verification"`
	LastLoginAt time.Time `json:"last_login_at"`
}

// TokenResult résultat de génération de token
type TokenResult struct {
	AccessToken  string    `json:"access_token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	TokenType    string    `json:"token_type"`
}

// TokenClaims claims du token JWT
type TokenClaims struct {
	UserID    string    `json:"user_id"`
	Phone     string    `json:"phone"`
	IsVerified bool     `json:"is_verified"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiresAt time.Time `json:"expires_at"`
}

// AuthServiceImpl implémentation du service d'authentification
type AuthServiceImpl struct {
	userRepo repositories.UserRepository
	// TODO: Ajouter JWTService quand on l'aura migré
}

// NewAuthService crée un nouveau service d'authentification
func NewAuthService(userRepo repositories.UserRepository) AuthService {
	return &AuthServiceImpl{
		userRepo: userRepo,
	}
}

// AuthenticateUser authentifie un utilisateur
func (s *AuthServiceImpl) AuthenticateUser(ctx context.Context, phone string) (*AuthResult, error) {
	user, err := s.userRepo.GetByPhone(ctx, phone)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// Mettre à jour la dernière connexion
	user.UpdateLastLogin()
	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}
	
	return &AuthResult{
		UserID:            user.ID,
		IsVerified:        user.IsVerified,
		NeedsVerification: !user.IsVerified,
		LastLoginAt:       *user.LastLoginAt,
	}, nil
}

// Les autres méthodes seront implémentées plus tard
func (s *AuthServiceImpl) GenerateToken(ctx context.Context, userID string) (*TokenResult, error) {
	// TODO: Implémenter avec JWT
	return nil, nil
}

func (s *AuthServiceImpl) ValidateToken(ctx context.Context, token string) (*TokenClaims, error) {
	// TODO: Implémenter avec JWT
	return nil, nil
}

func (s *AuthServiceImpl) RefreshToken(ctx context.Context, refreshToken string) (*TokenResult, error) {
	// TODO: Implémenter avec JWT
	return nil, nil
}

func (s *AuthServiceImpl) RevokeToken(ctx context.Context, token string) error {
	// TODO: Implémenter avec JWT
	return nil
}
