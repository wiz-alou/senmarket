// internal/handlers/image_handler.go
package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

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
// @Description Upload une image pour une annonce vers MinIO
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

	// Uploader l'image vers MinIO
	uploadedImage, err := h.imageService.UploadImage(file)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur upload image vers MinIO",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image uploadée avec succès vers MinIO",
		"data": uploadedImage,
		"storage": gin.H{
			"provider": "minio",
			"url":      uploadedImage.URL,
			"key":      uploadedImage.Key, // ⭐ NOUVEAU: Clé MinIO
		},
	})
}

// UploadMultipleImages godoc
// @Summary Upload plusieurs images
// @Description Upload jusqu'à 5 images pour une annonce vers MinIO
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

	// Uploader toutes les images vers MinIO
	uploadedImages, err := h.imageService.UploadMultipleImages(files)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur upload images vers MinIO",
			"details": err.Error(),
		})
		return
	}

	// Construire la réponse avec les clés MinIO
	var imageKeys []string
	var imageURLs []string
	for _, img := range uploadedImages {
		imageKeys = append(imageKeys, img.Key)
		imageURLs = append(imageURLs, img.URL)
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("%d images uploadées avec succès vers MinIO", len(uploadedImages)),
		"data": uploadedImages,
		"storage": gin.H{
			"provider": "minio",
			"count":    len(uploadedImages),
			"keys":     imageKeys,  // ⭐ NOUVEAU: Clés MinIO
			"urls":     imageURLs,
		},
	})
}

// DeleteImage godoc
// @Summary Supprimer une image
// @Description Supprime une image de MinIO
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param key query string true "Clé MinIO de l'image"
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

	// ⭐ MODIFIÉ: Utiliser 'key' au lieu de 'path' pour MinIO
	imageKey := c.Query("key")
	if imageKey == "" {
		// Fallback pour compatibilité
		imageKey = c.Query("path")
		if imageKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Clé MinIO de l'image requise (paramètre 'key')",
			})
			return
		}
	}

	// Supprimer l'image de MinIO
	if err := h.imageService.DeleteImage(imageKey); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur suppression image de MinIO",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image supprimée avec succès de MinIO",
		"deleted_key": imageKey,
	})
}

// GetImageInfo godoc
// @Summary Informations d'une image
// @Description Récupère les informations d'une image depuis MinIO
// @Tags images
// @Produce json
// @Param key query string true "Clé MinIO de l'image"
// @Success 200 {object} services.UploadedImage
// @Failure 404 {object} map[string]interface{}
// @Router /images/info [get]
func (h *ImageHandler) GetImageInfo(c *gin.Context) {
	// ⭐ MODIFIÉ: Utiliser 'key' au lieu de 'path' pour MinIO
	imageKey := c.Query("key")
	if imageKey == "" {
		// Fallback pour compatibilité
		imageKey = c.Query("path")
		if imageKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Clé MinIO de l'image requise (paramètre 'key')",
			})
			return
		}
	}

	imageInfo, err := h.imageService.GetImageInfo(imageKey)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Image non trouvée dans MinIO",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": imageInfo,
		"storage": gin.H{
			"provider": "minio",
			"key":      imageKey,
		},
	})
}

// CreateThumbnail godoc
// @Summary Créer une miniature
// @Description Crée une miniature d'une image existante dans MinIO
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param key query string true "Clé MinIO de l'image"
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

	// ⭐ MODIFIÉ: Utiliser 'key' au lieu de 'path' pour MinIO
	imageKey := c.Query("key")
	if imageKey == "" {
		// Fallback pour compatibilité
		imageKey = c.Query("path")
		if imageKey == "" {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Clé MinIO de l'image requise (paramètre 'key')",
			})
			return
		}
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

	// Créer la miniature dans MinIO
	thumbnailKey, err := h.imageService.CreateThumbnail(imageKey, uint(width), uint(height))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur création miniature dans MinIO",
			"details": err.Error(),
		})
		return
	}

	// Construire l'URL de la miniature
	thumbnailURL := h.imageService.GetImageURL(thumbnailKey)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Miniature créée avec succès dans MinIO",
		"thumbnail": gin.H{
			"key":    thumbnailKey,
			"url":    thumbnailURL,
			"width":  width,
			"height": height,
		},
		"original_key": imageKey,
	})
}

