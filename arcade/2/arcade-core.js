(function(){
const A = window.Arcade = window.Arcade || { games:{} };
A.register = (id, def) => { A.games[id] = def; };
A.C = { forest:'#015640', green:'#00B451', lime:'#D5F367', ink:'#121313', cream:'#EDE9D8', sand:'#DAD3B1', paper:'#F0F2F0', pink:'#EA55AB', sky:'#64CDF5', gold:'#F9BF01', red:'#FF4539', orange:'#DD8B03', lavender:'#E9B9F7', mint:'#C7F1EE', blue:'#014987', bark:'#8D5B1D', peach:'#FBB99D' };
A.diff = 'normal'; A.speed = 1; A.D = (e,n,h) => A.diff=='easy'?e:A.diff=='hard'?h:n;
A.hinter = (api, run, max) => { if (max == null) max = A.D(5,3,1); let left = max;
  const push = () => api.hint && api.hint({ left: A.infiniteHints ? Infinity : left, run: (quiet) => { if (left <= 0 && !A.infiniteHints) { if (!quiet) A.sfx('bad'); return; } if (run(quiet) !== false) { if (!A.infiniteHints) left--; if (!quiet) { A.sfx('coin'); push(); } } } });
  push(); return { reset(){ left = max; push(); } }; };
A.pulse = (e, col='#F9BF01', ms=1400) => { e.style.outline = '4px solid ' + col; e.style.outlineOffset = '-4px'; setTimeout(() => { e.style.outline = ''; }, ms); };
A.font = '"Uncut Sans","Inter",system-ui,sans-serif';
let ctx = null; A.muted = false;
const tone = (f, d, type='square', v=0.06, when=0) => {
  if (A.muted) return;
  try {
    ctx = ctx || new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + when;
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d);
  } catch(e){}
};
A.tone = tone;
A.sfx = (n) => {
  const s = {
    blip:()=>tone(660,.06), hit:()=>tone(330,.08,'square'), point:()=>{tone(880,.07);tone(1320,.09,'square',.05,.06)},
    bad:()=>tone(140,.25,'sawtooth',.07), over:()=>{[440,330,220,150].forEach((f,i)=>tone(f,.18,'triangle',.08,i*.14))},
    win:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.14,'square',.06,i*.1))}, coin:()=>{tone(988,.06);tone(1319,.16,'square',.05,.06)},
    step:()=>tone(200,.03,'triangle',.03), flip:()=>tone(520,.05,'triangle',.06)
  }; (s[n]||s.blip)();
};
A.el = (tag, style={}, text) => { const e = document.createElement(tag); Object.assign(e.style, style); if (text!=null) e.textContent = text; return e; };
A.canvas = (host, w=480, h=480) => {
  const c = document.createElement('canvas'), dpr = window.devicePixelRatio||1;
  c.width = w*dpr; c.height = h*dpr; c.style.width = w+'px'; c.style.height = h+'px'; c.style.display='block'; c.style.borderRadius='12px';
  host.appendChild(c); const g = c.getContext('2d'); g.scale(dpr,dpr); return {c, g, w, h};
};
A.keys = (handler) => { const f = e => { if (handler(e) !== false && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault(); }; window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); };
A.loop = (fn) => { let id, last = performance.now(), live = true; const t = now => { if(!live) return; const dt = Math.min(50, now-last); last = now; fn(dt/1000*A.speed); id = requestAnimationFrame(t); }; id = requestAnimationFrame(t); return () => { live=false; cancelAnimationFrame(id); }; };
A.overlayText = (g, w, h, big, small) => {
  g.fillStyle = 'rgba(1,86,64,0.82)'; g.fillRect(0,0,w,h);
  g.fillStyle = '#D5F367'; g.textAlign='center'; g.font = '700 34px '+A.font; g.fillText(big, w/2, h/2-8);
  if (small){ g.fillStyle='#fff'; g.font='500 16px '+A.font; g.fillText(small, w/2, h/2+26); }
};
})();
