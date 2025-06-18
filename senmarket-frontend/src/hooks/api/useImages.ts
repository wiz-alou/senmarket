import { useMutation } from '@tanstack/react-query';
import { imagesService } from '@/lib/api';
import { useNotifications } from '@/stores';

export const useImageUpload = () => {
  const { showSuccess, showError } = useNotifications();

  // Upload d'une seule image
  const uploadSingleMutation = useMutation({
    mutationFn: (file: File) => imagesService.uploadImage(file),
    onSuccess: () => {
      showSuccess('Image uploadée', 'Votre image a été ajoutée avec succès');
    },
    onError: (error: Error) => {
      showError('Erreur d\'upload', error.message);
    },
  });

  // Upload de plusieurs images
  const uploadMultipleMutation = useMutation({
    mutationFn: (files: File[]) => imagesService.uploadMultipleImages(files),
    onSuccess: (images) => {
      showSuccess(
        'Images uploadées', 
        `${images.length} image(s) ajoutée(s) avec succès`
      );
    },
    onError: (error: Error) => {
      showError('Erreur d\'upload', error.message);
    },
  });

  // Suppression d'image
  const deleteMutation = useMutation({
    mutationFn: (imagePath: string) => imagesService.deleteImage(imagePath),
    onSuccess: () => {
      showSuccess('Image supprimée', 'L\'image a été supprimée');
    },
    onError: (error: Error) => {
      showError('Erreur de suppression', error.message);
    },
  });

  return {
    // Mutations
    uploadSingle: uploadSingleMutation.mutate,
    uploadMultiple: uploadMultipleMutation.mutate,
    deleteImage: deleteMutation.mutate,

    // États
    isUploadingSingle: uploadSingleMutation.isPending,
    isUploadingMultiple: uploadMultipleMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Données
    uploadedImage: uploadSingleMutation.data,
    uploadedImages: uploadMultipleMutation.data,
  };
};
