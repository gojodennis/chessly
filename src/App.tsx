import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { runAnalysisAsync } from './engine/engineService';
import { GameReviewResult } from './engine/analysisEngine';
import { initPolyglotBook } from './engine/polyglot';
import { initOpeningsDatabase } from './engine/openingDetector';
import { extractKeyMoments, KeyMoment } from './engine/keyMoments';
import { parseGameMetadata, GameMetadata } from './engine/pgnParser';
import { soundManager, SoundType } from './audio/soundManager';
import { ChessBoard } from './components/Board/ChessBoard';
import { EvalBar } from './components/Board/EvalBar';
import { PlayerBanner } from './components/Board/PlayerBanner';
import { ReviewOverview } from './components/Review/ReviewOverview';
import { ActiveReviewPanel } from './components/Review/ActiveReviewPanel';
import { BoardArrow } from './components/Board/ArrowOverlay';
import { Upload, RefreshCw } from 'lucide-react';

export default function App() {
  const [boardTheme, setBoardTheme] = useState<'purple' | 'green' | 'dark_wood' | 'glass' | 'tournament'>('purple');
  const [orientation, setOrientation] = useState<'w' | 'b'>('w');
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Review flow state: 'overview' (Images 1 & 2) vs 'active' (Images 3 & 4)
  const [screenMode, setScreenMode] = useState<'overview' | 'active'>('overview');

  // Analysis & Key Moments State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; pct: number } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GameReviewResult | null>(null);
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(-1);
  const [currentKeyMomentIdx, setCurrentKeyMomentIdx] = useState<number>(0);

  // Autoplay State
  const [isPlaying, setIsPlaying] = useState(false);
  const autoplayTimerRef = useRef<any>(null);

  // Game PGN (Matching the user's uploaded screenshots: Caro-Kann with 9... h6, 10. e5, 11... g4, 12. Bxa7)
  const defaultPgn = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.11.09"]
[White "newbieme1112"]
[Black "gojodenys"]
[Result "1-0"]
[WhiteElo "591"]
[BlackElo "449"]
[TimeControl "180"]

1. e4 c6 2. Nc3 d5 3. exd5 cxd5 4. d4 Nc6 5. Be3 Bf5 6. Qd2 Qd7 7. O-O-O O-O-O 8. Bd3 Nf6 9. Nf3 h6 10. Ne5 Nxe5 11. dxe5 Ng4 12. Bxa7 e6 13. Bb6 Re8 14. Bb5 Qe7 15. Bxe8 Qxe8 16. f3 Nxe5 17. Qf4 Bd6 18. Qa4 Qxa4 19. Nxa4 Kd7 20. Bd4 Ra8 21. Nb6+ 1-0`;

  const [customPgn, setCustomPgn] = useState(defaultPgn);
  const [gameMeta, setGameMeta] = useState<GameMetadata>(() => parseGameMetadata(defaultPgn));
  const [showPgnInput, setShowPgnInput] = useState(false);

  // Initial load: preload assets, parse game and run analysis off main thread
  useEffect(() => {
    // 1. Audio pooling initialization
    soundManager.preload();

    // 2. Preload piece images into browser memory cache for zero-latency rendering
    const pieces = ['bb', 'bk', 'bn', 'bp', 'bq', 'br', 'wb', 'wk', 'wn', 'wp', 'wq', 'wr'];
    pieces.forEach(p => {
      const img = new Image();
      img.src = `/assets/pieces/neo/${p}.png`;
    });

    const badges = ['brilliant', 'great', 'best', 'excellent', 'good', 'book', 'inaccuracy', 'mistake', 'blunder', 'miss'];
    badges.forEach(b => {
      const img = new Image();
      img.src = `/assets/badges/${b}.svg`;
    });

    // 3. Opening book databases
    initPolyglotBook();
    initOpeningsDatabase();

    // 4. Background Web Worker game analysis
    runInitialAnalysis(defaultPgn);
  }, []);

  const runInitialAnalysis = async (pgnString: string) => {
    setIsAnalyzing(true);
    setAnalysisProgress({ current: 0, total: 100, pct: 0 });
    const meta = parseGameMetadata(pgnString);
    setGameMeta(meta);

    try {
      const res = await runAnalysisAsync(pgnString, (pct, current, total) => {
        setAnalysisProgress({ current, total, pct: Math.round(pct * 100) });
      });
      setAnalysisResult(res);

      const km = extractKeyMoments(res.moves);
      setKeyMoments(km);

      // Start at initial board state in overview mode
      setScreenMode('overview');
      goToPly(-1, res);
      setCurrentKeyMomentIdx(0);
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  const handlePgnSubmit = () => {
    setShowPgnInput(false);
    runInitialAnalysis(customPgn);
  };

  // Keyboard Navigation: Left / Right moves 1 ply; Space toggles autoplay
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPly(currentPlyIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToPly(currentPlyIndex + 1);
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPly(-1);
      } else if (e.key === 'End' && analysisResult) {
        e.preventDefault();
        goToPly(analysisResult.moves.length - 1);
      } else if (e.key === 'x' || e.key === 'f') {
        setOrientation(o => (o === 'w' ? 'b' : 'w'));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPlyIndex, analysisResult]);

  // Autoplay loop
  useEffect(() => {
    if (isPlaying && analysisResult) {
      autoplayTimerRef.current = setTimeout(() => {
        if (currentPlyIndex < analysisResult.moves.length - 1) {
          goToPly(currentPlyIndex + 1);
        } else {
          setIsPlaying(false);
        }
      }, 1500);
    } else {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    }
    return () => {
      if (autoplayTimerRef.current) clearTimeout(autoplayTimerRef.current);
    };
  }, [isPlaying, currentPlyIndex, analysisResult]);

  const playMoveSound = (san: string) => {
    let sound: SoundType = 'move-self';
    if (san.includes('O-O')) {
      sound = 'castle';
    } else if (san.includes('+') || san.includes('#')) {
      sound = 'move-check';
    } else if (san.includes('x')) {
      sound = 'capture';
    } else if (san.includes('=')) {
      sound = 'promote';
    }
    soundManager.play(sound);
  };

  const goToPly = (plyIndex: number, res = analysisResult) => {
    if (!res || plyIndex < -1 || plyIndex >= res.moves.length) return;
    setCurrentPlyIndex(plyIndex);

    // Sync active key moment index if this ply is a key moment
    if (keyMoments.length > 0) {
      const kmIndex = keyMoments.findIndex(km => km.plyIndex === plyIndex);
      if (kmIndex !== -1) {
        setCurrentKeyMomentIdx(kmIndex);
      }
    }

    if (plyIndex === -1) {
      setGame(new Chess());
      setLastMove(null);
    } else {
      const targetMove = res.moves[plyIndex];
      setGame(new Chess(targetMove.fenAfter));
      setLastMove({ from: targetMove.from, to: targetMove.to });
      playMoveSound(targetMove.san);
    }
  };

  // ADVANCE TO NEXT KEY MOMENT (What the green Next button does!)
  const handleNextKeyMoment = () => {
    if (!analysisResult || keyMoments.length === 0) return;

    // Find the next key moment ahead of current ply
    const nextKm = keyMoments.find(km => km.plyIndex > currentPlyIndex);
    if (nextKm) {
      const nextIdx = keyMoments.indexOf(nextKm);
      setCurrentKeyMomentIdx(nextIdx);
      goToPly(nextKm.plyIndex);
    } else {
      // Reached the end, jump to final move
      goToPly(analysisResult.moves.length - 1);
    }
  };

  const handlePrevKeyMoment = () => {
    if (!analysisResult || keyMoments.length === 0) return;
    const prevKms = keyMoments.filter(km => km.plyIndex < currentPlyIndex);
    if (prevKms.length > 0) {
      const prevKm = prevKms[prevKms.length - 1];
      setCurrentKeyMomentIdx(keyMoments.indexOf(prevKm));
      goToPly(prevKm.plyIndex);
    } else {
      goToPly(-1);
    }
  };

  // Start Review action from Overview
  const handleStartReview = () => {
    setScreenMode('active');
    if (keyMoments.length > 0) {
      setCurrentKeyMomentIdx(0);
      goToPly(keyMoments[0].plyIndex);
    } else if (analysisResult && analysisResult.moves.length > 0) {
      goToPly(0);
    }
  };

  const activeMove =
    analysisResult && currentPlyIndex >= 0 ? analysisResult.moves[currentPlyIndex] : null;

  // Selective Arrows: Green best move / Red blunder
  const arrows: BoardArrow[] = [];
  if (activeMove && screenMode === 'active') {
    const { classification, from, to, bestMoveUci } = activeMove;
    const isError =
      classification === 'inaccuracy' ||
      classification === 'mistake' ||
      classification === 'blunder' ||
      classification === 'miss';
    const isBrilliant = classification === 'brilliant';

    if (isError) {
      let errColor: BoardArrow['color'] = 'yellow';
      if (classification === 'blunder' || classification === 'miss') errColor = 'red';
      else if (classification === 'mistake') errColor = 'orange';

      arrows.push({ from, to, color: errColor });

      if (bestMoveUci && bestMoveUci.length >= 4) {
        arrows.push({
          from: bestMoveUci.slice(0, 2),
          to: bestMoveUci.slice(2, 4),
          color: 'green',
          opacity: 0.9,
        });
      }
    } else if (isBrilliant) {
      arrows.push({ from, to, color: 'green', opacity: 0.95 });
    }
  }

  // Eval bar score
  const currentScore = activeMove ? activeMove.scoreAfter : 0;

  return (
    <div className="min-h-screen bg-[#1e1c18] text-white p-3 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#3b3834] pb-3 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#81b64c] flex items-center justify-center font-bold text-base shadow">
              ★
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Chess.com Analysis Mode</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#312e2b] text-[#81b64c] border border-[#403d39]">
                  {screenMode === 'overview' ? 'Review Summary' : 'Active Coach Review'}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPgnInput(!showPgnInput)}
              className="px-3 py-1.5 bg-[#272522] hover:bg-[#34322e] border border-[#3b3834] rounded text-xs font-semibold text-gray-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Load PGN</span>
            </button>
            <button
              onClick={() => setOrientation(o => (o === 'w' ? 'b' : 'w'))}
              className="px-3 py-1.5 bg-[#272522] hover:bg-[#34322e] border border-[#3b3834] rounded text-xs font-semibold text-gray-200 transition cursor-pointer"
            >
              ⇄ Flip
            </button>
            {(['purple', 'green', 'dark_wood'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => setBoardTheme(theme)}
                className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  boardTheme === theme
                    ? 'bg-[#81b64c] text-white shadow'
                    : 'bg-[#272522] hover:bg-[#34322e] text-gray-300 border border-[#3b3834]'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </header>

        {/* Optional Custom PGN Input Panel */}
        {showPgnInput && (
          <div className="bg-[#272522] p-4 rounded-lg border border-[#3b3834] space-y-2 shadow-xl">
            <div className="flex justify-between items-center text-xs font-bold text-gray-300">
              <span>Paste Custom PGN or Game Record:</span>
              <button
                onClick={() => setCustomPgn(defaultPgn)}
                className="text-[#81b64c] hover:underline"
              >
                Reset to Caro-Kann Game
              </button>
            </div>
            <textarea
              value={customPgn}
              onChange={(e) => setCustomPgn(e.target.value)}
              rows={4}
              className="w-full bg-[#1e1c18] border border-[#3b3834] rounded p-2 text-xs text-gray-200 font-mono resize-none focus:outline-none focus:border-[#81b64c]"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowPgnInput(false)}
                className="px-3 py-1.5 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 rounded text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePgnSubmit}
                className="px-4 py-1.5 bg-[#81b64c] hover:bg-[#96c85e] text-white font-bold rounded text-xs shadow"
              >
                Load & Review Game
              </button>
            </div>
          </div>
        )}

        {/* Main Grid: Left Board Area vs Right Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Top Player Banner + Board/EvalBar + Bottom Player Banner */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-2">
            {/* Top Player Banner (Black if orientation is White, White if flipped) */}
            <div className="w-full max-w-[560px]">
              <PlayerBanner
                name={orientation === 'w' ? gameMeta.black.name : gameMeta.white.name}
                rating={orientation === 'w' ? gameMeta.black.rating : gameMeta.white.rating}
                avatarIcon={orientation === 'w' ? '🐱' : '♟️'}
                time={gameMeta.timeControl}
                isTop={true}
              />
            </div>

            {/* Board Container with Left Eval Bar */}
            <div className="flex items-center gap-2 w-full max-w-[560px]">
              {/* Vertical Eval Bar (Image 1 style) */}
              <div className="h-[360px] sm:h-[480px] md:h-[520px]">
                <EvalBar score={currentScore} orientation={orientation} />
              </div>

              {/* Main Board with Neo Pieces & Purple/Green Theme */}
              <div className="flex-1">
                <ChessBoard
                  game={game}
                  theme={boardTheme}
                  orientation={orientation}
                  selectedSquare={selectedSquare}
                  lastMove={lastMove}
                  arrows={arrows}
                  badge={
                    activeMove
                      ? {
                          square: activeMove.to,
                          classification: activeMove.classification,
                        }
                      : null
                  }
                  onSquareClick={() => {}}
                />
              </div>
            </div>

            {/* Bottom Player Banner (White if orientation is White, Black if flipped) */}
            <div className="w-full max-w-[560px]">
              <PlayerBanner
                name={orientation === 'w' ? gameMeta.white.name : gameMeta.black.name}
                rating={orientation === 'w' ? gameMeta.white.rating : gameMeta.black.rating}
                avatarIcon={orientation === 'w' ? '♟️' : '🐱'}
                time={gameMeta.timeControl}
                isTop={false}
              />
            </div>
          </div>

          {/* Right Column: Exact Replica of Image 1 & 2 (Overview) OR Image 3 & 4 (Active Review) */}
          <div className="lg:col-span-5">
            {isAnalyzing && !analysisResult ? (
              <div className="bg-[#262421] rounded-xl p-8 border border-[#3b3834] flex flex-col items-center justify-center space-y-4 shadow-2xl min-h-[460px]">
                <div className="w-12 h-12 rounded-full border-4 border-[#81b64c] border-t-transparent animate-spin" />
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">Analyzing Game...</h3>
                  <p className="text-xs text-gray-400">
                    Evaluating positions, book openings, and calculating accuracy
                  </p>
                </div>
                {analysisProgress && (
                  <div className="w-56 space-y-1.5">
                    <div className="w-full bg-[#1e1c18] rounded-full h-2 overflow-hidden border border-[#3b3834]">
                      <div
                        className="bg-[#81b64c] h-full transition-all duration-150 rounded-full"
                        style={{ width: `${analysisProgress.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>Move {analysisProgress.current} / {analysisProgress.total}</span>
                      <span>{analysisProgress.pct}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : analysisResult ? (
              screenMode === 'overview' ? (
                /* SCREEN 1 & 2: Overview with Accuracy, Ratings, Breakdown & Start Review */
                <ReviewOverview
                  analysis={analysisResult}
                  metadata={gameMeta}
                  currentPly={currentPlyIndex}
                  onStartReview={handleStartReview}
                  onSelectPly={goToPly}
                />
              ) : (
                /* SCREEN 3 & 4: Active Review with Coach Speech Bubble & Next Key Moment */
                <ActiveReviewPanel
                  moves={analysisResult.moves}
                  keyMoments={keyMoments}
                  currentPly={currentPlyIndex}
                  isPlaying={isPlaying}
                  onSelectPly={goToPly}
                  onNextKeyMoment={handleNextKeyMoment}
                  onPrevKeyMoment={handlePrevKeyMoment}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onBackToOverview={() => setScreenMode('overview')}
                  onFirst={() => goToPly(-1)}
                  onPrev={() => goToPly(currentPlyIndex - 1)}
                  onNext={() => goToPly(currentPlyIndex + 1)}
                  onLast={() => goToPly(analysisResult.moves.length - 1)}
                />
              )
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
