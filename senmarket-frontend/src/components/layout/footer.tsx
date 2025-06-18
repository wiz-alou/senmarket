'use client'

import React from 'react';
import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Youtube,
  Smartphone,
  Shield,
  Award,
  Clock,
  Globe,
  Download,
  ExternalLink,
  CheckCircle
} from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerSections = {
    marketplace: {
      title: "Marketplace",
      links: [
        { name: "Toutes les Annonces", href: "/listings" },
        { name: "Véhicules", href: "/categories/vehicles" },
        { name: "Immobilier", href: "/categories/real-estate" },
        { name: "Électronique", href: "/categories/electronics" },
        { name: "Mode & Beauté", href: "/categories/fashion" },
        { name: "Services", href: "/categories/services" }
      ]
    },
    vendeurs: {
      title: "Pour les Vendeurs",
      links: [
        { name: "Publier une Annonce", href: "/sell" },
        { name: "Dashboard Vendeur", href: "/dashboard" },
        { name: "Guide du Vendeur", href: "/seller-guide" },
        { name: "Conseils & Astuces", href: "/tips" },
        { name: "Formation Gratuite", href: "/training" },
        { name: "Success Stories", href: "/success-stories" }
      ]
    },
    entreprise: {
      title: "Solutions Entreprise",
      links: [
        { name: "SenMarket Business", href: "/business" },
        { name: "API pour Développeurs", href: "/api" },
        { name: "Intégrations ERP", href: "/integrations" },
        { name: "Comptes Entreprise", href: "/enterprise" },
        { name: "Partenariats", href: "/partnerships" },
        { name: "Solutions sur Mesure", href: "/custom-solutions" }
      ]
    },
    support: {
      title: "Support & Aide",
      links: [
        { name: "Centre d'Aide", href: "/help" },
        { name: "FAQ", href: "/faq" },
        { name: "Sécurité", href: "/security" },
        { name: "Signaler un Problème", href: "/report" },
        { name: "Contact Support", href: "/contact" },
        { name: "Statut des Services", href: "/status", external: true }
      ]
    },
    legal: {
      title: "Légal & Conformité",
      links: [
        { name: "Conditions d'Utilisation", href: "/terms" },
        { name: "Politique de Confidentialité", href: "/privacy" },
        { name: "Conditions de Vente", href: "/sales-terms" },
        { name: "Politique de Remboursement", href: "/refund-policy" },
        { name: "Résolution des Litiges", href: "/dispute-resolution" },
        { name: "Conformité GDPR", href: "/gdpr" }
      ]
    }
  };

  const socialLinks = [
    { 
      name: "Facebook", 
      icon: Facebook, 
      href: "https://facebook.com/senmarket.sn",
      color: "hover:text-blue-500"
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      href: "https://twitter.com/senmarket_sn",
      color: "hover:text-blue-400"
    },
    { 
      name: "Instagram", 
      icon: Instagram, 
      href: "https://instagram.com/senmarket.sn",
      color: "hover:text-pink-500"
    },
    { 
      name: "LinkedIn", 
      icon: Linkedin, 
      href: "https://linkedin.com/company/senmarket",
      color: "hover:text-blue-600"
    },
    { 
      name: "YouTube", 
      icon: Youtube, 
      href: "https://youtube.com/@senmarket",
      color: "hover:text-red-500"
    }
  ];

  const paymentMethods = [
    { name: "Orange Money", logo: "🍊" },
    { name: "Wave", logo: "🌊" },
    { name: "Free Money", logo: "💚" },
    { name: "Visa", logo: "💳" },
    { name: "Mastercard", logo: "💳" }
  ];

  const certifications = [
    { name: "ISO 27001", description: "Sécurité Information" },
    { name: "PCI DSS", description: "Sécurité Paiements" },
    { name: "GDPR", description: "Protection Données" }
  ];

  return (
    <footer className="bg-slate-900 text-white">
      
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        
        {/* Top Section - Brand & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold">S</span>
              </div>
              <div>
                <div className="text-2xl font-bold">SenMarket</div>
                <div className="text-xs text-blue-400 font-medium">MARKETPLACE SÉNÉGAL</div>
              </div>
            </Link>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              La plateforme de commerce électronique #1 au Sénégal. 
              Connectant vendeurs et acheteurs dans tout le pays avec des transactions sécurisées et un service client exceptionnel.
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center text-slate-300">
                <Phone className="h-4 w-4 mr-3 text-blue-400" />
                <span>+221 77 708 07 57</span>
              </div>
              <div className="flex items-center text-slate-300">
                <Mail className="h-4 w-4 mr-3 text-blue-400" />
                <span>contact@senmarket.sn</span>
              </div>
              <div className="flex items-center text-slate-300">
                <MapPin className="h-4 w-4 mr-3 text-blue-400" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center transition-colors ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Stats & Features */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Stats */}
              <div className="bg-slate-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-blue-400 mb-4 flex items-center">
                  <Award className="h-4 w-4 mr-2" />
                  Nos Performances
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-2xl font-bold text-white">50,000+</div>
                    <div className="text-sm text-slate-400">Utilisateurs Actifs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">125,000+</div>
                    <div className="text-sm text-slate-400">Annonces Publiées</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">98.5%</div>
                    <div className="text-sm text-slate-400">Satisfaction Client</div>
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="bg-slate-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-green-400 mb-4 flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Sécurité & Confiance
                </h4>
                <div className="space-y-3">
                  {certifications.map((cert, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-white">{cert.name}</div>
                        <div className="text-xs text-slate-400">{cert.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support */}
              <div className="bg-slate-800/50 rounded-xl p-6">
                <h4 className="font-semibold text-purple-400 mb-4 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Support Client
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-400 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-white">24/7 Disponible</div>
                      <div className="text-xs text-slate-400">Support technique</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-white">&lt; 2h Réponse</div>
                      <div className="text-xs text-slate-400">Temps moyen</div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-white">99% Résolution</div>
                      <div className="text-xs text-slate-400">Premier contact</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Links Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-blue-400 transition-colors text-sm flex items-center"
                    >
                      {link.name}
                      {link.external && <ExternalLink className="h-3 w-3 ml-1" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* App Download & Payment Methods */}
        <div className="border-t border-slate-700 pt-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* App Download */}
            <div>
              <h4 className="font-semibold text-white mb-4 flex items-center">
                <Smartphone className="h-4 w-4 mr-2" />
                Téléchargez l&apos;Application
              </h4>
              <p className="text-slate-400 text-sm mb-4">
                Gérez vos annonces et achetez en déplacement avec notre app mobile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="#" 
                  className="flex items-center bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 transition-colors"
                >
                  <Download className="h-6 w-6 mr-3" />
                  <div>
                    <div className="text-xs text-slate-400">Télécharger sur</div>
                    <div className="text-white font-medium">Google Play</div>
                  </div>
                </Link>
                <Link 
                  href="#" 
                  className="flex items-center bg-slate-800 hover:bg-slate-700 rounded-lg px-4 py-3 transition-colors"
                >
                  <Download className="h-6 w-6 mr-3" />
                  <div>
                    <div className="text-xs text-slate-400">Télécharger sur</div>
                    <div className="text-white font-medium">App Store</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h4 className="font-semibold text-white mb-4">Méthodes de Paiement Acceptées</h4>
              <p className="text-slate-400 text-sm mb-4">
                Payez en toute sécurité avec vos moyens de paiement préférés.
              </p>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-slate-800 rounded-lg px-3 py-2"
                  >
                    <span className="text-lg mr-2">{method.logo}</span>
                    <span className="text-sm text-slate-300">{method.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-700 bg-slate-950">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            
            {/* Copyright */}
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} SenMarket. Tous droits réservés. 
              <span className="mx-2">•</span>
              Fièrement développé au Sénégal 🇸🇳
            </div>

            {/* Language & Region */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-slate-400 text-sm">
                <Globe className="h-4 w-4 mr-2" />
                <select className="bg-transparent border-none text-slate-400 focus:outline-none">
                  <option>Français (Sénégal)</option>
                  <option>Wolof (Sénégal)</option>
                  <option>English (Senegal)</option>
                </select>
              </div>
              
              <div className="text-slate-400 text-sm">
                FCFA (XOF)
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}