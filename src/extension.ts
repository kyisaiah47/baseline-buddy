import * as vscode from 'vscode';
import { HoverProvider } from './providers/hoverProvider';
import { BaselineCodeLensProvider } from './providers/codeLensProvider';
import { FeatureDetector } from './services/featureDetector';
import { BaselineChecker } from './services/baselineChecker';
import { DecorationManager } from './services/decorationManager';
import { DiagnosticsProvider } from './services/diagnosticsProvider';
import { QuickFixProvider } from './providers/quickFixProvider';
import { PolyfillSuggestions } from './services/polyfillSuggestions';
import { FrameworkDetector } from './services/frameworkDetector';

export function activate(context: vscode.ExtensionContext) {
    // Create an output channel for logging
    const outputChannel = vscode.window.createOutputChannel('Baseline Buddy');
    outputChannel.appendLine('🚀 BASELINE BUDDY EXTENSION ACTIVATED! 🚀');
    
    // Show activation message
    vscode.window.showInformationMessage('Baseline Buddy activated! Move cursor to see web feature compatibility in status bar.');

    // Create status bar item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '🔍 Baseline Buddy';
    statusBarItem.show();

    const detector = new FeatureDetector();
    const baselineChecker = new BaselineChecker();
    
    // Initialize providers
    const hoverProvider = new HoverProvider(outputChannel);
    const codeLensProvider = new BaselineCodeLensProvider(outputChannel);
    const decorationManager = new DecorationManager(outputChannel);
    const diagnosticsProvider = new DiagnosticsProvider(outputChannel);
    const quickFixProvider = new QuickFixProvider(outputChannel);
    const polyfillSuggestions = new PolyfillSuggestions();
    const frameworkDetector = new FrameworkDetector();
    
    // Register hover providers
    const hoverProviders = [
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'css' }, hoverProvider),
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'javascript' }, hoverProvider),  
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'typescript' }, hoverProvider),
        vscode.languages.registerHoverProvider({ scheme: 'file', language: 'html' }, hoverProvider)
    ];

    // Register CodeLens providers
    const codeLensProviders = [
        vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'css' }, codeLensProvider),
        vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'javascript' }, codeLensProvider),
        vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'typescript' }, codeLensProvider),
        vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'html' }, codeLensProvider)
    ];

    // Register Code Action providers
    const codeActionProviders = [
        vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'css' }, quickFixProvider),
        vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'javascript' }, quickFixProvider),
        vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'typescript' }, quickFixProvider),
        vscode.languages.registerCodeActionsProvider({ scheme: 'file', language: 'html' }, quickFixProvider)
    ];

    // Document change handlers
    const onDidChangeActiveTextEditor = async (editor: vscode.TextEditor | undefined) => {
        if (editor) {
            await decorationManager.updateDecorations(editor);
            await diagnosticsProvider.updateDiagnostics(editor.document);
        }
    };

    const onDidChangeTextDocument = async (event: vscode.TextDocumentChangeEvent) => {
        const activeEditor = vscode.window.activeTextEditor;
        if (activeEditor && event.document === activeEditor.document) {
            await decorationManager.updateDecorations(activeEditor);
            await diagnosticsProvider.updateDiagnostics(event.document);
        }
    };

    // Update status bar when cursor moves
    const cursorListener = vscode.window.onDidChangeTextEditorSelection(async (event) => {
        if (!event.textEditor) {return;}
        
        const config = vscode.workspace.getConfiguration('baseline-buddy');
        if (!config.get('enableStatusBar', true)) {
            return;
        }
        
        const doc = event.textEditor.document;
        const pos = event.selections[0].active;
        
        // Skip output and other non-code files
        if (!['css', 'javascript', 'typescript', 'html'].includes(doc.languageId)) {
            statusBarItem.text = '$(search) Baseline Buddy';
            return;
        }
        
        const line = doc.lineAt(pos.line).text;
        const features = detector.detectFeatures(line, doc.languageId);
        
        if (features.length > 0) {
            // Find feature at cursor position
            const cursorFeature = features.find(f => 
                pos.character >= f.range.start && pos.character <= f.range.end
            );
            
            if (cursorFeature) {
                const status = await baselineChecker.checkFeature(cursorFeature.featureId);
                const icon = getStatusIcon(status.status);
                statusBarItem.text = `${icon} ${cursorFeature.featureId} (${getStatusText(status.status)})`;
                statusBarItem.tooltip = `Baseline: ${status.description || cursorFeature.featureId}`;
            } else {
                statusBarItem.text = `$(search) Features: ${features.map(f => f.featureId).join(', ')}`;
            }
        } else {
            statusBarItem.text = '$(search) Baseline Buddy';
        }
    });

    // Register event listeners
    const activeEditorListener = vscode.window.onDidChangeActiveTextEditor(onDidChangeActiveTextEditor);
    const documentChangeListener = vscode.workspace.onDidChangeTextDocument(onDidChangeTextDocument);

    // Test command - also test common feature IDs
    const testCommand = vscode.commands.registerCommand('baseline-buddy.test', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const doc = editor.document;
            const line = doc.lineAt(editor.selection.active.line);
            const features = detector.detectFeatures(line.text, doc.languageId);
            
            if (features.length > 0) {
                const status = await baselineChecker.checkFeature(features[0].featureId);
                vscode.window.showInformationMessage(`${features[0].featureId}: ${status.status}`);
            }
        }
        
        // Test fetch-related feature IDs 
        const fetchIds = ['fetch', 'fetch-api', 'xhr', 'xmlhttprequest'];
        outputChannel.appendLine('🧪 Testing fetch-related feature IDs:');
        for (const id of fetchIds) {
            const status = await baselineChecker.checkFeature(id);
            outputChannel.appendLine(`  ${id}: ${status.status}`);
        }
    });

    // Feature details command for CodeLens
    const featureDetailsCommand = vscode.commands.registerCommand('baseline-buddy.showFeatureDetails', 
        (featureId: string, baselineStatus: any) => {
            const panel = vscode.window.createWebviewPanel(
                'featureDetails',
                `Baseline: ${featureId}`,
                vscode.ViewColumn.One,
                { enableScripts: true }
            );

            panel.webview.html = getFeatureDetailsHtml(featureId, baselineStatus);
        }
    );

    // Install polyfill command
    const installPolyfillCommand = vscode.commands.registerCommand('baseline-buddy.installPolyfill',
        async (featureId: string) => {
            const suggestion = polyfillSuggestions.getSuggestion(featureId);
            if (suggestion) {
                const choice = await vscode.window.showInformationMessage(
                    `Install ${suggestion.polyfill} polyfill for ${featureId}?`,
                    'Install', 'View Info', 'Cancel'
                );

                if (choice === 'Install') {
                    const terminal = vscode.window.createTerminal('Baseline Buddy');
                    terminal.sendText(suggestion.installation);
                    terminal.show();
                } else if (choice === 'View Info') {
                    const panel = vscode.window.createWebviewPanel(
                        'polyfillInfo',
                        `Polyfill: ${suggestion.polyfill}`,
                        vscode.ViewColumn.One,
                        {}
                    );
                    panel.webview.html = getPolyfillInfoHtml(suggestion);
                }
            }
        }
    );

    // Refresh compatibility data command  
    const refreshCommand = vscode.commands.registerCommand('baseline-buddy.refreshCompatibility',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                await decorationManager.updateDecorations(editor);
                await diagnosticsProvider.updateDiagnostics(editor.document);
                vscode.window.showInformationMessage('Compatibility data refreshed!');
            }
        }
    );

    context.subscriptions.push(
        statusBarItem,
        cursorListener,
        activeEditorListener,
        documentChangeListener,
        testCommand,
        featureDetailsCommand,
        installPolyfillCommand,
        refreshCommand,
        decorationManager,
        diagnosticsProvider,
        ...hoverProviders,
        ...codeLensProviders,
        ...codeActionProviders
    );
}

