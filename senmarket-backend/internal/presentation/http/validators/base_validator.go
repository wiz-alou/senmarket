// internal/presentation/http/validators/base_validator.go
package validators

import (
	"regexp"
	"strings"
	"github.com/go-playground/validator/v10"
)

// Validator instance globale
var validate *validator.Validate

// ValidationError erreur de validation
type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
	Value   interface{} `json:"value,omitempty"`
}

func init() {
	validate = validator.New()
	
	// Enregistrer les validateurs personnalisés
	validate.RegisterValidation("senegal_phone", validateSenegalPhone)
	validate.RegisterValidation("senegal_region", validateSenegalRegion)
	validate.RegisterValidation("payment_method", validatePaymentMethod)
}

// ValidateStruct valide une structure
func ValidateStruct(s interface{}) []ValidationError {
	var errors []ValidationError
	
	err := validate.Struct(s)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			errors = append(errors, ValidationError{
				Field:   err.Field(),
				Message: getErrorMessage(err),
				Value:   err.Value(),
			})
		}
	}
	
	return errors
}

// getErrorMessage retourne un message d'erreur lisible
func getErrorMessage(fe validator.FieldError) string {
	switch fe.Tag() {
	case "required":
		return "Ce champ est obligatoire"
	case "email":
		return "Format d'email invalide"
	case "min":
		return "Valeur trop courte (minimum " + fe.Param() + ")"
	case "max":
		return "Valeur trop longue (maximum " + fe.Param() + ")"
	case "senegal_phone":
		return "Format de téléphone sénégalais invalide"
	case "senegal_region":
		return "Région sénégalaise invalide"
	case "payment_method":
		return "Méthode de paiement non supportée"
	default:
		return "Valeur invalide"
	}
}

// validateSenegalPhone valide un numéro de téléphone sénégalais
func validateSenegalPhone(fl validator.FieldLevel) bool {
	phone := fl.Field().String()
	
	// Patterns pour les numéros sénégalais
	patterns := []string{
		`^\+221[0-9]{9}$`,      // +221XXXXXXXXX
		`^221[0-9]{9}$`,        // 221XXXXXXXXX  
		`^0[0-9]{8}$`,          // 0XXXXXXXX
		`^[7][0-9]{8}$`,        // 7XXXXXXXX (mobile)
		`^[3][0-9]{8}$`,        // 3XXXXXXXX (fixe)
	}
	
	for _, pattern := range patterns {
		matched, _ := regexp.MatchString(pattern, phone)
		if matched {
			return true
		}
	}
	
	return false
}

// validateSenegalRegion valide une région sénégalaise
func validateSenegalRegion(fl validator.FieldLevel) bool {
	region := strings.ToUpper(fl.Field().String())
	
	validRegions := map[string]bool{
		"DK": true, // Dakar
		"TH": true, // Thiès
		"SL": true, // Saint-Louis
		"DI": true, // Diourbel
		"LG": true, // Louga
		"FA": true, // Fatick
		"KA": true, // Kaolack
		"KF": true, // Kaffrine
		"KO": true, // Kolda
		"ZI": true, // Ziguinchor
		"SE": true, // Sédhiou
		"TA": true, // Tambacounda
		"KE": true, // Kédougou
		"MA": true, // Matam
	}
	
	return validRegions[region]
}

// validatePaymentMethod valide une méthode de paiement
func validatePaymentMethod(fl validator.FieldLevel) bool {
	method := fl.Field().String()
	
	validMethods := map[string]bool{
		"orange_money": true,
		"wave":         true,
		"free_money":   true,
		"bank_card":    true,
	}
	
	return validMethods[method]
}
