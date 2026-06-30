<!DOCTYPE html>
<html lang="fr">
<head>
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="noindex, nofollow">
<meta charset="UTF-8">
<title>Prêt clé / badge — Aura Sentinelle</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="global.css">
<style>
body { margin:0; padding:16px; background:radial-gradient(circle at top,#101a2e,#080b14 60%); color:#e8ebf0; font-family:system-ui,sans-serif; }
.bar { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:14px; }
.bar h1 { font-size:1.3rem; margin:0; flex:1; min-width:200px; display:flex; align-items:center; gap:8px; }
.btn { background:#16203a; border:1px solid #283042; color:#e8ebf0; border-radius:8px; padding:8px 13px; cursor:pointer; font-size:.85rem; text-decoration:none; display:inline-flex; align-items:center; gap:6px; }
.btn:hover { background:#1d2942; }
.btn.primary { background:linear-gradient(135deg,#f59e0b,#b45309); border:none; color:#fff; font-weight:700; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media(max-width:880px){ .grid{ grid-template-columns:1fr; } }
.card { background:#0e1626; border:1px solid #232c40; border-radius:14px; padding:16px; }
.card h2 { font-size:1rem; margin:0 0 12px; color:#fcd34d; }
.cats { display:flex; gap:6px; margin-bottom:12px; flex-wrap:wrap; }
.cat { flex:1; min-width:74px; padding:9px 6px; border-radius:8px; border:1px solid #283042; background:#111b2e; cursor:pointer; font-size:.82rem; text-align:center; font-weight:600; }
.cat.active { background:#3a2e12; border-color:#f59e0b; color:#fde68a; }
label { display:block; font-size:.82rem; margin-top:10px; font-weight:600; opacity:.9; }
input, select { width:100%; box-sizing:border-box; padding:9px; margin-top:4px; background:#0a1120; border:1px solid #283042; border-radius:8px; color:#e8ebf0; font-size:.9rem; }
.sens-row { display:flex; gap:8px; margin-top:14px; }
.sens-row .btn { flex:1; justify-content:center; }
.sens-row .out { background:linear-gradient(135deg,#f59e0b,#b45309); border:none; color:#fff; font-weight:700; }
.sens-row .in { background:linear-gradient(135deg,#10b981,#047857); border:none; color:#fff; font-weight:700; }
.scan { background:#0a1120; border:1px dashed #f59e0b; border-radius:8px; padding:10px; margin-bottom:10px; }
.board { display:flex; flex-direction:column; gap:7px; max-height:300px; overflow-y:auto; }
.item { padding:9px 11px; border-radius:9px; background:#0a1120; border:1px solid #1d2740; border-left:3px solid #f59e0b; font-size:.86rem; cursor:pointer; }
.item.over { border-left-color:#ef4444; }
.item:hover { background:#111c30; }
.item .t { display:flex; justify-content:space-between; gap:8px; }
.item .nm { font-weight:700; }
.item .meta { font-size:.74rem; opacity:.72; margin-top:3px; }
.counters { display:flex; gap:8px; margin-bottom:10px; }
.cc { flex:1; background:#0a1120; border:1px solid #232c40; border-radius:10px; padding:8px; text-align:center; }
.cc .n { font-size:1.4rem; font-weight:800; color:#f59e0b; }
.cc .l { font-size:.7rem; opacity:.75; }
.logsearch { display:flex; gap:8px; margin-bottom:10px; }
.logsearch input { margin-top:0; }
.log { max-height:260px; overflow-y:auto; }
.entry { padding:8px 11px; border-radius:9px; margin-bottom:7px; background:#0a1120; border:1px solid #1d2740; border-left:3px solid #283042; font-size:.84rem; }
.entry.pret { border-left-color:#f59e0b; } .entry.retour { border-left-color:#10b981; }
.entry .meta { font-size:.73rem; opacity:.7; margin-top:3px; }
.empty { opacity:.6; text-align:center; padding:18px; font-size:.85rem; }
#toast { position:fixed; bottom:24px; left:50%; transform:translateX(-50%); background:#111; padding:12px 22px; border-radius:10px; opacity:0; transition:.3s; pointer-events:none; z-index:999; }
#toast.show { opacity:1; }
.hint { font-size:.78rem; opacity:.8; background:rgba(245,158,11,.08); border:1px solid rgba(245,158,11,.3); border-radius:8px; padding:9px 11px; margin-bottom:10px; line-height:1.5; }
</style>
</head>
<body>

<div class="bar">
    <h1>🔑 Prêt clé / badge <span style="font-size:.8rem;opacity:.65;font-weight:500" id="svcLbl"></span></h1>
    <button class="btn" onclick="exportCSV()">⬇️ Export CSV</button>
    <a class="btn" href="index.html">← Retour</a>
</div>

<div class="grid">
    <!-- ENREGISTRER -->
    <div class="card">
        <h2>➕ Enregistrer un prêt / retour</h2>
        <div class="hint">Prête une clé, un badge ou du matériel à une personne. Le retour se fait en cliquant l'objet sorti (colonne de droite) ou en scannant son code.</div>

        <div class="scan">
            <label style="margin-top:0">🔖 Scan / saisie rapide du code</label>
            <input type="text" id="scanField" placeholder="Scanner le code de l'objet, puis Entrée" autocomplete="off">
        </div>

        <div class="cats" id="cats">
            <div class="cat active" data-cat="cle"      onclick="setCat('cle')">🔑 Clé</div>
            <div class="cat" data-cat="badge"    onclick="setCat('badge')">🎫 Badge</div>
            <div class="cat" data-cat="radio"    onclick="setCat('radio')">📻 Radio</div>
            <div class="cat" data-cat="vehicule" onclick="setCat('vehicule')">🚗 Véhicule</div>
            <div class="cat" data-cat="autre"    onclick="setCat('autre')">📦 Autre</div>
        </div>

        <label>Identifiant de l'objet *</label>
        <input type="text" id="f_identifiant" placeholder="Ex : Clé local technique, Badge B12, Talkie 3" autocomplete="off">
        <label>Emprunteur *</label>
        <input type="text" id="f_emprunteur" placeholder="Nom de la personne" autocomplete="off">
        <label>Société / service (optionnel)</label>
        <input type="text" id="f_societe" placeholder="Société ou service" autocomplete="off">
        <label>Motif (optionnel)</label>
        <input type="text" id="f_motif" placeholder="Raison du prêt" autocomplete="off">

        <div class="sens-row">
            <button class="btn out" onclick="enregistrer('pret')">↑ PRÊT (sortie)</button>
            <button class="btn in" onclick="enregistrer('retour')">↓ RETOUR</button>
        </div>
    </div>

    <!-- OBJETS SORTIS + JOURNAL -->
    <div class="card">
        <h2>📤 Objets actuellement prêtés</h2>
        <div class="counters" id="counters"></div>
        <div class="board" id="board"><div class="empty">Chargement…</div></div>

        <h2 style="margin-top:14px">📋 Journal — traçabilité</h2>
        <div class="logsearch">
            <input type="text" id="searchField" placeholder="🔍 Rechercher (objet, emprunteur…)" oninput="renderLog()">
        </div>
        <div class="log" id="log"></div>
    </div>
</div>

<div id="toast"></div>

<script src="vendor/supabase.js" crossorigin="anonymous"></script>
<script src="supabaseClient.js"></script>
<script src="tenant.js"></script>
<script src="global.js"></script>
<script>
const OVERSTAY_H = 12; // un objet prêté depuis +12h est signalé
let categorie = "cle";
let journal = [];

const TYPE_LBL = { cle:"🔑 Clé", badge:"🎫 Badge", radio:"📻 Radio", vehicule:"🚗 Véhicule", autre:"📦 Autre" };

function showToast(m){ const t=document.getElementById("toast"); t.textContent=m; t.classList.add("show"); setTimeout(()=>t.classList.remove("show"),2800); }
function setCat(c){ categorie=c; document.querySelectorAll(".cat").forEach(el=>el.classList.toggle("active",el.dataset.cat===c)); }

/* Statut des objets : un objet (type+identifiant) est "sorti" si son dernier
   mouvement est un prêt sans retour postérieur. */
function getEnCours(){
    const etat={}; // cle -> {row}
    const key = r => (r.type_objet||"")+"|"+((r.identifiant||"").toLowerCase().trim());
    [...journal].reverse().forEach(r=>{ // ancien -> récent
        const k=key(r);
        if(r.sens==="pret") etat[k]={ type:r.type_objet, identifiant:r.identifiant, emprunteur:r.emprunteur, societe:r.societe, motif:r.motif, since:r.created_at };
        else if(r.sens==="retour") delete etat[k];
    });
    return Object.values(etat);
}

async function enregistrer(sens){
    const identifiant=document.getElementById("f_identifiant").value.trim();
    const emprunteur=document.getElementById("f_emprunteur").value.trim();
    if(!identifiant){ showToast("⚠️ Indique l'identifiant de l'objet"); return; }
    if(sens==="pret" && !emprunteur){ showToast("⚠️ Indique l'emprunteur"); return; }
    const agent=localStorage.getItem("nom")||"—";
    const row={ type_objet:categorie, identifiant, sens, emprunteur:emprunteur||null,
        societe:document.getElementById("f_societe").value.trim()||null,
        motif:document.getElementById("f_motif").value.trim()||null, agent, meta:{} };
    try{
        const { error } = await supabaseClient.from("prets_materiel").insert(row);
        if(error) throw error;
        showToast(sens==="pret" ? "↑ Prêt enregistré" : "↓ Retour enregistré");
        ["f_identifiant","f_emprunteur","f_societe","f_motif"].forEach(id=>document.getElementById(id).value="");
        document.getElementById("scanField").value="";
        charger();
    }catch(e){ console.error(e); showToast("❌ "+(e.message||e)); }
}

/* Clic sur un objet sorti → enregistre son retour */
async function retourObjet(type, identifiant, emprunteur){
    if(!confirm("Enregistrer le RETOUR de « "+identifiant+" » ("+emprunteur+") ?")) return;
    const agent=localStorage.getItem("nom")||"—";
    try{
        const { error } = await supabaseClient.from("prets_materiel").insert({
            type_objet:type, identifiant, sens:"retour", emprunteur, agent, meta:{} });
        if(error) throw error;
        showToast("↓ Retour de « "+identifiant+" » enregistré");
        charger();
    }catch(e){ console.error(e); showToast("❌ "+(e.message||e)); }
}

async function charger(){
    const start=new Date(); start.setDate(start.getDate()-7); start.setHours(0,0,0,0); // 7 derniers jours
    try{
        const { data, error } = await supabaseClient.from("prets_materiel")
            .select("*").gte("created_at",start.toISOString()).order("created_at",{ascending:false});
        if(error) throw error;
        journal=data||[];
    }catch(e){ console.error(e); journal=[]; }
    renderBoard(); renderLog();
}

function renderBoard(){
    const enCours=getEnCours();
    document.getElementById("counters").innerHTML =
        `<div class="cc"><div class="n">${enCours.length}</div><div class="l">objets sortis</div></div>`+
        `<div class="cc"><div class="n">${enCours.filter(o=>(Date.now()-new Date(o.since))/3600000>=OVERSTAY_H).length}</div><div class="l">+${OVERSTAY_H}h</div></div>`;
    const el=document.getElementById("board");
    if(!enCours.length){ el.innerHTML='<div class="empty">Aucun objet prêté actuellement ✔</div>'; return; }
    el.innerHTML=enCours.map(o=>{
        const mins=Math.floor((Date.now()-new Date(o.since))/60000);
        const dur=mins<60?(mins+" min"):(Math.floor(mins/60)+"h"+String(mins%60).padStart(2,"0"));
        const over=mins>=OVERSTAY_H*60;
        return `<div class="item ${over?'over':''}" onclick="retourObjet('${escapeAttr(o.type)}','${escapeAttr(o.identifiant)}','${escapeAttr(o.emprunteur||'')}')" title="Cliquer pour enregistrer le retour">
            <div class="t"><span class="nm">${TYPE_LBL[o.type]||''} ${escapeHtml(o.identifiant)}</span><span>${over?'⚠️ ':''}${dur}</span></div>
            <div class="meta">👤 ${escapeHtml(o.emprunteur||'—')}${o.societe?' · '+escapeHtml(o.societe):''}${o.motif?' · '+escapeHtml(o.motif):''}</div>
        </div>`;
    }).join("");
}

function renderLog(){
    const q=(document.getElementById("searchField").value||"").toLowerCase();
    let list=journal;
    if(q) list=list.filter(r=>[r.identifiant,r.emprunteur,r.societe,r.motif,r.agent].some(v=>(v||"").toLowerCase().includes(q)));
    const el=document.getElementById("log");
    if(!list.length){ el.innerHTML='<div class="empty">Aucun mouvement.</div>'; return; }
    el.innerHTML=list.map(r=>{
        const d=new Date(r.created_at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
        return `<div class="entry ${r.sens}">
            <div class="t" style="display:flex;justify-content:space-between"><span><b>${TYPE_LBL[r.type_objet]||''} ${escapeHtml(r.identifiant||'—')}</b></span><span>${r.sens==='pret'?'↑ Prêt':'↓ Retour'} · ${escapeHtml(d)}</span></div>
            <div class="meta">👤 ${escapeHtml(r.emprunteur||'—')}${r.societe?' · '+escapeHtml(r.societe):''}${r.motif?' · '+escapeHtml(r.motif):''} · 👮 ${escapeHtml(r.agent||'—')}</div>
        </div>`;
    }).join("");
}

function exportCSV(){
    if(!journal.length){ showToast("Rien à exporter"); return; }
    const cols=["created_at","type_objet","identifiant","sens","emprunteur","societe","motif","agent"];
    const esc=v=>'"'+String(v==null?"":v).replace(/"/g,'""')+'"';
    const csv=[cols.join(";")].concat(journal.map(r=>cols.map(c=>esc(r[c])).join(";"))).join("\n");
    const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
    const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
    a.download="prets_"+new Date().toISOString().split("T")[0]+".csv"; a.click();
    showToast("⬇️ Export CSV généré");
}

document.getElementById("scanField").addEventListener("keydown",e=>{
    if(e.key!=="Enter") return;
    const code=e.target.value.trim(); if(!code) return;
    // Si le code correspond à un objet sorti → propose le retour
    const found=getEnCours().find(o=>(o.identifiant||"").toLowerCase()===code.toLowerCase());
    if(found){ retourObjet(found.type,found.identifiant,found.emprunteur||""); e.target.value=""; return; }
    document.getElementById("f_identifiant").value=code;
    showToast("🔖 "+code+" — complète l'emprunteur puis PRÊT");
});

document.addEventListener("DOMContentLoaded",()=>{
    try{
        const svc=(localStorage.getItem("service")||"incendie").toLowerCase();
        const lbl={incendie:"Sécurité Incendie",surete:"Sûreté",technique:"Technique",services_generaux:"Services Généraux"}[svc]||svc;
        const site=(window.AuraTenant&&AuraTenant.label)?AuraTenant.label():(localStorage.getItem("site_code")||"");
        document.getElementById("svcLbl").textContent="· "+lbl+(site&&site.indexOf("global")<0?"":"");
    }catch(e){}
    charger();
});
</script>
</body>
</html>
