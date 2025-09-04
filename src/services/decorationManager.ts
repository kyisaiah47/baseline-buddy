import * as vscode from 'vscode';
import { FeatureDetector } from './featureDetector';
import { BaselineChecker } from './baselineChecker';

export class DecorationManager {
    private featureDetector: FeatureDetector;
    private baselineChecker: BaselineChecker;
    private outputChannel: vscode.OutputChannel;
    
    // Decoration types for different compatibility levels
    private widelyAvailableDecoration: vscode.TextEditorDecorationType;
    private newlyAvailableDecoration: vscode.TextEditorDecorationType;
    private limitedAvailabilityDecoration: vscode.TextEditorDecorationType;
    private unknownDecoration: vscode.TextEditorDecorationType;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.featureDetector = new FeatureDetector();
        this.baselineChecker = new BaselineChecker();
        
        // Create decoration types with simple text indicators
        this.widelyAvailableDecoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' ✓',
                color: new vscode.ThemeColor('charts.green'),
                fontWeight: 'bold'
            }
        });

        this.newlyAvailableDecoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' ⏱',
                color: new vscode.ThemeColor('charts.yellow'),
                fontWeight: 'bold'
            }
        });

        this.limitedAvailabilityDecoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' ⚠',
                color: new vscode.ThemeColor('charts.red'),
                fontWeight: 'bold'
            },
            border: '1px solid',
            borderColor: new vscode.ThemeColor('charts.red'),
            borderRadius: '3px'
        });

        this.unknownDecoration = vscode.window.createTextEditorDecorationType({
            after: {
                contentText: ' ?',
                color: new vscode.ThemeColor('descriptionForeground'),
                fontWeight: 'normal'
            }
        });
    }

    async updateDecorations(editor: vscode.TextEditor): Promise<void> {
        const config = vscode.workspace.getConfiguration('baseline-buddy');
        if (!config.get('enableDecorations', true)) {
            return;
        }

        // Skip non-code files
        if (!['css', 'javascript', 'typescript', 'html'].includes(editor.document.languageId)) {
            return;
        }

        const widelyAvailableRanges: vscode.Range[] = [];
        const newlyAvailableRanges: vscode.Range[] = [];
        const limitedAvailabilityRanges: vscode.Range[] = [];
        const unknownRanges: vscode.Range[] = [];

        for (let lineIndex = 0; lineIndex < editor.document.lineCount; lineIndex++) {
            const line = editor.document.lineAt(lineIndex);
            const features = this.featureDetector.detectFeatures(line.text, editor.document.languageId);

            for (const feature of features) {
                try {
                    const baselineStatus = await this.baselineChecker.checkFeature(feature.featureId);
                    const range = new vscode.Range(
                        lineIndex,
                        feature.range.end,
                        lineIndex,
                        feature.range.end
                    );

                    switch (baselineStatus.status) {
                        case 'widely-available':
                            widelyAvailableRanges.push(range);
                            break;
                        case 'newly-available':
                            newlyAvailableRanges.push(range);
                            break;
                        case 'limited-availability':
                            limitedAvailabilityRanges.push(range);
                            break;
                        default:
                            unknownRanges.push(range);
                            break;
                    }
                } catch (error) {
                    this.outputChannel.appendLine(`Error decorating ${feature.featureId}: ${error}`);
                }
            }
        }

        // Apply decorations
        editor.setDecorations(this.widelyAvailableDecoration, widelyAvailableRanges);
        editor.setDecorations(this.newlyAvailableDecoration, newlyAvailableRanges);
        editor.setDecorations(this.limitedAvailabilityDecoration, limitedAvailabilityRanges);
        editor.setDecorations(this.unknownDecoration, unknownRanges);
    }

    dispose(): void {
        this.widelyAvailableDecoration.dispose();
        this.newlyAvailableDecoration.dispose();
        this.limitedAvailabilityDecoration.dispose();
        this.unknownDecoration.dispose();
    }
}