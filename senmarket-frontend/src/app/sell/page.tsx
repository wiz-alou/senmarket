'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Upload,
    ImageIcon,
    X,
    Eye,
    MapPin,
    CreditCard,
    Check,
    AlertCircle,
    Loader2,
    ArrowLeft,
    ArrowRight,
    Camera, handleImageUpload ,
    FileText
} from 'lucide-react'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuthStore } from '@/stores/authStore'

const SENEGAL_REGIONS = [
    'Dakar', 'Thiès', 'Saint-Louis', 'Diourbel', 'Louga', 'Fatick',
    'Kaolack', 'Kolda', 'Ziguinchor', 'Tambacounda', 'Kaffrine',
    'Kédougou', 'Matam', 'Sédhiou', 'Saraya', 'Koungheul'
]

const MOCK_CATEGORIES = [
    { id: '1', name: 'Véhicules', icon: 'fa-car' },
    { id: '2', name: 'Immobilier', icon: 'fa-home' },
    { id: '3', name: 'Électronique', icon: 'fa-laptop' },
    { id: '4', name: 'Mode & Beauté', icon: 'fa-tshirt' },
    { id: '5', name: 'Emploi', icon: 'fa-briefcase' },
    { id: '6', name: 'Services', icon: 'fa-tools' },
    { id: '7', name: 'Maison & Jardin', icon: 'fa-couch' },
    { id: '8', name: 'Animaux', icon: 'fa-paw' }
]

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-SN', {
        style: 'currency',
        currency: 'XOF',
        minimumFractionDigits: 0,
    }).format(price)
}

const listingSchema = z.object({
    title: z.string()
        .min(10, 'Le titre doit contenir au moins 10 caractères')
        .max(200, 'Le titre ne peut pas dépasser 200 caractères'),
    description: z.string()
        .min(50, 'La description doit contenir au moins 50 caractères')
        .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
    price: z.number()
        .min(100, 'Le prix minimum est de 100 FCFA')
        .max(100000000, 'Le prix maximum est de 100 000 000 FCFA'),
    category_id: z.string().min(1, 'Veuillez sélectionner une catégorie'),
    region: z.string().min(1, 'Veuillez sélectionner une région'),
})

type ListingFormData = z.infer<typeof listingSchema>

const steps = [
    { id: 1, title: 'Informations', icon: FileText },
    { id: 2, title: 'Photos', icon: Camera },
    { id: 3, title: 'Aperçu', icon: Eye },
    { id: 4, title: 'Paiement', icon: CreditCard }
]

