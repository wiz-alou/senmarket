'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Settings } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "1. Données Collectées",
      content: [
        "Données d'identification : nom, prénom, numéro de téléphone, adresse email",
        "Données de localisation : région de résidence pour un service localisé",
        "Données d'utilisation : annonces publiées, recherches effectuées, favoris",
        "Données techniques : adresse IP, type de navigateur, système d'exploitation"
      ]
    },
    {
      icon: Eye,
      title: "2. Finalités du Traitement",
      content: [
        "Créer et gérer votre compte utilisateur sur la plateforme",
        "Permettre la publication et la consultation d'annonces",
        "Faciliter la mise en relation entre acheteurs et vendeurs",
        "Améliorer nos services et personnaliser votre expérience",
        "Assurer la sécurité de la plateforme et prévenir les fraudes"
      ]
    },
    {
      icon: Lock,
      title: "3. Base Légale et Consentement",
      content: [
        "Le traitement de vos données est basé sur votre consentement explicite",
        "Nécessité contractuelle pour l'exécution du service SenMarket",
        "Intérêt légitime pour la sécurité et l'amélioration du service",
        "Vous pouvez retirer votre consentement à tout moment"
      ]
    },
    {
      icon: UserCheck,
      title: "4. Partage des Données",
      content: [
        "Vos données ne sont jamais vendues à des tiers",
        "Partage limité avec nos prestataires techniques (hébergement, SMS)",
        "Informations publiques visibles dans vos annonces (nom, région, téléphone)",
        "Transmission possible aux autorités en cas d'obligation légale"
      ]
    },
    {
      icon: Shield,
      title: "5. Sécurité et Conservation",
      content: [
        "Chiffrement des données sensibles (mots de passe, paiements)",
        "Serveurs sécurisés avec sauvegarde régulière",
        "Accès limité aux données par notre équipe technique",
        "Conservation pendant la durée d'activité du compte + 3 ans"
      ]
    },
    {
      icon: Settings,
      title: "6. Vos Droits",
      content: [
        "Droit d'accès : consulter vos données personnelles",
        "Droit de rectification : corriger vos informations",
        "Droit à l'effacement : supprimer vos données",
        "Droit à la portabilité : récupérer vos données",
        "Droit d'opposition : vous opposer au traitement"
      ]
    }
  ]

  const dataTypes = [
    { category: "Données obligatoires", items: ["Nom et prénom", "Numéro de téléphone", "Région"], required: true },
    { category: "Données optionnelles", items: ["Email", "Photo de profil", "Préférences"], required: false },
    { category: "Données automatiques", items: ["Adresse IP", "Cookies", "Logs de connexion"], required: false }
  ]

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
        {/* Header */}
        <section className="bg-gradient-to-r from-green-600/95 via-blue-600/95 to-teal-700/95 text-white py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Politique de Confidentialité
              </h1>
              <p className="text-xl text-green-100 mb-8">
                Votre vie privée est notre priorité • Dernière mise à jour : 27 juin 2025
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-green-200 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Contenu */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-12"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre Engagement</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Chez SenMarket, nous respectons votre vie privée et nous nous engageons à protéger 
                  vos données personnelles. Cette politique explique comment nous collectons, 
                  utilisons et protégeons vos informations.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-green-800 font-medium">
                    🛡️ Conformité RGPD : Nous respectons les standards africains de protection des données
                  </p>
                </div>
              </motion.div>

              {/* Types de données */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-8"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">Types de Données Collectées</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dataTypes.map((type, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {type.required ? (
                          <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                        ) : (
                          <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                        )}
                        {type.category}
                      </h3>
                      <ul className="space-y-1">
                        {type.items.map((item, i) => (
                          <li key={i} className="text-sm text-slate-600">• {item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sections principales */}
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (index + 2) * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                    </div>
                    
                    <div className="space-y-3">
                      {section.content.map((paragraph, pIndex) => (
                        <div key={pIndex} className="flex items-start gap-3">
                          <span className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></span>
                          <p className="text-slate-600 leading-relaxed">{paragraph}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Exercer vos droits */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200 mt-12"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Comment Exercer Vos Droits ?</h2>
                <p className="text-slate-600 mb-6">
                  Vous pouvez exercer vos droits à tout moment en nous contactant. 
                  Nous nous engageons à répondre dans les 30 jours.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <h3 className="font-medium text-slate-900 mb-2">📧 Par Email</h3>
                    <p className="text-sm text-slate-600">privacy@senmarket.sn</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <h3 className="font-medium text-slate-900 mb-2">⚙️ Dans votre Compte</h3>
                    <p className="text-sm text-slate-600">Section "Paramètres" > "Données personnelles"</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    Gérer mes données
                  </Link>
                  <Link 
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  >
                    Nous contacter
                  </Link>
                </div>
              </motion.div>

              {/* Cookies et tracking */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mt-8"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Cookies et Technologies de Suivi</h2>
                <div className="space-y-4">
                  <p className="text-slate-600 leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience sur SenMarket :
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-medium text-slate-900 mb-2">🍪 Cookies Essentiels</h3>
                      <p className="text-sm text-slate-600">Nécessaires au fonctionnement (connexion, panier)</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <h3 className="font-medium text-slate-900 mb-2">📊 Cookies Analytiques</h3>
                      <p className="text-sm text-slate-600">Mesure d'audience anonyme (optionnel)</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Mise à jour */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-center mt-12 text-slate-500"
              >
                <p className="text-sm">
                  Cette politique peut évoluer. Nous vous informerons de tout changement important 
                  par email ou notification sur la plateforme.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}