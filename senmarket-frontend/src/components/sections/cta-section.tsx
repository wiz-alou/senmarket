'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Smartphone, 
  Shield, 
  Zap,
  CheckCircle,
  Star,
  Users,
  TrendingUp,
  Gift,
  Crown
} from 'lucide-react';

export function CTASection() {
  const [emailSubscribed, setEmailSubscribed] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const benefits = [
    {
      icon: Zap,
      title: "Publication Instantanée",
      description: "Votre annonce en ligne en moins de 2 minutes"
    },
    {
      icon: Shield,
      title: "Paiement Sécurisé",
      description: "Orange Money, Wave & Free Money certifiés"
    },
    {
      icon: Users,
      title: "50K+ Acheteurs",
      description: "Large audience qualifiée dans tout le Sénégal"
    },
    {
      icon: TrendingUp,
      title: "Boost Gratuit",
      description: "Première publication gratuite pour nouveaux vendeurs"
    }
  ];

  const plans = [
    {
      name: "Gratuit",
      price: "0 FCFA",
      period: "toujours",
      features: [
        "3 annonces par mois",
        "Photos illimitées",
        "Support communauté",
        "Statistiques de base"
      ],
      cta: "Commencer Gratuitement",
      popular: false,
      color: "blue"
    },
    {
      name: "Pro",
      price: "5,000 FCFA",
      period: "par mois",
      features: [
        "Annonces illimitées",
        "Mise en avant premium",
        "Support prioritaire 24/7",
        "Analytics avancées",
        "Badge vendeur vérifié",
        "API pour intégration"
      ],
      cta: "Essayer 7 Jours Gratuit",
      popular: true,
      color: "purple"
    },
    {
      name: "Enterprise",
      price: "25,000 FCFA",
      period: "par mois",
      features: [
        "Tout du plan Pro",
        "Multi-boutiques",
        "Manager dédié",
        "Formation personnalisée",
        "Intégration ERP",
        "Rapports personnalisés"
      ],
      cta: "Contactez-nous",
      popular: false,
      color: "gold"
    }
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubscribed.trim()) return;
    
    setIsSubscribing(true);
    
    // Simulation d'inscription
    setTimeout(() => {
      setSubscribed(true);
      setIsSubscribing(false);
    }, 1500);
  };

  return (
    <div className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full bg-repeat" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="container mx-auto px-6 relative">
        
        {/* Main CTA */}
        <motion.div 
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-full px-6 py-2 mb-8">
            <Gift className="h-4 w-4 text-blue-300 mr-2" />
            <span className="text-blue-100 text-sm font-medium">Offre de lancement - 7 jours gratuits</span>
          </div>
          
          <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8">
            Prêt à
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Décoller</span>
            ?
          </h2>
          
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
            Rejoignez les milliers d&apos;entrepreneurs sénégalais qui génèrent des revenus quotidiens sur SenMarket. 
            Votre success story commence maintenant.
          </p>

          {/* Quick Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <benefit.icon className="h-8 w-8 text-blue-300 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-blue-200">{benefit.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Main CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center group">
              <Smartphone className="h-5 w-5 mr-2" />
              Commencer à Vendre
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-slate-900 transition-all">
              Explorer le Marketplace
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-8 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Installation gratuite</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Support 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Paiement sécurisé</span>
            </div>
          </div>
        </motion.div>

        {/* Plans de Tarification */}
        <motion.div 
          className="mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-white mb-4">
              Choisissez votre Plan
            </h3>
            <p className="text-blue-200 max-w-2xl mx-auto">
              Des solutions adaptées à tous les vendeurs, du particulier à l&apos;entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                className={`relative bg-white/10 backdrop-blur-sm border rounded-2xl p-8 ${
                  plan.popular 
                    ? 'border-purple-400/50 scale-105 shadow-2xl' 
                    : 'border-white/20'
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center">
                      <Crown className="h-4 w-4 mr-1" />
                      Plus Populaire
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-blue-200 ml-2">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-blue-100">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                    : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Newsletter Subscription */}
        <motion.div 
          className="max-w-2xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
            <Star className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            
            <h3 className="text-2xl font-bold text-white mb-4">
              Restez Informé des Nouveautés
            </h3>
            
            <p className="text-blue-200 mb-6">
              Recevez nos conseils exclusifs pour booster vos ventes et les dernières fonctionnalités SenMarket
            </p>

            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  value={emailSubscribed}
                  onChange={(e) => setEmailSubscribed(e.target.value)}
                  placeholder="Votre adresse email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubscribing}
                  className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isSubscribing ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "S'inscrire"
                  )}
                </button>
              </form>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-green-300 font-medium">
                  Merci ! Vous recevrez nos prochaines actualités.
                </p>
              </motion.div>
            )}

            <p className="text-xs text-blue-300 mt-4">
              En vous inscrivant, vous acceptez de recevoir nos emails. Vous pouvez vous désinscrire à tout moment.
            </p>
          </div>
        </motion.div>

        {/* Final Trust Elements */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-8 text-blue-300 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Certifié Orange Money</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>50,000+ utilisateurs</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>4.8/5 étoiles</span>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}