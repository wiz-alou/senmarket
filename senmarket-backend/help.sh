#!/bin/bash
# Script pour supprimer les erreurs dupliquées

echo "🧹 Nettoyage des erreurs dupliquées..."

# 1. Dans user.go - supprimer tout le bloc d'erreurs à la fin
sed -i '/^\/\/ ================================$/,$d' internal/domain/entities/user.go
sed -i '/^type UserError string$/,$d' internal/domain/entities/user.go

# 2. Dans listing.go - supprimer le bloc d'erreurs
sed -i '/^\/\/ Erreurs listings$/,$d' internal/domain/entities/listing.go

# 3. Dans category.go - supprimer le bloc d'erreurs  
sed -i '/^\/\/ Erreurs catégories$/,$d' internal/domain/entities/category.go

# 4. Dans quota.go - supprimer le bloc d'erreurs
sed -i '/^\/\/ Erreurs quota$/,$d' internal/domain/entities/quota.go

echo "✅ Erreurs dupliquées supprimées !"

# Test compilation
echo "🧪 Test compilation..."
go build ./internal/domain/entities/...
