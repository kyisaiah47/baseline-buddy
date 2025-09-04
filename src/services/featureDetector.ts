export interface FeatureMatch {
    featureId: string;
    range: {
        start: number;
        end: number;
    };
}

export class FeatureDetector {
    private cssPatterns: Map<RegExp, string> = new Map([
        // Layout
        [/display\s*:\s*grid/i, 'grid'],
        [/display\s*:\s*flex/i, 'flexbox'],
        [/display\s*:\s*subgrid/i, 'subgrid'],
        [/gap\s*:/i, 'gap-decorations'],
        [/grid-template/i, 'grid'],
        [/place-items/i, 'grid'],
        [/place-content/i, 'grid'],
        
        // Container Queries & Selectors
        [/@container/i, 'container-queries'],
        [/container-type/i, 'container-queries'],
        [/:has\(/i, 'has'],
        [/:is\(/i, 'is'],
        [/:where\(/i, 'where'],
        
        // Modern CSS Properties
        [/aspect-ratio/i, 'aspect-ratio'],
        [/object-fit/i, 'object-fit'],
        [/backdrop-filter/i, 'backdrop-filter'],
        [/clip-path/i, 'clip-path'],
        [/mask\s*:/i, 'masks'],
        
        // Transforms & Animations
        [/transform\s*:/i, 'transforms2d'],
        [/transition\s*:/i, 'transitions'],
        [/animation\s*:/i, 'animations-css'],
        [/@keyframes/i, 'animations-css'],
        
        // Color & Visual
        [/color-scheme/i, 'color-scheme'],
        [/accent-color/i, 'accent-color'],
        [/filter\s*:/i, 'filter'],
        [/mix-blend-mode/i, 'mix-blend-mode'],
        
        // Typography
        [/font-display/i, 'font-display'],
        [/font-variation-settings/i, 'font-variation-settings'],
        [/text-decoration-thickness/i, 'text-decoration'],
        
        // Scroll & Interaction
        [/scroll-behavior/i, 'scroll-behavior'],
        [/scroll-snap/i, 'scroll-snap'],
        [/overscroll-behavior/i, 'overscroll-behavior'],
        [/touch-action/i, 'touch-action']
    ]);

    private jsPatterns: Map<RegExp, string> = new Map([
        // Fetch & Network  
        [/fetch\s*\(/i, 'xhr'],
        [/new\s+AbortController/i, 'aborting'],
        [/new\s+URLSearchParams/i, 'url'],
        [/new\s+URL\s*\(/i, 'url'],
        
        // Async/Await
        [/async\s+function/i, 'async-await'],
        [/await\s/i, 'async-await'],
        [/Promise\s*\./i, 'promise'],
        [/Promise\s*\(/i, 'promise'],
        
        // Observers
        [/new\s+IntersectionObserver/i, 'intersection-observer'],
        [/new\s+ResizeObserver/i, 'resize-observer'],
        [/new\s+MutationObserver/i, 'mutationobserver'],
        [/new\s+PerformanceObserver/i, 'performance'],
        
        // String & Array Methods
        [/\.replaceAll\(/i, 'string-replaceall'],
        [/\.includes\(/i, 'array-includes'],
        [/\.find\(/i, 'array-find'],
        [/\.findIndex\(/i, 'array-find'],
        [/\.flatMap\(/i, 'array-flat'],
        [/\.flat\(/i, 'array-flat'],
        
        // Modern JavaScript Features
        [/\.entries\(/i, 'object-object'],
        [/\.values\(/i, 'object-object'],
        [/\.keys\(/i, 'object-object'],
        [/Object\.assign/i, 'object-object'],
        [/\.\.\.\s*\w+/i, 'spread'],
        [/const\s+\{.*\}\s*=/i, 'destructuring'],
        [/let\s+\[.*\]\s*=/i, 'destructuring'],
        
        // Web APIs
        [/navigator\.geolocation/i, 'geolocation'],
        [/localStorage/i, 'localstorage'],
        [/sessionStorage/i, 'localstorage'],
        [/new\s+FormData/i, 'file'],
        [/requestAnimationFrame/i, 'request-animation-frame'],
        [/new\s+Intl\./i, 'intl']
    ]);

    private htmlPatterns: Map<RegExp, string> = new Map([
        // Form Elements
        [/<input[^>]*type=["']?date/i, 'input-date-time'],
        [/<input[^>]*type=["']?email/i, 'input-email-tel-url'],
        [/<input[^>]*type=["']?tel/i, 'input-email-tel-url'],
        [/<input[^>]*type=["']?url/i, 'input-email-tel-url'],
        [/<input[^>]*type=["']?number/i, 'input-number'],
        [/<input[^>]*type=["']?range/i, 'input-range'],
        [/<input[^>]*type=["']?color/i, 'input-color'],
        [/<input[^>]*type=["']?search/i, 'search-input-type'],
        
        // Semantic Elements
        [/<article/i, 'article'],
        [/<section/i, 'section'],
        [/<nav/i, 'nav'],
        [/<header/i, 'header-footer'],
        [/<footer/i, 'header-footer'],
        [/<aside/i, 'aside'],
        [/<main/i, 'main'],
        [/<figure/i, 'figure'],
        [/<figcaption/i, 'figure'],
        
        // Media Elements
        [/<video/i, 'video'],
        [/<audio/i, 'audio'],
        [/<picture/i, 'picture'],
        [/<source/i, 'source'],
        
        // Interactive Elements
        [/<details/i, 'details'],
        [/<summary/i, 'details'],
        [/<dialog/i, 'dialog'],
        
        // Attributes
        [/contenteditable/i, 'contenteditable'],
        [/data-\w+/i, 'dataset'],
        [/draggable/i, 'draganddrop'],
        [/loading=["']?lazy/i, 'loading-lazy'],
        [/decoding=["']?async/i, 'loading-lazy']
    ]);

    private tsPatterns: Map<RegExp, string> = new Map([
        // Include all JS patterns plus TypeScript-specific
        ...Array.from(this.jsPatterns.entries()),
        
        // TypeScript-specific features
        [/interface\s+\w+/i, 'typescript-interfaces'],
        [/type\s+\w+\s*=/i, 'typescript-type-aliases'],
        [/enum\s+\w+/i, 'typescript-enums'],
        [/namespace\s+\w+/i, 'typescript-namespaces'],
        [/public\s+\w+/i, 'typescript-access-modifiers'],
        [/private\s+\w+/i, 'typescript-access-modifiers'],
        [/protected\s+\w+/i, 'typescript-access-modifiers'],
        [/readonly\s+\w+/i, 'typescript-readonly'],
        [/abstract\s+class/i, 'typescript-abstract-classes'],
        [/implements\s+\w+/i, 'typescript-implements']
    ]);

    detectFeatures(text: string, languageId: string): FeatureMatch[] {
        try {
            const matches: FeatureMatch[] = [];
            let patterns: Map<RegExp, string>;
            
            switch (languageId) {
                case 'css':
                    patterns = this.cssPatterns;
                    break;
                case 'html':
                    patterns = this.htmlPatterns;
                    break;
                case 'typescript':
                    patterns = this.tsPatterns;
                    break;
                case 'javascript':
                default:
                    patterns = this.jsPatterns;
                    break;
            }

            for (const [pattern, featureId] of patterns) {
                try {
                    let match;
                    pattern.lastIndex = 0;
                    
                    while ((match = pattern.exec(text)) !== null) {
                        // Validate match boundaries
                        const start = Math.max(0, match.index);
                        const end = Math.min(text.length, match.index + match[0].length);
                        
                        matches.push({
                            featureId,
                            range: {
                                start,
                                end
                            }
                        });
                        
                        if (!pattern.global) {
                            break;
                        }
                        
                        // Prevent infinite loops
                        if (pattern.lastIndex === match.index) {
                            pattern.lastIndex++;
                        }
                    }
                } catch (regexError) {
                    console.warn(`Regex error for pattern ${pattern} with feature ${featureId}:`, regexError);
                }
            }

            return matches;
        } catch (error) {
            console.error('Error in feature detection:', error);
            return [];
        }
    }
}