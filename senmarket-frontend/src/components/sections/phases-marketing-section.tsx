'use client'

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Crown, CreditCard, Timer, ArrowRight, Sparkles, 
  Zap, Star, Trophy, Rocket, Users, TrendingUp, Clock,
  CheckCircle, AlertTriangle, Calendar, Target, FastForward,
  Play, Pause, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Hook pour les quotas (simulé pour la démo)
const usePhaseInfo = () => {
  // En production, remplacer par votre vrai hook
  return {
    isInLaunchPhase: true,
    daysRemaining: 65,
    currentPhase: 'launch',
    urgencyMessage: 'Plus que 65 jours pour profiter des annonces 100% gratuites !',
    isLoading: false
  };
};

export function PhasesMarketingSection() {
  const [showAllPhases, setShowAllPhases] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [currentPhaseView, setCurrentPhaseView] = useState(0);
  
  const { isInLaunchPhase, daysRemaining, urgencyMessage, isLoading } = usePhaseInfo();

  // Auto-rotation des phases pour la démo
  useEffect(() => {
    if (!autoPlay || !showAllPhases) return;
    
    const interval = setInterval(() => {
      setCurrentPhaseView(prev => (prev + 1) % 3);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [autoPlay, showAllPhases]);

  const phases = [
    {
      id: 1,
      name: "Phase de Lancement",
      status: "current",
      icon: Gift,
      color: "from-purple-600 to-blue-600",
      bgColor: "from-purple-50 to-blue-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
      accentColor: "text-purple-600",
      title: "🎉 100% GRATUIT",
      subtitle: "Annonces illimitées",
      description: "Publiez autant d'annonces que vous voulez, sans aucune limite ni frais !",
      features: [
        "Publication illimitée",
        "Visibilité maximale", 
        "Aucun frais caché",
        "Support prioritaire"
      ],
      cta: "Publier maintenant",
      badge: "Actuelle",
      urgency: urgencyMessage
    },
    {
      id: 2,
      name: "Phase Crédits",
      status: "upcoming",
      icon: CreditCard,
      color: "from-blue-600 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      accentColor: "text-blue-600",
      title: "💎 Freemium",
      subtitle: "3 gratuits + payant",
      description: "3 annonces gratuites par mois, puis 200 FCFA par annonce supplémentaire.",
      features: [
        "3 annonces/mois gratuites",
        "200 FCFA par extra",
        "Reset mensuel automatique",
        "Toujours visible"
      ],
      cta: "En savoir plus",
      badge: "Bientôt"
    },
    {
      id: 3,
      name: "Phase Premium",
      status: "future",
      icon: Crown,
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-50",
      borderColor: "border-yellow-200",
      textColor: "text-yellow-800",
      accentColor: "text-yellow-600",
      title: "👑 Premium",
      subtitle: "Service complet",
      description: "200 FCFA par annonce avec options premium et fonctionnalités avancées.",
      features: [
        "200 FCFA par annonce",
        "Options premium",
        "Boost de visibilité",
        "Analytics avancées"
      ],
      cta: "Découvrir",
      badge: "Futur"
    }
  ];

  if (isLoading) {
    return (
      <section className="py-12 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mx-auto mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-96 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Particules d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 4,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* En-tête de section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Système de Monétisation Intelligent</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Évolution Progressive
            </span>
          </h2>
          
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-6">
            Notre système s'adapte à la croissance de la plateforme pour offrir 
            la meilleure expérience à tous les utilisateurs.
          </p>

          {/* Contrôles de vue */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Button
              onClick={() => setShowAllPhases(!showAllPhases)}
              variant={showAllPhases ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              <FastForward className="h-4 w-4" />
              {showAllPhases ? 'Vue Actuelle' : 'Voir Toutes les Phases'}
            </Button>
            
            {showAllPhases && (
              <Button
                onClick={() => setAutoPlay(!autoPlay)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {autoPlay ? 'Pause' : 'Auto'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Vue Actuelle - Phase de Lancement */}
        {!showAllPhases && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {isInLaunchPhase && (
              <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden">
                {/* Effets visuels */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
                
                <div className="relative z-10 text-center text-white">
                  <motion.div
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-3 mb-6"
                  >
                    <Gift className="h-8 w-8 text-yellow-300" />
                    <Badge className="bg-green-500 text-white px-3 py-1">
                      PHASE ACTUELLE
                    </Badge>
                    <Gift className="h-8 w-8 text-yellow-300" />
                  </motion.div>

                  <motion.h3 
                    className="text-4xl md:text-6xl font-black mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    🎉 100% GRATUIT
                  </motion.h3>

                  <motion.p 
                    className="text-xl md:text-2xl mb-6 opacity-90"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    Publiez <strong>autant d'annonces que vous voulez</strong> !
                  </motion.p>

                  {urgencyMessage && (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="bg-orange-500/20 backdrop-blur-sm border border-orange-300/30 rounded-2xl p-4 mb-8 max-w-md mx-auto"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Timer className="h-5 w-5 text-orange-200 animate-pulse" />
                        <span className="text-orange-100 font-medium">{urgencyMessage}</span>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                  >
                    {[
                      { icon: Rocket, text: "Publication instantanée" },
                      { icon: Users, text: "Visibilité maximale" },
                      { icon: Star, text: "Qualité premium" },
                      { icon: TrendingUp, text: "Sans limites" }
                    ].map((feature, index) => (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                        <feature.icon className="h-6 w-6 mx-auto mb-2 text-yellow-300" />
                        <p className="text-sm font-medium">{feature.text}</p>
                      </div>
                    ))}
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      size="lg"
                      className="bg-white text-purple-700 hover:bg-white/90 font-bold text-lg px-8 py-3 rounded-xl shadow-lg"
                      onClick={() => window.location.href = '/sell'}
                    >
                      <Gift className="h-5 w-5 mr-2" />
                      Publier Gratuitement
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Vue Complète - Toutes les Phases */}
        {showAllPhases && (
          <div className="space-y-8">
            
            {/* Timeline */}
            <div className="flex items-center justify-center mb-12">
              <div className="flex items-center gap-4">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center">
                    <motion.button
                      onClick={() => setCurrentPhaseView(index)}
                      className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 ${
                        currentPhaseView === index
                          ? `bg-gradient-to-r ${phase.color} text-white shadow-lg scale-110`
                          : 'bg-white/60 text-slate-400 hover:bg-white/80'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <phase.icon className="h-5 w-5" />
                    </motion.button>
                    
                    {index < phases.length - 1 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        index < currentPhaseView ? 'bg-blue-500' : 'bg-slate-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Phase Actuelle en Vue */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhaseView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                {(() => {
                  const phase = phases[currentPhaseView];
                  return (
                    <div className={`bg-gradient-to-br ${phase.bgColor} border-2 ${phase.borderColor} rounded-3xl p-8 shadow-xl`}>
                      <div className="text-center">
                        
                        {/* Header */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                          <div className={`bg-gradient-to-r ${phase.color} p-3 rounded-xl text-white shadow-lg`}>
                            <phase.icon className="h-8 w-8" />
                          </div>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h3 className={`text-2xl font-bold ${phase.textColor}`}>
                                {phase.title}
                              </h3>
                              <Badge 
                                className={`${
                                  phase.status === 'current' ? 'bg-green-100 text-green-800' :
                                  phase.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {phase.badge}
                              </Badge>
                            </div>
                            <p className={`${phase.accentColor} font-medium`}>
                              {phase.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`text-lg ${phase.textColor} mb-6`}>
                          {phase.description}
                        </p>

                        {/* Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          {phase.features.map((feature, index) => (
                            <div key={index} className="bg-white/60 rounded-xl p-3">
                              <CheckCircle className={`h-5 w-5 ${phase.accentColor} mx-auto mb-2`} />
                              <p className={`text-sm font-medium ${phase.textColor}`}>
                                {feature}
                              </p>
                            </div>
                          ))}
                        </div>

                        {/* Urgence pour phase actuelle */}
                        {phase.status === 'current' && phase.urgency && (
                          <div className="bg-orange-100/60 border border-orange-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-center gap-2">
                              <AlertTriangle className="h-5 w-5 text-orange-600" />
                              <span className="text-orange-800 font-medium text-sm">
                                {phase.urgency}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* CTA */}
                        <Button 
                          size="lg"
                          className={`${
                            phase.status === 'current'
                              ? `bg-gradient-to-r ${phase.color} text-white shadow-lg`
                              : 'bg-white/80 text-slate-700 border-2 border-slate-200'
                          } font-bold px-8 py-3 rounded-xl`}
                          onClick={() => {
                            if (phase.status === 'current') {
                              window.location.href = '/sell';
                            }
                          }}
                          disabled={phase.status !== 'current'}
                        >
                          {phase.status === 'current' && <Gift className="h-5 w-5 mr-2" />}
                          {phase.cta}
                          {phase.status === 'current' && <ArrowRight className="h-5 w-5 ml-2" />}
                        </Button>

                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            </AnimatePresence>

            {/* Indicateurs de phase */}
            <div className="flex justify-center gap-2">
              {phases.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhaseView(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPhaseView === index ? 'bg-blue-600 w-6' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Message d'explication */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <Target className="h-6 w-6 text-blue-600 mx-auto mb-3" />
            <p className="text-slate-700 font-medium">
              <strong>Transition intelligente :</strong> Le passage d'une phase à l'autre se fait 
              automatiquement selon l'adoption et la croissance de la plateforme.
            </p>
            <p className="text-slate-600 text-sm mt-2">
              Notre objectif : offrir la meilleure expérience utilisateur à chaque étape.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}