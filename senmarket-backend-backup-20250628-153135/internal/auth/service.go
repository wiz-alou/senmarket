// internal/auth/service.go - VERSION CORRIGÉE
package auth

import (
	"errors"
	"fmt"
	"math/rand"
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
	db  *gorm.DB
	jwt *JWTService
	sms SMSService
}

type SMSService interface {
	SendSMS(phone, message string) error
}

type RegisterRequest struct {
	Phone     string `json:"phone" validate:"required,e164"`
	Email     string `json:"email" validate:"omitempty,email"`
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
	// Vérifier existence par téléphone
	var existingUser models.User
	if err := s.db.Where("phone = ?", req.Phone).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("un compte existe déjà avec ce numéro de téléphone")
	}

	// Vérifier email si fourni
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

	// Créer l'utilisateur
	user := models.User{
		Phone:        req.Phone,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Region:       req.Region,
		IsVerified:   false,
	}

	if req.Email == "" {
		if err := s.db.Omit("email").Create(&user).Error; err != nil {
			return nil, fmt.Errorf("erreur création utilisateur: %w", err)
		}
	} else {
		if err := s.db.Create(&user).Error; err != nil {
			return nil, fmt.Errorf("erreur création utilisateur: %w", err)
		}
	}

	// Envoyer le premier code de vérification
	if err := s.sendNewVerificationCode(user.Phone); err != nil {
		fmt.Printf("Erreur envoi SMS: %v\n", err)
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

// Login authentifie un utilisateur
func (s *Service) Login(req *LoginRequest) (*AuthResponse, error) {
	var user models.User
	if err := s.db.Where("phone = ?", req.Phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrInvalidCredentials
		}
		return nil, fmt.Errorf("erreur recherche utilisateur: %w", err)
	}

	if !s.checkPassword(req.Password, user.PasswordHash) {
		return nil, ErrInvalidCredentials
	}

	token, err := s.jwt.GenerateToken(user.ID.String())
	if err != nil {
		return nil, fmt.Errorf("erreur génération token: %w", err)
	}

	return &AuthResponse{
		User:  &user,
		Token: token,
	}, nil
}

// ✅ CORRECTION : SendVerificationCode avec logique de renvoi intelligent
func (s *Service) SendVerificationCode(phone string) error {
	// Chercher un code récent (moins de 3 minutes) qui n'est pas encore vérifié
	var recentVerification models.SMSVerification
	if err := s.db.Where("phone = ? AND verified = ? AND created_at > ?", 
		phone, false, time.Now().Add(-3*time.Minute)).
		Order("created_at DESC").First(&recentVerification).Error; err == nil {
		
		// Si le code n'a pas expiré, renvoyer le même code
		if time.Now().Before(recentVerification.ExpiresAt) {
			message := fmt.Sprintf("🇸🇳 SenMarket: Votre code est %s. Valable 10 min. Ne le partagez pas.", recentVerification.Code)
			
			if err := s.sms.SendSMS(phone, message); err != nil {
				fmt.Printf("📱 Erreur renvoi SMS: %v\n", err)
				return fmt.Errorf("erreur renvoi SMS")
			}
			
			fmt.Printf("📱 Code existant renvoyé: %s vers %s (créé il y a %v)\n", 
				recentVerification.Code, phone, time.Since(recentVerification.CreatedAt).Round(time.Second))
			return nil
		}
	}
	
	// Sinon, générer un nouveau code
	return s.sendNewVerificationCode(phone)
}

// VerifyPhone vérifie le code et active le compte
func (s *Service) VerifyPhone(req *VerifyRequest) error {
	var verification models.SMSVerification
	if err := s.db.Where("phone = ? AND code = ? AND verified = ?", 
		req.Phone, req.Code, false).First(&verification).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrInvalidCode
		}
		return fmt.Errorf("erreur recherche code: %w", err)
	}

	if time.Now().After(verification.ExpiresAt) {
		return ErrCodeExpired
	}

	verification.Verified = true
	if err := s.db.Save(&verification).Error; err != nil {
		return fmt.Errorf("erreur mise à jour vérification: %w", err)
	}

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

	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("erreur rechargement utilisateur: %w", err)
	}

	return &user, nil
}

// =====================================================
// MÉTHODES PRIVÉES
// =====================================================

func (s *Service) hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func (s *Service) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// ✅ NOUVELLE MÉTHODE : sendNewVerificationCode génère toujours un nouveau code
func (s *Service) sendNewVerificationCode(phone string) error {
	// Générer un code à 6 chiffres
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	
	// Sauvegarder en base
	verification := models.SMSVerification{
		Phone:     phone,
		Code:      code,
		Verified:  false,
		ExpiresAt: time.Now().Add(10 * time.Minute),
	}
	
	if err := s.db.Create(&verification).Error; err != nil {
		return fmt.Errorf("erreur sauvegarde code: %w", err)
	}
	
	// Message SMS
	message := fmt.Sprintf("🇸🇳 SenMarket: Votre code est %s. Valable 10 min. Ne le partagez pas.", code)
	
	// Envoyer via Twilio
	if err := s.sms.SendSMS(phone, message); err != nil {
		fmt.Printf("📱 Erreur SMS: %v\n", err)
		// Ne pas bloquer l'inscription même si SMS échoue
		return nil
	}
	
	fmt.Printf("📱 Nouveau code généré: %s vers %s\n", code, phone)
	return nil
}

// ✅ MÉTHODE HÉRITÉE : pour compatibilité (appelée par Register)
func (s *Service) sendVerificationCode(phone string) error {
	return s.sendNewVerificationCode(phone)
}