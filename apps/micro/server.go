package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	time"
)

type Status struct {
	Status    string `json:"status"`
	Timestamp int64  `json:"timestamp"`
}

func main() {
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(Status{Status: "healthy", Timestamp: time.Now().Unix()})
	})
	fmt.Println("Server running on port 8080...")
	http.ListenAndServe(":8080", nil)
}