import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { useNotifications } from '@/stores';
import { LoginRequest, RegisterRequest } from '@/lib/api/types';

export const useAuth = () => {
  const { user, isAuthenticated, login, register, logout, setUser } = useAuthStore();
  const { showSuccess, showError } = useNotifications();
  const queryClient = useQueryClient();

  // Hook pour la connexion
  const loginMutation = useMutation({
    mutationFn: ({ phone, password }: LoginRequest) => login(phone, password),
    onSuccess: () => {
      showSuccess('Connexion réussie', 'Vous êtes maintenant connecté');
      // Invalider et refetch les queries qui nécessitent une auth
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    },
    onError: (error: Error) => {
      showError('Erreur de connexion', error.message);
    },
  });

  // Hook pour l'inscription
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => register(data),
    onSuccess: () => {
      showSuccess('Inscription réussie', 'Votre compte a été créé avec succès');
    },
    onError: (error: Error) => {
      showError('Erreur d\'inscription', error.message);
    },
  });

  // Hook pour la vérification SMS
  const verifyPhoneMutation = useMutation({
    mutationFn: ({ phone, code }: { phone: string; code: string }) =>
      authService.verifyPhone(phone, code),
    onSuccess: (data) => {
      setUser(data.user);
      showSuccess('Téléphone vérifié', 'Votre compte est maintenant vérifié');
    },
    onError: (error: Error) => {
      showError('Erreur de vérification', error.message);
    },
  });

  // Hook pour renvoyer le code SMS
  const sendCodeMutation = useMutation({
    mutationFn: (phone: string) => authService.sendVerificationCode(phone),
    onSuccess: () => {
      showSuccess('Code envoyé', 'Un nouveau code a été envoyé par SMS');
    },
    onError: (error: Error) => {
      showError('Erreur d\'envoi', error.message);
    },
  });

  // Hook pour récupérer le profil
  const { data: profile, isLoading: isLoadingProfile, refetch: refetchProfile } = useQuery({
    queryKey: ['profile'],
    queryFn: authService.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Hook pour mettre à jour le profil
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      queryClient.setQueryData(['profile'], updatedUser);
      showSuccess('Profil mis à jour', 'Vos informations ont été sauvegardées');
    },
    onError: (error: Error) => {
      showError('Erreur de mise à jour', error.message);
    },
  });

  // Fonction de déconnexion
  const handleLogout = () => {
    logout();
    queryClient.clear(); // Nettoyer toutes les queries
    showSuccess('Déconnexion', 'Vous avez été déconnecté');
  };

  return {
    // État
    user,
    isAuthenticated,
    profile,
    isLoadingProfile,

    // Mutations
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    verifyPhone: verifyPhoneMutation.mutate,
    sendCode: sendCodeMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    logout: handleLogout,

    // États de chargement
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isVerifying: verifyPhoneMutation.isPending,
    isSendingCode: sendCodeMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,

    // Fonctions utilitaires
    refetchProfile,
  };
};