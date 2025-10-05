export enum BaselineStatus {
    Widely = 'widely available',
    Newly = 'newly available',
    Limited = 'limited availability',
    Unknown = 'unknown',
}

export enum Priority {
    High = 'High',
    Medium = 'Medium',
    Low = 'Low',
}

export interface DashboardFeature {
    identifier: string;
    name: string;
    description: string;
    specifications: { name: string; url: string }[];
    mdn_url?: string;
    baseline: {
        status: 'wide' | 'limited' | 'newly';
        since?: string;
    };
    browser_support: {
        browser: string;
        support: {
            version_added: string | boolean;
        };
    }[];
}

export interface ScanIssue {
    file: string;
    featureId: string;
    name: string;
    status: BaselineStatus;
    priority: Priority;
    line: number;
    column: number;
    confidence?: number;
}

export interface ScanResult {
    score: number;
    issues: ScanIssue[];
    stats: {
        [key in BaselineStatus]: number;
    };
}