function getStatusIcon(status: string): string {
    switch (status) {
        case 'widely-available': return '$(check-all)';
        case 'newly-available': return '$(clock)'; 
        case 'limited-availability': return '$(warning)';
        default: return '$(question)';
    }
}

function getStatusText(status: string): string {
    switch (status) {
        case 'widely-available': return 'Widely Available';
        case 'newly-available': return 'Newly Available';
        case 'limited-availability': return 'Limited Availability';
        default: return 'Unknown';
    }
}

function getFeatureDetailsHtml(featureId: string, baselineStatus: any): string {
    const support = baselineStatus.status?.support || {};
    const statusIcon = getStatusIcon(baselineStatus.status);
    
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Baseline: ${featureId}</title>
        <style>
            body { 
                font-family: var(--vscode-font-family); 
                color: var(--vscode-foreground);
                background: var(--vscode-editor-background);
                padding: 20px;
            }
            .status { 
                display: flex; 
                align-items: center; 
                margin: 20px 0; 
            }
            .browser-support {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 10px;
                margin: 20px 0;
            }
            .browser {
                padding: 10px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 4px;
                text-align: center;
            }
            .supported { background: var(--vscode-inputValidation-infoBorder); }
            .unsupported { background: var(--vscode-inputValidation-errorBorder); }
            .links { margin-top: 30px; }
            .links a { 
                color: var(--vscode-textLink-foreground);
                text-decoration: none;
                margin-right: 20px;
            }
        </style>
    </head>
    <body>
        <h1>${statusIcon} ${featureId}</h1>
        <div class="status">
            <strong>Status:</strong> ${getStatusText(baselineStatus.status)}
        </div>
        
        <div class="description">
            <p>${baselineStatus.description || 'No description available.'}</p>
        </div>

        <h2>Browser Support</h2>
        <div class="browser-support">
            <div class="browser ${support.chrome ? 'supported' : 'unsupported'}">
                <strong>Chrome</strong><br>
                ${support.chrome || 'Not supported'}
            </div>
            <div class="browser ${support.firefox ? 'supported' : 'unsupported'}">
                <strong>Firefox</strong><br>
                ${support.firefox || 'Not supported'}
            </div>
            <div class="browser ${support.safari ? 'supported' : 'unsupported'}">
                <strong>Safari</strong><br>
                ${support.safari || 'Not supported'}
            </div>
            <div class="browser ${support.edge ? 'supported' : 'unsupported'}">
                <strong>Edge</strong><br>
                ${support.edge || 'Not supported'}
            </div>
        </div>

        <div class="links">
            <h2>Resources</h2>
            <a href="https://developer.mozilla.org/search?q=${encodeURIComponent(featureId)}" target="_blank">MDN Documentation</a>
            <a href="https://caniuse.com/?search=${encodeURIComponent(featureId)}" target="_blank">Can I Use</a>
            <a href="https://web.dev/baseline/${encodeURIComponent(featureId)}" target="_blank">Web.dev Baseline</a>
        </div>
    </body>
    </html>`;
}

function getPolyfillInfoHtml(suggestion: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Polyfill: ${suggestion.polyfill}</title>
        <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 20px; }
            pre { background: var(--vscode-editor-background); padding: 10px; border-radius: 4px; }
            a { color: var(--vscode-textLink-foreground); }
        </style>
    </head>
    <body>
        <h1>🔧 ${suggestion.polyfill}</h1>
        <p>${suggestion.description}</p>
        
        <h2>Installation</h2>
        <pre><code>${suggestion.installation}</code></pre>
        
        <h2>Usage</h2>
        <pre><code>import '${suggestion.polyfill}';</code></pre>
        
        <p><a href="${suggestion.url}" target="_blank">View Documentation</a></p>
    </body>
    </html>`;
}

// This method is called when your extension is deactivated
export function deactivate() {}
