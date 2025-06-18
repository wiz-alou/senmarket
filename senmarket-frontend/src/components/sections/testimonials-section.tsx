'use client'

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  Briefcase,
  ShoppingBag,
  CheckCircle
} from 'lucide-react';

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: "Amadou Diallo",
      role: "Entrepreneur",
      location: "Dakar",
      category: "Électronique",
      avatar: "🧑‍💼",
      rating: 5,
      content: "Grâce à SenMarket, j'ai pu développer mon business d'importation de smartphones. Les paiements Orange Money sont instantanés et sécurisés. En 6 mois, j'ai vendu plus de 200 téléphones !",
      sales: "200+ ventes",
      revenue: "2.5M FCFA",
      verified: true
    },
    {
      id: 2,
      name: "Aïssatou Mboup",
      role: "Styliste",
      location: "Thiès",
      category: "Mode & Beauté",
      avatar: "👩‍🎨",
      rating: 5,
      content: "Ma boutique de mode traditionnelle a explosé depuis que je vends sur SenMarket. La qualité du service client et la simplicité de publication des annonces m'ont conquise. Mes clientes me trouvent facilement !",
      sales: "150+ ventes",
      revenue: "1.8M FCFA",
      verified: true
    },
    {
      id: 3,
      name: "Ousmane Sarr",
      role: "Mécanicien",
      location: "Saint-Louis",
      category: "Véhicules",
      avatar: "🔧",
      rating: 5,
      content: "J'achète et revends des pièces auto sur SenMarket. La vérification des vendeurs me rassure totalement. J'ai même trouvé des fournisseurs fiables dans d'autres régions du Sénégal.",
      sales: "80+ achats",
      revenue: "1.2M FCFA",
      verified: true
    },
    {
      id: 4,
      name: "Fatou Sow",
      role: "Agent Immobilier",
      location: "Mbour",
      category: "Immobilier",
      avatar: "🏘️",
      rating: 5,
      content: "SenMarket m'a permis de digitaliser mon agence immobilière. Les photos haute qualité et la géolocalisation attirent plus de clients. J'ai vendu 3 villas en 2 mois !",
      sales: "15+ propriétés",
      revenue: "5.2M FCFA",
      verified: true
    },
    {
      id: 5,
      name: "Ibrahima Kane",
      role: "Éleveur",
      location: "Kaolack",
      category: "Animaux",
      avatar: "🐄",
      rating: 5,
      content: "Vendre mes bovins n'a jamais été aussi simple. Les acheteurs viennent de tout le Sénégal grâce à SenMarket. Le système de contact direct fonctionne parfaitement.",
      sales: "50+ animaux",
      revenue: "3.5M FCFA",
      verified: true
    },
    {
      id: 6,
      name: "Mariama Diop",
      role: "Cuisinière",
      location: "Ziguinchor",
      category: "Services",
      avatar: "👩‍🍳",
      rating: 5,
      content: "Mon service de restauration à domicile a décollé avec SenMarket. Les clients peuvent voir mes plats en photos et me contacter directement. C'est révolutionnaire pour les TPE !",
      sales: "300+ commandes",
      revenue: "900K FCFA",
      verified: true
    }
  ];

  const stats = [
    { label: "Satisfaction Client", value: "98.5%", icon: Star },
    { label: "Temps de Réponse", value: "<2h", icon: CheckCircle },
    { label: "Résolution Problèmes", value: "24h", icon: CheckCircle },
    { label: "Recommandation", value: "96%", icon: Star }
  ];

  // Auto-rotation des témoignages
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-6">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Ce que disent nos
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Clients</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Découvrez les success stories de entrepreneurs sénégalais qui ont transformé leur business avec SenMarket
          </p>
        </motion.div>

        {/* Statistiques de Satisfaction */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <stat.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Témoignage Principal */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
              
              {/* Contenu du témoignage */}
              <div className="p-12 flex flex-col justify-center">
                <motion.div
                  key={currentTestimonial.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Quote Icon */}
                  <Quote className="h-12 w-12 text-blue-600 mb-6" />
                  
                  {/* Contenu */}
                  <blockquote className="text-lg text-slate-700 leading-relaxed mb-8">
                    "{currentTestimonial.content}"
                  </blockquote>
                  
                  {/* Métriques */}
                  <div className="flex gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{currentTestimonial.sales}</div>
                      <div className="text-sm text-slate-500">Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{currentTestimonial.revenue}</div>
                      <div className="text-sm text-slate-500">Chiffre d'affaires</div>
                    </div>
                  </div>
                  
                  {/* Auteur */}
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl mr-4">
                      {currentTestimonial.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{currentTestimonial.name}</h4>
                        {currentTestimonial.verified && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="flex items-center text-sm text-slate-600 gap-4">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {currentTestimonial.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {currentTestimonial.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingBag className="h-3 w-3" />
                          {currentTestimonial.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center mt-4">
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </motion.div>
              </div>
              
              {/* Illustration */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center relative overflow-hidden">
                <motion.div
                  key={currentTestimonial.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-9xl"
                >
                  {currentTestimonial.avatar}
                </motion.div>
                
                {/* Décoration */}
                <div className="absolute top-6 right-6 w-20 h-20 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute bottom-6 left-6 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                <div className="absolute top-1/2 left-6 w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={prevTestimonial}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </button>

            {/* Indicateurs */}
            <div className="flex space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex 
                      ? 'bg-blue-600 w-8' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </motion.div>

        {/* Témoignages Secondaires */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {testimonials.slice(0, 3).map((testimonial, index) => (
            <div key={testimonial.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg mr-3">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-slate-600">{testimonial.role} • {testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-sm text-slate-700 leading-relaxed">
                "{testimonial.content.substring(0, 120)}..."
              </p>
              
              <div className="flex justify-between mt-4 text-xs text-slate-500">
                <span>{testimonial.sales}</span>
                <span className="text-green-600 font-medium">{testimonial.revenue}</span>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}