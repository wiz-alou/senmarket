'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "contact@senmarket.sn",
      description: "Réponse sous 24h",
      color: "blue"
    },
    {
      icon: Phone,
      title: "Téléphone",
      value: "+221 77 708 07 57",
      description: "Lun-Ven 9h-18h",
      color: "green"
    },
    {
      icon: MessageSquare,
      title: "WhatsApp",
      value: "+221 77 708 07 57",
      description: "Assistance rapide",
      color: "green"
    },
    {
      icon: MapPin,
      title: "Adresse",
      value: "Dakar, Sénégal",
      description: "Rendez-vous sur demande",
      color: "purple"
    }
  ]

  const subjects = [
    "Support technique",
    "Question commerciale", 
    "Demande de remboursement",
    "Problème avec une annonce",
    "Suggestion d'amélioration",
    "Partenariat",
    "Autre"
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulation d'envoi (remplacer par vraie API)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
      toast.success('Message envoyé avec succès !', {
        description: 'Nous vous répondrons dans les 24 heures.'
      })
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      toast.error('Erreur lors de l\'envoi', {
        description: 'Veuillez réessayer ou nous contacter directement.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-slate-50">
        {/* Header - Même palette que les autres pages */}
        <section className="bg-slate-900 text-white py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-16 h-16 bg-slate-800 rounded-xl flex items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Contactez-nous
              </h1>
              <p className="text-xl text-slate-300 mb-8">
                Une question ? Un problème ? Notre équipe est là pour vous aider !
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

        {/* Contenu principal */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Informations de contact */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Nos Coordonnées</h2>
                    <p className="text-slate-600 leading-relaxed">
                      Notre équipe SenMarket est disponible pour répondre à toutes vos questions 
                      et vous accompagner dans votre expérience sur notre plateforme.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {contactInfo.map((info, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-xl p-6 shadow-lg border border-slate-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            info.color === 'blue' ? 'bg-blue-100' :
                            info.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                          }`}>
                            <info.icon className={`h-6 w-6 ${
                              info.color === 'blue' ? 'text-blue-600' :
                              info.color === 'green' ? 'text-green-600' : 'text-purple-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-slate-900 mb-1">{info.title}</h3>
                            <p className="font-medium text-slate-700 mb-1">{info.value}</p>
                            <p className="text-sm text-slate-500">{info.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Horaires */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-100 rounded-xl p-6 border border-slate-200"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-blue-600" />
                      <h3 className="font-semibold text-slate-900">Horaires d'ouverture</h3>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Lundi - Vendredi</span>
                        <span className="font-medium text-slate-900">9h00 - 18h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Samedi</span>
                        <span className="font-medium text-slate-900">9h00 - 13h00</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Dimanche</span>
                        <span className="font-medium text-slate-900">Fermé</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Formulaire de contact */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {isSubmitted ? (
                    <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4">Message envoyé !</h3>
                      <p className="text-slate-600 mb-6">
                        Merci pour votre message. Notre équipe vous répondra dans les 24 heures.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-slate-900 hover:bg-slate-800 text-white"
                      >
                        Envoyer un autre message
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl p-8 shadow-lg border border-slate-200">
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Envoyez-nous un message</h2>
                      
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Nom complet *
                            </label>
                            <Input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                              className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="Votre nom"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Email *
                            </label>
                            <Input
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                              className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="votre@email.com"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Téléphone
                            </label>
                            <Input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                              placeholder="+221 77 708 07 57"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Sujet *
                            </label>
                            <select
                              name="subject"
                              value={formData.subject}
                              onChange={handleInputChange}
                              required
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Choisir un sujet</option>
                              {subjects.map((subject) => (
                                <option key={subject} value={subject}>
                                  {subject}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Message *
                          </label>
                          <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleInputChange}
                            required
                            rows={6}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            placeholder="Décrivez votre demande en détail..."
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Envoi en cours...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4 mr-2" />
                              Envoyer le message
                            </>
                          )}
                        </Button>
                      </form>

                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-sm text-slate-500 text-center">
                          En envoyant ce formulaire, vous acceptez que nous utilisions vos données 
                          pour vous répondre. Consultez notre{' '}
                          <Link href="/legal/privacy" className="text-blue-600 hover:underline">
                            politique de confidentialité
                          </Link>.
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* FAQ rapide */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-16 bg-white rounded-xl p-8 shadow-lg border border-slate-200"
              >
                <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Questions Fréquentes</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Comment publier une annonce ?</h3>
                      <p className="text-sm text-slate-600">
                        Créez un compte, vérifiez votre numéro et cliquez sur "Publier une annonce". 
                        C'est gratuit pendant la phase de lancement !
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Mes données sont-elles sécurisées ?</h3>
                      <p className="text-sm text-slate-600">
                        Oui, nous utilisons un chiffrement avancé et respectons les standards 
                        internationaux de protection des données.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Comment contacter un vendeur ?</h3>
                      <p className="text-sm text-slate-600">
                        Cliquez sur "Contacter" dans l'annonce pour envoyer un message 
                        ou appeler directement le numéro affiché.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-2">Puis-je modifier mon annonce ?</h3>
                      <p className="text-sm text-slate-600">
                        Oui, connectez-vous à votre tableau de bord pour modifier 
                        ou supprimer vos annonces à tout moment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-slate-500 text-sm">
                    Vous ne trouvez pas la réponse à votre question ? N'hésitez pas à nous contacter !
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}