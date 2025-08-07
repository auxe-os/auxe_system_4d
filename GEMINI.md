# GEMINI Project Documentation: Interactive 3D Portfolio

## 1. Project Overview

This project is an immersive and interactive 3D portfolio website for a creative/software agency named "auxeOS". It presents a virtual desktop environment built with **Three.js** for the 3D world and **React** for the user interface.

The user navigates a 3D scene depicting a desk setup. The main interaction point is the computer monitor, which displays a fully functional website loaded within an `iframe`. The project features a sophisticated camera system with animated transitions, a retro-style loading sequence, and integrated audio to create an engaging user experience.

The backend is a simple **Node.js/Express** server responsible for serving the static application files and handling a contact form submission via email.

## 2. Tech Stack

-   **Frontend 3D:**
    -   **Three.js:** Core library for 3D rendering and scene management.
    -   **GLSL:** Custom shaders for effects like coffee steam and screen noise.
-   **Frontend UI:**
    -   **React:** For building the user interface components (loading screen, overlays, controls).
    -   **TypeScript:** For static typing across the entire application.
    -   **Framer Motion:** For UI animations.
-   **Backend:**
    -   **Node.js:** JavaScript runtime for the server.
    -   **Express:** Web framework for serving files and handling API requests.
    -   **Nodemailer:** For sending emails from the contact form.
-   **Build & Tooling:**
    -   **Webpack:** For bundling the application assets.
    -   **Babel:** For transpiling modern JavaScript and React code.
    -   **Prettier:** For code formatting.

## 3. Project Structure

The codebase is organized into several key directories:

```
/
├─── bundler/       # Webpack configurations (common, dev, prod).
├─── docs/          # Project documentation and conceptual ideas.
├─── server/        # Node.js/Express backend server code.
├─── src/           # Main application source code.
│   ├─── Application/ # Core Three.js application logic.
│   │   ├─── Audio/       # Audio management and sources.
│   │   ├─── Camera/      # Camera controls and keyframe animations.
│   │   ├─── Shaders/     # GLSL shader files.
│   │   ├─── UI/          # React UI components and event bus.
│   │   ├─── Utils/       # Utility classes (Sizes, Time, Resources).
│   │   └─── World/       # 3D world objects and environment setup.
│   ├─── script.ts    # Main entry point of the application.
│   └─── index.html   # Main HTML file.
└─── static/        # Static assets (3D models, textures, audio, images).
```

## 4. Setup and Installation

