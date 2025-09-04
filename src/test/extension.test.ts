import * as assert from 'assert';
import * as vscode from 'vscode';
import { FeatureDetector } from '../services/featureDetector';
import { BaselineChecker } from '../services/baselineChecker';
import { HoverProvider } from '../providers/hoverProvider';

suite('Baseline Buddy Extension Tests', () => {
    vscode.window.showInformationMessage('Start all tests.');

    suite('FeatureDetector Tests', () => {
        let detector: FeatureDetector;

        setup(() => {
            detector = new FeatureDetector();
        });

        test('Should detect CSS Grid', () => {
            const result = detector.detectFeatures('display: grid;', 'css');
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].featureId, 'grid');
        });

        test('Should detect Flexbox', () => {
            const result = detector.detectFeatures('display: flex;', 'css');
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].featureId, 'flexbox');
        });

        test('Should detect fetch API', () => {
            const result = detector.detectFeatures('fetch("/api/data")', 'javascript');
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].featureId, 'xhr');
        });

        test('Should detect async functions', () => {
            const result = detector.detectFeatures('async function getData() {}', 'javascript');
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].featureId, 'async-await');
        });

        test('Should detect HTML semantic elements', () => {
            const result = detector.detectFeatures('<article>', 'html');
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].featureId, 'article');
        });

        test('Should detect TypeScript interfaces', () => {
            const result = detector.detectFeatures('interface User {}', 'typescript');
            assert.strictEqual(result.length, 1);
            assert.strictEqual(result[0].featureId, 'typescript-interfaces');
        });

        test('Should handle empty input gracefully', () => {
            const result = detector.detectFeatures('', 'css');
            assert.strictEqual(result.length, 0);
        });

        test('Should handle unknown language', () => {
            const result = detector.detectFeatures('display: grid;', 'unknown');
            assert.strictEqual(result.length, 0);
        });

        test('Should return correct range positions', () => {
            const result = detector.detectFeatures('  display: grid;  ', 'css');
            assert.strictEqual(result.length, 1);
            assert.ok(result[0].range.start >= 0);
            assert.ok(result[0].range.end > result[0].range.start);
        });
    });

    suite('BaselineChecker Tests', () => {
        let checker: BaselineChecker;

        setup(() => {
            checker = new BaselineChecker();
        });

        test('Should return status for known feature', async () => {
            const result = await checker.checkFeature('css-grid');
            assert.ok(result);
            assert.ok(['widely-available', 'newly-available', 'limited-availability', 'unknown'].includes(result.status));
            assert.strictEqual(result.feature, 'css-grid');
        });

        test('Should return unknown for non-existent feature', async () => {
            const result = await checker.checkFeature('non-existent-feature');
            assert.strictEqual(result.status, 'unknown');
            assert.strictEqual(result.feature, 'non-existent-feature');
            assert.ok(result.description?.includes('not found'));
        });
    });

    suite('HoverProvider Tests', () => {
        let provider: HoverProvider;
        let document: vscode.TextDocument;

        setup(async () => {
            const mockOutputChannel = {
                appendLine: () => {},
                show: () => {},
                hide: () => {},
                dispose: () => {},
                name: 'test',
                append: () => {},
                clear: () => {},
                replace: () => {}
            } as vscode.OutputChannel;
            
            provider = new HoverProvider(mockOutputChannel);
            
            // Create a test document
            const uri = vscode.Uri.parse('untitled:test.css');
            document = await vscode.workspace.openTextDocument(uri);
        });

        test('Should return undefined for empty line', async () => {
            const position = new vscode.Position(0, 0);
            const result = await provider.provideHover(document, position, new vscode.CancellationTokenSource().token);
            assert.strictEqual(result, undefined);
        });

        test('Should handle cancellation token', async () => {
            const position = new vscode.Position(0, 0);
            const source = new vscode.CancellationTokenSource();
            source.cancel();
            
            const result = await provider.provideHover(document, position, source.token);
            assert.strictEqual(result, undefined);
        });
    });
});
