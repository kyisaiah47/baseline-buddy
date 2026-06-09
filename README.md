<div align="center">

<img src="assets/banner.png" alt="banner" width="100%" />

# 🔧 Baseline Buddy

**Know if a web feature is safe to use — browser compatibility intel right inside VS Code**

![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

</div>

<br/>

Baseline Buddy is a VS Code extension that surfaces web feature compatibility data directly in your editor as you write CSS, JavaScript, TypeScript, and HTML. Powered by the [Baseline](https://web.dev/baseline) standard, it gives you instant, in-context feedback on whether a feature is widely supported, newly available, or still limited — so you can ship with confidence without leaving your editor.

## ✨ Features

- **Hover tooltips** — Instant compatibility info when hovering over CSS properties, JS APIs, HTML elements, and TypeScript features
- **Multi-language support** — Works across CSS, JavaScript, TypeScript, and HTML files
- **Baseline status indicators** — Clear visual signals: ✅ Widely Available, 🟡 Newly Available, ⚠️ Limited Availability
- **Broad feature coverage** — Detects CSS layout, modern JS APIs, semantic HTML, observer APIs, and more
- **Configurable** — Control which features appear and which browsers to target through VS Code settings
- **Zero dependencies** — No external tools or runtimes required

## 🎥 Demo

[![Watch Demo](https://img.shields.io/badge/YouTube-Watch%20Demo-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://www.youtube.com/watch?v=jksl2yLWIbQ)

## 🛠️ Tech Stack

VS Code Extension API · Baseline · TypeScript · CSS / JS / HTML language support

## 🚀 Getting Started

**Requirements:** VS Code 1.103.0 or higher — no additional dependencies needed.

1. Install the extension from the VS Code Marketplace
2. Open any CSS, JavaScript, TypeScript, or HTML file
3. Hover over a web feature (e.g. `display: grid`, `fetch()`, `<dialog>`) to see its Baseline status

**Available settings:**

| Setting | Default | Description |
|---|---|---|
| `baseline-buddy.enableHover` | `true` | Enable/disable hover tooltips |
| `baseline-buddy.showUnsupportedFeatures` | `true` | Show info for limited-availability features |
| `baseline-buddy.includeBrowserList` | `["chrome","firefox","safari","edge"]` | Browsers to consider for compatibility |

## 📄 License

MIT
