# Baseline Buddy VS Code Extension

A VS Code extension that shows Baseline compatibility status for web platform features directly in your editor.

## Project Overview

**Problem**: Developers waste time researching browser compatibility for web features
**Solution**: Real-time Baseline status shown directly in VS Code while coding
**Goal**: Win the Baseline Tooling Hackathon by solving a real developer pain point

## Features

### Core Features (MVP)

- **Hover tooltips**: Show Baseline status when hovering over CSS properties and JavaScript APIs
- **Inline indicators**: Visual markers (colors/icons) next to web features in code
- **Status bar**: Display overall file compatibility score
- **Quick info**: Instant details about any selected web feature

### Advanced Features (Stretch Goals)

- **Code actions**: Suggest polyfills or alternatives for non-Baseline features
- **File analysis**: Scan entire files for Baseline compatibility
- **Settings**: Configure target Baseline level (2020, 2021, etc.)
- **Workspace overview**: Project-wide compatibility dashboard

## Technical Architecture

### Dependencies

- `web-features` - Official Baseline data package
- `@types/vscode` - VS Code extension API types
- `typescript` - Main development language

### Key Components

1. **FeatureDetector** - Parses code to identify web features
2. **BaselineChecker** - Looks up feature status in web-features data
3. **HoverProvider** - Shows tooltips on hover
4. **DecorationProvider** - Adds visual indicators to code
5. **StatusBarManager** - Updates status bar with compatibility info

### File Structure

```
baseline-buddy/
├── src/
│   ├── extension.ts           # Main entry point
│   ├── providers/
│   │   ├── hoverProvider.ts   # Tooltip functionality
│   │   └── decorationProvider.ts # Visual indicators
│   ├── services/
│   │   ├── featureDetector.ts # Parse code for web features
│   │   └── baselineChecker.ts # Query Baseline data
│   └── utils/
│       └── constants.ts       # Feature patterns and configs
├── package.json              # Extension manifest
└── README.md
```

## Implementation Strategy

### Phase 1: Basic Hover (Week 1)

1. Set up extension boilerplate with esbuild
2. Install and explore `web-features` package structure
3. Create basic hover provider for CSS properties
4. Test with simple features like `display: grid`

### Phase 2: Feature Detection (Week 2)

1. Build robust CSS property detection using regex patterns
2. Add JavaScript API detection (fetch, async/await, etc.)
3. Handle edge cases (vendor prefixes, nested properties)
4. Expand to HTML elements and attributes

### Phase 3: Visual Enhancement (Week 3)

1. Add colored underlines/decorations for different Baseline levels
2. Create status bar integration showing file score
3. Design clear, informative tooltip UI
4. Add icons and better visual hierarchy

### Phase 4: Polish & Demo (Week 4)

1. Handle performance optimization for large files
2. Add configuration options
3. Write comprehensive README and demo examples
4. Create 3+ minute demo video
5. Prepare hackathon submission

## Data Integration

### Web-Features Package Usage

```javascript
import webFeatures from "web-features";

// Check if a feature is Baseline
const feature = webFeatures["css-grid"];
const baselineStatus = feature.status?.baseline;

// Status values:
// false = Limited availability
// "newly" = Newly available
// true = Widely available
```

### Feature Detection Patterns

```javascript
// CSS Properties to detect
const cssPatterns = {
	"display: grid": "css-grid",
	"container-query": "css-container-queries",
	":has()": "css-has",
};

// JavaScript APIs to detect
const jsPatterns = {
	"fetch(": "fetch-api",
	"async ": "async-functions",
	IntersectionObserver: "intersection-observer",
};
```

## VS Code Extension APIs

### Key APIs to Use

- `vscode.languages.registerHoverProvider` - For tooltips
- `vscode.window.createTextEditorDecorationType` - For visual indicators
- `vscode.window.createStatusBarItem` - For status bar
- `vscode.workspace.onDidChangeTextDocument` - For real-time updates

### Extension Activation

```json
{
	"activationEvents": [
		"onLanguage:css",
		"onLanguage:javascript",
		"onLanguage:typescript",
		"onLanguage:html"
	]
}
```

## Demo Strategy

### Demo Script (3+ minutes)

1. **Problem setup** (30s): Show typical developer workflow checking compatibility manually
2. **Extension intro** (30s): Install and activate Baseline Buddy
3. **CSS demo** (60s): Hover over various CSS properties, show status tooltips
4. **JavaScript demo** (60s): Show API compatibility checking
5. **Status bar demo** (30s): Show file-level compatibility scoring
6. **Value prop** (30s): "No more manual compatibility checking!"

### Demo Files to Prepare

- **modern.css** - Mix of widely available and newly available features
- **experimental.js** - Some limited availability APIs to show warnings
- **legacy.html** - Older features to show green "widely available" status

## Success Metrics

### For Hackathon Judging

- **Functionality**: Does it actually work and solve the stated problem?
- **Integration**: How well does it fit into existing VS Code workflows?
- **Data accuracy**: Correctly uses official web-features data
- **User experience**: Clear, helpful, non-intrusive interface
- **Demo quality**: Clear 3+ minute video showing real value

### Technical Goals

- Support major file types: CSS, JavaScript, TypeScript, HTML
- Handle 1000+ line files without performance issues
- Accurate feature detection with minimal false positives
- Clear visual hierarchy in tooltips and decorations

## Submission Requirements

### Required Deliverables

1. **GitHub repo** with open-source license
2. **VS Code Marketplace listing** (hosted project URL)
3. **Demo video** (3+ minutes showing functionality)
4. **Complete README** with installation and usage instructions
5. **Submission form** with comprehensive description

### Documentation Needed

- Clear installation instructions
- Feature overview with screenshots
- Technical implementation details
- Future roadmap and potential improvements

## Development Tips

### Quick Wins

- Start with just CSS hover tooltips - get something working fast
- Use VS Code's built-in CSS/JS language detection
- Focus on common features developers actually use daily
- Make tooltips visually appealing with icons and clear status

### Performance Considerations

- Cache web-features data on extension startup
- Throttle real-time analysis for large files
- Only analyze visible code ranges initially
- Optimize regex patterns for feature detection

### Testing Strategy

- Test with popular CSS frameworks (Tailwind, Bootstrap)
- Try modern JS codebases using latest APIs
- Verify accuracy against Can I Use manually
- Test performance with large files (1000+ lines)

## Competitive Advantages

What makes this extension special:

- **Real-time feedback** - instant compatibility info while coding
- **Official data source** - uses the same web-features data as MDN
- **Non-disruptive** - shows info on demand, doesn't clutter interface
- **Comprehensive** - covers CSS, JavaScript, HTML, and APIs
- **Actionable** - not just status, but helpful context and suggestions

This project directly solves the hackathon's stated problem: eliminating the productivity tax of manual compatibility research.
