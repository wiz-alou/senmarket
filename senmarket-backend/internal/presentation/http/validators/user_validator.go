// internal/presentation/http/validators/user_validator.go
package validators

// CreateUserRequest requête de création d'utilisateur
type CreateUserRequest struct {
	Phone  string `json:"phone" validate:"required,senegal_phone"`
	Region string `json:"region" validate:"required,senegal_region"`
	Email  string `json:"email,omitempty" validate:"omitempty,email"`
}

// UpdateUserRequest requête de mise à jour d'utilisateur
type UpdateUserRequest struct {
	Email  string `json:"email,omitempty" validate:"omitempty,email"`
	Region string `json:"region,omitempty" validate:"omitempty,senegal_region"`
}

// VerifyUserRequest requête de vérification d'utilisateur
type VerifyUserRequest struct {
	UserID           string `json:"user_id" validate:"required"`
	VerificationCode string `json:"verification_code" validate:"required,len=6"`
	Method           string `json:"method" validate:"required,oneof=sms email"`
}

// LoginRequest requête de connexion
type LoginRequest struct {
	Phone string `json:"phone" validate:"required,senegal_phone"`
}

// ValidateCreateUser valide une requête de création d'utilisateur
func ValidateCreateUser(req *CreateUserRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidateUpdateUser valide une requête de mise à jour d'utilisateur
func ValidateUpdateUser(req *UpdateUserRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidateVerifyUser valide une requête de vérification d'utilisateur
func ValidateVerifyUser(req *VerifyUserRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidateLogin valide une requête de connexion
func ValidateLogin(req *LoginRequest) []ValidationError {
	return ValidateStruct(req)
}
