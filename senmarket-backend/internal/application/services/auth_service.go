// internal/application/services/auth_service.go
package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt" // ⭐ IMPORT AJOUTÉ
	"senmarket/internal/domain/entities"
	"senmarket/internal/domain/repositories"
)

// AuthService service d'authentification
type AuthService interface {
	// Login authentifie un utilisateur et retourne un JWT (sans password - pour compatibility)
	Login(ctx context.Context, phone string) (*LoginResponse, error)
	
	// ⭐ NOUVEAU : LoginWithPassword avec vérification mot de passe
	LoginWithPassword(ctx context.Context, phone string, password string) (*LoginResponse, error)
	
	// ValidateToken valide un JWT et retourne les claims
	ValidateToken(tokenString string) (*UserClaims, error)
	
	// RefreshToken génère un nouveau token à partir d'un refresh token
	RefreshToken(ctx context.Context, refreshToken string) (*LoginResponse, error)
	
	// GenerateTokenForUser génère un token pour un utilisateur donné
	GenerateTokenForUser(user *entities.User) (*LoginResponse, error)
}

// AuthServiceImpl implémentation du service d'authentification
type AuthServiceImpl struct {
	userRepo   repositories.UserRepository
	jwtSecret  string
	jwtExpiry  time.Duration
}

// NewAuthService crée un nouveau service d'authentification
func NewAuthService(userRepo repositories.UserRepository, jwtSecret string, jwtExpiry time.Duration) AuthService {
	if jwtSecret == "" {
		jwtSecret = "senmarket-dev-secret-2025" // Valeur par défaut pour dev
	}
	if jwtExpiry == 0 {
		jwtExpiry = 24 * time.Hour // 24h par défaut
	}
	
	return &AuthServiceImpl{
		userRepo:  userRepo,
		jwtSecret: jwtSecret,
		jwtExpiry: jwtExpiry,
	}
}

// UserClaims claims JWT pour l'utilisateur
type UserClaims struct {
	UserID     string `json:"user_id"`
	Phone      string `json:"phone"`
	Region     string `json:"region"`
	IsVerified bool   `json:"is_verified"`
	IsActive   bool   `json:"is_active"`
	jwt.RegisteredClaims
}

// LoginResponse réponse de connexion
type LoginResponse struct {
	Token        string    `json:"token"`
	RefreshToken string    `json:"refresh_token"`
	ExpiresAt    time.Time `json:"expires_at"`
	User         *UserInfo `json:"user"`
}

// UserInfo informations utilisateur simplifiées
type UserInfo struct {
	ID         string `json:"id"`
	Phone      string `json:"phone"`
	Region     string `json:"region"`
	IsVerified bool   `json:"is_verified"`
	IsActive   bool   `json:"is_active"`
}

// Login authentifie un utilisateur
func (s *AuthServiceImpl) Login(ctx context.Context, phone string) (*LoginResponse, error) {
	// Rechercher l'utilisateur par téléphone
	user, err := s.userRepo.GetByPhone(ctx, phone)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// Vérifier que l'utilisateur est actif
	if !user.IsActive {
		return nil, errors.New("compte désactivé")
	}
	
	// Générer les tokens
	return s.GenerateTokenForUser(user)
}

// ⭐ SOLUTION : LoginWithPassword en utilisant le Repository pour accéder au PasswordHash
func (s *AuthServiceImpl) LoginWithPassword(ctx context.Context, phone string, password string) (*LoginResponse, error) {
	// 1. Rechercher l'utilisateur par téléphone
	user, err := s.userRepo.GetByPhone(ctx, phone)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// 2. ⭐ SOLUTION : Récupérer le PasswordHash via une méthode spéciale du Repository
	passwordHash, err := s.userRepo.GetPasswordHash(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("erreur récupération mot de passe: %w", err)
	}
	
	// 3. Vérifier le mot de passe
	if !s.checkPassword(password, passwordHash) {
		return nil, errors.New("mot de passe incorrect")
	}
	
	// 4. Vérifier que l'utilisateur est actif
	if !user.IsActive {
		return nil, errors.New("compte désactivé")
	}
	
	// 5. Générer les tokens
	return s.GenerateTokenForUser(user)
}

// ⭐ MÉTHODE DE VÉRIFICATION BCRYPT CORRIGÉE
func (s *AuthServiceImpl) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// GenerateTokenForUser génère un token pour un utilisateur
func (s *AuthServiceImpl) GenerateTokenForUser(user *entities.User) (*LoginResponse, error) {
	now := time.Now()
	expiresAt := now.Add(s.jwtExpiry)
	
	// Créer les claims
	claims := &UserClaims{
		UserID:     user.ID,
		Phone:      user.GetPhoneNumber(),
		Region:     user.GetRegionName(),
		IsVerified: user.IsVerified,
		IsActive:   user.IsActive,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID,
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			NotBefore: jwt.NewNumericDate(now),
			Issuer:    "senmarket-api",
			Audience:  jwt.ClaimStrings{"senmarket-web", "senmarket-mobile"},
		},
	}
	
	// Créer le token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	
	// Signer le token
	tokenString, err := token.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("erreur génération token: %w", err)
	}
	
	// Générer refresh token (plus long)
	refreshClaims := &jwt.RegisteredClaims{
		Subject:   user.ID,
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(now.Add(7 * 24 * time.Hour)), // 7 jours
		NotBefore: jwt.NewNumericDate(now),
		Issuer:    "senmarket-api",
	}
	
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, fmt.Errorf("erreur génération refresh token: %w", err)
	}
	
	// Mettre à jour le last login
	user.UpdateLastLogin()
	s.userRepo.Update(context.Background(), user)
	
	return &LoginResponse{
		Token:        tokenString,
		RefreshToken: refreshTokenString,
		ExpiresAt:    expiresAt,
		User: &UserInfo{
			ID:         user.ID,
			Phone:      user.GetPhoneNumber(),
			Region:     user.GetRegionName(),
			IsVerified: user.IsVerified,
			IsActive:   user.IsActive,
		},
	}, nil
}

// ValidateToken valide un JWT
func (s *AuthServiceImpl) ValidateToken(tokenString string) (*UserClaims, error) {
	// Parser le token
	token, err := jwt.ParseWithClaims(tokenString, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Vérifier la méthode de signature
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("méthode de signature inattendue: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})
	
	if err != nil {
		return nil, fmt.Errorf("token invalide: %w", err)
	}
	
	// Extraire les claims
	claims, ok := token.Claims.(*UserClaims)
	if !ok || !token.Valid {
		return nil, errors.New("claims invalides")
	}
	
	// Vérifications supplémentaires
	if time.Now().After(claims.ExpiresAt.Time) {
		return nil, errors.New("token expiré")
	}
	
	return claims, nil
}

// RefreshToken génère un nouveau token
func (s *AuthServiceImpl) RefreshToken(ctx context.Context, refreshToken string) (*LoginResponse, error) {
	// Parser le refresh token
	token, err := jwt.ParseWithClaims(refreshToken, &jwt.RegisteredClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(s.jwtSecret), nil
	})
	
	if err != nil {
		return nil, fmt.Errorf("refresh token invalide: %w", err)
	}
	
	claims, ok := token.Claims.(*jwt.RegisteredClaims)
	if !ok || !token.Valid {
		return nil, errors.New("refresh token invalide")
	}
	
	// Récupérer l'utilisateur
	user, err := s.userRepo.GetByID(ctx, claims.Subject)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, entities.ErrUserNotFound
	}
	
	// Générer nouveau token
	return s.GenerateTokenForUser(user)
}