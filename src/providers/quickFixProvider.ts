import * as vscode from 'vscode';
import { FeatureDetector } from '../services/featureDetector';
import { BaselineChecker } from '../services/baselineChecker';
import { PolyfillSuggestions } from '../services/polyfillSuggestions';

export class QuickFixProvider implements vscode.CodeActionProvider {
    private featureDetector: FeatureDetector;
    private baselineChecker: BaselineChecker;
    private polyfillSuggestions: PolyfillSuggestions;
    private outputChannel: vscode.OutputChannel;

    constructor(outputChannel: vscode.OutputChannel) {
        this.outputChannel = outputChannel;
        this.featureDetector = new FeatureDetector();
        this.baselineChecker = new BaselineChecker();
        this.polyfillSuggestions = new PolyfillSuggestions();
    }

    async provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.CodeAction[]> {
        const actions: vscode.CodeAction[] = [];

        // Check if this is a Baseline Buddy diagnostic
        const baselineIssues = context.diagnostics.filter(d => d.source === 'Baseline Buddy');
        
        for (const diagnostic of baselineIssues) {
            const featureId = diagnostic.code as string;
            if (featureId) {
                // Add polyfill suggestion if available
                if (this.polyfillSuggestions.hasPolyfill(featureId)) {
                    const polyfillAction = new vscode.CodeAction(
                        `Install polyfill for ${featureId}`,
                        vscode.CodeActionKind.QuickFix
                    );
                    polyfillAction.command = {
                        command: 'baseline-buddy.installPolyfill',
                        title: 'Install Polyfill',
                        arguments: [featureId]
                    };
                    actions.push(polyfillAction);
                }

                // Add alternative suggestions
                const alternatives = this.getAlternatives(featureId);
                for (const alt of alternatives) {
                    const altAction = new vscode.CodeAction(
                        `Use ${alt.name} instead`,
                        vscode.CodeActionKind.QuickFix
                    );
                    altAction.edit = new vscode.WorkspaceEdit();
                    altAction.edit.replace(document.uri, diagnostic.range, alt.replacement);
                    actions.push(altAction);
                }

                // Add documentation action
                const docsAction = new vscode.CodeAction(
                    `Learn more about ${featureId}`,
                    vscode.CodeActionKind.QuickFix
                );
                docsAction.command = {
                    command: 'baseline-buddy.showFeatureDetails',
                    title: 'Show Details',
                    arguments: [featureId, await this.baselineChecker.checkFeature(featureId)]
                };
                actions.push(docsAction);
            }
        }

        return actions;
    }

    private getAlternatives(featureId: string): Array<{name: string, replacement: string}> {
        const alternatives: {[key: string]: Array<{name: string, replacement: string}>} = {
            'fetch': [
                { name: 'XMLHttpRequest', replacement: 'new XMLHttpRequest()' }
            ],
            'grid': [
                { name: 'Flexbox', replacement: 'display: flex' }
            ],
            'container-queries': [
                { name: 'Media Queries', replacement: '@media (max-width: 768px)' }
            ],
            'has': [
                { name: 'Class selector', replacement: '.parent.has-child' }
            ],
            'dialog': [
                { name: 'Modal div', replacement: '<div role="dialog" aria-modal="true">' }
            ]
        };

        return alternatives[featureId] || [];
    }
}