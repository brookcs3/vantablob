# VS Code Setup Recommendations

To optimally work on this project in Visual Studio Code, you should install the following extensions. They will provide syntax highlighting, formatting, and AI assistance tailored to this specific stack.

## Required Extensions

### 1. GLSL Support
*   **Extension:** `GLSL Literal` or `Comment tagged templates`
*   **Why:** The Three.js shaders in this project are written as inline template literals (e.g., `` vertexShader: `...` ``). Without this extension, your shader code will just look like a giant green string. This extension provides syntax highlighting inside those backticks.

### 2. Tailwind CSS
*   **Extension:** `Tailwind CSS IntelliSense` (by Tailwind Labs)
*   **Why:** Provides autocomplete, syntax highlighting, and linting for Tailwind utility classes in `App.tsx`.

### 3. React & TypeScript
*   **Extension:** `ES7+ React/Redux/React-Native snippets`
*   **Why:** Speeds up boilerplate creation for any new React components.
*   **Extension:** `Prettier - Code formatter` & `ESLint`
*   **Why:** Standardizes formatting across the TypeScript files.

## AI & Agentic Extensions

To continue the AI-assisted workflow locally, consider these tools:

### 1. Gemini Code Assist / Google Cloud Code
*   **Why:** Integrates Google's Gemini models directly into your IDE for code generation, explanation, and debugging.

### 2. Claude Dev / Cline
*   **Why:** An autonomous coding agent that lives in your IDE. It can read your workspace, run terminal commands, and edit files exactly like the AI Studio environment does.

### 3. GitHub Copilot
*   **Why:** The industry standard for inline autocomplete as you type.

## Workspace Settings (`.vscode/settings.json`)
For the best experience with inline shaders, add this to your workspace settings:
```json
{
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    "class:\\s*?[\"'`]([^\"'`]*).*?,"
  ]
}
```
