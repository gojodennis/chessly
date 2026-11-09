# ♟️ Chessly — Chess.com Game Review & Analysis Replica

A production-grade, 1-to-1 client-side replica of **Chess.com's Game Review & Analysis Mode**, built with React 18, TypeScript, Tailwind CSS, and Web Workers.

![Chessly Review Preview](public/assets/boards/purple.png)

---

## ✨ Features

- **🎮 Dual-Mode Review Experience**:
  - **Overview Mode**: Displays overall accuracy scores (CAPS2 formula), estimated player performance ratings, comprehensive move classification matrix, and positional performance metrics.
  - **Active Coach Review**: Danny Rensch speech bubble coach commentary in plain English, contextual evaluation pills, and interactive move-by-move explanations.
- **⚡ Smart Key Moment Navigation**:
  - The green **`➔ Next`** button skips trivial moves and navigates sequentially between pivotal tactical inflection points (Book $\rightarrow$ Last Book $\rightarrow$ Inaccuracies $\rightarrow$ Mistakes $\rightarrow$ Missed Wins $\rightarrow$ Blunders $\rightarrow$ Brilliant Moves).
- **📚 235,000+ Polyglot Opening Book**:
  - Full Polyglot 64-bit Zobrist hashing and binary search (`O(log N)` $\le 18$ comparisons) across official tournament opening books.
  - 3,865 ECO opening names, variations, and lines mapped in real time.
- **🧠 100% Client-Side Engine (Web Worker)**:
  - PeSTO piece-square table evaluation, minimax search, and sigmoid win-percentage conversions.
  - Evaluation runs in a background Web Worker so the main UI thread stays at a silky 60 FPS.
- **🎨 Authentic Chess.com Visuals & Audio**:
  - Official Neo pieces and board textures (`purple`, `green`, `dark_wood`).
  - Preloaded vector badge overlays for all 10 move categories (*Brilliant, Great, Best, Excellent, Good, Book, Inaccuracy, Mistake, Miss, Blunder*).
  - Low-latency HTML5 audio pooling for moves, captures, checks, promotions, and castling.

---

## 🛠️ Tech Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **Chess Logic**: `chess.js` v1.0.0-beta.6
- **Architecture**: Web Workers, HTML5 Audio Pool, Zobrist Hashing

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/gojodennis/chessly.git
cd chessly

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
npm run preview
```

---

## 🌐 Deployment

Chessly is 100% serverless and static. It can be deployed in seconds to **Vercel**, **Netlify**, or **GitHub Pages**:

```bash
# Deploy with Vercel CLI
npx vercel
```

---

## 📄 License

MIT License. Designed and engineered for portfolio demonstration.

