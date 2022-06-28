package store

import (
	"context"
	"time"

	"github.com/grafana/grafana/pkg/infra/log"
	"github.com/grafana/grafana/pkg/services/accesscontrol"
	"github.com/grafana/grafana/pkg/services/dashboards"
	"github.com/grafana/grafana/pkg/services/ngalert/models"
	"github.com/grafana/grafana/pkg/services/sqlstore"
)

// TimeNow makes it possible to test usage of time
var TimeNow = time.Now

// AlertDefinitionMaxTitleLength is the maximum length of the alert definition title
const AlertDefinitionMaxTitleLength = 190

// AlertingStore is the database interface used by the Alertmanager service.
type AlertingStore interface {
	GetLatestAlertmanagerConfiguration(ctx context.Context, query *models.GetLatestAlertmanagerConfigurationQuery) error
	GetAllLatestAlertmanagerConfiguration(ctx context.Context) ([]*models.AlertConfiguration, error)
	SaveAlertmanagerConfiguration(ctx context.Context, cmd *models.SaveAlertmanagerConfigurationCmd) error
	SaveAlertmanagerConfigurationWithCallback(ctx context.Context, cmd *models.SaveAlertmanagerConfigurationCmd, callback SaveCallback) error
	UpdateAlertmanagerConfiguration(ctx context.Context, cmd *models.SaveAlertmanagerConfigurationCmd) error
	// DeleteOldConfigurations will delete all records that surpases the limit count.
	// i.e. if you want to keep the latest 100 records max at any time, set the limit to 100.
	DeleteOldConfigurations(ctx context.Context, orgID, limit int64) (int64, error)
}

// DBstore stores the alert definitions and instances in the database.
type DBstore struct {
	// the base scheduler tick rate; it's used for validating definition interval
	BaseInterval time.Duration
	// default alert definiiton interval
	DefaultInterval  time.Duration
	SQLStore         *sqlstore.SQLStore
	Logger           log.Logger
	FolderService    dashboards.FolderService
	AccessControl    accesscontrol.AccessControl
	DashboardService dashboards.DashboardService
}
