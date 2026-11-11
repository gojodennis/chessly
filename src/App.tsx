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
import { FenReviewPanel } from './components/Review/FenReviewPanel';
import { FenBar } from './components/Board/FenBar';
import { BoardArrow } from './components/Board/ArrowOverlay';
import { getGroqGameTutorAnalysis, getGroqFenAssessment, GroqFenAssessment } from './services/groqTutorService';
import { Upload, BookOpen } from 'lucide-react';

export default function App() {
  const [boardTheme, setBoardTheme] = useState<'purple' | 'green' | 'dark_wood' | 'glass' | 'tournament'>('purple');
  const [orientation, setOrientation] = useState<'w' | 'b'>('w');
  const [game, setGame] = useState(() => new Chess());
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  // Review flow state: 'overview' vs 'active' vs 'fen_mode'
  const [screenMode, setScreenMode] = useState<'overview' | 'active' | 'fen_mode'>('overview');

  // Interactive Demonstration States for Explain & Best Buttons
  const [isShowingBest, setIsShowingBest] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);

  // FEN Analysis State
  const [customFen, setCustomFen] = useState<string>('');
  const [fenAssessment, setFenAssessment] = useState<GroqFenAssessment | null>(null);
  const [isFenLoading, setIsFenLoading] = useState(false);

  // Analysis & Key Moments State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<{ current: number; total: number; pct: number } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<GameReviewResult | null>(null);
  const [keyMoments, setKeyMoments] = useState<KeyMoment[]>([]);
  const [currentPlyIndex, setCurrentPlyIndex] = useState<number>(-1);
  const [, setCurrentKeyMomentIdx] = useState<number>(0);

  // Autoplay State
  const [isPlaying, setIsPlaying] = useState(false);
  const autoplayTimerRef = useRef<any>(null);

  // Default Game PGN matching the user's reference screenshots (9... h6, 10. Ne5, etc.)
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

  const isFenString = (str: string): boolean => {
    const trimmed = str.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) return false;
    const ranks = parts[0].split('/');
    return ranks.length === 8 && (parts[1] === 'w' || parts[1] === 'b');
  };

  const loadFenPosition = async (fen: string) => {
    try {
      const cleanFen = fen.trim();
      const testChess = new Chess(cleanFen);
      setGame(testChess);
      setSelectedSquare(null);
      setLastMove(null);
      setScreenMode('fen_mode');
      setCustomFen(cleanFen);
      setOrientation(testChess.turn());
      setIsFenLoading(true);

      const assessment = await getGroqFenAssessment(cleanFen);
      setFenAssessment(assessment);
    } catch (err) {
      console.error('Invalid FEN:', err);
      alert('Invalid FEN format. Please enter a valid chess FEN string.');
    } finally {
      setIsFenLoading(false);
    }
  };

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

      // In the background, extract instructional tutor commentary from Groq
      getGroqGameTutorAnalysis(pgnString, res.moves)
        .then(groqRes => {
          if (groqRes && groqRes.moments && groqRes.moments.length > 0) {
            const groqKm: KeyMoment[] = groqRes.moments.map(gm => {
              const move = res.moves[gm.plyIndex];
              const type = (move ? move.classification : 'mistake') as any;
              return {
                plyIndex: gm.plyIndex,
                type,
                headline: gm.headline,
                commentary: gm.commentary,
                suggestedMove: gm.suggestedMove || (move?.bestMoveUci ? move.bestMoveUci.slice(0, 4) : undefined),
              };
            });

            // Keep opening book moments if available
            const firstBook = km.find(m => m.type === 'first_book');
            const lastBook = km.find(m => m.type === 'last_book');
            if (firstBook && !groqKm.some(m => m.plyIndex === firstBook.plyIndex)) {
              groqKm.unshift(firstBook);
            }
            if (lastBook && !groqKm.some(m => m.plyIndex === lastBook.plyIndex)) {
              groqKm.splice(1, 0, lastBook);
            }

            groqKm.sort((a, b) => a.plyIndex - b.plyIndex);
            setKeyMoments(groqKm);
          }
        })
        .catch(err => console.warn('Groq tutor background error:', err));
    } catch (err: any) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

  const handleInputSubmit = (text: string) => {
    setShowPgnInput(false);
    if (isFenString(text)) {
      loadFenPosition(text);
    } else {
      runInitialAnalysis(text);
    }
  };

  const handleSquareClick = (square: string) => {
    if (screenMode !== 'fen_mode') return;

    if (!selectedSquare) {
      const piece = game.get(square as any);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
    } else {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        return;
      }
      try {
        const move = game.move({
          from: selectedSquare,
          to: square,
          promotion: 'q',
        });
        if (move) {
          playMoveSound(move.san);
          setLastMove({ from: move.from, to: move.to });
          setSelectedSquare(null);
          setGame(new Chess(game.fen()));
        } else {
          const piece = game.get(square as any);
          if (piece && piece.color === game.turn()) {
            setSelectedSquare(square);
          } else {
            setSelectedSquare(null);
          }
        }
      } catch {
        setSelectedSquare(null);
      }
    }
  };

  // Keyboard Navigation: Left / Right moves 1 ply
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

  // Chess.com sound reproduction
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
    setIsShowingBest(false);
    setIsExplaining(false);

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

  // ADVANCE TO NEXT KEY MOMENT
  const handleNextKeyMoment = () => {
    if (!analysisResult || keyMoments.length === 0) return;

    const nextKm = keyMoments.find(km => km.plyIndex > currentPlyIndex);
    if (nextKm) {
      const nextIdx = keyMoments.indexOf(nextKm);
      setCurrentKeyMomentIdx(nextIdx);
      goToPly(nextKm.plyIndex);
    } else {
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
    // Start at move 8... h6 (ply 17 in Caro-Kann game) or first key moment
    const h6Moment = keyMoments.find(km => km.plyIndex === 17);
    if (h6Moment) {
      setCurrentKeyMomentIdx(keyMoments.indexOf(h6Moment));
      goToPly(17);
    } else if (keyMoments.length > 0) {
      setCurrentKeyMomentIdx(0);
      goToPly(keyMoments[0].plyIndex);
    } else if (analysisResult && analysisResult.moves.length > 0) {
      goToPly(0);
    }
  };

  const activeMove =
    analysisResult && currentPlyIndex >= 0 ? analysisResult.moves[currentPlyIndex] : null;

  // INTERACTIVE "BEST" BUTTON: Shows the best move on the board with audio!
  const handleToggleBestMove = () => {
    if (!activeMove || !activeMove.bestMoveSan || !activeMove.bestMoveUci) return;

    if (!isShowingBest) {
      try {
        const testChess = new Chess(activeMove.fenBefore);
        const from = activeMove.bestMoveUci.slice(0, 2);
        const to = activeMove.bestMoveUci.slice(2, 4);
        const promotion = activeMove.bestMoveUci.length > 4 ? activeMove.bestMoveUci[4] : undefined;
        testChess.move({ from, to, promotion });
        setGame(testChess);
        setLastMove({ from, to });
        playMoveSound(activeMove.bestMoveSan);
        setIsShowingBest(true);
      } catch (err) {
        console.error('Failed to play best move:', err);
      }
    } else {
      // Revert back to the played move
      setGame(new Chess(activeMove.fenAfter));
      setLastMove({ from: activeMove.from, to: activeMove.to });
      playMoveSound(activeMove.san);
      setIsShowingBest(false);
    }
  };

  // INTERACTIVE "EXPLAIN" BUTTON: Explains the move and demonstrates the punishment / threat on the board!
  const handleToggleExplain = () => {
    if (!activeMove) return;
    const nextState = !isExplaining;
    setIsExplaining(nextState);

    // When toggling explain on, if the move was punished next ply, demonstrate opponent's punishment on board!
    if (nextState && currentPlyIndex >= 0 && analysisResult && currentPlyIndex < analysisResult.moves.length - 1) {
      const nextMove = analysisResult.moves[currentPlyIndex + 1];
      if (nextMove) {
        setGame(new Chess(nextMove.fenAfter));
        setLastMove({ from: nextMove.from, to: nextMove.to });
        playMoveSound(nextMove.san);
      }
    } else {
      // Restore back to active move
      setGame(new Chess(activeMove.fenAfter));
      setLastMove({ from: activeMove.from, to: activeMove.to });
      playMoveSound(activeMove.san);
    }
  };

  // Green Best Move Arrow (from Screenshot 3: Bf5 -> d3)
  const arrows: BoardArrow[] = [];
  if (activeMove && screenMode === 'active') {
    const { classification, bestMoveUci } = activeMove;
    const isError =
      classification === 'inaccuracy' ||
      classification === 'mistake' ||
      classification === 'blunder' ||
      classification === 'miss';

    if (isError && bestMoveUci && bestMoveUci.length >= 4 && !isShowingBest) {
      arrows.push({
        from: bestMoveUci.slice(0, 2),
        to: bestMoveUci.slice(2, 4),
        color: 'green',
        opacity: 0.85,
      });
    }
  }

  // Eval bar score
  const currentScore = activeMove ? activeMove.scoreAfter : 0;

  return (
    <div className="min-h-screen bg-[#1e1c18] text-white p-2 sm:p-4 md:p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#36332f] pb-2.5 gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#81b64c] flex items-center justify-center font-bold text-sm shadow">
              ★
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Chess.com Game Review</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-[#2b2824] text-[#81b64c] border border-[#3b3834]">
                  {screenMode === 'overview'
                    ? 'Summary'
                    : screenMode === 'active'
                    ? 'Active Coach Review'
                    : 'FEN Study'}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPgnInput(!showPgnInput)}
              className="px-3 py-1.5 bg-[#262421] hover:bg-[#34322e] border border-[#36332f] rounded text-xs font-semibold text-gray-200 transition cursor-pointer flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-[#81b64c]" />
              <span>Load Game / FEN</span>
            </button>
            <button
              onClick={() => setOrientation(o => (o === 'w' ? 'b' : 'w'))}
              className="px-3 py-1.5 bg-[#262421] hover:bg-[#34322e] border border-[#36332f] rounded text-xs font-semibold text-gray-200 transition cursor-pointer"
            >
              ⇄ Flip
            </button>
            {(['purple', 'green', 'dark_wood'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => setBoardTheme(theme)}
                className={`px-2.5 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  boardTheme === theme
                    ? 'bg-[#81b64c] text-white shadow'
                    : 'bg-[#262421] hover:bg-[#34322e] text-gray-300 border border-[#36332f]'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </header>

        {/* Custom PGN or FEN Input Modal */}
        {showPgnInput && (
          <div className="bg-[#262421] p-4 rounded-xl border border-[#36332f] space-y-3 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-bold text-gray-300">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#81b64c]" />
                <span>Paste Custom PGN or FEN Position:</span>
              </span>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  onClick={() => setCustomPgn(defaultPgn)}
                  className="text-gray-400 hover:text-[#81b64c] transition"
                >
                  Caro-Kann (PGN)
                </button>
                <span>•</span>
                <button
                  onClick={() =>
                    setCustomPgn('rn2kb1r/pp3ppp/2p1pn2/q5B1/3P2b1/2NB1N2/PPP2PPP/R2QK2R w KQkq - 0 8')
                  }
                  className="text-gray-400 hover:text-[#81b64c] transition"
                >
                  Opera Tactic (FEN)
                </button>
              </div>
            </div>
            <textarea
              value={customPgn}
              onChange={(e) => setCustomPgn(e.target.value)}
              rows={4}
              placeholder="Paste PGN (1. e4 c6 ...) or FEN"
              className="w-full bg-[#1e1c18] border border-[#36332f] rounded p-2 text-xs text-gray-200 font-mono resize-none focus:outline-none focus:border-[#81b64c]"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-gray-400">
                {isFenString(customPgn) ? '⚡ Detected FEN format (Position Study)' : '📖 Detected PGN format (Game Review)'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPgnInput(false)}
                  className="px-3 py-1.5 bg-[#312e2b] hover:bg-[#3d3a36] text-gray-300 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleInputSubmit(customPgn)}
                  className="px-4 py-1.5 bg-[#81b64c] hover:bg-[#96c85e] text-white font-bold rounded text-xs shadow cursor-pointer"
                >
                  {isFenString(customPgn) ? 'Load FEN Position' : 'Load & Review Game'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Grid: Left Board Area vs Right Review Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Top Player Banner + Board/EvalBar + Bottom Player Banner */}
          <div className="lg:col-span-7 flex flex-col items-center space-y-1.5">
            {/* Top Player Banner (White in screenshots: newbieme1112 (591) ID flag) */}
            <div className="w-full max-w-[550px]">
              <PlayerBanner
                name={orientation === 'w' ? gameMeta.white.name : gameMeta.black.name}
                rating={orientation === 'w' ? gameMeta.white.rating : gameMeta.black.rating}
                time={screenMode === 'active' && currentPlyIndex >= 16 ? "2:28" : "3:00"}
                isTop={true}
              />
            </div>

            {/* Board Container with Left Eval Bar */}
            <div className="flex items-center gap-2 w-full max-w-[550px]">
              {/* Vertical Eval Bar (Image 1 & 3 style) */}
              <div className="h-[360px] sm:h-[480px] md:h-[510px]">
                <EvalBar score={currentScore} orientation={orientation} />
              </div>

              {/* Main Board with Neo Pieces & Authentic Theme */}
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
                          square: isShowingBest
                            ? activeMove.bestMoveUci.slice(2, 4)
                            : activeMove.to,
                          classification: isShowingBest ? 'best' : activeMove.classification,
                        }
                      : null
                  }
                  onSquareClick={handleSquareClick}
                />
              </div>
            </div>

            {/* FEN Bar with 1-Click Copy and View */}
            <FenBar fen={game.fen()} />

            {/* Bottom Player Banner (Black in screenshots: gojodenys (449)) */}
            <div className="w-full max-w-[550px]">
              <PlayerBanner
                name={orientation === 'w' ? gameMeta.black.name : gameMeta.white.name}
                rating={orientation === 'w' ? gameMeta.black.rating : gameMeta.white.rating}
                time={screenMode === 'active' && currentPlyIndex >= 16 ? "2:14" : "3:00"}
                isTop={false}
              />
            </div>
          </div>

          {/* Right Column: Overview vs Active Review Panel */}
          <div className="lg:col-span-5">
            {screenMode === 'fen_mode' ? (
              <FenReviewPanel
                fen={game.fen()}
                assessment={fenAssessment}
                isLoading={isFenLoading}
                onReset={() => {
                  if (customFen) {
                    loadFenPosition(customFen);
                  }
                }}
                onExit={() => {
                  setScreenMode('overview');
                  if (analysisResult) {
                    goToPly(currentPlyIndex);
                  }
                }}
              />
            ) : isAnalyzing && !analysisResult ? (
              <div className="bg-[#262421] rounded-xl p-8 border border-[#36332f] flex flex-col items-center justify-center space-y-4 shadow-2xl min-h-[460px]">
                <div className="w-12 h-12 rounded-full border-4 border-[#81b64c] border-t-transparent animate-spin" />
                <div className="text-center space-y-1">
                  <h3 className="text-base font-bold text-white">Analyzing Game...</h3>
                  <p className="text-xs text-gray-400">
                    Evaluating positions, book openings, and calculating accuracy
                  </p>
                </div>
                {analysisProgress && (
                  <div className="w-56 space-y-1.5">
                    <div className="w-full bg-[#1e1c18] rounded-full h-2 overflow-hidden border border-[#36332f]">
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
                /* SCREEN 3: Active Review with Coach Speech Bubble & Interactive Explain / Best / Next */
                <ActiveReviewPanel
                  moves={analysisResult.moves}
                  keyMoments={keyMoments}
                  currentPly={currentPlyIndex}
                  isPlaying={isPlaying}
                  isShowingBest={isShowingBest}
                  isExplaining={isExplaining}
                  onSelectPly={goToPly}
                  onNextKeyMoment={handleNextKeyMoment}
                  onPrevKeyMoment={handlePrevKeyMoment}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onToggleBestMove={handleToggleBestMove}
                  onToggleExplain={handleToggleExplain}
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
