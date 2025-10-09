package main

import (
	"context"
	"database/sql"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/mattn/go-sqlite3"
	"github.com/mikestefanello/backlite"
	"github.com/mikestefanello/backlite/ui"
)

func configDefaultSlog() {

	logLevel := os.Getenv("LOG_LEVEL")

	if logLevel == "" {
		logLevel = "INFO"
	}

	lvl := slog.LevelInfo

	switch logLevel {
	case "DEBUG":
		lvl = slog.LevelDebug
	case "INFO":
		lvl = slog.LevelInfo
	case "WARN":
		lvl = slog.LevelWarn
	case "ERROR":
		lvl = slog.LevelError
	case "CRITICAL":
		lvl = slog.LevelError
	}

	slog.SetDefault(
		slog.New(
			slog.NewTextHandler(os.Stdout, &slog.HandlerOptions{
				Level: lvl,
			}),
		),
	)
}

func registerQueues(client *backlite.Client) {
	client.Register(backlite.NewQueue[StartRefreshTask](HandleStartRefreshTask))
	client.Register(backlite.NewQueue[RefreshFeedTask](HandleRefreshFeedTask))
}

func scheduleRefreshTask(ctx context.Context, client *backlite.Client) {

	ticker := time.NewTicker(15 * time.Minute)
	go func() {
		for {
			select {
			case <-ticker.C:
				client.Add(StartRefreshTask{}).Ctx(ctx).Save()
			case <-ctx.Done():
				ticker.Stop()
				return
			}
		}
	}()
}

func main() {

	rootCtx := context.Background()

	configDefaultSlog()

	db, err := sql.Open("sqlite3", "./jobs.db")

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	jobsClient, err := backlite.NewClient(backlite.ClientConfig{
		DB:              db,
		Logger:          slog.Default(),
		ReleaseAfter:    3 * time.Minute,
		NumWorkers:      5,
		CleanupInterval: 7 * 24 * time.Hour,
	})

	if err != nil {
		log.Fatalf("Failed to create Backlite client: %v", err)
	}

	defer jobsClient.Stop(rootCtx)

	err = jobsClient.Install()

	if err != nil {
		log.Fatalf("Failed to install Backlite schema: %v", err)
	}

	registerQueues(jobsClient)
	jobsClient.Start(rootCtx)
	jobsClient.Add(StartRefreshTask{}).Ctx(rootCtx).Save()
	scheduleRefreshTask(rootCtx, jobsClient)

	mux := http.NewServeMux()

	// Add a basic health check endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	h, err := ui.NewHandler(ui.Config{
		DB:       db,
		BasePath: "/jobs",
	})

	if err != nil {
		log.Fatalf("Failed to create UI handler: %v", err)
	}

	h.Register(mux)

	// Create HTTP server
	server := &http.Server{
		Addr:    ":8000",
		Handler: mux,
	}

	// Channel to listen for interrupt signal to terminate gracefully
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", server.Addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to start: %v", err)
		}
	}()

	// Wait for interrupt signal
	<-quit
	log.Println("Server shutting down...")

	// Create a context with timeout for graceful shutdown
	ctx, cancel := context.WithTimeout(rootCtx, 30*time.Second)
	defer cancel()

	// Attempt graceful shutdown
	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
