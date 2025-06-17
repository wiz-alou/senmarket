// app/page.tsx - Version Ultra-Professionnelle
'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  // Effet de scroll pour le header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Slider automatique pour les témoignages
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const categories = [
    { id: 'all', name: 'Toutes catégories', icon: '🎯', count: '15,420+' },
    { id: 'vehicles', name: 'Véhicules', icon: '🚗', count: '3,285' },
    { id: 'real-estate', name: 'Immobilier', icon: '🏠', count: '2,150' },
    { id: 'electronics', name: 'Électronique', icon: '📱', count: '4,680' },
    { id: 'fashion', name: 'Mode & Beauté', icon: '👗', count: '2,890' },
    { id: 'services', name: 'Services', icon: '🔧', count: '1,560' },
  ]

  const featuredListings = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max 256GB - État Neuf',
      price: 950000,
      originalPrice: 1200000,
      location: 'Dakar - Plateau',
      image: '📱',
      category: 'Électronique',
      featured: true,
      verified: true,
      views: 2845,
      likes: 186,
      timeAgo: '2h',
      seller: { name: 'Boutique TechSen', rating: 4.9, sales: 245 }
    },
    {
      id: 2,
      title: 'Toyota Prado 2022 - Automatique, Cuir',
      price: 28500000,
      location: 'Dakar - Almadies',
      image: '🚗',
      category: 'Véhicules',
      featured: true,
      verified: true,
      views: 1892,
      likes: 124,
      timeAgo: '4h',
      seller: { name: 'AutoSen Premium', rating: 4.8, sales: 89 }
    },
    {
      id: 3,
      title: 'Villa Moderne 5 Chambres avec Piscine',
      price: 125000000,
      location: 'Dakar - Point E',
      image: '🏠',
      category: 'Immobilier',
      featured: true,
      verified: true,
      views: 3241,
      likes: 298,
      timeAgo: '1h',
      seller: { name: 'ImmoLux Sénégal', rating: 5.0, sales: 67 }
    },
    {
      id: 4,
      title: 'MacBook Pro M3 16" - Encore sous garantie',
      price: 1850000,
      originalPrice: 2200000,
      location: 'Dakar - Mermoz',
      image: '💻',
      category: 'Électronique',
      featured: false,
      verified: true,
      views: 892,
      likes: 67,
      timeAgo: '6h',
      seller: { name: 'TechPro Dakar', rating: 4.7, sales: 156 }
    }
  ]

  const testimonials = [
    {
      name: 'Aminata Diallo',
      location: 'Dakar',
      text: 'J\'ai vendu ma voiture en 2 jours ! Interface très simple et professionnelle.',
      rating: 5,
      avatar: '👩🏾'
    },
    {
      name: 'Mamadou Sarr',
      location: 'Thiès',
      text: 'Meilleur marketplace du Sénégal. Paiement sécurisé avec Orange Money.',
      rating: 5,
      avatar: '👨🏾'
    },
    {
      name: 'Fatou Ndiaye',
      location: 'Saint-Louis',
      text: 'Service client excellent. J\'ai trouvé exactement ce que je cherchais.',
      rating: 5,
      avatar: '👩🏾'
    }
  ]

  const stats = [
    { value: '15,420+', label: 'Annonces actives', icon: '📈' },
    { value: '8,750+', label: 'Utilisateurs vérifiés', icon: '✅' },
    { value: '3,280+', label: 'Ventes réussies', icon: '🎯' },
    { value: '14', label: 'Régions couvertes', icon: '🗺️' },
    { value: '4.9/5', label: 'Satisfaction client', icon: '⭐' },
    { value: '24/7', label: 'Support disponible', icon: '🛟' }
  ]

  return (
    <div className="page">
      {/* Header Ultra-Professionnel */}
      <header className={`header ${isScrolled ? 'header-scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            {/* Logo Premium */}
            <div className="logo-premium">
              <div className="logo-icon-premium">
                <div className="logo-inner">🇸🇳</div>
              </div>
              <div className="logo-text-premium">
                <div className="brand-name">
                  Sen<span className="brand-highlight">Market</span>
                </div>
                <div className="brand-tagline">Marketplace Premium</div>
              </div>
            </div>

            {/* Navigation principale */}
            <nav className="main-nav">
              <a href="#" className="nav-link active">Accueil</a>
              <a href="#" className="nav-link">Catégories</a>
              <a href="#" className="nav-link">Comment ça marche</a>
              <a href="#" className="nav-link">Support</a>
            </nav>

            {/* Barre de recherche premium */}
            <div className="search-premium">
              <div className="search-icon-premium">🔍</div>
              <input
                type="text"
                placeholder="Rechercher parmi 15,420+ annonces..."
                className="search-input-premium"
              />
              <button className="search-btn-premium">
                Rechercher
              </button>
            </div>

            {/* Actions utilisateur */}
            <div className="user-actions">
              <button className="action-btn">
                <span className="action-icon">🔔</span>
                <span className="notification-badge">3</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">💬</span>
              </button>
              <button className="action-btn">
                <span className="action-icon">❤️</span>
              </button>
              <div className="divider"></div>
              <button className="btn-login">Se connecter</button>
              <button className="btn-primary-premium">
                <span className="btn-icon">➕</span>
                Publier gratuitement
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section Premium */}
      <section className="hero-premium">
        <div className="hero-background"></div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-badge">
                🎉 Plus de 15,420 annonces actives
              </div>
              <h1 className="hero-title">
                Le marketplace
                <span className="title-highlight"> #1 du Sénégal</span>
                <br />
                <span className="title-sub">Achetez, vendez en toute confiance</span>
              </h1>
              <p className="hero-description">
                Rejoignez des milliers de Sénégalais qui font confiance à SenMarket.
                Vente rapide, paiement sécurisé, livraison partout au Sénégal.
              </p>
              <div className="hero-features">
                <div className="feature-item">
                  ✅ <span>Vérification identité</span>
                </div>
                <div className="feature-item">
                  💳 <span>Paiement Orange Money</span>
                </div>
                <div className="feature-item">
                  🚚 <span>Livraison sécurisée</span>
                </div>
              </div>
              <div className="hero-actions">
                <button className="btn-hero-primary">
                  <span className="btn-icon">🔍</span>
                  Explorer maintenant
                </button>
                <button className="btn-hero-secondary">
                  <span className="btn-icon">📱</span>
                  Vendre maintenant
                </button>
              </div>
            </div>
            
            <div className="hero-visual">
              <div className="phone-mockup">
                <div className="phone-screen">
                  <div className="app-preview">
                    <div className="preview-header">
                      <div className="preview-logo">🇸🇳</div>
                      <span>SenMarket</span>
                    </div>
                    <div className="preview-content">
                      <div className="preview-card">
                        <div className="card-image">🚗</div>
                        <div className="card-info">
                          <div className="card-title">Toyota Camry</div>
                          <div className="card-price">12.5M FCFA</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories Premium */}
      <section className="categories-premium">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explorez nos catégories</h2>
            <p className="section-subtitle">
              Trouvez exactement ce que vous cherchez dans nos catégories populaires
            </p>
          </div>
          
          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-count">{category.count} annonces</p>
                </div>
                <div className="category-arrow">→</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Annonces Premium */}
      <section className="listings-premium">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Annonces en vedette</h2>
            <p className="section-subtitle">
              Découvrez une sélection d'annonces vérifiées par nos experts
            </p>
          </div>

          <div className="listings-grid-premium">
            {featuredListings.map((listing) => (
              <div key={listing.id} className="listing-card-premium">
                {listing.featured && (
                  <div className="featured-badge">
                    ⭐ En vedette
                  </div>
                )}
                
                <div className="listing-image-premium">
                  <div className="listing-image-placeholder">
                    <span className="image-icon">{listing.image}</span>
                  </div>
                  <div className="listing-overlay">
                    <button className="overlay-btn">❤️</button>
                    <button className="overlay-btn">📤</button>
                  </div>
                  {listing.originalPrice && (
                    <div className="discount-badge">
                      -{Math.round((1 - listing.price / listing.originalPrice) * 100)}%
                    </div>
                  )}
                </div>

                <div className="listing-content-premium">
                  <div className="listing-header">
                    <span className="listing-category">{listing.category}</span>
                    {listing.verified && (
                      <span className="verified-badge">✅ Vérifié</span>
                    )}
                  </div>
                  
                  <h3 className="listing-title-premium">{listing.title}</h3>
                  
                  <div className="listing-price-premium">
                    <span className="current-price">
                      {listing.price.toLocaleString('fr-SN')} FCFA
                    </span>
                    {listing.originalPrice && (
                      <span className="original-price">
                        {listing.originalPrice.toLocaleString('fr-SN')} FCFA
                      </span>
                    )}
                  </div>

                  <div className="listing-meta">
                    <span className="listing-location">📍 {listing.location}</span>
                    <span className="listing-time">🕒 {listing.timeAgo}</span>
                  </div>

                  <div className="listing-stats">
                    <span className="stat-item">
                      👁️ {listing.views.toLocaleString()}
                    </span>
                    <span className="stat-item">
                      ❤️ {listing.likes}
                    </span>
                  </div>

                  <div className="seller-info">
                    <div className="seller-details">
                      <span className="seller-name">{listing.seller.name}</span>
                      <div className="seller-rating">
                        ⭐ {listing.seller.rating} ({listing.seller.sales} ventes)
                      </div>
                    </div>
                    <button className="btn-contact">
                      💬 Contacter
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="view-all-section">
            <button className="btn-view-all">
              Voir toutes les annonces
              <span className="btn-arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Statistiques Premium */}
      <section className="stats-premium">
        <div className="container">
          <div className="stats-header">
            <h2 className="stats-title">SenMarket en chiffres</h2>
            <p className="stats-subtitle">
              La plateforme de confiance de milliers de Sénégalais
            </p>
          </div>
          
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Témoignages Premium */}
      <section className="testimonials-premium">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Ce que disent nos utilisateurs</h2>
            <p className="section-subtitle">
              Plus de 8,750 utilisateurs nous font confiance chaque jour
            </p>
          </div>

          <div className="testimonials-slider">
            <div className="testimonial-card active">
              <div className="testimonial-content">
                <div className="quote-icon">💬</div>
                <p className="testimonial-text">
                  "{testimonials[currentSlide].text}"
                </p>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    {testimonials[currentSlide].avatar}
                  </div>
                  <div className="author-info">
                    <div className="author-name">{testimonials[currentSlide].name}</div>
                    <div className="author-location">📍 {testimonials[currentSlide].location}</div>
                  </div>
                  <div className="testimonial-rating">
                    {'⭐'.repeat(testimonials[currentSlide].rating)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="testimonials-nav">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  className={`nav-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Premium */}
      <section className="cta-premium">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2 className="cta-title">
                Prêt à rejoindre SenMarket ?
              </h2>
              <p className="cta-description">
                Commencez à vendre ou acheter dès aujourd'hui. 
                Inscription gratuite, première annonce offerte !
              </p>
              <div className="cta-features">
                <div className="cta-feature">✅ Inscription en 2 minutes</div>
                <div className="cta-feature">✅ Première annonce gratuite</div>
                <div className="cta-feature">✅ Support client 24/7</div>
              </div>
            </div>
            <div className="cta-actions">
              <button className="btn-cta-primary">
                <span className="btn-icon">🚀</span>
                Créer mon compte
              </button>
              <button className="btn-cta-secondary">
                <span className="btn-icon">📱</span>
                Télécharger l'app
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Premium */}
      <footer className="footer-premium">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo-premium">
                <div className="logo-icon-premium">
                  <div className="logo-inner">🇸🇳</div>
                </div>
                <div className="logo-text-premium">
                  <div className="brand-name">
                    Sen<span className="brand-highlight">Market</span>
                  </div>
                  <div className="brand-tagline">Marketplace Premium</div>
                </div>
              </div>
              <p className="footer-description">
                La plateforme de référence pour acheter et vendre au Sénégal.
                Sécurisé, rapide et accessible à tous.
              </p>
              <div className="social-links">
                <a href="#" className="social-link">📱</a>
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
              </div>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h3 className="footer-title">Catégories</h3>
                <ul className="footer-list">
                  <li><a href="#" className="footer-link">Véhicules</a></li>
                  <li><a href="#" className="footer-link">Immobilier</a></li>
                  <li><a href="#" className="footer-link">Électronique</a></li>
                  <li><a href="#" className="footer-link">Mode & Beauté</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3 className="footer-title">Support</h3>
                <ul className="footer-list">
                  <li><a href="#" className="footer-link">Centre d'aide</a></li>
                  <li><a href="#" className="footer-link">Contact</a></li>
                  <li><a href="#" className="footer-link">Signaler</a></li>
                  <li><a href="#" className="footer-link">Sécurité</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h3 className="footer-title">Entreprise</h3>
                <ul className="footer-list">
                  <li><a href="#" className="footer-link">À propos</a></li>
                  <li><a href="#" className="footer-link">Carrières</a></li>
                  <li><a href="#" className="footer-link">Presse</a></li>
                  <li><a href="#" className="footer-link">Partenaires</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p className="copyright">
                © 2024 SenMarket. Tous droits réservés.
              </p>
              <div className="footer-bottom-links">
                <a href="#" className="footer-bottom-link">Conditions d'utilisation</a>
                <a href="#" className="footer-bottom-link">Politique de confidentialité</a>
                <a href="#" className="footer-bottom-link">Cookies</a>
              </div>
              <p className="made-in">
                Fait avec ❤️ au 🇸🇳 Sénégal
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}