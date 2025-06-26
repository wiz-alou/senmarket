// src/components/DynamicLaunchBanner.tsx
'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Star, 
  Clock, 
  Zap, 
  X, 
  AlertTriangle,
  TrendingUp,
  CreditCard,
  CheckCircle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLaunchBanner } from '@/hooks/useQuota';
import { useQuotaStore } from '@/stores/quota.store';

interface CountdownProps {
  endDate: string;
  onComplete?: () => void;
}

// Composant compteur à rebours réutilisable
const CountdownTimer: React.FC<CountdownProps> = ({ endDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const now = new Date();
    const end = new Date(endDate);
    const difference = end.getTime() - now.getTime();
    
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isActive: true
      };
    }
    
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isActive: false };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (!newTimeLeft.isActive && onComplete) {
        onComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate, onComplete]);

  if (!timeLeft.isActive) return null;

  return (
    <div className="flex justify-center gap-2 md:gap-4 text-xl md:text-2xl font-mono font-bold">
      <div className="bg-white/10 rounded-lg px-2 md:px-3 py-2 min-w-[50px] md:min-w-[60px] text-center">
        <div>{timeLeft.days.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">JOURS</div>
      </div>
      <div className="bg-white/10 rounded-lg px-2 md:px-3 py-2 min-w-[50px] md:min-w-[60px] text-center">
        <div>{timeLeft.hours.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">H</div>
      </div>
      <div className="bg-white/10 rounded-lg px-2 md:px-3 py-2 min-w-[50px] md:min-w-[60px] text-center">
        <div>{timeLeft.minutes.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">MIN</div>
      </div>
      <div className="bg-white/10 rounded-lg px-2 md:px-3 py-2 min-w-[50px] md:min-w-[60px] text-center">
        <div>{timeLeft.seconds.toString().padStart(2, '0')}</div>
        <div className="text-xs text-white/80">SEC</div>
      </div>
    </div>
  );
};

// Bannière phase de lancement
const LaunchPhaseBanner: React.FC<{
  phaseData: any;
  onDismiss: () => void;
  isEndingSoon: boolean;
}> = ({ phaseData, onDismiss, isEndingSoon }) => {
  const gradientClass = isEndingSoon 
    ? "from-orange-500 via-red-500 to-pink-500"
    : "from-emerald-500 via-teal-500 to-cyan-500";

  return (
    <motion.div 
      className={`bg-gradient-to-r ${gradientClass} text-white mb-8 rounded-xl overflow-hidden shadow-2xl relative`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
      
      {/* Bouton fermer */}
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="text-center">
          {/* Titre avec urgence conditionnelle */}
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isEndingSoon ? (
              <AlertTriangle className="h-8 w-8 text-yellow-300 animate-pulse" />
            ) : (
              <Gift className="h-8 w-8 text-yellow-300" />
            )}
            
            <h2 className="text-2xl md:text-3xl font-bold">
              {isEndingSoon ? (
                <>⚡ DERNIERS JOURS - 100% GRATUIT !</>
              ) : (
                <>🎉 LANCEMENT SPÉCIAL - 100% GRATUIT !</>
              )}
            </h2>
            
            <Star className="h-8 w-8 text-yellow-300" />
          </motion.div>

          {/* Message */}
          <p className="text-lg md:text-xl mb-6 text-white/90">
            {isEndingSoon ? (
              <>⏰ <strong>Dernière chance</strong> de publier gratuitement !</>
            ) : (
              <>Publiez <strong>GRATUITEMENT</strong> pendant notre période de lancement !</>
            )}
          </p>

          {/* Compteur à rebours */}
          <motion.div 
            className="bg-black/20 rounded-lg p-4 mb-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-medium">
                {isEndingSoon ? "Plus que :" : "Temps restant :"}
              </span>
            </div>
            
            <CountdownTimer 
              endDate={phaseData.launch_end_date}
            />
          </motion.div>

          {/* Avantages */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-yellow-300" />
              <span>Annonces illimitées</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4 text-yellow-300" />
              <span>Toutes les fonctionnalités</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Gift className="h-4 w-4 text-yellow-300" />
              <span>Aucun frais caché</span>
            </div>
          </motion.div>

          {/* Message d'urgence */}
          <motion.p 
            className="mt-4 text-xs md:text-sm text-yellow-200 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {isEndingSoon ? (
              <>🔥 URGENT - Après cette période, publication à 200 FCFA</>
            ) : (
              <>⚡ Offre limitée - Après cette période, publication payante</>
            )}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

// Bannière phase de crédits
const CreditPhaseBanner: React.FC<{
  statusData: any;
  onDismiss: () => void;
}> = ({ statusData, onDismiss }) => {
  const remaining = statusData?.remaining_free || 0;
  const used = statusData?.used_this_month || 0;
  const limit = statusData?.monthly_limit || 3;
  const progressPercent = limit > 0 ? (used / limit) * 100 : 0;

  return (
    <motion.div 
      className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white mb-8 rounded-xl overflow-hidden shadow-2xl relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="text-center">
          <motion.div className="flex items-center justify-center gap-3 mb-4">
            <CreditCard className="h-8 w-8 text-blue-200" />
            <h2 className="text-2xl md:text-3xl font-bold">
              💳 Système de crédits actif
            </h2>
            <TrendingUp className="h-8 w-8 text-blue-200" />
          </motion.div>

          <p className="text-lg mb-6">
            Vous avez <strong>{remaining} annonce(s) gratuite(s)</strong> ce mois
          </p>

          {/* Barre de progression */}
          <div className="bg-black/20 rounded-lg p-4 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Utilisé: {used}/{limit}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-blue-100">
            {remaining > 0 ? (
              <>Profitez de vos annonces gratuites restantes !</>
            ) : (
              <>Plus d'annonces gratuites ce mois. Prochaine réinitialisation dans {statusData?.days_until_reset || 0} jours.</>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

// Bannière phase payante
const PaidPhaseBanner: React.FC<{
  pricingData: any;
  onDismiss: () => void;
}> = ({ pricingData, onDismiss }) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-gray-700 via-gray-800 to-black text-white mb-8 rounded-xl overflow-hidden shadow-2xl relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="relative z-10 p-6 md:p-8">
        <div className="text-center">
          <motion.div className="flex items-center justify-center gap-3 mb-4">
            <CheckCircle className="h-8 w-8 text-green-400" />
            <h2 className="text-2xl md:text-3xl font-bold">
              ✨ Plateforme professionnelle
            </h2>
            <Star className="h-8 w-8 text-yellow-400" />
          </motion.div>

          <p className="text-lg mb-6">
            Publication d'annonce : <strong>{pricingData?.standard_price || 200} FCFA</strong>
          </p>

          {/* Options premium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Pack 5 annonces</div>
              <div className="text-lg">{pricingData?.pack_5_price || 800} FCFA</div>
              <div className="text-xs text-green-300">-{pricingData?.pack_5_discount || 20}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Pack 10 annonces</div>
              <div className="text-lg">{pricingData?.pack_10_price || 1500} FCFA</div>
              <div className="text-xs text-green-300">-{pricingData?.pack_10_discount || 25}%</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Options premium</div>
              <div className="text-sm">Boost +{pricingData?.premium_boost_price || 100} FCFA</div>
              <div className="text-sm">Couleur +{pricingData?.featured_color_price || 50} FCFA</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Composant principal
export const DynamicLaunchBanner: React.FC = () => {
  const { 
    isVisible, 
    isEndingSoon, 
    isCritical, 
    phaseData, 
    statusData, 
    isLoading 
  } = useLaunchBanner();

  const { shouldShowBanner, dismissBanner } = useQuotaStore();
  
  // Ne pas afficher si explicitement fermée
  if (!shouldShowBanner()) {
    return null;
  }

  // Ne pas afficher pendant le chargement
  if (isLoading) {
    return null;
  }

  // Déterminer quelle bannière afficher
  const currentPhase = phaseData?.current_phase || 'unknown';

  return (
    <AnimatePresence mode="wait">
      {currentPhase === 'launch' && isVisible && (
        <LaunchPhaseBanner
          key="launch-banner"
          phaseData={phaseData}
          onDismiss={dismissBanner}
          isEndingSoon={isEndingSoon || isCritical}
        />
      )}
      
      {currentPhase === 'credit_system' && statusData && (
        <CreditPhaseBanner
          key="credit-banner"
          statusData={statusData}
          onDismiss={dismissBanner}
        />
      )}
      
      {currentPhase === 'paid_system' && (
        <PaidPhaseBanner
          key="paid-banner"
          pricingData={phaseData}
          onDismiss={dismissBanner}
        />
      )}
    </AnimatePresence>
  );
};

// Hook pour utiliser la bannière dans d'autres composants
export const useDynamicBanner = () => {
  const { phaseData, statusData, isLoading } = useLaunchBanner();
  const { shouldShowBanner, dismissBanner } = useQuotaStore();

  return {
    shouldShow: shouldShowBanner(),
    currentPhase: phaseData?.current_phase || 'unknown',
    isLoading,
    dismiss: dismissBanner,
    phaseData,
    statusData,
  };
};

export default DynamicLaunchBanner;