TrackWise - AI Health Companion

TrackWise is an AI companion designed to support individuals, particularly those in the UK, in managing chronic health conditions. It offers helpful information, a space to discuss challenges, and guidance on managing related stress and emotional well-being.

**Disclaimer**: TrackWise is not a substitute for professional medical or mental health advice. Always consult with a qualified healthcare provider for any medical concerns.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure & File Descriptions](#project-structure--file-descriptions)
- [Prompt Engineering](#prompt-engineering)
- [Getting Started: Running Locally for UI Preview](#getting-started-running-locally-for-ui-preview)
- [Deployment](#deployment)

## Features

- **Personalized Conversations**: Optionally provide info like your name, age, and health conditions to tailor the chat experience.
- **Empathetic AI**: Powered by Google's Gemini model, TrackWise is programmed to be a warm, patient, and supportive conversational partner.
- **Real-time Interaction**: Chat responses are streamed, providing a fluid and natural conversation flow.
- **Doctor's Note Flagging**: Easily flag any message from the AI to remember it for later discussion with your doctor.
- **On-Demand Summaries**: Generate a concise, objective summary of your conversation at any time. This is perfect for preparing for a GP or specialist appointment.
- **Privacy First**: No conversation data is stored. Your chat history is lost once you refresh the page or restart the chat.
- **UK-Centric Resources**: When appropriate, the AI suggests reputable UK-based health resources like the NHS and Mind.
- **Responsive Design**: Fully functional across desktop and mobile devices.

## Tech Stack

- **Frontend**: [React.js](https://reactjs.org/) (with Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Model**: [Google Gemini API](https://ai.google.dev/) (`@google/genai` SDK)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

The project is set up as a modern vanilla JS project using an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script/type/importmap) in `index.html`, which avoids the need for a complex build setup for development.

## Project Structure & File Descriptions

The project is structured to be simple and modular, avoiding a complex build setup.

-   `index.html`: The main entry point. It sets up the HTML document, loads Tailwind CSS, defines the import map for ES module resolution (like `react`, `@google/genai`), and loads the main application script.
-   `index.tsx`: The root of the React application. It finds the `root` DOM element and renders the main `App` component into it.
-   `App.tsx`: The core component of the application. It manages all major state, including the chat history, loading/error states, and the visibility of different UI components (Landing Page, Chat, Summary Modal). It orchestrates the entire user experience.
-   `metadata.json`: Contains basic metadata for the application, such as its name and description.
-   `types.ts`: Defines shared TypeScript types and enums used throughout the application, such as `ChatMessage` and `MessageSender`, ensuring type safety.
-   `constants.ts`: A centralized file for all static and configuration data. This includes the Gemini model name, initial bot messages, error messages, and—most importantly—the detailed system prompts that define the AI's persona and behavior for both general chat and summarization tasks.
-   `README.md`: This file, providing documentation for the project.

### `components/` Directory

Contains all the reusable React UI components.

-   `LandingPage.tsx`: The initial screen shown to the user to optionally collect context like their name, age, and conditions.
-   `ChatInput.tsx`: The form at the bottom of the chat interface, including the text area and send button.
-   `ChatMessageItem.tsx`: A component that renders a single chat message bubble, styling it differently for the user and the bot. It also handles rendering clickable links within messages.
-   `SummaryModal.tsx`: The modal dialog that appears to display the AI-generated conversation summary, including actions to copy or download it.

### `services/` Directory

-   `geminiService.ts`: This is the service layer that handles all communication with the Google Gemini API. It is responsible for initializing the AI client, creating chat sessions, sending messages (streaming), and requesting chat summaries. It's the only part of the app that directly interacts with `@google/genai`.

## Prompt Engineering

The behavior and persona of the TrackWise AI are defined by two main system instructions (prompts) stored in `constants.ts`. These prompts are crucial for guiding the model's responses and ensuring it adheres to its designed purpose and limitations.

### 1. Main Chat System Instruction

This prompt establishes the AI's persona, capabilities, limitations, and rules of engagement. It is dynamically augmented with user-provided context (name, age, etc.) to personalize the conversation.

**Key Aspects:**
-   **Persona**: A caring, patient, and respectful friend.
-   **Context**: UK-based support.
-   **Capabilities**: Empathetic listening, providing general health info, suggesting coping mechanisms, and guiding users to reputable UK resources (e.g., `https://nhs.uk`, `https://mind.org.uk`).
-   **Critical Limitations**: Explicitly forbidden from giving medical advice, diagnoses, or therapy. Includes clear instructions for handling crisis situations by directing users to emergency services.

*The full prompt can be reviewed in the `SYSTEM_INSTRUCTION` constant within `constants.ts`.*

### 2. Chat Summarization System Instruction

This prompt is used when the user requests a summary of the conversation. It instructs the model to act as a neutral assistant creating a factual summary for the user to take to a healthcare professional.

**Key Aspects:**
-   **Goal**: Create a concise, factual, and objective summary.
-   **Content Focus**: User's health concerns, symptoms, emotional challenges, and key points discussed.
-   **Format**: Use bullet points where appropriate and attribute statements to either the "User" or "TrackWise".
-   **Strict Guardrails**: Prohibits adding new information, interpretations, or medical advice. It must start and end with specific boilerplate text.

*The full prompt can be reviewed in the `SUMMARIZATION_PROMPT_SYSTEM_MESSAGE` constant within `constants.ts`.*

---

## Getting Started: Running Locally for UI Preview

This project is designed to be run from a simple static file server without a build step.

### Important: About the API Key

The application is architected for security and is designed to be deployed on a modern hosting platform (like Vercel, Netlify, etc.) that can securely manage and inject environment variables.

The code exclusively retrieves the Google Gemini API key from `process.env.API_KEY`. **`process.env` is not available in a standard browser environment.**

Therefore, when you run the app locally using the method below, you will be able to see and interact with the full UI, but **the AI chat functionality will be disabled.** The app will start, but it will display an error message in the chat window indicating a missing API key. This is the **expected behavior** for local development, as it prevents exposing a secret API key in client-side code.

To use the full application with all features enabled, please follow the [Deployment](#deployment) instructions.

### Prerequisites

-   A modern web browser that supports [import maps](https://caniuse.com/import-maps) (e.g., Chrome, Edge, Firefox, Safari).
-   A local web server. We recommend `serve` via `npx`, which requires no installation.

### Steps to Run the UI Preview

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Start the local server:**
    From the root of the project directory, run the following command:
    ```bash
    # If you don't have 'serve' installed, npx will fetch and run it for you
    npx serve .
    ```
    This will start a local server, typically at `http://localhost:3000`.

3.  **Open in browser:**
    Navigate to the URL provided by your local server (e.g., `http://localhost:3000`). You can now interact with the landing page and the chat UI.

## Deployment

The application is a static website and can be deployed to any hosting service that supports static files and environment variables (e.g., Vercel, Netlify, GitHub Pages with Actions, Firebase Hosting).

### General Instructions

1.  **Connect Your Git Repository**: Link your Git repository (e.g., on GitHub, GitLab) to your chosen hosting provider.
2.  **Configure Build Settings**: Since there is no build step, you can often leave build commands empty and set the output/publish directory to the project's root.
3.  **Set the Environment Variable (Crucial Step)**:
    -   In your hosting provider's project dashboard, navigate to the "Environment Variables" settings.
    -   Add a new environment variable:
        -   **Key**: `API_KEY`
        -   **Value**: Your_Google_Gemini_API_key
    -   This is the most important step. The deployed application will fail to connect to the Gemini service if this variable is not set correctly.
4.  **Deploy**: Trigger a deployment. Your site should now be live.

### Example: Deploying to Vercel

Vercel is an excellent choice for deploying this application as it's seamless for React projects and handles environment variables perfectly.

1.  **Sign up** for a Vercel account and connect your Git provider.
2.  **Create a New Project** and import your `trackwise` Git repository.
3.  **Configure Project**:
    -   Vercel will likely detect it's a React project but may ask for framework presets. You can select "Other" since there's no build step.
    -   Leave the **Build Command** empty.
    -   Set the **Output Directory** to the root of your project (usually not needed to change).
    -   Expand the **Environment Variables** section.
    -   Add a variable with the **Name** `API_KEY` and your Gemini API key as the **Value**.
4.  **Deploy**. Vercel will build (or in this case, simply deploy) your project and provide you with a live URL.
