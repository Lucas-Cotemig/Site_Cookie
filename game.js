/* ===== JOGO CHUVA DE COOKIES ===== */
(function(){
const $=id=>document.getElementById(id);
const fundo=$('cg-fundo'), win=$('cg-win'), openBtn=document.querySelector('.play_game a');
const cv=$('cg-canvas'), g=cv.getContext('2d');
const W=160, H=120, JAR_W=20, JAR_Y=96, FLOOR=110;

/* ===== Sprites em pixel ===== */
const MAP=["..oooo..",".olddco.","oldddddo","odcdddco","oddddcdo","odcddddo",".oddcdo.","..oooo.."];
const PALS={
  cookie:{o:'#2a1015', d:'#dc9d50', l:'#f2c47c', c:'#3e1f15'},
  gold:  {o:'#8a5a00', d:'#ffd23f', l:'#fff4b8', c:'#ffffff'},
  burnt: {o:'#0d0605', d:'#3b2a24', l:'#5a443c', c:'#ff5c2a'}
};
function sprite(pal){ const c=document.createElement('canvas'); c.width=c.height=8; const k=c.getContext('2d');
  MAP.forEach((row,y)=>[...row].forEach((ch,x)=>{ if(pal[ch]){ k.fillStyle=pal[ch]; k.fillRect(x,y,1,1); } })); return c; }
const SPR={}; for(const n in PALS) SPR[n]=sprite(PALS[n]);
document.querySelectorAll('canvas[data-spr]').forEach(c=>c.getContext('2d').drawImage(SPR[c.dataset.spr],0,0));

/* fonte minúscula para "+1", "+5" */
const FONT={'+':['...','.o.','ooo','.o.','...'],'1':['.o.','oo.','.o.','.o.','ooo'],'5':['ooo','o..','oo.','..o','oo.']};
function text(s,x,y,col){ g.fillStyle=col; [...s].forEach((ch,i)=>{ const f=FONT[ch]; if(!f) return; f.forEach((r,yy)=>[...r].forEach((p,xx)=>{ if(p==='o') g.fillRect(x+i*4+xx,y+yy,1,1); })); }); }

/* cenário desenhado uma vez */
const bg=document.createElement('canvas'); bg.width=W; bg.height=H;
(function(){ const k=bg.getContext('2d');
  k.fillStyle='#5a2a33'; k.fillRect(0,0,W,H);
  k.fillStyle='rgba(0,0,0,.10)'; for(let y=0;y<FLOOR;y+=8) for(let x=(y/8%2)*8;x<W;x+=16) k.fillRect(x,y,8,8);
  // janelinha
  k.fillStyle='#2a1015'; k.fillRect(112,12,34,26); k.fillStyle='#f9c5d1'; k.fillRect(114,14,30,22); k.fillStyle='#ffdbe4'; k.fillRect(114,14,30,8);
  k.fillStyle='#2a1015'; k.fillRect(128,14,2,22); k.fillRect(114,24,30,2);
  // prateleira com potes
  k.fillStyle='#2a1015'; k.fillRect(10,34,50,4); k.fillStyle='#8a4a3a'; k.fillRect(10,34,50,2);
  [[14,'#c17e3a'],[28,'#7a4325'],[42,'#dc9d50']].forEach(([x,c])=>{ k.fillStyle='#2a1015'; k.fillRect(x,22,10,12); k.fillStyle='#fdeef2'; k.fillRect(x+1,24,8,9); k.fillStyle=c; k.fillRect(x+1,28,8,5); k.fillStyle='#ee2a5e'; k.fillRect(x,21,10,2); });
  // toalha xadrez no balcão
  for(let y=FLOOR;y<H;y+=4) for(let x=0;x<W;x+=4){ k.fillStyle=((x+y)/4)%2?'#fff3e6':'#ee2a5e'; k.fillRect(x,y,4,4); }
  k.fillStyle='#2a1015'; k.fillRect(0,FLOOR-1,W,1);
})();

/* ===== Estado do jogo ===== */
let state='title', items=[], parts=[], pops=[], score=0, lives=3, t=0, spawnT=0, jarX=W/2-JAR_W/2, targetX=null, keys={left:false,right:false}, shake=0, flash=0, last=0, running=false, best=0;
try{ best=parseInt(localStorage.getItem('pixelcookie-recorde')||'0',10)||0; }catch(e){}
const pad=n=>String(n).padStart(3,'0');
function hud(){
  $('cg-score').textContent=pad(score); $('cg-best').textContent=pad(best);
  $('cg-hearts').innerHTML='♥'.repeat(lives)+'<span class="off">'+'♥'.repeat(3-lives)+'</span>';
  $('cg-hearts').setAttribute('aria-label', lives+(lives===1?' vida':' vidas'));
}

function start(){
  items=[]; parts=[]; pops=[]; score=0; lives=3; t=0; spawnT=.4; shake=0; flash=0; jarX=W/2-JAR_W/2;
  state='play'; $('cg-title').hidden=true; $('cg-end').hidden=true; hud(); cv.focus({preventScroll:true});
}
function gameOver(){
  state='over';
  const rec=score>best; if(rec){ best=score; try{ localStorage.setItem('pixelcookie-recorde',String(best)); }catch(e){} }
  $('cg-newrec').hidden=!rec;
  $('cg-endtxt').textContent='Você pegou '+score+(score===1?' cookie.':' cookies.');
  $('cg-end').hidden=false; hud();
  setTimeout(()=>$('cg-again').focus({preventScroll:true}),50);
}
function burst(x,y,cols,n){ for(let i=0;i<n;i++) parts.push({x,y,vx:(Math.random()-.5)*60,vy:-Math.random()*50-10,life:.5+Math.random()*.3,col:cols[i%cols.length]}); }

function spawn(){
  const r=Math.random(), burntP=Math.min(.36,.18+t*.004);
  const type = r<.06?'gold' : r<.06+burntP?'burnt' : 'cookie';
  const sp=(34+t*1.1)*(.85+Math.random()*.3)*(type==='gold'?1.25:1);
  items.push({x:6+Math.random()*(W-20), y:-8, vy:sp, type, wob:Math.random()*6});
}

function update(dt){
  if(state!=='play') { parts.forEach(p=>p.life-=dt); return; }
  t+=dt;
  // pote
  const sp=120;
  if(keys.left) jarX-=sp*dt; if(keys.right) jarX+=sp*dt;
  if(targetX!==null) jarX+=(targetX-JAR_W/2-jarX)*Math.min(1,dt*18);
  jarX=Math.max(1,Math.min(W-JAR_W-1,jarX));
  // novos itens
  spawnT-=dt; if(spawnT<=0){ spawn(); spawnT=Math.max(.36,.95-t*.012)*(.7+Math.random()*.6); }
  // movimento e colisão
  for(let i=items.length-1;i>=0;i--){
    const it=items[i]; it.y+=it.vy*dt;
    const cx=it.x+4, bottom=it.y+8;
    if(bottom>=JAR_Y+1 && bottom<=JAR_Y+9 && cx>=jarX-1 && cx<=jarX+JAR_W+1){
      items.splice(i,1);
      if(it.type==='burnt'){ lives--; shake=.3; flash=.25; burst(cx,JAR_Y,['#3b2a24','#ff5c2a','#5a443c'],10); }
      else { const v=it.type==='gold'?5:1; score+=v; burst(cx,JAR_Y,it.type==='gold'?['#ffd23f','#ffffff','#fff4b8']:['#f2c47c','#ffffff','#ee2a5e'],it.type==='gold'?14:7); pops.push({x:cx-4,y:JAR_Y-8,txt:'+'+v,life:.7,col:it.type==='gold'?'#ffd23f':'#ffffff'}); }
      hud(); if(lives<=0){ gameOver(); return; }
      continue;
    }
    if(it.y>FLOOR-6){
      items.splice(i,1);
      if(it.type==='cookie'){ lives--; shake=.25; flash=.2; burst(cx,FLOOR-2,['#dc9d50','#3e1f15'],8); hud(); if(lives<=0){ gameOver(); return; } }
      else burst(cx,FLOOR-2,it.type==='gold'?['#ffd23f']:['#5a443c'],4);
    }
  }
  parts.forEach(p=>{ p.x+=p.vx*dt; p.y+=p.vy*dt; p.vy+=140*dt; p.life-=dt; });
  parts=parts.filter(p=>p.life>0);
  pops.forEach(p=>{ p.y-=14*dt; p.life-=dt; }); pops=pops.filter(p=>p.life>0);
  shake=Math.max(0,shake-dt); flash=Math.max(0,flash-dt);
}

function drawJar(x){
  x=Math.round(x); const y=JAR_Y;
  g.fillStyle='#2a1015'; g.fillRect(x,y,JAR_W,14);
  g.fillStyle='#fdeef2'; g.fillRect(x+1,y+1,JAR_W-2,12);
  // cookies dentro do pote sobem com os pontos
  const lvl=Math.min(10,Math.floor(score/3));
  if(lvl>0){ g.fillStyle='#c17e3a'; g.fillRect(x+1,y+13-lvl,JAR_W-2,lvl); g.fillStyle='#3e1f15'; for(let i=0;i<lvl;i+=2) g.fillRect(x+3+(i*5)%14,y+12-i,1,1); }
  g.fillStyle='#ee2a5e'; g.fillRect(x+3,y+6,JAR_W-6,5);
  g.fillStyle='#fff3e6'; g.fillRect(x+8,y+7,1,1); g.fillRect(x+10,y+7,1,1); g.fillRect(x+8,y+8,3,1); g.fillRect(x+9,y+9,1,1);
  g.fillStyle='#ffffff'; g.fillRect(x+2,y+2,1,4);
  g.fillStyle='#2a1015'; g.fillRect(x-1,y-1,JAR_W+2,3); g.fillStyle='#ee2a5e'; g.fillRect(x,y,JAR_W,1);
}

function draw(){
  g.save();
  if(shake>0) g.translate(Math.round((Math.random()-.5)*3), Math.round((Math.random()-.5)*3));
  g.drawImage(bg,0,0);
  items.forEach(it=>{ const x=Math.round(it.x+Math.sin((it.y+it.wob*10)/8)*.6), y=Math.round(it.y); g.drawImage(SPR[it.type],x,y);
    if(it.type==='gold' && Math.floor(t*6)%2){ g.fillStyle='#ffffff'; g.fillRect(x-1,y+1,1,1); g.fillRect(x+8,y+5,1,1); }
    if(it.type==='burnt' && Math.floor((t+it.wob)*4)%2){ g.fillStyle='rgba(200,200,200,.6)'; g.fillRect(x+3,y-2,1,1); g.fillRect(x+5,y-3,1,1); } });
  // sombra do pote
  g.fillStyle='rgba(0,0,0,.25)'; g.fillRect(Math.round(jarX)+1,FLOOR,JAR_W,2);
  drawJar(jarX);
  parts.forEach(p=>{ g.fillStyle=p.col; g.fillRect(Math.round(p.x),Math.round(p.y),1,1); });
  pops.forEach(p=>text(p.txt,Math.round(p.x),Math.round(p.y),p.col));
  g.restore();
  if(flash>0){ g.fillStyle='rgba(238,42,94,'+(flash*1.4)+')'; g.fillRect(0,0,W,H); }
}

function frame(now){
  if(!running) return;
  const dt=Math.min(.05,(now-(last||now))/1000); last=now;
  update(dt); draw();
  requestAnimationFrame(frame);
}

/* ===== Controles ===== */
function toCanvasX(e){ const r=cv.getBoundingClientRect(); return (e.clientX-r.left)/r.width*W; }
cv.addEventListener('pointerdown',e=>{ targetX=toCanvasX(e); });
cv.addEventListener('pointermove',e=>{ if(e.pointerType==='mouse'||e.buttons) targetX=toCanvasX(e); });
cv.addEventListener('pointerleave',()=>{ targetX=null; });
cv.addEventListener('pointerup',e=>{ if(e.pointerType!=='mouse') targetX=null; });
document.addEventListener('keydown',e=>{
  if(fundo.hidden) return;
  const k=e.key;
  if(k==='ArrowLeft'||k==='a'||k==='A'){ keys.left=true; targetX=null; if(state==='play') e.preventDefault(); }
  if(k==='ArrowRight'||k==='d'||k==='D'){ keys.right=true; targetX=null; if(state==='play') e.preventDefault(); }
  if(k==='Escape') fechar();
});
document.addEventListener('keyup',e=>{
  if(e.key==='ArrowLeft'||e.key==='a'||e.key==='A') keys.left=false;
  if(e.key==='ArrowRight'||e.key==='d'||e.key==='D') keys.right=false;
});
$('cg-start').addEventListener('click',start);
$('cg-again').addEventListener('click',start);

/* ===== Abrir e fechar a janela ===== */
function abrir(e){
  if(e) e.preventDefault();
  fundo.hidden=false; document.body.classList.add('cg-travado');
  win.classList.remove('cg-in'); void win.offsetWidth; win.classList.add('cg-in');
  if(!running){ running=true; last=0; requestAnimationFrame(frame); }
  setTimeout(()=>{ (state==='title'?$('cg-start'):state==='over'?$('cg-again'):cv).focus({preventScroll:true}); },60);
}
function fechar(){
  if(fundo.hidden) return;
  fundo.hidden=true; document.body.classList.remove('cg-travado'); running=false; keys.left=keys.right=false;
  if(state==='play'){ state='title'; $('cg-title').hidden=false; $('cg-end').hidden=true; }
  openBtn.focus({preventScroll:true});
}
$('cg-close').addEventListener('click',fechar);
$('cg-shop').addEventListener('click',fechar);
openBtn.addEventListener('click',abrir);
// clicar no fundo escuro (fora da janela) também fecha
fundo.addEventListener('click',e=>{ if(e.target===fundo) fechar(); });
document.addEventListener('visibilitychange',()=>{ if(document.hidden){ running=false; } else if(!fundo.hidden && !running){ running=true; last=0; requestAnimationFrame(frame); } });

hud(); draw();
})();