To set up the project for local development, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd portfolio-website
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```

## 5. Development Commands

The following scripts are available in `package.json`:

-   **Run the development server:**
    -   This command starts the Webpack development server with hot-reloading.
    -   ```bash
        npm run dev
        ```
-   **Build for production:**
    -   This command bundles the application for production into the `/public` directory.
    -   ```bash
        npm run build
        ```
-   **Start the production server:**
    -   This command starts the Express server to serve the production build from the `/public` directory.
    -   ```bash
        npm start
        ```

## 6. Code Style and Conventions

-   **Formatting:** Code is formatted using **Prettier** with a `tabWidth` of 4 and single quotes. Run the formatter before committing changes.
-   **Typing:** The project uses **TypeScript**. Ensure all new code is strongly typed. Global types are defined in `src/types.d.ts`.
-   **Architecture:**
    -   The Three.js application is structured around a singleton `Application` class (`src/Application/Application.ts`) which manages the main components like the scene, camera, renderer, and world.
    -   The 3D world is composed of various classes in `src/Application/World/`, each representing a part of the scene (e.g., `Computer.ts`, `Environment.ts`).
    -   Communication between the 3D canvas and the React UI is handled via a custom `UIEventBus` (`src/Application/UI/EventBus.ts`).

## 7. Key Components and Logic

-   **Main Application (`src/Application/Application.ts`):** The central hub of the 3D experience. It initializes all core modules and manages the main update loop.
-   **World (`src/Application/World/World.ts`):** Responsible for instantiating and managing all visible and audible objects in the scene after resources are loaded.
-   **Camera System (`src/Application/Camera/`):** A stateful camera manager that uses keyframes (`CameraKeyframes.ts`) and the TWEEN.js library to create smooth, cinematic transitions between different views (e.g., from an overview to focusing on the monitor).
-   **Interactive Monitor (`src/Application/World/MonitorScreen.ts`):** This is a key feature. It uses Three.js's `CSS3DObject` to render an `<iframe>` within the 3D scene. This allows a separate, fully interactive website to be displayed on the virtual monitor. It also includes logic to manage mouse events, bubbling them from the iframe to the main application to control camera transitions.
-   **React UI (`src/Application/UI/`):** The UI is built with React and rendered into separate DOM elements overlaid on the canvas. It includes a retro BIOS-style loading screen and on-screen controls. The `UIEventBus` is used to trigger UI changes from the 3D application (e.g., hiding the loading screen when assets are ready).
-   **Backend Server (`server/index.ts`):** A simple Express server that serves the built static files and provides a single API endpoint `/api/send-email` for the contact form. **Note:** For the contact form to work, you must set the `FOLIO_EMAIL` and `FOLIO_PASSWORD` environment variables.

## 8. Detailed Application Analysis and Deployment Considerations

### Detailed Overview of Your Application

Your application is a **3D interactive portfolio website** built with a modern JavaScript/TypeScript stack. It features a Three.js-powered 3D scene (likely a desk environment) with interactive elements and a React-based UI overlay. It also includes a small Node.js backend for handling contact form submissions.

Here's a breakdown of how it works:

1.  **Frontend (3D Interactive Experience & UI):**
    *   **Core Technologies:**
        *   **Three.js:** The primary library for creating and rendering the 3D scene. Files like `src/Application/Application.ts`, `src/Application/World/World.ts`, and various sub-components (e.g., `Computer.ts`, `MonitorScreen.ts`, `CoffeeSteam.ts`) manage the 3D models, lighting, camera, and interactions within the virtual environment.
        *   **React:** Used for building the 2D user interface elements that overlay the 3D scene. This includes components like `LoadingScreen.tsx`, `HelpPrompt.tsx`, `MuteToggle.tsx`, and `InfoOverlay.tsx` found in `src/Application/UI/components/`.
        *   **TypeScript:** The entire frontend (and backend) is written in TypeScript, providing type safety and better code organization.
        *   **Webpack:** The bundler (`bundler/webpack.common.js`, `webpack.dev.js`, `webpack.prod.js`) compiles your TypeScript, React, CSS, and GLSL shaders into optimized static assets for the browser. It also handles asset loading (images, audio, 3D models).
        *   **GLSL Shaders:** Custom shaders (`src/Application/Shaders/`) are used for visual effects, such as the coffee steam and screen effects, adding to the immersive experience.
    *   **User Interaction:** The application captures mouse and keyboard events (`src/Application/Utils/Mouse.ts`, `src/Application/Audio/AudioSources.ts`) to enable interaction within the 3D scene (e.g., camera movement, clicking objects) and trigger audio feedback.
    *   **Audio:** An `AudioManager` (`src/Application/Audio/AudioManager.ts`) handles playing various sound effects (keyboard clicks, mouse clicks, ambient office sounds) based on user interactions and camera position.
    *   **Camera Control:** The `Camera` class (`src/Application/Camera/Camera.ts`) manages different camera views and transitions (idle, monitor, desk, free cam), enhancing the guided experience.
    *   **Monitor Screen:** The `MonitorScreen.ts` integrates an `iframe` to display external web content (currently `https://auxe.framer.website/`) within the 3D scene, acting as a dynamic display for your portfolio or other information.

2.  **Backend (Email Service):**
    *   **Technology:** Node.js with Express.js (`server/index.ts`).
    *   **Functionality:** It exposes a single API endpoint (`/api/send-email`) that receives contact form data (name, company, email, message) and uses `nodemailer` to send an email.
    *   **Environment Variables:** It relies on `process.env.FOLIO_EMAIL` and `process.env.FOLIO_PASSWORD` for email authentication, which means these sensitive credentials should be configured as environment variables in your hosting environment, *not* hardcoded in the repository.

