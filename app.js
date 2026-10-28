const UF=41226.39; // valor UF 27-oct-2026 (serie SII)
const TMC=[[50,41.02],[200,34.02],[5000,30.03]]; // CMF cert. 10/2026, vigente desde 15-oct-2026 (>=90 días, anual lineal)
const BANKS=[
{n:"Santander",r:1.39,t:"Ejemplo publicado: $10.000.000 a 48 cuotas, tasa 1,39% mensual, CAE 17,38% (incluye seguros). Fuente: simulación del banco reproducida por Rankia y Autofact."},
{n:"BancoEstado",r:2.19,t:"Ejemplo publicado: mismo crédito a 48 cuotas con tasa 2,19% mensual y CAE 25,66% (Autofact). Otras fuentes citan tasas desde 20,5% anual con abono de sueldo."},
{n:"BCI",r:1.60,e:1,t:"Estimación. BCI muestra desde 0,89% mensual en ofertas online preferenciales y ejemplos de hasta 2,96% mensual ($1.000.000 a 12 meses). Pide tu simulación."},
{n:"Banco de Chile",r:1.50,e:1,t:"Estimación: no encontré una tasa publicada reciente."},
{n:"Scotiabank",r:1.45,t:"Comparador secundario (jun-2026)."},
{n:"Banco Internacional",r:1.42,t:"Comparador secundario (jun-2026)."},
{n:"BICE",r:1.56,t:"Comparador secundario (jun-2026). Un ejemplo del SERNAC (oct-2025) mostraba 1,25% mensual en $1.000.000 a 12 cuotas."},
{n:"Coopeuch",r:1.29,t:"Comparador secundario (jun-2026). Cooperativa: para socios."}];
const $=id=>document.getElementById(id);
const clp=v=>"$"+Math.round(v).toLocaleString("es-CL");
const pct=v=>(v*100).toLocaleString("es-CL",{maximumFractionDigits:2})+"%";
const bank=$("bank");let sortBy="c",last="",snap=null;
BANKS.forEach((b,i)=>bank.add(new Option(b.n+(b.e?" (est.)":""),i)));
function calc(P,n,r,ins,fee,g,no,tm){
  r/=100;ins/=100;fee/=100;
  const tr=tm?Math.min(0.00066*n,0.008):0;           // impuesto de timbres
  const Pb=(P*(1+fee)+no)/(1-tr);                    // monto bruto financiado
  const base=r>0?Pb*r/(1-Math.pow(1+r,-n)):Pb/n;
  const cb=base*Math.pow(1+r,g),pay=cb+Pb*ins;
  const fl=[P];for(let k=1;k<=n+g;k++)fl.push(k<=g?0:-pay);
  let lo=0,hi=1;
  for(let i=0;i<100;i++){const m=(lo+hi)/2;let v=0;fl.forEach((c,k)=>v+=c/Math.pow(1+m,k));v>0?hi=m:lo=m}
  const i=(lo+hi)/2;
  return{Pb,tax:Pb*tr,cb,pay,total:pay*n,cae:i*12,nom:r*12};
}
function tmcFor(P){const u=P/UF;for(const [m,t] of TMC)if(u<=m)return{t,u};return{t:null,u}}
function sched(P,r,g,cb,extra,insM){
  r/=100;let s=P*Math.pow(1+r,g),rows=[],tot=0,ti=0;
  for(let k=1;k<=1200&&s>0.5;k++){
    const it=s*r;let cap=cb+extra-it;if(cap>s)cap=s;
    const pay=cap+it+insM;s-=cap;tot+=pay;ti+=it;rows.push({k,pay,cap,it,s:Math.max(0,s)});
  }
  return{rows,tot,ti};
}
function chart(a,b,P){
  const W=600,H=210,pl=48,pb=24,n=Math.max(a.length,b.length);
  const x=k=>pl+(W-pl-10)*k/Math.max(n,1),y=v=>10+(H-pb-10)*(1-v/P);
  const pts=r=>"M"+x(0)+" "+y(P)+r.map(o=>" L"+x(o.k)+" "+y(o.s)).join("");
  let g="";[0,.5,1].forEach(t=>{g+=`<line x1="${pl}" x2="${W-10}" y1="${y(P*t)}" y2="${y(P*t)}" stroke="var(--bd)"/><text x="${pl-6}" y="${y(P*t)+4}" text-anchor="end" font-size="10" fill="var(--mu)">${(P*t/1e6).toLocaleString("es-CL",{maximumFractionDigits:1})}M</text>`});
  g+=`<text x="${pl}" y="${H-6}" font-size="10" fill="var(--mu)">Mes 0</text><text x="${W-10}" y="${H-6}" font-size="10" text-anchor="end" fill="var(--mu)">Mes ${n}</text>`;
  g+=`<path d="${pts(a)}" fill="none" stroke="var(--ac)" stroke-width="2.5"/>`;
  if(b!==a)g+=`<path d="${pts(b)}" fill="none" stroke="var(--ac2)" stroke-width="2.5" stroke-dasharray="6 4"/>`;
  $("ch").innerHTML=g;
}
function update(){
  const P=+$("amount").value||0,n=+$("n").value,r=+$("rate").value,ins=+$("ins").value,fee=+$("fee").value,g=+$("grace").value,inc=+$("inc").value||0,ex=+$("extra").value||0,no=+$("not").value||0,tm=$("tim").value=="1";
  $("mv").textContent=clp(P);$("nv").textContent=n+" cuotas";
  if(P<=0)return;
  const R=calc(P,n,r,ins,fee,g,no,tm),insM=R.Pb*ins/100;
  $("cuota").textContent=clp(R.pay);$("total").textContent=clp(R.total);$("costo").textContent=clp(R.total-P);
  $("cae").textContent=pct(R.cae);$("tae").textContent=pct(R.nom);
  const ip=Math.max(0,Math.min(100,P/R.total*100));$("sp1").style.width=ip+"%";$("sp2").style.width=(100-ip)+"%";
  const A=sched(R.Pb,r,g,R.cb,0,insM),B=ex>0?sched(R.Pb,r,g,R.cb,ex,insM):A;
  const tm2=tmcFor(P),mt=$("mTmc");mt.hidden=false;
  if(tm2.t===null){mt.className="msg";mt.textContent="Para este monto (más de 5.000 UF) aplican otros tramos de tasa máxima. Revisa la CMF."}
  else if(R.nom*100>tm2.t){mt.className="msg bad";mt.textContent=`Tu tasa anual (${(R.nom*100).toFixed(2)}%) supera la tasa máxima convencional vigente (${tm2.t}% para este monto). Un banco no puede cobrarla.`}
  else{mt.className="msg ok";mt.textContent=`Tu monto equivale a ${tm2.u.toFixed(0)} UF. Tu tasa anual (${(R.nom*100).toFixed(2)}%) está bajo la tasa máxima convencional de ${tm2.t}% anual.`}
  // sueldo
  const mi=$("mInc");
  if(inc>0){const q=R.pay/inc*100;mi.hidden=false;mi.className="msg "+(q<=30?"ok":q<=40?"wa":"bad");
    mi.textContent=`Esta cuota es el ${q.toFixed(0)}% de tu sueldo. `+(q<=30?"Es una carga razonable.":q<=40?"Es alta: cuida que no se sume a otras deudas.":"Es muy alta y aumenta el riesgo de atrasarte.")}else mi.hidden=true;
  // abono extra
  const me=$("mEx");
  if(ex>0){const ms=A.rows.length-B.rows.length,sv=A.tot-B.tot;me.hidden=false;
    me.textContent=`Con ${clp(ex)} extra al mes terminas ${ms} ${ms==1?"mes":"meses"} antes y ahorras ${clp(Math.max(0,sv))} en total.`}else me.hidden=true;
  chart(A.rows,B.rows,R.Pb*Math.pow(1+r/100,g));
  $("tb").innerHTML=B.rows.map(o=>`<tr><td>${o.k}</td><td>${clp(o.pay)}</td><td>${clp(o.cap)}</td><td>${clp(o.it)}</td><td>${clp(o.s)}</td></tr>`).join("");
  // comparar
  const L=BANKS.map((b,i)=>({...b,i,R:calc(P,n,b.r,ins,fee,g,no,tm)}));
  L.sort((a,b)=>sortBy=="c"?a.R.pay-b.R.pay:a.R.cae-b.R.cae);
  const key=o=>sortBy=="c"?o.R.pay:o.R.cae,mx=Math.max(...L.map(key));
  $("cmp").innerHTML=`<div class="cr h"><span>Banco</span><span></span><span style="text-align:right">Cuota</span><span>CAE</span></div>`+
   L.map((b,k)=>`<div class="cr${b.i==bank.value?" sel":""}" data-i="${b.i}"><span>${b.n}${k==0?"<em>mejor</em>":""}</span><div class="t"><i style="width:${key(b)/mx*100}%"></i></div><b>${clp(b.R.pay)}</b><span>${pct(b.R.cae)}</span></div>`).join("");
  document.querySelectorAll(".cr[data-i]").forEach(e=>e.onclick=()=>{bank.value=e.dataset.i;setRate();update()});
  last=`CalcuCuota · Crédito ${BANKS[bank.value].n}: ${clp(P)} a ${n} cuotas, tasa ${r}% mensual. Cuota ${clp(R.pay)}, total ${clp(R.total)}, CAE estimado ${pct(R.cae)}.`;
  snap={bank:BANKS[bank.value].n,P,n,r,ins,fee,g,no,tm,inc,ex,R,rows:B.rows,cmp:L,msgs:["mTmc","mInc","mEx"].map(i=>$(i)).filter(e=>!e.hidden).map(e=>e.textContent)};
  try{localStorage.setItem("cred",JSON.stringify({a:P,n,b:bank.value,i:ins,f:fee,in:inc}))}catch(e){}
}
function setRate(){const b=BANKS[bank.value];$("rate").value=b.r;$("bsrc").textContent=(b.e?"Estimación. ":"")+b.t}
bank.onchange=()=>{setRate();update()};
$("amountR").oninput=e=>{$("amount").value=e.target.value;update()};
$("amount").oninput=e=>{$("amountR").value=e.target.value;update()};
["n","rate","ins","fee","grace","inc","extra","not","tim"].forEach(id=>$(id).oninput=update);
$("s1").onclick=()=>{sortBy="c";$("s1").className="on";$("s2").className="";update()};
$("s2").onclick=()=>{sortBy="e";$("s2").className="on";$("s1").className="";update()};
const isDark=()=>getComputedStyle(document.documentElement).colorScheme.includes("dark");
const ICON={moon:'<svg viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',sun:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'};
const paintTg=()=>{$("tg").innerHTML=isDark()?ICON.sun:ICON.moon};
$("tg").onclick=()=>{document.documentElement.dataset.theme=isDark()?"light":"dark";paintTg()};
paintTg();
try{const s=JSON.parse(localStorage.getItem("cred")||"null");if(s){$("amount").value=s.a;$("amountR").value=s.a;$("n").value=s.n;bank.value=s.b;$("ins").value=s.i;$("fee").value=s.f;if(s.in)$("inc").value=s.in}}catch(e){}
setRate();update();

/* ===== Resumen en PDF (sin librerías externas) ===== */
function makePDF(s){
  const W=595,H=842,M=48,pages=[[]];let y=H-M;
  const esc=t=>String(t).replace(/[–—]/g,"-").replace(/[’‘]/g,"'").replace(/≈/g,"~").replace(/→/g,"->").replace(/[^\x20-\xFF]/g,"?").replace(/[\\()]/g,"\\$&");
  const add=(t,f=1,sz=10,gap=4)=>{const lh=sz+gap;if(y-lh<M){pages.push([]);y=H-M}y-=lh;pages[pages.length-1].push(`BT /F${f} ${sz} Tf ${M} ${y} Td (${esc(t)}) Tj ET`)};
  const wrap=(t,w=95)=>{const out=[];let l="";String(t).split(" ").forEach(p=>{if((l+" "+p).trim().length>w){out.push(l);l=p}else l=(l+" "+p).trim()});if(l)out.push(l);return out};
  const para=(t,sz=10)=>wrap(t).forEach(l=>add(l,1,sz,3));
  const kv=(a,b)=>add(a.padEnd(32)+b,3,10,3);
  const sec=t=>{y-=8;add(t,2,12,5)};
  const m=clp,R=s.R;
  add("CalcuCuota",2,22,6);
  add("Resumen de tu simulación de crédito · "+new Date().toLocaleDateString("es-CL"),1,10,10);
  sec("Datos del crédito");
  kv("Banco:",s.bank);kv("Monto que recibes:",m(s.P));kv("Número de cuotas:",s.n);
  kv("Tasa mensual:",String(s.r).replace(".",",")+"%");kv("Primera cuota en:",(s.g+1)*30+" días");
  kv("Seguro mensual:",String(s.ins).replace(".",",")+"%");kv("Comisión inicial:",String(s.fee).replace(".",",")+"%");kv("Gastos notariales:",m(s.no));
  kv("Impuesto de timbres:",s.tm?"Sí":"No");
  if(s.inc)kv("Sueldo líquido:",m(s.inc));
  if(s.ex)kv("Abono extra mensual:",m(s.ex));
  sec("Resultado");
  kv("Cuota mensual:",m(R.pay));kv("Total a pagar:",m(R.total));kv("Costo del crédito:",m(R.total-s.P));
  kv("CAE estimado:",pct(R.cae));kv("Tasa anual (mensual x 12):",pct(R.nom));
  kv("Monto bruto financiado:",m(R.Pb));kv("Impuesto de timbres:",m(R.tax));
  if(s.msgs.length){sec("Observaciones");s.msgs.forEach(t=>{para("- "+t);})}
  sec("Comparación de bancos (mismo monto y plazo)");
  add("Banco".padEnd(22)+"Cuota".padStart(12)+"CAE".padStart(9)+"Total".padStart(14),3,10,3);
  s.cmp.forEach(b=>add((b.n+(b.e?" (est.)":"")).padEnd(22)+m(b.R.pay).padStart(12)+pct(b.R.cae).padStart(9)+m(b.R.total).padStart(14),3,10,3));
  sec("Tabla de amortización");
  add("Cuota".padEnd(7)+"Pago".padStart(12)+"Capital".padStart(12)+"Interés".padStart(12)+"Saldo".padStart(13),3,10,3);
  s.rows.forEach(o=>add(String(o.k).padEnd(7)+m(o.pay).padStart(12)+m(o.cap).padStart(12)+m(o.it).padStart(12)+m(o.s).padStart(13),3,10,2));
  sec("Datos usados y avisos");
  para("UF: $41.226,39 (27-oct-2026). Tasa máxima convencional vigente desde el 15-oct-2026 (CMF): 41,02% hasta 50 UF, 34,02% hasta 200 UF, 30,03% hasta 5.000 UF. Impuesto de timbres: 0,066% mensual, tope 0,8% (DL 3.475).",9);
  para("Las tasas por banco son referencias tomadas de ejemplos publicados y comparadores; las marcadas (est.) son estimaciones. La tasa y el CAE definitivos los informa el banco en su cotización. CalcuCuota es independiente, no pertenece a ningún banco y no constituye oferta ni asesoría financiera.",9);
  const kids=pages.map((_,i)=>`${6+2*i} 0 R`).join(" ");
  let out="%PDF-1.4\n";const off=[];
  const put=(id,b)=>{off[id]=out.length;out+=`${id} 0 obj\n${b}\nendobj\n`};
  put(1,"<< /Type /Catalog /Pages 2 0 R >>");
  put(2,`<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>`);
  put(3,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  put(4,"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  put(5,"<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>");
  pages.forEach((p,i)=>{const c=p.join("\n");
    put(6+2*i,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${7+2*i} 0 R >>`);
    put(7+2*i,`<< /Length ${c.length} >>\nstream\n${c}\nendstream`)});
  const n=5+2*pages.length,x=out.length;
  out+=`xref\n0 ${n+1}\n0000000000 65535 f \n`+Array.from({length:n},(_,k)=>String(off[k+1]).padStart(10,"0")+" 00000 n \n").join("")+`trailer\n<< /Size ${n+1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  return new Blob([Uint8Array.from(out,ch=>ch.charCodeAt(0)&255)],{type:"application/pdf"});
}
async function downloadPDF(){
  if(!snap)return;
  const blob=makePDF(snap),name="CalcuCuota-resumen.pdf",b=$("pdf");
  const say=t=>{b.textContent=t;setTimeout(()=>b.textContent="Descargar resumen (PDF)",2000)};
  let d=null;
  try{if(typeof claude!=="undefined"&&claude.use)d=await claude.use("downloads")}catch(e){}
  if(d){try{await d.save({filename:name,data:blob});say("¡Listo!")}catch(e){if(!e||e.code!=="declined")say("No se pudo descargar")}return}
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.append(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),3000);say("¡Listo!");
}
$("pdf").onclick=downloadPDF;
