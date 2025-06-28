// internal/presentation/http/validators/payment_validator.go
package validators

// CreatePaymentRequest requête de création de paiement
type CreatePaymentRequest struct {
	Amount    float64                `json:"amount" validate:"required,min=100"` // Minimum 100 XOF
	Currency  string                 `json:"currency" validate:"omitempty,oneof=XOF EUR USD"`
	Method    string                 `json:"method" validate:"required,payment_method"`
	ListingID string                 `json:"listing_id,omitempty"`
	Phone     string                 `json:"phone" validate:"required,senegal_phone"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

// UpdatePaymentStatusRequest requête de mise à jour de statut de paiement
type UpdatePaymentStatusRequest struct {
	PaymentID       string `json:"payment_id" validate:"required"`
	Status          string `json:"status" validate:"required,oneof=pending success failed cancelled"`
	TransactionID   string `json:"transaction_id,omitempty"`
	ProviderRef     string `json:"provider_ref,omitempty"`
	SuccessMessage  string `json:"success_message,omitempty"`
	ErrorMessage    string `json:"error_message,omitempty"`
}

// PaymentCallbackRequest requête de callback de paiement
type PaymentCallbackRequest struct {
	TransactionID string                 `json:"transaction_id" validate:"required"`
	Status        string                 `json:"status" validate:"required"`
	Amount        float64                `json:"amount" validate:"min=0"`
	Currency      string                 `json:"currency"`
	Provider      string                 `json:"provider" validate:"required"`
	Signature     string                 `json:"signature" validate:"required"`
	Data          map[string]interface{} `json:"data,omitempty"`
}

// PaymentFiltersRequest requête de filtres de paiements
type PaymentFiltersRequest struct {
	UserID    string `json:"user_id,omitempty"`
	Status    string `json:"status,omitempty" validate:"omitempty,oneof=pending success failed cancelled refunded"`
	Method    string `json:"method,omitempty" validate:"omitempty,payment_method"`
	AmountMin *float64 `json:"amount_min,omitempty" validate:"omitempty,min=0"`
	AmountMax *float64 `json:"amount_max,omitempty" validate:"omitempty,min=0"`
	DateFrom  string `json:"date_from,omitempty" validate:"omitempty,datetime=2006-01-02"`
	DateTo    string `json:"date_to,omitempty" validate:"omitempty,datetime=2006-01-02"`
	Page      int    `json:"page" validate:"min=1"`
	Limit     int    `json:"limit" validate:"min=1,max=100"`
}

// ValidateCreatePayment valide une requête de création de paiement
func ValidateCreatePayment(req *CreatePaymentRequest) []ValidationError {
	errors := ValidateStruct(req)
	
	// Validation supplémentaire selon la méthode de paiement
	switch req.Method {
	case "orange_money", "wave", "free_money":
		// Pour les paiements mobile money, le téléphone est obligatoire
		if req.Phone == "" {
			errors = append(errors, ValidationError{
				Field:   "phone",
				Message: "Numéro de téléphone obligatoire pour " + req.Method,
			})
		}
	}
	
	return errors
}

// ValidateUpdatePaymentStatus valide une requête de mise à jour de statut
func ValidateUpdatePaymentStatus(req *UpdatePaymentStatusRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidatePaymentCallback valide une requête de callback de paiement
func ValidatePaymentCallback(req *PaymentCallbackRequest) []ValidationError {
	return ValidateStruct(req)
}

// ValidatePaymentFilters valide une requête de filtres de paiements
func ValidatePaymentFilters(req *PaymentFiltersRequest) []ValidationError {
	errors := ValidateStruct(req)
	
	// Validation personnalisée: amount_max >= amount_min
	if req.AmountMin != nil && req.AmountMax != nil && *req.AmountMax < *req.AmountMin {
		errors = append(errors, ValidationError{
			Field:   "amount_max",
			Message: "Le montant maximum doit être supérieur au montant minimum",
		})
	}
	
	return errors
}