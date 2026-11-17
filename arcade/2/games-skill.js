(function(){
const A = window.Arcade, C = A.C, el = A.el, {board, btn, splash} = A.ui;

A.register('reaction', { mount(host, api){
  const b = board(host); let to, st='idle', t0, times=[];
  const msg = el('div',{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px',color:'#fff',textAlign:'center',cursor:'pointer',transition:'background .1s'}); b.appendChild(msg);
  const big=el('div',{fontSize:'40px',fontWeight:700}), small=el('div',{fontSize:'16px',fontWeight:500}); msg.append(big,small);
  const set=(bg,a,s)=>{msg.style.background=bg;big.textContent=a;small.textContent=s;};
  const arm=()=>{st='wait';set(C.red,'WAIT FOR GREEN','Round '+(times.length+1)+' of 5');const go=()=>{st='go';t0=performance.now();set(C.green,'CLICK','');A.sfx('blip');};const d=1000+Math.random()*2500;if(Math.random()<A.D(0,.25,.5)){to=setTimeout(()=>{set(C.gold,'NOT YET','Decoy. Hold steady.');to=setTimeout(()=>{set(C.red,'WAIT FOR GREEN','');to=setTimeout(go,500+Math.random()*1200);},500);},d*.6);}else to=setTimeout(go,d);};
  set(C.forest,'REACTION TEST','Click when the screen turns green. Five rounds. Click to begin.');
  const click=()=>{
    if(st=='idle'||st=='done'){times=[];api.score(0);arm();}
    else if(st=='wait'){clearTimeout(to);A.sfx('bad');st='early';set(C.orange,'TOO EARLY','Click to retry this round');}
    else if(st=='early')arm();
    else if(st=='go'){const t=Math.round(performance.now()-t0);times.push(t);A.sfx('point');
      if(times.length>=5){const avg=Math.round(times.reduce((a,b)=>a+b)/5),sc=Math.max(0,600-avg);st='done';api.score(sc);api.over(sc);A.sfx('win');set(C.forest,avg+' ms average','Score '+sc+' · click to run it back');}
      else{st='between';set(C.blue,t+' ms','Click for next round');}}
    else if(st=='between')arm();
  };
  msg.addEventListener('mousedown',click); const offK=A.keys(e=>{if(e.key==' ')click();});
  return()=>{clearTimeout(to);offK();};
}});

A.register('typing', { mount(host, api){
  const b = board(host, C.cream); let iv;
  const words='trail ridge cedar valley canyon meadow summit river pine aspen boulder creek eagle ember lantern compass timber harvest trout moose ranch fence saddle hollow thicket granite marsh willow falcon glacier'.split(' ');
  const start=()=>{ b.innerHTML=''; const T=A.D(45,30,25), pool=A.D(words.filter(w=>w.length<=5),words,'wilderness switchback watershed backcountry thunderhead headwaters avalanche campfire trailhead woodpecker sagebrush firelight homestead riverbank wildflower'.split(' ').concat(words.filter(w=>w.length>=6))); let left=T, typed=0, errs=0, line=[...Array(60)].map(()=>pool[Math.random()*pool.length|0]), wi=0;
    const hud=el('div',{display:'flex',justifyContent:'space-between',padding:'16px 20px',fontWeight:700,fontSize:'18px',color:C.forest}); const hT=el('span'),hW=el('span'); hud.append(hW,hT); b.appendChild(hud);
    const txt=el('div',{padding:'8px 24px',fontSize:'26px',lineHeight:'1.6',fontWeight:500,color:'#868687',height:'300px',overflow:'hidden'}); b.appendChild(txt);
    const inp=el('input',{margin:'0 24px',width:'432px',fontFamily:A.font,fontSize:'24px',padding:'12px 16px',borderRadius:'12px',border:'2px solid '+C.forest,outline:'none',background:'#fff',color:C.ink}); inp.autocomplete='off'; inp.spellcheck=false; b.appendChild(inp);
    const draw=()=>{txt.innerHTML='';line.slice(Math.max(0,wi-2),wi+14).forEach((w,k)=>{const i=k+Math.max(0,wi-2);const s=el('span',{marginRight:'12px',color:i<wi?C.green:i==wi?C.forest:'#868687',background:i==wi?C.lime:'transparent',borderRadius:'6px',padding:'0 4px'},w);txt.append(s,' ');});
      const wpm=Math.round(typed/((T-left)||1)*60);hW.textContent=typed+' words · '+wpm+' wpm';hT.textContent=left+'s';};
    draw(); setTimeout(()=>inp.focus(),50);
    inp.oninput=()=>{ const v=inp.value; if(v.endsWith(' ')){ if(v.trim()==line[wi]){typed++;A.sfx('blip');}else{errs++;A.sfx('bad');} wi++; inp.value=''; api.score(typed*10); draw(); }
      else inp.style.borderColor=line[wi].startsWith(v)?C.forest:C.red; };
    iv=setInterval(()=>{left--;draw();if(left<=0){clearInterval(iv);inp.disabled=true;const wpm=Math.round(typed*60/T),sc=Math.max(0,typed*10-errs*5);api.score(sc);api.over(sc);A.sfx('over');splash(b,wpm+' WPM',typed+' clean words, '+errs+' misses · score '+sc,'Race again',start);}},1000);
  };
  splash(b,'TYPING RACE','Type each word, then press space. Easy is longer with short words; Hard is shorter with long ones.','Start',start);
  return()=>clearInterval(iv);
}});

A.register('simon', { mount(host, api){
  const b = board(host, C.ink); let tos=[];
  const cols=[C.green,C.red,C.gold,C.sky], freqs=[330,392,494,587];
  const grid=el('div',{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',padding:'30px',height:'100%'}); b.appendChild(grid);
  const center=el('div',{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'130px',height:'130px',borderRadius:'50%',background:C.ink,color:C.lime,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'36px',zIndex:2}); b.appendChild(center);
  let seq=[], pos=0, busy=true;
  const pads=cols.map((c,i)=>{const p=el('div',{background:c,opacity:.35,borderRadius:['240px 12px 12px 12px','12px 240px 12px 12px','12px 12px 12px 240px','12px 12px 240px 12px'][i],cursor:'pointer',transition:'opacity .12s'});
    p.onmousedown=()=>press(i);grid.appendChild(p);return p;});
  const lit=(i,d=300)=>{pads[i].style.opacity=1;A.tone(freqs[i],d/1000,'triangle',.08);tos.push(setTimeout(()=>pads[i].style.opacity=.35,d));};
  const playSeq=()=>{busy=true;pos=0;center.textContent=seq.length;const sp=Math.max(A.D(320,220,150),A.D(650,500,380)-seq.length*20)/A.speed;seq.forEach((v,k)=>tos.push(setTimeout(()=>lit(v,sp*.7),600+k*sp)));tos.push(setTimeout(()=>busy=false,600+seq.length*sp));};
  const hints=A.hinter(api,()=>{ if(busy||!seq.length)return false; playSeq(); });
  const next=()=>{seq.push(Math.random()*4|0);playSeq();};
  function press(i){ if(busy)return; lit(i,180); if(i!=seq[pos]){busy=true;A.sfx('over');const sc=(seq.length-1)*50;api.over(sc);tos.push(setTimeout(()=>splash(b,'WRONG PAD','You remembered '+(seq.length-1)+' in a row · score '+sc,'Try again',()=>{seq=[];api.score(0);hints.reset();next();}),400));return;}
    pos++; if(pos==seq.length){api.score(seq.length*50);tos.push(setTimeout(next,500));} }
  splash(b,'SIMON SAYS','Watch the pattern. Repeat it back. It gets one longer each round.','Start',()=>{seq=[];api.score(0);hints.reset();next();});
  return()=>tos.forEach(clearTimeout);
}});

A.register('mines', { mount(host, api){
  const b = board(host, C.forest); let N=10, M=14; let iv;
  let hintFn=()=>false; const hints=A.hinter(api,()=>hintFn());
  const start=()=>{ N=A.D(8,10,12); M=A.D(8,14,26); b.innerHTML=''; let cells, first=true, dead=false, opened=0, t=0; clearInterval(iv);
    const hud=el('div',{display:'flex',justifyContent:'space-between',padding:'10px 16px',color:C.lime,fontWeight:700,fontSize:'16px'},''); const hL=el('span','',M+' mines · right-click to flag'),hT=el('span',{},'0s'); hL.textContent=M+' mines · right-click flags'; hud.append(hL,hT); b.appendChild(hud);
    const grid=el('div',{display:'grid',gridTemplateColumns:'repeat('+N+',1fr)',gap:'3px',padding:'0 16px 16px',height:'438px'}); b.appendChild(grid);
    cells=[...Array(N*N)].map((_,i)=>{const c=el('div',{background:C.green,borderRadius:'5px',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'18px',cursor:'pointer'});
      c.onmousedown=e=>{e.preventDefault();if(dead)return;e.button==2?flag(i):open(i);};c.oncontextmenu=e=>e.preventDefault();grid.appendChild(c);return {c,m:0,o:0,f:0};});
    const nb=i=>{const x=i%N,y=i/N|0,r=[];for(let dx=-1;dx<2;dx++)for(let dy=-1;dy<2;dy++){const X=x+dx,Y=y+dy;if((dx||dy)&&X>=0&&Y>=0&&X<N&&Y<N)r.push(Y*N+X);}return r;};
    const lay=safe=>{let k=0;while(k<M){const i=Math.random()*N*N|0;if(i!=safe&&!nb(safe).includes(i)&&!cells[i].m){cells[i].m=1;k++;}}};
    const numC=['',C.sky,C.lime,C.gold,C.orange,C.pink,C.red,C.lavender,'#fff'];
    hintFn=()=>{ if(dead)return false; if(first){A.pulse(cells[(N>>1)*N+(N>>1)].c,C.gold);return;} const safe=cells.map((q,i)=>i).filter(i=>!cells[i].o&&!cells[i].m&&!cells[i].f); const front=safe.filter(i=>nb(i).some(z=>cells[z].o)); const pool=front.length?front:safe; if(!pool.length)return false; A.pulse(cells[pool[Math.random()*pool.length|0]].c,C.gold); }; hints.reset();
    function flag(i){const k=cells[i];if(k.o)return;k.f^=1;k.c.textContent=k.f?'⚑':'';k.c.style.color=C.gold;A.sfx('blip');}
    function open(i){ const k=cells[i]; if(k.o||k.f)return; if(first){first=false;lay(i);iv=setInterval(()=>hT.textContent=(++t)+'s',1000);}
      if(k.m){dead=true;clearInterval(iv);cells.forEach(q=>{if(q.m){q.c.style.background=C.red;q.c.textContent='✹';q.c.style.color='#fff';}});A.sfx('over');api.over(opened*5);setTimeout(()=>splash(b,'BOOM','Cleared '+opened+' tiles · score '+opened*5,'New field',start),700);return;}
      const flood=[i]; while(flood.length){const j=flood.pop(),q=cells[j];if(q.o||q.f)continue;q.o=1;opened++;const n=nb(j).filter(z=>cells[z].m).length;
        q.c.style.background='rgba(255,255,255,.12)';q.c.style.cursor='default';q.c.textContent=n||'';q.c.style.color=numC[n];if(!n)nb(j).forEach(z=>flood.push(z));}
      A.sfx('flip'); api.score(opened*5);
      if(opened==N*N-M){dead=true;clearInterval(iv);const sc=opened*5+Math.max(0,1000-t*5);api.score(sc);api.over(sc);A.sfx('win');splash(b,'FIELD CLEARED',t+' seconds · score '+sc,'New field',start);} }
  };
  start(); return()=>clearInterval(iv);
}});
})();
