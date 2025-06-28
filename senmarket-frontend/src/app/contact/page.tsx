'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MapPin, 
  MessageCircle,
  Clock,
  CheckCircle,
  Send,
  Smartphone,
  Users,
  Shield,
  Heart
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simuler l'envoi
    setIsSubmitted(true);
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Téléphone",
      details: "+221 33 xxx xx xx",
      description: "Lundi à Vendredi, 8h-18h",
      action: "Appeler maintenant",
      color: "ocean"
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: "+221 77 xxx xx xx", 
      description: "Réponse rapide 24h/7j",
      action: "Envoyer un message",
      color: "emerald"
    },
    {
      icon: Mail,
      title: "Email",
      details: "contact@senmarket.sn",
      description: "Réponse sous 24h",
      action: "Envoyer un email",
      color: "sand"
    },
    {
      icon: MapPin,
      title: "Adresse",
      details: "Dakar, Sénégal",
      description: "Plateau, Avenue Léopold Sédar Senghor",
      action: "Voir sur la carte",
      color: "coral"
    }
  ];

  const reasons = [
    { icon: Users, title: "Support utilisateur", desc: "Questions sur votre compte ou l'utilisation" },
    { icon: Shield, title: "Sécurité", desc: "Signaler un problème de sécurité ou une fraude" },
    { icon: Heart, title: "Partenariat", desc: "Propositions de collaboration commerciale" },
    { icon: Smartphone, title: "Technique", desc: "Problèmes techniques ou bugs" }
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
                  <MessageCircle className="h-8 w-8 text-ocean-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-ocean-800">
                Contactez-nous
              </h1>
              <p className="text-xl text-ocean-700 mb-8">
                Notre équipe est là pour vous aider • Réponse rapide garantie
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

        {/* Méthodes de Contact */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-ocean-700 mb-4">
                  Plusieurs façons de nous joindre
                </h2>
                <p className="text-ocean-600 text-lg">
                  Choisissez le moyen qui vous convient le mieux
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                {contactMethods.map((method, index) => (
                  <motion.div
                    key={method.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${method.color}-400 to-${method.color}-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <method.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-bold text-ocean-900 mb-2">{method.title}</h3>
                    <p className="font-semibold text-ocean-700 mb-1">{method.details}</p>
                    <p className="text-sm text-ocean-600 mb-4">{method.description}</p>
                    <button className={`w-full btn-${method.color} text-sm py-2 px-4 rounded-lg`}>
                      {method.action}
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Formulaire de Contact */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Formulaire */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50"
                >
                  <h3 className="text-2xl font-bold text-ocean-700 mb-6">
                    Envoyez-nous un message
                  </h3>

                  {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-ocean-900 mb-2">
                            Nom complet *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-ocean-900 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            required
                            className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-ocean-900 mb-2">
                          Téléphone
                        </label>
                        <input
                          type="tel"
                          className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-ocean-900 mb-2">
                          Type de demande
                        </label>
                        <select
                          className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50"
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                        >
                          <option value="general">Question générale</option>
                          <option value="support">Support technique</option>
                          <option value="business">Partenariat</option>
                          <option value="security">Problème de sécurité</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-ocean-900 mb-2">
                          Sujet *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-ocean-900 mb-2">
                          Message *
                        </label>
                        <textarea
                          required
                          rows={5}
                          className="w-full px-4 py-3 border border-ocean-200 rounded-xl focus:ring-2 focus:ring-ocean-500 focus:border-transparent bg-white/50"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full btn-ocean flex items-center justify-center gap-2"
                      >
                        <Send className="h-5 w-5" />
                        Envoyer le message
                      </button>

                      <p className="text-sm text-ocean-600 text-center">
                        En envoyant ce message, vous acceptez notre{' '}
                        <Link href="/legal/privacy" className="text-ocean-700 hover:underline font-medium">
                          politique de confidentialité
                        </Link>.
                      </p>
                    </form>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-emerald-600" />
                      </div>
                      <h4 className="text-xl font-bold text-ocean-900 mb-2">Message envoyé !</h4>
                      <p className="text-ocean-600 mb-6">
                        Nous avons bien reçu votre message et vous répondrons dans les 24h.
                      </p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="btn-ocean"
                      >
                        Envoyer un autre message
                      </button>
                    </div>
                  )}
                </motion.div>

                {/* Info supplémentaires */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-8"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/50">
                    <h4 className="font-bold text-ocean-900 mb-4">Pourquoi nous contacter ?</h4>
                    <div className="space-y-4">
                      {reasons.map((reason, index) => (
                        <div key={reason.title} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-ocean-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <reason.icon className="h-4 w-4 text-ocean-600" />
                          </div>
                          <div>
                            <h5 className="font-medium text-ocean-900">{reason.title}</h5>
                            <p className="text-sm text-ocean-600">{reason.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-sand-50 to-coral-50 rounded-2xl p-6 border border-sand-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Clock className="h-6 w-6 text-sand-600" />
                      <h4 className="font-bold text-sand-900">Nos horaires</h4>
                    </div>
                    <div className="space-y-2 text-sm text-sand-700">
                      <p><strong>Lundi - Vendredi :</strong> 8h00 - 18h00</p>
                      <p><strong>Samedi :</strong> 9h00 - 16h00</p>
                      <p><strong>Dimanche :</strong> Support WhatsApp uniquement</p>
                      <p className="text-xs text-sand-600 mt-3">
                        * Fuseau horaire : GMT (heure de Dakar)
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ rapide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="container mx-auto px-6 pb-16"
        >
          <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/50">
            <h2 className="text-2xl font-bold text-ocean-700 mb-6 text-center">Questions Fréquentes</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-ocean-900 mb-2">Comment publier une annonce ?</h3>
                  <p className="text-sm text-ocean-600">
                    Créez un compte, vérifiez votre numéro et cliquez sur "Publier une annonce". 
                    C'est gratuit pendant la phase de lancement !
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-ocean-900 mb-2">Mes données sont-elles sécurisées ?</h3>
                  <p className="text-sm text-ocean-600">
                    Oui, nous utilisons un chiffrement avancé et respectons les standards 
                    internationaux de protection des données.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-ocean-900 mb-2">Comment contacter un vendeur ?</h3>
                  <p className="text-sm text-ocean-600">
                    Cliquez sur "Contacter" dans l'annonce pour envoyer un message 
                    ou appeler directement le numéro affiché.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-ocean-900 mb-2">Puis-je modifier mon annonce ?</h3>
                  <p className="text-sm text-ocean-600">
                    Oui, connectez-vous à votre tableau de bord pour modifier 
                    ou supprimer vos annonces à tout moment.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <p className="text-ocean-600 text-sm">
                Vous ne trouvez pas la réponse à votre question ? N'hésitez pas à nous contacter !
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}