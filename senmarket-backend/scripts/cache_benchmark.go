

// ============================================
// 3. NOUVEAU: scripts/cache_benchmark.go
// ============================================
package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"time"
)

// Benchmark des performances cache Redis
func main() {
	baseURL := "http://localhost:8080/api/v1"
	
	fmt.Println("🔴 Benchmark Cache Redis SenMarket")
	fmt.Println("==================================")
	
	endpoints := []string{
		"/categories",
		"/listings?page=1&limit=10",
		"/listings/featured",
		"/listings/search?q=voiture",
	}
	
	for _, endpoint := range endpoints {
		fmt.Printf("\n📊 Test endpoint: %s\n", endpoint)
		benchmarkEndpoint(baseURL + endpoint)
	}
}

func benchmarkEndpoint(url string) {
	// Premier appel (MISS)
	start := time.Now()
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("Erreur: %v", err)
		return
	}
	resp.Body.Close()
	missTime := time.Since(start)
	
	cacheStatus := resp.Header.Get("X-Cache")
	fmt.Printf("  MISS: %v (Cache: %s)\n", missTime, cacheStatus)
	
	// Attendre un peu
	time.Sleep(100 * time.Millisecond)
	
	// Deuxième appel (HIT)
	start = time.Now()
	resp, err = http.Get(url)
	if err != nil {
		log.Printf("Erreur: %v", err)
		return
	}
	resp.Body.Close()
	hitTime := time.Since(start)
	
	cacheStatus = resp.Header.Get("X-Cache")
	fmt.Printf("  HIT:  %v (Cache: %s)\n", hitTime, cacheStatus)
	
	// Calculer l'amélioration
	improvement := float64(missTime-hitTime) / float64(missTime) * 100
	fmt.Printf("  📈 Amélioration: %.1f%%\n", improvement)
}