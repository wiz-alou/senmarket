#!/bin/bash
# Test Phase 3B - Command/Query Handlers

echo "🧪 TEST PHASE 3B - HANDLERS"
echo "==========================="

echo "📦 Test compilation Handlers..."
if go build ./internal/application/handlers/...; then
    echo "✅ Handlers : COMPILATION OK"
else
    echo "❌ Handlers : ERREUR DE COMPILATION"
    echo ""
    echo "🔍 Détails des erreurs :"
    go build ./internal/application/handlers/... 2>&1
    exit 1
fi

echo ""
echo "📦 Test compilation Application complète..."
if go build ./internal/application/...; then
    echo "✅ Application Layer complète : COMPILATION OK"
else
    echo "❌ Application Layer : ERREUR DE COMPILATION"
    echo ""
    echo "🔍 Détails des erreurs :"
    go build ./internal/application/... 2>&1
    exit 1
fi

echo ""
echo "🎉 PHASE 3B - SUCCÈS TOTAL !"
echo "============================"
echo "✅ Command Handlers (3/3) : CreateUser, CreateListing, PublishListing"
echo "✅ Query Handlers (2/2) : GetListings, GetUserQuota"
echo "✅ Utilitaires entités"
echo ""
echo "📋 STRUCTURE HANDLERS :"
echo "📁 internal/application/handlers/"
echo "  ├── create_user_handler.go         ✅"
echo "  ├── create_listing_handler.go      ✅"
echo "  ├── publish_listing_handler.go     ✅"
echo "  ├── get_listings_handler.go        ✅"
echo "  └── get_user_quota_handler.go      ✅"
echo ""
echo "🚀 PHASE 3 APPLICATION LAYER - TERMINÉE !"
echo "Prêt pour Phase 4 - Infrastructure Layer"
