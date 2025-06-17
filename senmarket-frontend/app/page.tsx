export default function HomePage() {
  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">🛍️</div>
              <div>
                <div className="logo-text">
                  Sen<span className="logo-gradient">Market</span>
                </div>
                <div style={{fontSize: '0.75rem', color: 'var(--secondary-600)'}}>
                  Marketplace du Sénégal
                </div>
              </div>
            </div>

            <div className="search-container">
              <div className="search-icon">🔍</div>
              <input
                type="text"
                placeholder="Rechercher des produits..."
                className="search-input"
              />
            </div>

            <div className="header-actions">
              <button className="btn" style={{background: 'none', border: 'none', padding: '0.5rem'}}>
                🔔
              </button>
              <button className="btn" style={{background: 'none', border: 'none', padding: '0.5rem'}}>
                👤
              </button>
              <button className="btn btn-primary">
                ➕ Publier
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            Découvrez le <span className="logo-gradient">marketplace</span>
            <br />
            <span style={{fontSize: '0.6em'}}>🇸🇳 du Sénégal</span>
          </h1>
          <p>
            Achetez et vendez facilement partout au Sénégal. 
            Des milliers de produits vous attendent !
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">
              Explorer les annonces
            </button>
            <button className="btn btn-outline">
              Vendre maintenant
            </button>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="section section-white">
        <div className="container">
          <h2 className="section-title">Explorez par catégorie</h2>
          <div className="categories">
            <button className="category-btn active">
              🛍️ Tout
            </button>
            <button className="category-btn">
              🚗 Véhicules
            </button>
            <button className="category-btn">
              🏠 Immobilier
            </button>
            <button className="category-btn">
              📱 Électronique
            </button>
          </div>
        </div>
      </section>

      {/* Listings */}
      <section className="section">
        <div className="container">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
            <h2 className="section-title" style={{margin: 0}}>Annonces récentes</h2>
            <button style={{color: 'var(--primary-600)', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer'}}>
              Voir tout →
            </button>
          </div>

          <div className="listings-grid">
            {[
              { title: 'iPhone 14 Pro Max Neuf', price: 850000, location: 'Dakar - Plateau' },
              { title: 'Toyota Corolla 2020', price: 12500000, location: 'Dakar - Almadies' },
              { title: 'Villa 4 chambres avec piscine', price: 85000000, location: 'Dakar - Point E' }
            ].map((item, index) => (
              <div key={index} className="listing-card">
                <div className="listing-image">
                  <div style={{fontSize: '3rem', color: 'var(--primary-400)'}}>📱</div>
                </div>
                <div className="listing-content">
                  <h3 className="listing-title">{item.title}</h3>
                  <div className="listing-price">
                    {item.price.toLocaleString('fr-SN')} FCFA
                  </div>
                  <span className="listing-location">{item.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>15,420+</h3>
              <p>Annonces actives</p>
            </div>
            <div className="stat-item">
              <h3>8,750+</h3>
              <p>Utilisateurs</p>
            </div>
            <div className="stat-item">
              <h3>3,280+</h3>
              <p>Ventes réussies</p>
            </div>
            <div className="stat-item">
              <h3>14</h3>
              <p>Régions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="logo">
            <div className="logo-icon">🛍️</div>
            <div className="logo-text">
              Sen<span className="logo-gradient">Market</span>
            </div>
          </div>
          <p>© 2024 SenMarket. Fait avec ❤️ au 🇸🇳 Sénégal</p>
        </div>
      </footer>
    </div>
  )
}
