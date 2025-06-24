export { useAuthStore } from './auth.store';
export { useFavoritesStore } from './favorites.store';
export { useAppStore } from './app.store';
export { useListingsStore } from './listings.store';


// Hook personnalisé pour les notifications
export const useNotifications = () => {
  const { addNotification, removeNotification, clearNotifications, notifications } = useAppStore();
  
  const showSuccess = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'success', title, message, duration });
  };
  
  const showError = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'error', title, message, duration });
  };
  
  const showWarning = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'warning', title, message, duration });
  };
  
  const showInfo = (title: string, message: string, duration?: number) => {
    addNotification({ type: 'info', title, message, duration });
  };
  
  return {
    notifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeNotification,
    clearNotifications,
  };
};