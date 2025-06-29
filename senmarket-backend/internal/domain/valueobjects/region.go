// internal/domain/valueobjects/region.go
// VERSION CORRIGÉE - Accepte codes ET noms pour compatibilité
package valueobjects

import (
	"errors"
	"strings"
)

// Region représente une région géographique du Sénégal
type Region struct {
	Code     string
	Name     string
	IsActive bool
}

// RegionCode constantes pour les régions du Sénégal
type RegionCode string

const (
	RegionDakar       RegionCode = "DK"
	RegionThies       RegionCode = "TH"
	RegionSaintLouis  RegionCode = "SL"
	RegionDiourbel    RegionCode = "DI"
	RegionLouga       RegionCode = "LG"
	RegionFatick      RegionCode = "FA"
	RegionKaolack     RegionCode = "KA"
	RegionKaffrine    RegionCode = "KF"
	RegionKolda       RegionCode = "KO"
	RegionZiguinchor  RegionCode = "ZI"
	RegionSedhiou     RegionCode = "SE"
	RegionTambacounda RegionCode = "TA"
	RegionKedougou    RegionCode = "KE"
	RegionMatam       RegionCode = "MA"
)

// regions contient la liste des régions valides (code -> nom)
var regions = map[RegionCode]string{
	RegionDakar:       "Dakar",
	RegionThies:       "Thiès",
	RegionSaintLouis:  "Saint-Louis",
	RegionDiourbel:    "Diourbel",
	RegionLouga:       "Louga",
	RegionFatick:      "Fatick",
	RegionKaolack:     "Kaolack",
	RegionKaffrine:    "Kaffrine",
	RegionKolda:       "Kolda",
	RegionZiguinchor:  "Ziguinchor",
	RegionSedhiou:     "Sédhiou",
	RegionTambacounda: "Tambacounda",
	RegionKedougou:    "Kédougou",
	RegionMatam:       "Matam",
}

// 🔧 NOUVEAU : Mapping inverse (nom -> code) pour compatibilité
var regionsByName = map[string]RegionCode{
	"dakar":       RegionDakar,
	"thiès":       RegionThies,
	"thies":       RegionThies,
	"saint-louis": RegionSaintLouis,
	"diourbel":    RegionDiourbel,
	"louga":       RegionLouga,
	"fatick":      RegionFatick,
	"kaolack":     RegionKaolack,
	"kaffrine":    RegionKaffrine,
	"kolda":       RegionKolda,
	"ziguinchor":  RegionZiguinchor,
	"sédhiou":     RegionSedhiou,
	"sedhiou":     RegionSedhiou,
	"tambacounda": RegionTambacounda,
	"kédougou":    RegionKedougou,
	"kedougou":    RegionKedougou,
	"matam":       RegionMatam,
}

// NewRegion crée une nouvelle région validée - VERSION FLEXIBLE
func NewRegion(input string) (*Region, error) {
	input = strings.TrimSpace(input)
	
	// 🔧 Permettre les codes vides pour la migration
	if input == "" {
		return &Region{
			Code:     "",
			Name:     "Non spécifié",
			IsActive: false,
		}, nil
	}
	
	// 🔧 NOUVEAU : Essayer d'abord comme CODE (DK, TH, etc.)
	inputUpper := strings.ToUpper(input)
	regionCode := RegionCode(inputUpper)
	if name, exists := regions[regionCode]; exists {
		return &Region{
			Code:     inputUpper,
			Name:     name,
			IsActive: true,
		}, nil
	}
	
	// 🔧 NOUVEAU : Essayer ensuite comme NOM (Dakar, Thiès, etc.)
	inputLower := strings.ToLower(input)
	if code, exists := regionsByName[inputLower]; exists {
		return &Region{
			Code:     string(code),
			Name:     regions[code],
			IsActive: true,
		}, nil
	}
	
	return nil, errors.New("code région invalide pour le Sénégal")
}

// NewRegionStrict crée une nouvelle région avec validation stricte (codes seulement)
func NewRegionStrict(code string) (*Region, error) {
	code = strings.ToUpper(strings.TrimSpace(code))
	
	if code == "" {
		return nil, errors.New("code région vide")
	}
	
	regionCode := RegionCode(code)
	name, exists := regions[regionCode]
	
	if !exists {
		return nil, errors.New("code région invalide pour le Sénégal")
	}
	
	return &Region{
		Code:     code,
		Name:     name,
		IsActive: true,
	}, nil
}

// GetAllRegions retourne toutes les régions du Sénégal
func GetAllRegions() map[RegionCode]string {
	return regions
}

// IsValidRegionCode vérifie si un code région est valide
func IsValidRegionCode(code string) bool {
	if code == "" {
		return false
	}
	_, exists := regions[RegionCode(strings.ToUpper(code))]
	return exists
}

// IsValidRegionName vérifie si un nom de région est valide
func IsValidRegionName(name string) bool {
	if name == "" {
		return false
	}
	_, exists := regionsByName[strings.ToLower(name)]
	return exists
}

// ConvertNameToCode convertit un nom de région en code
func ConvertNameToCode(name string) (string, error) {
	if name == "" {
		return "", nil
	}
	
	code, exists := regionsByName[strings.ToLower(name)]
	if !exists {
		return "", errors.New("nom de région invalide")
	}
	return string(code), nil
}

// GetRegionName retourne le nom de la région par son code
func GetRegionName(code string) (string, error) {
	if code == "" {
		return "Non spécifié", nil
	}
	
	name, exists := regions[RegionCode(strings.ToUpper(code))]
	if !exists {
		return "", errors.New("code région invalide")
	}
	return name, nil
}

// String retourne la représentation string de la région
func (r *Region) String() string {
	return r.Name
}

// GetCode retourne le code de la région
func (r *Region) GetCode() string {
	return r.Code
}

// GetName retourne le nom de la région
func (r *Region) GetName() string {
	return r.Name
}

// IsEmpty vérifie si la région est vide
func (r *Region) IsEmpty() bool {
	return r.Code == ""
}

// IsValid vérifie si la région est valide et active
func (r *Region) IsValid() bool {
	return r.Code != "" && r.IsActive
}