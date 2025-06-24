import { toast } from "sonner"
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  X 
} from "lucide-react"

export const useToast = () => {
  const showSuccess = (title: string, description?: string, duration = 4000) => {
    toast.success(title, {
      description,
      duration,
      icon: CheckCircle,
      className: "bg-green-50 border-green-200 text-green-800",
    })
  }

  const showError = (title: string, description?: string, duration = 6000) => {
    toast.error(title, {
      description,
      duration,
      icon: AlertCircle,
      className: "bg-red-50 border-red-200 text-red-800",
    })
  }

  const showWarning = (title: string, description?: string, duration = 5000) => {
    toast.warning(title, {
      description,
      duration,
      icon: AlertTriangle,
      className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    })
  }

  const showInfo = (title: string, description?: string, duration = 4000) => {
    toast.info(title, {
      description,
      duration,
      icon: Info,
      className: "bg-blue-50 border-blue-200 text-blue-800",
    })
  }

  const showLoading = (title: string, description?: string) => {
    return toast.loading(title, {
      description,
      className: "bg-slate-50 border-slate-200 text-slate-800",
    })
  }

  const showPromise = <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    })
  }

  const dismiss = (toastId?: string | number) => {
    toast.dismiss(toastId)
  }

  const dismissAll = () => {
    toast.dismiss()
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    showPromise,
    dismiss,
    dismissAll,
  }
}