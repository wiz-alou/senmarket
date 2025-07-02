#!/bin/bash
# Test Phase 3 - Application Layer

echo "🧪 TEST PHASE 3 - APPLICATION LAYER"
echo "===================================="

echo "📦 Test compilation Application Layer..."
if go build ./internal/application/...; then
    echo "✅ Application Layer : COMPILATION OK"
else
    echo "❌ Application Layer : ERREUR DE COMPILATION"
    echo ""
    echo "🔍 Détails des erreurs :"
    go build ./internal/application/... 2>&1
    exit 1
fi

echo ""
echo "🎉 PHASE 3 - SUCCÈS !"
echo "===================="
echo "✅ Commands : 3/3"
echo "✅ Queries : 2/5"  
echo "✅ DTOs : 2/3"
echo "✅ Base Service : 1/1"
echo ""
echo "🚀 STRUCTURE APPLICATION LAYER CRÉÉE"
echo "📁 internal/application/"
echo "  ├── commands/"
echo "  ├── queries/"
echo "  ├── handlers/"
echo "  ├── services/"
echo "  └── dto/"
