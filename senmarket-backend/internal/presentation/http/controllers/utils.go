// internal/presentation/http/controllers/utils.go
package controllers

// stringPtr retourne un pointeur vers string si non vide
func stringPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// intPtr retourne un pointeur vers int
func intPtr(i int) *int {
	return &i
}

// float64Ptr retourne un pointeur vers float64
func float64Ptr(f float64) *float64 {
	return &f
}

// boolPtr retourne un pointeur vers bool
func boolPtr(b bool) *bool {
	return &b
}
