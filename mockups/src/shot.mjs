import {createRequire} from "node:module";import {join} from "node:path";
const {chromium}=createRequire(join(process.env.HOME,".cache/hairline-look/x.cjs"))("playwright-core");
const b=await chromium.launch({channel:"chrome"});const O="/workspace/pitchkit/mockups/",U="file:///workspace/pitchkit/mockups/src/kit.html";
const shot=async(w,h,f,full,chat)=>{const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2});await p.goto(U);
 if(full&&w<900)await p.evaluate(()=>document.body.classList.add("full"));if(chat)await p.evaluate(()=>document.body.classList.add("chat"));
 const bad=await p.evaluate(()=>[...document.querySelectorAll("*")].filter(e=>e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflow!=="hidden").map(e=>e.className).slice(0,5).concat(document.documentElement.scrollWidth>innerWidth?["PAGE-OVERFLOW"]:[]));
 const small=await p.evaluate(()=>[...document.querySelectorAll(".go,.x,.askbar")].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<44).map(e=>e.className+":"+e.getBoundingClientRect().height));
 if(full&&w>=900){const H=await p.evaluate(()=>document.documentElement.scrollHeight);await p.setViewportSize({width:w,height:H})}console.log(f,"overflow:",bad,"small taps:",small);await p.screenshot({path:O+f,fullPage:full});await p.close()};
await shot(390,844,"kit-390.png",true);await shot(390,844,"kit-390-chat.png",false,true);await shot(1440,900,"kit-1440.png",true);await b.close();
{const b2=await chromium.launch({channel:"chrome"});const p=await b2.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});await p.goto(U);
await p.evaluate(()=>{document.body.classList.add("chat","kb");document.querySelector(".insheet .ph2").textContent="Saves on carousels?"});
console.log("kb", await p.evaluate(()=>{const r=e=>document.querySelector(e).getBoundingClientRect();return {bar:r(".insheet").bottom,kbd:r(".kbd").top,lastA:r(".a").bottom,barTop:r(".insheet").top,sheetTop:r(".sheet").top,go:r(".insheet .go").height,ovf:document.documentElement.scrollWidth}}));
await p.screenshot({path:O+"kit-390-keyboard.png"});await b2.close()}
