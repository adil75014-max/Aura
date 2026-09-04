<!DOCTYPE html>
<html lang="fr">
<head>
<meta http-equiv="X-Content-Type-Options" content="nosniff">
<meta http-equiv="X-Frame-Options" content="DENY">
<meta name="referrer" content="strict-origin-when-cross-origin">
<meta name="robots" content="noindex, nofollow">
<meta charset="UTF-8">
<title>Vérification en cours</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="vendor/jspdf.umd.min.js" crossorigin="anonymous"></script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0b0e17;color:#e0e4ef;font-family:'DM Sans',system-ui,sans-serif;padding:16px 16px 80px}

.header{display:flex;align-items:center;gap:12px;margin-bottom:20px}
.back-btn{background:rgba(77,163,255,0.12);border:1px solid rgba(77,163,255,0.3);color:#4da3ff;padding:8px 14px;border-radius:10px;cursor:pointer;font:600 .9rem 'DM Sans';transition:.2s}
.back-btn:hover{background:#4da3ff;color:#0b0e17}
.header h1{font-size:1.3rem;color:#4da3ff;flex:1;letter-spacing:-.5px}

.card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:20px;margin-bottom:16px}
.card h2{font-size:1.05rem;color:#4da3ff;margin-bottom:12px}

.progress-bg{background:rgba(255,255,255,0.08);border-radius:99px;height:12px;overflow:hidden;margin:8px 0 4px}
.progress-fill{height:100%;background:linear-gradient(90deg,#4da3ff,#00c878);border-radius:99px;transition:width .4s}
.progress-text{text-align:right;font-size:.8rem;color:#6b7a99}

/* GROUPE */
.group-header{background:linear-gradient(135deg,rgba(77,163,255,0.15),rgba(77,163,255,0.05));border:1px solid rgba(77,163,255,0.3);border-radius:12px;padding:12px 16px;margin:14px 0 8px;display:flex;align-items:center;gap:10px}
.group-header .g-icon{font-size:1.2rem}
.group-header .g-label{font-weight:700;font-size:1rem;color:#4da3ff;flex:1}
.group-header .g-num{width:26px;height:26px;border-radius:50%;background:rgba(77,163,255,0.25);color:#4da3ff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem}

/* LIBELLE */
.libelle-box{background:rgba(255,180,50,0.08);border:1px solid rgba(255,180,50,0.2);border-radius:10px;padding:12px 14px;margin:8px 0;display:flex;gap:10px;align-items:flex-start}
.libelle-box .l-icon{color:#ffb432;font-size:1.1rem;flex-shrink:0}
.libelle-box .l-text{font-size:.9rem;color:#cbd2e0;line-height:1.5}

/* FIELD CARD */
.field{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:12px;padding:14px;margin-bottom:10px;transition:.2s}
.field.filled{border-color:rgba(0,200,120,0.3);background:rgba(0,200,120,0.04)}
.field-top{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}
.field-num{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.8rem;flex-shrink:0;background:rgba(77,163,255,0.15);color:#4da3ff;margin-top:2px}
.field.filled .field-num{background:rgba(0,200,120,0.2);color:#00c878}
.field-info{flex:1;min-width:0}
.field-label{font-weight:600;font-size:.95rem;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.field-label .req{color:#f87171;font-size:.85rem}
.field-zone{font-size:.78rem;color:#6b7a99;margin-top:2px}
.field-type-tag{font-size:.7rem;color:#6b7a99;background:rgba(255,255,255,0.05);padding:2px 8px;border-radius:5px}

/* INPUTS */
.fld-input,.fld-textarea,.fld-select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.05);color:#e0e4ef;font:.92rem 'DM Sans';transition:.2s}
.fld-input:focus,.fld-textarea:focus,.fld-select:focus{outline:none;border-color:#4da3ff;box-shadow:0 0 0 3px rgba(77,163,255,0.15)}
.fld-textarea{min-height:60px;resize:vertical}

/* CHECKBOX / OUI-NON */
.toggle-row{display:flex;gap:8px}
.toggle-btn{flex:1;padding:10px;text-align:center;border-radius:8px;cursor:pointer;font:600 .9rem 'DM Sans';border:2px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.04);color:#8899bb;transition:.2s}
.toggle-btn.active.yes{background:rgba(0,200,120,0.2);color:#00c878;border-color:#00c878}
.toggle-btn.active.no{background:rgba(239,68,68,0.2);color:#f87171;border-color:#ef4444}
.toggle-btn:hover{transform:translateY(-1px)}

/* CHECKBOX */
.cbx-row{display:flex;align-items:center;gap:10px;padding:10px;background:rgba(255,255,255,0.04);border-radius:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.08)}
.cbx-row input{width:auto;cursor:pointer;transform:scale(1.3)}
.cbx-row.checked{background:rgba(0,200,120,0.1);border-color:#00c878}

/* RADIO */
.radio-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:6px}
.radio-opt{padding:10px;background:rgba(255,255,255,0.04);border:2px solid rgba(255,255,255,0.08);border-radius:8px;cursor:pointer;font:.88rem 'DM Sans';color:#cbd2e0;text-align:center;transition:.2s}
.radio-opt:hover{border-color:rgba(77,163,255,0.4)}
.radio-opt.active{background:rgba(77,163,255,0.2);border-color:#4da3ff;color:#4da3ff;font-weight:600}

/* SIGNATURE */
.sig-box{background:#fff;border-radius:8px;border:2px solid rgba(255,255,255,0.1);overflow:hidden;margin-top:6px}
.sig-canvas{display:block;width:100%;height:140px;cursor:crosshair;touch-action:none}
.sig-actions{display:flex;gap:6px;margin-top:6px}
.sig-actions button{flex:1;padding:8px;font-size:.85rem;border-radius:8px;border:none;cursor:pointer;font:600 .85rem 'DM Sans'}

/* GPS */
.gps-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.gps-row input{flex:1;min-width:100px}
.gps-btn{padding:10px 14px;background:rgba(77,163,255,0.15);color:#4da3ff;border:1px solid rgba(77,163,255,0.3);border-radius:8px;cursor:pointer;font:600 .85rem 'DM Sans';white-space:nowrap}

/* IMAGE */
.img-upload{display:block;padding:16px;background:rgba(77,163,255,0.06);border:2px dashed rgba(77,163,255,0.3);border-radius:10px;text-align:center;cursor:pointer;color:#4da3ff;font-weight:600;font-size:.9rem}
.img-upload:hover{background:rgba(77,163,255,0.1)}
.img-preview{margin-top:8px;max-width:100%;max-height:200px;border-radius:8px;border:1px solid rgba(255,255,255,0.1)}

/* COMMENTAIRE */
.fld-comment{margin-top:8px;width:100%;padding:8px 10px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:rgba(0,0,0,0.15);color:#cbd2e0;font:.82rem 'DM Sans';resize:none;height:36px}

.fld-time{font-size:.72rem;color:#6b7a99;margin-top:4px;display:inline-block}

.btn{padding:12px 16px;border:none;border-radius:10px;font:600 .95rem 'DM Sans';cursor:pointer;width:100%;transition:.2s;margin-top:10px}
.btn-primary{background:linear-gradient(135deg,#4da3ff,#2b7de9);color:#fff}
.btn-success{background:linear-gradient(135deg,#00c878,#00a060);color:#fff}
.btn-secondary{background:rgba(255,255,255,0.08);color:#8899bb;border:1px solid rgba(255,255,255,0.12)}
</style>
</head>
<body>

<div class="header">
    <button class="back-btn" onclick="location.href='verifications_admin.html'">⟵</button>
    <h1 id="verifTitle">Vérification</h1>
</div>

<div class="card">
    <div class="progress-bg"><div class="progress-fill" id="progressBar" style="width:0%"></div></div>
    <div class="progress-text" id="progressText">0 / 0</div>
</div>

<div id="checkpointsList"></div>

<div class="card">
    <label style="color:#8899bb;font-size:.85rem">Commentaire général</label>
    <textarea id="commentaireGeneral" style="width:100%;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04);color:#e0e4ef;font:.9rem 'DM Sans';min-height:60px;resize:vertical;margin-top:6px" placeholder="Observations générales…"></textarea>
</div>

<div class="card">
    <button class="btn btn-success" onclick="terminerVerification()">✅ Terminer la vérification</button>
    <button class="btn btn-primary" onclick="exportPDF()" style="margin-top:8px">📄 Exporter PDF</button>
    <button class="btn btn-secondary" onclick="sauvegarder(true)">💾 Sauvegarder (sans terminer)</button>
</div>

<script src="vendor/supabase.js" crossorigin="anonymous"></script>
<script src="supabaseClient.js"></script>
<script src="tenant.js"></script>
<script>
if(typeof showToast!=="function") window.showToast=function(m){alert(m)};

let verifId = null;
let verifData = null;

const TYPE_ICONS = {
    groupe:"📁",menu:"▾",checkbox:"☑",textarea:"≡",heure:"🕐",signature:"✍",
    libelle:"🏷",ouinon:"⊙",nombre:"#",gps:"📍",radio:"◉",image:"📤",
    texte:"✎",email:"✉",date:"📅",codebarre:"▦",photo:"🖼",liste_perso:"≣"
};

async function charger() {
    const params = new URLSearchParams(location.search);
    verifId = params.get("id");
    if (!verifId) {
        document.getElementById("checkpointsList").innerHTML = '<div class="card" style="text-align:center;padding:30px;color:#6b7a99">Aucun ID de vérification.</div>';
        return;
    }

    const { data, error } = await supabaseClient
        .from("verifications").select("*").eq("id", verifId).single();
    if (error || !data) { alert("Vérification introuvable."); return; }

    verifData = data;
    document.getElementById("verifTitle").textContent = data.type || "Vérification";
    if (data.commentaire) document.getElementById("commentaireGeneral").value = data.commentaire;

    // Migration : si les anciens checkpoints n'ont pas de "type", les transformer en "ouinon"
    const cps = (verifData.meta && verifData.meta.checkpoints) || [];
    cps.forEach(cp => {
        if (!cp.type) cp.type = "ouinon";
        if (cp.resultat && !cp.valeur) {
            cp.valeur = cp.resultat === "conforme" ? "oui" : (cp.resultat === "non_conforme" ? "non" : "na");
        }
    });

    renderCheckpoints();
    majProgression();
}

function isFillable(cp) {
    return cp.type !== "groupe" && cp.type !== "libelle";
}

function renderCheckpoints() {
    const div = document.getElementById("checkpointsList");
    const cps = (verifData.meta && verifData.meta.checkpoints) || [];

    if (cps.length === 0) {
        div.innerHTML = '<div class="card" style="text-align:center;padding:20px;color:#6b7a99">Aucun élément.</div>';
        return;
    }

    let groupCount = 0;
    let fieldCount = 0;
    div.innerHTML = cps.map((cp, i) => {
        if (cp.type === "groupe") {
            groupCount++;
            return `
            <div class="group-header">
                <div class="g-num">${groupCount}</div>
                <span class="g-icon">📁</span>
                <span class="g-label">${escapeHtml(cp.label)}</span>
            </div>`;
        }
        if (cp.type === "libelle") {
            return `
            <div class="libelle-box">
                <span class="l-icon">ℹ️</span>
                <div class="l-text">${escapeHtml(cp.label)}</div>
            </div>`;
        }

        fieldCount++;
        const filled = isFilled(cp);
        const req = cp.required ? '<span class="req">*</span>' : '';
        const time = cp.horodatage ? `<div class="fld-time">⏱ ${cp.horodatage}</div>` : "";
        const zone = cp.zone ? `<div class="field-zone">📍 ${escapeHtml(cp.zone)}</div>` : "";
        const typeIcon = TYPE_ICONS[cp.type] || "•";

        return `
        <div class="field ${filled ? 'filled' : ''}">
            <div class="field-top">
                <div class="field-num">${fieldCount}</div>
                <div class="field-info">
                    <div class="field-label">
                        <span>${escapeHtml(cp.label)} ${req}</span>
                        <span class="field-type-tag">${typeIcon}</span>
                    </div>
                    ${zone}
                </div>
            </div>
            ${renderInput(cp, i)}
            <textarea class="fld-comment" placeholder="Commentaire…" oninput="setComment(${i},this.value)">${escapeHtml(cp.commentaire||"")}</textarea>
            ${time}
        </div>`;
    }).join("");
}

function isFilled(cp) {
    if (cp.type === "checkbox") return cp.valeur === true;
    if (cp.type === "ouinon" || cp.type === "radio" || cp.type === "menu" || cp.type === "liste_perso") return cp.valeur != null && cp.valeur !== "";
    if (cp.type === "signature" || cp.type === "image" || cp.type === "photo") return !!cp.valeur;
    if (cp.type === "gps") return cp.valeur && cp.valeur.lat;
    return cp.valeur != null && cp.valeur !== "";
}

function renderInput(cp, idx) {
    const v = cp.valeur;
    const opts = cp.options || [];
    switch(cp.type) {
        case "ouinon":
            return `
            <div class="toggle-row">
                <div class="toggle-btn yes ${v==='oui'?'active':''}" onclick="setValeur(${idx},'oui')">✅ Oui</div>
                <div class="toggle-btn no ${v==='non'?'active':''}" onclick="setValeur(${idx},'non')">❌ Non</div>
                <div class="toggle-btn ${v==='na'?'active no':''}" onclick="setValeur(${idx},'na')">➖ N/A</div>
            </div>`;
        case "checkbox":
            return `
            <div class="cbx-row ${v?'checked':''}" onclick="setValeur(${idx},${!v})">
                <input type="checkbox" ${v?'checked':''}>
                <span>${v ? '✅ Coché' : 'Cliquer pour cocher'}</span>
            </div>`;
        case "menu":
            return `<select class="fld-select" onchange="setValeur(${idx},this.value)">
                <option value="">— Sélectionner —</option>
                ${opts.map(o => `<option value="${escapeAttr(o)}" ${v===o?'selected':''}>${escapeHtml(o)}</option>`).join("")}
            </select>`;
        case "radio":
        case "liste_perso":
            return `<div class="radio-grid">
                ${opts.map(o => `<div class="radio-opt ${v===o?'active':''}" onclick="setValeur(${idx},'${escapeAttr(o)}')">${escapeHtml(o)}</div>`).join("")}
            </div>`;
        case "texte":
            return `<input type="text" class="fld-input" value="${escapeAttr(v||'')}" oninput="setValeurDebounced(${idx},this.value)" placeholder="Saisir…">`;
        case "textarea":
            return `<textarea class="fld-textarea" oninput="setValeurDebounced(${idx},this.value)" placeholder="Saisir…">${escapeHtml(v||'')}</textarea>`;
        case "nombre":
            return `<input type="number" class="fld-input" value="${escapeAttr(v||'')}" oninput="setValeurDebounced(${idx},this.value)" placeholder="0">`;
        case "email":
            return `<input type="email" class="fld-input" value="${escapeAttr(v||'')}" oninput="setValeurDebounced(${idx},this.value)" placeholder="exemple@domaine.com">`;
        case "date":
            return `<input type="date" class="fld-input" value="${escapeAttr(v||'')}" onchange="setValeur(${idx},this.value)">`;
        case "heure":
            return `<input type="time" class="fld-input" value="${escapeAttr(v||'')}" onchange="setValeur(${idx},this.value)">`;
        case "gps":
            const gps = v || {};
            return `<div class="gps-row">
                <input type="text" class="fld-input" placeholder="Latitude" value="${escapeAttr(gps.lat||'')}" readonly style="flex:1">
                <input type="text" class="fld-input" placeholder="Longitude" value="${escapeAttr(gps.lng||'')}" readonly style="flex:1">
                <button class="gps-btn" onclick="captureGPS(${idx})">📍 Localiser</button>
            </div>`;
        case "image":
        case "photo":
            const imgPreview = v ? `<img src="${v}" class="img-preview">` : '';
            const captureAttr = cp.type === "photo" ? 'capture="environment"' : '';
            return `
                <label class="img-upload">
                    📷 ${cp.type === 'photo' ? 'Prendre une photo' : 'Téléverser une image'}
                    <input type="file" accept="image/*" ${captureAttr} style="display:none" onchange="captureImage(${idx},this)">
                </label>
                ${imgPreview}`;
        case "signature":
            const sigPreview = v ? `<img src="${v}" style="max-width:200px;background:#fff;border-radius:8px;margin-top:6px">` : '';
            return `
                <div class="sig-box">
                    <canvas class="sig-canvas" id="sig_${idx}" width="600" height="140"></canvas>
                </div>
                <div class="sig-actions">
                    <button class="btn-secondary" onclick="clearSig(${idx})">🗑 Effacer</button>
                    <button class="btn-primary" onclick="saveSig(${idx})">✅ Valider</button>
                </div>
                ${sigPreview}`;
        case "codebarre":
            return `<div class="gps-row">
                <input type="text" class="fld-input" value="${escapeAttr(v||'')}" placeholder="Saisir ou scanner…" oninput="setValeurDebounced(${idx},this.value)">
                <button class="gps-btn" onclick="alert('Pour scanner, utilisez l\\'appareil photo de votre téléphone et collez le code ici.')">▦ Scanner</button>
            </div>`;
        default:
            return `<input type="text" class="fld-input" value="${escapeAttr(v||'')}" oninput="setValeurDebounced(${idx},this.value)">`;
    }
}

function escapeHtml(s) { if(!s)return""; return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function escapeAttr(s) { if(!s)return""; return String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }

function majProgression() {
    const cps = (verifData.meta && verifData.meta.checkpoints) || [];
    const fillable = cps.filter(isFillable);
    const total = fillable.length;
    const done = fillable.filter(isFilled).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    document.getElementById("progressBar").style.width = pct + "%";
    document.getElementById("progressText").textContent = `${done} / ${total} — ${pct}%`;
}

async function setValeur(index, valeur) {
    verifData.meta.checkpoints[index].valeur = valeur;
    verifData.meta.checkpoints[index].horodatage = new Date().toLocaleString("fr-FR");
    if (navigator.vibrate) navigator.vibrate(40);
    renderCheckpoints();
    majProgression();
    await sauvegarder();
}

function setValeurDebounced(index, valeur) {
    verifData.meta.checkpoints[index].valeur = valeur;
    verifData.meta.checkpoints[index].horodatage = new Date().toLocaleString("fr-FR");
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(() => { majProgression(); sauvegarder(); }, 600);
}

function setComment(index, val) {
    verifData.meta.checkpoints[index].commentaire = val;
    clearTimeout(window._saveTimer);
    window._saveTimer = setTimeout(sauvegarder, 800);
}

function captureGPS(idx) {
    if (!navigator.geolocation) { alert("Géolocalisation indisponible."); return; }
    navigator.geolocation.getCurrentPosition(pos => {
        verifData.meta.checkpoints[idx].valeur = { lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) };
        verifData.meta.checkpoints[idx].horodatage = new Date().toLocaleString("fr-FR");
        renderCheckpoints(); majProgression(); sauvegarder();
    }, err => alert("Impossible de localiser : " + err.message));
}

function captureImage(idx, input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        verifData.meta.checkpoints[idx].valeur = e.target.result;
        verifData.meta.checkpoints[idx].horodatage = new Date().toLocaleString("fr-FR");
        renderCheckpoints(); majProgression(); sauvegarder();
    };
    reader.readAsDataURL(file);
}

let _sigState = {};
function initSignature(idx) {
    const canvas = document.getElementById("sig_" + idx);
    if (!canvas || canvas._init) return;
    canvas._init = true;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2; ctx.lineCap = "round";
    let drawing = false;
    function getPos(e) {
        const r = canvas.getBoundingClientRect();
        const t = e.touches ? e.touches[0] : e;
        return { x: (t.clientX - r.left) * (canvas.width / r.width), y: (t.clientY - r.top) * (canvas.height / r.height) };
    }
    function start(e) { e.preventDefault(); drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }
    function move(e) { if (!drawing) return; e.preventDefault(); const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }
    function end() { drawing = false; }
    canvas.addEventListener("mousedown", start); canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end); canvas.addEventListener("mouseleave", end);
    canvas.addEventListener("touchstart", start); canvas.addEventListener("touchmove", move);
    canvas.addEventListener("touchend", end);
}

function clearSig(idx) {
    const canvas = document.getElementById("sig_" + idx);
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
}

function saveSig(idx) {
    const canvas = document.getElementById("sig_" + idx);
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    verifData.meta.checkpoints[idx].valeur = data;
    verifData.meta.checkpoints[idx].horodatage = new Date().toLocaleString("fr-FR");
    renderCheckpoints(); majProgression(); sauvegarder();
}

// Init des canvas signature après chaque rendu
const origRender = renderCheckpoints;
renderCheckpoints = function() {
    origRender();
    const cps = (verifData && verifData.meta && verifData.meta.checkpoints) || [];
    cps.forEach((cp, i) => { if (cp.type === "signature") setTimeout(() => initSignature(i), 50); });
};

async function sauvegarder(showMsg) {
    if (!verifId || !verifData) return;
    const commentaire = document.getElementById("commentaireGeneral").value.trim();
    const { error } = await supabaseClient.from("verifications").update({
        meta: verifData.meta, commentaire: commentaire
    }).eq("id", verifId);
    if (showMsg) showToast(error ? "❌ " + error.message : "💾 Sauvegardé");
}

async function terminerVerification() {
    const cps = verifData.meta.checkpoints || [];
    const fillable = cps.filter(isFillable);
    const reqMissing = fillable.filter(c => c.required && !isFilled(c));
    if (reqMissing.length) {
        alert("⚠️ " + reqMissing.length + " champ(s) obligatoire(s) non rempli(s).");
        return;
    }
    const nonTraite = fillable.filter(c => !isFilled(c)).length;
    if (nonTraite > 0 && !confirm(`${nonTraite} élément(s) non rempli(s). Terminer quand même ?`)) return;

    const commentaire = document.getElementById("commentaireGeneral").value.trim();
    await supabaseClient.from("verifications").update({
        resultat: "termine", commentaire, meta: verifData.meta
    }).eq("id", verifId);

    showToast("✅ Vérification terminée");
    setTimeout(() => location.href = "verifications_admin.html", 1200);
}

async function exportPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "mm", "a4");
    const M = 12, PW = 186, BOT = 280;
    let y = 20;
    function ensureSpace(n) { if (y + n > BOT) { pdf.addPage(); y = 15; } }

    pdf.setFillColor(15, 20, 35); pdf.rect(0, 0, 210, 35, "F");
    pdf.setFontSize(16); pdf.setTextColor(77, 163, 255);
    pdf.text("Vérification — " + (verifData.type || ""), M, 22);
    pdf.setFontSize(9); pdf.setTextColor(180);
    pdf.text(new Date().toLocaleString("fr-FR") + " — " + (verifData.agent_nom || localStorage.getItem("nom") || ""), M, 30);
    y = 42;

    const cps = verifData.meta.checkpoints || [];
    cps.forEach((cp, i) => {
        ensureSpace(15);
        if (cp.type === "groupe") {
            pdf.setFillColor(77, 163, 255); pdf.rect(M, y - 4, PW, 7, "F");
            pdf.setFontSize(11); pdf.setTextColor(255); pdf.text("📁 " + cp.label, M + 3, y); y += 8; return;
        }
        if (cp.type === "libelle") {
            pdf.setFontSize(9); pdf.setTextColor(120, 100, 50);
            pdf.splitTextToSize("ℹ️ " + cp.label, PW).forEach(l => { ensureSpace(5); pdf.text(l, M, y); y += 4.5; });
            y += 2; return;
        }
        pdf.setFontSize(10); pdf.setTextColor(0);
        pdf.text(`${i + 1}. ${cp.label}${cp.required ? " *" : ""}`, M, y); y += 5;
        let val = cp.valeur;
        if (val && typeof val === "object" && val.lat) val = `Lat ${val.lat}, Lng ${val.lng}`;
        if (typeof val === "string" && val.startsWith("data:image")) val = "[Image / Signature]";
        if (val == null || val === "") val = "(non renseigné)";
        pdf.setFontSize(9); pdf.setTextColor(60); pdf.text("→ " + String(val).substring(0, 80), M + 5, y); y += 5;
        if (cp.commentaire) { pdf.setTextColor(80); pdf.splitTextToSize(cp.commentaire, PW - 10).forEach(l => { ensureSpace(5); pdf.text(l, M + 8, y); y += 4.5; }); }
        if (cp.zone) { pdf.setFontSize(8); pdf.setTextColor(130); pdf.text("Zone : " + cp.zone, M + 5, y); y += 4; }
        y += 2;
    });

    const comment = document.getElementById("commentaireGeneral").value.trim();
    if (comment) {
        ensureSpace(15);
        pdf.setFontSize(10); pdf.setTextColor(0); pdf.text("Commentaire général :", M, y); y += 5;
        pdf.setFontSize(9); pdf.setTextColor(60);
        pdf.splitTextToSize(comment, PW).forEach(l => { ensureSpace(5); pdf.text(l, M + 4, y); y += 4.5; });
    }
    pdf.setFontSize(7); pdf.setTextColor(140); pdf.text("LBM Sécurité — SEGEP RG", M, 290);
    pdf.save(`Verification_${(verifData.type||"").replace(/[^a-zA-Z0-9]/g,"_")}_${new Date().toISOString().split("T")[0]}.pdf`);
    showToast("📄 PDF exporté");
}

charger();
</script>
<script src="security.js"></script>
<script src="global.js"></script>
<script src="notifications_global.js"></script>
</body>
</html>
