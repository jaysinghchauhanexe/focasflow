# FocusFlow 🌿

> **A mindful, calm, and intelligent daily life operating system designed for deep focus, task mastery, and mental well-being.**

FocusFlow reimagines personal productivity by combining local-first privacy, on-device AI scheduling, offline Whisper speech recognition, and comprehensive analytics into a soothing, distraction-free desktop experience.

---

## ✨ Features

### 🧠 Local & Cloud AI Assistant

- **On-Device WebLLM & Ollama**: Run models like `Qwen 2.5` or `Llama 3.2` directly in your browser/desktop with WebGPU or connect your local Ollama daemon.
- **Natural Language Task Operations**: Add, reschedule, split, or prioritize tasks using simple conversational commands (e.g. _"Schedule 2 hours for client API tomorrow at 3 PM"_).
- **Smart Intent Sanitization**: Distinguishes between conversational chat and actionable task modifications with safe preview cards.

### 🎙️ 100% On-Device Whisper Voice Input

- **Offline Speech-to-Text**: Powered by `@xenova/transformers` with pre-bundled `whisper-base.en` ONNX weights in WebAssembly.
- **Acoustic Noise & Echo Cancellation**: Dual-stage vocal bandpass DSP filtering (80 Hz to 7,800 Hz) isolates human speech and filters out background music, speaker bleed, and room rumble.
- **Zero Cloud Leakage**: Voice dictation runs entirely on your device with no external API calls.

### 📊 Deep Analytics & Visual Intelligence

- **Focus Time Trends**: 7-day stacked bar charts displaying daily tracked minutes with interactive peak tooltips.
- **Category & Duration Breakdown**: Proportional donut visualization of focus distribution across Work, Study, Health, and Personal projects.
- **Priority Completion Velocity**: Multi-line trajectory curves tracking outcomes across Critical, Important, and Flexible tasks.
- **7×24 Productivity Heatmap**: Hourly activity matrix mapping your most energized focus windows throughout the week.
- **100% Real Metrics**: Zero simulated or placeholder figures—all metrics compute directly from your live timer and task history.

### 🎯 Mindful Daily Dashboard

- **Spotlight Focus Timer**: Active countdown and count-up focus timer with gentle visual cues and audio chimes.
- **Diurnal Productivity Summary**: Dynamic sky gradients reflecting time of day with remaining capacity counters.
- **Flexible Tasks & Routines**: Group outcomes by priority, energy level, and recurring habit schedules.

### 🧘 Wellness & Mental Balance

- **Breathing Modals & Reset**: Guided 4-7-8 and box-breathing animations to recenter between focus blocks.
- **Lofi Soundscapes**: Built-in ambient station player (Study, Deep Work, Coffee Shop) with adjustable volume.
- **Mood Tracking & Overload Detection**: Automatic prompts to defer low-priority tasks when planned capacity exceeds healthy thresholds.

### 🎨 Beautiful Design System

- **Curated Themes**: Calming Sage Green, Cyan/Teal, Sapphire Blue, Monochrome, and Sleek Dark mode.
- **Dynamic Typography**: Seamlessly switch between editorial serif (_Gilda Display_) and clean grotesque sans-serif (_DM Sans_, _Inter_, _Plus Jakarta Sans_).
- **Zero Shadows Philosophy**: Clean, elevated borders and soft pill containers that eliminate visual clutter.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Bundler & Dev Server**: [Vite](https://vitejs.dev/)
- **Desktop Runtime**: [Tauri v2](https://tauri.app/) (Rust-backed native wrapper)
- **Styling**: [TailwindCSS](https://tailwindcss.com/) + Custom CSS Design Tokens
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) with persistent LocalStorage
- **Local AI Engines**:
  - Speech-to-Text: [`@xenova/transformers`](https://huggingface.co/docs/transformers.js) (`whisper-base.en`)
  - Text LLM: [`@mlc-ai/web-llm`](https://webllm.mlc.ai/) + Ollama REST API
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm` (or `pnpm` / `yarn`)
- _(Optional for Desktop App)_: [Rust & Tauri Prerequisites](https://tauri.app/start/prerequisites/)

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/focusflow.git
   cd focusflow
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:1420](http://localhost:1420) in your browser.

4. **Run as a desktop application (Tauri)**:
   ```bash
   npm run tauri dev
   ```

---

## 📁 Project Structure

```text
focasflow/
├── public/
│   ├── models/
│   │   └── whisper-base.en/    # Bundled ONNX speech recognition weights
│   ├── sound effects/          # Focus timer audio chimes
│   └── app-icon.png
├── src/
│   ├── components/             # Reusable UI components & modals
│   │   ├── BreathingModal.tsx  # Guided breathing reset
│   │   ├── CustomSelect.tsx    # Custom floating dropdowns
│   │   ├── DoodleIllustrations.tsx # Hand-drawn vector illustrations
│   │   ├── HeaderHero.tsx      # Daily greeting & date badge
│   │   ├── LofiBackgroundPlayer.tsx # Ambient music player
│   │   ├── ProductivitySummary.tsx # Diurnal sky & capacity ring
│   │   └── Sidebar.tsx         # Collapsible main navigation
│   ├── engine/                 # Core AI, audio & scheduler algorithms
│   │   ├── aiClient.ts         # Multi-provider LLM connector
│   │   ├── scheduler.ts        # Smart time allocation algorithm
│   │   ├── webLlmService.ts    # WebGPU local browser models
│   │   └── whisperService.ts   # On-device Whisper STT & DSP audio filters
│   ├── store/
│   │   └── useAppStore.ts      # Central Zustand store & persistence
│   ├── types/
│   │   └── index.ts            # Core TypeScript interfaces & schemas
│   ├── views/                  # Primary application views
│   │   ├── AiAssistantView.tsx # AI chat & voice assistant
│   │   ├── AnalyticsView.tsx   # Detailed charts & hourly heatmap
│   │   ├── GoalsView.tsx       # Long-term vision & milestones
│   │   ├── HabitsView.tsx      # Daily habit tracker
│   │   ├── HistoryView.tsx     # Historical daily logs & notes
│   │   ├── PreferencesView.tsx # Theme, font & soundscape settings
│   │   ├── RoutinesView.tsx    # Morning & evening sequences
│   │   ├── ScheduleView.tsx    # Calendar time blocking
│   │   ├── TasksView.tsx       # Full task backlog & filters
│   │   └── TodayView.tsx       # Daily dashboard & spotlight
│   ├── App.tsx                 # Root router & layout wrapper
│   ├── index.css               # Design tokens, themes & typography
│   └── main.tsx                # Application entry point
├── src-tauri/                  # Tauri desktop configuration & Rust backend
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Privacy & Offline Philosophy

FocusFlow is built with a strict **local-first** architecture:

- All task data, habits, reflections, and timer sessions stay stored on your machine.
- Speech recognition runs 100% locally via WebAssembly/WebGPU with no external telemetry.
- If you use local Ollama or WebLLM, entire AI workflows operate without an internet connection.

---

## 📜 License

This project is licensed under the **MIT License**.