**In summary:** This is a sophisticated web application that combines an engaging 3D experience with a functional UI and a basic backend for communication. The build process is well-defined using Webpack, and the use of TypeScript promotes maintainability.

### Deployment Considerations for `auxeos.co`

#### Git Repository

**Recommendation:** **Absolutely, yes!** Creating a Git repository is crucial for version control, collaboration, and seamless deployment. You already have a `.git/` directory, indicating it's already a Git repository. Ensure it's properly connected to a remote (e.g., GitHub) and push your changes there.

#### Best Hosting Platform

Given your application has both a static frontend (React/Three.js) and a Node.js backend, you need a hosting solution that can accommodate both. Here are some recommendations:

1.  **Vercel (Highly Recommended for your setup):**
    *   **Pros:**
        *   **Excellent for Frontend:** Optimized for React and static site deployment, offering blazing-fast global CDN delivery.
        *   **Serverless Functions:** You can easily deploy your Node.js `server/index.ts` as a serverless function (e.g., an API route). Vercel automatically detects and deploys Node.js functions.
        *   **Integrated CI/CD:** Connects directly to your Git repository for automatic deployments on push.
        *   **Custom Domains:** Easy to configure `auxeos.co`.
        *   **Developer Experience:** Very user-friendly and focused on modern web development.
    *   **Cons:** Serverless functions have cold starts and execution limits, but for a simple email endpoint, this is usually not an issue.

2.  **Netlify:**
    *   **Pros:** Very similar to Vercel for static site hosting and build process. Also supports serverless functions.
    *   **Cons:** May require a bit more manual configuration for Node.js functions compared to Vercel's automatic detection.

3.  **AWS Amplify:**
    *   **Pros:**
        *   **Full-Stack Hosting:** Designed for full-stack applications, integrating with other AWS services (Lambda for serverless, S3 for storage, etc.).
        *   **Scalable:** Highly scalable for both frontend and backend.
    *   **Cons:** Can have a steeper learning curve if you're not familiar with AWS. Might be overkill for a simple email backend.

4.  **Render:**
    *   **Pros:**
        *   **Unified Platform:** Can host both static sites and web services (Node.js backend) on the same platform.
        *   **Simpler than AWS:** Easier to set up and manage than raw AWS services.
        *   **Free Tier:** Offers a generous free tier for small projects.
    *   **Cons:** May not have the same global CDN performance as Vercel/Netlify for static assets, but still very good.

5.  **Heroku (Backend) + Vercel/Netlify (Frontend):**
    *   **Pros:** Heroku is excellent for deploying Node.js applications quickly. You could deploy your `server/index.ts` there.
    *   **Cons:** This would involve managing two separate deployments and potentially dealing with CORS issues between your frontend and backend if they are on different domains/subdomains. It adds complexity.

**Overall Recommendation:** For your specific setup, **Vercel** is likely the best choice due to its seamless integration of React static sites with Node.js serverless functions, excellent developer experience, and easy custom domain setup.

### Next Steps for Deployment

1.  **Create a GitHub/GitLab/Bitbucket Repository:** If you haven't already, create a new empty repository on your preferred Git hosting service.
2.  **Push Your Code:** Connect your local Git repository to the remote one and push your entire codebase.
3.  **Sign up for Vercel:** Create an account on Vercel.
4.  **Import Project:** Import your Git repository into Vercel.
5.  **Configure Environment Variables:** In Vercel, go to your project settings and add your `FOLIO_EMAIL` and `FOLIO_PASSWORD` as environment variables.
6.  **Deploy:** Trigger your first deployment.
7.  **Configure Custom Domain:** In Vercel, add `auxeos.co` as a custom domain and follow their instructions to update your DNS records with your domain registrar.

