// ================================================
// PAGE DES ANNONCES - src/app/listings/page.tsx
// SenMarket - Toutes les annonces avec filtres 📝
// ================================================

import { Metadata } from 'next'
import { Suspense } from 'react'
import { ListingGrid } from '@/components/listings/listing-grid'
import { ListingFilters } from '@/components/listings/listing-filters'
import { ListingSearch } from '@/components/listings/listing-search'
import { ListingSorting } from '@/components/listings/listing-sorting'
import { LoadingSpinner } from '@/components/common/loading-spinner'
import { Button } from '@/components/ui/button'
import { PlusIcon, FilterIcon, GridIcon, ListIcon } from 'lucide-react'
import Link from 'next/link'

// === TYPES POUR LES PROPS DE RECHERCHE ===
interface ListingsPageProps {
  searchParams: {
    category?: string
    region?: string
    search?: string
    min_price?: string
    max_price?: string
    sort?: string
    page?: string
    view?: 'grid' | 'list'
  }
}

// === METADATA DYNAMIQUE ===
export async function generateMetadata({ searchParams }: ListingsPageProps): Promise<Metadata> {
  const { category, region, search } = searchParams
  
  let title = 'Toutes les Annonces | SenMarket'
  let description = 'Découvrez des milliers d\'annonces vérifiées sur SenMarket. Voitures, immobilier, emploi, électronique et plus encore.'
  
  if (search) {
    title = `Recherche: ${search} | SenMarket`
    description = `Résultats de recherche pour "${search}" sur SenMarket. Trouvez ce que vous cherchez parmi nos annonces vérifiées.`
  } else if (category) {
    title = `Annonces ${category} | SenMarket`
    description = `Explorez toutes les annonces de la catégorie ${category} sur SenMarket.`
  } else if (region) {
    title = `Annonces à ${region} | SenMarket`
    description = `Découvrez les meilleures annonces disponibles à ${region} sur SenMarket.`
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ['/og-listings.jpg'],
    },
    alternates: {
      canonical: '/listings',
    }
  }
}

