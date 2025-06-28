// internal/presentation/http/responses/api_response.go
package responses

import (
	"time"
	"github.com/gin-gonic/gin"
)

// APIResponse structure de réponse API standardisée
type APIResponse struct {
	Success   bool        `json:"success"`
	Message   string      `json:"message,omitempty"`
	Data      interface{} `json:"data,omitempty"`
	Error     *ErrorInfo  `json:"error,omitempty"`
	Meta      *MetaInfo   `json:"meta,omitempty"`
	Timestamp string      `json:"timestamp"`
}

// MetaInfo informations de métadonnées pour la pagination
type MetaInfo struct {
	Total      int64 `json:"total,omitempty"`
	Page       int   `json:"page,omitempty"`
	PerPage    int   `json:"per_page,omitempty"`
	TotalPages int   `json:"total_pages,omitempty"`
	HasMore    bool  `json:"has_more,omitempty"`
}

// ErrorInfo informations détaillées sur l'erreur
type ErrorInfo struct {
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

// NewAPIResponse crée une nouvelle réponse API
func NewAPIResponse() *APIResponse {
	return &APIResponse{
		Timestamp: time.Now().Format(time.RFC3339),
	}
}

// WithSuccess définit la réponse comme succès
func (r *APIResponse) WithSuccess(data interface{}, message string) *APIResponse {
	r.Success = true
	r.Data = data
	if message != "" {
		r.Message = message
	}
	return r
}

// WithError définit la réponse comme erreur
func (r *APIResponse) WithError(code, message string, details interface{}) *APIResponse {
	r.Success = false
	r.Error = &ErrorInfo{
		Code:    code,
		Message: message,
		Details: details,
	}
	return r
}

// WithMeta ajoute des métadonnées de pagination
func (r *APIResponse) WithMeta(total int64, page, perPage int) *APIResponse {
	totalPages := int((total + int64(perPage) - 1) / int64(perPage))
	hasMore := page < totalPages
	
	r.Meta = &MetaInfo{
		Total:      total,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
		HasMore:    hasMore,
	}
	return r
}

// Send envoie la réponse HTTP
func (r *APIResponse) Send(c *gin.Context, statusCode int) {
	c.JSON(statusCode, r)
}


