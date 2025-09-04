export interface PolyfillSuggestion {
    feature: string;
    polyfill: string;
    url: string;
    description: string;
    installation: string;
}

export class PolyfillSuggestions {
    private suggestions: Map<string, PolyfillSuggestion> = new Map([
        // JavaScript Features
        ['fetch', {
            feature: 'fetch',
            polyfill: 'whatwg-fetch',
            url: 'https://github.com/github/fetch',
            description: 'Polyfill for the Fetch API',
            installation: 'npm install whatwg-fetch'
        }],
        ['promise', {
            feature: 'promise',
            polyfill: 'es6-promise',
            url: 'https://github.com/stefanpenner/es6-promise',
            description: 'Polyfill for ES6 Promises',
            installation: 'npm install es6-promise'
        }],
        ['intersection-observer', {
            feature: 'intersection-observer',
            polyfill: 'intersection-observer',
            url: 'https://github.com/w3c/IntersectionObserver/tree/main/polyfill',
            description: 'Polyfill for Intersection Observer API',
            installation: 'npm install intersection-observer'
        }],
        ['resize-observer', {
            feature: 'resize-observer',
            polyfill: 'resize-observer-polyfill',
            url: 'https://github.com/que-etc/resize-observer-polyfill',
            description: 'Polyfill for Resize Observer API',
            installation: 'npm install resize-observer-polyfill'
        }],
        ['url', {
            feature: 'url',
            polyfill: 'url-polyfill',
            url: 'https://github.com/lifaon74/url-polyfill',
            description: 'Polyfill for URL constructor',
            installation: 'npm install url-polyfill'
        }],

        // CSS Features
        ['grid', {
            feature: 'grid',
            polyfill: 'css-grid-polyfill',
            url: 'https://github.com/FremyCompany/css-grid-polyfill',
            description: 'Polyfill for CSS Grid Layout (IE 10-11)',
            installation: 'npm install css-grid-polyfill'
        }],
        ['flexbox', {
            feature: 'flexbox',
            polyfill: 'flexibility',
            url: 'https://github.com/jonathantneal/flexibility',
            description: 'Polyfill for Flexbox (IE 8-9)',
            installation: 'npm install flexibility'
        }],
        ['has', {
            feature: 'has',
            polyfill: 'css-has-pseudo',
            url: 'https://github.com/csstools/postcss-plugins/tree/main/plugins/css-has-pseudo',
            description: 'Transform :has() selectors for older browsers',
            installation: 'npm install css-has-pseudo'
        }],
        ['container-queries', {
            feature: 'container-queries',
            polyfill: 'container-query-polyfill',
            url: 'https://github.com/GoogleChromeLabs/container-query-polyfill',
            description: 'Polyfill for CSS Container Queries',
            installation: 'npm install container-query-polyfill'
        }],

        // HTML Features
        ['dialog', {
            feature: 'dialog',
            polyfill: 'dialog-polyfill',
            url: 'https://github.com/GoogleChrome/dialog-polyfill',
            description: 'Polyfill for HTML5 dialog element',
            installation: 'npm install dialog-polyfill'
        }],
        ['details', {
            feature: 'details',
            polyfill: 'details-element-polyfill',
            url: 'https://github.com/javan/details-element-polyfill',
            description: 'Polyfill for HTML5 details/summary elements',
            installation: 'npm install details-element-polyfill'
        }],
        ['picture', {
            feature: 'picture',
            polyfill: 'picturefill',
            url: 'https://github.com/scottjehl/picturefill',
            description: 'Responsive images polyfill for picture element',
            installation: 'npm install picturefill'
        }]
    ]);

    getSuggestion(featureId: string): PolyfillSuggestion | undefined {
        return this.suggestions.get(featureId);
    }

    getAllSuggestions(): PolyfillSuggestion[] {
        return Array.from(this.suggestions.values());
    }

    hasPolyfill(featureId: string): boolean {
        return this.suggestions.has(featureId);
    }

    generatePolyfillMarkdown(featureId: string): string {
        const suggestion = this.getSuggestion(featureId);
        if (!suggestion) {
            return `No polyfill suggestions available for ${featureId}.`;
        }

        return `## 🔧 Polyfill Available

**${suggestion.polyfill}** - ${suggestion.description}

**Installation:**
\`\`\`bash
${suggestion.installation}
\`\`\`

**Usage:**
\`\`\`javascript
import '${suggestion.polyfill}';
\`\`\`

[View Documentation](${suggestion.url})`;
    }
}