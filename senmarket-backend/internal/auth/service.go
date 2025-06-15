// internal/auth/service.go
package auth

import (
	"errors"
	"fmt"
	"math/rand"
	// "strconv"
	"time"

	"senmarket/internal/models"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

var (
	ErrInvalidCredentials = errors.New("identifiants invalides")
	ErrUserNotFound      = errors.New("utilisateur non trouvé")
	ErrUserExists        = errors.New("utilisateur existe déjà")
	ErrInvalidCode       = errors.New("code de vérification invalide")
	ErrCodeExpired       = errors.New("code de vérification expiré")
)

type Service struct {
	db     *gorm.DB
	jwt    *JWTService
	sms    SMSService
}

type SMSService interface {
	SendSMS(phone, message string) error
}

type RegisterRequest struct {
	Phone     string `json:"phone" validate:"required,e164"`
	Email     string `json:"email" validate:"omitempty,email"`  // ✅ CORRECTION: omitempty pour email optionnel
	Password  string `json:"password" validate:"required,min=6"`
	FirstName string `json:"first_name" validate:"required,min=2,max=50"`
	LastName  string `json:"last_name" validate:"required,min=2,max=50"`
	Region    string `json:"region" validate:"required"`
}

type LoginRequest struct {
	Phone    string `json:"phone" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type VerifyRequest struct {
	Phone string `json:"phone" validate:"required"`
	Code  string `json:"code" validate:"required,len=6"`
}

type AuthResponse struct {
	User  *models.User `json:"user"`
	Token string       `json:"token"`
}

func NewService(db *gorm.DB, jwtService *JWTService, smsService SMSService) *Service {
	return &Service{
		db:  db,
		jwt: jwtService,
		sms: smsService,
	}
}

// Register crée un nouveau compte utilisateur
func (s *Service) Register(req *RegisterRequest) (*AuthResponse, error) {
	// ✅ CORRECTION 1: Vérifier d'abord par téléphone seulement
	var existingUser models.User
	if err := s.db.Where("phone = ?", req.Phone).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("un compte existe déjà avec ce numéro de téléphone")
	}

	// ✅ CORRECTION 2: Vérifier email seulement s'il est fourni et non vide
	if req.Email != "" {
		if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
			return nil, fmt.Errorf("un compte existe déjà avec cet email")
		}
	}

	// Hasher le mot de passe
	hashedPassword, err := s.hashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("erreur hachage mot de passe: %w", err)
	}

	// ✅ CORRECTION 3: Créer l'utilisateur avec gestion correcte de l'email
	user := models.User{
		Phone:        req.Phone,
		Email:        req.Email, // Si vide, sera géré par la base comme NULL
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Region:       req.Region,
		IsVerified:   false, // Nécessite vérification SMS
	}

	// ✅ CORRECTION 4: Si email vide, ne pas l'envoyer à la base
	if req.Email == "" {
		// Créer sans email pour éviter les contraintes unique
		userWithoutEmail := models.User{
			Phone:        req.Phone,
			// Email omis volontairement
			PasswordHash: hashedPassword,
			FirstName:    req.FirstName,
			LastName:     req.LastName,
			Region:       req.Region,
			IsVerified:   false,
		}
		
		if err := s.db.Omit("email").Create(&userWithoutEmail).Error; err != nil {
			return nil, fmt.Errorf("erreur création utilisateur: %w", err)
		}
		user = userWithoutEmail
	} else {
		if err := s.db.Create(&user).Error; err != nil {
			return nil, fmt.Errorf("erreur création utilisateur: %w", err)
		}
	}

	// Envoyer le code de vérification SMS
	if err := s.sendVerificationCode(user.Phone); err != nil {
		// Log l'erreur mais ne bloque pas l'inscription
		fmt.Printf("Erreur envoi SMS: %v\n", err)
	}

	// Générer le token JWT (même si pas encore vérifié)
	token, err := s.jwt.GenerateToken(user.ID.String())
	if err != nil {
		return nil, fmt.Errorf("erreur génération token: %w", err)
	}

	return &AuthResponse{
		User:  &user,
		Token: token,
	}, nil
}

// Login authentifie un utilisateur
func (s *Service) Login(req *LoginRequest) (*AuthResponse, error) {
	var user models.User
	if err := s.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("erreur recherche utilisateur: %w", err)
	}

	// Vérifier le mot de passe
	if !s.checkPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	// Générer le token JWT
	token, err := s.jwt.GenerateToken(user.ID.String())
	if err != nil {
		return nil, fmt.Errorf("erreur génération token: %w", err)
	}

	return &AuthResponse{
		User:  &user,
		Token: token,
	}, nil
}

// SendVerificationCode envoie un nouveau code de vérification
func (s *Service) SendVerificationCode(phone string) error {
	return s.sendVerificationCode(phone)
}

// VerifyPhone vérifie le code SMS et active le compte
func (s *Service) VerifyPhone(req *VerifyRequest) error {
	// Chercher le code de vérification
	var verification models.SMSVerification
	if err := s.db.Where("phone = ? AND code = ? AND verified = ?", 
		req.Phone, req.Code, false).First(&verification).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrInvalidCode
		}
		return fmt.Errorf("erreur recherche code: %w", err)
	}

	// Vérifier que le code n'a pas expiré
	if time.Now().After(verification.ExpiresAt) {
		return ErrCodeExpired
	}

	// Marquer le code comme utilisé
	verification.Verified = true
	if err := s.db.Save(&verification).Error; err != nil {
		return fmt.Errorf("erreur mise à jour vérification: %w", err)
	}

	// Activer l'utilisateur
	if err := s.db.Model(&models.User{}).Where("phone = ?", req.Phone).
		Update("is_verified", true).Error; err != nil {
		return fmt.Errorf("erreur activation utilisateur: %w", err)
	}

	return nil
}

// GetUserByID récupère un utilisateur par son ID
func (s *Service) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("erreur récupération utilisateur: %w", err)
	}
	return &user, nil
}

// UpdateProfile met à jour le profil utilisateur
func (s *Service) UpdateProfile(userID string, updates map[string]interface{}) (*models.User, error) {
	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("erreur récupération utilisateur: %w", err)
	}

	// Mettre à jour les champs autorisés
	allowedFields := map[string]bool{
		"first_name": true,
		"last_name":  true,
		"email":      true,
		"avatar_url": true,
		"region":     true,
	}

	filteredUpdates := make(map[string]interface{})
	for key, value := range updates {
		if allowedFields[key] {
			filteredUpdates[key] = value
		}
	}

	if len(filteredUpdates) > 0 {
		if err := s.db.Model(&user).Updates(filteredUpdates).Error; err != nil {
			return nil, fmt.Errorf("erreur mise à jour profil: %w", err)
		}
	}

	// Recharger l'utilisateur mis à jour
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("erreur rechargement utilisateur: %w", err)
	}

	return &user, nil
}

// =====================================================
// MÉTHODES PRIVÉES
// =====================================================

// hashPassword hache un mot de passe avec bcrypt
func (s *Service) hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// checkPassword vérifie un mot de passe contre son hash
func (s *Service) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// sendVerificationCode génère et envoie un code SMS
func (s *Service) sendVerificationCode(phone string) error {
	// Générer un code à 6 chiffres
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	// Sauvegarder en base avec expiration dans 10 minutes
	verification := models.SMSVerification{
		Phone:     phone,
		Code:      code,
		Verified:  false,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	
	if err := s.db.Create(&verification).Error; err != nil {
		return fmt.Errorf("erreur sauvegarde code SMS: %w", err)
	}
	
	// Envoyer le SMS
	message := fmt.Sprintf("🇸🇳 SenMarket: Votre code de vérification est %s. Valable 10 minutes.", code)
	if err := s.sms.SendSMS(phone, message); err != nil {
		return fmt.Errorf("erreur envoi SMS: %w", err)
	}
	
	return nil
}

// ResetPassword réinitialise le mot de passe (pour future implémentation)
func (s *Service) ResetPassword(phone, newPassword string) error {
	hashedPassword, err := s.hashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("erreur hachage mot de passe: %w", err)
	}

	if err := s.db.Model(&models.User{}).Where("phone = ?", phone).
		Update("password_hash", hashedPassword).Error; err != nil {
		return fmt.Errorf("erreur mise à jour mot de passe: %w", err)
	}

	return nil
}

// DeleteAccount supprime un compte utilisateur (soft delete)
func (s *Service) DeleteAccount(userID string) error {
	if err := s.db.Where("id = ?", userID).Delete(&models.User{}).Error; err != nil {
		return fmt.Errorf("erreur suppression compte: %w", err)
	}
	return nil
}