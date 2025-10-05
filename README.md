# Baseline Feature Scout

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

An AI-powered tool to help web developers instantly discover, evaluate, and adopt modern web features using Baseline data. It reduces the friction from compatibility checks by providing clear, actionable insights and tooling integrations.

This project includes both a **web application** for a rich, visual experience and a **VS Code extension** for seamless integration into your development workflow.

---

## ✨ Key Features

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

---

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

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **AI:** [Google Gemini API](https://ai.google.dev/docs/gemini_api_overview)
- **VS Code Extension:** [VS Code API](https://code.visualstudio.com/api), TypeScript
- **Code Analysis:** [Babel](https://babeljs.io/), [CSS Tree](https://github.com/csstree/csstree), [HTMLParser2](https://github.com/fb55/htmlparser2)
- **Data Source:** [Web Platform Dashboard API](https://webstatus.dev/docs/api/)

---

## 📄 License

This project is licensed under the MIT License.
