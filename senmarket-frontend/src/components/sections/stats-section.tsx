'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  CheckCircle,
  Globe,
  Clock,
  Star
} from 'lucide-react';

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Utilisateurs Actifs",
      description: "Professionnels et particuliers",
      color: "blue"
    },
    {
      icon: ShoppingBag,
      number: "125,000+",
      label: "Annonces Publiées",
      description: "Depuis le lancement",
      color: "green"
    },
    {
      icon: TrendingUp,
      number: "2.5M FCFA",
      label: "Transactions",
      description: "Volume mensuel moyen",
      color: "purple"
    },
    {
      icon: Shield,
      number: "99.8%",
      label: "Sécurité",
      description: "Transactions sécurisées",
      color: "orange"
    }
  ];

  const features = [
    {
      icon: CheckCircle,
      title: "Vérification Identité",
      description: "Tous les vendeurs sont vérifiés via SMS"
    },
    {
      icon: Shield,
      title: "Paiements Sécurisés",
      description: "Orange Money, Wave & Free Money"
    },
    {
      icon: Globe,
      title: "Couverture Nationale",
      description: "Présent dans les 16 régions du Sénégal"
    },
    {
      icon: Clock,
      title: "Support 24/7",
      description: "Assistance technique permanente"
    }
  ];

  const testimonials = [
    {
      name: "Ministère du Commerce",
      logo: "🏛️",
      text: "Partenaire officiel pour la digitalisation du commerce sénégalais"
    },
    {
      name: "Orange Sénégal",
      logo: "🍊",
      text: "Intégration certifiée Orange Money"
    },
    {
      name: "APIX",
      logo: "🚀",
      text: "Startup labellisée par l'Agence de Promotion des Investissements"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Le Marketplace de
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Confiance</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Des milliers de Sénégalais nous font confiance quotidiennement pour leurs transactions en ligne sécurisées
          </p>
        </motion.div>

        {/* Statistiques Principales */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-xl bg-${stat.color}-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <stat.icon className={`h-7 w-7 text-${stat.color}-600`} />
              </div>
              
              <div className="space-y-2">
                <div className="text-3xl font-bold text-slate-900">{stat.number}</div>
                <div className="text-lg font-semibold text-slate-700">{stat.label}</div>
                <div className="text-sm text-slate-500">{stat.description}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Fonctionnalités de Confiance */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <feature.icon className="h-8 w-8 text-blue-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Partenaires & Certifications */}
        <motion.div
          className="bg-white rounded-3xl p-12 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Partenaires & Certifications
            </h3>
            <p className="text-slate-600">
              Reconnu par les institutions sénégalaises et partenaires technologiques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((partner, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="text-4xl mb-4">{partner.logo}</div>
                <h4 className="font-semibold text-slate-900 mb-2">{partner.name}</h4>
                <p className="text-sm text-slate-600">{partner.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call-to-Action Final */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-center mb-4">
              <Star className="h-8 w-8 text-yellow-300 mr-2" />
              <span className="text-xl font-semibold">4.8/5</span>
              <span className="ml-2 text-blue-100">- Note moyenne utilisateurs</span>
            </div>
            
            <h3 className="text-2xl font-bold mb-4">
              Rejoignez la révolution du e-commerce sénégalais
            </h3>
            
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Plus de 50,000 utilisateurs actifs et 125,000 annonces publiées. 
              Vendez et achetez en toute sécurité sur le marketplace #1 du Sénégal.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Commencer à Vendre
              </button>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:bg-opacity-10 transition-colors">
                Explorer les Annonces
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}