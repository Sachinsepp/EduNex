# EduNex 🎓✨

> **EduNex** is a next-generation AI-powered education platform built with Next.js 15, TypeScript, Tailwind CSS, and Firebase Genkit AI. It empowers students and educators with intelligent learning assistants, interactive dashboards, and real-time analytics.

---

## 🚀 Features

- 🤖 **AI-Powered Learning Assistance**: Powered by Firebase Genkit & Google AI models for interactive learning, content generation, and smart tutoring.
- 📊 **Interactive Analytics & Dashboards**: Visual performance tracking and insights built with Recharts and Radix UI components.
- 🔐 **Secure Authentication**: Built-in user authentication using JWT and secure password hashing.
- 🎨 **Modern & Dynamic UI/UX**: Crafted with Tailwind CSS, Radix UI primitives, Lucide React icons, and dark mode styling.
- 🐳 **Docker & App Hosting Ready**: Includes `docker-compose.yml`, custom Dockerfile setups, and Firebase App Hosting configuration (`apphosting.yaml`).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI Integration**: [Google Genkit AI](https://firebase.google.com/docs/genkit) (`@genkit-ai/googleai`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **State & Data Handling**: React Hook Form & Zod Schema Validation
- **Database/Cache**: Redis (`ioredis`)

---

## 🏁 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn / pnpm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sachinsepp/EduNex.git
   cd EduNex
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```

4. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Genkit AI Developer UI (Optional):**
   ```bash
   npm run genkit:dev
   ```

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Starts Next.js development server with Turbopack |
| `npm run build` | Builds the production web application |
| `npm run start` | Runs the production build |
| `npm run genkit:dev` | Launches the Genkit AI Developer UI |
| `npm run typecheck` | Runs TypeScript type checking |
| `npm run lint` | Runs Next.js ESLint checks |

---

## 👤 Maintainer & Owner

- **Sachinsepp** ([@Sachinsepp](https://github.com/Sachinsepp)) — Project Owner & Sole Contributor

---

## 📄 License

This project is licensed under the MIT License.

