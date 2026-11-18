const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const rooms = new Map();
const roll = () => crypto.randomInt(1, 7);
const score = board => board.reduce((sum, col) => sum + col.reduce((s, n) => s + n * col.filter(x => x === n).length, 0), 0);
function state(room, token) {
  const player = room.players.findIndex(p => p.token === token);
  if (player < 0) return null;
  return { code: room.code, player, names: room.players.map(p => p.name), boards: room.boards, scores: room.boards.map(score), turn: room.turn, die: room.die, winner: room.winner, started: room.players.length === 2 };
}
function broadcast(room) { for (const p of room.players) for (const res of p.listeners) res.write(`data: ${JSON.stringify(state(room, p.token))}\n\n`); }
function json(res, status, body) { res.writeHead(status, {'Content-Type':'application/json'}); res.end(JSON.stringify(body)); }
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/events') {
    const room = rooms.get(url.searchParams.get('code')); const p = room?.players.find(p => p.token === url.searchParams.get('token'));
    if (!p) return json(res, 404, {error:'Room or player not found.'});
    res.writeHead(200, {'Content-Type':'text/event-stream','Cache-Control':'no-cache','Connection':'keep-alive'}); p.listeners.add(res); res.write(`data: ${JSON.stringify(state(room,p.token))}\n\n`); req.on('close',()=>p.listeners.delete(res)); return;
  }
  if (req.method === 'POST' && url.pathname.startsWith('/api/')) {
    let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 4096) return json(res,413,{error:'Request too large.'}); }
    let data; try { data = JSON.parse(body); } catch { return json(res,400,{error:'Invalid request.'}); }
    const name = String(data.name || '').trim().slice(0,20) || 'Player';
    if (url.pathname === '/api/create') {
      let code; do { code = crypto.randomBytes(3).toString('hex').toUpperCase(); } while (rooms.has(code));
      const token = crypto.randomUUID(); rooms.set(code,{code,players:[{name,token,listeners:new Set()}],boards:[[[],[],[]],[[],[],[]]],turn:0,die:roll(),winner:null}); return json(res,200,{code,token});
    }
    const room = rooms.get(String(data.code || '').toUpperCase()); if (!room) return json(res,404,{error:'Room not found. Check the code and try again.'});
    if (url.pathname === '/api/join') { if (room.players.length === 2) return json(res,409,{error:'This room is full.'}); const token = crypto.randomUUID(); room.players.push({name,token,listeners:new Set()}); broadcast(room); return json(res,200,{code:room.code,token}); }
    const player = room.players.findIndex(p=>p.token===data.token); if (player < 0) return json(res,403,{error:'Player not found.'});
    if (url.pathname === '/api/move') {
      const col = data.column; if (room.players.length < 2 || room.winner !== null || room.turn !== player || !Number.isInteger(col) || col < 0 || col > 2 || room.boards[player][col].length >= 3) return json(res,400,{error:'That move is not available.'});
      const die = room.die; room.boards[player][col].push(die); room.boards[1-player][col] = room.boards[1-player][col].filter(n=>n!==die);
      if (room.boards[player].every(c=>c.length === 3)) { const scores = room.boards.map(score); room.winner = scores[0] === scores[1] ? 'tie' : scores[0] > scores[1] ? 0 : 1; } else { room.turn = 1-player; room.die = roll(); }
      broadcast(room); return json(res,200,{ok:true});
    }
    return json(res,404,{error:'Unknown action.'});
  }
  if (req.method === 'GET') { const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1); if (!['index.html','style.css','app.js'].includes(file)) return json(res,404,{error:'Not found'}); res.writeHead(200,{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html'}); return fs.createReadStream(path.join(__dirname,'public',file)).pipe(res); }
  json(res,405,{error:'Method not allowed'});
});
if (require.main === module) server.listen(process.env.PORT || 3000, '0.0.0.0',()=>console.log(`Listening on port ${process.env.PORT || 3000}`));
module.exports = { server, score };
