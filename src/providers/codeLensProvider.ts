import * as vscode from 'vscode';
import { FeatureDetector } from '../services/featureDetector';
import { BaselineChecker } from '../services/baselineChecker';

export class BaselineCodeLensProvider implements vscode.CodeLensProvider {
    private featureDetector: FeatureDetector;
    private baselineChecker: BaselineChecker;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.featureDetector = new FeatureDetector();
        this.baselineChecker = new BaselineChecker();
    }

    async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {
        const codeLenses: vscode.CodeLens[] = [];

        // Skip non-code files
        if (!['css', 'javascript', 'typescript', 'html'].includes(document.languageId)) {
            return codeLenses;
        }

        const config = vscode.workspace.getConfiguration('baseline-buddy');
        if (!config.get('enableCodeLens', false)) {
            return codeLenses;
        }

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const line = document.lineAt(lineIndex);
            const features = this.featureDetector.detectFeatures(line.text, document.languageId);

            for (const feature of features) {
                try {
                    const baselineStatus = await this.baselineChecker.checkFeature(feature.featureId);
                    
                    // Only show CodeLens for limited availability features
                    if (baselineStatus.status === 'limited-availability') {
                        const range = new vscode.Range(
                            lineIndex, 
                            feature.range.start,
                            lineIndex,
                            feature.range.end
                        );

                        const statusIcon = this.getStatusIcon(baselineStatus.status);
                        const codeLens = new vscode.CodeLens(range);
                        codeLens.command = {
                            title: `${statusIcon} ${feature.featureId} - Limited Availability`,
                            command: 'baseline-buddy.showFeatureDetails',
                            arguments: [feature.featureId, baselineStatus]
                        };
                        
                        codeLenses.push(codeLens);
                    }
                } catch (error) {
                    this.outputChannel.appendLine(`Error in CodeLens for ${feature.featureId}: ${error}`);
                }
            }
        }

        return codeLenses;
    }

    private getStatusIcon(status: string): string {
        switch (status) {
            case 'widely-available': return '$(check-all)';
            case 'newly-available': return '$(clock)';
            case 'limited-availability': return '$(warning)';
            default: return '$(question)';
        }
    }
}