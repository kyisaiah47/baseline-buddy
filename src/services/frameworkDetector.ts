import * as vscode from 'vscode';

export interface FrameworkFeature {
    feature: string;
    framework: 'react' | 'vue' | 'angular' | 'svelte';
    version?: string;
    polyfill?: string;
    alternative?: string;
}

export class FrameworkDetector {
    private reactPatterns: Map<RegExp, FrameworkFeature> = new Map([
        [/useLayoutEffect/i, {
            feature: 'useLayoutEffect',
            framework: 'react',
            version: '16.8+',
            alternative: 'useEffect for non-layout effects'
        }],
        [/useDeferredValue/i, {
            feature: 'useDeferredValue',
            framework: 'react',
            version: '18.0+',
            alternative: 'useState with setTimeout for older versions'
        }],
        [/Suspense/i, {
            feature: 'Suspense',
            framework: 'react',
            version: '16.6+',
            alternative: 'Loading states with conditional rendering'
        }],
        [/React\.lazy/i, {
            feature: 'React.lazy',
            framework: 'react',
            version: '16.6+',
            alternative: 'Dynamic imports with loading states'
        }],
        [/useTransition/i, {
            feature: 'useTransition',
            framework: 'react',
            version: '18.0+',
            alternative: 'Custom loading states for older versions'
        }]
    ]);

    private vuePatterns: Map<RegExp, FrameworkFeature> = new Map([
        [/<script setup>/i, {
            feature: 'script setup',
            framework: 'vue',
            version: '3.0+',
            alternative: 'Options API or Composition API setup()'
        }],
        [/defineProps/i, {
            feature: 'defineProps',
            framework: 'vue',
            version: '3.0+',
            alternative: 'props option in Options API'
        }],
        [/defineEmits/i, {
            feature: 'defineEmits',
            framework: 'vue',
            version: '3.0+',
            alternative: 'emits option in Options API'
        }],
        [/Teleport/i, {
            feature: 'Teleport',
            framework: 'vue',
            version: '3.0+',
            alternative: 'Portal libraries for Vue 2'
        }],
        [/Suspense.*#fallback/i, {
            feature: 'Suspense',
            framework: 'vue',
            version: '3.0+',
            alternative: 'Loading states with v-if/v-else'
        }]
    ]);

    private angularPatterns: Map<RegExp, FrameworkFeature> = new Map([
        [/@Component.*standalone:\s*true/i, {
            feature: 'Standalone Components',
            framework: 'angular',
            version: '14.0+',
            alternative: 'NgModule-based components'
        }],
        [/inject\(/i, {
            feature: 'inject()',
            framework: 'angular',
            version: '14.0+',
            alternative: 'Constructor injection'
        }],
        [/@defer/i, {
            feature: 'Deferrable Views',
            framework: 'angular',
            version: '17.0+',
            alternative: 'Lazy loading with router or dynamic imports'
        }],
        [/control flow.*@if/i, {
            feature: 'New Control Flow',
            framework: 'angular',
            version: '17.0+',
            alternative: '*ngIf, *ngFor structural directives'
        }]
    ]);

    detectFrameworkFeatures(text: string, fileName?: string): FrameworkFeature[] {
        const features: FrameworkFeature[] = [];
        
        // Auto-detect framework based on file context
        const framework = this.detectFramework(text, fileName);
        
        let patterns: Map<RegExp, FrameworkFeature>;
        
        switch (framework) {
            case 'react':
                patterns = this.reactPatterns;
                break;
            case 'vue':
                patterns = this.vuePatterns;
                break;
            case 'angular':
                patterns = this.angularPatterns;
                break;
            default:
                // Check all patterns if framework is unclear
                patterns = new Map([
                    ...this.reactPatterns,
                    ...this.vuePatterns,
                    ...this.angularPatterns
                ]);
        }

        for (const [pattern, feature] of patterns) {
            if (pattern.test(text)) {
                features.push(feature);
            }
        }

        return features;
    }

    private detectFramework(text: string, fileName?: string): 'react' | 'vue' | 'angular' | null {
        // Check file extensions
        if (fileName) {
            if (fileName.endsWith('.vue')) {return 'vue';}
            if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) {return 'react';}
            if (fileName.endsWith('.component.ts') || fileName.endsWith('.component.html')) {return 'angular';}
        }

        // Check imports and content
        if (/import.*from ['"]react['"]|import.*from ['"]@angular/.test(text)) {
            return text.includes('@angular') ? 'angular' : 'react';
        }
        
        if (/<template>|<script.*setup>/.test(text)) {
            return 'vue';
        }

        if (/@Component|@Injectable|@NgModule/.test(text)) {
            return 'angular';
        }

        return null;
    }

    generateFrameworkWarning(feature: FrameworkFeature): string {
        return `⚠️ **${feature.feature}** requires ${feature.framework} ${feature.version || 'latest'}

${feature.alternative ? `**Alternative:** ${feature.alternative}` : ''}

Consider checking your ${feature.framework} version or using a compatible alternative.`;
    }
}