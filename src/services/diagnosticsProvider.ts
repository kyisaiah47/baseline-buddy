import * as vscode from 'vscode';
import { FeatureDetector } from './featureDetector';
import { BaselineChecker } from './baselineChecker';

export class DiagnosticsProvider {
    private featureDetector: FeatureDetector;
    private baselineChecker: BaselineChecker;
    private outputChannel: vscode.OutputChannel;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.featureDetector = new FeatureDetector();
        this.baselineChecker = new BaselineChecker();
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('baseline-buddy');
    }

    async updateDiagnostics(document: vscode.TextDocument): Promise<void> {
        const config = vscode.workspace.getConfiguration('baseline-buddy');
        if (!config.get('enableProblems', true)) {
            return;
        }

        // Skip non-code files
        if (!['css', 'javascript', 'typescript', 'html'].includes(document.languageId)) {
            return;
        }

        const diagnostics: vscode.Diagnostic[] = [];

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const features = this.featureDetector.detectFeatures(line.text, document.languageId);

            for (const feature of features) {
                try {
                    const baselineStatus = await this.baselineChecker.checkFeature(feature.featureId);
                    
                    // Only create diagnostics for limited availability features
                    if (baselineStatus.status === 'limited-availability') {
                        const range = new vscode.Range(
                            lineIndex,
                            feature.range.start,
                            lineIndex,
                            feature.range.end
                        );

                        const diagnostic = new vscode.Diagnostic(
                            range,
                            `${feature.featureId}: Limited browser support. ${baselineStatus.description || 'Consider using alternatives or polyfills.'}`,
                            vscode.DiagnosticSeverity.Warning
                        );

                        diagnostic.source = 'Baseline Buddy';
                        diagnostic.code = feature.featureId;
                        
                        // Add related information
                        const support = (baselineStatus as any).status?.support;
                        if (support) {
                            const relatedInfo = new vscode.DiagnosticRelatedInformation(
                                new vscode.Location(document.uri, range),
                                `Browser support: Chrome ${support.chrome || 'N/A'}, Firefox ${support.firefox || 'N/A'}, Safari ${support.safari || 'N/A'}, Edge ${support.edge || 'N/A'}`
                            );
                            diagnostic.relatedInformation = [relatedInfo];
                        }

                        diagnostics.push(diagnostic);
                    }
                } catch (error) {
                    this.outputChannel.appendLine(`Error creating diagnostic for ${feature.featureId}: ${error}`);
                }
            }
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    dispose(): void {
        this.diagnosticCollection.dispose();
    }
}