package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/mikestefanello/backlite"
)

type StartRefreshTask struct {
}

func (t StartRefreshTask) Config() backlite.QueueConfig {
	return backlite.QueueConfig{
		Name:        "start-refresh",
		MaxAttempts: 3,
		Backoff:     time.Minute,
		Retention: &backlite.Retention{
			Duration: 24 * time.Hour,
		},
	}
}

type RefreshResponse struct {
	FeedIds []string `json:"feedIds"`
}

func HandleStartRefreshTask(ctx context.Context, task StartRefreshTask) error {

	endpoint := os.Getenv("START_REFRESH_URL")

	req, err := http.NewRequest(http.MethodGet, endpoint, nil)

	if err != nil {
		slog.Default().Error("Error creating request", slog.String("error", err.Error()))
		return err
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	resp, err := client.Do(req)

	if err != nil {
		slog.Default().Error("Error making request to start refresh", slog.String("error", err.Error()))
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		slog.Default().Error("Unexpected status code", slog.Int("status_code", resp.StatusCode))
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var refreshResponse RefreshResponse
	if err := json.NewDecoder(resp.Body).Decode(&refreshResponse); err != nil {
		slog.Default().Error("Error decoding response", slog.String("error", err.Error()))
		return err
	}

	fmt.Println("Feeds to refresh:", refreshResponse.FeedIds)

	tasks := make([]backlite.Task, 0, len(refreshResponse.FeedIds))

	for _, feedID := range refreshResponse.FeedIds {
		tasks = append(tasks, RefreshFeedTask{
			FeedID: feedID,
		})
	}

	taskClient := backlite.FromContext(ctx)

	if len(tasks) > 0 {
		taskClient.Add(tasks...).Ctx(ctx).Save()
	}

	return nil
}

type RefreshFeedTask struct {
	FeedID string
}

func (t RefreshFeedTask) Config() backlite.QueueConfig {
	return backlite.QueueConfig{
		Name:        "refresh-feed",
		MaxAttempts: 5,
		Backoff:     2 * time.Minute,
		Retention: &backlite.Retention{
			Duration: 24 * time.Hour,
			Data: &backlite.RetainData{
				OnlyFailed: false,
			},
		},
	}
}

func HandleRefreshFeedTask(ctx context.Context, task RefreshFeedTask) error {
	fmt.Printf("Refreshing feed: %s\n", task.FeedID)

	client := &http.Client{
		Timeout: 1 * time.Minute,
	}

	baseUrl := os.Getenv("START_REFRESH_URL")

	endpoint := baseUrl + "/" + task.FeedID

	req, err := http.NewRequest(http.MethodPost, endpoint, nil)

	if err != nil {
		slog.Default().Error("Error creating request", slog.String("error", err.Error()))
		return err
	}

	resp, err := client.Do(req)

	if err != nil {
		slog.Default().Error("Error making request to refresh feed", slog.String("error", err.Error()))
		return err
	}

	defer resp.Body.Close()

	if resp.StatusCode >= 300 {
		slog.Default().Error("Unexpected status code", slog.Int("status_code", resp.StatusCode))
		return fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	fmt.Printf("Feed %s refreshed successfully\n", task.FeedID)

	return nil
}