export default function SellPage() {
    const router = useRouter()
    const { user, isAuthenticated } = useAuthStore()

    // États
    const [isClient, setIsClient] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)
    const [uploadedImages, setUploadedImages] = useState<string[]>([])
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Form
    const form = useForm<ListingFormData>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            category_id: '',
            region: user?.region || '',
        }
    })

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form
    const watchedValues = watch()

    // Fonctions utilitaires
    const showError = useCallback((title: string, message: string) => {
        setError(`${title}: ${message}`)
        console.error('❌', title, message)
        setTimeout(() => setError(null), 6000)
    }, [])

    const showSuccess = useCallback((title: string, message: string) => {
        setSuccess(`${title}: ${message}`)
        console.log('✅', title, message)
        setTimeout(() => setSuccess(null), 4000)
    }, [])

    // Upload d'images

    const handleImageUpload = useCallback(async (files: File[]) => {
        console.log('🔥 Upload démarré avec', files.length, 'fichiers')

        if (uploadedImages.length + files.length > 5) {
            showError('Limite dépassée', 'Maximum 5 images')
            return
        }

        if (files.length === 0) return

        setIsUploading(true)

        try {
            const token = localStorage.getItem('senmarket_token')
            if (!token) {
                showError('Erreur auth', 'Reconnectez-vous')
                return
            }

            // Validation fichiers
            const validFiles = files.filter(file => {
                const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
                const isValidSize = file.size <= 5 * 1024 * 1024

                if (!isValidType) {
                    showError('Format invalide', `${file.name} - Formats: JPG, PNG, WebP`)
                    return false
                }
                if (!isValidSize) {
                    showError('Fichier trop lourd', `${file.name} - Max: 5MB`)
                    return false
                }
                return true
            })

            if (validFiles.length === 0) return

            // FormData
            const formData = new FormData()
            validFiles.forEach(file => {
                formData.append('images', file)
            })

            console.log('📡 Envoi API...')

            // Appel API
            const response = await fetch('http://localhost:8080/api/v1/images/upload-multiple', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            })

            const data = await response.json()
            console.log('📡 Réponse complète:', response.status, data)

            if (!response.ok) {
                let errorMessage = 'Erreur upload'
                if (response.status === 401) errorMessage = 'Session expirée'
                else if (response.status === 413) errorMessage = 'Fichiers trop lourds'
                else if (data.error) errorMessage = data.error
                throw new Error(errorMessage)
            }

            // ✅ CORRECTION: Extraire correctement les URLs
            const uploadedImageObjects = data.data || []
            console.log('📋 Objets images reçus:', uploadedImageObjects)

            if (!Array.isArray(uploadedImageObjects) || uploadedImageObjects.length === 0) {
                throw new Error('Aucune image reçue du serveur')
            }

            // ✅ Extraction des URLs avec gestion de différents formats
            const uploadedUrls = uploadedImageObjects.map(img => {
                console.log('🔍 Analyse objet image:', img)

                // Si l'URL complète est fournie
                if (img.URL && img.URL.startsWith('http')) {
                    console.log('📎 URL complète trouvée:', img.URL)
                    return img.URL
                }

                // Si c'est juste le chemin, construire l'URL
                if (img.Path) {
                    const fullUrl = `http://localhost:8080/uploads/${img.Path}`
                    console.log('📎 Path converti:', img.Path, '→', fullUrl)
                    return fullUrl
                }

                // Autres formats possibles
                if (img.url) {
                    console.log('📎 url (lowercase) trouvée:', img.url)
                    return img.url.startsWith('http') ? img.url : `http://localhost:8080${img.url}`
                }

                // Fallback avec l'URL relative
                if (img.URL) {
                    const fullUrl = img.URL.startsWith('/')
                        ? `http://localhost:8080${img.URL}`
                        : `http://localhost:8080/uploads/${img.URL}`
                    console.log('📎 URL relative convertie:', img.URL, '→', fullUrl)
                    return fullUrl
                }

                console.error('❌ Impossible d\'extraire l\'URL de:', img)
                return null
            }).filter(url => url !== null)

            console.log('✅ URLs finales extraites:', uploadedUrls)

            if (uploadedUrls.length === 0) {
                throw new Error('Impossible d\'extraire les URLs des images')
            }

            setUploadedImages(prev => {
                const newImages = [...prev, ...uploadedUrls]
                console.log('💾 State mis à jour, total images:', newImages.length)
                return newImages
            })

            showSuccess('Images uploadées', `${uploadedUrls.length} image(s) ajoutée(s)`)

        } catch (error) {
            console.error('❌ Erreur:', error)
            showError('Erreur upload', error instanceof Error ? error.message : 'Échec upload')
        } finally {
            setIsUploading(false)
        }
    }, [uploadedImages.length, showError, showSuccess])
    // Drag & Drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragActive(false)
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) handleImageUpload(files)
    }, [handleImageUpload])

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length > 0) handleImageUpload(files)
        e.target.value = ''
    }, [handleImageUpload])

    const removeImage = useCallback((index: number) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index))
    }, [])

    // Navigation
    const handleNext = useCallback(() => {
        if (currentStep < steps.length) setCurrentStep(prev => prev + 1)
    }, [currentStep])

    const handlePrevious = useCallback(() => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1)
    }, [currentStep])

    // Soumission
    const handleFormSubmit = useCallback(async (data: ListingFormData) => {
        if (uploadedImages.length === 0) {
            showError('Images requises', 'Ajoutez au moins une image')
            return
        }

        setIsLoading(true)
        try {
            console.log('📝 Création annonce:', data)
            showSuccess('Annonce créée', 'Succès!')
            setCurrentStep(4)
        } catch (error) {
            showError('Erreur création', 'Échec création')
        } finally {
            setIsLoading(false)
        }
    }, [uploadedImages, showError, showSuccess])

    // Effects
    useEffect(() => {
        setIsClient(true)
    }, [])

    useEffect(() => {
        if (isClient && !isAuthenticated) {
            router.push('/auth/login?redirect=/sell')
        }
    }, [isClient, isAuthenticated, router])

    useEffect(() => {
        if (user?.region && isClient) {
            setValue('region', user.region)
        }
    }, [user, setValue, isClient])

    const selectedCategory = MOCK_CATEGORIES.find(c => c.id === watchedValues.category_id)

    // Loading
    if (!isClient) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    // Redirection
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <>
            <Header />

            <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pt-20">
                <div className="container mx-auto px-4 py-12">

                    {/* Header */}
                    <motion.div
                        className="text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                            Publier une
                            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Annonce</span>
                        </h1>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Vendez rapidement vos produits à des milliers d'acheteurs sénégalais
                        </p>
                    </motion.div>

                    {/* Messages */}
                    {error && (
                        <motion.div className="max-w-4xl mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-700">{error}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {success && (
                        <motion.div className="max-w-4xl mx-auto mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <Alert className="border-green-200 bg-green-50">
                                <Check className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700">{success}</AlertDescription>
                            </Alert>
                        </motion.div>
                    )}

                    {/* Progress Steps */}
                    <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="flex justify-center">
                            <div className="flex items-center space-x-4 bg-white rounded-2xl p-6 shadow-lg">
                                {steps.map((step, index) => (
                                    <div key={step.id} className="flex items-center">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ${currentStep >= step.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            <step.icon className="h-5 w-5" />
                                        </div>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${currentStep >= step.id ? 'text-blue-600' : 'text-slate-400'}`}>
                                                {step.title}
                                            </p>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-8 h-0.5 mx-4 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        <div className="max-w-4xl mx-auto">

                            <AnimatePresence mode="wait">
                                {/* Étape 1: Informations */}
                                {currentStep === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                                    >
                                        <div className="lg:col-span-2">
                                            <Card className="shadow-xl border-0">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center text-2xl">
                                                        <FileText className="h-6 w-6 mr-3 text-blue-600" />
                                                        Informations de base
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-6">

                                                    {/* Titre */}
                                                    <div>
                                                        <Label className="text-base font-semibold">Titre de l'annonce *</Label>
                                                        <Input
                                                            {...register('title')}
                                                            placeholder="Ex: iPhone 13 Pro Max 256GB Noir - État neuf"
                                                            className="mt-2 h-12"
                                                        />
                                                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                                                        <p className="text-slate-500 text-sm mt-1">{watchedValues.title?.length || 0}/200 caractères</p>
                                                    </div>

                                                    {/* Catégorie et Région */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <Label className="text-base font-semibold">Catégorie *</Label>
                                                            <Select onValueChange={(value) => setValue('category_id', value)}>
                                                                <SelectTrigger className="mt-2 h-12">
                                                                    <SelectValue placeholder="Choisir une catégorie" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {MOCK_CATEGORIES.map(category => (
                                                                        <SelectItem key={category.id} value={category.id}>
                                                                            <span>{category.name}</span>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
                                                        </div>

                                                        <div>
                                                            <Label className="text-base font-semibold">Région *</Label>
                                                            <Select value={watchedValues.region} onValueChange={(value) => setValue('region', value)}>
                                                                <SelectTrigger className="mt-2 h-12">
                                                                    <SelectValue placeholder="Choisir une région" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {SENEGAL_REGIONS.map(region => (
                                                                        <SelectItem key={region} value={region}>
                                                                            <div className="flex items-center">
                                                                                <MapPin className="h-4 w-4 mr-2" />
                                                                                {region}
                                                                            </div>
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            {errors.region && <p className="text-red-500 text-sm mt-1">{errors.region.message}</p>}
                                                        </div>
                                                    </div>

                                                    {/* Prix */}
                                                    <div>
                                                        <Label className="text-base font-semibold">Prix *</Label>
                                                        <div className="relative mt-2">
                                                            <Input
                                                                {...register('price', { valueAsNumber: true })}
                                                                type="number"
                                                                placeholder="0"
                                                                className="h-12 pr-16"
                                                            />
                                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">FCFA</div>
                                                        </div>
                                                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                                                        {watchedValues.price > 0 && <p className="text-blue-600 text-sm mt-1 font-medium">{formatPrice(watchedValues.price)}</p>}
                                                    </div>

                                                    {/* Description */}
                                                    <div>
                                                        <Label className="text-base font-semibold">Description détaillée *</Label>
                                                        <Textarea
                                                            {...register('description')}
                                                            placeholder="Décrivez votre produit en détail : état, spécifications, raison de la vente..."
                                                            className="mt-2 min-h-[120px] resize-none"
                                                        />
                                                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                                                        <p className="text-slate-500 text-sm mt-1">{watchedValues.description?.length || 0}/2000 caractères</p>
                                                    </div>

                                                </CardContent>
                                            </Card>
                                        </div>

                                        {/* Preview */}
                                        <div className="lg:col-span-1">
                                            <Card className="shadow-xl border-0 sticky top-6">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Aperçu rapide</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    {watchedValues.title ? (
                                                        <div className="space-y-4">
                                                            <h3 className="font-semibold text-slate-900 line-clamp-2">{watchedValues.title}</h3>
                                                            {watchedValues.price > 0 && <div className="text-2xl font-bold text-blue-600">{formatPrice(watchedValues.price)}</div>}
                                                            {selectedCategory && <Badge variant="secondary">{selectedCategory.name}</Badge>}
                                                            {watchedValues.region && (
                                                                <div className="flex items-center text-slate-600">
                                                                    <MapPin className="h-4 w-4 mr-1" />
                                                                    {watchedValues.region}
                                                                </div>
                                                            )}
                                                            {watchedValues.description && <p className="text-sm text-slate-600 line-clamp-3">{watchedValues.description}</p>}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8">
                                                            <Eye className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                                            <p className="text-slate-500">Remplissez le formulaire pour voir l'aperçu</p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Étape 2: Photos */}
                                {currentStep === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        <Card className="shadow-xl border-0">
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-2xl">
                                                    <Camera className="h-6 w-6 mr-3 text-blue-600" />
                                                    Photos de votre produit
                                                </CardTitle>
                                                <p className="text-slate-600">Ajoutez jusqu'à 5 photos pour attirer plus d'acheteurs</p>
                                            </CardHeader>
                                            <CardContent>

                                                {/* Zone upload */}
                                                <div
                                                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 cursor-pointer ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                                                        } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                                                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
                                                    onDrop={handleDrop}
                                                    onClick={() => document.getElementById('image-upload')?.click()}
                                                >
                                                    {isUploading ? (
                                                        <>
                                                            <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                                                            <h3 className="text-xl font-semibold text-blue-900 mb-2">Upload en cours...</h3>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                                                            <h3 className="text-xl font-semibold text-slate-900 mb-2">Glissez vos images ici</h3>
                                                            <p className="text-slate-600 mb-6">ou cliquez pour parcourir vos fichiers</p>
                                                            <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" id="image-upload" />
                                                            <Button type="button" className="pointer-events-none">
                                                                <ImageIcon className="h-5 w-5 mr-2" />
                                                                Choisir des images
                                                            </Button>
                                                            <div className="mt-4 text-sm text-slate-500">
                                                                <p>Formats: JPG, PNG, WebP • Max: 5MB • Limite: 5 images</p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Images uploadées */}
                                                {uploadedImages.length > 0 && (
                                                    <div className="mt-8">
                                                        <h4 className="font-semibold text-slate-900 mb-4">
                                                            Images ajoutées ({uploadedImages.length}/5)
                                                        </h4>

                                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                                            {uploadedImages.map((imageUrl, index) => (
                                                                <motion.div
                                                                    key={index}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    className="relative group"
                                                                >
                                                                    {/* ✅ Image avec gestion d'erreur améliorée */}
                                                                    <div className="w-full h-32 bg-slate-200 rounded-lg overflow-hidden">
                                                                        <img
                                                                            src={imageUrl}
                                                                            alt={`Image ${index + 1}`}
                                                                            className="w-full h-full object-cover"
                                                                            onLoad={() => {
                                                                                console.log('✅ Image chargée avec succès:', imageUrl)
                                                                            }}
                                                                            onError={(e) => {
                                                                                console.error('❌ Erreur chargement image:', imageUrl)
                                                                                const target = e.target as HTMLImageElement
                                                                                const parent = target.parentElement
                                                                                if (parent) {
                                                                                    parent.innerHTML = `
                    <div class="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                      <div class="mb-1">❌</div>
                      <div>Erreur</div>
                      <div class="truncate max-w-full">${imageUrl.split('/').pop()}</div>
                    </div>
                  `
                                                                                }
                                                                            }}
                                                                        />
                                                                    </div>

                                                                    {index === 0 && (
                                                                        <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                                                                            Principale
                                                                        </Badge>
                                                                    )}

                                                                    <Button
                                                                        type="button"
                                                                        variant="destructive"
                                                                        size="sm"
                                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation()
                                                                            console.log('🗑️ Suppression image:', imageUrl)
                                                                            removeImage(index)
                                                                        }}
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                    </Button>
                                                                </motion.div>
                                                            ))}
                                                        </div>

                                                        {/* DEBUG - URLs des images */}
                                                        {process.env.NODE_ENV === 'development' && (
                                                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                                                                <strong>🔧 Debug Images:</strong>
                                                                <div className="mt-2 space-y-1">
                                                                    {uploadedImages.map((url, index) => (
                                                                        <div key={index} className="flex items-center gap-2">
                                                                            <span className="font-mono text-xs bg-white px-2 py-1 rounded">{index + 1}:</span>
                                                                            <span className="text-xs truncate">{url}</span>
                                                                            <a
                                                                                href={url}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="text-blue-600 hover:text-blue-800 text-xs"
                                                                            >
                                                                                🔗 Test
                                                                            </a>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Étape 3: Aperçu */}
                                {currentStep === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <Card className="shadow-xl border-0">
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-2xl">
                                                    <Eye className="h-6 w-6 mr-3 text-blue-600" />
                                                    Aperçu de votre annonce
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="bg-white border rounded-xl p-6 shadow-lg">
                                                    {uploadedImages.length > 0 && (
                                                        <div className="mb-6">
                                                            <img src={`http://localhost:8080${uploadedImages[0]}`} alt="Principal" className="w-full h-64 object-cover rounded-lg" />
                                                            {uploadedImages.length > 1 && (
                                                                <div className="flex gap-2 mt-3">
                                                                    {uploadedImages.slice(1, 4).map((imageUrl, index) => (
                                                                        <img key={index} src={`http://localhost:8080${imageUrl}`} alt={`${index + 2}`} className="w-20 h-20 object-cover rounded-md" />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between">
                                                            <div>
                                                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{watchedValues.title}</h2>
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    {selectedCategory && <Badge variant="secondary">{selectedCategory.name}</Badge>}
                                                                    <div className="flex items-center text-slate-600">
                                                                        <MapPin className="h-4 w-4 mr-1" />
                                                                        {watchedValues.region}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="text-3xl font-bold text-blue-600">{formatPrice(watchedValues.price)}</div>
                                                        </div>
                                                        <div className="border-t pt-4">
                                                            <h3 className="font-semibold text-slate-900 mb-3">Description</h3>
                                                            <p className="text-slate-700 whitespace-pre-wrap">{watchedValues.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                                {/* Étape 4: Paiement */}
                                {currentStep === 4 && (
                                    <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                        <Card className="shadow-xl border-0">
                                            <CardHeader>
                                                <CardTitle className="flex items-center text-2xl">
                                                    <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                                                    Finaliser la publication
                                                </CardTitle>
                                                <p className="text-slate-600">Payez 200 FCFA pour publier votre annonce</p>
                                            </CardHeader>
                                            <CardContent>

                                                <div className="bg-blue-50 rounded-xl p-6 mb-8">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <span className="text-slate-900 font-medium">Frais de publication</span>
                                                        <span className="text-2xl font-bold text-blue-600">200 FCFA</span>
                                                    </div>
                                                    <div className="text-sm text-slate-600 space-y-1">
                                                        <div className="flex items-center">
                                                            <Check className="h-4 w-4 text-green-600 mr-2" />
                                                            Annonce visible pendant 30 jours
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Check className="h-4 w-4 text-green-600 mr-2" />
                                                            Statistiques de performance
                                                        </div>
                                                        <div className="flex items-center">
                                                            <Check className="h-4 w-4 text-green-600 mr-2" />
                                                            Gestion des contacts
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-slate-900">Choisissez votre méthode de paiement</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <Button variant="outline" className="p-6 h-auto flex-col space-y-2 hover:border-orange-500">
                                                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-orange-600 font-bold">OM</span>
                                                            </div>
                                                            <span className="font-semibold">Orange Money</span>
                                                        </Button>
                                                        <Button variant="outline" className="p-6 h-auto flex-col space-y-2 hover:border-blue-500">
                                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-blue-600 font-bold">W</span>
                                                            </div>
                                                            <span className="font-semibold">Wave</span>
                                                        </Button>
                                                        <Button variant="outline" className="p-6 h-auto flex-col space-y-2 hover:border-green-500">
                                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                                                <span className="text-green-600 font-bold">FM</span>
                                                            </div>
                                                            <span className="font-semibold">Free Money</span>
                                                        </Button>
                                                    </div>
                                                </div>

                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )}

                            </AnimatePresence>

                            {/* Navigation */}
                            <motion.div className="flex justify-between items-center mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={currentStep === 1}
                                    className="flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Précédent
                                </Button>

                                <div className="text-center">
                                    <p className="text-sm text-slate-600">Étape {currentStep} sur {steps.length}</p>
                                </div>
                                {currentStep < 3 ? (
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        disabled={
                                            (currentStep === 1 && (!watchedValues.title || !watchedValues.description || !watchedValues.price || !watchedValues.category_id || !watchedValues.region)) ||
                                            (currentStep === 2 && uploadedImages.length === 0) // ✅ Cette condition peut bloquer
                                        }
                                        className="flex items-center"
                                    >
                                        Suivant
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                ) : currentStep === 3 ? (
                                    <Button
                                        type="submit"
                                        className="flex items-center bg-blue-600 hover:bg-blue-700"
                                        disabled={isLoading || uploadedImages.length === 0} // ✅ Vérification ici aussi
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Création...
                                            </>
                                        ) : (
                                            <>
                                                Créer l'annonce
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        className="flex items-center bg-green-600 hover:bg-green-700"
                                        onClick={() => router.push('/dashboard')}
                                    >
                                        Aller au Dashboard
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Button>
                                )}

                            </motion.div>

                        </div>
                    </form>

                </div>
            </main>

            <Footer />
        </>
    )
}