import * as vscode from 'vscode';
import { FeatureDetector } from '../services/featureDetector';
import { BaselineChecker } from '../services/baselineChecker';

export class HoverProvider implements vscode.HoverProvider {
    private featureDetector: FeatureDetector;
    private baselineChecker: BaselineChecker;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.featureDetector = new FeatureDetector();
        this.baselineChecker = new BaselineChecker();
        this.outputChannel.appendLine('🔍 HoverProvider initialized');
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | undefined> {
        // Skip output/log files to prevent loops
        if (document.languageId === 'Log' || document.uri.scheme === 'output') {
            return undefined;
        }
        
        this.outputChannel.appendLine(`🔍 HOVER TRIGGERED: ${document.languageId} at line ${position.line}`);
        
        try {
            // Check if hover is enabled in settings
            const config = vscode.workspace.getConfiguration('baseline-buddy');
            if (!config.get('enableHover', true)) {
                return undefined;
            }

            const line = document.lineAt(position.line);
            const text = line.text.trim();
            
            // Skip empty lines
            if (!text) {
                return undefined;
            }
            
            const features = this.featureDetector.detectFeatures(text, document.languageId);
            
            this.outputChannel.appendLine(`📝 Language: ${document.languageId}, Text: "${text.substring(0, 30)}...", Features found: ${features.length}`);
            
            if (features.length > 0) {
                this.outputChannel.appendLine(`✨ Features: ${features.map(f => f.featureId).join(', ')}`);
            }

            for (const feature of features) {
                const startPos = line.range.start.translate(0, feature.range.start);
                const endPos = line.range.start.translate(0, feature.range.end);
                const featureRange = new vscode.Range(startPos, endPos);

                if (featureRange.contains(position)) {
                    const baselineStatus = await this.baselineChecker.checkFeature(feature.featureId);
                    
                    // Check if we should show unsupported features
                    const showUnsupported = config.get('showUnsupportedFeatures', true);
                    if (!showUnsupported && baselineStatus.status === 'limited-availability') {
                        continue;
                    }
                    
                    const statusIcon = this.getStatusIcon(baselineStatus.status);
                    const statusText = this.getStatusText(baselineStatus.status);
                    
                    const markdown = new vscode.MarkdownString();
                    markdown.appendMarkdown(`## ${statusIcon} ${feature.featureId}\n\n`);
                    markdown.appendMarkdown(`**Status:** ${statusText}\n\n`);
                    
                    if (baselineStatus.description) {
                        markdown.appendMarkdown(`${baselineStatus.description}\n\n`);
                    }

                    // Add browser support info
                    const support = (baselineStatus as any).status?.support;
                    if (support) {
                        markdown.appendMarkdown(`**Browser Support:**\n`);
                        if (support.chrome) {markdown.appendMarkdown(`- Chrome: ${support.chrome}+\n`);}
                        if (support.firefox) {markdown.appendMarkdown(`- Firefox: ${support.firefox}+\n`);}
                        if (support.safari) {markdown.appendMarkdown(`- Safari: ${support.safari}+\n`);}
                        if (support.edge) {markdown.appendMarkdown(`- Edge: ${support.edge}+\n`);}
                        markdown.appendMarkdown(`\n`);
                    }

                    // Add baseline dates
                    const baselineDate = (baselineStatus as any).status?.baseline_low_date || (baselineStatus as any).status?.baseline_high_date;
                    if (baselineDate) {
                        markdown.appendMarkdown(`**Baseline since:** ${baselineDate}\n\n`);
                    }

                    // Add links
                    markdown.appendMarkdown(`[MDN Reference](https://developer.mozilla.org/search?q=${encodeURIComponent(feature.featureId)}) | `);
                    markdown.appendMarkdown(`[Can I Use](https://caniuse.com/?search=${encodeURIComponent(feature.featureId)})\n\n`);
                    
                    markdown.appendMarkdown(`*Baseline compatibility data*`);
                    
                    const hover = new vscode.Hover(markdown, featureRange);
                    this.outputChannel.appendLine(`✅ Returning hover for ${feature.featureId}`);
                    return hover;
                }
            }

            return undefined;
        } catch (error) {
            this.outputChannel.appendLine(`❌ Error in HoverProvider: ${error}`);
            return undefined;
        }
    }

    private getStatusIcon(status: string): string {
        switch (status) {
            case 'widely-available': return '$(check-all)';
            case 'newly-available': return '$(clock)';
            case 'limited-availability': return '$(warning)';
            default: return '$(question)';
        }
    }

    private getStatusText(status: string): string {
        switch (status) {
            case 'widely-available': return 'Widely Available';
            case 'newly-available': return 'Newly Available';
            case 'limited-availability': return 'Limited Availability';
            default: return 'Unknown';
        }
    }
}