// ⭐ NOUVEAU: GetSignedURL - Génère une URL signée temporaire
// GetSignedURL godoc
// @Summary URL signée temporaire
// @Description Génère une URL signée temporaire pour téléchargement privé
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param key query string true "Clé MinIO de l'image"
// @Param expiry query int false "Durée en heures" default(24)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/signed-url [get]
func (h *ImageHandler) GetSignedURL(c *gin.Context) {
	// Vérifier l'authentification
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	imageKey := c.Query("key")
	if imageKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Clé MinIO de l'image requise",
		})
		return
	}

	// Durée d'expiration (défaut: 24h)
	expiryHours := 24
	if e := c.Query("expiry"); e != "" {
		if parsed, err := strconv.Atoi(e); err == nil && parsed > 0 && parsed <= 168 { // Max 7 jours
			expiryHours = parsed
		}
	}

	expiry := time.Duration(expiryHours) * time.Hour

	// Générer URL signée
	signedURL, err := h.imageService.GetSignedImageURL(c.Request.Context(), imageKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur génération URL signée",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"signed_url": signedURL,
		"key": imageKey,
		"expires_in_hours": expiryHours,
		"expires_at": time.Now().Add(expiry).Format(time.RFC3339),
	})
}

// ⭐ NOUVEAU: ListImages - Liste les images d'un utilisateur
// ListImages godoc
// @Summary Lister les images
// @Description Liste les images uploadées par l'utilisateur
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param prefix query string false "Préfixe de recherche"
// @Param limit query int false "Limite (défaut: 50)" default(50)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/list [get]
func (h *ImageHandler) ListImages(c *gin.Context) {
	// Vérifier l'authentification
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	// Paramètres de recherche
	prefix := c.Query("prefix")
	if prefix == "" {
		// Par défaut, lister les images de l'utilisateur
		prefix = fmt.Sprintf("images/user_%v", userID)
	}

	limit := 50
	if l := c.Query("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 200 {
			limit = parsed
		}
	}

	// Lister les images
	imageKeys, err := h.imageService.ListImages(prefix, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur listage images",
			"details": err.Error(),
		})
		return
	}

	// Construire les URLs pour chaque image
	var images []gin.H
	for _, key := range imageKeys {
		url := h.imageService.GetImageURL(key)
		images = append(images, gin.H{
			"key": key,
			"url": url,
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"images": images,
		"count": len(images),
		"prefix": prefix,
		"limit": limit,
		"storage": gin.H{
			"provider": "minio",
		},
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
		"message": "Image valide pour upload MinIO",
		"file_info": gin.H{
			"name": file.Filename,
			"size": file.Size,
			"size_mb": fmt.Sprintf("%.2f", float64(file.Size)/(1024*1024)),
		},
		"storage": gin.H{
			"provider": "minio",
			"destination": "cloud_storage",
		},
	})
}

// ⭐ NOUVEAU: DeleteByPrefix - Supprime toutes les images avec un préfixe
// DeleteByPrefix godoc
// @Summary Supprimer images par préfixe
// @Description Supprime toutes les images avec un préfixe donné (ex: toutes les images d'une annonce)
// @Tags images
// @Produce json
// @Security BearerAuth
// @Param prefix query string true "Préfixe des images à supprimer"
// @Param confirm query bool true "Confirmation (doit être 'true')"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 401 {object} map[string]interface{}
// @Router /images/delete-prefix [delete]
func (h *ImageHandler) DeleteByPrefix(c *gin.Context) {
	// Vérifier l'authentification
	_, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Utilisateur non authentifié",
		})
		return
	}

	prefix := c.Query("prefix")
	if prefix == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Préfixe requis",
		})
		return
	}

	// Confirmation obligatoire pour éviter les suppressions accidentelles
	confirm := c.Query("confirm")
	if confirm != "true" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Confirmation requise (confirm=true)",
		})
		return
	}

	// Supprimer toutes les images avec ce préfixe
	if err := h.imageService.DeleteImagesByPrefix(prefix); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Erreur suppression images par préfixe",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Images avec préfixe '%s' supprimées avec succès", prefix),
		"prefix": prefix,
	})
}