'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  Mail,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Star,
  Users,
  Smartphone,
  Check,
  Zap,
  MessageCircle,  // 📱 Pour les futures fonctionnalités
  Clock,
  RefreshCw
} from 'lucide-react';

interface RegisterForm {
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  region: string;
}

interface RegisterResponse {
  message: string;
  data: {
    user: {
      id: string;
      phone: string;
      email: string;
      first_name: string;
      last_name: string;
      region: string;
      is_verified: boolean;
      created_at: string;
    };
    token: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  
  // États du formulaire
  const [form, setForm] = useState<RegisterForm>({
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    region: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  // 📱 SMS ONLY pour l'instant - pas de toggle
  const verificationMethod = 'sms';

  // Régions du Sénégal (basées sur votre API)
  const regions = [
    "Dakar - Plateau", 
    "Dakar - Almadies", 
    "Dakar - Parcelles Assainies",
    "Dakar - Ouakam", 
    "Dakar - Point E", 
    "Dakar - Pikine", 
    "Dakar - Guédiawaye",
    "Thiès", 
    "Saint-Louis", 
    "Kaolack", 
    "Ziguinchor", 
    "Diourbel",
    "Louga", 
    "Fatick", 
    "Kolda", 
    "Tambacounda"
  ];

  // Gestionnaires
  const handleInputChange = (field: keyof RegisterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Effacer l'erreur lors de la saisie
  };

  const validateForm = (): string | null => {
    if (!form.phone.trim()) return 'Le numéro de téléphone est requis';
    if (!form.password.trim()) return 'Le mot de passe est requis';
    if (form.password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
    if (form.password !== form.confirmPassword) return 'Les mots de passe ne correspondent pas';
    if (!form.first_name.trim()) return 'Le prénom est requis';
    if (!form.last_name.trim()) return 'Le nom est requis';
    if (!form.region) return 'La région est requise';
    if (!acceptTerms) return 'Vous devez accepter les conditions d\'utilisation';
    
    // Validation email si fourni
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      return 'Format d\'email invalide';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Préparer les données (exclure confirmPassword)
      const registerData = {
        phone: form.phone,
        email: form.email || undefined, // Envoyer undefined si vide
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        region: form.region
      };

      const response = await fetch('http://localhost:8080/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur d\'inscription');
      }

      // Succès de l'inscription
      const registerResponseData = data as RegisterResponse;
      
      // Sauvegarder le token et les infos utilisateur
      localStorage.setItem('senmarket_token', registerResponseData.data.token);
      localStorage.setItem('senmarket_user', JSON.stringify(registerResponseData.data.user));
      
      // ✅ Message SMS Twilio amélioré
      setSuccess('✅ Inscription réussie ! Code SMS Twilio envoyé instantanément. Redirection...');
      
      // Redirection vers la page de vérification après 2 secondes
      setTimeout(() => {
        router.push('/auth/verify');
      }, 2000);

    } catch (error) {
      console.error('Erreur inscription:', error);
      setError(error instanceof Error ? error.message : 'Erreur d\'inscription');
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Supprimer tous les caractères non numériques sauf le +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça commence par +221, laisser tel quel
    if (cleaned.startsWith('+221')) {
      return cleaned;
    }
    
    // Si ça commence par 221, ajouter le +
    if (cleaned.startsWith('221')) {
      return '+' + cleaned;
    }
    
    // Si ça commence par 7, ajouter +221
    if (cleaned.startsWith('7')) {
      return '+221' + cleaned;
    }
    
    // Sinon, retourner la valeur nettoyée
    return cleaned;
  };

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12">
        <div className="container mx-auto px-6">
          
          {/* Hero section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
                Rejoignez
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> SenMarket</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Créez votre compte gratuitement et commencez à vendre en moins de 2 minutes
              </p>
              
              {/* ✅ BANDEAU TWILIO SMS AMÉLIORÉ */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-center justify-center gap-3">
                    <Zap className="h-6 w-6" />
                    <div className="text-center">
                      <p className="font-semibold">Vérification SMS instantanée</p>
                      <p className="text-sm text-blue-100">Propulsé par Twilio • Livraison en 2-5 secondes • Renvoi intelligent (3 min)</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
            
            {/* Formulaire d'inscription */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-2xl border-0">
                <CardHeader className="space-y-1 pb-6">
                  <CardTitle className="text-3xl font-bold text-center text-slate-900">
                    Inscription
                  </CardTitle>
                  <p className="text-slate-600 text-center">
                    Créez votre compte professionnel
                  </p>

                  {/* ✅ INFO SMS TWILIO AMÉLIORÉE */}
                  <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Vérification SMS Twilio</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <div className="flex items-center justify-center gap-4 text-xs text-blue-700">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>2-5s livraison</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        <span>Renvoi 3 min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        <span>99.9% fiable</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  
                  {/* Messages de feedback */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3"
                    >
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{error}</p>
                    </motion.div>
                  )}
                  
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <p className="text-green-700 text-sm font-medium">{success}</p>
                    </motion.div>
                  )}

                  <div className="space-y-6">
                    
                    {/* Nom et prénom */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Prénom *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Votre prénom"
                            value={form.first_name}
                            onChange={(e) => handleInputChange('first_name', e.target.value)}
                            className="pl-11 py-3"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Nom *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            type="text"
                            placeholder="Votre nom"
                            value={form.last_name}
                            onChange={(e) => handleInputChange('last_name', e.target.value)}
                            className="pl-11 py-3"
                            required
                            disabled={isLoading}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Numéro de téléphone amélioré */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Numéro de téléphone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="tel"
                          placeholder="+221 77 XXX XX XX"
                          value={form.phone}
                          onChange={(e) => handleInputChange('phone', formatPhoneNumber(e.target.value))}
                          className="pl-11 py-3 border-2 focus:border-blue-500"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="flex items-center gap-2 text-xs text-blue-700">
                          <Smartphone className="h-3 w-3" />
                          <span>SMS envoyé via Twilio +14788278859 • Renvoi intelligent toutes les 3 min</span>
                        </div>
                      </div>
                    </div>

                    {/* Email (optionnel) */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Email (optionnel)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="votre@email.com"
                          value={form.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="pl-11 py-3"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {/* Région */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Région *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <select
                          value={form.region}
                          onChange={(e) => handleInputChange('region', e.target.value)}
                          className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          required
                          disabled={isLoading}
                        >
                          <option value="">Sélectionnez votre région</option>
                          {regions.map((region) => (
                            <option key={region} value={region}>
                              {region}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Mots de passe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Mot de passe *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Min. 6 caractères"
                            value={form.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="pl-11 pr-11 py-3"
                            required
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700">
                          Confirmer *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                          <Input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Répétez le mot de passe"
                            value={form.confirmPassword}
                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                            className="pl-11 pr-11 py-3"
                            required
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Indicateur de force du mot de passe */}
                    {form.password && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded ${
                                form.password.length >= level * 2
                                  ? form.password.length >= 8
                                    ? 'bg-green-500'
                                    : form.password.length >= 6
                                    ? 'bg-yellow-500'
                                    : 'bg-red-500'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Force du mot de passe: {
                            form.password.length >= 8 ? 'Fort' :
                            form.password.length >= 6 ? 'Moyen' : 'Faible'
                          }
                        </p>
                      </div>
                    )}

                    {/* Conditions d'utilisation */}
                    <div className="space-y-4">
                      <label className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={acceptTerms}
                          onChange={(e) => setAcceptTerms(e.target.checked)}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                        <span className="text-sm text-slate-600">
                          J&apos;accepte les{' '}
                          <Link href="/terms" className="text-blue-600 hover:text-blue-800 font-medium">
                            conditions d&apos;utilisation
                          </Link>
                          {' '}et la{' '}
                          <Link href="/privacy" className="text-blue-600 hover:text-blue-800 font-medium">
                            politique de confidentialité
                          </Link>
                        </span>
                      </label>
                    </div>

                    {/* Bouton d'inscription */}
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg transform transition-all hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Création du compte...
                        </>
                      ) : (
                        <>
                          Créer mon compte
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Lien vers connexion */}
                  <div className="text-center">
                    <p className="text-slate-600">
                      Déjà un compte ?{' '}
                      <Link 
                        href="/auth/login" 
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Se connecter
                      </Link>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Section informative */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              
              {/* Avantages de l'inscription */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900">
                  Pourquoi s&apos;inscrire ?
                </h2>
                
                <div className="space-y-4">
                  {[
                    {
                      icon: Shield,
                      title: "Compte sécurisé",
                      description: "Vérification SMS Twilio et protection des données personnelles"
                    },
                    {
                      icon: Smartphone,
                      title: "Vérification SMS instantanée",
                      description: "Code reçu en 2-5 secondes via Twilio • Renvoi intelligent (3 min)"
                    },
                    {
                      icon: Users,
                      title: "Audience qualifiée",
                      description: "Accédez à 50,000+ acheteurs potentiels"
                    },
                    {
                      icon: Star,
                      title: "Outils professionnels",
                      description: "Dashboard, statistiques et gestion avancée"
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-slate-600">{feature.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* ✅ PROCESSUS TWILIO SMS AMÉLIORÉ */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Processus SMS Twilio
                </h3>
                
                <div className="space-y-3">
                  {[
                    "1. Remplissez le formulaire (2 min)",
                    "2. SMS automatique envoyé via Twilio (2-5s)",
                    "3. Saisissez le code reçu par SMS",
                    "4. Renvoi intelligent si besoin (3 min)",
                    "5. Commencez à publier vos annonces"
                  ].map((step, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-blue-100">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ✅ STATS TWILIO AMÉLIORÉES */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-1">2-5s</div>
                  <div className="text-sm text-slate-600">Livraison SMS</div>
                </div>
                
                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-1">99.9%</div>
                  <div className="text-sm text-slate-600">Fiabilité</div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                  <div className="text-2xl font-bold text-slate-900 mb-1">3min</div>
                  <div className="text-sm text-slate-600">Renvoi intel.</div>
                </div>
              </div>

              {/* ✅ INFO WHATSAPP FUTUR */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">🚀 Bientôt disponible</h4>
                </div>
                <p className="text-sm text-green-700">
                  Vérification via WhatsApp Business pour une expérience encore plus moderne et interactive !
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}