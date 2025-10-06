// FIX: Added global types for import.meta.env to support Vite environment variables.
declare global {
    interface ImportMetaEnv {
        readonly VITE_GEMINI_API_KEY: string | undefined;
    }
    interface ImportMeta {
        readonly env: ImportMetaEnv;
    }
}

declare module 'react' {
    interface InputHTMLAttributes<T> {
        webkitdirectory?: string;
        directory?: string;
    }
}

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

// Type for api.webstatus.dev feature response
export interface DashboardFeature {
  identifier: string;
  name: string;
  description: string;
  specifications: { name: string, url: string }[];
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
  web_platform_tests?: {
    total_tests: number;
    passing_tests: number;
  };
}

export enum MessageSender {
  User = 'user',
  AI = 'ai',
}

export interface ChatMessage {
  sender: MessageSender;
  text: string;
  feature?: DashboardFeature;
}

export interface ScanIssue {
  file: string;
  featureId: string;
  name: string; // Add feature name for better readability
  status: BaselineStatus;
  priority: Priority;
  line: number;
  column: number;
  confidence?: number; // Add confidence for fuzzy matches
}

export interface ScanResult {
  score: number;
  issues: ScanIssue[];
  stats: {
    [key in BaselineStatus]: number;
  };
}