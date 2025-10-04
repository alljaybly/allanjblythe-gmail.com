# Baseline Feature Scout 🔭

*Your AI co-pilot for navigating the modern web platform.*

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Built with React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini-blueviolet?style=for-the-badge)](https://ai.google.dev/)

Baseline Feature Scout is an AI-powered tool designed to help web developers instantly discover, evaluate, and adopt modern web features. It eliminates the friction of checking browser compatibility by providing clear, actionable insights and tooling integrations, all based on [Google's Baseline](https://developer.chrome.com/docs/web-platform/baseline) data.

This project was created for the **Google/Devpost Baseline Tooling Hackathon**.

![App Screenshot Placeholder](https://user-images.githubusercontent.com/1028292/205315102-a17a783a-5347-4467-b8f3-529683884aac.png)

## ✨ Key Features

*   **🤖 AI-Powered Chat**: Ask natural language questions about any web feature (e.g., "Is CSS nesting safe to use?") and get detailed, context-aware answers powered by the Gemini API.
*   **📁 Project Scanner**: Upload your entire codebase to get a "Baseline Score." The tool scans your HTML, CSS, and JavaScript/TypeScript files locally in your browser, identifying features with limited browser support.
*   **🔧 Instant Integrations**: Export configurations for ESLint and GitHub Actions based on your scan results to enforce standards and prevent compatibility issues in your CI/CD pipeline.
*   **🎓 Interactive Learning Playground**: Get hands-on with modern web features through interactive tutorials with a live editor, preview pane, and real-time validation.
*   **🔒 Privacy First**: Your code never leaves your browser. All scanning and analysis are performed client-side, ensuring your intellectual property remains secure.
*   **📱 PWA Ready**: Install the app on your desktop or mobile device for a native-like experience.

## 🛠️ Built With

*   **Framework**: [React](https://reactjs.org/) & [Vite](https://vitejs.dev/)
*   **AI**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **UI & Animation**: [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
*   **Code Analysis**: [Babel](https://babeljs.io/), [CSSTree](https://github.com/csstree/csstree), [htmlparser2](https://github.com/fb55/htmlparser2)
*   **Data Source**: [Web Platform Dashboard API](https://webstatus.dev/) (`web-features`)

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or higher recommended)
*   `npm` or your preferred package manager (`yarn`, `pnpm`)

### Installation & Setup

1.  **Clone the Repository**
    ```sh
    git clone https://github.com/alljaybly/allanjblythe-gmail.com.git
    ```

2.  **Navigate to the Project Directory**
    ```sh
    cd baseline-feature-scout 
    ```

3.  **Install NPM Packages**
    ```sh
    npm install
    ```

4.  **Set Up Your API Key**
    *   The AI Chat feature requires a Google Gemini API key. You can get one for free from [Google AI Studio](https://makersuite.google.com/app/apikey).
    *   Create a new file named `.env` in the root of the project directory.
    *   Add your API key to the `.env` file like this:
        ```env
        API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```

5.  **Run the Development Server**
    ```sh
    npm run dev
    ```
    The application should now be running at `http://localhost:5173` (or another port if 5173 is busy).

## 📖 How to Use the App

Here’s a beginner-friendly guide to using Baseline Feature Scout.

### 💬 AI Chat

The AI Chat is your go-to place for quick questions about web features.

1.  Navigate to the **AI Chat** page from the header.
2.  In the input box at the bottom, type a question about a web feature.
    *   *Examples: "Tell me about the View Transitions API," "Is container queries ready for production?", "What is CSS subgrid?"*
3.  Press Enter or click the "Send" button.
4.  The AI will respond with a detailed explanation. If it recognizes a specific feature, it will show a **Feature Card** with its Baseline status, description, and a link to MDN.
5.  **Click the Feature Card** to open a modal with in-depth details, including a browser support table and links to the official specifications.

### 🔬 Scan Project

Analyze your own project to check for modern features and their browser support.

1.  Navigate to the **Scan Project** page.
2.  Click **"select a folder"** or drag and drop your entire project folder onto the designated area.
3.  The app will read your files locally (don't worry, nothing is uploaded!).
4.  Once the files are processed, click **"Start Scan"**.
5.  You'll be taken to the **Scan Result Dashboard**, where you can see:
    *   **Baseline Score**: An overall score for your project's compatibility.
    *   **Feature Summary**: A count of features found, categorized by their Baseline status (Widely, Newly, Limited).
    *   **Detected Issues**: A detailed table of every feature with limited support, grouped by file. You can click on a file to see the exact line number and even **copy the relevant code snippet** to your clipboard.

### 📤 Export Tools

After running a scan, you can generate configuration files to help maintain a high standard of compatibility in your project.

1.  First, run a scan on the **Scan Project** page.
2.  Navigate to the **Export Tools** page.
3.  Click **"Generate & Download"** on either card:
    *   **ESLint Config**: Creates an `.eslintrc.js` file that will warn you if you try to use any of the "limited availability" features found in your scan.
    *   **GitHub Action**: Creates a `.yml` file that you can add to your repository to automatically run a Baseline check on every pull request.

### 🏫 Learn

The Learning Playground is an interactive sandbox for trying out new web features.

1.  Navigate to the **Learn** page.
2.  Select a tutorial from the sidebar on the left.
3.  Follow the instructions at the top of the editor.
4.  Write your code in the editor panel. You'll see a **live preview** update in the panel on the right.
5.  The app provides real-time validation—if you use a feature with limited support, a warning will appear in the editor.
6.  Once you complete a step's objective, a "Well done!" message will appear, and you can move to the next step.

## 📄 License

Distributed under the MIT License.

## 📞 Contact

Allan Blythe - [https://github.com/alljaybly/allanjblythe-gmail.com](https://github.com/alljaybly/allanjblythe-gmail.com)

Project Link: [https://github.com/alljaybly/allanjblythe-gmail.com](https://github.com/alljaybly/allanjblythe-gmail.com)
