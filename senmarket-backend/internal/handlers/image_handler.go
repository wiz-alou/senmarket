// internal/handlers/image_handler.go
package handlers

import (

    "fmt"     
	"net/http"
	"strconv" 

	"senmarket/internal/services"

	"github.com/gin-gonic/gin"
)

type ImageHandler struct {
	imageService *services.ImageService
}

func NewImageHandler(imageService *services.ImageService) *ImageHandler {
	return &ImageHandler{
		imageService: imageService,
	}
}

// UploadImage godoc
// @Summary Upload une image
// @Description Upload une image pour une annonce
// @Tags images
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param image formData file true "Fichier image"
// @Success 200 {object} services.UploadedImage
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/upload [post]
func (h *ImageHandler) UploadImage(c *gin.Context) {
	// Vérifier l'authentification
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	// Récupérer le fichier
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Aucun fichier fourni",
			"details": err.Error(),
		})
		return
	}

	// Valider le fichier
	if err := h.imageService.ValidateImageFile(file); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Fichier invalide",
			"details": err.Error(),
		})
		return
	}

	// Uploader l'image
	uploadedImage, err := h.imageService.UploadImage(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur upload image",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image uploadée avec succès",
		"data": uploadedImage,
	})
}

// UploadMultipleImages godoc
// @Summary Upload plusieurs images
// @Description Upload jusqu'à 5 images pour une annonce
// @Tags images
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param images formData file true "Fichiers images (max 5)"
// @Success 200 {array} services.UploadedImage
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/upload-multiple [post]
func (h *ImageHandler) UploadMultipleImages(c *gin.Context) {
	// Vérifier l'authentification
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	// Récupérer le formulaire
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Erreur lecture formulaire",
			"details": err.Error(),
		})
		return
	}

	// Récupérer les fichiers
	files := form.File["images"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Aucun fichier fourni",
		})
		return
	}

	if len(files) > 5 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Maximum 5 images autorisées",
		})
		return
	}

	// Valider tous les fichiers avant upload
	for i, file := range files {
		if err := h.imageService.ValidateImageFile(file); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("Fichier %d invalide: %s", i+1, file.Filename),
				"details": err.Error(),
			})
			return
		}
	}

	// Uploader toutes les images
	uploadedImages, err := h.imageService.UploadMultipleImages(files)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur upload images",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("%d images uploadées avec succès", len(uploadedImages)),
		"data": uploadedImages,
	})
}

// DeleteImage godoc
// @Summary Supprimer une image
// @Description Supprime une image uploadée
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param path query string true "Chemin de l'image"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/delete [delete]
func (h *ImageHandler) DeleteImage(c *gin.Context) {
	// Vérifier l'authentification
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	imagePath := c.Query("path")
	if imagePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Chemin de l'image requis",
		})
		return
	}

	// Supprimer l'image
	if err := h.imageService.DeleteImage(imagePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur suppression image",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Image supprimée avec succès",
	})
}

// GetImageInfo godoc
// @Summary Informations d'une image
// @Description Récupère les informations d'une image
// @Tags images
// @Produce json
// @Param path query string true "Chemin de l'image"
// @Success 200 {object} services.UploadedImage
// @Failure 404 {object} map[string]interface{}
// @Router /images/info [get]
func (h *ImageHandler) GetImageInfo(c *gin.Context) {
	imagePath := c.Query("path")
	if imagePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Chemin de l'image requis",
		})
		return
	}

	imageInfo, err := h.imageService.GetImageInfo(imagePath)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Image non trouvée",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": imageInfo,
	})
}

// CreateThumbnail godoc
// @Summary Créer une miniature
// @Description Crée une miniature d'une image existante
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param path query string true "Chemin de l'image"
// @Param width query int false "Largeur" default(300)
// @Param height query int false "Hauteur" default(200)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/thumbnail [post]
func (h *ImageHandler) CreateThumbnail(c *gin.Context) {
	// Vérifier l'authentification
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	imagePath := c.Query("path")
	if imagePath == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Chemin de l'image requis",
		})
		return
	}

	// Paramètres de la miniature
	width := 300
	height := 200
	
	if w := c.Query("width"); w != "" {
		if parsed, err := strconv.Atoi(w); err == nil && parsed > 0 && parsed <= 1200 {
			width = parsed
		}
	}
	
	if h := c.Query("height"); h != "" {
		if parsed, err := strconv.Atoi(h); err == nil && parsed > 0 && parsed <= 800 {
			height = parsed
		}
	}

	// Créer la miniature
	thumbnailPath, err := h.imageService.CreateThumbnail(imagePath, uint(width), uint(height))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur création miniature",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Miniature créée avec succès",
		"thumbnail_path": thumbnailPath,
	})
}

// ValidateImage godoc
// @Summary Valider une image
// @Description Valide un fichier image sans l'uploader
// @Tags images
// @Accept multipart/form-data
// @Produce json
// @Param image formData file true "Fichier image à valider"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Router /images/validate [post]
func (h *ImageHandler) ValidateImage(c *gin.Context) {
	// Récupérer le fichier
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Aucun fichier fourni",
			"details": err.Error(),
		})
		return
	}

	// Valider le fichier
	if err := h.imageService.ValidateImageFile(file); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"valid": false,
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"valid": true,
		"message": "Image valide",
		"file_info": gin.H{
			"name": file.Filename,
			"size": file.Size,
		},
	})
}