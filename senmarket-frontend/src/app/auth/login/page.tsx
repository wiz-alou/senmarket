'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/stores/auth.store'; // ✅ Utiliser le store
import { 
  Eye,
  EyeOff,
  Phone,
  Lock,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  Star,
  Users,
  Smartphone
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuthStore(); // ✅ Hook du store
  
  // États du formulaire
  const [form, setForm] = useState({
    phone: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Gestionnaires
  const handleInputChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!form.phone.trim()) {
      setError('Veuillez saisir votre numéro de téléphone');
      return;
    }
    
    if (!form.password.trim()) {
      setError('Veuillez saisir votre mot de passe');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ Utiliser la méthode login du store
      await login(form.phone, form.password);
      
      setSuccess('Connexion réussie ! Redirection...');
      
      // ✅ Redirection après succès
      setTimeout(() => {
        const redirectTo = searchParams.get('redirect') || '/dashboard';
        router.push(redirectTo);
      }, 1000);

    } catch (error: any) {
      console.error('Erreur connexion:', error);
      setError(error.message || 'Erreur de connexion');
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
                Bon retour sur
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> SenMarket</span>
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Connectez-vous pour accéder à votre compte et reprendre vos activités
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            
            {/* Formulaire de connexion */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-2xl border-0">
                <CardHeader className="space-y-1 pb-8">
                  <CardTitle className="text-3xl font-bold text-center text-slate-900">
                    Connexion
                  </CardTitle>
                  <p className="text-slate-600 text-center">
                    Accédez à votre espace personnel
                  </p>
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
                      <p className="text-green-700 text-sm">{success}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Numéro de téléphone */}
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
                          className="pl-11 py-3 text-lg"
                          required
                          disabled={isLoading}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Format: +221 suivi de votre numéro
                      </p>
                    </div>

                    {/* Mot de passe */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Votre mot de passe"
                          value={form.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          className="pl-11 pr-11 py-3 text-lg"
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

                    {/* Options */}
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-600">Se souvenir de moi</span>
                      </label>
                      
                      <Link 
                        href="/auth/forgot-password" 
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Mot de passe oublié ?
                      </Link>
                    </div>

                    {/* Bouton de connexion */}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold rounded-lg shadow-lg transform transition-all hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Connexion en cours...
                        </>
                      ) : (
                        <>
                          Se connecter
                          <ArrowRight className="h-5 w-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Lien vers inscription */}
                  <div className="text-center">
                    <p className="text-slate-600">
                      Pas encore de compte ?{' '}
                      <Link 
                        href="/auth/register" 
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Créer un compte
                      </Link>
                    </p>
                  </div>

                  {/* Conseils de sécurité */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-amber-800">
                        <p className="font-medium mb-1">Sécurité de votre compte</p>
                        <ul className="text-xs space-y-1">
                          <li>• Ne partagez jamais vos identifiants</li>
                          <li>• Déconnectez-vous sur les ordinateurs publics</li>
                          <li>• Signalez toute activité suspecte</li>
                        </ul>
                      </div>
                    </div>
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
              
              {/* Statistiques */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-slate-900">
                  Rejoignez notre communauté
                </h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">50K+</div>
                        <div className="text-sm text-slate-600">Utilisateurs</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Smartphone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-slate-900">125K</div>
                        <div className="text-sm text-slate-600">Annonces</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Avantages */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  Pourquoi choisir SenMarket ?
                </h3>
                
                <div className="space-y-3">
                  {[
                    {
                      icon: Shield,
                      title: "Sécurité garantie",
                      description: "Vérification SMS et paiements sécurisés"
                    },
                    {
                      icon: Star,
                      title: "Service premium",
                      description: "Support 24/7 et fonctionnalités avancées"
                    },
                    {
                      icon: Users,
                      title: "Communauté active",
                      description: "Des milliers d'utilisateurs de confiance"
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">{feature.title}</h4>
                        <p className="text-sm text-slate-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call-to-action secondaire */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">
                  Première fois sur SenMarket ?
                </h3>
                <p className="text-blue-100 mb-4">
                  Créez votre compte en moins de 2 minutes et commencez à vendre dès aujourd'hui.
                </p>
                <Link href="/auth/register">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold">
                    Créer un compte gratuit
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
