const KIT=process.argv[2]||'Kit A';const OUT=KIT==='Kit A'?'kit-a':'kit-b';const {chromium}=require('playwright-core');const fs=require('fs');
(async()=>{const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--hide-scrollbars']});
const p=await b.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
await p.goto('http://127.0.0.1:8351/k/demo',{waitUntil:'networkidle'});await p.waitForTimeout(1500);
await p.addStyleTag({content:fs.readFileSync('label.css','utf8')+'html{scrollbar-width:none!important}::-webkit-scrollbar{display:none!important}html,body{overflow-x:hidden!important}*{animation:none!important}.marquee-track,[data-overflow] ul.min-w-0{display:none!important}[data-overflow] > ul.invisible[aria-hidden=true]{visibility:visible!important;position:static!important;width:100%!important;flex-wrap:wrap!important}'});
const r=await p.evaluate((KIT)=>{const out=[];const leaves=()=>[...document.querySelectorAll('body *')].filter(e=>e.childElementCount===0);
 const L=t=>leaves().find(e=>e.textContent.trim()===t);
 L('PitchKit').closest('.band').style.display='none';out.push('collapsed header band');
 const dk=leaves().find(e=>/^Demo kit\. A real kit/.test(e.textContent.trim()));dk.style.display='none';out.push('hid demo line');
 const ps=L('Proof from the current Instagram set.');if(ps){ps.textContent='Recent work from the current Instagram set.';out.push('posts subtitle')}
 const cta=leaves().find(e=>/Create your Pitchkit/i.test(e.textContent));let c=cta;while(!/Continue with Instagram/.test(c.textContent))c=c.parentElement;c.style.display='none';
 for(const a of document.querySelectorAll('a'))if(/^(Privacy|Support)$/.test(a.textContent.trim()))(a.closest('footer')||a.parentElement).style.display='none';
 const sec=L('Past brands').closest('section');const mu=sec.querySelector('ul[aria-hidden=true]');mu.classList.remove('invisible','absolute','w-max');mu.style.flexWrap='wrap';mu.style.width='100%';mu.style.position='static';sec.querySelector('.marquee-track').parentElement.style.display='none';out.push('brands wrapped');
 const d=document.createElement('div');d.className='tt-label';d.innerHTML='<span>'+KIT+'</span><span>EXAMPLE DATA</span>';document.body.prepend(d);
 out.push('pitchkit mentions: '+(document.body.innerText.match(/pitch ?kit/gi)||[]).length);if(KIT==='Kit B'){const M={'@demo · 10K followers':'@demo · 10k followers','10,000':'10K','2,175':'2.2k+','42':'~40','Reach over 30 days':'Reach',
'Followers, from Instagram Insights.':'Followers.','Recent work from the current Instagram set.':'Recent work',
'21%':'20%','44%':'45%','22%':'20%','9%':'10%','4%':'5%','68%':'70%','30%':'30%','2%':'<5%','Unknown':'Other','46%':'45%','14%':'15%','11%':'10%','7%':'7%',
'55-64':'55+','United Kingdom':'UK','United States':'USA','Los Angeles':'LA','New York':'NYC','3.2x ROAS':'3x ROAS','+12% CTR':'great CTR',
'3,500':'3.5K','3,000':'3K','2,500':'2.5K','2,000':'2K','1,500':'1.5K','1,000':'1K','500':'500','0':'0'};
 const sec=t=>[...document.querySelectorAll('section,div')].filter(e=>e.querySelector('h2')&&e.querySelector('h2').textContent.trim()===t).pop();
 // cities: different rounding set
 
 for(const e of [...document.querySelectorAll('body *')].filter(e=>e.childElementCount===0)){const t=e.textContent.trim();
  if(/^(Aug \d+)$/.test(t)){e.textContent='';continue}
  if(/^Typical reach is/.test(t)||/^Typical performance with/.test(t)||t==='Graph data'||t==='Daily reach'||t==='Typical reach'&&e.closest('svg,ul,[class*=legend]')&&!e.closest('[class*=grid]')){e.style.visibility='hidden';continue}
  if(t in M)e.textContent=M[t];}
 // Graph data button container
 for(const b of document.querySelectorAll('button'))if(/Graph data/.test(b.textContent))b.style.visibility='hidden';
 // posts: hide comments/reach/saves cells
 for(const e of [...document.querySelectorAll('span')].filter(e=>/^(Comments|Reach|Saves)$/i.test(e.textContent.trim())&&e.childElementCount===0))e.parentElement.style.visibility='hidden';
 out.push('B text left: '+document.body.innerText.replace(/\n+/g,' | ').slice(0,1500));}
return out;},KIT);
console.log(r.join('\n'));await p.waitForTimeout(300);
const H=await p.evaluate(()=>document.documentElement.scrollHeight);await p.screenshot({path:OUT+'-first.png'});await p.setViewportSize({width:390,height:H});await p.waitForTimeout(500);await p.screenshot({path:OUT+'-390.png'});console.log('dc',await p.evaluate(()=>{const h=document.querySelector('h1').getBoundingClientRect();return [h.top,document.documentElement.clientWidth,document.body.getBoundingClientRect().width]}));console.log(await p.evaluate(()=>{const s=[...document.querySelectorAll('section')].find(s=>/Past brands/.test(s.textContent));return [...s.querySelectorAll('ul,div.group,[data-overflow]')].map(e=>e.tagName+'|'+e.className+'|'+getComputedStyle(e).display+'|'+JSON.stringify(e.getBoundingClientRect())).join('\n')}));console.log(await p.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,[class*=uppercase],svg')].filter(e=>e.getBoundingClientRect().height>0).map(e=>Math.round(e.getBoundingClientRect().top)+' '+Math.round(e.getBoundingClientRect().height)+' '+e.tagName+' '+(e.textContent||'').trim().slice(0,30)).join('\n')));console.log('sw',await p.evaluate(()=>[document.documentElement.scrollWidth,document.documentElement.scrollHeight]));await b.close();})();
