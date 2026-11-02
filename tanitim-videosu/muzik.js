// Basit, telifsiz arka plan müziği + efekt sesleri üretir (muzik.wav)
const fs=require('fs');const SR=44100,D=46,N=SR*D;const L=new Float32Array(N),R=new Float32Array(N);
const f=m=>440*Math.pow(2,(m-69)/12);
const add=(t0,dur,fn,gain,pan=0)=>{const s=Math.floor(t0*SR),e=Math.min(N,s+Math.floor(dur*SR));for(let i=s;i<e;i++){const t=(i-s)/SR;const v=fn(t)*gain;L[i]+=v*(1-pan);R[i]+=v*(1+pan);}};
// akorlar: C G Am F (her biri 2.18 sn, 110 bpm'de 4 vuruş)
const beat=60/110, bar=beat*4;
const chords=[[48,55,60,64,67],[43,50,59,62,67],[45,52,57,60,64],[41,48,57,60,65]];
for(let b=0,t=0;t<D;b++,t+=bar){const c=chords[b%4];
  c.forEach((m,k)=>add(t,bar+.3,x=>{const env=Math.min(1,x/.4)*Math.exp(-x*.6);return env*(Math.sin(2*Math.PI*f(m)*x)+.3*Math.sin(2*Math.PI*f(m)*2.002*x))},.035,k%2?.3:-.3));
  add(t,bar,x=>Math.exp(-x*3)*Math.sin(2*Math.PI*f(c[0]-12)*x),.12);
  // arpej
  for(let i=0;i<8;i++){const m=c[(i*2)%c.length]+12;add(t+i*beat/2,.5,x=>Math.exp(-x*7)*Math.sin(2*Math.PI*f(m)*x),.05,i%2?.5:-.5);}
  // davul: kick + hi-hat (girişten sonra)
  if(t>5)for(let i=0;i<4;i++){add(t+i*beat,.35,x=>Math.exp(-x*14)*Math.sin(2*Math.PI*(50+90*Math.exp(-x*30))*x),.32);
    let s=1;add(t+i*beat+beat/2,.06,x=>{s=(s*16807)%2147483647;return Math.exp(-x*60)*((s/2147483647)*2-1)},.05);}
}
const ding=(t,m,g=.18)=>add(t,1.2,x=>Math.exp(-x*4)*(Math.sin(2*Math.PI*f(m)*x)+.4*Math.sin(2*Math.PI*f(m)*3*x)),g);
const pop=(t)=>add(t,.12,x=>Math.exp(-x*40)*Math.sin(2*Math.PI*(900-3000*x)*x),.25);
const whoosh=(t,d)=>{let s=7;add(t,d,x=>{s=(s*16807)%2147483647;return Math.sin(Math.PI*x/d)*((s/2147483647)*2-1)},.08)};
[8.0,8.3,8.6].forEach(t=>pop(t));
ding(15.8,84);              // kritik stok uyarısı
pop(27.15);                 // butona tıklama
whoosh(27.8,1.2); whoosh(29.0,1.4);
ding(30.6,88); ding(31.4,91);
[0,1,2,3,4].forEach(i=>ding(32.6+i*1.15,76+[0,2,4,7,12][i],.13));
whoosh(38.2,.8); ding(43.0,72,.2); ding(43.0,79,.15); ding(43.0,84,.12);
// master fade
for(let i=0;i<N;i++){const t=i/SR;const g=Math.min(1,t/1.5)*Math.min(1,(D-t)/2.5);L[i]*=g;R[i]*=g;}
let mx=0;for(let i=0;i<N;i++)mx=Math.max(mx,Math.abs(L[i]),Math.abs(R[i]));
const buf=Buffer.alloc(44+N*4);buf.write('RIFF',0);buf.writeUInt32LE(36+N*4,4);buf.write('WAVEfmt ',8);buf.writeUInt32LE(16,16);buf.writeUInt16LE(1,20);buf.writeUInt16LE(2,22);buf.writeUInt32LE(SR,24);buf.writeUInt32LE(SR*4,28);buf.writeUInt16LE(4,32);buf.writeUInt16LE(16,34);buf.write('data',36);buf.writeUInt32LE(N*4,40);
for(let i=0;i<N;i++){buf.writeInt16LE(Math.round(L[i]/mx*.85*32767),44+i*4);buf.writeInt16LE(Math.round(R[i]/mx*.85*32767),46+i*4);}
fs.writeFileSync(process.argv[2]||'muzik.wav',buf);
