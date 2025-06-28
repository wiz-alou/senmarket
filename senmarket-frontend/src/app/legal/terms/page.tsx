'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { ArrowLeft, Shield, Users, AlertTriangle, FileText, Scale, CheckCircle } from 'lucide-react'

export default function TermsPage() {
  const sections = [
    {
      icon: FileText,
      title: "1. Objet et Champ d'Application",
      content: [
        "SenMarket est une plateforme de marketplace en ligne permettant aux utilisateurs d'acheter et de vendre des biens et services au Sénégal.",
        "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de la plateforme SenMarket accessible à l'adresse senmarket.sn.",
        "L'utilisation de SenMarket implique l'acceptation pleine et entière des présentes CGU."
      ]
    },
    {
      icon: Users,
      title: "2. Inscription et Compte Utilisateur",
      content: [
        "L'inscription sur SenMarket est gratuite et ouverte à toute personne physique ou morale résidant au Sénégal.",
        "L'utilisateur s'engage à fournir des informations exactes et à les maintenir à jour.",
        "Chaque utilisateur ne peut créer qu'un seul compte personnel.",
        "La vérification par SMS est obligatoire pour valider votre compte."
      ]
    },
    {
      icon: Shield,
      title: "3. Utilisation de la Plateforme",
      content: [
        "SenMarket met à disposition une plateforme permettant aux utilisateurs de publier des annonces et d'entrer en contact.",
        "Les transactions se font directement entre utilisateurs. SenMarket n'est pas partie aux contrats de vente.",
        "Il est interdit de publier du contenu illégal, trompeur ou contraire aux bonnes mœurs.",
        "SenMarket se réserve le droit de modérer et supprimer tout contenu inapproprié."
      ]
    },
    {
      icon: Scale,
      title: "4. Tarification et Paiements",
      content: [
        "Phase de lancement : Publication d'annonces gratuite pendant 90 jours.",
        "Après la phase de lancement : 200 FCFA par annonce publiée.",
        "Les paiements s'effectuent via Orange Money, Wave ou Free Money.",
        "Aucun remboursement n'est accordé pour les annonces publiées, sauf cas exceptionnel."
      ]
    },
    {
      icon: AlertTriangle,
      title: "5. Responsabilités et Obligations",
      content: [
        "SenMarket n'est pas responsable des transactions entre utilisateurs.",
        "Chaque utilisateur est responsable du contenu qu'il publie.",
        "SenMarket ne garantit pas la véracité des informations publiées par les utilisateurs.",
        "L'utilisateur s'engage à respecter la législation sénégalaise en vigueur."
      ]
    },
    {
      icon: CheckCircle,
      title: "6. Protection des Données",
      content: [
        "SenMarket s'engage à protéger les données personnelles conformément à la réglementation sénégalaise.",
        "Les données collectées sont utilisées uniquement dans le cadre du service.",
        "L'utilisateur dispose d'un droit d'accès, de rectification et de suppression de ses données.",
        "Pour plus de détails, consultez notre Politique de Confidentialité."
      ]
    }
  ]

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50">
        {/* Header */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                  <Scale className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Dernière mise à jour : 27 juin 2025
              </p>
              <Link 
                href="/"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
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
                className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 mb-12"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Bienvenue sur SenMarket</h2>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Les présentes Conditions Générales d'Utilisation définissent les termes et conditions 
                  d'utilisation de la plateforme SenMarket, marketplace de référence au Sénégal.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  En utilisant notre service, vous acceptez d'être lié par ces conditions. 
                  Veuillez les lire attentivement.
                </p>
              </motion.div>

              {/* Sections */}
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl p-8 shadow-lg border border-slate-200"
                  >
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <section.icon className="h-6 w-6 text-slate-600" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">{section.title}</h2>
                    </div>
                    
                    <div className="space-y-4">
                      {section.content.map((paragraph, pIndex) => (
                        <p key={pIndex} className="text-slate-600 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Contact */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-slate-100 rounded-xl p-8 border border-slate-200 mt-12"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-4">Questions ?</h2>
                <p className="text-slate-600 mb-4">
                  Pour toute question concernant ces conditions d'utilisation, 
                  n'hésitez pas à nous contacter.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link 
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl hover:shadow-lg transition-shadow font-medium"
                  >
                    Nous contacter
                  </Link>
                  <Link 
                    href="/legal/privacy"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                  >
                    Politique de confidentialité
                  </Link>
                </div>
              </motion.div>

              {/* Mise à jour */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-center mt-12 text-slate-500"
              >
                <p className="text-sm">
                  Ces conditions peuvent être mises à jour. La date de dernière modification 
                  est indiquée en haut de cette page.
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