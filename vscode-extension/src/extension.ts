import * as vscode from 'vscode';
import { getFeatureMap } from './api';
import { scanJavaScript, scanCss, scanHtml } from './scanner';
import { updateAllDiagnostics } from './diagnostics';
import { ScanIssue, ScanResult, BaselineStatus, DashboardFeature } from './types';

let diagnosticCollection: vscode.DiagnosticCollection;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection('baselineScout');
    context.subscriptions.push(diagnosticCollection);

    // Create and configure the status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.command = 'baseline-scout.scanWorkspace';
    context.subscriptions.push(statusBarItem);

    const scanCommand = vscode.commands.registerCommand('baseline-scout.scanWorkspace', async () => {
        runScan();
    });

    context.subscriptions.push(scanCommand);
    
    // Initial scan on activation
    runScan();
}

async function runScan() {
    try {
        statusBarItem.text = `$(sync~spin) Scouting...`;
        statusBarItem.tooltip = 'Baseline Feature Scout is scanning your workspace...';
        statusBarItem.show();

        const featureMap = await getFeatureMap();
        if (!featureMap || featureMap.length === 0) {
            vscode.window.showWarningMessage('Baseline Scout: Could not retrieve web feature data. Please check your connection.');
            statusBarItem.hide();
            return;
        }

        const files = await vscode.workspace.findFiles(
            '**/*.{js,ts,jsx,tsx,css,html}',
            '**/node_modules/**'
        );

        let allIssues: ScanIssue[] = [];
        const progressOptions: vscode.ProgressOptions = {
            location: vscode.ProgressLocation.Notification,
            title: 'Baseline Scout',
            cancellable: true
        };

        await vscode.window.withProgress(progressOptions, async (progress, token) => {
            for (let i = 0; i < files.length; i++) {
                if (token.isCancellationRequested) {
                    break;
                }
                const file = files[i];
                const relativePath = vscode.workspace.asRelativePath(file);
                progress.report({ message: `Scanning ${relativePath}`, increment: (1 / files.length) * 100 });

                const document = await vscode.workspace.openTextDocument(file);
                const text = document.getText();
                let issues: ScanIssue[] = [];

                if (file.path.match(/\.(js|ts|jsx|tsx)$/)) {
                    issues = scanJavaScript(text, file.fsPath, featureMap);
                } else if (file.path.endsWith('.css')) {
                    issues = scanCss(text, file.fsPath, featureMap);
                } else if (file.path.endsWith('.html')) {
                    issues = scanHtml(text, file.fsPath, featureMap);
                }
                allIssues.push(...issues);
            }
        });

        const scanResult = calculateResult(allIssues);
        updateAllDiagnostics(diagnosticCollection, scanResult.issues);
        updateStatusBar(scanResult);

        vscode.window.showInformationMessage(`Baseline Scout scan finished. Found ${scanResult.issues.length} issues.`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        vscode.window.showErrorMessage(`Baseline Scout failed: ${errorMessage}`);
        statusBarItem.text = `$(error) Scout Failed`;
        statusBarItem.tooltip = `Scan failed: ${errorMessage}`;
    }
}


function calculateResult(issues: ScanIssue[]): ScanResult {
    const stats: ScanResult['stats'] = {
        [BaselineStatus.Widely]: 0,
        [BaselineStatus.Newly]: 0,
        [BaselineStatus.Limited]: 0,
        [BaselineStatus.Unknown]: 0,
    };

    issues.forEach(issue => {
        if (issue.status !== BaselineStatus.Widely) {
            stats[issue.status]++;
        }
    });

    const totalIssues = issues.length;
    const goodFeatures = issues.filter(i => i.status === BaselineStatus.Widely || i.status === BaselineStatus.Newly).length;
    const score = totalIssues > 0 ? Math.round((goodFeatures / totalIssues) * 100) : 100;

    return {
        score,
        stats,
        issues: issues.filter(i => i.status !== BaselineStatus.Widely),
    };
}


function updateStatusBar(result: ScanResult) {
    const score = result.score;
    statusBarItem.text = `$(shield) Baseline Score: ${score}%`;
    statusBarItem.tooltip = `Scan Complete! ${result.stats[BaselineStatus.Limited]} limited features, ${result.stats[BaselineStatus.Newly]} new features. Click to rescan.`;

    if (score >= 90) {
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.prominentBackground'); // Typically green in dark themes
    } else if (score >= 70) {
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground'); // Yellow
    } else {
        statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground'); // Red
    }
    statusBarItem.show();
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    if (diagnosticCollection) {
        diagnosticCollection.dispose();
    }
}
