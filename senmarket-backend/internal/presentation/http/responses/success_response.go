// internal/presentation/http/responses/success_response.go
package responses

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// SendSuccess envoie une réponse de succès
func SendSuccess(c *gin.Context, data interface{}, message string) {
	response := NewAPIResponse().WithSuccess(data, message)
	response.Send(c, http.StatusOK)
}

// SendCreated envoie une réponse de création réussie
func SendCreated(c *gin.Context, data interface{}, message string) {
	response := NewAPIResponse().WithSuccess(data, message)
	response.Send(c, http.StatusCreated)
}

// SendAccepted envoie une réponse acceptée
func SendAccepted(c *gin.Context, data interface{}, message string) {
	response := NewAPIResponse().WithSuccess(data, message)
	response.Send(c, http.StatusAccepted)
}

// SendNoContent envoie une réponse sans contenu
func SendNoContent(c *gin.Context) {
	c.JSON(http.StatusNoContent, nil)
}

// SendPaginated envoie une réponse paginée
func SendPaginated(c *gin.Context, data interface{}, total int64, page, perPage int, message string) {
	response := NewAPIResponse().
		WithSuccess(data, message).
		WithMeta(total, page, perPage)
	response.Send(c, http.StatusOK)
}

// SendList envoie une liste de données
func SendList(c *gin.Context, data interface{}, count int64, message string) {
	if message == "" {
		message = "Data retrieved successfully"
	}
	
	response := NewAPIResponse().WithSuccess(data, message)
	if count > 0 {
		response.Meta = &MetaInfo{
			Total: count,
		}
	}
	response.Send(c, http.StatusOK)
}


