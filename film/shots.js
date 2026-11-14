(function(){
const G=window.G,R=G.rig,S=G.sets,U=G.ui,clamp=G.clamp,lerp=G.lerp;
G.TE=42.84;G.END=43.25;G.A={l2:1000};
G.CARDS=[['DIA 1',3.65],['DIA 2',12.25],['DIA 3',19.75]];
G.CHAT=[[4,'[SISTEMA] INSTINTO SUPERIOR ATIVADO'],[13,'[SISTEMA] VELOCIDADE: MAX'],[20,'[SISTEMA] 10 INIMIGOS'],[31,'[SISTEMA] PODER MÁXIMO'],[39,'[SISTEMA] DESVIO AUTOMÁTICO']];
G.TOASTS=[[4,2.2,'INSTINTO ATIVADO','#a4eeff','!'],[13,2,'VELOCIDADE +999','#64ffbb','!'],[30.5,2,'PODER MÁXIMO','#ffd23f','!']];
G.HITS=[[3.7,12],[8.5,16],[13,12],[20,15],[30.5,24],[35,38],[39,15]];
G.hudState=t=>({t0:0,label:'PODER',value:Math.round(100+Math.max(0,t-3)*25),icon:'fps',color:'#b8f6ff'});
G.clock=t=>t<12?'07:00':t<20?'08:00':t<30?'12:00':'18:00';
const kid=(x,y,t,o={})=>Object.assign({who:'kid',x,y,t,s:1.18,seed:2,eyes:'normal',mouth:'grin',armL:.2,armR:.2},o);
const mom=(x,y,t,o={})=>Object.assign({who:'mom',x,y,t,s:1.05,seed:5,eyes:'normal',mouth:'grin'},o);
function aura(ctx,x,y,t,p=1){ctx.save();ctx.translate(x,y-300);for(let i=0;i<12;i++){let a=i*Math.PI/6+t*.9,r=210+25*Math.sin(t*8+i);ctx.beginPath();ctx.moveTo(Math.cos(a)*r,Math.sin(a)*r*1.8);ctx.lineTo(Math.cos(a+.14)*(r+90*p),Math.sin(a+.14)*(r+110*p)*1.8);ctx.lineTo(Math.cos(a+.28)*r,Math.sin(a+.28)*r*1.8);ctx.fillStyle=i%2?'#70dbff88':'#e9faff99';ctx.fill();}ctx.restore();}
function drawKid(ctx,x,y,t,o={}){let p=kid(x,y,t,o);if(o.power!==false)aura(ctx,x,y,t,o.max?1.6:0.6);R.draw(ctx,p);if(o.power!==false){ctx.save();ctx.fillStyle='#d7f9ff';for(let d of [-1,1]){ctx.beginPath();ctx.ellipse(x+d*42,y-475*(p.s||1),18,10,0,0,Math.PI*2);ctx.fill()}ctx.restore();}return p;}
function speed(ctx,t){ctx.save();for(let i=0;i<17;i++){let x=((i*171+t*900)%1500)-220,y=200+(i*131)%1400;ctx.strokeStyle=i%2?'#ffffff88':'#6feeffaa';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-230,y+12);ctx.stroke()}ctx.restore()}
function captionTop(ctx,s){G.text(ctx,s,540,260,86,'#fff',{lw:12,maxW:930,shadow:10})}
function shot(t0,t1,world){return {t0,t1,cam:[[t0,540,960,1],[t1,540,930,1.06]],world};}
G.SHOTS=[
shot(0,3.6,(c,t)=>{S.game(c,t);speed(c,t);drawKid(c,540,1320,t,{s:1.48,armL:2.2,armR:2.2,eyes:'huge',mouth:'o',max:true});captionTop(c,'INSTINTO SUPERIOR!');}),
shot(3.6,7.8,(c,t)=>{S.bedroom(c,t);drawKid(c,540,1410,t,{s:1.35,eyes:'huge',mouth:'o',armL:1.4,armR:1.4});captionTop(c,'DIA 1');}),
shot(7.8,12.2,(c,t)=>{S.kitchen(c,t);R.draw(c,mom(190,1530,t,{armR:2.1,eyes:'narrow',brows:'angry'}));let x=630+Math.sin(t*12)*180;drawKid(c,x,1470,t,{s:1.15,rot:Math.sin(t*13)*.12,eyes:'huge',mouth:'o'});G.text(c,'CHINELO!',540,450,90,'#ffdb55',{lw:12});speed(c,t);}),
shot(12.2,16.2,(c,t)=>{S.classroom(c,t);speed(c,t);drawKid(c,300+Math.sin(t*5)*230,1510,t,{s:1.1,armL:1.7,armR:1.5,legL:1,legR:.8});captionTop(c,'DIA 2');}),
shot(16.2,19.7,(c,t)=>{S.street(c,t);speed(c,t);for(let j=0;j<4;j++){c.save();c.globalAlpha=.13+j*.1;R.draw(c,kid(180+j*210,1540,t,{s:1.1,legL:1.2,legR:.8,armL:1.6,armR:1.4}));c.restore()}drawKid(c,780,1490,t,{s:1.2,legL:1,legR:1.1,armL:1.8,armR:1.6});}),
shot(19.7,26.8,(c,t)=>{S.game(c,t);for(let j=0;j<7;j++){let x=100+(j%4)*285,y=1250+Math.floor(j/4)*340;R.draw(c,{who:'teacher',x,y,t,s:.56,seed:j+10,armR:1.7,armL:1.8,eyes:'narrow',mouth:'scream'});}speed(c,t);drawKid(c,520+Math.sin(t*15)*120,1350,t,{s:1.18,eyes:'happy',mouth:'grin',armL:1.3,armR:1.8});captionTop(c,'DIA 3');}),
shot(26.8,30.1,(c,t)=>{S.game(c,t);drawKid(c,540,1380,t,{s:1.3,armL:2,armR:2,eyes:'star'});U.subscribe(c,t,26.9,28.1,540,760);}),
shot(30.1,33.5,(c,t)=>{S.burst(c,t,'#2c52bd','#8eeeff');drawKid(c,540,1470,t,{s:1.4,armL:2.3,armR:2.3,eyes:'huge',max:true});captionTop(c,'PODER MÁXIMO');}),
shot(33.5,36.5,(c,t)=>{S.game(c,t);drawKid(c,290,1520,t,{s:1.13,armL:2.2,armR:2.2,max:true});let r=140+(t-33.5)*230; c.save();c.shadowColor='#55e9ff';c.shadowBlur=70;c.fillStyle='#c3faff';c.beginPath();c.arc(580,1050,Math.min(360,r),0,Math.PI*2);c.fill();c.restore();c.fillStyle='#62dfffbb';c.fillRect(550,920,600,260);captionTop(c,'KAMEHAMEHA!');}),
shot(36.5,39.2,(c,t)=>{S.kitchen(c,t);R.draw(c,mom(310,1540,t,{armL:2.2,armR:2.2,eyes:'happy'}));drawKid(c,720,1540,t,{s:1.1,eyes:'huge',mouth:'o'});captionTop(c,'UM PROBLEMINHA...');}),
shot(39.2,42.84,(c,t)=>{S.kitchen(c,t);R.draw(c,mom(370,1550,t,{armL:2.4,armR:2.4,eyes:'huge',mouth:'o'}));let x=720+Math.sin(t*15)*200;speed(c,t);drawKid(c,x,1530,t,{s:1.1,eyes:'huge',mouth:'scream',armL:2.1,armR:2.1});captionTop(c,'NÃO CONSIGO ABRAÇAR!');})
];
})();