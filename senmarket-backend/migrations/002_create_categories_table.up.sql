CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_categories_sort ON categories(sort_order);

INSERT INTO categories (slug, name, icon, description, sort_order) VALUES
('vehicles', 'Véhicules', 'fa-car', 'Voitures, motos, camions, pièces détachées', 1),
('real-estate', 'Immobilier', 'fa-home', 'Appartements, villas, terrains, locations', 2),
('electronics', 'Électronique', 'fa-laptop', 'Smartphones, ordinateurs, TV, électroménager', 3),
('fashion', 'Mode & Beauté', 'fa-tshirt', 'Vêtements, chaussures, bijoux, cosmétiques', 4),
('jobs', 'Emploi', 'fa-briefcase', 'Offres d''emploi, freelance, services', 5),
('services', 'Services', 'fa-tools', 'Réparation, nettoyage, cours, consulting', 6),
('home-garden', 'Maison & Jardin', 'fa-couch', 'Meubles, décoration, outils, plantes', 7),
('animals', 'Animaux', 'fa-paw', 'Chiens, chats, oiseaux, accessoires', 8);
