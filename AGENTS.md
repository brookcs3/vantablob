# AI Agent Instructions & Context

**CRITICAL RULE FOR ALL FUTURE AI AGENTS:**
The user has established a strict communication protocol due to past misinterpretations. 
**Before performing any coding at all, you MUST CONFIRM WITH THE USER and wait for them to explicitly say "Yes, that sounds good" (or a similar affirming statement).**
Do not assume approval. Do not write code in the same turn that you propose an architecture. Propose -> Wait for Yes -> Code.

## Project Context
This is a WebGL/Three.js audio visualization project built with React and Tailwind. It features a morphing 3D blob that reacts to audio.
The project uses a dual-mode audio engine:
1.  **Live DSP:** Real-time Web Audio API FFT analysis.
2.  **Timeline Mode (Player Piano):** Pre-authored JSON data for precise, expressive physics animations.

## Available System Skills
The AI Studio environment provides the following skills. Use them when relevant:
*   **frontend-design:** Use for UI/UX polish, Tailwind styling, and ensuring high-quality, non-generic design.
*   **Gemini API:** Use if integrating LLM features.
*   **OAuth Integration:** Use if adding user logins.
*   **Real-Time & Multi-User:** Use if adding WebSocket/multiplayer features.
*   **shadcn-ui:** Use if adding complex UI components (dialogs, dropdowns, etc.).

## Workflow
1. Read the user's request.
2. Check `/docs/AI_HANDOFF.md` and `/docs/CODEBASE_CATALOG.md` for context.
3. Formulate a plan.
4. **ASK FOR EXPLICIT CONFIRMATION.**
5. Only after receiving a "Yes", execute the code changes.
