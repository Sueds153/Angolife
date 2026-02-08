// AlertService.ts

class AlertService {
    private alerts: string[];

    constructor() {
        this.alerts = [];
    }

    public addAlert(alert: string) {
        this.alerts.push(alert);
    }

    public getAlerts(): string[] {
        return this.alerts;
    }

    public clearAlerts() {
        this.alerts = [];
    }
}

// Exporting the AlertService class for use in other modules
export default AlertService;