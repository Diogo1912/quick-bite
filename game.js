// ============================================================
// SHIFT v5 — Immersive Courier Simulation
// ============================================================
const $=s=>document.querySelector(s),$$=s=>document.querySelectorAll(s);

// ============================================================
// AUDIO ENGINE + AMBIENT
// ============================================================
const SFX={
  ctx:null,muted:false,ambient:null,city:null,music:null,
  init(){if(this.ctx)return;this.ctx=new(window.AudioContext||window.webkitAudioContext)();},
  play(type){
    if(this.muted||!this.ctx)return;
    const c=this.ctx,now=c.currentTime,g=c.createGain(),o=c.createOscillator();
    g.connect(c.destination);o.connect(g);
    switch(type){
      case'notif':o.frequency.setValueAtTime(880,now);o.frequency.linearRampToValueAtTime(1320,now+.08);o.frequency.linearRampToValueAtTime(1100,now+.15);g.gain.setValueAtTime(.12,now);g.gain.linearRampToValueAtTime(0,now+.2);o.start(now);o.stop(now+.2);break;
      case'accept':o.frequency.setValueAtTime(523,now);g.gain.setValueAtTime(.1,now);g.gain.linearRampToValueAtTime(0,now+.1);o.start(now);o.stop(now+.12);{const o2=c.createOscillator(),g2=c.createGain();o2.connect(g2);g2.connect(c.destination);o2.frequency.setValueAtTime(784,now+.1);g2.gain.setValueAtTime(.1,now+.1);g2.gain.linearRampToValueAtTime(0,now+.22);o2.start(now+.1);o2.stop(now+.22);}break;
      case'decline':o.frequency.setValueAtTime(440,now);o.frequency.linearRampToValueAtTime(280,now+.2);g.gain.setValueAtTime(.08,now);g.gain.linearRampToValueAtTime(0,now+.25);o.start(now);o.stop(now+.25);break;
      case'tick':o.frequency.setValueAtTime(1000,now);g.gain.setValueAtTime(.04,now);g.gain.linearRampToValueAtTime(0,now+.05);o.start(now);o.stop(now+.06);break;
      case'complete':o.frequency.setValueAtTime(523,now);g.gain.setValueAtTime(.08,now);g.gain.linearRampToValueAtTime(0,now+.15);o.start(now);o.stop(now+.15);[659,784].forEach((f,i)=>{const ox=c.createOscillator(),gx=c.createGain();ox.connect(gx);gx.connect(c.destination);ox.frequency.setValueAtTime(f,now+.12*(i+1));gx.gain.setValueAtTime(.08,now+.12*(i+1));gx.gain.linearRampToValueAtTime(0,now+.12*(i+1)+.18);ox.start(now+.12*(i+1));ox.stop(now+.12*(i+1)+.18);});break;
      default:o.frequency.setValueAtTime(600,now);g.gain.setValueAtTime(.05,now);g.gain.linearRampToValueAtTime(0,now+.1);o.start(now);o.stop(now+.1);
    }
  },
  // Ambient city soundscape
  startCity(){
    if(this.muted||!this.ctx||this.city)return;
    const c=this.ctx;
    // Traffic hum: filtered noise
    const tBuf=c.createBuffer(1,c.sampleRate*4,c.sampleRate),tD=tBuf.getChannelData(0);
    for(let i=0;i<tD.length;i++)tD[i]=Math.random()*2-1;
    const tSrc=c.createBufferSource();tSrc.buffer=tBuf;tSrc.loop=true;
    const tBP=c.createBiquadFilter();tBP.type='bandpass';tBP.frequency.value=180;tBP.Q.value=0.5;
    const tG=c.createGain();tG.gain.value=.015;
    tSrc.connect(tBP);tBP.connect(tG);tG.connect(c.destination);tSrc.start();

    // People murmur: mid-freq noise
    const pBuf=c.createBuffer(1,c.sampleRate*4,c.sampleRate),pD=pBuf.getChannelData(0);
    for(let i=0;i<pD.length;i++)pD[i]=Math.random()*2-1;
    const pSrc=c.createBufferSource();pSrc.buffer=pBuf;pSrc.loop=true;
    const pBP=c.createBiquadFilter();pBP.type='bandpass';pBP.frequency.value=500;pBP.Q.value=1;
    const pG=c.createGain();pG.gain.value=.008;
    pSrc.connect(pBP);pBP.connect(pG);pG.connect(c.destination);pSrc.start();

    this.city={traffic:{src:tSrc,gain:tG},people:{src:pSrc,gain:pG}};

    // Bird chirps: random interval
    this._birdTimer=setInterval(()=>{
      if(this.muted||!this.ctx)return;
      const o=c.createOscillator(),g=c.createGain();
      o.connect(g);g.connect(c.destination);
      o.type='sine';
      const f=2500+Math.random()*1500;
      o.frequency.setValueAtTime(f,c.currentTime);
      o.frequency.linearRampToValueAtTime(f+300,c.currentTime+.05);
      o.frequency.linearRampToValueAtTime(f-200,c.currentTime+.1);
      g.gain.setValueAtTime(.008,c.currentTime);
      g.gain.linearRampToValueAtTime(0,c.currentTime+.15);
      o.start(c.currentTime);o.stop(c.currentTime+.15);
    },3000+Math.random()*5000);

    // Subtle ambient music: 4-note loop
    this._musicLoop();
  },
  _musicLoop(){
    if(this.muted||!this.ctx)return;
    const c=this.ctx,now=c.currentTime;
    const notes=[262,330,392,330]; // C E G E
    notes.forEach((f,i)=>{
      const o=c.createOscillator(),g=c.createGain();
      o.type='triangle';o.connect(g);g.connect(c.destination);
      o.frequency.setValueAtTime(f,now+i*2);
      g.gain.setValueAtTime(0,now+i*2);
      g.gain.linearRampToValueAtTime(.006,now+i*2+.3);
      g.gain.linearRampToValueAtTime(.004,now+i*2+1.5);
      g.gain.linearRampToValueAtTime(0,now+i*2+2);
      o.start(now+i*2);o.stop(now+i*2+2);
    });
    this.music=setTimeout(()=>this._musicLoop(),8000);
  },
  stopCity(){
    if(this.city){
      try{this.city.traffic.src.stop();}catch(e){}
      try{this.city.people.src.stop();}catch(e){}
      this.city=null;
    }
    if(this._birdTimer){clearInterval(this._birdTimer);this._birdTimer=null;}
    if(this.music){clearTimeout(this.music);this.music=null;}
  },
  startRain(){
    if(this.muted||!this.ctx||this.ambient)return;
    const c=this.ctx,buf=c.createBuffer(1,c.sampleRate*2,c.sampleRate),d=buf.getChannelData(0);
    for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
    const src=c.createBufferSource();src.buffer=buf;src.loop=true;
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=800;
    const g=c.createGain();g.gain.value=.04;
    src.connect(lp);lp.connect(g);g.connect(c.destination);src.start();
    this.ambient={src,gain:g};
    // Reduce city sounds during rain
    if(this.city){this.city.traffic.gain.gain.linearRampToValueAtTime(.005,c.currentTime+1);this.city.people.gain.gain.linearRampToValueAtTime(.002,c.currentTime+1);}
  },
  stopRain(){
    if(!this.ambient)return;
    const c=this.ctx;
    this.ambient.gain.gain.linearRampToValueAtTime(0,c.currentTime+.5);
    const s=this.ambient.src;setTimeout(()=>{try{s.stop();}catch(e){}},600);
    this.ambient=null;
    // Restore city sounds
    if(this.city){this.city.traffic.gain.gain.linearRampToValueAtTime(.015,c.currentTime+1);this.city.people.gain.gain.linearRampToValueAtTime(.008,c.currentTime+1);}
  },
  toggle(){
    this.muted=!this.muted;
    const b=$('#sound-btn');if(b)b.classList.toggle('muted',this.muted);
    if(this.muted){this.stopRain();this.stopCity();}
    else if(S.day>0){this.startCity();}
  }
};

