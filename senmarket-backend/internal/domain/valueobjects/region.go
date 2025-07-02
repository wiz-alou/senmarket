// internal/domain/valueobjects/region.go
package valueobjects

import "fmt"

// Region - Value Object pour les régions du Sénégal
type Region string

const (
	RegionDakar       Region = "Dakar"
	RegionThies       Region = "Thiès"
	RegionSaintLouis  Region = "Saint-Louis"
	RegionDiourbel    Region = "Diourbel"
	RegionLouga       Region = "Louga"
	RegionTambacounda Region = "Tambacounda"
	RegionKaolack     Region = "Kaolack"
	RegionKolda       Region = "Kolda"
	RegionZiguinchor  Region = "Ziguinchor"
	RegionFatick      Region = "Fatick"
	RegionKaffrine    Region = "Kaffrine"
	RegionKedougou    Region = "Kédougou"
	RegionMatam       Region = "Matam"
	RegionSedhiou     Region = "Sédhiou"
)

// NewRegion crée et valide une région
func NewRegion(region string) (Region, error) {
	r := Region(region)
	if !r.IsValid() {
		return "", fmt.Errorf("région invalide: %s", region)
	}
	return r, nil
}

// IsValid vérifie si la région est valide
func (r Region) IsValid() bool {
	validRegions := []Region{
		RegionDakar, RegionThies, RegionSaintLouis, RegionDiourbel,
		RegionLouga, RegionTambacounda, RegionKaolack, RegionKolda,
		RegionZiguinchor, RegionFatick, RegionKaffrine, RegionKedougou,
		RegionMatam, RegionSedhiou,
	}
	
	for _, valid := range validRegions {
		if r == valid {
			return true
		}
	}
	return false
}

// String retourne la région en string
func (r Region) String() string {
	return string(r)
}

// GetAllRegions retourne toutes les régions
func GetAllRegions() []Region {
	return []Region{
		RegionDakar, RegionThies, RegionSaintLouis, RegionDiourbel,
		RegionLouga, RegionTambacounda, RegionKaolack, RegionKolda,
		RegionZiguinchor, RegionFatick, RegionKaffrine, RegionKedougou,
		RegionMatam, RegionSedhiou,
	}
}