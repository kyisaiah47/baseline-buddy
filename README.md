# Baseline Buddy

A VS Code extension that shows web feature compatibility information directly in your editor using the Baseline standard.

## Features

- **Hover tooltips** - Get instant compatibility information when hovering over CSS properties, JavaScript APIs, HTML elements, and TypeScript features
- **Multi-language support** - Works with CSS, JavaScript, TypeScript, and HTML files
- **Real-time feedback** - See compatibility status with visual indicators (✅ Widely Available, 🟡 Newly Available, ⚠️ Limited Availability)
- **Configurable** - Customize which features to show and hide through VS Code settings

## Supported Features

### CSS
- Layout: Grid, Flexbox, Subgrid, Gap properties
- Container Queries and CSS selectors (:has, :is, :where)
- Modern properties: aspect-ratio, backdrop-filter, clip-path
- Transforms, transitions, and animations
- Color schemes and visual effects

### JavaScript
- Modern APIs: fetch, AbortController, URL API
- Async/await and Promises
- Observer APIs (Intersection, Resize, Mutation, Performance)
- Array and String methods (includes, find, replaceAll, etc.)
- Web APIs: Geolocation, LocalStorage, FormData

### HTML
- Form input types (date, email, tel, url, etc.)
- Semantic elements (article, section, nav, etc.)
- Media elements (video, audio, picture)
- Interactive elements (details, summary, dialog)

### TypeScript
- All JavaScript features plus TypeScript-specific syntax
- Interfaces, type aliases, enums
- Access modifiers, abstract classes
- Namespaces and advanced typing features

## Requirements

- VS Code 1.103.0 or higher
- No additional dependencies required

## Extension Settings

This extension contributes the following settings:

* `baseline-buddy.enableHover`: Enable/disable hover tooltips (default: true)
* `baseline-buddy.showUnsupportedFeatures`: Show compatibility info for features with limited availability (default: true)
* `baseline-buddy.includeBrowserList`: List of browsers to consider for compatibility checks (default: ["chrome", "firefox", "safari", "edge"])

## How to Use

1. Open any CSS, JavaScript, TypeScript, or HTML file
2. Hover over web features like `display: grid`, `fetch()`, `<article>`, etc.
3. See instant compatibility information with visual status indicators
4. Configure settings through VS Code preferences to customize behavior

## Known Issues

- Some complex regex patterns may not catch all feature variations
- Baseline data is updated periodically - very new features may not be included immediately

## Release Notes

### 0.0.1

Initial release with full feature detection and baseline compatibility checking.

---

## Contributing

This project is open source and contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - see LICENSE file for details.

**Enjoy coding with confidence knowing your web features are Baseline compatible!** 🚀
