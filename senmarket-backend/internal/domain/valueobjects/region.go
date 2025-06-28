// internal/domain/valueobjects/region.go
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

// regions contient la liste des régions valides
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

// NewRegion crée une nouvelle région validée
func NewRegion(code string) (*Region, error) {
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
	_, exists := regions[RegionCode(strings.ToUpper(code))]
	return exists
}

// GetRegionName retourne le nom de la région par son code
func GetRegionName(code string) (string, error) {
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