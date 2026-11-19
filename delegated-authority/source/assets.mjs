import sharp from 'sharp'; import fs from 'fs';
const L='node_modules/lucide-static/icons/';
const icons={wallet:'wallet',phone:'smartphone',bank:'landmark',shield:'shield-check',car:'car',id:'id-card',heart:'heart-pulse',user:'user',users:'users',baby:'baby',key:'key-round',qr:'qr-code',check:'circle-check',x:'circle-x',lock:'lock',globe:'globe',scale:'scale',building:'building-2',file:'file-badge',eye:'eye',eyeoff:'eye-off',clock:'clock',hand:'hand-heart',home:'house',school:'school',pill:'pill',briefcase:'briefcase',laptop:'laptop',list:'list-checks',git:'git-branch',alert:'triangle-alert',refresh:'refresh-cw',link:'link',stamp:'stamp',gavel:'gavel',book:'book-open',plane:'plane',fingerprint:'fingerprint',mail:'mail',search:'search',server:'server',signin:'log-in',ban:'ban',flag:'flag',sparkles:'sparkles',message:'message-circle-question',handshake:'handshake',accessibility:'accessibility',scroll:'scroll-text'};
const colors={teal:'#073b49',sky:'#099dd5',copper:'#b45f2e',white:'#ffffff',green:'#1f8a5b',red:'#c0392b',light:'#40bceb'};
for (const [k,f] of Object.entries(icons)) { const p=L+f+'.svg'; if(!fs.existsSync(p)){console.log('missing',f);continue;}
  const svg=fs.readFileSync(p,'utf8');
  for (const [cn,c] of Object.entries(colors)) {
    const s=svg.replace(/stroke="currentColor"/g,`stroke="${c}"`).replace(/width="24"/,'width="256"').replace(/height="24"/,'height="256"').replace(/stroke-width="2"/,'stroke-width="1.75"');
    await sharp(Buffer.from(s)).png().toFile(`img/${k}-${cn}.png`);
  }}
console.log('ok');
