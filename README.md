# 
<div align="center">
  <img src="https://raw.githubusercontent.com/alljaybly/allanjblythe-gmail.com/main/public/logo.svg" alt="Baseline Feature Scout Logo" width="120">
  <h1 align="center">Baseline Feature Scout</h1>
  <p align="center">
    An AI-powered tool to help web developers instantly discover, evaluate, and adopt modern web features using Baseline data.
  </p>
  <p align="center">
    <a href="https://github.com/alljaybly/allanjblythe-gmail.com/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  </p>
</div>

An AI-powered tool to help web developers instantly discover, evaluate, and adopt modern web features using Baseline data. It reduces the friction from compatibility checks by providing clear, actionable insights and tooling integrations.

This project includes both a **web application** for a rich, visual experience and a **VS Code extension** for seamless integration into your development workflow.

---

<!-- Baseline Feature Scout Learning Playground](/images/Baseline .png -->
<div align="center">
  <em>![Baseline Feature Scout Learning Playground](/images/Baseline .png)</em>
</div>

---

## ✨ Key Features

The toolkit is split into two powerful components that work together to streamline your development process.

### 🌐 Web Application

- **🤖 AI-Powered Chat:** Ask natural language questions about any web feature (e.g., "Is CSS nesting ready for production?"). Get instant, context-aware answers powered by the Gemini API.
- **🔎 Project Scanner:** Upload your project folder to get a "Baseline Score." The scanner analyzes your HTML, CSS, and JavaScript files **locally in your browser** to identify features with limited support. Your code never leaves your machine.
- **⚙️ Instant Integrations:** Based on your scan results, generate configuration files for popular tools. Export ESLint configurations to flag problematic features or create a GitHub Action to run Baseline checks in your CI/CD pipeline.
- **📚 Learn & Discover:** Explore newly available features and learn about the Baseline concept directly within the app.

### 🔌 VS Code Extension

- **✅ Inline Diagnostics:** Get real-time feedback directly in your editor. The extension adds squiggly underlines for features with 'Limited' (Warning) or 'Newly' (Information) available status.
- **📊 Problems Panel Integration:** All findings are listed in the VS Code "Problems" tab, allowing for easy navigation and management of compatibility issues.
- **🚀 Scan On-Demand:** Run a full workspace scan at any time using the "Baseline Scout: Scan Workspace" command from the Command Palette.
- **💯 Status Bar Score:** Keep an eye on your project's health with a live "Baseline Score" displayed directly in the VS Code status bar.

## 🔬 How It Works

Baseline Feature Scout operates entirely on the client-side to ensure your code remains private and secure.

1.  **Local Code Parsing**: When you upload a project or run a scan in VS Code, the tool reads your `HTML`, `CSS`, and `JavaScript`/`TypeScript` files in memory.
2.  **AST Generation**: It uses industry-standard parsers (Babel, CSS Tree, HTMLParser2) to create Abstract Syntax Trees (ASTs) from your code. This provides a structured representation of your project's features.
3.  **Feature Identification**: The scanner traverses these ASTs to identify known web platform APIs, CSS properties, and HTML tags.
4.  **Baseline Comparison**: Each identified feature is cross-referenced with a cached dataset from the [Web Platform Dashboard API](https://webstatus.dev/docs/api/) to determine its Baseline status (`widely available`, `newly available`, or `limited availability`).
5.  **Reporting**: The results are aggregated into a "Baseline Score" and presented in a detailed dashboard, giving you actionable insights into your project's compatibility.

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **AI:** [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview)
- **VS Code Extension:** [VS Code API](https://code.visualstudio.com/api), TypeScript
- **Code Analysis:** [Babel](https://babeljs.io/), [CSS Tree](https://github.com/csstree/csstree), [HTMLParser2](https://github.com/fb55/htmlparser2)
- **Data Source:** [Web Platform Dashboard API](https://webstatus.dev/docs/api/)

## 🚀 Getting Started

### Web Application

Follow these steps to get a local copy of the project up and running.

1.  **Prerequisites:**
    - Node.js (v18 or higher recommended)
    - npm (or yarn/pnpm)

2.  **Installation:**
    ```bash
    git clone https://github.com/alljaybly/allanjblythe-gmail.com.git baseline-feature-scout
    cd baseline-feature-scout
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173`.

### VS Code Extension

To run the extension in development mode:

1.  **Open the project in VS Code:**
    ```bash
    code .
    ```

2.  **Install extension dependencies:**
    ```bash
    cd vscode-extension
    npm install
    cd ..
    ```

3.  **Compile the extension:** Press `Ctrl+Shift+B` (or `Cmd+Shift+B`) and select `tsc: watch - vscode-extension/tsconfig.json`. This will watch for changes and recompile automatically.

4.  **Launch the Extension Development Host:** Press `F5` to open a new VS Code window with the Baseline Feature Scout extension loaded.

5.  **Usage:**
    - Open a project folder in the new Extension Development Host window.
    - Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and type `Baseline Scout: Scan Workspace`.
    - Observe the results in the "Problems" panel, as inline squiggles in your code, and in the status bar.

## ⚡️ Project Updates
- Added voice input to AI Chat, fixed PWA icon 404. Deploy to Netlify with VITE_GEMINI_API_KEY.
- Fixed PWA icon 404 by updating vite.config.ts to use manifest.webmanifest. Deploy to Netlify.
- Fixed PWA manifest errors and icon 404s with updated manifest.webmanifest and vite.config.ts.

## 🗺️ Roadmap

We have many ideas to make Baseline Feature Scout even better! Here's a glimpse of what we're thinking about:

- [ ] **Expanded Framework Support:** Add scanners for Vue, Svelte, and other popular frameworks.
- [ ] **Advanced JS Analysis:** Implement more sophisticated checks for JavaScript features that aren't easily found by name (e.g., prototype methods).
- [ ] **AI-Powered Suggestions:** Integrate Gemini more deeply to suggest polyfills, fallbacks, or alternative approaches for features with limited support.
- [ ] **Shareable Reports:** Generate a public URL for a scan report that can be shared with your team.
- [ ] **Performance Analysis:** Add checks for performance-related features and best practices.

## 🙌 Contributing

Contributions are welcome! Whether you're fixing a bug, proposing a new feature, or improving documentation, your help is appreciated. Please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-awesome-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some awesome feature'`).
5.  Push to the branch (`git push origin feature/your-awesome-feature`).
6.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
