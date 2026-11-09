import { analyzeGame } from '../src/engine/analysisEngine.ts';
import fs from 'fs';

// Setup polyfills for node test
global.fetch = async (url: string | URL | Request) => {
  const urlStr = url.toString();
  let filePath = '';
  if (urlStr.includes('book.bin')) {
    filePath = 'public/assets/book.bin';
  } else if (urlStr.includes('openings.json')) {
    filePath = 'public/data/openings.json';
  }
  if (filePath && fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return {
      ok: true,
      status: 200,
      arrayBuffer: async () => data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
      json: async () => JSON.parse(data.toString('utf-8')),
    } as any;
  }
  throw new Error('Not found: ' + urlStr);
};

async function run() {
  console.log('Running test game analysis...');
  // Opera Game: Morphy vs Duke of Brunswick & Count Isouard (1858)
  const pgn = '1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7 8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7 14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8#';
  
  const result = await analyzeGame(pgn, (pct, ply, total) => {
    if (ply % 5 === 0 || ply === total) {
      console.log(`  Analysis progress: ${pct}% (ply ${ply}/${total})`);
    }
  });

  console.log('\n--- Analysis Results ---');
  console.log('Opening detected:', result.opening);
  console.log('White accuracy:', result.whiteAccuracy + '%');
  console.log('Black accuracy:', result.blackAccuracy + '%');
  console.log('White move breakdown:', result.counts.white);
  console.log('Black move breakdown:', result.counts.black);
  console.log('\nSample Move Classifications:');
  for (const m of result.moves.slice(0, 10)) {
    console.log(`  Ply ${m.ply} (${m.turn === 'w' ? 'White' : 'Black'} ${m.san}): [${m.classification.toUpperCase()}] - ${m.explanation}`);
  }
}

run().catch(console.error);