// === COMPOSANT PRINCIPAL ===
export default function ListingsPage({ searchParams }: ListingsPageProps) {
  const {
    category,
    region,
    search,
    min_price,
    max_price,
    sort = 'date',
    page = '1',
    view = 'grid'
  } = searchParams

  // Construire le titre dynamique
  const getPageTitle = () => {
    if (search) return `Résultats pour "${search}"`
    if (category) return `Annonces ${category}`
    if (region) return `Annonces à ${region}`
    return 'Toutes les Annonces'
  }

  const getPageSubtitle = () => {
    if (search) return 'Trouvez exactement ce que vous cherchez'
    if (category || region) return 'Découvrez les meilleures offres'
    return 'Plus de 150,000 annonces vérifiées vous attendent'
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* === HERO SECTION === */}
      <section className="bg-gradient-ocean text-white py-12">
        <div className="container-fluid">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Titre et description */}
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold mb-3">
                {getPageTitle()}
              </h1>
              <p className="text-lg opacity-90 mb-6 lg:mb-0">
                {getPageSubtitle()}
              </p>
            </div>

            {/* Bouton publier annonce */}
            <div className="lg:flex-shrink-0">
              <Link href="/listings/create">
                <Button 
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 font-semibold w-full lg:w-auto"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Publier une Annonce
                </Button>
              </Link>
            </div>
          </div>

          {/* Barre de recherche principale */}
          <div className="mt-8">
            <Suspense fallback={
              <div className="h-14 bg-white/20 rounded-xl animate-pulse" />
            }>
              <ListingSearch 
                defaultValue={search}
                placeholder="Rechercher des annonces..."
                className="bg-white text-slate-900"
              />
            </Suspense>
          </div>
        </div>
      </section>

      {/* === CONTENU PRINCIPAL === */}
      <section className="py-8">
        <div className="container-fluid">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* === SIDEBAR FILTRES === */}
            <aside className="lg:w-80 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 border-b border-slate-200">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <FilterIcon className="w-5 h-5 text-primary" />
                    Filtrer les Résultats
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Affinez votre recherche
                  </p>
                </div>
                
                <div className="p-6">
                  <Suspense fallback={
                    <div className="space-y-6">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                          <div className="h-4 bg-slate-200 rounded animate-pulse" />
                          <div className="h-10 bg-slate-200 rounded animate-pulse" />
                        </div>
                      ))}
                    </div>
                  }>
                    <ListingFilters
                      defaultValues={{
                        category,
                        region,
                        min_price,
                        max_price,
                      }}
                    />
                  </Suspense>
                </div>
              </div>

              {/* Bannière promotion */}
              <div className="bg-gradient-atlantic text-white rounded-2xl p-6 text-center">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold mb-2">Publiez votre annonce</h3>
                <p className="text-sm opacity-90 mb-4">
                  Seulement 200 FCFA pour 30 jours de visibilité
                </p>
                <Link href="/listings/create">
                  <Button 
                    size="sm" 
                    className="bg-white text-teal-600 hover:bg-white/90"
                  >
                    Commencer
                  </Button>
                </Link>
              </div>
            </aside>

            {/* === CONTENU PRINCIPAL === */}
            <main className="flex-1">
              {/* Barre d'outils */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  
                  {/* Compteur de résultats */}
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      <Suspense fallback="Chargement...">
                        <span className="font-medium text-foreground">1,247</span> annonces trouvées
                      </Suspense>
                    </div>
                    
                    {/* Filtres actifs */}
                    {(category || region || search) && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Filtres:</span>
                        {search && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                            "{search}"
                            <button className="hover:bg-primary/20 rounded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}
                        {category && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-md">
                            {category}
                            <button className="hover:bg-teal-200 rounded">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Contrôles d'affichage */}
                  <div className="flex items-center gap-4">
                    {/* Tri */}
                    <Suspense fallback={
                      <div className="h-10 w-32 bg-slate-200 rounded animate-pulse" />
                    }>
                      <ListingSorting defaultValue={sort} />
                    </Suspense>

                    {/* Vue grid/list */}
                    <div className="flex items-center border border-slate-200 rounded-lg p-1">
                      <button
                        className={`p-2 rounded ${
                          view === 'grid' 
                            ? 'bg-primary text-white' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Vue grille"
                      >
                        <GridIcon className="w-4 h-4" />
                      </button>
                      <button
                        className={`p-2 rounded ${
                          view === 'list' 
                            ? 'bg-primary text-white' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Vue liste"
                      >
                        <ListIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grille/Liste des annonces */}
              <Suspense fallback={
                <div className={`grid gap-6 ${
                  view === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-80 bg-slate-200 rounded-2xl animate-pulse" />
                  ))}
                </div>
              }>
                <ListingGrid
                  filters={{
                    category,
                    region,
                    search,
                    min_price,
                    max_price,
                    sort,
                    page: parseInt(page),
                  }}
                  viewMode={view}
                />
              </Suspense>

              {/* Message si aucun résultat */}
              <div className="text-center py-12 hidden" id="no-results">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">Aucune annonce trouvée</h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos critères de recherche ou explorez d'autres catégories.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline">
                    Effacer les filtres
                  </Button>
                  <Link href="/listings/create">
                    <Button>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Créer la première annonce
                    </Button>
                  </Link>
                </div>
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* === SECTION CTA === */}
      <section className="py-16 bg-gradient-to-br from-blue-900 to-teal-900 text-white">
        <div className="container-fluid text-center">
          <h2 className="text-3xl font-bold mb-4">
            Vous ne trouvez pas ce que vous cherchez ?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Publiez une annonce gratuite et laissez les vendeurs vous contacter directement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/listings/create">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-white/90">
                <PlusIcon className="w-5 h-5 mr-2" />
                Publier une Annonce
              </Button>
            </Link>
            <Link href="/wanted">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Créer une Demande
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}