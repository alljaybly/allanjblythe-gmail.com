import * as vscode from 'vscode';
import { ScanIssue, BaselineStatus } from './types';

function getSeverity(status: BaselineStatus): vscode.DiagnosticSeverity {
    switch (status) {
        case BaselineStatus.Limited:
            return vscode.DiagnosticSeverity.Warning;
        case BaselineStatus.Newly:
            return vscode.DiagnosticSeverity.Information;
        default:
            return vscode.DiagnosticSeverity.Hint;
    }
}

export function createDiagnostic(issue: ScanIssue): vscode.Diagnostic {
    // VS Code lines are 0-indexed, scanner is 1-indexed
    const line = issue.line - 1;
    const range = new vscode.Range(line, issue.column, line, issue.column + issue.name.length);
    const message = `The '${issue.name}' feature has ${issue.status} support according to Baseline.`;
    const severity = getSeverity(issue.status);

    const diagnostic = new vscode.Diagnostic(range, message, severity);
    diagnostic.code = issue.featureId;
    diagnostic.source = 'Baseline Scout';
    return diagnostic;
}

export function updateDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection,
    issues: ScanIssue[]
): void {
    const diagnostics = issues
        .filter(issue => vscode.Uri.file(issue.file).fsPath === document.uri.fsPath)
        .map(createDiagnostic);

    collection.set(document.uri, diagnostics);
}

export function updateAllDiagnostics(
    collection: vscode.DiagnosticCollection,
    issues: ScanIssue[]
): void {
    collection.clear();
    const issuesByFile = new Map<string, vscode.Diagnostic[]>();

    for (const issue of issues) {
        const uri = vscode.Uri.file(issue.file);
        if (!issuesByFile.has(uri.fsPath)) {
            issuesByFile.set(uri.fsPath, []);
        }
        issuesByFile.get(uri.fsPath)!.push(createDiagnostic(issue));
    }

    for (const [path, diagnostics] of issuesByFile.entries()) {
        collection.set(vscode.Uri.file(path), diagnostics);
    }
}
