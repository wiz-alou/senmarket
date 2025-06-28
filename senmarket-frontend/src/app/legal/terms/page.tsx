'use client'

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Scale,
  Clock,
  Globe
} from 'lucide-react';

export default function TermsPage() {
  const sections = [
    {
      icon: Users,
      title: "1. Acceptation des Conditions",
      content: [
        "En utilisant SenMarket, vous acceptez ces conditions d'utilisation",
        "Si vous n'acceptez pas ces conditions, n'utilisez pas notre service",
        "Ces conditions s'appliquent à tous les utilisateurs du site",
        "Nous nous réservons le droit de modifier ces conditions à tout moment"
      ]
    },
    {
      icon: Globe,
      title: "2. Description du Service",
      content: [
        "SenMarket est une plateforme de petites annonces au Sénégal",
        "Nous connectons acheteurs et vendeurs dans toutes les régions",
        "Le service inclut la publication, recherche et contact entre utilisateurs",
        "Nous facilitons les transactions mais n'en sommes pas partie prenante"
      ]
    },
    {
      icon: CheckCircle,
      title: "3. Inscription et Compte",
      content: [
        "Vous devez fournir des informations exactes lors de l'inscription",
        "Un numéro de téléphone valide est requis pour la vérification",
        "Vous êtes responsable de la sécurité de votre compte",
        "Un seul compte par personne physique est autorisé"
      ]
    },
    {
      icon: FileText,
      title: "4. Publication d'Annonces",
      content: [
        "Vous devez être propriétaire légal des biens proposés",
        "Les annonces doivent être honnêtes et complètes",
        "Contenu interdit : armes, drogues, contrefaçons, animaux sauvages",
        "Nous nous réservons le droit de supprimer toute annonce non conforme"
      ]
    },
    {
      icon: Scale,
      title: "5. Responsabilités",
      content: [
        "SenMarket agit comme intermédiaire technique uniquement",
        "Nous ne garantissons pas la véracité des annonces",
        "Les transactions se font directement entre acheteurs et vendeurs",
        "Chaque utilisateur est responsable de ses propres actions"
      ]
    },
    {
      icon: Shield,
      title: "6. Règles de Conduite",
      content: [
        "Respectez les autres utilisateurs et la loi sénégalaise",
        "Interdiction de harcèlement, spam ou comportement abusif",
        "Ne publiez pas de contenu offensant ou discriminatoire",
        "Respectez les prix et conditions annoncés par les vendeurs"
      ]
    },
    {
      icon: AlertTriangle,
      title: "7. Sanctions et Suspension",
      content: [
        "Violation des règles : avertissement puis suspension temporaire",
        "Violations graves : suppression immédiate et définitive du compte",
        "Nous nous réservons le droit de suspendre tout compte suspect",
        "Aucun remboursement en cas de suspension pour violation"
      ]
    },
    {
      icon: Info,
      title: "8. Propriété Intellectuelle",
      content: [
        "SenMarket et ses logos sont des marques protégées",
        "Vous conservez les droits sur vos photos et descriptions",
        "En publiant, vous nous accordez le droit d'afficher votre contenu",
        "Respectez les droits d'auteur dans vos publications"
      ]
    }
  ];

  const additionalInfo = [
    {
      title: "Limitation de Responsabilité",
      content: "SenMarket ne peut être tenu responsable des transactions entre utilisateurs, de la qualité des biens vendus, ou des dommages indirects."
    },
    {
      title: "Droit Applicable",
      content: "Ces conditions sont régies par le droit sénégalais. Tout litige sera soumis aux tribunaux compétents de Dakar."
    },
    {
      title: "Force Majeure",
      content: "SenMarket ne saurait être responsable en cas d'impossibilité d'exécution due à des événements de force majeure."
    },
    {
      title: "Divisibilité",
      content: "Si une clause est déclarée nulle, les autres clauses restent applicables dans leur intégralité."
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
                  <FileText className="h-8 w-8 text-ocean-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-ocean-800">
                Conditions d'Utilisation
              </h1>
              <p className="text-xl text-ocean-700 mb-8">
                Règles et conditions pour utiliser SenMarket • Dernière mise à jour : 27 juin 2025
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

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              
              {/* Introduction */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-12"
              >
                <h2 className="text-2xl font-bold text-ocean-700 mb-4">Bienvenue sur SenMarket</h2>
                <p className="text-ocean-600 leading-relaxed mb-4">
                  Ces conditions d'utilisation régissent votre accès et votre utilisation de SenMarket, 
                  la plateforme de petites annonces leader au Sénégal. En utilisant notre service, 
                  vous acceptez d'être lié par ces conditions.
                </p>
                <div className="bg-ocean-50 border border-ocean-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-ocean-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-ocean-800 font-medium mb-1">Important</p>
                      <p className="text-sm text-ocean-700">
                        Ces conditions peuvent évoluer. Nous vous recommandons de les consulter 
                        régulièrement. Votre utilisation continue constitue une acceptation des 
                        modifications.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sections principales */}
              <div className="space-y-8 mb-12">
                {sections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
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

              {/* Informations supplémentaires */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-gradient-to-br from-sand-50 to-coral-50 rounded-2xl p-8 shadow-xl border border-sand-200 mb-12"
              >
                <h2 className="text-2xl font-bold text-sand-700 mb-6">Dispositions Légales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {additionalInfo.map((info, index) => (
                    <div key={info.title} className="bg-white/80 rounded-xl p-6 border border-sand-200">
                      <h3 className="font-bold text-sand-900 mb-3">{info.title}</h3>
                      <p className="text-sm text-sand-700 leading-relaxed">{info.content}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Sanctions et violations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-gradient-to-br from-coral-50 to-sand-50 rounded-2xl p-8 shadow-xl border border-coral-200 mb-12"
              >
                <h2 className="text-2xl font-bold text-coral-700 mb-6">Signalement et Violations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/80 rounded-xl p-6 border border-coral-200">
                    <h3 className="font-bold text-coral-900 mb-3">🚨 Comment signaler ?</h3>
                    <ul className="space-y-2 text-sm text-coral-700">
                      <li>• Email : report@senmarket.sn</li>
                      <li>• Bouton "Signaler" sur chaque annonce</li>
                      <li>• Formulaire de contact détaillé</li>
                      <li>• Réponse garantie sous 48h</li>
                    </ul>
                  </div>
                  <div className="bg-white/80 rounded-xl p-6 border border-coral-200">
                    <h3 className="font-bold text-coral-900 mb-3">⚖️ Types de violations</h3>
                    <ul className="space-y-2 text-sm text-coral-700">
                      <li>• Annonces frauduleuses ou trompeuses</li>
                      <li>• Contenu inapproprié ou illégal</li>
                      <li>• Harcèlement ou comportement abusif</li>
                      <li>• Non-respect des conditions de vente</li>
                    </ul>
                  </div>
                </div>
              </motion.div>

              {/* Contact et actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50 mb-8"
              >
                <h2 className="text-2xl font-bold text-ocean-900 mb-4 text-center">Besoin d'aide ?</h2>
                <p className="text-ocean-600 text-center mb-6">
                  Si vous avez des questions sur ces conditions, notre équipe est à votre disposition.
                  Nous nous engageons à répondre dans les 30 jours.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-ocean-400 to-ocean-500 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    Nous contacter
                  </Link>
                  <Link 
                    href="/legal/privacy"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white border border-ocean-200 text-ocean-700 rounded-xl hover:bg-ocean-50 transition-colors font-medium"
                  >
                    Politique de confidentialité
                  </Link>
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
                  Ces conditions peuvent être mises à jour. La date de dernière modification 
                  est indiquée en haut de cette page.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}