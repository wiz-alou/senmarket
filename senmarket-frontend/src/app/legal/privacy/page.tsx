'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Shield, 
  Eye, 
  Lock, 
  Settings, 
  Database, 
  Users, 
  Globe,
  CheckCircle,
  Info,
  Clock,
  Mail
} from 'lucide-react';

export default function PrivacyPage() {
  const sections = [
    {
      icon: Database,
      title: "1. Données Collectées",
      content: [
        "Informations de profil : nom, téléphone, email, région",
        "Données d'annonces : photos, descriptions, prix, localisation",
        "Données techniques : adresse IP, cookies, logs de navigation",
        "Interactions : messages, favoris, recherches, statistiques de vues"
      ]
    },
    {
      icon: Eye,
      title: "2. Utilisation des Données",
      content: [
        "Fournir et améliorer nos services de marketplace",
        "Vérifier l'identité des utilisateurs et prévenir la fraude",
        "Faciliter la communication entre acheteurs et vendeurs",
        "Envoyer des notifications importantes et mises à jour"
      ]
    },
    {
      icon: Users,
      title: "3. Partage des Données",
      content: [
        "Vos annonces sont publiques et visibles par tous les visiteurs",
        "Vos coordonnées de contact sont partagées avec les acheteurs intéressés",
        "Nous ne vendons jamais vos données à des tiers",
        "Partage légal uniquement si requis par les autorités sénégalaises"
      ]
    },
    {
      icon: Lock,
      title: "4. Sécurité et Conservation",
      content: [
        "Chiffrement des données sensibles (mots de passe, paiements)",
        "Serveurs sécurisés avec sauvegarde régulière au Sénégal",
        "Accès limité aux données par notre équipe technique certifiée",
        "Conservation pendant la durée d'activité du compte + 3 ans"
      ]
    },
    {
      icon: Settings,
      title: "5. Vos Droits",
      content: [
        "Droit d'accès : consulter toutes vos données personnelles",
        "Droit de rectification : corriger vos informations inexactes",
        "Droit à l'effacement : supprimer définitivement vos données",
        "Droit à la portabilité : récupérer vos données dans un format standard"
      ]
    },
    {
      icon: Globe,
      title: "6. Cookies et Tracking",
      content: [
        "Cookies essentiels pour le fonctionnement du site",
        "Cookies analytiques pour améliorer l'expérience utilisateur",
        "Pas de cookies publicitaires tiers sans votre consentement",
        "Vous pouvez gérer vos préférences dans les paramètres"
      ]
    }
  ];

  const dataTypes = [
    { 
      category: "Données obligatoires", 
      items: ["Nom et prénom", "Numéro de téléphone", "Région"], 
      required: true,
      color: "coral"
    },
    { 
      category: "Données optionnelles", 
      items: ["Email", "Photo de profil", "Préférences"], 
      required: false,
      color: "emerald"
    },
    { 
      category: "Données automatiques", 
      items: ["Adresse IP", "Cookies", "Logs de connexion"], 
      required: false,
      color: "sand"
    }
  ];

  const rights = [
    {
      right: "Droit d'accès",
      description: "Demandez une copie de toutes vos données",
      action: "Télécharger mes données"
    },
    {
      right: "Droit de rectification", 
      description: "Corrigez vos informations personnelles",
      action: "Modifier mon profil"
    },
    {
      right: "Droit à l'effacement",
      description: "Supprimez définitivement votre compte",
      action: "Supprimer mon compte"
    },
    {
      right: "Droit d'opposition",
      description: "Opposez-vous au traitement de vos données",
      action: "Gérer mes préférences"
    }
  ];

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-ocean-50 via-ocean-100/30 to-sand-50/30">
        {/* Header */}
        <section className="bg-gradient-to-r from-ocean-200 via-ocean-300 to-ocean-400 text-ocean-800 py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-white/80 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-ocean-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-ocean-800">
                Politique de Confidentialité
              </h1>
              <p className="text-xl text-ocean-700 mb-8">
                Votre vie privée est notre priorité • Dernière mise à jour : 27 juin 2025
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour à l'accueil
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-12"
              >
                <h2 className="text-2xl font-bold text-ocean-700 mb-4">Notre Engagement</h2>
                <p className="text-ocean-600 leading-relaxed mb-4">
                  Chez SenMarket, nous respectons votre vie privée et nous nous engageons à protéger 
                  vos données personnelles. Cette politique explique comment nous collectons, 
                  utilisons et protégeons vos informations.
                </p>
                <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-ocean-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-ocean-800 font-medium mb-1">Transparence totale</p>
                      <p className="text-sm text-ocean-700">
                        Nous croyons en la transparence. Vos données vous appartiennent et vous 
                        avez le contrôle total sur leur utilisation.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Types de données */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <h2 className="text-2xl font-bold text-ocean-700 mb-6 text-center">
                  Types de Données Collectées
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dataTypes.map((type, index) => (
                    <div
                      key={type.category}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50"
                    >
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4 ${
                        type.required 
                          ? 'bg-coral-100 text-coral-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {type.required ? 'Obligatoire' : 'Optionnel'}
                      </div>
                      <h3 className="font-bold text-ocean-900 mb-3">{type.category}</h3>
                      <ul className="space-y-2">
                        {type.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center gap-2 text-sm text-ocean-700">
                            <CheckCircle className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sections principales */}
              <div className="space-y-8 mb-12">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-ocean-300 to-ocean-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-ocean-900 mb-2">{section.title}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-4 w-4 text-emerald-500 mt-1 flex-shrink-0" />
                          <p className="text-ocean-700 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Vos droits en action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-gradient-to-br from-sand-50 to-emerald-50 rounded-2xl p-8 shadow-xl border border-sand-200 mb-12"
              >
                <h2 className="text-2xl font-bold text-ocean-700 mb-6">Exercer Vos Droits</h2>
                <p className="text-ocean-600 mb-6">
                  Vous pouvez exercer vos droits à tout moment. Nous nous engageons à répondre dans les 30 jours.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {rights.map((right, index) => (
                    <div key={right.right} className="bg-white/80 rounded-xl p-4 border border-emerald-200">
                      <h3 className="font-medium text-ocean-900 mb-2">{right.right}</h3>
                      <p className="text-sm text-ocean-600 mb-3">{right.description}</p>
                      <button className="text-sm bg-ocean-100 hover:bg-ocean-200 text-ocean-700 px-3 py-1 rounded-lg transition-colors">
                        {right.action}
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-ocean-400 to-ocean-500 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    Gérer mes données
                  </Link>
                  <Link 
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white border border-ocean-200 text-ocean-700 rounded-xl hover:bg-ocean-50 transition-colors font-medium"
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
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-12"
              >
                <h2 className="text-xl font-bold text-ocean-900 mb-4">Cookies et Technologies de Suivi</h2>
                <div className="space-y-4">
                  <p className="text-ocean-600 leading-relaxed">
                    Nous utilisons des cookies pour améliorer votre expérience sur SenMarket :
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-ocean-50 rounded-xl p-4 border border-ocean-200">
                      <h4 className="font-medium text-ocean-900 mb-2">🍪 Cookies Essentiels</h4>
                      <p className="text-sm text-ocean-700">
                        Nécessaires au fonctionnement du site (connexion, panier, sécurité)
                      </p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                      <h4 className="font-medium text-emerald-900 mb-2">📊 Cookies Analytiques</h4>
                      <p className="text-sm text-emerald-700">
                        Nous aident à comprendre comment vous utilisez le site pour l'améliorer
                      </p>
                    </div>
                  </div>

                  <div className="bg-sand-50 rounded-xl p-4 border border-sand-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Settings className="h-4 w-4 text-sand-600" />
                      <h4 className="font-medium text-sand-900">Gestion des Cookies</h4>
                    </div>
                    <p className="text-sm text-sand-700 mb-3">
                      Vous pouvez accepter ou refuser les cookies non-essentiels à tout moment.
                    </p>
                    <button className="bg-sand-200 hover:bg-sand-300 text-sand-800 px-4 py-2 rounded-lg text-sm transition-colors">
                      Gérer mes préférences
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Contact et mise à jour */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-r from-coral-50 to-sand-50 rounded-2xl p-8 shadow-xl border border-coral-200"
              >
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Mail className="h-6 w-6 text-coral-600" />
                    <h3 className="text-xl font-bold text-coral-900">Questions sur vos données ?</h3>
                  </div>
                  <p className="text-coral-700 mb-6">
                    Notre équipe est disponible pour répondre à toutes vos questions sur la confidentialité.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href="mailto:privacy@senmarket.sn"
                      className="inline-flex items-center gap-2 bg-coral-100 hover:bg-coral-200 text-coral-800 px-6 py-3 rounded-xl transition-colors font-medium"
                    >
                      <Mail className="h-4 w-4" />
                      privacy@senmarket.sn
                    </a>
                    <Link 
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-white border border-coral-200 text-coral-700 px-6 py-3 rounded-xl hover:bg-coral-50 transition-colors font-medium"
                    >
                      Formulaire de contact
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Mise à jour */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="text-center mt-12 text-ocean-600"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-4 w-4" />
                  <p className="text-sm font-medium">Dernière mise à jour</p>
                </div>
                <p className="text-sm">
                  Cette politique peut être mise à jour. La date de dernière modification 
                  est indiquée en haut de cette page.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}