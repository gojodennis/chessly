import { AnalyzedMove } from '../engine/analysisEngine';

export interface GroqKeyMoment {
  plyIndex: number;
  headline: string;
  commentary: string;
  suggestedMove?: string;
}

export interface GroqGameTutorResult {
  overallSummary: string;
  moments: GroqKeyMoment[];
}

export interface GroqFenAssessment {
  evaluationSummary: string;
  turn: 'White' | 'Black';
  keyThreats: string[];
  recommendedPlans: string[];
  coachAdvice: string;
}

// In-memory cache to prevent duplicate Groq API requests
const tutorCache = new Map<string, GroqGameTutorResult>();
const fenCache = new Map<string, GroqFenAssessment>();

export function getGroqApiKey(): string {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GROQ_API_KEY) {
    return (import.meta as any).env.VITE_GROQ_API_KEY;
  }
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('chessly_groq_key');
    if (stored) return stored;
  }
  return '';
}

/**
 * Sends analyzed game moves to Groq AI to extract instructional key moments
 * where the tutor wants the player to learn from mistakes or applaud great moves.
 */
export async function getGroqGameTutorAnalysis(
  pgn: string,
  analyzedMoves: AnalyzedMove[]
): Promise<GroqGameTutorResult | null> {
  const cacheKey = pgn.trim();
  if (tutorCache.has(cacheKey)) {
    return tutorCache.get(cacheKey)!;
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  // Prepare a condensed move list highlighting candidate moments
  const movesData = analyzedMoves.map((m, idx) => ({
    ply: idx,
    moveNum: Math.floor(idx / 2) + 1,
    turn: m.turn === 'w' ? 'White' : 'Black',
    san: m.san,
    classification: m.classification,
    scoreCp: m.scoreAfter,
    bestMove: m.bestMoveUci,
  }));

  const systemPrompt = `You are Danny Rensch, an authentic, witty, and pedagogical master chess coach reviewing a player's game on Chess.com.
Your goal is to select the most instructional moments of the game where you want the user to learn from mistakes, blunders, missed tactical shots, or highlight brilliant/great moves.
Do NOT select every move—select between 4 to 8 of the most critical turning points.

For each selected moment:
- "plyIndex": the exact ply number (0-indexed from the moves data).
- "headline": a punchy 2-5 word label (e.g. "12. Bxa7 was a blunder", "9... h6 weakened the kingside", "Great find with 10. Ne5!").
- "commentary": 1-2 friendly, conversational, instructive sentences explaining why the move was good or bad, what the opponent's threat was, and what the best move achieves.
- "suggestedMove": the recommended best move SAN if the player made an error.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "overallSummary": "Short 1-2 sentence recap of the game performance",
  "moments": [
    {
      "plyIndex": number,
      "headline": string,
      "commentary": string,
      "suggestedMove": string
    }
  ]
}`;

  const userPrompt = `Here is the analyzed game move sequence:
${JSON.stringify(movesData, null, 2)}

Identify the instructional key moments where the player should learn and return the JSON.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1800,
      }),
    });

    if (!response.ok) {
      console.warn('Groq API error:', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed: GroqGameTutorResult = JSON.parse(content);
    if (parsed && Array.isArray(parsed.moments)) {
      // Sort moments chronologically by plyIndex
      parsed.moments.sort((a, b) => a.plyIndex - b.plyIndex);
      tutorCache.set(cacheKey, parsed);
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch Groq Tutor commentary, falling back to local engine:', err);
    return null;
  }
}

/**
 * Analyzes a standalone FEN position with Groq to provide master coach insights,
 * evaluation, active threats, and recommended plans.
 */
export async function getGroqFenAssessment(fen: string): Promise<GroqFenAssessment | null> {
  const cacheKey = fen.trim();
  if (fenCache.has(cacheKey)) {
    return fenCache.get(cacheKey)!;
  }

  const apiKey = getGroqApiKey();
  if (!apiKey) return null;

  const systemPrompt = `You are Danny Rensch, master chess coach. The user has loaded a custom FEN position for study.
Analyze the position thoroughly:
- Assess who has the advantage and why.
- Identify immediate tactical threats or pawn structure factors.
- Propose 2-3 concrete plans or candidate moves for the side whose turn it is.
- Deliver an encouraging 1-2 sentence coach advice.

You MUST respond strictly with valid JSON conforming to this schema:
{
  "evaluationSummary": "string (e.g. White is slightly better due to central control)",
  "turn": "White" | "Black",
  "keyThreats": ["threat 1", "threat 2"],
  "recommendedPlans": ["plan 1", "plan 2"],
  "coachAdvice": "string"
}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please assess this FEN position in JSON format: "${fen}"` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed: GroqFenAssessment = JSON.parse(content);
    if (parsed) {
      fenCache.set(cacheKey, parsed);
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Failed to assess FEN via Groq:', err);
    return null;
  }
}
