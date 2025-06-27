import React from 'react';
import { Gift, Sparkles, Target } from 'lucide-react';

// Version statique temporaire pour résoudre le problème de compilation
export function PhasesMarketingSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        
        {/* En-tête de section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 mb-4 border border-white/50">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Système de Monétisation Intelligent</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              Évolution Progressive
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Notre système s'adapte à la croissance de la plateforme pour offrir 
            la meilleure expérience à tous les utilisateurs.
          </p>
        </div>

        {/* Phase de Lancement */}
        <div className="relative bg-gradient-to-r from-blue-600/95 via-purple-600/95 to-indigo-700/95 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
          <div className="relative z-10 text-center text-white">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Gift className="h-8 w-8 text-yellow-300" />
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                PHASE ACTUELLE
              </span>
              <Gift className="h-8 w-8 text-yellow-300" />
            </div>

            <h3 className="text-4xl md:text-6xl font-black mb-4">
              🎉 100% GRATUIT
            </h3>

            <p className="text-xl md:text-2xl mb-6 opacity-90">
              Publiez <strong>autant d'annonces que vous voulez</strong> !
            </p>

            <div className="bg-orange-500/20 backdrop-blur-sm border border-orange-300/30 rounded-2xl p-4 mb-8 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2">
                <span className="text-orange-100 font-medium">
                  Profitez de la phase de lancement !
                </span>
              </div>
            </div>

            <a 
              href="/sell"
              className="inline-flex items-center gap-2 bg-white text-purple-700 hover:bg-white/90 font-bold text-lg px-8 py-3 rounded-xl shadow-lg transition-all"
            >
              <Gift className="h-5 w-5" />
              Publier Gratuitement
            </a>
          </div>
        </div>

        {/* Message d'explication */}
        <div className="text-center mt-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto border border-white/50">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">
              <strong>Transition intelligente :</strong> Le passage d'une phase à l'autre se fait 
              automatiquement selon l'adoption et la croissance de la plateforme.
            </p>
            <p className="text-slate-600 text-sm mt-2">
              Notre objectif : offrir la meilleure expérience utilisateur à chaque étape.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}