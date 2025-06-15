// internal/auth/service.go
package auth

import (
	"errors"
	"fmt"
	"math/rand"
	"strconv"
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
	Email     string `json:"email" validate:"email"`
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
	// Vérifier si l'utilisateur existe déjà
	var existingUser models.User
	if err := s.db.Where("phone = ? OR email = ?", req.Phone, req.Email).First(&existingUser).Error; err == nil {
		return nil, ErrUserExists
	}

	// Hasher le mot de passe
	hashedPassword, err := s.hashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("erreur hachage mot de passe: %w", err)
	}

	// Créer l'utilisateur
	user := models.User{
		Phone:        req.Phone,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Region:       req.Region,
		IsVerified:   false, // Nécessite vérification SMS
	}

	if err := s.db.Create(&user).Error; err != nil {
		return nil, fmt.Errorf("erreur création utilisateur: %w", err)
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
		return nil, fmt.Errorf("erreur recherche utilisateur: %w", err)
	}
	return &user, nil
}

// sendVerificationCode génère et envoie un code de vérification
func (s *Service) sendVerificationCode(phone string) error {
	// Générer un code à 6 chiffres
	code := s.generateVerificationCode()

	// Créer l'enregistrement de vérification
	verification := models.SMSVerification{
		Phone:     phone,
		Code:      code,
		Verified:  false,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}

	if err := s.db.Create(&verification).Error; err != nil {
		return fmt.Errorf("erreur sauvegarde code: %w", err)
	}

	// Envoyer le SMS
	message := fmt.Sprintf("🇸🇳 SenMarket: Votre code de vérification est %s. Valable 10 minutes.", code)
	if err := s.sms.SendSMS(phone, message); err != nil {
		return fmt.Errorf("erreur envoi SMS: %w", err)
	}

	return nil
}

// generateVerificationCode génère un code à 6 chiffres
func (s *Service) generateVerificationCode() string {
	rand.Seed(time.Now().UnixNano())
	code := rand.Intn(900000) + 100000 // Entre 100000 et 999999
	return strconv.Itoa(code)
}

// hashPassword hache un mot de passe
func (s *Service) hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// checkPassword vérifie un mot de passe
func (s *Service) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}