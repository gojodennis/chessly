import { Chess } from 'chess.js';
import { POLYGLOT_RANDOM } from './polyglotConstants';

export interface BookMoveEntry {
  uci: string;
  san: string;
  weight: number;
  from: string;
  to: string;
  promotion?: string;
}

let bookBuffer: ArrayBuffer | null = null;
let bookView: DataView | null = null;
let bookTotalEntries = 0;
let loadingPromise: Promise<boolean> | null = null;

const FILES = 'abcdefgh';
const RANKS = '12345678';
const PIECE_MAP: Record<string, number> = { p: 1, n: 2, b: 3, r: 4, q: 5, k: 6 };

/**
 * Calculates the exact 64-bit Polyglot Zobrist hash of a chess.js board state.
 */
export function polyglotHash(game: Chess): bigint {
  let hash = 0n;
  const board = game.board();

  // 1. Hash pieces on squares
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const rank = 7 - r;
      const file = c;
      const square = file + rank * 8;
      const pieceIdx = (PIECE_MAP[piece.type] - 1) * 2 + (piece.color === 'w' ? 1 : 0);
      hash ^= POLYGLOT_RANDOM[64 * pieceIdx + square];
    }
  }

  // 2. Hash castling availability
  const fenParts = game.fen().split(' ');
  const castling = fenParts[2] || '';
  if (castling.includes('K')) hash ^= POLYGLOT_RANDOM[768];
  if (castling.includes('Q')) hash ^= POLYGLOT_RANDOM[769];
  if (castling.includes('k')) hash ^= POLYGLOT_RANDOM[770];
  if (castling.includes('q')) hash ^= POLYGLOT_RANDOM[771];

  // 3. Hash en passant square (only if an opposing pawn can legally capture it)
  const ep = fenParts[3] || '-';
  if (ep !== '-') {
    const epFile = ep.charCodeAt(0) - 97;
    const epRank = parseInt(ep[1], 10) - 1;
    const turn = game.turn();
    const pawnRow = turn === 'w' ? 7 - (epRank - 1) : 7 - (epRank + 1);
    let hasPawn = false;
    if (pawnRow >= 0 && pawnRow < 8) {
      if (epFile > 0 && board[pawnRow][epFile - 1]?.type === 'p' && board[pawnRow][epFile - 1]?.color === turn) {
        hasPawn = true;
      }
      if (epFile < 7 && board[pawnRow][epFile + 1]?.type === 'p' && board[pawnRow][epFile + 1]?.color === turn) {
        hasPawn = true;
      }
    }
    if (hasPawn) {
      hash ^= POLYGLOT_RANDOM[772 + epFile];
    }
  }

  // 4. Hash turn (XOR if White to move)
  if (game.turn() === 'w') {
    hash ^= POLYGLOT_RANDOM[780];
  }

  return hash;
}

/**
 * Loads the compiled unified Polyglot book into memory.
 */
export async function initPolyglotBook(url = '/assets/book.bin'): Promise<boolean> {
  if (bookBuffer && bookView) return true;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} loading book`);
      const buffer = await response.arrayBuffer();
      bookBuffer = buffer;
      bookView = new DataView(buffer);
      bookTotalEntries = Math.floor(buffer.byteLength / 16);
      return true;
    } catch (err) {
      console.warn('Could not load polyglot book.bin:', err);
      return false;
    }
  })();

  return loadingPromise;
}

export function isBookLoaded(): boolean {
  return bookView !== null && bookTotalEntries > 0;
}

/**
 * Queries the in-memory Polyglot book for all valid book moves in the current position.
 */
export function lookupBookMoves(game: Chess): BookMoveEntry[] {
  if (!bookView || bookTotalEntries === 0) return [];

  const targetKey = polyglotHash(game);
  let low = 0;
  let high = bookTotalEntries - 1;
  let found = -1;

  while (low <= high) {
    const mid = (low + high) >>> 1;
    const key = bookView.getBigUint64(mid * 16, false);
    if (key < targetKey) {
      low = mid + 1;
    } else if (key > targetKey) {
      high = mid - 1;
    } else {
      found = mid;
      break;
    }
  }

  if (found === -1) return [];

  // Collect all duplicate keys
  let start = found;
  while (start > 0 && bookView.getBigUint64((start - 1) * 16, false) === targetKey) {
    start--;
  }
  let end = found;
  while (end < bookTotalEntries - 1 && bookView.getBigUint64((end + 1) * 16, false) === targetKey) {
    end++;
  }

  const results: BookMoveEntry[] = [];
  const PROMOTIONS = ['', 'n', 'b', 'r', 'q'];

  for (let i = start; i <= end; i++) {
    const rawMove = bookView.getUint16(i * 16 + 8, false);
    const weight = bookView.getUint16(i * 16 + 10, false);

    const toFile = rawMove & 7;
    const toRank = (rawMove >> 3) & 7;
    const fromFile = (rawMove >> 6) & 7;
    const fromRank = (rawMove >> 9) & 7;
    const promIdx = (rawMove >> 12) & 7;

    const from = `${FILES[fromFile]}${RANKS[fromRank]}`;
    const to = `${FILES[toFile]}${RANKS[toRank]}`;
    const prom = promIdx > 0 && promIdx < PROMOTIONS.length ? PROMOTIONS[promIdx] : undefined;
    const uci = `${from}${to}${prom || ''}`;

    // Validate legality with chess.js
    try {
      const clone = new Chess(game.fen());
      const move = clone.move({ from, to, promotion: prom as any });
      if (move) {
        results.push({
          uci,
          san: move.san,
          weight,
          from,
          to,
          promotion: prom,
        });
      }
    } catch {
      // Skip non-matching or corrupted line
    }
  }

  return results.sort((a, b) => b.weight - a.weight);
}

/**
 * Checks whether a played move from a position was a theoretical book move.
 */
export function isBookMove(gameBeforeMove: Chess, uciOrSan: string): boolean {
  const bookMoves = lookupBookMoves(gameBeforeMove);
  return bookMoves.some(
    bm => bm.uci === uciOrSan || bm.san === uciOrSan || `${bm.from}${bm.to}` === uciOrSan
  );
}

