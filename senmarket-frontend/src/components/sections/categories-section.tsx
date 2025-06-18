import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Car, 
  Home, 
  Smartphone, 
  Shirt, 
  Briefcase, 
  Wrench,
  Sofa,
  Heart,
  TrendingUp,
  ArrowRight,
  Building,
  Users
} from 'lucide-react'

export function CategoriesSection() {
  const categories = [
    { 
      id: 'vehicles',
      name: 'Véhicules', 
      icon: Car, 
      count: 1250, 
      trending: true,
      description: 'Voitures, motos, camions et pièces détachées',
      growth: '+15%',
      color: 'blue'
    },
    { 
      id: 'real-estate',
      name: 'Immobilier', 
      icon: Home, 
      count: 890, 
      trending: false,
      description: 'Appartements, villas, terrains et bureaux',
      growth: '+8%',
      color: 'green'
    },
    { 
      id: 'electronics',
      name: 'Électronique', 
      icon: Smartphone, 
      count: 2100, 
      trending: true,
      description: 'Smartphones, ordinateurs, TV et accessoires',
      growth: '+22%',
      color: 'purple'
    },
    { 
      id: 'fashion',
      name: 'Mode & Beauté', 
      icon: Shirt, 
      count: 750, 
      trending: false,
      description: 'Vêtements, chaussures, bijoux et cosmétiques',
      growth: '+5%',
      color: 'pink'
    },
    { 
      id: 'jobs',
      name: 'Emploi', 
      icon: Briefcase, 
      count: 420, 
      trending: true,
      description: 'Offres d\'emploi, stages et freelance',
      growth: '+18%',
      color: 'orange'
    },
    { 
      id: 'services',
      name: 'Services', 
      icon: Wrench, 
      count: 680, 
      trending: false,
      description: 'Réparation, nettoyage, cours et consulting',
      growth: '+12%',
      color: 'cyan'
    },
    { 
      id: 'home-garden',
      name: 'Maison & Jardin', 
      icon: Sofa, 
      count: 340, 
      trending: false,
      description: 'Meubles, décoration et équipements',
      growth: '+7%',
      color: 'amber'
    },
    { 
      id: 'animals',
      name: 'Animaux', 
      icon: Heart, 
      count: 180, 
      trending: false,
      description: 'Chiens, chats, oiseaux et accessoires',
      growth: '+3%',
      color: 'red'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700',
      green: 'bg-green-50 border-green-200 hover:bg-green-100 text-green-700',
      purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100 text-purple-700',
      pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100 text-pink-700',
      orange: 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-orange-700',
      cyan: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100 text-cyan-700',
      amber: 'bg-amber-50 border-amber-200 hover:bg-amber-100 text-amber-700',
      red: 'bg-red-50 border-red-200 hover:bg-red-100 text-red-700',
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      pink: 'text-pink-600',
      orange: 'text-orange-600',
      cyan: 'text-cyan-600',
      amber: 'text-amber-600',
      red: 'text-red-600',
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section className="py-20 lg:py-24 bg-white">
      <div className="container-fluid">
        
        {/* En-tête de section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Building className="h-6 w-6 text-blue-600" />
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Marketplace professionnel
            </Badge>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Explorez nos catégories d'affaires
          </h2>
          
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Découvrez nos 8 catégories principales avec plus de <span className="font-semibold text-blue-600">8,500 annonces vérifiées</span> 
            et une croissance moyenne de <span className="font-semibold text-green-600">+12% par mois</span>
          </p>
        </div>

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="group"
              >
                <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform group-hover:-translate-y-1 group-hover:shadow-xl ${getColorClasses(category.color)}`}>
                  
                  {/* Badge trending */}
                  {category.trending && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-semibold">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Tendance
                      </Badge>
                    </div>
                  )}

                  {/* Icône */}
                  <div className="mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className={`h-6 w-6 ${getIconColorClasses(category.color)}`} />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-900 text-lg">{category.name}</h3>
                      <Badge variant="secondary" className="bg-white/80 text-slate-600 text-xs">
                        {category.count.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {category.description}
                    </p>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">{category.growth}</span>
                        <span className="text-xs text-slate-500">ce mois</span>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Statistiques globales */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Stats */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Performance du marketplace
              </h3>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">8.5K+</div>
                  <div className="text-sm text-slate-600 font-medium">Annonces actives</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">15K+</div>
                  <div className="text-sm text-slate-600 font-medium">Utilisateurs vérifiés</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-1">98%</div>
                  <div className="text-sm text-slate-600 font-medium">Taux de satisfaction</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">24/7</div>
                  <div className="text-sm text-slate-600 font-medium">Support professionnel</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold text-slate-900 mb-3">
                Vous êtes un professionnel ?
              </h4>
              <p className="text-sm text-slate-600 mb-4">
                Accédez à nos outils dédiés aux entreprises
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Users className="h-4 w-4 mr-2" />
                Espace Pro
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}