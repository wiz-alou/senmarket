// src/components/promo/LaunchBanner.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Clock, Star, Zap, Loader2 } from 'lucide-react';
import { useLaunchBanner } from '@/hooks/usePhaseInfo';

const LaunchBanner = () => {
  const { isLaunchPhase, timeLeft, shouldShowBanner } = useLaunchBanner();

  // Ne pas afficher si pas en phase de lancement
  if (!shouldShowBanner) {
    return null;
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white mb-8 rounded-xl overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="relative p-6 md:p-8">
        {/* Effet de brillance animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-pulse" />
        
        <div className="relative z-10 text-center">
          {/* Titre principal */}
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Gift className="h-8 w-8 text-yellow-300" />
            <h2 className="text-2xl md:text-3xl font-bold">
              🎉 LANCEMENT SPÉCIAL - 100% GRATUIT !
            </h2>
            <Star className="h-8 w-8 text-yellow-300" />
          </motion.div>

          {/* Sous-titre */}
          <p className="text-lg md:text-xl mb-6 text-emerald-100">
            Publiez <strong>GRATUITEMENT</strong> pendant notre période de lancement !
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
              <span className="text-sm font-medium text-emerald-100">
                Temps restant pour profiter de l'offre :
              </span>
            </div>
            
            <div className="flex justify-center gap-4 text-2xl md:text-3xl font-mono font-bold">
              <div className="bg-white/10 rounded-lg px-3 py-2 min-w-[60px]">
                <div>{timeLeft.days.toString().padStart(2, '0')}</div>
                <div className="text-xs text-emerald-200">JOURS</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 min-w-[60px]">
                <div>{timeLeft.hours.toString().padStart(2, '0')}</div>
                <div className="text-xs text-emerald-200">HEURES</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 min-w-[60px]">
                <div>{timeLeft.minutes.toString().padStart(2, '0')}</div>
                <div className="text-xs text-emerald-200">MIN</div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 min-w-[60px]">
                <div>{timeLeft.seconds.toString().padStart(2, '0')}</div>
                <div className="text-xs text-emerald-200">SEC</div>
              </div>
            </div>
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
            ⚡ Offre limitée dans le temps - Après cette période, publication payante
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default LaunchBanner;

// ✅ BANNIÈRE SIMPLE POUR AUTRES PAGES
export const MiniLaunchBanner = () => {
  const { isLaunchPhase, daysRemaining } = useLaunchBanner();

  if (!isLaunchPhase) return null;

  return (
    <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <Gift className="h-4 w-4" />
        <span>
          <strong>Phase gratuite !</strong> Plus que {daysRemaining} jours pour publier gratuitement
        </span>
      </div>
    </div>
  );
};