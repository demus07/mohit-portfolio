/* eslint-disable */
/*
 * The painted walk. Brushes after Sumedh's Marine Drive: soft gradients, glows, wisps of cloud that
 * drift and wrap, glints on the water, lamps that pool their light. Every scene is a canvas built once
 * per size and light, repainted in the frame the page scrolls and at about 30fps while it is on screen.
 *
 * mount() paints into the sections already on the page and returns a function that stops it all.
 */

const TAU = Math.PI * 2;
function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function rngA(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(",")})`;
const hex = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
const mixA = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const rgba = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mul = (c, k) => c.map((v) => Math.min(255, v * k));
const progressOf = (sec) => { const r = sec.getBoundingClientRect(); return clamp(-r.top / (r.height - innerHeight)); };

function glow(c, x, y, r, rgb, a) {
  if (r <= 0 || a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}
function layer(w, h, dpr) {
  const cv = document.createElement("canvas");
  cv.width = Math.max(1, Math.ceil(w * dpr));
  cv.height = Math.max(1, Math.ceil(h * dpr));
  const c = cv.getContext("2d");
  c.scale(dpr, dpr);
  return [cv, c];
}
function linear(c, x0, y0, x1, y1, stops) {
  const g = c.createLinearGradient(x0, y0, x1, y1);
  stops.forEach(([o, col]) => g.addColorStop(o, col));
  return g;
}
// a wisp of cloud: shaded faintly below, lit along the top, the sky showing through its edges
function cloudSprite(s, dpr, seed, lit, shade, litA, shadeA) {
  const [cv, c] = layer(s * 4.6, s * 1.9, dpr);
  const x = s * 2.3, y = s * 1.05, r = rng(seed);
  const puffs = Array.from({ length: 11 }, (_, i) => {
    const u = i / 10 - 0.5;
    return { x: x + u * s * 3.2 + (r() - 0.5) * s * 0.3, y: y - (1 - Math.abs(u) * 1.7) * s * 0.22 - r() * s * 0.1, r: s * (0.3 + (0.5 - Math.abs(u)) * 0.45 + r() * 0.12) };
  });
  for (const p of puffs) {
    const g = c.createRadialGradient(p.x, p.y + p.r * 0.25, 0, p.x, p.y + p.r * 0.25, p.r * 1.2);
    g.addColorStop(0, `rgba(${shade},${shadeA})`); g.addColorStop(1, `rgba(${shade},0)`);
    c.fillStyle = g; c.beginPath(); c.ellipse(p.x, p.y + p.r * 0.25, p.r * 1.6, p.r * 1.2, 0, 0, TAU); c.fill();
  }
  for (const p of puffs) {
    const ly = p.y - p.r * 0.3;
    const g = c.createRadialGradient(p.x, ly, 0, p.x, ly, p.r);
    g.addColorStop(0, `rgba(${lit},${litA})`); g.addColorStop(0.6, `rgba(${lit},${litA * 0.47})`); g.addColorStop(1, `rgba(${lit},0)`);
    c.fillStyle = g; c.beginPath(); c.ellipse(p.x, ly, p.r * 1.35, p.r, 0, 0, TAU); c.fill();
  }
  return cv;
}
// the same wisp, painted straight onto the city from the air, with a warm underside at dusk
function cloudA(c,x,y,s,night,seed,warm=0){
  const r=rngA(seed);
  const puffs=Array.from({length:11},(_,i)=>{const u=i/10-.5;return{x:x+u*s*3.2+(r()-.5)*s*.3,y:y-(1-Math.abs(u)*1.7)*s*.22-r()*s*.1,r:s*(.3+(.5-Math.abs(u))*.45+r()*.12)}});
  const lit=night?(warm?"240,132,118":"150,170,205"):"255,255,255", shade=night?"16,22,46":"170,180,196";
  for(const p of puffs){const g=c.createRadialGradient(p.x,p.y+p.r*.25,0,p.x,p.y+p.r*.25,p.r*1.2);g.addColorStop(0,`rgba(${shade},${night?.45:.28})`);g.addColorStop(1,`rgba(${shade},0)`);c.fillStyle=g;c.beginPath();c.ellipse(p.x,p.y+p.r*.25,p.r*1.6,p.r*1.2,0,0,TAU);c.fill()}
  for(const p of puffs){const ly=p.y+(night&&warm?p.r*.2:-p.r*.3);const g=c.createRadialGradient(p.x,ly,0,p.x,ly,p.r);g.addColorStop(0,`rgba(${lit},${night?(warm?.42:.22):.85})`);g.addColorStop(.6,`rgba(${lit},${night?(warm?.16:.08):.4})`);g.addColorStop(1,`rgba(${lit},0)`);c.fillStyle=g;c.beginPath();c.ellipse(p.x,ly,p.r*1.35,p.r,0,0,TAU);c.fill()}
}

/* ───────── South Mumbai from the air ─────────
 * A painted city on a perspective grid, the two crowned towers in its middle and Marine Drive along the
 * water. Rendered once per size and light; the landing then only zooms it, drifts cloud over it and
 * lets windows catch the light.
 */
function buildCity(W,H,dpr,night){
  const phone=W<720;
  const off=document.createElement("canvas");off.width=Math.round(W*dpr);off.height=Math.round(H*dpr);
  const c=off.getContext("2d");c.scale(dpr,dpr);
  const th=(phone?38:33)*Math.PI/180, ct=Math.cos(th), st=Math.sin(th);
  const F=H*(phone?.72:.86), hy=H*(phone?.43:.37), cy=hy+F*Math.tan(th), cx=W*(phone?.5:.6), HC=560;
  const pr=(X,Y,Z)=>{const dy=Y-HC,d=-dy*st+Z*ct,up=dy*ct+Z*st;return[cx+X*F/d,cy-up*F/d,d]};
  const Zc=X=>2350-1300*smooth(-500,2000,X);           // the coast: far on the left, curving in on the right
  const haze=night?[48,42,78]:[240,224,200];
  const fogOf=d=>clamp(1-Math.exp(-Math.max(0,d-800)/(night?2600:4600)),0,night?.8:.62);
  const r=rngA(night?11:11);

  // sky
  let g=c.createLinearGradient(0,0,0,hy);
  (night?[[0,"#050c1d"],[.4,"#0f2047"],[.72,"#2d2a5c"],[.86,"#86405a"],[.95,"#de6a45"],[1,"#f4a35e"]]
       :[[0,"#5f93c4"],[.42,"#a7c6da"],[.78,"#efd6aa"],[1,"#f8c88a"]]).forEach(([o,col])=>g.addColorStop(o,col));
  c.fillStyle=g;c.fillRect(0,0,W,hy+2);
  if(night){const sr=rngA(5);for(let i=0;i<70;i++){const x=sr()*W,y=sr()*hy*.6;c.fillStyle=`rgba(243,236,223,${.25+sr()*.5})`;c.beginPath();c.arc(x,y,.5+sr()*.9,0,TAU);c.fill()}}
  else{glow(c,W*(phone?.72:.84),hy,W*.8,"255,214,150",.55);glow(c,W*(phone?.72:.84),hy-H*.015,W*.12,"255,246,222",.9);c.fillStyle="#fff7e6";c.beginPath();c.arc(W*(phone?.72:.84),hy-H*.012,Math.max(8,W*.012),0,TAU);c.fill()}
  // sea down to the coast
  g=c.createLinearGradient(0,hy,0,H);
  (night?[[0,"#c86a4e"],[.03,"#4a3550"],[.12,"#14213f"],[1,"#081224"]]:[[0,"#f7d9a8"],[.06,"#c9d3c8"],[.4,"#7fb0c0"],[1,"#3d7c96"]]).forEach(([o,col])=>g.addColorStop(o,col));
  c.fillStyle=g;c.fillRect(0,hy,W,H-hy);
  // a sheen on the water
  for(let i=0;i<260;i++){const X=(r()-.5)*9000,Z=Zc(X)+80+Math.pow(r(),1.6)*7000,[x,y,d]=pr(X,0,Z);if(y<hy+1||y>H)continue;
    const l=(6+r()*26)*F/d*3;c.fillStyle=night?`rgba(240,150,110,${.05+r()*.12*(1-fogOf(d))})`:`rgba(255,${236+r()*19|0},${200+r()*40|0},${.18+r()*.35})`;c.fillRect(x-l/2,y,l,Math.max(.6,1.2*F/d*2))}
  if(!night)glow(c,W*(phone?.72:.84),hy+H*.04,W*.28,"255,226,170",.35);
  // Malabar Hill at the far end of the bay
  c.beginPath();for(let X=-5200;X<=-700;X+=100){const t=(X+5200)/4500,hh=60+330*Math.pow(Math.sin(t*Math.PI),1.4)*(1-t*.3),[x,y]=pr(X,hh,4300+t*900);X===-5200?c.moveTo(x,y):c.lineTo(x,y)}
  {const [x2,y2]=pr(-700,0,5200),[x1,y1]=pr(-5200,0,4300);c.lineTo(x2,y2);c.lineTo(x1,y1)}c.closePath();
  c.fillStyle=rgba(mixA(night?[24,26,50]:[118,146,138],haze,night?.62:.5));c.fill();
  if(night){const hr=rngA(9);for(let i=0;i<160;i++){const X=-5000+hr()*4200,t=(X+5200)/4500,hh=hr()*(60+330*Math.pow(Math.sin(t*Math.PI),1.4)*(1-t*.3)),[x,y]=pr(X,hh,4300+t*900);c.fillStyle=`rgba(255,${190+hr()*50},140,${.35+hr()*.5})`;c.fillRect(x,y,1,1)}}

  // the land
  c.beginPath();c.moveTo(-20,H+20);
  for(let X=-9000;X<=9000;X+=60){const [x,y]=pr(X,0,Zc(X));c.lineTo(x,y)}
  c.lineTo(W+20,H+20);c.closePath();
  g=c.createLinearGradient(0,hy,0,H);g.addColorStop(0,rgba(mixA(night?[30,28,48]:[206,190,158],haze,.5)));g.addColorStop(1,night?"#0d1320":"#a8946e");
  c.fillStyle=g;c.fill();
  // street glow under the city at night
  if(night){for(let i=0;i<900;i++){const X=(r()-.5)*7000,Z=150+r()*2300;if(Z>Zc(X)-40)continue;const [x,y,d]=pr(X,0,Z);if(x<-40||x>W+40||y>H+40)continue;glow(c,x,y,(14+r()*30)*F/d*1.6,"242,161,69",.07+r()*.08)}}

  // the city: boxes on a loose grid, the twin crowned towers in its middle
  const items=[];
  const towerAt=(sx,Z)=>{const d=HC*st+Z*ct;return(sx-cx)*d/F};
  const TW=phone?[[.3,900],[.7,960]]:[[.63,1000],[.75,1060]];
  const towers=TW.map(([sx,Z],i)=>({tower:true,X:towerAt(W*sx,Z),Z,R:46,h:440+i*8}));
  for(let Z=170;Z<2550;){const step=34+Z*.034;
    if(r()>.16){const d0=HC*st+Z*ct,xm=(Math.max(cx,W-cx)+80)*d0/F;
      for(let X=-xm;X<xm;){const w=step*(.55+r()*.42),dp=step*(.5+r()*.42),zc=Zc(X+w/2);
        if(Z+dp<zc-55&&r()<.84&&!towers.some(t=>Math.abs(X+w/2-t.X)<95&&Math.abs(Z+dp/2-t.Z)<95)){
          const nearCoast=zc-Z<230;let h=r()<.075?105+r()*150:12+Math.pow(r(),2)*68;if(nearCoast)h=16+r()*22;
          items.push({x0:X,x1:X+w,z0:Z,z1:Z+dp,h,tone:r(),lit:r(),seed:(r()*1e9)|0})}
        X+=w+step*(.12+r()*.22)+(r()<.1?step*.7:0)}}
    Z+=step*(r()<.18?1.7:1)}
  items.push(...towers);
  // rain trees in the gaps, so the streets read as streets
  for(let i=0;i<(phone?260:420);i++){const X=(r()-.5)*7200,Z=150+Math.pow(r(),.8)*2300;if(Z>Zc(X)-70)continue;
    if(items.some(b=>!b.tower&&X>b.x0-6&&X<b.x1+6&&Z>b.z0-6&&Z<b.z1+6))continue;items.push({tree:true,X,Z,R:12+r()*16,tone:r()})}
  const depthOf=it=>it.tower||it.tree?(HC*st+it.Z*ct):(HC*st+(it.z0+it.z1)/2*ct);
  items.sort((a,b)=>depthOf(b)-depthOf(a));

  const DAY=["#f4e3c4","#f1c9a5","#eab9a8","#cdd6bd","#f6efe2","#e6cfa5","#d99a7a","#c9d6dc","#f2dcb0"].map(hex);
  const NIGHT=["#1b2536","#1f2839","#172131","#232b3d","#1a2333"].map(hex);
  const WARM=[[255,209,138],[242,161,69],[255,226,176],[255,241,214],[214,226,255]];
  const twinkle=[],beacons=[];
  const quad=(pts,col)=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fillStyle=col;c.fill()};
  function windows(A,B,Cc,D,wW,hW,b,fog,rr){
    const fh=Math.abs(A[1]-D[1]),fw=Math.hypot(B[0]-A[0],B[1]-A[1]);
    const rows=Math.min(Math.floor(hW/3.4),Math.floor(fh/3)),cols=Math.min(Math.floor(wW/4.4),Math.floor(fw/3));
    if(rows<2||cols<1){ // too far for windows: a few lit specks
      if(night)for(let k=0;k<Math.min(6,fh*fw/30);k++){const u=rr(),v=rr();const x=A[0]+(B[0]-A[0])*u+(D[0]-A[0])*v,y=A[1]+(B[1]-A[1])*u+(D[1]-A[1])*v;c.fillStyle=rgba(WARM[(rr()*3)|0],(.5+rr()*.5)*(1-fog*.5));c.fillRect(x,y,1,1)}
      return}
    const ww=Math.max(.8,fw/cols*.5),wh=Math.max(.8,fh/rows*.42),pLit=b.tower?.6:.08+Math.pow(b.lit,1.4)*.78;
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const u=(j+.5)/cols,v=(i+.55)/rows;
      const bx=A[0]+(B[0]-A[0])*u,by=A[1]+(B[1]-A[1])*u,tx=D[0]+(Cc[0]-D[0])*u,ty=D[1]+(Cc[1]-D[1])*u;const x=bx+(tx-bx)*v,y=by+(ty-by)*v;
      if(night){if(rr()<pLit){const col=WARM[rr()<.5?0:(rr()*5)|0];c.fillStyle=rgba(col,(.75+rr()*.25)*(1-fog*.45));c.fillRect(x-ww/2,y-wh/2,ww,wh);if(twinkle.length<420&&rr()<.05)twinkle.push([x-ww/2,y-wh/2,ww,wh,rr()*TAU,.4+rr()*.8])}
        else{c.fillStyle=`rgba(6,10,20,${.45*(1-fog)})`;c.fillRect(x-ww/2,y-wh/2,ww,wh)}}
      else{if(b.h<34&&!b.tower)continue;c.fillStyle=rgba(mixA(rr()<.3?[226,238,244]:[112,128,146],haze,fog),.3);c.fillRect(x-ww/2,y-wh/2,ww,wh);if(twinkle.length<140&&b.h>90&&rr()<.02)twinkle.push([x-ww/2,y-wh/2,ww,wh,rr()*TAU,.2+rr()*.4])}}
  }
  function box(b){
    const {x0,x1,z0,z1,h}=b,d=depthOf(b),fog=fogOf(d),rr=rngA(b.seed);
    const base=(night?NIGHT:DAY)[(b.tone*(night?5:9))|0];
    const front=mixA(night?base:mixA(mul(base,.86),[150,140,170],.12),haze,fog),side=mixA(night?mul(base,.72):mixA(mul(base,.6),[92,104,150],.3),haze,fog),sun=mixA(night?mul(base,.72):mixA(base,[255,226,180],.22),haze,fog),top=mixA(night?mul(base,1.25):mixA(base,[255,244,224],.25),haze,fog*.9);
    if(x0>0){const A=pr(x0,0,z1),B=pr(x0,0,z0),Cc=pr(x0,h,z0),D=pr(x0,h,z1);quad([A,B,Cc,D],rgba(side));windows(A,B,Cc,D,z1-z0,h,b,fog,rr)}
    if(x1<0){const A=pr(x1,0,z0),B=pr(x1,0,z1),Cc=pr(x1,h,z1),D=pr(x1,h,z0);quad([A,B,Cc,D],rgba(sun));windows(A,B,Cc,D,z1-z0,h,b,fog,rr)}
    const A=pr(x0,0,z0),B=pr(x1,0,z0),Cc=pr(x1,h,z0),D=pr(x0,h,z0);quad([A,B,Cc,D],rgba(front));windows(A,B,Cc,D,x1-x0,h,b,fog,rr);
    // a little contact shade at the foot, and the roof
    const g2=c.createLinearGradient(0,A[1],0,A[1]-Math.min(14,(A[1]-D[1])*.3));g2.addColorStop(0,`rgba(0,0,0,${night?.25:.12})`);g2.addColorStop(1,"rgba(0,0,0,0)");quad([A,B,[B[0],B[1]-Math.min(14,(A[1]-D[1])*.3)],[A[0],A[1]-Math.min(14,(A[1]-D[1])*.3)]],g2);
    quad([pr(x0,h,z0),pr(x1,h,z0),pr(x1,h,z1),pr(x0,h,z1)],rgba(top));
    if(night&&rr()<.08){const p=pr((x0+x1)/2,h,(z0+z1)/2);c.fillStyle=`rgba(255,220,160,${.5*(1-fog)})`;c.fillRect(p[0]-1,p[1]-1,2,1.5)}
    if(h>130&&rr()<.5){const p=pr((x0+x1)/2,h+2,(z0+z1)/2);beacons.push([p[0],p[1],rr()*TAU,1.6])}
  }
  function tower(t){
    const N=12,{X,Z,R,h}=t,d=depthOf(t),fog=fogOf(d)*.8;
    const faces=[];for(let i=0;i<N;i++){const a0=i/N*TAU,a1=(i+1)/N*TAU,am=(a0+a1)/2;const nx=Math.cos(am),nz=Math.sin(am);const fx=X+nx*R,fz=Z+nz*R;if(nx*(0-fx)+nz*(0-fz)<=0)continue;faces.push({a0,a1,nx,nz,fz})}
    faces.sort((a,b)=>b.fz-a.fz);
    const P=(a,y)=>pr(X+Math.cos(a)*R,y,Z+Math.sin(a)*R);
    for(const f of faces){
      const lightK=night?.85+.25*Math.max(0,-f.nz*.7-f.nx*.3):.62+.5*Math.max(0,-f.nz*.75-f.nx*.35);
      const base=night?[26,38,56]:[222,226,224];
      const col=mixA(mul(base,lightK),haze,fog);
      const A=P(f.a0,0),B=P(f.a1,0),Cc=P(f.a1,h),D=P(f.a0,h);quad([A,B,Cc,D],rgba(col));
      // glass bands floor by floor
      const floors=Math.min(70,Math.floor(Math.abs(A[1]-D[1])/2.6));
      for(let k=1;k<floors;k++){const v=k/floors,v2=(k+.55)/floors;const a=[A[0]+(D[0]-A[0])*v,A[1]+(D[1]-A[1])*v],b=[B[0]+(Cc[0]-B[0])*v,B[1]+(Cc[1]-B[1])*v],a2=[A[0]+(D[0]-A[0])*v2,A[1]+(D[1]-A[1])*v2],b2=[B[0]+(Cc[0]-B[0])*v2,B[1]+(Cc[1]-B[1])*v2];
        const lit=night?(k*7+f.a0*13)%5<3.3:false;
        quad([a,b,b2,a2],night?(lit?`rgba(255,${200+((k*13)%40)},150,${.75-fog*.3})`:"rgba(8,12,22,.6)"):rgba(mixA([118,140,156],haze,fog*.8),.55))}
    }
    // the crown: a setback drum, then a ribbed dome lit from inside at night
    const ring=(y,rad)=>{const pts=[];for(let i=0;i<=24;i++){const a=i/24*TAU;pts.push(pr(X+Math.cos(a)*rad,y,Z+Math.sin(a)*rad))}return pts};
    quad(ring(h,R),rgba(mixA(night?[30,44,62]:[236,236,230],haze,fog)));
    const domeCol=night?[96,196,170]:[150,190,172];
    for(let k=0;k<=10;k++){const a=k/10*Math.PI/2;const y=h+6+Math.sin(a)*R*1.15,rad=Math.cos(a)*R*.86;quad(ring(y,Math.max(1,rad)),rgba(mixA(mul(domeCol,night?.55+k*.05:.8+k*.025),haze,fog*.6)))}
    const tip=pr(X,h+6+R*1.15+18,Z),tb=pr(X,h+6+R*1.15,Z);c.strokeStyle=night?"rgba(200,255,235,.8)":"rgba(90,110,100,.8)";c.lineWidth=1.2;c.beginPath();c.moveTo(tb[0],tb[1]);c.lineTo(tip[0],tip[1]);c.stroke();
    const cp=pr(X,h+R*.6,Z);
    if(night){glow(c,cp[0],cp[1],R*F/cp[2]*2.2,"120,230,200",.22);beacons.push([tip[0],tip[1],t.X*.01,2])}
  }
  function tree(t){const d=depthOf(t),fog=fogOf(d),[x,y]=pr(t.X,t.R*.9,t.Z),rad=t.R*F/d;if(rad<.6||x<-40||x>W+40)return;
    const base=night?mixA([16,30,30],[26,44,40],t.tone):mixA([92,132,78],[132,164,96],t.tone);
    c.fillStyle=rgba(mixA(mul(base,.72),haze,fog));c.beginPath();c.ellipse(x,y+rad*.2,rad*1.25,rad*.8,0,0,TAU);c.fill();
    c.fillStyle=rgba(mixA(night?base:mixA(base,[255,236,190],.18),haze,fog));c.beginPath();c.ellipse(x-rad*.2,y-rad*.1,rad*.9,rad*.58,0,0,TAU);c.fill()}
  for(const it of items)it.tower?tower(it):it.tree?tree(it):box(it);

  // Marine Drive along the water: the road, the wall, and the Necklace at night
  const lamps=[];
  for(let X=-9000;X<9000;X+=24){const Z=Zc(X)-14,[x,y,d]=pr(X,0,Z);if(x<-30||x>W+30||y>H+30||y<hy)continue;lamps.push([x,y,d])}
  c.lineCap="round";
  for(const [k,col,wd] of [[0,night?"#141a28":"#d4cfc4",22],[8,night?"#2a2e3a":"#f3efe6",4]]){c.strokeStyle=col;c.beginPath();let s=false;
    for(let X=-9000;X<9000;X+=40){const [x,y,d]=pr(X,0,Zc(X)-k);if(y<hy)continue;c.lineWidth=Math.max(.6,wd*F/d);if(!s){c.moveTo(x,y);s=true}else c.lineTo(x,y)}c.stroke()}
  if(night)for(const [x,y,d] of lamps){const s=F/d;glow(c,x,y,22*s*3,"242,161,69",.28);c.fillStyle="#ffe2a8";c.beginPath();c.arc(x,y,Math.max(.7,1.6*s*3),0,TAU);c.fill()}
  if(!night){c.save();c.globalCompositeOperation="soft-light";const sg=c.createRadialGradient(W*(phone?.72:.84),hy,0,W*(phone?.72:.84),hy,W*1.1);sg.addColorStop(0,"rgba(255,206,140,.75)");sg.addColorStop(1,"rgba(255,206,140,0)");c.fillStyle=sg;c.fillRect(0,0,W,H);c.restore()}
  // the haze of distance laid over everything near the horizon
  g=c.createLinearGradient(0,hy-H*.06,0,hy+H*.16);g.addColorStop(0,rgba(haze,0));g.addColorStop(.45,rgba(haze,night?.3:.34));g.addColorStop(1,rgba(haze,0));c.fillStyle=g;c.fillRect(0,hy-H*.06,W,H*.22);

  return{img:off,hy,twinkle,beacons,cx,phone,
    clouds:Array.from({length:phone?4:6},(_,i)=>{const q=rngA(40+i);return{at:q(),y:hy*(phone?.78+q()*.18:.5+q()*.42),s:(phone?40:70)+q()*(phone?40:80),v:4+q()*6,seed:100+i,warm:q()<.6}})}
}


export function mount() {
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  let theme = document.documentElement.dataset.theme;
  const night = () => theme === "night";
  let dead = false;
  const subs = [];
  const listen = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); subs.push(() => target.removeEventListener(type, fn, opts)); };

  /* ───────── a painted canvas ─────────
   * Rebuilt on resize and on a change of light; repainted in the same frame the page scrolls, and at
   * about 30fps while it is on screen, which is all the drift of clouds and water needs.
   */
  const scenes = [];
  function scene(canvas, { build, draw, progress }) {
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1, data = null, vis = false, raf = 0, last = -1e9, queued = false;
    const paint = (now) => {
      if (dead || !w || !h || !data) return;
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, w, h, data, RM ? 0 : now / 1000, progress ? progress() : 0);
    };
    // layout size, not the on-screen box: a canvas may be mid-zoom when it is measured
    const size = () => ({ width: canvas.clientWidth, height: canvas.clientHeight });
    const rebuild = () => {
      const r = size();
      if (dead || !r.width || !r.height) return;
      w = r.width; h = r.height;
      dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      data = build(w, h, dpr, night());
      paint(performance.now());
    };
    let lastW = 0, lastH = 0;
    const ro = new ResizeObserver(() => {
      const r = size();
      // the phone's address bar sliding in and out is not worth a repaint of the whole city
      if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 90) return;
      lastW = r.width; lastH = r.height; rebuild();
    });
    ro.observe(canvas);
    const loop = (now) => { if (dead) return; raf = vis ? requestAnimationFrame(loop) : 0; if (now - last > 32) paint(now); };
    const io = new IntersectionObserver(([e]) => {
      vis = e.isIntersecting;
      if (vis) { paint(performance.now()); if (!RM && !raf) raf = requestAnimationFrame(loop); }
    });
    io.observe(canvas);
    subs.push(() => { ro.disconnect(); io.disconnect(); cancelAnimationFrame(raf); });
    if (progress) listen(window, "scroll", () => {
      if (!vis || queued) return;
      queued = true;
      requestAnimationFrame((t) => { queued = false; paint(t); });
    }, { passive: true });
    const s = { rebuild }; scenes.push(s); return s;
  }

  /* ───────── the city from the air ─────────
   * One painting serves the landing and the footer: built once per size and light, then zoomed,
   * clouded and twinkled each frame.
   */
  let cityMemo = null;
  const cityFor = (w, h, dpr, dark) => {
    const key = `${w}x${h}x${dpr}x${dark}`;
    if (!cityMemo || cityMemo.key !== key) cityMemo = { key, data: buildCity(w, h, dpr, dark) };
    return cityMemo.data;
  };
  function drawCity(c, w, h, city, t, zoom, drop) {
    const dark = night();
    c.save();
    const ox = city.cx, oy = h * 0.9;
    c.translate(ox, oy - h * drop); c.scale(zoom, zoom); c.translate(-ox, -oy);
    c.drawImage(city.img, 0, 0, w, h);
    // drifting cloud over the sky and the far city, never across the words
    const from = city.phone ? 0 : w * 0.42;
    for (const k of city.clouds) {
      const span = w - from + k.s * 6, x = from - k.s * 3 + (((k.at * span + t * k.v) % span) + span) % span;
      const fade = from > 0 ? clamp((x - k.s * 2.4 - from) / (w * 0.12)) : 1;
      if (fade <= 0) continue;
      if (!k.img) {
        // painted once into its own small canvas, then only moved
        const [cv, cc] = layer(k.s * 5.4, k.s * 2.4, Math.min(devicePixelRatio || 1, 1.5));
        cloudA(cc, k.s * 2.7, k.s * 1.2, k.s, dark, k.seed, k.warm);
        k.img = cv;
      }
      c.globalAlpha = fade * 0.9; c.drawImage(k.img, x - k.s * 2.7, k.y - k.s * 1.2, k.s * 5.4, k.s * 2.4); c.globalAlpha = 1;
    }
    // windows catching and losing the light, and the red lamps on the tallest roofs
    for (const [x, y, ww, wh, ph, sp] of city.twinkle) {
      const a = Math.pow(Math.max(0, Math.sin(t * sp + ph)), 10);
      if (a < 0.02) continue;
      c.fillStyle = dark ? `rgba(255,236,190,${a})` : `rgba(255,255,255,${a * 0.9})`; c.fillRect(x, y, ww, wh);
    }
    if (dark) for (const [x, y, ph] of city.beacons) {
      const a = Math.max(0, Math.sin(t * 1.6 + ph));
      if (a < 0.1) continue;
      glow(c, x, y, 7, "255,60,50", 0.45 * a); c.fillStyle = `rgba(255,110,90,${a})`; c.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
    }
    c.restore();
  }

  /* ───────── the opening: from the air down to the parapet ─────────
   * One pinned shot. The city leans in and drops towards the streets, then dissolves into the bay seen
   * from Marine Drive's wall, where he sits; the words hand over in the same breath.
   */
  const openSec = $("top"), cityCv = $("city"), bayCv = $("bay");
  const landCopy = $("landCopy"), aboutBits = [...document.querySelectorAll("#top [data-in]")];
  const openP = () => (RM ? 0.9 : progressOf(openSec));
  function stageOpening(p) {
    const fade = smooth(0.34, 0.58, p);
    cityCv.style.opacity = (1 - fade).toFixed(3);
    bayCv.style.opacity = fade.toFixed(3);
    bayCv.style.transform = `scale(${(1.1 - 0.1 * smooth(0.34, 0.8, p)).toFixed(4)})`;
    const ca = 1 - smooth(0.08, 0.3, p);
    landCopy.style.opacity = ca;
    landCopy.style.transform = `translateY(${(-(1 - ca) * 24).toFixed(1)}px)`;
    landCopy.style.visibility = ca < 0.01 ? "hidden" : "";
    aboutBits.forEach((el, i) => {
      const a = smooth(0.56 + i * 0.06, 0.68 + i * 0.06, p);
      el.style.opacity = a;
      el.style.transform = `translateY(${((1 - a) * 14).toFixed(1)}px)`;
    });
  }
  scene(cityCv, {
    progress: openP,
    build: cityFor,
    draw(c, w, h, city, t, p) {
      stageOpening(p);
      if (p > 0.6) return;
      const e = ease(smooth(0, 0.6, p));
      drawCity(c, w, h, city, t, 1 + 0.6 * e, 0.16 * e);
    },
  });

  /* ───────── the bay ─────────
   * From the parapet: the sea, the curve of Marine Drive sweeping right to Malabar Hill, and the towers
   * of the city across the water. Morning puts the sun low between the two crowned towers; night lights
   * every window and the Necklace, and lays their light on the water.
   */
  function bayLayout(w, h) {
    const n = w < 760;
    const U = n ? h / 1250 : Math.min(h / 900, w / 1300);
    const hz = h * (n ? 0.64 : 0.6);
    const twinX = n ? w * 0.58 : w * 0.7;
    const par = n ? h * 0.905 : h * 0.885;
    const p0 = n ? [w * 1.2, h * 0.87] : [w * 1.03, h * 0.845];
    const p1 = n ? [w * 0.7, hz + 1.5] : [w * 0.63, hz + 1.5];
    const cc = n ? [w * 0.96, hz + (p0[1] - hz) * 0.18] : [w * 0.86, hz + (p0[1] - hz) * 0.2];
    return { n, U, hz, twinX, par, p0, p1, cc, x0: n ? -w * 0.06 : w * 0.37, x1: w * 1.05,
      sun: [twinX, hz - (n ? 150 : 165) * U], moon: n ? [w * 0.84, h * 0.43] : [w * 0.87, h * 0.17], figX: n ? w * 0.27 : w * 0.31 };
  }
  const qb = (L, u) => { const v = 1 - u; return [v * v * L.p0[0] + 2 * v * u * L.cc[0] + u * u * L.p1[0], v * v * L.p0[1] + 2 * v * u * L.cc[1] + u * u * L.p1[1]]; };

  function tower(c, t, dark, L, r) {
    const { x, base, tw, th, depth, crown } = t, top = base - th, U = L.U;
    const body = dark ? mix([30, 44, 68], [12, 21, 35], depth) : mix([182, 194, 204], [108, 128, 148], depth);
    c.fillStyle = body;
    c.fillRect(x, top, tw, th + 2);
    // the face away from the light
    const sunSide = x + tw / 2 < L.sun[0] ? 1 : 0;
    c.fillStyle = dark ? "rgba(0,0,0,.28)" : "rgba(40,58,80,.16)";
    c.fillRect(sunSide ? x : x + tw * 0.68, top, tw * 0.32, th + 2);
    if (dark) {
      const fh = 4.6 * U, cw = 3.6 * U, cols = Math.max(2, Math.floor(tw / cw)), dens = 0.22 + depth * 0.22;
      for (let y = top + fh; y < base - fh * 0.5; y += fh)
        for (let k = 0; k < cols; k++) {
          if (r() > dens) continue;
          const warm = r();
          c.fillStyle = warm < 0.8 ? `rgba(255,${196 + Math.round(r() * 40)},${130 + Math.round(r() * 40)},${0.55 + r() * 0.4})` : `rgba(200,226,255,${0.4 + r() * 0.3})`;
          c.fillRect(x + (k + 0.25) * (tw / cols), y, Math.max(1, (tw / cols) * 0.5), Math.max(1, fh * 0.42));
        }
    } else {
      c.fillStyle = `rgba(255,255,255,${0.06 + depth * 0.06})`;
      for (let y = top + 5 * U; y < base; y += 5 * U) c.fillRect(x, y, tw, Math.max(0.6, 0.6 * U));
      c.fillStyle = linear(c, x, 0, x + tw, 0, [[0, "rgba(255,240,215,0)"], [sunSide ? 1 : 0, "rgba(255,236,205,.22)"]]);
      c.fillRect(x, top, tw, th);
    }
    // crowns
    const cx = x + tw / 2;
    c.fillStyle = body;
    if (crown === "step") { c.fillRect(x + tw * 0.15, top - 6 * U, tw * 0.7, 6 * U); c.fillRect(x + tw * 0.32, top - 11 * U, tw * 0.36, 5 * U); }
    else if (crown === "spire") { c.fillRect(x + tw * 0.2, top - 5 * U, tw * 0.6, 5 * U); c.fillRect(cx - 0.6 * U, top - 24 * U, 1.2 * U, 20 * U); }
    else if (crown === "slant") { c.beginPath(); c.moveTo(x, top); c.lineTo(x + tw, top - tw * 0.5); c.lineTo(x + tw, top + 1); c.fill(); }
    else if (crown === "dome") {
      // a ring, the dome, a lantern and a finial: the pair of crowned towers on the skyline
      c.fillRect(x + tw * 0.06, top - 4 * U, tw * 0.88, 4 * U);
      c.beginPath(); c.ellipse(cx, top - 4 * U, tw * 0.44, tw * 0.62, 0, Math.PI, TAU); c.fill();
      c.fillRect(cx - 1.4 * U, top - 4 * U - tw * 0.62 - 7 * U, 2.8 * U, 7 * U);
      c.fillRect(cx - 0.5 * U, top - 4 * U - tw * 0.62 - 18 * U, 1 * U, 12 * U);
      if (dark) {
        glow(c, cx, top - tw * 0.4, tw * 1.8, "190,236,216", 0.32);
        c.fillStyle = "rgba(214,244,228,.85)";
        c.beginPath(); c.ellipse(cx, top - 4 * U, tw * 0.4, tw * 0.56, 0, Math.PI, TAU); c.fill();
        c.fillStyle = "rgba(160,210,190,.55)";
        for (let k = 1; k < 4; k++) { c.fillRect(cx - tw * 0.4 + k * tw * 0.2 - 0.4 * U, top - 4 * U - tw * 0.5, 0.8 * U, tw * 0.5); }
        c.fillStyle = "rgba(255,230,190,.9)"; c.fillRect(x + tw * 0.06, top - 4 * U, tw * 0.88, 1.6 * U);
      } else {
        c.fillStyle = "rgba(255,238,210,.35)";
        c.beginPath(); c.ellipse(cx + (sunSide ? tw * 0.12 : -tw * 0.12), top - 4 * U - tw * 0.2, tw * 0.18, tw * 0.3, 0, 0, TAU); c.fill();
      }
    } else c.fillRect(x + tw * 0.25, top - 4 * U, tw * 0.5, 4 * U);
    // the rim the low sun catches
    if (!dark) {
      c.fillStyle = `rgba(255,226,176,${0.35 + depth * 0.4})`;
      c.fillRect(sunSide ? x + tw - 1.2 : x, top, 1.2, th);
    }
    // the air between here and there
    c.fillStyle = dark ? `rgba(24,36,62,${(1 - depth) * 0.38})` : `rgba(242,228,204,${(1 - depth) * 0.6})`;
    c.fillRect(x - 1, top - (crown === "dome" ? tw : 26 * U), tw + 2, th + (crown === "dome" ? tw : 26 * U) + 2);
  }

  function decoBlock(c, x, base, bw, bh, dark, haze, seed) {
    const r = rng(seed);
    const tones = dark ? [[[34, 44, 58], [22, 30, 41]], [[38, 46, 58], [25, 32, 42]], [[32, 42, 54], [21, 28, 38]]]
      : [[[241, 230, 207], [214, 196, 165]], [[236, 217, 196], [207, 181, 154]], [[240, 217, 184], [210, 180, 140]], [[230, 224, 210], [196, 187, 169]]];
    const [face, side] = tones[seed % tones.length];
    const corner = bw * 0.14;
    c.fillStyle = mix(face, face, 0);
    c.beginPath(); c.moveTo(x, base); c.lineTo(x, base - bh + corner); c.quadraticCurveTo(x, base - bh, x + corner, base - bh); c.lineTo(x + bw, base - bh); c.lineTo(x + bw, base); c.closePath(); c.fill();
    c.fillStyle = mix(side, side, 0); c.fillRect(x, base - bh + corner, corner * 0.8, bh - corner);
    const cw = bw * 0.3, ccx = x + bw * (0.45 + r() * 0.2);
    c.fillStyle = mix(face, face, 0); c.fillRect(ccx - cw / 2, base - bh - bh * 0.06, cw, bh * 0.06);
    const floors = Math.max(3, Math.round(bh / Math.max(5, bw * 0.2))), fh = bh / floors;
    for (let f = 0; f < floors; f++) {
      const fy = base - bh + f * fh, cols = Math.max(2, Math.round(bw / Math.max(6, fh * 1.4)));
      for (let k = 0; k < cols; k++) {
        const wx = x + corner + ((bw - corner * 1.4) / cols) * k + fh * 0.15, ww = (bw - corner * 1.4) / cols - fh * 0.3;
        const lit = dark && r() < 0.45;
        c.fillStyle = lit ? `rgba(255,${200 + Math.round(r() * 30)},140,${0.6 + r() * 0.35})` : dark ? "#0d141c" : "rgba(84,112,132,.42)";
        c.fillRect(wx, fy + fh * 0.28, Math.max(0.8, ww), Math.max(0.8, fh * 0.42));
      }
      if (f % 2 && fh > 3) { c.fillStyle = mix(side, side, 0); c.fillRect(x + corner, fy + fh * 0.84, bw * 0.5, Math.max(0.8, fh * 0.08)); }
    }
    c.fillStyle = dark ? `rgba(18,26,40,${haze * 0.5})` : `rgba(240,226,204,${haze * 0.7})`;
    c.fillRect(x - 1, base - bh * 1.08, bw + 2, bh * 1.08 + 1);
  }

  // Mohit on the parapet, from behind: white shirt, sleeves rolled, the quiff, the arms of his glasses
  function sitter(c, x, y, s, dark) {
    const shirt = dark ? "#68717b" : "#f1eee6", shade = dark ? "#4a525c" : "#d9d5cb", skin = dark ? "#4c362b" : "#9c6c4f", hair = dark ? "#0a0909" : "#17120f";
    c.fillStyle = shade;
    c.beginPath(); c.moveTo(x - s * 0.25, y); c.lineTo(x - s * 0.24, y - s * 0.34); c.quadraticCurveTo(x - s * 0.23, y - s * 0.52, x - s * 0.08, y - s * 0.55); c.lineTo(x + s * 0.08, y - s * 0.55); c.quadraticCurveTo(x + s * 0.23, y - s * 0.52, x + s * 0.24, y - s * 0.34); c.lineTo(x + s * 0.25, y); c.closePath(); c.fill();
    c.fillStyle = shirt;
    c.beginPath(); c.moveTo(x - s * 0.22, y); c.lineTo(x - s * 0.21, y - s * 0.34); c.quadraticCurveTo(x - s * 0.2, y - s * 0.5, x - s * 0.07, y - s * 0.53); c.lineTo(x + s * 0.04, y - s * 0.53); c.quadraticCurveTo(x + s * 0.12, y - s * 0.48, x + s * 0.1, y - s * 0.3); c.lineTo(x + s * 0.12, y); c.closePath(); c.fill();
    // the light catching his shoulders
    c.fillStyle = dark ? "rgba(255,200,140,.4)" : "rgba(255,236,200,.8)";
    c.beginPath(); c.ellipse(x - s * 0.12, y - s * 0.5, s * 0.1, s * 0.025, -0.2, 0, TAU); c.fill();
    // arms down to the hands on the stone
    c.lineCap = "round";
    for (const sd of [-1, 1]) {
      c.strokeStyle = sd < 0 ? shirt : shade; c.lineWidth = s * 0.1;
      c.beginPath(); c.moveTo(x + sd * s * 0.2, y - s * 0.44); c.lineTo(x + sd * s * 0.27, y - s * 0.22); c.stroke();
      c.strokeStyle = skin; c.lineWidth = s * 0.075;
      c.beginPath(); c.moveTo(x + sd * s * 0.27, y - s * 0.2); c.lineTo(x + sd * s * 0.3, y - s * 0.02); c.stroke();
    }
    c.fillStyle = skin; c.fillRect(x - s * 0.045, y - s * 0.62, s * 0.09, s * 0.09);
    c.beginPath(); c.arc(x, y - s * 0.7, s * 0.115, 0, TAU); c.fill();
    c.beginPath(); c.ellipse(x - s * 0.115, y - s * 0.69, s * 0.025, s * 0.035, 0, 0, TAU); c.ellipse(x + s * 0.115, y - s * 0.69, s * 0.025, s * 0.035, 0, 0, TAU); c.fill();
    c.fillStyle = hair;
    c.beginPath(); c.ellipse(x, y - s * 0.75, s * 0.12, s * 0.1, 0, Math.PI * 0.92, Math.PI * 2.08); c.fill();
    c.beginPath(); c.ellipse(x + s * 0.01, y - s * 0.8, s * 0.11, s * 0.075, -0.15, 0, TAU); c.fill();
    c.strokeStyle = dark ? "#222" : "#2a2a2a"; c.lineWidth = Math.max(1, s * 0.012);
    c.beginPath(); c.moveTo(x - s * 0.135, y - s * 0.71); c.lineTo(x - s * 0.1, y - s * 0.705); c.moveTo(x + s * 0.135, y - s * 0.71); c.lineTo(x + s * 0.1, y - s * 0.705); c.stroke();
  }

  const asideEl = $("aside");
  scene(bayCv, {
    progress: openP,
    build(w, h, dpr, dark) {
      const L = bayLayout(w, h), U = L.U, r = rng(21);
      // sky
      const [S, s] = layer(w, h, dpr);
      s.fillStyle = linear(s, 0, 0, 0, L.hz, dark
        ? [[0, "#040b17"], [0.42, "#0b1a31"], [0.7, "#1c2a4d"], [0.86, "#4e3152"], [0.95, "#a3534b"], [1, "#d27a4f"]]
        : [[0, "#86aecb"], [0.4, "#b7cfdc"], [0.72, "#e7dac2"], [1, "#f6d7a2"]]);
      s.fillRect(0, 0, w, L.hz + 2);
      if (dark) {
        // the last of the dusk, over the open sea to the west
        glow(s, L.n ? w * 0.1 : w * 0.18, L.hz, w * 0.55, "226,120,80", 0.28);
        glow(s, L.moon[0], L.moon[1], 110 * U + 40, "190,210,230", 0.22);
        s.fillStyle = "#f3efe2"; s.beginPath(); s.arc(L.moon[0], L.moon[1], 13 * U + 4, 0, TAU); s.fill();
        s.fillStyle = "rgba(160,160,150,.2)"; s.beginPath(); s.arc(L.moon[0] - 4, L.moon[1] - 3, 3.5, 0, TAU); s.arc(L.moon[0] + 4, L.moon[1] + 4, 2.4, 0, TAU); s.fill();
      } else {
        glow(s, L.sun[0], L.sun[1], 520 * U, "255,222,168", 0.5);
        glow(s, L.sun[0], L.sun[1], 170 * U, "255,238,205", 0.75);
        s.fillStyle = "#fff4dc"; s.beginPath(); s.arc(L.sun[0], L.sun[1], 24 * U, 0, TAU); s.fill();
      }
      // the city across the water, far to near
      const [T, t] = layer(w, h, dpr);
      const span = L.x1 - L.x0;
      const hill = { cx: L.x1 - span * (L.n ? 0.08 : 0.1), hw: span * (L.n ? 0.34 : 0.24), ht: 54 * U };
      const hillY = (x) => { const d = (x - hill.cx) / hill.hw; return Math.abs(d) < 1 ? L.hz - hill.ht * Math.cos(d * Math.PI / 2) ** 1.4 : L.hz; };
      const towers = [];
      for (let x = L.x0; x < L.x1;) { const tw = (8 + r() * 13) * U; towers.push({ x, tw, th: (12 + r() * 46) * U, depth: 0, crown: r() < 0.3 ? "step" : "flat" }); x += tw + r() * 4 * U; }
      const far = towers.length;
      for (let x = L.x0 + 6 * U; x < L.x1;) { const tw = (13 + r() * 15) * U; if (r() < 0.82) towers.push({ x, tw, th: (40 + r() * 120) * U, depth: 0.5, crown: ["flat", "step", "spire", "slant"][Math.floor(r() * 4)] }); x += tw + (6 + r() * 18) * U; }
      const mid = towers.length;
      for (let x = L.x0 + 20 * U; x < L.x1;) { const tw = (17 + r() * 12) * U; if (Math.abs(x + tw / 2 - L.twinX) > 52 * U) towers.push({ x, tw, th: (120 + r() * 130) * U, depth: 0.82, crown: ["flat", "step", "spire"][Math.floor(r() * 3)] }); x += tw + (44 + r() * 70) * U; }
      towers.push({ x: L.twinX - 34 * U, tw: 25 * U, th: 318 * U, depth: 1, crown: "dome" }, { x: L.twinX + 10 * U, tw: 25 * U, th: 334 * U, depth: 1, crown: "dome" });
      for (const tw of towers) tw.base = hillY(tw.x + tw.tw / 2) + 2;
      const lights = [];
      towers.forEach((tw, i) => {
        if (i === far) {
          // the hill, and mist lying between the far blocks and the nearer towers
          t.fillStyle = dark ? "#111b2b" : "#a6b5bf";
          t.beginPath(); t.moveTo(hill.cx - hill.hw, L.hz + 2);
          for (let x = hill.cx - hill.hw; x <= hill.cx + hill.hw; x += 4) t.lineTo(x, hillY(x) - Math.sin(x * 0.21) * 1.6 * U - Math.sin(x * 0.07) * 2 * U);
          t.lineTo(hill.cx + hill.hw, L.hz + 2); t.fill();
          t.fillStyle = linear(t, 0, L.hz - 70 * U, 0, L.hz, dark ? [[0, "rgba(255,150,100,0)"], [1, "rgba(255,150,100,.1)"]] : [[0, "rgba(250,236,212,0)"], [1, "rgba(250,236,212,.75)"]]);
          t.fillRect(0, L.hz - 70 * U, w, 72 * U);
        }
        if (i === mid && !dark) { t.fillStyle = linear(t, 0, L.hz - 40 * U, 0, L.hz, [[0, "rgba(250,236,212,0)"], [1, "rgba(250,236,212,.5)"]]); t.fillRect(0, L.hz - 40 * U, w, 42 * U); }
        tower(t, tw, dark, L, r);
        if (tw.depth > 0.8) lights.push([tw.x + tw.tw / 2, tw.base - tw.th - (tw.crown === "dome" ? tw.tw + 22 * U : tw.crown === "spire" ? 24 * U : 6 * U)]);
      });
      const refl = towers.filter((tw) => tw.depth >= 0.5 && tw.x > -20 && tw.x < w).map((tw) => ({ x: tw.x + tw.tw * 0.15, w: tw.tw * 0.7, a: 0.25 + tw.depth * 0.45, s: r() * 9 }));
      // Marine Drive sweeping round to the hill: the land, the Deco blocks, the sea wall and its lamps
      const [F, f] = layer(w, h, dpr);
      f.fillStyle = linear(f, 0, L.hz, 0, h, dark ? [[0, "#16202d"], [1, "#0d141d"]] : [[0, "#cfc5b0"], [1, "#c2b79f"]]);
      f.beginPath(); f.moveTo(L.p1[0], L.p1[1]); f.lineTo(w * 1.3, L.hz + 1); f.lineTo(w * 1.3, h); f.lineTo(L.p0[0], h); f.lineTo(L.p0[0], L.p0[1]); f.quadraticCurveTo(L.cc[0], L.cc[1], L.p1[0], L.p1[1]); f.fill();
      for (let k = 15; k >= 0; k--) {
        const u = 0.04 + (k / 15) ** 0.85 * 0.94, [bx, by] = qb(L, u), sc = lerp(1, 0.05, u ** 0.62);
        const bw = (L.n ? 120 : 150) * U * sc * (0.8 + r() * 0.4) + 3, bh = (L.n ? 100 : 120) * U * sc * (0.7 + r() * 0.6) + 3;
        decoBlock(f, bx + 22 * U * sc + 4, by - 10 * U * sc, bw, bh, dark, u * 0.9, 3 + k);
      }
      f.lineCap = "round";
      for (let k = 0; k < 40; k++) {
        const a = qb(L, k / 40), b = qb(L, (k + 1) / 40);
        f.strokeStyle = dark ? "#2d343d" : "#efe7d6"; f.lineWidth = lerp(7, 0.8, k / 40) * (L.n ? 0.8 : 1);
        f.beginPath(); f.moveTo(a[0], a[1]); f.lineTo(b[0], b[1]); f.stroke();
      }
      const lamps = [];
      for (let k = 0; k < 26; k++) {
        const u = 0.03 + (k / 25) ** 0.72 * 0.93, [lx, ly] = qb(L, u), sc = lerp(1, 0.06, u ** 0.6), ht = 52 * U * sc + 2;
        f.strokeStyle = dark ? "#0b1016" : "#4e5a61"; f.lineWidth = Math.max(0.6, 2 * sc);
        f.beginPath(); f.moveTo(lx + 3 * sc, ly - 1); f.lineTo(lx + 3 * sc, ly - ht); f.lineTo(lx - 5 * sc, ly - ht * 1.03); f.stroke();
        if (dark) { glow(f, lx - 5 * sc, ly - ht, 22 * sc + 6, "242,161,69", 0.55); f.fillStyle = "#ffd59a"; f.beginPath(); f.arc(lx - 5 * sc, ly - ht, Math.max(0.9, 2.4 * sc), 0, TAU); f.fill(); }
        lamps.push({ x: lx - 5 * sc, y: ly, sc, s: r() * 9 });
      }
      // the parapet we sit on, and Mohit on it
      f.fillStyle = linear(f, 0, L.par, 0, L.par + h * 0.02, dark ? [[0, "#4a525b"], [1, "#383f47"]] : [[0, "#e2dccf"], [1, "#cbc4b6"]]);
      f.fillRect(0, L.par, w, h * 0.02);
      f.fillStyle = dark ? "#1b2027" : "#aaa395"; f.fillRect(0, L.par + h * 0.02, w, h);
      f.fillStyle = dark ? "rgba(0,0,0,.3)" : "rgba(70,60,45,.12)";
      for (let x = (w % 210) / 2; x < w; x += 210) f.fillRect(x, L.par + h * 0.02, 1, h);
      if (dark) glow(f, L.figX + w * 0.12, L.par - 10, 200 * U, "242,161,69", 0.12);
      const sz = (L.n ? 74 : 92) * U * (L.n ? 1.25 : 1);
      sitter(f, L.figX, L.par + 2, sz, dark);
      // his aside sits on the wall beside him, like a caption to the figure
      const ax = L.figX + sz * 0.45;
      asideEl.style.left = `${Math.round(ax)}px`;
      // on a phone the wall is too short for it, so it sits in the air just above him
      asideEl.style.top = `${Math.round(L.n ? L.par - sz * 0.95 - 70 : L.par + h * 0.02 + 14)}px`;
      asideEl.style.maxWidth = `${Math.round(Math.min(w - ax - (L.n ? 18 : 40), 440))}px`;
      // clouds and gulls
      const lit = dark ? "196,170,190" : "255,255,255", shade = dark ? "20,32,52" : "150,176,206";
      const from = L.n ? 0 : w * 0.42;
      const clouds = (L.n
        ? [[0.1, 0.47, 34, 4], [0.5, 0.5, 26, 6], [0.8, 0.44, 40, 3]]
        : [[0.05, 0.13, 62, 5], [0.38, 0.27, 46, 7], [0.62, 0.09, 78, 4], [0.86, 0.36, 40, 8], [0.25, 0.44, 30, 6]]
      ).map(([at, y, sz, v], i) => ({ at, y: y * h, v: v * U + 2, img: cloudSprite(sz * U + 8, dpr, 40 + i, lit, shade, dark ? 0.28 : 0.85, dark ? 0.4 : 0.3), sz: sz * U + 8 }));
      const gulls = Array.from({ length: 5 }, (_, i) => ({ x: r() * w, y: L.hz - (60 + r() * 150) * U, v: 10 + r() * 14, s: (5 + r() * 3) * U, p: r() * 6 }));
      const stars = Array.from({ length: L.n ? 60 : 130 }, () => ({ x: r() * w, y: Math.pow(r(), 1.5) * L.hz * 0.7, z: 0.4 + r(), p: r() * 6 }));
      return { L, S, T, F, from, clouds, gulls, stars, lights, refl, lamps };
    },
    draw(c, w, h, d, t, p) {
      if (p < 0.3) return;
      const L = d.L, U = L.U, dark = night();
      c.drawImage(d.S, 0, 0, w, h);
      if (dark) for (const st of d.stars) { c.fillStyle = `rgba(236,240,250,${(0.35 + 0.6 * Math.abs(Math.sin(t * 0.7 * st.z + st.p))) * (1 - st.y / L.hz)})`; c.fillRect(st.x, st.y, st.z, st.z); }
      for (const k of d.clouds) {
        const cw = k.img.width / Math.min(devicePixelRatio || 1, 1.5), ch = k.img.height / Math.min(devicePixelRatio || 1, 1.5);
        const spanX = w - d.from + cw;
        const x = d.from - cw * 0.5 + ((((k.at * spanX + t * k.v) % spanX) + spanX) % spanX);
        const fade = d.from > 0 ? clamp((x - cw * 0.3 - d.from) / (w * 0.1)) : 1;
        if (fade <= 0) continue;
        c.globalAlpha = fade; c.drawImage(k.img, x - cw / 2, k.y - ch / 2, cw, ch); c.globalAlpha = 1;
      }
      c.drawImage(d.T, 0, 0, w, h);
      if (dark) for (const [x, y] of d.lights) { const on = 0.5 + 0.5 * Math.sin(t * 2.2 + x); glow(c, x, y, 7 * U + 2, "255,70,60", 0.55 * on); }
      // the sea
      c.fillStyle = linear(c, 0, L.hz, 0, L.par, dark ? [[0, "#3a2a40"], [0.08, "#182740"], [0.5, "#0d1b2e"], [1, "#07101c"]] : [[0, "#efe1c4"], [0.12, "#bfd2d2"], [0.55, "#6fa3b8"], [1, "#2c6d8c"]]);
      c.fillRect(0, L.hz, w, L.par - L.hz + 4);
      const r = rng(77), dep = L.par - L.hz;
      for (let i = 0; i < (L.n ? 70 : 120); i++) {
        const v = Math.pow(r(), 1.5), y = L.hz + 2 + v * dep, len = (4 + r() * 16) * (0.3 + v);
        const x = ((((r() * w + t * (5 + r() * 9)) % (w + 40)) + w + 40) % (w + 40)) - 20;
        const a = Math.max(0, Math.sin(t * (0.8 + r()) + r() * 6)) * (dark ? 0.3 : 0.55);
        c.fillStyle = dark ? `rgba(200,214,230,${a})` : `rgba(255,255,255,${a})`;
        c.fillRect(x, y, len, Math.max(1, v * 2));
      }
      if (!dark) {
        // the sun's road
        glow(c, L.sun[0], L.hz + 8, 180 * U, "255,226,170", 0.4);
        const g = rng(5);
        for (let i = 0; i < 80; i++) {
          const v = g(), y = L.hz + 2 + Math.pow(v, 1.3) * dep, spread = (5 + v * 110) * U;
          const a = Math.max(0, Math.sin(t * (1 + g()) + g() * 6)) * 0.85;
          c.fillStyle = `rgba(255,226,166,${a})`;
          c.fillRect(L.sun[0] + (g() - 0.5) * spread * 2, y, (6 + v * 34) * U, 1 + v * 2.2);
        }
      } else {
        glow(c, L.n ? w * 0.1 : w * 0.18, L.hz + 4, w * 0.4, "210,110,80", 0.14);
        // the city and the Necklace laid on the water
        for (const f of d.refl) for (let k = 0; k < 7; k++) {
          const y = L.hz + 2 + k * (3 + k * 1.6) * U, a = f.a * (1 - k / 7) * (0.55 + 0.45 * Math.sin(t * 1.6 + f.s + k));
          c.fillStyle = `rgba(255,206,140,${a * 0.5})`;
          c.fillRect(f.x + Math.sin(t * 1.3 + k + f.s) * 1.5 * U, y, f.w * (1 - k * 0.08), Math.max(1, 1.4 * U));
        }
        for (const l of d.lamps) for (let k = 0; k < 9; k++) {
          const len = (9 + 46 * l.sc) * U, y = l.y + 3 + (k / 9) * len, a = (1 - k / 9) * (0.45 + 0.55 * Math.sin(t * 2 + l.s + k * 0.9));
          if (a <= 0) continue;
          c.fillStyle = `rgba(242,170,90,${a * 0.75})`;
          c.fillRect(l.x - (1.5 + 3 * l.sc) + Math.sin(t * 1.4 + k + l.s) * 1.2 * l.sc, y, 3 + 6 * l.sc, Math.max(1, 1.6 * l.sc + 0.5));
        }
        const g = rng(6);
        for (let i = 0; i < 50; i++) {
          const v = g(), y = L.hz + 4 + v * dep * 0.9, a = Math.max(0, Math.sin(t * (1 + g()) + g() * 6)) * 0.45;
          c.fillStyle = `rgba(220,230,240,${a})`;
          c.fillRect(L.moon[0] + (g() - 0.5) * (6 + v * 60) * 2, y, 6 + v * 24, 1 + v);
        }
      }
      c.drawImage(d.F, 0, 0, w, h);
      if (!dark) {
        c.strokeStyle = "rgba(52,66,80,.65)"; c.lineWidth = 1.2; c.lineCap = "round";
        for (const g of d.gulls) {
          const x = ((g.x + t * g.v) % (w * 1.2)) - w * 0.1, y = g.y + Math.sin(t * 0.6 + g.p) * g.s, fl = Math.sin(t * 5 + g.p) * 0.35;
          if (!L.n && x < w * 0.4 && y < h * 0.5) continue;
          c.beginPath(); c.moveTo(x - g.s, y - g.s * (0.2 + fl)); c.quadraticCurveTo(x - g.s * 0.4, y - g.s * 0.5, x, y); c.quadraticCurveTo(x + g.s * 0.4, y - g.s * 0.5, x + g.s, y - g.s * (0.2 + fl)); c.stroke();
        }
      }
    },
  });


  /* ───────── the line ─────────
   * A Western line strip map seen from above, running south toward Churchgate. A twelve-car rake would
   * fill the page, so three cars stand for it. It dwells at each station while the role is read, then
   * pulls out; the scenery thickens from creek and tin roofs to water tanks to Deco blocks and rain trees.
   */
  const roleEls = [...document.querySelectorAll("#journey .role")];
  const NAMES = roleEls.map((e) => e.querySelector(".co").textContent);
  const pathSec = $("experience");
  let activeRole = -2;

  function lineLayout(w, h) {
    const n = innerWidth < 760, k = n ? h / 560 : h / 900;
    const G = n ? h * 1.25 : h * 0.98;
    const Y = NAMES.map((_, i) => G * (i + 1));
    return { n, k, G, Y, end: Y[Y.length - 1] + G * 0.85, start: G * 0.3, tx: n ? w * 0.5 : w * 0.26, carL: 116 * k, carW: 24 * k, gauge: 14 * k, platL: 116 * k * 3.4 };
  }
  function trainAt(L, p) {
    const N = L.Y.length, s = clamp(p) * N, i = Math.min(N - 1, Math.floor(s)), u = s - i;
    const from = i === 0 ? L.start : L.Y[i - 1];
    return { y: lerp(from, L.Y[i], smooth(0, 0.62, u)), at: u > 0.5 ? i : i - 1 };
  }
  const TONES = {
    day: { ground: [[205, 212, 180], [214, 208, 194], [222, 212, 192]], tin: ["#a2a9ad", "#b8a78f", "#5f90b6", "#c9c1b2", "#9a8f80"], roof: "#cdc9c2", tank: "#26292c", deco: ["#f0e3ca", "#ead4c0", "#e3ddcd", "#efd9b6"], tree: ["#6f8f5a", "#9cb67a"], road: "#8f8b85", bed: "#b5ac9e", rail: "#6d6862", sleeper: "#8a7e6f", plat: "#ddd7ca", canopy: "#83988a", water: "#86b4c2", shadow: "rgba(70,58,40,.2)" },
    night: { ground: [[19, 29, 35], [21, 27, 36], [24, 29, 38]], tin: ["#24303a", "#2b2c33", "#1d3046", "#2a3038", "#262a2f"], roof: "#252c35", tank: "#0b0e11", deco: ["#2c3440", "#2a313c", "#2f3540", "#2c323a"], tree: ["#0f1c1a", "#1b2e29"], road: "#1c2128", bed: "#262b31", rail: "#59606a", sleeper: "#30343a", plat: "#3a414a", canopy: "#26332f", water: "#10233a", shadow: "rgba(0,0,0,0)" },
  };
  function lineTile(L, w, j, dpr, dark) {
    const P = TONES[dark ? "night" : "day"], k = L.k, G = L.G, y0 = j * G;
    const [cv, c] = layer(w, G, dpr);
    c.translate(0, -y0);
    const r = rng(300 + j), z = clamp((y0 + G / 2) / L.end);
    const zoneAt = (y) => { const v = clamp(y / L.end) * 3 + (r() - 0.5) * 0.7; return v < 1 ? 0 : v < 2 ? 1 : 2; };
    const groundAt = (y) => { const v = clamp(y / L.end) * 2, a = Math.min(1, Math.floor(v)); return mix(P.ground[a], P.ground[a + 1], v - a); };
    c.fillStyle = linear(c, 0, y0, 0, y0 + G, [[0, groundAt(y0)], [1, groundAt(y0 + G)]]);
    c.fillRect(0, y0, w, G);
    const zi = z < 0.34 ? 0 : z < 0.68 ? 1 : 2;
    const roadX = L.tx - (L.n ? 112 : 150) * k, roadW = 26 * k;
    const keepOut = (x, y, bw, bh) => {
      if (x + bw > L.tx - 64 * k && x < L.tx + 66 * k) return true;
      if (x + bw > roadX - 4 && x < roadX + roadW + 4) return true;
      for (const sy of L.Y) if (y + bh > sy - L.platL - 30 * k && y < sy + 40 * k && x + bw > L.tx + 60 * k && x < L.tx + (L.n ? 190 : 240) * k) return true;
      return false;
    };
    // a creek with mangroves at the northern end
    if (j === 0) {
      const cy = y0 + G * 0.55;
      c.fillStyle = P.water;
      c.beginPath(); c.moveTo(-10, cy - 26 * k);
      for (let x = 0; x <= w + 10; x += 10) c.lineTo(x, cy - 26 * k + Math.sin(x * 0.012) * 18 * k);
      for (let x = w + 10; x >= -10; x -= 10) c.lineTo(x, cy + 30 * k + Math.sin(x * 0.012 + 0.6) * 14 * k);
      c.fill();
      for (let i = 0; i < 70; i++) {
        const x = r() * w, side = r() < 0.5 ? -1 : 1, y = cy + side * (32 + r() * 18) * k + Math.sin(x * 0.012) * 16 * k;
        if (Math.abs(x - L.tx) < 70 * k || Math.abs(x - roadX - roadW / 2) < 30 * k) continue;
        c.fillStyle = P.tree[0]; c.beginPath(); c.arc(x, y, (5 + r() * 7) * k, 0, TAU); c.fill();
      }
    }
    // houses: tin roofs in the north, concrete roofs with their black water tanks, then Deco blocks
    const cell = 44 * k;
    for (let gy = y0 - cell; gy < y0 + G; gy += cell * (0.8 + r() * 0.4)) for (let gx = -cell * 0.5; gx < w; gx += cell * (0.7 + r() * 0.6)) {
      if (j === 0 && Math.abs(gy - (y0 + G * 0.55)) < 70 * k) continue;
      const zi = zoneAt(gy);
      if (r() < [0.18, 0.3, 0.36][zi]) continue;
      const sz = [0.6, 1.15, 1.45][zi] * cell;
      const bw = sz * (0.55 + r() * 0.45), bh = sz * (0.55 + r() * 0.45), x = gx + (r() - 0.5) * cell * 0.4, y = gy + (r() - 0.5) * cell * 0.4;
      if (keepOut(x, y, bw, bh)) continue;
      if (!dark) { c.fillStyle = P.shadow; c.fillRect(x + 3 * k, y + 4 * k, bw, bh); }
      if (zi === 0) {
        c.fillStyle = P.tin[Math.floor(r() * P.tin.length)]; c.fillRect(x, y, bw, bh);
        c.fillStyle = dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.22)"; c.fillRect(x, y, bw, bh * 0.48);
      } else if (zi === 1) {
        c.fillStyle = P.roof; c.fillRect(x, y, bw, bh);
        c.strokeStyle = dark ? "rgba(0,0,0,.35)" : "rgba(90,84,76,.25)"; c.lineWidth = 1.4 * k; c.strokeRect(x + 2 * k, y + 2 * k, bw - 4 * k, bh - 4 * k);
        for (let q = 0, m = r() < 0.6 ? 1 : 2; q < m; q++) { const tx = x + (0.2 + r() * 0.6) * bw, ty = y + (0.2 + r() * 0.6) * bh; c.fillStyle = P.tank; c.beginPath(); c.arc(tx, ty, 3.2 * k, 0, TAU); c.fill(); c.fillStyle = dark ? "rgba(255,255,255,.06)" : "rgba(255,255,255,.35)"; c.beginPath(); c.arc(tx - 1.2 * k, ty - 1.2 * k, 1.4 * k, 0, TAU); c.fill(); }
      } else {
        c.fillStyle = P.deco[Math.floor(r() * P.deco.length)];
        c.beginPath(); c.roundRect(x, y, bw, bh, [bw * 0.3, 2, 2, 2]); c.fill();
        c.fillStyle = dark ? "rgba(0,0,0,.25)" : "rgba(150,120,90,.18)"; c.fillRect(x + bw * 0.62, y + bh * 0.1, bw * 0.3, bh * 0.8);
      }
      if (dark && r() < 0.28) glow(c, x + bw * r(), y + bh * r(), 12 * k, "255,200,130", 0.4);
    }
    // trees in the gaps
    for (let i = 0; i < 46; i++) {
      const x = r() * w, y = y0 + r() * G, R = (7 + r() * 10 + zoneAt(y) * 5) * k;
      if (keepOut(x - R, y - R, R * 2, R * 2)) continue;
      for (let q = 0; q < 4; q++) { const ox = (r() - 0.5) * R, oy = (r() - 0.5) * R; c.fillStyle = P.tree[0]; c.beginPath(); c.arc(x + ox, y + oy, R * 0.7, 0, TAU); c.fill(); }
      c.fillStyle = P.tree[1]; c.beginPath(); c.arc(x - R * 0.25, y - R * 0.25, R * 0.42, 0, TAU); c.fill();
    }
    // the road beside the line
    c.fillStyle = P.road; c.fillRect(roadX, y0, roadW, G);
    c.fillStyle = dark ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.55)";
    for (let y = y0 - (y0 % (26 * k)); y < y0 + G; y += 26 * k) c.fillRect(roadX + roadW / 2 - 0.8 * k, y, 1.6 * k, 12 * k);
    if (dark) for (let y = y0 - (y0 % (90 * k)) + 20 * k; y < y0 + G; y += 90 * k) glow(c, roadX + roadW + 4 * k, y, 36 * k, "242,161,69", 0.35);
    // the ballast, the fast line and our line, the catenary portals
    c.fillStyle = P.bed; c.fillRect(L.tx - 54 * k, y0, 72 * k, G);
    for (const tx of [L.tx - 32 * k, L.tx]) {
      c.fillStyle = P.sleeper;
      for (let y = y0 - (y0 % (7 * k)); y < y0 + G; y += 7 * k) c.fillRect(tx - L.gauge / 2 - 4 * k, y, L.gauge + 8 * k, 2.4 * k);
      c.fillStyle = P.rail; c.fillRect(tx - L.gauge / 2 - 0.8 * k, y0, 1.6 * k, G); c.fillRect(tx + L.gauge / 2 - 0.8 * k, y0, 1.6 * k, G);
    }
    c.fillStyle = dark ? "rgba(140,150,160,.5)" : "rgba(60,64,70,.55)";
    for (let y = y0 - (y0 % (120 * k)) + 50 * k; y < y0 + G; y += 120 * k) { c.fillRect(L.tx - 62 * k, y, 84 * k, 1.2 * k); c.fillRect(L.tx - 64 * k, y - 2 * k, 4 * k, 4 * k); c.fillRect(L.tx + 18 * k, y - 2 * k, 4 * k, 4 * k); }
    // the stations: a platform under its canopy, a footbridge, and the yellow board
    L.Y.forEach((sy, i) => {
      const top = sy - L.platL, bot = sy + 22 * k;
      if (bot < y0 - 60 * k || top > y0 + G + 60 * k) return;
      const px = L.tx + L.gauge / 2 + 5 * k, pw = 46 * k;
      if (!dark) { c.fillStyle = P.shadow; c.fillRect(px + 3 * k, top + 4 * k, pw, bot - top); }
      c.fillStyle = P.plat; c.fillRect(px, top, pw, bot - top);
      c.fillStyle = "#e6c13f"; c.fillRect(px, top, 2.6 * k, bot - top);
      c.fillStyle = P.canopy; c.fillRect(px + 9 * k, top + 14 * k, pw - 14 * k, bot - top - 28 * k);
      c.fillStyle = dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.18)";
      for (let y = top + 18 * k; y < bot - 16 * k; y += 12 * k) c.fillRect(px + 9 * k, y, pw - 14 * k, 1.2 * k);
      if (dark) for (let y = top + 24 * k; y < bot - 20 * k; y += 34 * k) glow(c, px + pw / 2, y, 30 * k, "255,214,150", 0.35);
      c.fillStyle = dark ? "#2e353e" : "#a8a197"; c.fillRect(roadX, top + 30 * k, px + pw - roadX, 10 * k);
      const name = NAMES[i];
      c.font = `600 ${15 * k}px "Hanken Grotesk", system-ui, sans-serif`;
      const tw = c.measureText(name).width, bx = px + pw + 18 * k, by = top + (bot - top) * 0.42, bw = tw + 22 * k, bh = 30 * k;
      if (dark) glow(c, bx + bw / 2, by + bh / 2, bw * 0.9, "255,214,150", 0.3);
      if (!dark) { c.fillStyle = P.shadow; c.fillRect(bx + 3 * k, by + 4 * k, bw, bh); }
      c.fillStyle = "#151515"; c.fillRect(bx - 2 * k, by - 2 * k, bw + 4 * k, bh + 4 * k);
      c.fillStyle = "#f5c518"; c.fillRect(bx, by, bw, bh);
      c.fillStyle = "#151515"; c.textBaseline = "middle"; c.fillText(name, bx + 11 * k, by + bh / 2 + 1 * k);
    });
    // the edge of Wankhede, beside the line where it runs into Churchgate
    if (y0 + G > L.end - G * 0.9) {
      const sx = L.n ? L.tx - 150 * k : L.tx - 230 * k, sy = L.end - G * 0.1, rx = L.n ? 130 * k : 190 * k, ry = 150 * k;
      c.fillStyle = dark ? "#8c949b" : "#eef0ee"; c.beginPath(); c.ellipse(sx, sy, rx, ry, 0, 0, TAU); c.fill();
      c.fillStyle = dark ? "#1d4e9a" : "#2b62b8"; c.beginPath(); c.ellipse(sx, sy, rx * 0.86, ry * 0.86, 0, 0, TAU); c.fill();
      c.fillStyle = dark ? "#264d2c" : "#6ea457"; c.beginPath(); c.ellipse(sx, sy, rx * 0.66, ry * 0.66, 0, 0, TAU); c.fill();
      c.fillStyle = dark ? "#8a7a5a" : "#d1b98c"; c.fillRect(sx - 4 * k, sy - 22 * k, 8 * k, 44 * k);
      if (dark) for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) glow(c, sx + a * rx * 0.8, sy + b * ry * 0.8, 70 * k, "255,248,230", 0.45);
    }
    return cv;
  }
  function drawTrain(c, L, x, head, dark, t) {
    const k = L.k, cw = L.carW;
    if (dark) {
      const beam = c.createLinearGradient(0, head, 0, head + 190 * k);
      beam.addColorStop(0, "rgba(255,240,200,.38)"); beam.addColorStop(1, "rgba(255,240,200,0)");
      c.fillStyle = beam; c.beginPath(); c.moveTo(x - cw * 0.3, head); c.lineTo(x + cw * 0.3, head); c.lineTo(x + cw * 1.6, head + 190 * k); c.lineTo(x - cw * 1.6, head + 190 * k); c.fill();
      glow(c, x, head + 4 * k, 46 * k, "255,240,200", 0.6);
    }
    for (let i = 0; i < 3; i++) {
      const y1 = head - i * (L.carL + 4 * k), y0 = y1 - L.carL;
      if (dark) { glow(c, x - cw * 0.9, (y0 + y1) / 2, L.carL * 0.42, "255,206,140", 0.18); glow(c, x + cw * 0.9, (y0 + y1) / 2, L.carL * 0.42, "255,206,140", 0.18); }
      else { c.fillStyle = "rgba(60,50,40,.22)"; c.beginPath(); c.roundRect(x - cw / 2 + 4 * k, y0 + 5 * k, cw, L.carL, 4 * k); c.fill(); }
      c.fillStyle = linear(c, x - cw / 2, 0, x + cw / 2, 0, dark ? [[0, "#6c737b"], [0.5, "#9aa1a8"], [1, "#6c737b"]] : [[0, "#d9dcd8"], [0.5, "#f6f7f3"], [1, "#d6d9d5"]]);
      c.beginPath(); c.roundRect(x - cw / 2, y0, cw, L.carL, i === 0 ? [3 * k, 3 * k, 10 * k, 10 * k] : 3 * k); c.fill();
      // the blue band and its red line along both sides
      c.fillStyle = dark ? "#23477e" : "#2f5fa8"; c.fillRect(x - cw / 2, y0 + 4 * k, 2.2 * k, L.carL - 8 * k); c.fillRect(x + cw / 2 - 2.2 * k, y0 + 4 * k, 2.2 * k, L.carL - 8 * k);
      c.fillStyle = "#c8443a"; c.fillRect(x - cw / 2 + 2.2 * k, y0 + 4 * k, 0.8 * k, L.carL - 8 * k); c.fillRect(x + cw / 2 - 3 * k, y0 + 4 * k, 0.8 * k, L.carL - 8 * k);
      for (const f of [0.16, 0.6]) {
        const ay = y0 + L.carL * f;
        c.fillStyle = dark ? "#80878e" : "#cfd3d1"; c.beginPath(); c.roundRect(x - cw * 0.32, ay, cw * 0.64, L.carL * 0.22, 2 * k); c.fill();
        c.fillStyle = dark ? "rgba(0,0,0,.25)" : "rgba(80,90,96,.3)";
        for (let q = 1; q < 4; q++) c.fillRect(x - cw * 0.26, ay + (L.carL * 0.22 * q) / 4, cw * 0.52, 0.8 * k);
      }
      if (i === 1) { c.strokeStyle = dark ? "#aab0b6" : "#3a3f45"; c.lineWidth = 1 * k; const py = y0 + L.carL * 0.45; c.beginPath(); c.moveTo(x - cw * 0.3, py); c.lineTo(x, py - 6 * k); c.lineTo(x + cw * 0.3, py); c.lineTo(x, py + 6 * k); c.closePath(); c.stroke(); }
      if (i === 0) { c.fillStyle = "#22313f"; c.beginPath(); c.roundRect(x - cw * 0.38, y1 - 9 * k, cw * 0.76, 5 * k, 2 * k); c.fill(); }
      if (i < 2) { c.fillStyle = dark ? "#151a20" : "#3d4248"; c.fillRect(x - cw * 0.28, y0 - 4 * k, cw * 0.56, 4 * k); }
    }
  }
  const lineScene = scene($("line"), {
    progress: () => progressOf(pathSec),
    build(w, h, dpr, dark) {
      const L = lineLayout(w, h);
      const r = rng(8);
      const taxis = Array.from({ length: 9 }, (_, i) => ({ at: r(), v: (28 + r() * 30) * L.k, dir: i % 2 ? 1 : -1 }));
      return { L, dark, tiles: new Map(), dpr, taxis };
    },
    draw(c, w, h, d, t, p) {
      const L = d.L, k = L.k, dark = d.dark;
      const tr = trainAt(L, p), cam = tr.y - h * (L.n ? 0.66 : 0.62);
      c.fillStyle = dark ? "#0d1a2b" : "#efe8da"; c.fillRect(0, 0, w, h);
      const j0 = Math.floor(cam / L.G), j1 = Math.floor((cam + h) / L.G);
      for (let j = j0; j <= j1; j++) {
        if (!d.tiles.has(j)) d.tiles.set(j, lineTile(L, w, j, d.dpr, dark));
        c.drawImage(d.tiles.get(j), 0, j * L.G - cam, w, L.G);
      }
      for (const key of d.tiles.keys()) if (key < j0 - 1 || key > j1 + 1) d.tiles.delete(key);
      // taxis on the road
      const roadX = L.tx - (L.n ? 112 : 150) * k, roadW = 26 * k;
      for (const q of d.taxis) {
        const yy = ((((q.at * L.end + t * q.v * q.dir) % L.end) + L.end) % L.end) - cam;
        if (yy < -30 || yy > h + 30) continue;
        const x = roadX + (q.dir > 0 ? roadW * 0.28 : roadW * 0.72);
        if (dark) glow(c, x, yy + q.dir * 14 * k, 18 * k, "255,236,190", 0.5);
        else { c.fillStyle = "rgba(0,0,0,.2)"; c.fillRect(x - 4.5 * k + 2 * k, yy - 8 * k + 3 * k, 9 * k, 16 * k); }
        c.fillStyle = "#1c1c1c"; c.beginPath(); c.roundRect(x - 4.5 * k, yy - 8 * k, 9 * k, 16 * k, 2.5 * k); c.fill();
        c.fillStyle = "#f2c232"; c.fillRect(x - 3.5 * k, yy - 4 * k, 7 * k, 8 * k);
        if (dark) { c.fillStyle = "#ff5a4a"; c.fillRect(x - 3.5 * k, yy - q.dir * 8 * k - (q.dir > 0 ? 0 : 1.5 * k), 7 * k, 1.5 * k); }
      }
      drawTrain(c, L, L.tx, tr.y - cam, dark, t);
      // let the strip fade into the page
      const bg = dark ? "13,26,43" : "239,232,218";
      if (L.n) { c.fillStyle = linear(c, 0, 0, 0, h * 0.16, [[0, `rgba(${bg},1)`], [1, `rgba(${bg},0)`]]); c.fillRect(0, 0, w, h * 0.16); }
      else { c.fillStyle = linear(c, w * 0.4, 0, w * 0.6, 0, [[0, `rgba(${bg},0)`], [0.55, `rgba(${bg},.82)`], [1, `rgba(${bg},.94)`]]); c.fillRect(w * 0.4, 0, w * 0.6 + 1, h); }
      const at = clamp(tr.at, 0, NAMES.length - 1);
      if (at !== activeRole) { activeRole = at; roleEls.forEach((e, i) => e.toggleAttribute("data-on", i === at)); }
    },
  });

  /* ───────── the ground ─────────
   * Wankhede from high in the stand, as the floodlights come on: the field turns green under them, the
   * stands go Mumbai Indians blue, and one empty seat in the row in front catches the light.
   */
  const groundSec = $("ground"), seatLine = $("seat");
  function groundLayout(w, h) {
    const n = w < 760;
    return { n, U: n ? w / 560 : Math.min(w / 1440, h / 900), cx: n ? w * 0.5 : w * 0.6, cy: n ? h * 0.8 : h * 0.7, rx: n ? w * 0.95 : w * 0.56, ry: n ? h * 0.2 : h * 0.25,
      masts: n ? [0.1, 0.5, 0.9] : [0.47, 0.72, 0.96], mastTop: n ? h * 0.4 : h * 0.1, seat: n ? w * 0.6 : w * 0.66 };
  }
  scene($("wankhede"), {
    progress: () => progressOf(groundSec),
    build(w, h, dpr, dark) {
      const L = groundLayout(w, h), U = L.U, r = rng(44);
      const standRy = L.ry * 1.42, standRx = L.rx * 1.16, roofTop = L.cy - standRy * 1.1;
      // the sky and the city behind the far stand
      const [S, s] = layer(w, h, dpr);
      s.fillStyle = linear(s, 0, 0, 0, roofTop + 40 * U, dark ? [[0, "#050c19"], [0.7, "#122440"], [1, "#2a3456"]] : [[0, "#8fb5d0"], [0.65, "#cfdce0"], [1, "#efdcbc"]]);
      s.fillRect(0, 0, w, h);
      for (let x = -10; x < w;) { const bw = (24 + r() * 46) * U, bh = (20 + r() * 70) * U; s.fillStyle = dark ? "#0f1a2b" : "#b7c3c9"; s.fillRect(x, roofTop - bh + 10 * U, bw, bh + 40 * U);
        if (dark) for (let y = roofTop - bh + 16 * U; y < roofTop; y += 7 * U) for (let xx = x + 4 * U; xx < x + bw - 4 * U; xx += 6 * U) if (r() < 0.3) { s.fillStyle = "rgba(255,206,140,.7)"; s.fillRect(xx, y, 2 * U, 2.5 * U); }
        x += bw + r() * 10 * U; }
      // the outer wall of the stadium, under the roof line
      s.fillStyle = linear(s, 0, roofTop + 20 * U, 0, h, dark ? [[0, "#101a2a"], [1, "#0a111d"]] : [[0, "#8e989f"], [1, "#6f7a83"]]);
      s.fillRect(0, roofTop + 20 * U, w, h);
      // the stadium, drawn twice: in the dark before the lights and lit under them
      const paint = (lit) => {
        const [C, c] = layer(w, h, dpr);
        const k = lit ? 1 : 0;
        // masts behind the roof
        for (const mx of L.masts) {
          const x = mx * w, base = roofTop + 30 * U;
          c.fillStyle = dark ? "#1a222c" : "#5b656d";
          c.beginPath(); c.moveTo(x - 7 * U, base); c.lineTo(x - 2.5 * U, L.mastTop + 30 * U); c.lineTo(x + 2.5 * U, L.mastTop + 30 * U); c.lineTo(x + 7 * U, base); c.fill();
          c.fillStyle = dark ? "#202831" : "#4f585f"; c.fillRect(x - 26 * U, L.mastTop, 52 * U, 32 * U);
          for (let gy = 0; gy < 4; gy++) for (let gx = 0; gx < 7; gx++) {
            const bx = x - 22 * U + gx * 7 * U, by = L.mastTop + 4 * U + gy * 7 * U;
            c.fillStyle = lit ? "#fffaf0" : dark ? "#39424c" : "#7d868c"; c.fillRect(bx, by, 4.5 * U, 4.5 * U);
          }
          if (lit) {
            glow(c, x, L.mastTop + 16 * U, 150 * U, "255,246,224", 0.45); glow(c, x, L.mastTop + 16 * U, 46 * U, "255,255,250", 0.85);
            c.fillStyle = linear(c, 0, L.mastTop, 0, L.cy, [[0, "rgba(255,250,236,.16)"], [1, "rgba(255,250,236,0)"]]);
            c.beginPath(); c.moveTo(x - 20 * U, L.mastTop + 30 * U); c.lineTo(x + 20 * U, L.mastTop + 30 * U); c.lineTo(L.cx + (x - L.cx) * 0.3 + 140 * U, L.cy - L.ry * 0.3); c.lineTo(L.cx + (x - L.cx) * 0.3 - 140 * U, L.cy - L.ry * 0.3); c.fill();
          }
        }
        // the roof: a white canopy over the far stand
        c.fillStyle = lit ? (dark ? "#d7dde0" : "#f4f6f4") : dark ? "#4e5862" : "#cfd5d6";
        c.beginPath(); c.ellipse(L.cx, L.cy, standRx * 1.04, standRy * 1.1, 0, Math.PI, TAU); c.ellipse(L.cx, L.cy, standRx * 0.98, standRy * 0.99, 0, TAU, Math.PI, true); c.fill();
        c.strokeStyle = dark ? "rgba(0,0,0,.25)" : "rgba(80,90,96,.2)"; c.lineWidth = 1;
        for (let a = Math.PI * 1.04; a < TAU * 0.98; a += 0.05) { c.beginPath(); c.moveTo(L.cx + Math.cos(a) * standRx * 0.98, L.cy + Math.sin(a) * standRy * 0.99); c.lineTo(L.cx + Math.cos(a) * standRx * 1.04, L.cy + Math.sin(a) * standRy * 1.1); c.stroke(); }
        // the stands, tier on tier of blue, full
        const blue = lit ? [33, 92, 184] : dark ? [16, 32, 64] : [44, 82, 140];
        c.fillStyle = `rgb(${blue})`;
        c.beginPath(); c.ellipse(L.cx, L.cy, standRx, standRy, 0, 0, TAU); c.fill();
        const rr = rng(5);
        for (let tier = 0; tier < 26; tier++) {
          const f = 1 - tier / 26 * 0.3, ex = standRx * f, ey = standRy * (1 - tier / 26 * 0.36);
          c.strokeStyle = lit ? "rgba(20,50,110,.5)" : "rgba(0,0,0,.25)"; c.lineWidth = 1;
          c.beginPath(); c.ellipse(L.cx, L.cy, ex, ey, 0, Math.PI, TAU); c.stroke();
          for (let a = Math.PI; a < TAU; a += 0.012 + rr() * 0.01) {
            if (rr() < 0.25) continue;
            const col = rr();
            c.fillStyle = col < 0.55 ? `rgba(${lit ? "70,130,225" : "40,70,120"},.9)` : col < 0.72 ? `rgba(${lit ? "242,193,78" : "120,100,50"},.9)` : col < 0.88 ? `rgba(${lit ? "236,226,210" : "90,90,96"},.8)` : "rgba(20,30,50,.8)";
            c.fillRect(L.cx + Math.cos(a) * ex, L.cy + Math.sin(a) * ey - 1.5 * U, 1.6 * U + 0.4, 1.6 * U + 0.4);
          }
        }
        // the field: mown stripes, the rope, the square
        c.save(); c.beginPath(); c.ellipse(L.cx, L.cy, L.rx, L.ry, 0, 0, TAU); c.clip();
        const g1 = lit ? [86, 152, 72] : dark ? [22, 44, 30] : [70, 112, 62], g2 = lit ? [98, 166, 82] : dark ? [26, 50, 34] : [78, 122, 68];
        for (let i = -20; i < 20; i++) { c.fillStyle = mix(i % 2 ? g1 : g2, i % 2 ? g1 : g2, 0); c.fillRect(L.cx + i * L.rx * 0.11, L.cy - L.ry, L.rx * 0.11 + 1, L.ry * 2); }
        if (lit) glow(c, L.cx, L.cy - L.ry * 0.3, L.rx * 0.9, "255,250,230", 0.22);
        c.restore();
        c.strokeStyle = lit ? "rgba(255,255,255,.75)" : "rgba(220,220,220,.25)"; c.lineWidth = 1.4 * U;
        c.beginPath(); c.ellipse(L.cx, L.cy, L.rx * 0.95, L.ry * 0.94, 0, Math.PI * 1.02, TAU * 0.99); c.stroke();
        c.strokeStyle = lit ? "rgba(255,255,255,.3)" : "rgba(220,220,220,.1)"; c.lineWidth = 1;
        c.beginPath(); c.ellipse(L.cx, L.cy - L.ry * 0.12, L.rx * 0.45, L.ry * 0.42, 0, 0, TAU); c.stroke();
        const pw = 12 * U, ptop = L.cy - L.ry * 0.5, pbot = L.cy - L.ry * 0.05;
        c.fillStyle = lit ? "#d2bb8d" : dark ? "#3a3428" : "#a3926f";
        c.beginPath(); c.moveTo(L.cx - pw * 0.8, ptop); c.lineTo(L.cx + pw * 0.8, ptop); c.lineTo(L.cx + pw * 1.1, pbot); c.lineTo(L.cx - pw * 1.1, pbot); c.fill();
        c.fillStyle = lit ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.3)";
        c.fillRect(L.cx - pw * 1.3, ptop + 4 * U, pw * 2.6, 1.2); c.fillRect(L.cx - pw * 1.5, pbot - 6 * U, pw * 3, 1.4);
        for (const [fx, fy, col] of [[0, 0.38, 1], [0.02, 0.12, 0], [-0.3, 0.25, 1], [0.34, 0.2, 1], [-0.55, 0.05, 1], [0.6, 0.02, 1], [-0.18, -0.02, 1], [0.15, 0.55, 1], [-0.42, 0.45, 1], [0.48, 0.5, 1]]) {
          const px = L.cx + fx * L.rx * 0.9, py = L.cy - L.ry * 0.62 + fy * L.ry * 0.9, s2 = (6 + fy * 4) * U;
          c.fillStyle = "rgba(0,0,0,.22)"; c.beginPath(); c.ellipse(px, py + s2 * 0.05, s2 * 0.45, s2 * 0.14, 0, 0, TAU); c.fill();
          c.fillStyle = col ? (lit ? "#2d6fd0" : "#203a64") : lit ? "#eceae2" : "#666";
          c.beginPath(); c.roundRect(px - s2 * 0.24, py - s2 * 1.35, s2 * 0.48, s2 * 1.35, s2 * 0.2); c.fill();
          c.fillStyle = lit ? "#8a5c42" : "#3a2a22"; c.beginPath(); c.arc(px, py - s2 * 1.6, s2 * 0.24, 0, TAU); c.fill();
        }
        if (!lit) { c.fillStyle = dark ? "rgba(4,10,20,.5)" : "rgba(30,40,60,.22)"; c.fillRect(0, roofTop - 30 * U, w, h); }
        return C;
      };
      const dim = paint(false), bright = paint(true);
      // the row in front of us, and the empty seat
      const [N, nc] = layer(w, h, dpr);
      const rows = L.n ? [[h * 0.86, 44], [h * 0.95, 56]] : [[h * 0.875, 50], [h * 0.98, 62]];
      const seats = [];
      rows.forEach(([ry, sw], ri) => {
        const s2 = sw * U;
        nc.fillStyle = dark ? "#0a1220" : "#2e3b4a"; nc.fillRect(0, ry + s2 * 0.38, w, h);
        for (let x = ((ri * 0.5) % 1) * s2 - s2; x < w + s2; x += s2 * 1.06) {
          const empty = ri === 1 && Math.abs(x + s2 / 2 - L.seat) < s2 * 0.53;
          seats.push({ x, y: ry, s: s2, empty, taken: !empty && r() < 0.62, p: r() });
        }
      });
      const seatDraw = (lit, spot) => {
        const [C, c] = layer(w, h, dpr);
        c.drawImage(N, 0, 0, w, h);
        for (const st of seats) {
          const { x, y, s: s2 } = st;
          const blue = st.empty ? mix([30, 76, 160], [70, 134, 230], spot) : lit ? "#1f4f9e" : dark ? "#0f2347" : "#24477e";
          if (st.empty && spot > 0) {
            glow(c, x + s2 / 2, y, s2 * 1.6, "255,214,150", 0.55 * spot);
            c.fillStyle = linear(c, 0, y - s2 * 3, 0, y + s2 * 0.4, [[0, "rgba(255,226,170,0)"], [1, `rgba(255,226,170,${0.28 * spot})`]]);
            c.beginPath(); c.moveTo(x + s2 * 0.3, y - s2 * 3); c.lineTo(x + s2 * 0.7, y - s2 * 3); c.lineTo(x + s2 * 1.05, y + s2 * 0.4); c.lineTo(x - s2 * 0.05, y + s2 * 0.4); c.fill();
          }
          c.fillStyle = blue; c.beginPath(); c.roundRect(x + s2 * 0.08, y - s2 * 0.42, s2 * 0.84, s2 * 0.62, [s2 * 0.18, s2 * 0.18, s2 * 0.06, s2 * 0.06]); c.fill();
          c.fillStyle = lit || st.empty ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.07)"; c.fillRect(x + s2 * 0.16, y - s2 * 0.38, s2 * 0.68, s2 * 0.06);
          if (st.empty && spot > 0) { c.fillStyle = `rgba(255,236,200,${0.5 * spot})`; c.fillRect(x + s2 * 0.16, y - s2 * 0.38, s2 * 0.68, s2 * 0.08); }
          if (st.taken) {
            const jersey = st.p < 0.7 ? (lit ? "#2a63c4" : "#16305c") : lit ? "#e3b443" : "#4a3d1d";
            c.fillStyle = jersey; c.beginPath(); c.roundRect(x + s2 * 0.18, y - s2 * 0.7, s2 * 0.64, s2 * 0.5, s2 * 0.2); c.fill();
            c.fillStyle = dark && !lit ? "#0b0a0a" : "#17120f"; c.beginPath(); c.arc(x + s2 * 0.5, y - s2 * 0.82, s2 * 0.16, 0, TAU); c.fill();
          }
        }
        return C;
      };
      return { L, S, dim, bright, rowsDim: seatDraw(false, 0), rowsLit: seatDraw(true, 0), rowsSpot: seatDraw(true, 1) };
    },
    draw(c, w, h, d, t, p) {
      const on = RM ? 1 : smooth(0.12, 0.42, p), spot = RM ? 1 : smooth(0.42, 0.72, p);
      c.drawImage(d.S, 0, 0, w, h);
      c.drawImage(d.dim, 0, 0, w, h);
      if (on > 0) { c.globalAlpha = on; c.drawImage(d.bright, 0, 0, w, h); c.globalAlpha = 1; }
      c.drawImage(d.rowsDim, 0, 0, w, h);
      if (on > 0) { c.globalAlpha = on; c.drawImage(d.rowsLit, 0, 0, w, h); c.globalAlpha = 1; }
      if (spot > 0) { c.globalAlpha = spot; c.drawImage(d.rowsSpot, 0, 0, w, h); c.globalAlpha = 1; }
      seatLine.toggleAttribute("data-on", spot > 0.3 || RM);
    },
  });


  /* ───────── the auction ─────────
   * Over his shoulder in a hall, the live AuctionXI board on the projector screen. The board itself is
   * his real piece, laid onto the screen in the page; the canvas paints the room, the beam and him.
   * Scrolling leans in: the room comes closer and he slips past the edge of the frame.
   */
  const aucSec = $("work"), roomCam = $("roomCam"), frontCv = $("roomFront"), screenEl = $("screen");
  const workHead = $("workHead"), aucCopy = $("aucCopy");
  function roomLayout(w, h) {
    const n = w < 760;
    const sw = n ? w * 0.9 : Math.min(w * 0.5, h * 1.02), sh = sw * (2 / 3);
    const sx = n ? (w - sw) / 2 : w * 0.43, sy = n ? h * 0.2 : h * 0.47 - sh / 2;
    return { n, sw, sh, sx, sy, U: n ? w / 560 : Math.min(w / 1440, h / 900), proj: [n ? w * 0.7 : w * 0.66, -h * 0.12],
      me: n ? [w * 0.95, h * 1.1, h * 0.3] : [w * 0.985, h * 1.12, h * 0.64] };
  }
  const aucP = () => (RM ? 0.6 : progressOf(aucSec));
  scene($("room"), {
    progress: aucP,
    build(w, h, dpr, dark) {
      const L = roomLayout(w, h), U = L.U, r = rng(91);
      screenEl.style.left = `${L.sx}px`; screenEl.style.top = `${L.sy}px`;
      screenEl.style.width = `${L.sw}px`; screenEl.style.height = `${L.sh}px`;
      roomCam.style.transformOrigin = `${L.sx + L.sw / 2}px ${L.sy + L.sh / 2}px`;
      const [B, b] = layer(w, h, dpr);
      // the hall: a dark back wall, the floor stepping down towards the screen
      b.fillStyle = linear(b, 0, 0, 0, h, dark ? [[0, "#070b14"], [0.6, "#0d1424"], [1, "#05070d"]] : [[0, "#2b2019"], [0.6, "#3a2b20"], [1, "#160f0b"]]);
      b.fillRect(0, 0, w, h);
      // by day the house lights are dimmed, not off: a warm wash from the back of the hall
      if (!dark) glow(b, w * 0.1, h * 0.05, w * 0.7, "255,214,160", 0.14);
      // the screen's light on the wall around it
      glow(b, L.sx + L.sw / 2, L.sy + L.sh / 2, L.sw * 0.95, dark ? "234,179,8" : "234,179,8", dark ? 0.16 : 0.12);
      glow(b, L.sx + L.sw / 2, L.sy + L.sh / 2, L.sw * 0.7, "120,160,255", dark ? 0.12 : 0.06);
      // the frame of the screen, a hair proud of the wall
      b.fillStyle = dark ? "#020409" : "#0d0907";
      b.beginPath(); b.roundRect(L.sx - 10 * U, L.sy - 10 * U, L.sw + 20 * U, L.sh + 20 * U, 6 * U); b.fill();
      // its light spilling across the floor towards us
      b.fillStyle = linear(b, 0, L.sy + L.sh, 0, h, [[0, `rgba(234,190,90,${dark ? 0.18 : 0.1})`], [1, "rgba(234,190,90,0)"]]);
      b.beginPath(); b.moveTo(L.sx, L.sy + L.sh + 10 * U); b.lineTo(L.sx + L.sw, L.sy + L.sh + 10 * U); b.lineTo(w * 1.1, h); b.lineTo(L.sx - L.sw * 0.4, h); b.fill();
      // dust in the beam
      const motes = Array.from({ length: L.n ? 40 : 90 }, () => ({ u: r(), v: r(), s: 0.6 + r() * 1.4, sp: 0.2 + r() * 0.5, p: r() * 6 }));
      return { L, B, motes, dark };
    },
    draw(c, w, h, d, t, p) {
      const L = d.L, dark = d.dark;
      c.drawImage(d.B, 0, 0, w, h);
      // the projector's beam, from behind us onto the screen, dust turning in it
      const [px, py] = L.proj;
      c.save();
      c.globalCompositeOperation = "lighter";
      c.fillStyle = linear(c, px, py, L.sx + L.sw / 2, L.sy + L.sh / 2, [[0, `rgba(255,236,200,${dark ? 0.1 : 0.06})`], [1, "rgba(255,236,200,0.015)"]]);
      c.beginPath(); c.moveTo(px - 6, py); c.lineTo(px + 6, py); c.lineTo(L.sx + L.sw, L.sy + L.sh); c.lineTo(L.sx, L.sy); c.closePath(); c.fill();
      for (const m of d.motes) {
        const u = (m.u + Math.sin(t * m.sp + m.p) * 0.02 + t * 0.004 * m.sp) % 1, v = m.v;
        const x = lerp(px, L.sx + L.sw * v, u), y = lerp(py, L.sy + L.sh * (1 - v), u);
        c.fillStyle = `rgba(255,240,210,${(0.25 + 0.35 * Math.abs(Math.sin(t * 0.8 + m.p))) * (dark ? 1 : 0.6)})`;
        c.fillRect(x, y, m.s, m.s);
      }
      c.restore();
      stageAuction(p, L.n);
    },
  });
  // Mohit from just behind his right shoulder: the back of the quiff, the arms of his glasses over his
  // ears, the white shirt with its fine lavender stripe, all of it rim-lit by the board in front of him
  function watcher(c, x, y, s, dark) {
    const lit = dark ? "190,205,255" : "255,214,150";
    const skinLit = dark ? [150, 112, 92] : [172, 124, 92], skinDark = dark ? [58, 40, 34] : [78, 52, 38];
    // shoulders and back, the light falling from the screen ahead and to the left
    const back = new Path2D();
    back.moveTo(x - s * 0.62, y + s * 0.1);
    back.bezierCurveTo(x - s * 0.6, y - s * 0.28, x - s * 0.42, y - s * 0.42, x - s * 0.14, y - s * 0.46);
    back.lineTo(x + s * 0.14, y - s * 0.46);
    back.bezierCurveTo(x + s * 0.44, y - s * 0.42, x + s * 0.64, y - s * 0.28, x + s * 0.68, y + s * 0.1);
    back.closePath();
    c.fillStyle = linear(c, x - s * 0.6, y - s * 0.5, x + s * 0.5, y, dark ? [[0, "#9aa0b4"], [0.45, "#555b6e"], [1, "#22252f"]] : [[0, "#e9dccb"], [0.45, "#9a8d80"], [1, "#3b332d"]]);
    c.fill(back);
    // the pinstripe, fine and lavender, following the fall of the shirt
    c.save(); c.clip(back);
    c.strokeStyle = dark ? "rgba(170,160,220,.16)" : "rgba(150,130,200,.22)"; c.lineWidth = Math.max(0.6, s * 0.004);
    for (let k = -14; k <= 14; k++) { const bx = x + k * s * 0.05; c.beginPath(); c.moveTo(bx, y - s * 0.5); c.quadraticCurveTo(bx + k * s * 0.006, y - s * 0.2, bx + k * s * 0.012, y + s * 0.12); c.stroke(); }
    // a soft fold down the middle of the back, and the rim of light along the left shoulder
    c.fillStyle = "rgba(0,0,0,.18)"; c.beginPath(); c.ellipse(x + s * 0.05, y - s * 0.05, s * 0.05, s * 0.4, 0.05, 0, TAU); c.fill();
    c.globalCompositeOperation = "lighter";
    glow(c, x - s * 0.42, y - s * 0.4, s * 0.32, lit, dark ? 0.45 : 0.4);
    c.restore();
    // the neck and the back of the collar
    c.fillStyle = linear(c, x - s * 0.1, 0, x + s * 0.1, 0, [[0, rgba(skinLit)], [1, rgba(skinDark)]]);
    c.beginPath(); c.moveTo(x - s * 0.1, y - s * 0.44); c.lineTo(x - s * 0.095, y - s * 0.64); c.lineTo(x + s * 0.095, y - s * 0.64); c.lineTo(x + s * 0.11, y - s * 0.44); c.fill();
    c.fillStyle = dark ? "#c9cbd6" : "#f2ebe0";
    c.beginPath(); c.moveTo(x - s * 0.16, y - s * 0.43); c.quadraticCurveTo(x, y - s * 0.5, x + s * 0.17, y - s * 0.43); c.lineTo(x + s * 0.15, y - s * 0.49); c.quadraticCurveTo(x, y - s * 0.56, x - s * 0.14, y - s * 0.49); c.closePath(); c.fill();
    c.fillStyle = "rgba(0,0,0,.25)"; c.fillRect(x - s * 0.15, y - s * 0.432, s * 0.32, s * 0.012);
    // ears, the near one in shadow
    for (const [ex, col] of [[-1, skinLit], [1, skinDark]]) { c.fillStyle = rgba(col); c.beginPath(); c.ellipse(x + ex * s * 0.17, y - s * 0.76, s * 0.035, s * 0.06, ex * 0.2, 0, TAU); c.fill(); }
    // the head, almost all hair from here: short at the nape and sides, volume swept up on top
    const head = new Path2D();
    head.moveTo(x - s * 0.165, y - s * 0.66);
    head.bezierCurveTo(x - s * 0.2, y - s * 0.8, x - s * 0.19, y - s * 0.95, x - s * 0.1, y - s * 1.02);
    head.bezierCurveTo(x - s * 0.04, y - s * 1.07, x + s * 0.07, y - s * 1.08, x + s * 0.13, y - s * 1.02);
    head.bezierCurveTo(x + s * 0.2, y - s * 0.95, x + s * 0.21, y - s * 0.8, x + s * 0.17, y - s * 0.66);
    head.quadraticCurveTo(x, y - s * 0.6, x - s * 0.165, y - s * 0.66);
    c.fillStyle = linear(c, x - s * 0.2, y - s * 1.05, x + s * 0.2, y - s * 0.65, dark ? [[0, "#2a2a33"], [0.35, "#0d0c10"], [1, "#050405"]] : [[0, "#3a2e26"], [0.35, "#140f0c"], [1, "#070504"]]);
    c.fill(head);
    // the taper at the nape, skin showing through the short hair
    c.fillStyle = linear(c, 0, y - s * 0.7, 0, y - s * 0.62, [[0, "rgba(0,0,0,0)"], [1, rgba(skinDark, 0.55)]]);
    c.beginPath(); c.ellipse(x, y - s * 0.65, s * 0.13, s * 0.04, 0, 0, TAU); c.fill();
    // strands catching the light on top, swept back
    c.save(); c.clip(head);
    c.strokeStyle = dark ? "rgba(170,190,255,.14)" : "rgba(255,210,150,.14)"; c.lineWidth = Math.max(0.8, s * 0.004); c.lineCap = "round";
    for (let k = 0; k < 9; k += 2) { const sx = x - s * 0.16 + k * s * 0.035; c.beginPath(); c.moveTo(sx, y - s * 1.0 + Math.abs(k - 4) * s * 0.008); c.quadraticCurveTo(sx + s * 0.02, y - s * 0.9, sx + s * 0.03, y - s * 0.8); c.stroke(); }
    c.globalCompositeOperation = "lighter"; glow(c, x - s * 0.17, y - s * 0.92, s * 0.14, lit, dark ? 0.5 : 0.45);
    c.restore();
    // the arms of his glasses, running forward over his ears
    c.strokeStyle = dark ? "#1a1a1f" : "#24201c"; c.lineWidth = Math.max(1, s * 0.012);
    for (const ex of [-1, 1]) { c.beginPath(); c.moveTo(x + ex * s * 0.165, y - s * 0.79); c.lineTo(x + ex * s * 0.205, y - s * 0.8); c.stroke(); }
  }

  // the audience, nearer rows lower and larger, all facing the board, and him nearest of all
  function roomFrontLayer(L, w, h, dpr, dark) {
    const r = rng(93);
    const [F, f] = layer(w, h, dpr);
    const rows = L.n ? [[0.86, 0.06, 0.15]] : [[0.84, 0.05, 0.3], [0.93, 0.065, 0.36]];
    rows.forEach(([ry, rs, from], ri) => {
      const y = h * ry, sz = h * rs;
      for (let x = w * from + r() * sz; x < (L.n ? w * 0.66 : w * 0.74); x += sz * (1.5 + r() * 0.7)) {
        f.fillStyle = dark ? (ri ? "#04060b" : "#070a12") : ri ? "#120c09" : "#1d140f";
        f.beginPath(); f.ellipse(x, y + sz * 1.1, sz * 0.75, sz * 0.7, 0, Math.PI, TAU); f.fill();
        f.beginPath(); f.arc(x, y, sz * 0.36, 0, TAU); f.fill();
        f.save(); f.globalCompositeOperation = "source-atop"; glow(f, x, y - sz * 0.3, sz * 0.5, "255,214,140", dark ? 0.35 : 0.2); f.restore();
      }
    });
    const [mx, my, ms] = L.me;
    watcher(f, mx, my, ms, dark);
    return F;
  }
  scene(frontCv, {
    progress: aucP,
    build(w, h, dpr, dark) { return { F: roomFrontLayer(roomLayout(w, h), w, h, dpr, dark) }; },
    draw(c, w, h, d) { c.clearRect(0, 0, w, h); c.drawImage(d.F, 0, 0, w, h); },
  });
  function stageAuction(p, phone) {
    const lean = ease(smooth(0.05, 0.9, p));
    roomCam.style.transform = `scale(${(1 + 0.08 * lean).toFixed(4)})`;
    frontCv.style.transform = `translateY(${(lean * 9).toFixed(2)}%) scale(${(1 + 0.12 * lean).toFixed(4)})`;
    if (phone) { workHead.style.opacity = aucCopy.style.opacity = 1; workHead.style.visibility = aucCopy.style.visibility = "visible"; return; }
    const out = smooth(0.22, 0.34, p), inn = smooth(0.36, 0.5, p);
    workHead.style.opacity = 1 - out; workHead.style.transform = `translateY(${(-out * 18).toFixed(1)}px)`;
    workHead.style.visibility = out > 0.99 ? "hidden" : "visible";
    aucCopy.style.opacity = inn; aucCopy.style.transform = `translateY(${((1 - inn) * 18).toFixed(1)}px)`;
    aucCopy.style.visibility = inn < 0.01 ? "hidden" : "visible";
  }

  /* ───────── the footer: back up over the city ─────────
   * The walk ends where it began, the city from the air, settling back as you arrive.
   */
  const footSec = $("contact");
  scene($("footCity"), {
    progress: () => { const r = footSec.getBoundingClientRect(); return clamp((innerHeight - r.top) / innerHeight); },
    build: cityFor,
    draw(c, w, h, city, t, p) {
      const e = ease(RM ? 1 : p);
      drawCity(c, w, h, city, t, 1.3 - 0.3 * e, 0.08 * (1 - e));
    },
  });

  /* ───────── morning or night ───────── */
  listen(window, "themechange", () => {
    theme = document.documentElement.dataset.theme;
    scenes.forEach((s) => s.rebuild());
  });
  // only the line paints words (its station boards), so only it waits on the fonts
  document.fonts.ready.then(() => lineScene.rebuild());

  return () => {
    dead = true;
    subs.forEach((f) => f());
  };
}
