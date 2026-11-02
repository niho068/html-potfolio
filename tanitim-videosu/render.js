// Kullanım: node render.js  -> atolyelink-tanitim.mp4
const {chromium}=require('playwright');const {spawn,execFileSync}=require('child_process');const path=require('path');
const FPS=30, dir=__dirname, tmp=process.env.TMPDIR||'/tmp';
(async()=>{
  const wav=path.join(tmp,'atolyelink-muzik.wav');execFileSync('node',[path.join(dir,'muzik.js'),wav]);
  const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
  await p.goto('file://'+path.join(dir,'index.html')+'?render');await p.evaluate(()=>document.fonts.ready);
  const D=await p.evaluate(()=>window.DURATION);
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-i',wav,
    '-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',path.join(dir,'atolyelink-tanitim.mp4')],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<D*FPS;i++){await p.evaluate(t=>render(t),i/FPS);
    const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
    if(i%150===0)console.log(`kare ${i}/${D*FPS}`);}
  ff.stdin.end();await new Promise(r=>ff.on('close',r));await b.close();console.log('bitti');
})();