// ============================================================
// MAP
// ============================================================
const CityMap={
  canvas:null,ctx:null,streets:[],blocks:[],route:[],courierPct:0,pickup:null,dropoff:null,drawn:false,
  init(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.resize();window.addEventListener('resize',()=>this.resize());},
  resize(){const p=this.canvas.parentElement,dpr=window.devicePixelRatio||1;this.canvas.width=p.clientWidth*dpr;this.canvas.height=p.clientHeight*dpr;this.canvas.style.width=p.clientWidth+'px';this.canvas.style.height=p.clientHeight+'px';this.ctx.scale(dpr,dpr);this.w=p.clientWidth;this.h=p.clientHeight;if(this.drawn)this.draw();},
  generate(seed){
    this.streets=[];this.blocks=[];
    const w=this.w,h=this.h,rng=s=>{s=Math.sin(s)*10000;return s-Math.floor(s);};let si=seed*137;
    const hs=[],vs=[];
    for(let y=50;y<h-30;y+=55+rng(si++)*30){hs.push(y);this.streets.push({x1:0,y1:y,x2:w,y2:y,horiz:true});}
    for(let x=40;x<w-30;x+=50+rng(si++)*25){vs.push(x);this.streets.push({x1:x,y1:0,x2:x,y2:h,horiz:false});}
    for(let i=0;i<hs.length-1;i++)for(let j=0;j<vs.length-1;j++){
      const x=vs[j]+6,y=hs[i]+6,bw=vs[j+1]-vs[j]-12,bh=hs[i+1]-hs[i]-12;
      if(bw>8&&bh>8)this.blocks.push({x,y,w:bw,h:bh,shade:rng(si++),park:rng(si++)>.88});
    }
    this.pickup={x:vs[1]||60,y:hs[1]||80};
    const hm=Math.floor(hs.length/2),vm=Math.floor(vs.length/2);
    this.dropoff={x:vs[vm+1]||w-80,y:hs[hm+1]||h-100};
    this.route=[this.pickup,{x:this.dropoff.x,y:this.pickup.y},{x:this.dropoff.x,y:this.dropoff.y},this.dropoff];
    this.courierPct=0;this.drawn=true;
  },
  draw(){
    const ctx=this.ctx,w=this.w,h=this.h;ctx.clearRect(0,0,w,h);
    ctx.fillStyle='#E8E8ED';ctx.fillRect(0,0,w,h);
    const names=['Kerkstraat','Vijzelgracht','Prinsengracht','Spuistraat','Damrak','Overtoom','Bilderdijk','Ferdinand Bol'];
    for(const b of this.blocks){ctx.fillStyle=b.park?'#C8E6C9':`rgb(${210+b.shade*20},${210+b.shade*20},${215+b.shade*20})`;ctx.beginPath();ctx.roundRect(b.x,b.y,b.w,b.h,3);ctx.fill();}
    for(const s of this.streets){ctx.strokeStyle='#F5F5F5';ctx.lineWidth=s.horiz?7:6;ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();ctx.strokeStyle='#E0E0E0';ctx.lineWidth=.5;ctx.setLineDash([4,4]);ctx.beginPath();ctx.moveTo(s.x1,s.y1);ctx.lineTo(s.x2,s.y2);ctx.stroke();ctx.setLineDash([]);}
    ctx.font='7px Plus Jakarta Sans,sans-serif';ctx.fillStyle='#B0B0B0';
    this.streets.forEach((s,i)=>{if(i%3||i>=names.length)return;if(s.horiz)ctx.fillText(names[i],10,s.y1-3);else{ctx.save();ctx.translate(s.x1+3,20);ctx.rotate(Math.PI/2);ctx.fillText(names[i],0,0);ctx.restore();}});
    if(this.route.length>1){ctx.strokeStyle='rgba(0,200,83,.5)';ctx.lineWidth=4;ctx.setLineDash([8,6]);ctx.lineCap='round';ctx.beginPath();ctx.moveTo(this.route[0].x,this.route[0].y);for(let i=1;i<this.route.length;i++)ctx.lineTo(this.route[i].x,this.route[i].y);ctx.stroke();ctx.setLineDash([]);}
    if(this.pickup)this.drawMarker(this.pickup.x,this.pickup.y,'#FF9500','P');
    if(this.dropoff)this.drawMarker(this.dropoff.x,this.dropoff.y,'#00C853','D');
    if(this.courierPct>0){const pos=this.getCourierPos(this.courierPct);ctx.beginPath();ctx.arc(pos.x,pos.y,12,0,Math.PI*2);ctx.fillStyle='rgba(0,122,255,.15)';ctx.fill();ctx.beginPath();ctx.arc(pos.x,pos.y,6,0,Math.PI*2);ctx.fillStyle='#007AFF';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
  },
  drawMarker(x,y,c,l){const ctx=this.ctx;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.font='bold 9px Plus Jakarta Sans,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(l,x,y);ctx.textAlign='start';ctx.textBaseline='alphabetic';},
  getCourierPos(pct){if(this.route.length<2)return{x:0,y:0};let tl=0;const segs=[];for(let i=1;i<this.route.length;i++){const dx=this.route[i].x-this.route[i-1].x,dy=this.route[i].y-this.route[i-1].y;segs.push(Math.sqrt(dx*dx+dy*dy));tl+=segs[segs.length-1];}let t=pct*tl;for(let i=0;i<segs.length;i++){if(t<=segs[i]){const r=t/segs[i];return{x:this.route[i].x+(this.route[i+1].x-this.route[i].x)*r,y:this.route[i].y+(this.route[i+1].y-this.route[i].y)*r};}t-=segs[i];}return this.route[this.route.length-1];}
};

// ============================================================
// LOADING
// ============================================================
const Loading={
  messages:{1:['Your community is waiting for you.'],2:['Your rating reflects your commitment to quality.'],3:['Top couriers accept 97% of orders. You can do it.'],4:['92% of deactivated accounts had below-average acceptance rates.'],5:['The algorithm sees your potential.']},
  steps:['Connecting to server...','Loading your zone...','Checking order queue...'],
  show(day,duration,cb){
    const el=$('#loading'),stepsEl=$('#ld-steps'),msgEl=$('#ld-msg');
    const msgs=this.messages[day]||this.messages[1];
    stepsEl.innerHTML=this.steps.map(s=>`<div class="ld-step"><div class="ld-step-icon"><svg viewBox="0 0 12 12" width="10" height="10"><path d="M2 6l3 3 5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg></div><span>${s}</span></div>`).join('');
    msgEl.textContent='';msgEl.style.opacity='0';
    el.classList.add('active');
    const stepEls=stepsEl.querySelectorAll('.ld-step'),sd=600;
    stepEls.forEach((se,i)=>{setTimeout(()=>se.classList.add('active'),i*sd);setTimeout(()=>{se.classList.remove('active');se.classList.add('done');SFX.play('tick');},((i+1)*sd)-100);});
    const ms=this.steps.length*sd+200;
    setTimeout(()=>{msgEl.textContent=msgs[0];msgEl.style.opacity='1';},ms);
    setTimeout(()=>{el.classList.remove('active');if(cb)cb();},duration);
  }
};

// ============================================================
// EXTERNAL NOTIFICATIONS
// ============================================================
const ExtNotif={
  templates:{
    day1_start:{app:'WhatsApp',icon:'#25D366',letter:'W',title:'Mom',body:'Good luck on your first day! Be safe out there.'},
    low_earnings:{app:'ING Banking',icon:'#FF6200',letter:'ING',title:'Account update',body:'Current balance: \u20ac47.23'},
    low_earnings_2:{app:'ING Banking',icon:'#FF6200',letter:'ING',title:'Payment failed',body:'Direct debit could not be processed: insufficient funds.'},
    health_warn:{app:'Health',icon:'#FF2D55',letter:'H',title:'Activity alert',body:'You\'ve been cycling for 6+ hours. Consider taking a break.'},
    storm_weather:{app:'Weather',icon:'#5AC8FA',letter:'W',title:'Severe weather',body:'Heavy rain warning in your area until 22:00.'},
    deactivation_linkedin:{app:'LinkedIn',icon:'#0077B5',letter:'in',title:'Jobs for you',body:'12 Delivery Driver positions near you.'},
    rent_due:{app:'Tikkie',icon:'#2FCA6B',letter:'T',title:'Reminder',body:'Rent due in 3 days: \u20ac875.00'},
    news_eu:{app:'NOS',icon:'#E84C17',letter:'N',title:'Breaking',body:'EU Parliament to vote on gig worker protections this week.'},
    family_dinner:{app:'WhatsApp',icon:'#25D366',letter:'W',title:'Mom',body:'Dinner\'s getting cold. When are you coming home?'},
    referral:{app:'QuickBite',icon:'#00C853',letter:'Q',title:'Invite friends!',body:'Earn \u20ac25 for every friend who joins. Share your code now!'}
  },
  fire(key,delay){const tpl=this.templates[key];if(!tpl)return;setTimeout(()=>this.show(tpl),delay||0);},
  show(data){
    const container=$('#ext-notifs');if(!container)return;SFX.play('notif');
    const el=document.createElement('div');el.className='ext-notif';
    el.innerHTML=`<div class="en-head"><div class="en-icon" style="background:${data.icon};font-size:${data.letter.length>1?'7':'10'}px">${data.letter}</div><span class="en-app">${data.app}</span><span class="en-time">now</span></div><div class="en-body"><strong>${data.title}</strong> ${data.body}</div>`;
    container.appendChild(el);requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>{el.classList.remove('show');el.classList.add('hide');setTimeout(()=>el.remove(),400);},3500);
  }
};

// ============================================================
// STATE
// ============================================================
const S={
  day:0,phase:'title',playerName:'Courier',vehicle:'bike',
  stats:{income:50,rating:50,wellbeing:65,autonomy:70},
  earnings:0,deliveries:0,declined:0,acceptance:100,
  todayEarnings:0,dailyEarnings:[],
  history:[],orderLog:[],flags:{},ended:false,endingType:null,timer:null,
  gameTime:9*60+41,fillerIdx:0
};
function resetState(){Object.assign(S,{day:0,phase:'title',stats:{income:50,rating:50,wellbeing:65,autonomy:70},earnings:0,deliveries:0,declined:0,acceptance:100,todayEarnings:0,dailyEarnings:[],history:[],orderLog:[],flags:{},ended:false,endingType:null,timer:null,gameTime:9*60+41,fillerIdx:0});}

// Filler orders pool
const FILLERS=[
  {restaurant:'Kebab King',cuisine:'Turkish',dist:2.1,pay:4.20,time:12},
  {restaurant:'Pizza Roma',cuisine:'Italian',dist:1.8,pay:3.80,time:10},
  {restaurant:'Wok Express',cuisine:'Chinese',dist:3.4,pay:5.10,time:16},
  {restaurant:'Bagel Brothers',cuisine:'Breakfast',dist:1.2,pay:3.20,time:8},
  {restaurant:'Taco Loco',cuisine:'Mexican',dist:2.7,pay:4.50,time:14},
  {restaurant:'Sushi Roll',cuisine:'Japanese',dist:3.8,pay:6.20,time:18},
  {restaurant:'Burger Joint',cuisine:'American',dist:1.5,pay:3.60,time:9},
  {restaurant:'Falafel House',cuisine:'Mediterranean',dist:2.3,pay:4.00,time:11},
  {restaurant:'Curry Palace',cuisine:'Indian',dist:4.1,pay:5.50,time:20},
  {restaurant:'Poke Bowl Bar',cuisine:'Hawaiian',dist:1.9,pay:4.80,time:10},
];
function getFillerOrder(){const o=FILLERS[S.fillerIdx%FILLERS.length];S.fillerIdx++;return{...o,quality:`${o.dist}km \u2022 ~${o.time}min`};}

// Effects
function applyCascades(){const p={income:0,rating:0,wellbeing:0,autonomy:0};if(S.stats.rating<40)p.income-=5;if(S.stats.wellbeing<30)p.autonomy-=5;if(S.stats.income<25){p.wellbeing-=5;p.autonomy-=5;}if(S.stats.autonomy<25)p.wellbeing-=3;return p;}
function applyEffects(fx,fl){const casc=applyCascades(),mult=S.stats.wellbeing<30?1.5:1;for(const k of['income','rating','wellbeing','autonomy']){let d=fx[k]||0;if(d<0)d=Math.round(d*mult);S.stats[k]=Math.max(0,Math.min(100,S.stats[k]+d+(casc[k]||0)));}if(fl)Object.assign(S.flags,fl);}
function getEnding(){const s=S.stats;if(S.flags.switchedPlatform)return'walked';if(s.rating<20||s.income<=0||s.rating<=0||s.wellbeing<=0||s.autonomy<=0)return'deactivated';if(s.rating>55&&s.income>50&&s.wellbeing>40)return'thriving';return'surviving';}

// ============================================================
// UI UPDATES
// ============================================================
function updateStats(){
  const re=$('#hdr-rating');if(re)re.textContent=(S.stats.rating/10).toFixed(1);
  const ee=$('#hdr-earn');if(ee)ee.textContent='\u20ac'+S.earnings.toFixed(2);
  const ae=$('#hdr-acc');if(ae)ae.textContent=S.acceptance+'%';
  // Desktop orbs (r=18, circumference=113.1)
  for(const k of['income','rating','wellbeing','autonomy']){
    const orb=$(`.stat-orb[data-stat="${k}"]`);
    if(orb){const v=S.stats[k];const f=orb.querySelector('.orb-fill');if(f)f.style.strokeDashoffset=113.1-(113.1*v/100);const vl=orb.querySelector('.orb-val');if(vl)vl.textContent=v;orb.classList.toggle('orb-crit',v<=20);}
    // Mobile orbs (r=13, circumference=81.7)
    const mob=$(`.ms-orb[data-stat="${k}"]`);
    if(mob){const v=S.stats[k];const f=mob.querySelector('.orb-fill');if(f)f.style.strokeDashoffset=81.7-(81.7*v/100);const vl=mob.querySelector('.ms-val');if(vl)vl.textContent=v;}
  }
  const batt=$('#sb-batt-fill');if(batt){const pct=Math.max(10,100-S.day*15-S.deliveries*5);batt.style.width=pct+'%';if(pct<25)batt.style.background='var(--red)';}
}
function pulseOrb(stat){const orb=$(`.stat-orb[data-stat="${stat}"]`);if(orb){orb.classList.remove('pulse');void orb.offsetWidth;orb.classList.add('pulse');}}
function updateClock(m){S.gameTime+=m||0;const h=Math.floor(S.gameTime/60)%24,mn=S.gameTime%60;const te=$('#sb-time');if(te)te.textContent=`${h}:${mn.toString().padStart(2,'0')}`;}
function updateOrdersTab(){const l=$('#orders-list');if(!l)return;if(!S.orderLog.length){l.innerHTML='<div class="tv-empty">No orders yet. Start delivering!</div>';return;}l.innerHTML=S.orderLog.map(o=>`<div class="order-row"><div class="or-icon ${o.status}">${o.status==='completed'?'\u2713':'\u2717'}</div><div class="or-info"><div class="or-name">${o.restaurant}</div><div class="or-meta">${o.dist}km</div></div><div class="or-pay ${o.pay===0?'zero':''}">${o.pay>0?'\u20ac'+o.pay.toFixed(2):'--'}</div></div>`).join('');}
function updateWalletTab(){
  const wt=$('#wl-total');if(wt)wt.textContent='\u20ac'+S.earnings.toFixed(2);
  const wd=$('#wl-today');if(wd)wd.textContent='\u20ac'+S.todayEarnings.toFixed(2);
  const wa=$('#wl-avg');if(wa)wa.textContent=S.deliveries>0?'\u20ac'+(S.earnings/S.deliveries).toFixed(2):'\u20ac0.00';
  const wdel=$('#wl-del');if(wdel)wdel.textContent=S.deliveries;
  const wh=$('#wl-hours');if(wh)wh.textContent=Math.max(1,S.day)+'h';
  const chart=$('#wl-chart');if(!chart)return;
  const days=['Mon','Tue','Wed','Thu','Fri'],maxE=Math.max(...S.dailyEarnings,10);
  chart.innerHTML=days.map((d,i)=>{const e=S.dailyEarnings[i]||0;return`<div class="wl-bar${i===S.day-1?' today':''}" style="height:${Math.max(4,(e/maxE)*70)}px"><span class="wl-bar-lbl">${d}</span></div>`;}).join('');
}
function switchTab(tab){$$('.tab-view').forEach(v=>v.classList.remove('active'));$$('.bn-item').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const view=$(`#tab-${tab}`);if(view)view.classList.add('active');if(tab==='orders')updateOrdersTab();if(tab==='wallet')updateWalletTab();}

function isDesktop(){return window.innerWidth>900;}

// ============================================================
// GAME DATA
// ============================================================
const SHIFTS={
  1:{title:'The Cold Start',sub:'Monday',weather:'clear',mechanism:'Dispatch & Order Allocation',fillerCount:2,
    appNotif:()=>`Welcome to the QuickBite family, ${S.playerName}! We\u2019re so excited to have you. Complete deliveries to build your profile!`,
    missedOrder:{restaurant:'Sushi Palace',dist:0.8,pay:8.50,reason:'Assigned to higher-rated courier'},
    order:{restaurant:'Quick Burger',cuisine:'Fast Food',dist:6.2,pay:3.50,time:25,quality:'Low pay \u2022 Long distance'},
    context:'It\u2019s your first shift. The good orders \u2014 short distance, high tips \u2014 flash on screen and vanish: <em>"assigned to higher-rated courier."</em> Your reliability score is blank. The only orders left are the ones nobody else wanted.',
    event:{trigger:0.45,text:'You arrive at Quick Burger. The order isn\u2019t ready. The kitchen says 15 more minutes. You\u2019re already behind on time. Every minute waiting is a minute not earning.',
      choices:[
        {label:'Wait for the order',desc:'Stay professional.',fx:{income:-10,rating:15,wellbeing:-15,autonomy:-10},flags:{acceptedBadOrders:true},result:'You waited 18 minutes. Delivered to a 5th-floor walk-up with no elevator. Earned \u20ac3.50 for 40 minutes of work. But your reliability score is building.'},
        {label:'Cancel and find another',desc:'Your time has value.',fx:{income:-5,rating:5,wellbeing:-5,autonomy:5},flags:{wasSelective:true},result:'You cancelled and waited for the next order. It took 20 minutes to get a new one \u2014 another long-distance, low-pay run.'},
        {label:'Log off for today',desc:'This isn\u2019t worth it.',fx:{income:-15,rating:0,wellbeing:0,autonomy:10},flags:{changedZone:true},result:'You logged off. Zero completions today. Your reliability score didn\u2019t move.'}
      ]},
    shiftEnd:s=>{const earned=s.flags.acceptedBadOrders?3.50:0;return{earned,orders:s.flags.changedZone?0:1};},
    insight:{platformCase:'<strong>Why does QuickBite dispatch this way?</strong>\n\nPerformance-based dispatch exists because customers expect fast, reliable delivery. The system prioritises couriers with track records because that\u2019s what customer satisfaction data consistently shows works.\n\nThere is a chicken-and-egg problem here. Some platforms experimented with "onboarding boosts" \u2014 giving new couriers better orders. But this means temporarily degrading service for customers.\n\n<span class="source">(Meijerink & Keegan, 2025; Kadolkar et al., 2025)</span>',
      rawlsianLens:'<strong>The Difference Principle</strong> <span class="source">(Rawls, 1999, pp. 65\u201373)</span>\n\nNew couriers are the least advantaged in this system \u2014 no rating history, no access to good orders, no mechanism to escape the trap. The "cold start problem" shows the worst-off are systematically locked out of improvement.\n\nWould you agree to a dispatch system that makes your success dependent on a history you cannot yet have?'},
    extNotifs:[{key:'day1_start',delay:6000}]},
  2:{title:'The Black Box',sub:'Tuesday',weather:'clear',mechanism:'Rating System Opacity',fillerCount:2,
    appNotif:()=>`Hey ${S.playerName}! Your score is now ${(S.stats.rating/10).toFixed(1)}/10. Keep being awesome!`,
    order:{restaurant:'Pasta Corner',cuisine:'Italian',dist:3.1,pay:5.20,time:18,quality:'Medium distance'},
    context:s=>{const amt=s.flags.acceptedBadOrders?'slightly':(s.flags.changedZone?'sharply':'noticeably');return`Your rating dropped ${amt} overnight. You don\u2019t know why. The app shows a single number with no breakdown.`;},
    event:{trigger:0.5,text:'You delivered the pasta on time. Then a notification: your rating just dropped again. No explanation. "Your score reflects overall service quality." No specifics.',
      choices:[
        {label:'Message support',desc:'Someone must explain this.',fx:{income:-5,rating:0,wellbeing:-10,autonomy:-5},flags:{contactedSupport:true},result:'"We are unable to share specific details about how your performance score is calculated." You lost an hour for a scripted non-answer.'},
        {label:'Work harder',desc:'Force the number back up.',fx:{income:5,rating:10,wellbeing:-15,autonomy:-15},flags:{overworkedForRating:true},result:'You worked a 10-hour shift. Your rating crept back up. But you\u2019re reacting to a number you can\u2019t see the logic behind.'},
        {label:'Ignore it',desc:'Chasing an opaque number is a trap.',fx:{income:0,rating:-5,wellbeing:5,autonomy:10},flags:{ignoredRating:true},result:'Your rating didn\u2019t recover. But you feel more like a person making choices.'}
      ]},
    shiftEnd:()=>({earned:5.20,orders:1}),
    insight:{platformCase:'<strong>Why doesn\u2019t QuickBite show rating details?</strong>\n\nRevealing the formula enables gaming. There\u2019s also a scale problem: if every component is visible, every courier demands individual review.\n\n<span class="source">(Kadolkar et al., 2025; Kellogg et al., 2020)</span>',
      rawlsianLens:'<strong>Basic Liberties</strong> <span class="source">(Rawls, 1999, pp. 53\u201354)</span>\n\nThe right to know the criteria by which you are evaluated is not a luxury. But if transparency enables gaming that harms the least-advantaged couriers, the principles pull in opposite directions.'},
    extNotifs:[{key:'health_warn',delay:8000}]},
  3:{title:'The Storm',sub:'Wednesday',weather:'rain',mechanism:'Algorithmic Incentives',fillerCount:3,
    appNotif:`Bonus time! Rain means extra demand. Earn up to 1.5x per delivery!`,
    order:{restaurant:'Thai Garden',cuisine:'Thai',dist:4.7,pay:9.80,time:22,quality:'1.5x SURGE',surge:true},
    context:s=>{const extra=s.stats.rating<40?' <em>"Your reliability score is below average."</em>':'';return`It\u2019s pouring. Roads are slick. The app is flashing surge pricing. Other couriers are logging off.${extra}`;},
    event:{trigger:0.3,text:'Rain is hammering down. A car cuts you off on a flooded roundabout. You skid, catch yourself. The app pings: "Estimated arrival: 3 minutes." Your hands are numb.',
      choices:[
        {label:'Push through',desc:'The surge money is real.',fx:{income:20,rating:10,wellbeing:-25,autonomy:-10},flags:{workedInStorm:true},result:'You earned \u20ac9.80. You also nearly crashed twice. The algorithm has no field for "almost fell off bike."'},
        {label:'Finish this, then offline',desc:'One more, then safety.',fx:{income:5,rating:-5,wellbeing:-10,autonomy:5},flags:{selectiveInStorm:true},result:'You delivered and went offline. The algorithm saw you decline 6 orders. It doesn\u2019t know about the flooding underpass.'},
        {label:'Cancel. Go home.',desc:'Your safety matters more.',fx:{income:-10,rating:-10,wellbeing:10,autonomy:15},flags:{loggedOffStorm:true},result:s=>{const x=s.stats.rating<40?'\n\n<em>"Your reliability score is under review."</em>':'';return`You went home. Your rating dropped. The "flexibility" to refuse came with a price.${x}`;}}
      ]},
    shiftEnd:s=>({earned:s.flags.workedInStorm?9.80:(s.flags.selectiveInStorm?9.80:0),orders:s.flags.loggedOffStorm?0:1}),
    insight:{platformCase:'<strong>Why does QuickBite surge during bad weather?</strong>\n\nSurge pricing is supply-and-demand. Without it, orders go unfulfilled. Participation is voluntary. And without couriers in bad weather, vulnerable people lose access to meals.\n\n<span class="source">(Kellogg et al., 2020; Jarrahi et al., 2021)</span>',
      rawlsianLens:'<strong>Formal vs. Substantive Freedom</strong> <span class="source">(Rawls, 1999, pp. 176\u2013180)</span>\n\nIf declining orders degrades your score, which degrades future earnings \u2014 is logging off during a storm really a free choice? The freedom is real on paper. The cost of using it is real in practice.'},
    extNotifs:[{key:'storm_weather',delay:1000},{key:'rent_due',delay:12000}]},
  4:{title:'The Warning',sub:'Thursday',weather:'overcast',mechanism:'Automated Deactivation',fillerCount:2,
    appNotif:()=>{if(S.stats.rating<30)return`${S.playerName}, your account needs attention. Improve soon to keep delivering. This review is automated and final.`;if(S.stats.rating<45)return`Heads-up ${S.playerName}! Your metrics are below community standards. Let\u2019s get those numbers up!`;return`Pro tip ${S.playerName}: Consistent performance unlocks the best orders!`;},
    order:{restaurant:'Golden Wok',cuisine:'Chinese',dist:2.8,pay:4.90,time:15,quality:'Standard'},
    context:s=>{if(s.stats.rating<30)return'<em>"Permanent deactivation. Not appealable."</em> Your income source could vanish.';if(s.stats.rating<45)return'<em>"Flagged for review."</em> What review? By whom?';return'A gentle nudge. But you\u2019ve heard stories about what happens when nudges become warnings.';},
    event:{trigger:0.6,text:s=>{const x=s.flags.contactedSupport?' You\u2019ve been here before.':'';return`The warning banner is still there. No number to call. The courier forum says: "Worked 12-hour days, warning went away." Another: "Did the same. Got deactivated anyway."${x}`;},
      choices:[
        {label:'Go all-in',desc:'Max hours. Push metrics up.',fx:{income:10,rating:15,wellbeing:-20,autonomy:-20},flags:{panicWorked:true},result:'You worked 11 hours. The warning disappeared. Fear works as a management tool.'},
        {label:'Search for appeals',desc:'There must be a human somewhere.',fx:{income:-10,rating:0,wellbeing:-10,autonomy:5},flags:{soughtAppeal:true},result:s=>{const r=s.flags.contactedSupport?' Same scripted response.':'';return`No appeal button. One email: "Responses may take 5\u20137 business days." Your livelihood is at stake.${r}`;}},
        {label:'Look for alternatives',desc:'Don\u2019t depend on one algorithm.',fx:{income:-5,rating:-5,wellbeing:5,autonomy:15},flags:{soughtAlternatives:true},result:'You signed up for two other platforms. Same interface, different colour. But having options changes the power dynamic.'}
      ]},
    shiftEnd:()=>({earned:4.90,orders:1}),
    insight:{platformCase:'<strong>Why is deactivation so vague?</strong>\n\nSpecificity enables gaming. Publishing criteria creates liability. Manual review across 50,000 couriers is impossible.\n\n<span class="source">(Kellogg et al., 2020; Meijerink & Keegan, 2025)</span>',
      rawlsianLens:'<strong>Lexical Priority of Basic Liberties</strong> <span class="source">(Rawls, 1999, pp. 37\u201340)</span>\n\nDue process cannot be sacrificed for efficiency. The question: "would you consent to being fired by an algorithm you cannot question?"'},
    extNotifs:[{key:'deactivation_linkedin',delay:5000},{key:'family_dinner',delay:15000}]},
  5:{title:'The Verdict',sub:'Friday',weather:'clear',mechanism:'The Complete System',fillerCount:2,
    appNotif:()=>{if(S.stats.rating>55)return`Amazing week ${S.playerName}! Premium order access unlocked!`;if(S.stats.rating>35)return`Weekly summary ready, ${S.playerName}! Every day is a chance to grow.`;return`Account review complete, ${S.playerName}. Hang tight.`;},
    order:{restaurant:'Noodle House',cuisine:'Asian Fusion',dist:2.5,pay:5.50,time:14,quality:'Standard'},
    context:s=>{if(s.stats.rating>55)return'Friday. Your rating is solid. The algorithm sees you as reliable.';if(s.stats.rating>35)return'Friday. Not bad enough for deactivation, not good enough for the best orders. Limbo.';return'Friday. Every notification could be the last.';},
    event:{trigger:0.5,text:'Final delivery. The algorithm has processed five days of your data. Your future is being decided by a composite score you\u2019ve never seen.',
      choices:s=>{
        const c=[
          {label:'Complete the delivery',desc:'Finish strong.',fx:s.stats.wellbeing<25?{income:-3,rating:-2,wellbeing:-5,autonomy:-3}:{income:5,rating:5,wellbeing:-3,autonomy:0},flags:{},result:s.stats.wellbeing<25?'Exhaustion caught up. You delivered late.':'Routine delivery. The week is done.'},
          {label:'Let the data speak',desc:'Whatever happens, happens.',fx:{income:0,rating:0,wellbeing:0,autonomy:0},flags:{},result:'You closed the app. The verdict belongs to the system now.'}
        ];
        if(s.flags.soughtAlternatives)c.push({label:'Switch platforms',desc:'Different logo, same algorithm.',fx:{income:0,rating:0,wellbeing:0,autonomy:0},flags:{switchedPlatform:true},result:'Same dispatch, same opaque ratings, same automated deactivation. The problem was the model.'});
        return c;
      }},
    shiftEnd:()=>({earned:5.50,orders:1}),
    insight:{platformCase:'<strong>The System as a Whole</strong>\n\nGig platforms serve millions of meals daily. Coordination at scale requires automation. Many couriers genuinely value flexibility.\n\n<span class="source">(Jarrahi et al., 2021; Kadolkar et al., 2025)</span>',
      rawlsianLens:'<strong>The Veil of Ignorance</strong> <span class="source">(Rawls, 1999, pp. 118\u2013123)</span>\n\nThe three failures \u2014 dispatch that traps newcomers, ratings that can\u2019t be contested, deactivation without due process \u2014 are design choices that would look different if the people governed by them had been consulted.\n\nThat is the dilemma: not whether to have algorithmic management, but whether the specific form could ever be justified to the people it governs most.'},
    extNotifs:s=>{const n=[{key:'news_eu',delay:4000}];if(s.stats.income<30)n.push({key:'low_earnings_2',delay:9000});return n;}}
};

const ENDINGS={
  thriving:{title:'Thriving',text:s=>{let c='';if(s.flags.workedInStorm)c+='You rode through a storm because a number told you to. ';if(s.flags.overworkedForRating)c+='You pushed to exhaustion chasing an opaque score. ';if(s.flags.panicWorked)c+='A vague threat controlled 11 hours of your day. ';return`You made it, ${s.playerName}. Rating is solid.\n\n${c?'But consider the cost: '+c.trim():''}\n\nYou\u2019re winning a game whose rules were written without you.`;}},
  surviving:{title:'Surviving',text:()=>`Still on the platform, ${S.playerName}. Barely.\n\nYou\u2019ve learned the unwritten rules \u2014 not because they were explained, but because breaking them cost you.\n\nThis is the experience of the majority. The quiet grind of working under rules you can feel but never fully see.`},
  deactivated:{title:'Deactivated',text:()=>`<div class="deact-box">Thanks for being part of the QuickBite family, ${S.playerName}! We\u2019ve decided to help you explore new opportunities. Your account has been permanently deactivated. We wish you all the best!</div>\n\nNo phone number. No appeal. No explanation.\n\nSomewhere in a data centre, a function returned <code>false</code>. It did not deliberate. It checked a threshold.\n\nBut the notification wished you well.`},
  walked:{title:'Walked Away',text:()=>`You switch platforms, ${S.playerName}. Different name, same architecture.\n\nThe cold start problem doesn\u2019t belong to QuickBite. It belongs to the model.`}
};

const PG={
  sources:[
    {cite:'Kadolkar, I. et al. (2025). <em>J. Organizational Behavior</em>.',note:'Taxonomy of three platform asymmetries.',used:'Days 1, 2, 5'},
    {cite:'Vanhala, L. et al. (2024). <em>Work, Employment and Society</em>.',note:'Psychosocial harm from algorithmic opacity.',used:'Days 2, 3'},
    {cite:'Meijerink, J. & Keegan, A. (2025). <em>Annual Review of Org. Psych.</em>',note:'The "cold start problem".',used:'Days 1, 4'},
    {cite:'Jarrahi, M.H. et al. (2021). <em>Big Data & Society</em>.',note:'Algorithms as sociotechnical systems.',used:'Days 3, 5'},
    {cite:'Kellogg, K.C. et al. (2020). <em>Acad. of Management Annals</em>, 14(1).',note:'Nominal freedom, real constraint.',used:'Days 2, 3, 4'},
    {cite:'Rawls, J. (1999). <em>A Theory of Justice</em> (Rev. Ed.). Harvard UP.',note:'Veil of ignorance, difference principle, basic liberties.',used:'All days'},
    {cite:'Lehtiniemi, T. & Ruckenstein, M. (2019). <em>Big Data & Society</em>, 6(1).',note:'Worker responses to data-driven governance.',used:'Post-game'}
  ],
  reflections:['Which decision was hardest? What made both options feel legitimate?','Did cascading consequences change how you thought about the system?','The platform\u2019s case is genuinely reasonable. Do those reasons change how you feel after experiencing it from the inside?','If you could redesign one mechanism, what would you change? What would you sacrifice?','Behind the veil of ignorance: what rules would you want?'],
  about:{author:'Diogo Baptista',course:'CME \u2014 Communications and Multimedia Design, 2026',dilemma:'Gig delivery platforms have replaced human managers with algorithms controlling which orders couriers receive, how performance is scored, and whether accounts stay active.',relevance:'Over 28 million EU workers are on digital platforms. The question: could this form of governance be justified to the people it governs?'}
};

// ============================================================
// RENDERING
// ============================================================
function show(id){$$('.screen').forEach(s=>s.classList.remove('active'));$(`#${id}`).classList.add('active');if(id==='scr-game'){switchTab('map');}}

function initTitle(){
  const check=$('#tos-check'),btnNext=$('#btn-next'),btnStart=$('#btn-start');
  check.addEventListener('change',()=>{btnNext.disabled=!check.checked;});
  btnNext.onclick=()=>{$('#ob-step1').classList.remove('active');$('#ob-step2').classList.add('active');setTimeout(()=>$('#ob-name').focus(),300);};
  // Vehicle selection
  $$('.ob-veh').forEach(v=>v.onclick=()=>{$$('.ob-veh').forEach(b=>b.classList.remove('active'));v.classList.add('active');S.vehicle=v.dataset.v;});
  btnStart.onclick=()=>{
    const name=$('#ob-name').value.trim();
    S.playerName=name||'Courier';
    SFX.init();SFX.play('accept');
    S.day=1;S.gameTime=9*60+41;
    Loading.show(1,4500,()=>{show('scr-game');updateStats();updateClock(0);CityMap.init($('#map-canvas'));SFX.startCity();startDay(1);});
  };
}

// ============================================================
// DAY FLOW
// ============================================================
function startDay(d){
  S.day=d;S.todayEarnings=0;
  const shift=SHIFTS[d],phone=$('#phone');
  phone.dataset.weather=shift.weather||'clear';
  const rain=phone.querySelector('.rain-overlay');if(rain)rain.remove();
  if(shift.weather==='rain'){const r=document.createElement('div');r.className='rain-overlay';phone.querySelector('.map-wrap').appendChild(r);SFX.startRain();}else{SFX.stopRain();}
  CityMap.generate(d);CityMap.draw();
  S.gameTime=9*60+41+(d-1)*30;updateClock(0);
  const sd=$('#side-day');if(sd)sd.textContent=`${shift.sub} \u2022 Day ${d}`;
  const splash=$('#day-splash');
  splash.innerHTML=`<div class="ds-day">${shift.sub}</div><div class="ds-title">${shift.title}</div><div class="ds-mech">${shift.mechanism}</div>`;
  splash.classList.add('active');
  setTimeout(()=>{splash.classList.remove('active');setTimeout(()=>{splash.innerHTML='';showAppScreen(d);},400);},2200);
}

function showAppScreen(d){
  const shift=SHIFTS[d],app=$('#app-main');
  const notifText=typeof shift.appNotif==='function'?shift.appNotif(S):shift.appNotif;
  app.innerHTML='';
  const notif=document.createElement('div');notif.className='push-notif';
  notif.innerHTML=`<div class="pn-head"><span class="pn-app">QuickBite</span><span class="pn-time">now</span></div><div class="pn-body">${notifText}</div>`;
  app.appendChild(notif);setTimeout(()=>{notif.classList.add('on');SFX.play('notif');},100);
  const ctx=document.createElement('div');ctx.className='ctx-text';
  ctx.innerHTML=typeof shift.context==='function'?shift.context(S):shift.context;
  app.appendChild(ctx);
  const en=typeof shift.extNotifs==='function'?shift.extNotifs(S):shift.extNotifs;
  if(en)en.forEach(n=>ExtNotif.fire(n.key,n.delay));
  if(S.stats.wellbeing<35&&d>=2)ExtNotif.fire('health_warn',7000);
  if(shift.missedOrder){setTimeout(()=>{const mo=document.createElement('div');mo.className='order-card missed';mo.innerHTML=`<div class="oc-head"><span class="oc-restaurant">${shift.missedOrder.restaurant}</span><span class="oc-cuisine">Premium</span></div><div class="oc-details"><span>${shift.missedOrder.dist}km</span><span class="oc-pay">\u20ac${shift.missedOrder.pay.toFixed(2)}</span></div><div class="oc-missed">${shift.missedOrder.reason}</div>`;app.appendChild(mo);setTimeout(()=>mo.classList.add('on'),50);setTimeout(()=>mo.classList.add('gone'),2500);},1500);}
  setTimeout(()=>runFillerOrders(d,0,shift.fillerCount||0),shift.missedOrder?4500:2500);
}

function runFillerOrders(d,idx,total){if(idx>=total){showOrderCard(d,SHIFTS[d].order,true);return;}showOrderCard(d,getFillerOrder(),false,()=>setTimeout(()=>runFillerOrders(d,idx+1,total),800));}

function showOrderCard(d,order,isMain,onComplete){
  const app=$('#app-main'),o=order,circ=2*Math.PI*20;
  const card=document.createElement('div');card.className='order-card main-order';
  card.innerHTML=`<div class="oc-badge">NEW ORDER</div><div class="oc-head"><span class="oc-restaurant">${o.restaurant}</span><span class="oc-cuisine">${o.cuisine}</span></div><div class="oc-details"><span>${o.dist} km</span><span>~${o.time} min</span><span class="oc-pay ${o.surge?'surge':''}">\u20ac${o.pay.toFixed(2)}${o.surge?' SURGE':''}</span></div><div class="oc-quality">${o.quality}</div><div class="oc-timer-wrap"><svg class="oc-timer-svg" width="56" height="56" viewBox="0 0 56 56"><circle class="oc-timer-track" cx="28" cy="28" r="20"/><circle class="oc-timer-fill" cx="28" cy="28" r="20" stroke-dasharray="${circ}" stroke-dashoffset="0" transform="rotate(-90 28 28)"/><text class="oc-timer-text" x="28" y="28">15</text></svg></div><div class="oc-actions"><button class="oc-decline">Decline</button><button class="oc-accept">Accept</button></div>`;
  app.appendChild(card);setTimeout(()=>{card.classList.add('on');SFX.play('notif');},50);
  let tl=15;const tf=card.querySelector('.oc-timer-fill'),tt=card.querySelector('.oc-timer-text');
  S.timer=setInterval(()=>{tl--;tt.textContent=tl;tf.setAttribute('stroke-dashoffset',-(circ*((15-tl)/15)));if(tl<=5){tf.style.stroke='var(--red)';SFX.play('tick');}if(tl<=0){clearInterval(S.timer);handleDecline(d,card,o,isMain,onComplete);}},1000);
  card.querySelector('.oc-accept').onclick=()=>{clearInterval(S.timer);SFX.play('accept');card.classList.add('accepted');updateClock(5);S.orderLog.push({restaurant:o.restaurant,dist:o.dist,pay:o.pay,status:'completed'});setTimeout(()=>{if(isMain)startDelivery(d,card);else startFillerDelivery(card,o,onComplete);},600);};
  card.querySelector('.oc-decline').onclick=()=>{clearInterval(S.timer);SFX.play('decline');handleDecline(d,card,o,isMain,onComplete);};
}

function handleDecline(d,card,order,isMain,onComplete){
  S.declined++;S.acceptance=Math.max(0,Math.round(S.deliveries/(S.deliveries+S.declined)*100))||0;
  card.classList.add('declined');applyEffects({rating:-3,autonomy:3});updateStats();pulseOrb('rating');
  S.orderLog.push({restaurant:order.restaurant,dist:order.dist,pay:0,status:'declined'});
  setTimeout(()=>{card.remove();const app=$('#app-main');const nudge=document.createElement('div');nudge.className='decline-nudge';nudge.innerHTML=`<div class="dn-label">Acceptance Rate</div><div class="dn-val">${S.acceptance}%</div><div class="dn-warn">Low acceptance may affect future order priority.</div><button class="dn-btn">Continue shift</button>`;app.appendChild(nudge);setTimeout(()=>nudge.classList.add('on'),50);nudge.querySelector('.dn-btn').onclick=()=>{nudge.remove();if(isMain)showOrderCard(d,SHIFTS[d].order,true);else if(onComplete)onComplete();};},500);
}

function startFillerDelivery(card,order,onComplete){
  const app=$('#app-main');card.remove();
  const del=document.createElement('div');del.className='delivery-screen';
  del.innerHTML=`<div class="del-status">Delivering...</div><div class="del-card"><div class="del-route"><div class="del-dot del-from"></div><div class="del-line"><div class="del-progress"></div><div class="del-rider"></div></div><div class="del-dot del-to"></div></div><div class="del-info"><span>${order.restaurant}</span><span>Customer</span></div><div class="del-bar"><div class="del-bar-fill"></div></div></div>`;
  app.appendChild(del);
  const bar=del.querySelector('.del-bar-fill'),prog=del.querySelector('.del-progress'),rider=del.querySelector('.del-rider');
  let p=0;const iv=setInterval(()=>{p+=0.03;bar.style.width=(p*100)+'%';prog.style.width=(p*100)+'%';rider.style.left=(p*100)+'%';CityMap.courierPct=p;CityMap.draw();
    if(p>=1){clearInterval(iv);SFX.play('complete');S.deliveries++;S.earnings+=order.pay;S.todayEarnings+=order.pay;S.acceptance=Math.round(S.deliveries/(S.deliveries+S.declined)*100);applyEffects({income:2,rating:2,wellbeing:-3,autonomy:-2});updateStats();updateClock(order.time||10);
      del.innerHTML='<div class="del-flash">Delivered!</div>';setTimeout(()=>{del.remove();if(onComplete)onComplete();},800);}
  },60);
}

function startDelivery(d,card){
  const shift=SHIFTS[d],app=$('#app-main');card.remove();
  const del=document.createElement('div');del.className='delivery-screen';
  del.innerHTML=`<div class="del-status">Delivering...</div><div class="del-card"><div class="del-route"><div class="del-dot del-from"></div><div class="del-line"><div class="del-progress"></div><div class="del-rider"></div></div><div class="del-dot del-to"></div></div><div class="del-info"><span>${shift.order.restaurant}</span><span>Customer</span></div><div class="del-bar"><div class="del-bar-fill"></div></div></div>`;
  app.appendChild(del);
  const bar=del.querySelector('.del-bar-fill'),prog=del.querySelector('.del-progress'),rider=del.querySelector('.del-rider');
  let p=0,ef=false;const iv=setInterval(()=>{p+=0.015;bar.style.width=(p*100)+'%';prog.style.width=(p*100)+'%';rider.style.left=(p*100)+'%';CityMap.courierPct=p;CityMap.draw();
    if(p>=shift.event.trigger&&!ef){ef=true;clearInterval(iv);updateClock(10);setTimeout(()=>showEvent(d,del),400);}
  },80);
}

// ============================================================
// EVENT: Desktop=right panel, Mobile=dark overlay
// ============================================================
function showEvent(d,delScreen){
  const shift=SHIFTS[d],ev=shift.event;
  const evText=typeof ev.text==='function'?ev.text(S):ev.text;
  const choices=typeof ev.choices==='function'?ev.choices(S):ev.choices;

  if(isDesktop()){
    const panel=$('#panel-right');panel.innerHTML='';
    const sit=document.createElement('div');sit.className='thought-result show';sit.innerHTML=`<div class="tr-label">What's happening</div><div class="tr-text">${evText}</div>`;panel.appendChild(sit);
    choices.forEach((c,i)=>{const tc=document.createElement('div');tc.className='thought-card';tc.dataset.idx=i;tc.innerHTML=`<div class="tc-label">${c.label}</div><div class="tc-desc">${c.desc}</div>`;panel.appendChild(tc);setTimeout(()=>tc.classList.add('show'),200+i*200);tc.onclick=()=>handleChoice(d,delScreen,choices,i,true);});
  } else {
    // Mobile: dark thought overlay
    const mob=$('#mob-thoughts');
    mob.innerHTML=`<div class="mt-situation">${evText}</div>${choices.map((c,i)=>`<div class="mt-card" data-idx="${i}"><div class="mt-card-label">${c.label}</div><div class="mt-card-desc">${c.desc}</div></div>`).join('')}`;
    mob.classList.add('active');
    mob.querySelectorAll('.mt-card').forEach(card=>{card.onclick=()=>handleChoice(d,delScreen,choices,+card.dataset.idx,false);});
  }
}

function handleChoice(d,delScreen,choices,idx,desktop){
  const choice=choices[idx],shift=SHIFTS[d];
  if(desktop){$('#panel-right').querySelectorAll('.thought-card').forEach(tc=>{tc.classList.add('dis');if(+tc.dataset.idx===idx)tc.classList.add('sel');});}
  else{$('#mob-thoughts').querySelectorAll('.mt-card').forEach(c=>{c.classList.add('dis');if(+c.dataset.idx===idx)c.classList.add('sel');});}
  SFX.play('accept');applyEffects(choice.fx,choice.flags);
  S.deliveries++;S.acceptance=Math.round(S.deliveries/(S.deliveries+S.declined)*100);
  const se=shift.shiftEnd(S);S.earnings+=se.earned;S.todayEarnings+=se.earned;
  updateStats();updateClock(15);S.history.push({day:d,choice:choice.label});
  ['income','rating','wellbeing','autonomy'].forEach(k=>pulseOrb(k));
  if(S.stats.income<=0||S.stats.rating<=0||S.stats.wellbeing<=0||S.stats.autonomy<=0){S.ended=true;S.endingType='deactivated';}

  setTimeout(()=>{
    const resultText=typeof choice.result==='function'?choice.result(S):choice.result;
    const btnLabel=S.ended||d===5?'See your ending':'End of shift';
    if(desktop){
      const panel=$('#panel-right');panel.querySelectorAll('.thought-card').forEach(tc=>tc.remove());
      const res=document.createElement('div');res.className='thought-result';res.innerHTML=`<div class="tr-label">What happened</div><div class="tr-text">${resultText}</div><button class="tr-btn">${btnLabel}</button>`;
      panel.appendChild(res);setTimeout(()=>res.classList.add('show'),50);SFX.play('complete');
      res.querySelector('.tr-btn').onclick=()=>{panel.innerHTML='';if(S.ended||d===5)showEndScreen();else showShiftEnd(d);};
    } else {
      const mob=$('#mob-thoughts');mob.innerHTML=`<div class="mt-result"><div class="mt-result-text">${resultText}</div><button class="mt-result-btn">${btnLabel}</button></div>`;
      SFX.play('complete');
      mob.querySelector('.mt-result-btn').onclick=()=>{mob.classList.remove('active');mob.innerHTML='';if(S.ended||d===5)showEndScreen();else showShiftEnd(d);};
    }
  },600);
}

function showShiftEnd(d){
  const shift=SHIFTS[d],app=$('#app-main');app.innerHTML='';S.dailyEarnings[d-1]=S.todayEarnings;
  const s=document.createElement('div');s.innerHTML=`<div class="ss-title-text">Shift Complete</div><div class="ss-day-text">${shift.sub} \u2014 ${shift.title}</div><div class="ss-grid"><div class="ss-stat"><div class="ss-stat-val">\u20ac${S.earnings.toFixed(2)}</div><div class="ss-stat-lbl">Total</div></div><div class="ss-stat"><div class="ss-stat-val">${(S.stats.rating/10).toFixed(1)}</div><div class="ss-stat-lbl">Rating</div></div><div class="ss-stat"><div class="ss-stat-val">${S.acceptance}%</div><div class="ss-stat-lbl">Accept</div></div><div class="ss-stat"><div class="ss-stat-val">${S.deliveries}</div><div class="ss-stat-lbl">Deliveries</div></div></div><button class="ss-insight-btn">Why did the algorithm do this?</button><div class="ss-insight"><div class="ins-section ins-plat"><h4>The Platform's Case</h4><div>${shift.insight.platformCase}</div></div><div class="ins-section ins-rawl"><h4>The Rawlsian Lens</h4><div>${shift.insight.rawlsianLens}</div></div></div><button class="ss-next">${d<5?'Continue to '+SHIFTS[d+1].sub:'See your ending'}</button>`;
  app.appendChild(s);
  s.querySelector('.ss-insight-btn').onclick=function(){const ins=s.querySelector('.ss-insight');ins.classList.toggle('open');this.textContent=ins.classList.contains('open')?'Close insight':'Why did the algorithm do this?';};
  s.querySelector('.ss-next').onclick=()=>{SFX.stopRain();if(d<5)Loading.show(d+1,4500,()=>startDay(d+1));else showEndScreen();};
}

function showEndScreen(){
  SFX.stopRain();SFX.stopCity();
  const type=S.endingType||getEnding();S.endingType=type;const e=ENDINGS[type];show('scr-end');
  $('#end-content').innerHTML=`<div class="end-type">${e.title}</div><div class="end-text">${typeof e.text==='function'?e.text(S):e.text}</div><div class="end-stats"><div class="es"><span>Income</span><b style="color:var(--green)">${S.stats.income}</b></div><div class="es"><span>Rating</span><b style="color:var(--orange)">${S.stats.rating}</b></div><div class="es"><span>Health</span><b style="color:var(--red)">${S.stats.wellbeing}</b></div><div class="es"><span>Freedom</span><b style="color:var(--blue)">${S.stats.autonomy}</b></div></div><div class="end-trans">You just lived five days as a gig courier.<br><em>Now step behind the curtain.</em></div><button class="btn-primary" onclick="showPostGame()">Explore the analysis</button>`;
}

function showPostGame(){
  show('scr-post');
  $('#tp').innerHTML='<h3>The Platform\'s Case</h3><p class="pg-intro">For each scenario, the genuine business argument.</p>'+[1,2,3,4,5].map(d=>`<div class="pg-card"><h4>Day ${d}: ${SHIFTS[d].mechanism}</h4><div>${SHIFTS[d].insight.platformCase}</div></div>`).join('');
  $('#tr').innerHTML='<h3>The Rawlsian Analysis</h3><p class="pg-intro">Each day mapped to a specific Rawlsian concept.</p>'+[1,2,3,4,5].map(d=>`<div class="pg-card rc"><h4>Day ${d}: ${SHIFTS[d].title}</h4><div>${SHIFTS[d].insight.rawlsianLens}</div></div>`).join('');
  $('#tre').innerHTML=`<h3>Reality Check</h3><div class="rc-grid"><div class="rc-item"><h4>Dispatch</h4><p>Most platforms use performance-based dispatch. The "cold start problem" is documented.</p><span class="src">(Meijerink & Keegan, 2025)</span></div><div class="rc-item"><h4>Ratings</h4><p>All major platforms use opaque rating systems. Three documented asymmetries: information, power, and calculative.</p><span class="src">(Kadolkar et al., 2025)</span></div><div class="rc-item"><h4>Deactivation</h4><p>Automated deactivation without human review is standard practice.</p><span class="src">(Vanhala et al., 2024; Kellogg et al., 2020)</span></div></div><div class="rc-closing"><p>These scenarios are structured versions of documented experiences.</p><p class="rc-q">Could the people most affected have consented behind a veil of ignorance?</p></div><h3>Reflection</h3><div class="refl">${PG.reflections.map(r=>`<div class="refl-q">${r}</div>`).join('')}</div><h3>Sources</h3><div class="src-list">${PG.sources.map(s=>`<div class="src-card"><div class="sc-cite">${s.cite}</div><div class="sc-note">${s.note}</div><div class="sc-used">Used: ${s.used}</div></div>`).join('')}</div><h3>About</h3><div class="abt"><p><strong>${PG.about.author}</strong> \u2014 ${PG.about.course}</p><p>${PG.about.dilemma}</p><p>${PG.about.relevance}</p><p class="abt-end">This game put you in a courier\u2019s position. But you could close the browser. They can\u2019t close the algorithm.</p></div><div style="text-align:center;padding:2rem"><button class="btn-secondary" onclick="location.reload()">Play again</button></div>`;
  switchPgTab('platform');
}
function switchPgTab(t){$$('.pt-btn').forEach(b=>b.classList.toggle('active',b.dataset.t===t));$$('.pt-pane').forEach(c=>c.classList.toggle('active',c.id==={platform:'tp',rawls:'tr',reality:'tre'}[t]));}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded',()=>{
  initTitle();
  $$('.pt-btn').forEach(b=>b.onclick=()=>switchPgTab(b.dataset.t));
  $('#sound-btn').onclick=()=>SFX.toggle();
  $$('.bn-item').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
});
