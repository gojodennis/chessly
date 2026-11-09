import { Chess } from 'chess.js';

export interface GameMetadata {
  white: {
    name: string;
    rating: string;
    country: string;
  };
  black: {
    name: string;
    rating: string;
    country: string;
  };
  timeControl: string;
  date: string;
}

export function parseGameMetadata(pgn: string): GameMetadata {
  const meta: GameMetadata = {
    white: { name: 'White', rating: '?', country: '🏳' },
    black: { name: 'Black', rating: '?', country: '🏳' },
    timeControl: '3:00',
    date: new Date().toLocaleDateString(),
  };

  try {
    const parser = new Chess();
    parser.loadPgn(pgn);
    const headers = parser.header();

    if (headers['White']) meta.white.name = headers['White'];
    if (headers['WhiteElo']) meta.white.rating = headers['WhiteElo'];
    if (headers['Black']) meta.black.name = headers['Black'];
    if (headers['BlackElo']) meta.black.rating = headers['BlackElo'];
    if (headers['Date']) meta.date = headers['Date'];
    if (headers['TimeControl']) {
      const tc = headers['TimeControl'];
      if (tc.includes('+')) {
        meta.timeControl = tc;
      } else if (!isNaN(Number(tc))) {
        const mins = Math.floor(Number(tc) / 60);
        meta.timeControl = `${mins}:00`;
      }
    }
  } catch {}

  return meta;
}

