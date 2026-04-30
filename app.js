let ricette = JSON.parse(localStorage.getItem("ricetteFlexChannelSKF_v7")) || [];
let fotoSezioni = {};
let backupRobot = { robotZona1: "", robotZona2: "", robotZona3: "" };
let schedeEliminate = {};

function keyZona(zona, index) { return `${zona}_${index}`; }

function initStruttura() {
    fotoSezioni = {};
    schedeEliminate = {};
    Object.keys(ZONE_CONFIG).forEach(zona => ZONE_CONFIG[zona].forEach((_, i) => fotoSezioni[keyZona(zona, i)] = []));
    Object.keys(ROBOT_CONFIG).forEach(r => fotoSezioni[r] = []);
}

function creaInterfaccia() {
    let z = document.getElementById("zoneContainer");
    z.innerHTML = "";
    Object.keys(ZONE_CONFIG).forEach(zona => {
        let titolo = zona.replace("zona", "Zona ");
        let html = `<button class="zone-main-btn" type="button" onclick="toggleZona('${zona}')"><span>⚙️ ${titolo}</span><span id="zoneArrow_${zona}" class="zone-arrow">＋</span></button><div id="zoneContent_${zona}" class="zone-content"><div class="zone-card">`;
        ZONE_CONFIG[zona].forEach((voce, i) => {
            let id = keyZona(zona, i);
            html += schedaHtml(id, voce);
        });
        z.innerHTML += html + "</div></div>";
    });
    
    let r = document.getElementById("robotContainer");
    r.innerHTML = "";
    Object.keys(ROBOT_CONFIG).forEach(robot => {
        r.innerHTML += `<div class="zone-card robot-card" id="wrap_${robot}"><button class="collapse-btn" type="button" onclick="toggleScheda('${robot}')"><span>${escapeHTML(ROBOT_CONFIG[robot])}</span><span id="arrow_${robot}" class="arrow">＋</span></button><div id="content_${robot}" class="collapse-content"><div class="sub-card"><textarea id="note_${robot}" placeholder="Scrivi impostazioni, quote, prese, pinze, punti robot..."></textarea><div class="grid two"><div><label>📁 Importa backup/dati ABB</label><input id="backup_${robot}" type="file" accept=".txt,.mod,.prg,.cfg,.json,.xml,.csv,.log,*/*"></div><div>${photoHtml(robot, ROBOT_CONFIG[robot])}</div></div><textarea id="backupText_${robot}" class="backup-box" readonly></textarea><div id="preview_${robot}" class="preview-grid"></div><div class="delete-row"><button class="clear-btn" type="button" onclick="svuotaScheda('${robot}')">🧹 Svuota scheda</button><button class="danger-btn" type="button" onclick="eliminaScheda('${robot}')">🗑 Elimina scheda</button></div></div></div></div>`;
    });
    collegaEventiFile();
    collegaImportBackup();
}

function schedaHtml(id, voce) {
    return `<div id="wrap_${id}"><button class="collapse-btn" type="button" onclick="toggleScheda('${id}')"><span>${escapeHTML(voce)}</span><span id="arrow_${id}" class="arrow">＋</span></button><div id="content_${id}" class="collapse-content"><div class="sub-card"><textarea id="note_${id}" placeholder="Scrivi le impostazioni per: ${escapeHTML(voce)}"></textarea>${photoHtml(id, voce)}<div id="preview_${id}" class="preview-grid"></div><div class="delete-row"><button class="clear-btn" type="button" onclick="svuotaScheda('${id}')">🧹 Svuota scheda</button><button class="danger-btn" type="button" onclick="eliminaScheda('${id}')">🗑 Elimina scheda</button></div></div></div></div>`;
}

function photoHtml(id, label) {
    return `<div class="photo-area"><label>📸 Foto impostazioni - ${escapeHTML(label)}</label><div class="photo-buttons"><label class="fake-file-btn" for="file_${id}">📁 Carica foto</label><label class="fake-camera-btn" for="camera_${id}">📷 Scatta foto</label></div><input class="hidden-file" id="file_${id}" type="file" accept="image/*" multiple><input class="hidden-file" id="camera_${id}" type="file" accept="image/*" capture="environment"></div>`;
}

function toggleZona(id) {
    let c = document.getElementById(`zoneContent_${id}`), a = document.getElementById(`zoneArrow_${id}`);
    c.classList.toggle("open");
    a.textContent = c.classList.contains("open") ? "−" : "＋";
}

function toggleScheda(id) {
    let c = document.getElementById(`content_${id}`), a = document.getElementById(`arrow_${id}`);
    if (!c) return;
    c.classList.toggle("open");
    if (a) a.textContent = c.classList.contains("open") ? "−" : "＋";
}

function apriTutto() {
    document.querySelectorAll(".collapse-content,.zone-content").forEach(e => e.classList.add("open"));
    document.querySelectorAll(".arrow,.zone-arrow").forEach(e => e.textContent = "−");
}

function chiudiTutto() {
    document.querySelectorAll(".collapse-content,.zone-content").forEach(e => e.classList.remove("open"));
    document.querySelectorAll(".arrow,.zone-arrow").forEach(e => e.textContent = "＋");
}

function collegaEventiFile() {
    Object.keys(fotoSezioni).forEach(id => {
        let f = document.getElementById(`file_${id}`), c = document.getElementById(`camera_${id}`);
        if (f) f.addEventListener("change", async function () { await caricaFotoDaInput(this, id) });
        if (c) c.addEventListener("change", async function () { await caricaFotoDaInput(this, id) });
    });
    Object.keys(ROBOT_CONFIG).forEach(robot => {
        let b = document.getElementById(`backup_${robot}`);
        if (b) b.addEventListener("change", function () {
            let file = this.files[0];
            if (!file) return;
            let rd = new FileReader();
            rd.onload = e => {
                let t = "FILE IMPORTATO: " + file.name + "\nDATA IMPORTAZIONE: " + new Date().toLocaleString("it-IT") + "\n\n" + e.target.result;
                backupRobot[robot] = t;
                document.getElementById(`backupText_${robot}`).value = t;
            };
            rd.readAsText(file);
        });
    });
}

function collegaImportBackup() {
    let input = document.getElementById("importBackup");
    if (!input) return;
    input.onchange = function () {
        let file = this.files[0];
        if (!file) return;
        let rd = new FileReader();
        rd.onload = e => {
            try {
                let dati = JSON.parse(e.target.result);
                if (!Array.isArray(dati)) { alert("File backup non valido."); return; }
                let scelta = confirm("Vuoi sostituire tutte le ricette attuali con quelle del backup? Premi Annulla per aggiungerle a quelle già presenti.");
                if (scelta) { ricette = dati; } else { ricette = [...dati, ...ricette]; }
                salvaArchivio();
                mostraRicette();
                alert("✅ Backup importato correttamente!");
            } catch (err) { alert("Errore: il file non è un backup JSON valido."); }
        };
        rd.readAsText(file);
        this.value = "";
    }
}

async function caricaFotoDaInput(input, id) {
    for (const file of Array.from(input.files || [])) {
        if (!file.type.startsWith("image/")) continue;
        fotoSezioni[id].push(await comprimiImmagine(file, 1200, .78));
    }
    aggiornaAnteprime(id);
    input.value = "";
}

function comprimiImmagine(file, maxSize = 1200, quality = .78) {
    return new Promise(res => {
        let rd = new FileReader();
        rd.onload = e => {
            let img = new Image();
            img.onload = () => {
                let w = img.width, h = img.height;
                if (w > h && w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize; }
                else if (h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize; }
                let c = document.createElement("canvas");
                c.width = w; c.height = h;
                c.getContext("2d").drawImage(img, 0, 0, w, h);
                res(c.toDataURL("image/jpeg", quality));
            };
            img.src = e.target.result;
        };
        rd.readAsDataURL(file);
    });
}

function aggiornaAnteprime(id) {
    let b = document.getElementById(`preview_${id}`);
    if (!b) return;
    b.innerHTML = "";
    (fotoSezioni[id] || []).forEach((f, i) => b.innerHTML += `<div class="preview-item"><img src="${f}" onclick="apriFoto('${f}')"><button class="mini-danger-btn" type="button" onclick="rimuoviFoto('${id}',${i})">Rimuovi</button></div>`);
}

function rimuoviFoto(id, i) {
    fotoSezioni[id].splice(i, 1);
    aggiornaAnteprime(id);
}

function svuotaScheda(id) {
    if (!confirm("Vuoi svuotare questa scheda?")) return;
    svuotaSilenzioso(id);
    aggiornaAnteprime(id);
}

function eliminaScheda(id) {
    if (!confirm("Vuoi eliminare completamente questa scheda da questa ricetta? Tornerà disponibile quando premi Nuova Ricetta.")) return;
    schedeEliminate[id] = true;
    svuotaSilenzioso(id);
    let w = document.getElementById(`wrap_${id}`);
    if (w) w.remove();
}

function svuotaSilenzioso(id) {
    let n = document.getElementById(`note_${id}`);
    if (n) n.value = "";
    let b = document.getElementById(`backupText_${id}`);
    if (b) b.value = "";
    if (backupRobot[id] !== undefined) backupRobot[id] = "";
    fotoSezioni[id] = [];
}

function valore(id) {
    let e = document.getElementById(id);
    return e ? e.value.trim() : "";
}

function salvaRicetta() {
    let codice = valore("codice");
    if (!codice) { alert("Inserisci almeno il codice ricetta."); return; }
    let zone = {};
    Object.keys(ZONE_CONFIG).forEach(zona => zone[zona] = ZONE_CONFIG[zona].map((voce, i) => {
        let id = keyZona(zona, i);
        if (schedeEliminate[id]) return null;
        return { voce, note: valore(`note_${id}`), foto: [...(fotoSezioni[id] || [])] };
    }).filter(Boolean));
    
    let robot = {};
    Object.keys(ROBOT_CONFIG).forEach(r => {
        if (!schedeEliminate[r]) robot[r] = { titolo: ROBOT_CONFIG[r], note: valore(`note_${r}`), backup: backupRobot[r] || valore(`backupText_${r}`), foto: [...(fotoSezioni[r] || [])] };
    });
    
    let nuova = {
        id: Date.now(), codice, tipo: valore("tipo"), zone, robot,
        keyence: valore("keyence"), gioco: valore("gioco"), rumorosita: valore("rumorosita"),
        problema: valore("problema"), soluzione: valore("soluzione"), operatore: valore("operatore"),
        turno: valore("turno"), data: new Date().toLocaleString("it-IT")
    };
    ricette.unshift(nuova);
    salvaArchivio();
    alert("✅ Ricetta salvata!");
    nuovaRicetta();
    mostraRicette();
}

function nuovaRicetta() {
    document.querySelectorAll("input,textarea").forEach(e => { if (e.id !== "search") e.value = ""; });
    backupRobot = { robotZona1: "", robotZona2: "", robotZona3: "" };
    initStruttura();
    creaInterfaccia();
}

function salvaArchivio() {
    localStorage.setItem("ricetteFlexChannelSKF_v7", JSON.stringify(ricette));
}

function eliminaRicetta(id) {
    if (!confirm("Vuoi eliminare questa ricetta?")) return;
    ricette = ricette.filter(r => r.id !== id);
    salvaArchivio();
    mostraRicette();
}

function cercaRicetta() {
    let t = document.getElementById("search").value.toLowerCase();
    mostraRicette(ricette.filter(r => JSON.stringify(r).toLowerCase().includes(t)));
}

function mostraRicette(lista=ricette){
  let div=document.getElementById("lista");
  document.getElementById("contatore").innerText=`Ricette salvate: ${lista.length}`;
  if(!lista.length){
    div.innerHTML='<div class="empty">Nessuna ricetta trovata.</div>';
    return;
  }
  div.innerHTML="";
  
  lista.forEach(r=>{
    let idCard = `ricetta_${r.id}`;
    
    let zh="";
    Object.keys(r.zone||{}).forEach(z=>{
      let idZ = `saved_${r.id}_${z}`;
      let subHtml = "";
      (r.zone[z]||[]).forEach(it=>{
        if(!it.note&&(!it.foto||!it.foto.length))return;
        subHtml+=`<div class="saved-sub"><strong>${escapeHTML(it.voce)}</strong><br>${testoSicuro(it.note)}${galleria(it.foto)}</div>`;
      });
      if (subHtml) {
        zh+=`<div class="saved-section" id="wrap_${idZ}">
                <button class="collapse-btn" onclick="toggleScheda('${idZ}')">
                    <span>⚙️ ${escapeHTML(z.replace("zona","Zona "))}</span>
                    <span id="arrow_${idZ}" class="arrow">＋</span>
                </button>
                <div id="content_${idZ}" class="collapse-content">${subHtml}</div>
             </div>`;
      }
    });

    let rh="";
    Object.keys(r.robot||{}).forEach(k=>{
      let rb=r.robot[k];
      if(!rb.note && !rb.backup && (!rb.foto||!rb.foto.length)) return; 
      let idR = `saved_${r.id}_${k}`;
      
      rh+=`<div class="saved-section robot" id="wrap_${idR}">
              <button class="collapse-btn" onclick="toggleScheda('${idR}')">
                  <span>🤖 ${escapeHTML(rb.titolo||k)}</span>
                  <span id="arrow_${idR}" class="arrow">＋</span>
              </button>
              <div id="content_${idR}" class="collapse-content">
                  <div style="padding:10px 0;">${testoSicuro(rb.note)}</div>
                  ${backupBox(rb.backup)}
                  ${galleria(rb.foto)}
              </div>
           </div>`;
    });

    div.innerHTML+=`<div class="card" id="wrap_${idCard}">
        <div class="card-title" style="display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="toggleScheda('${idCard}')">
            <div>
                ${escapeHTML(r.codice)}
                <div class="card-subtitle" style="font-size:14px; margin-top:4px; font-weight:normal;">
                    ${escapeHTML(r.tipo||"Tipo non indicato")} • ${escapeHTML(r.data)}
                </div>
            </div>
            <span id="arrow_${idCard}" class="arrow" style="font-size:24px;">＋</span>
        </div>
        
        <div id="content_${idCard}" class="collapse-content">
            ${zh}
            ${rh}
            <div class="info-grid" style="margin-top:14px;">
                <div class="info-box"><strong>Keyence</strong><br>${testoSicuro(r.keyence)}</div>
                <div class="info-box"><strong>Gioco radiale</strong><br>${testoSicuro(r.gioco)}</div>
                <div class="info-box"><strong>Rumorosità</strong><br>${testoSicuro(r.rumorosita)}</div>
                <div class="info-box"><strong>Operatore / Turno</strong><br>${testoSicuro(r.operatore)} ${r.turno?" - "+escapeHTML(r.turno):""}</div>
                <div class="info-box"><strong>Problema</strong><br>${testoSicuro(r.problema)}</div>
                <div class="info-box"><strong>Soluzione</strong><br>${testoSicuro(r.soluzione)}</div>
            </div>
            <button class="danger-btn" onclick="eliminaRicetta(${r.id})" style="margin-top:16px;">🗑 Elimina Ricetta</button>
        </div>
    </div>`;
  });
}

function galleria(a) {
    if (!Array.isArray(a) || !a.length) return "";
    return `<div class="gallery-grid">${a.map(f => `<div class="gallery-item"><img src="${f}" onclick="apriFoto('${f}')"></div>`).join("")}</div>`;
}

function backupBox(t) {
    if (!t) return "";
    let b = t.length > 1200 ? t.substring(0, 1200) + "\n\n[...] Backup più lungo salvato nel file JSON di esportazione." : t;
    return `<textarea class="backup-box" readonly>${escapeHTML(b)}</textarea>`;
}

function testoSicuro(v) {
    return v ? escapeHTML(v).replace(/\n/g, "<br>") : "-";
}

function escapeHTML(s) {
    return String(s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function esportaBackup() {
    let blob = new Blob([JSON.stringify(ricette, null, 2)], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
    a.href = url;
    a.download = "backup-ricette-flex-channel-skf.json";
    a.click();
    URL.revokeObjectURL(url);
}

function cancellaTutto() {
    if (!confirm("Attenzione: vuoi cancellare tutte le ricette salvate?")) return;
    ricette = [];
    salvaArchivio();
    mostraRicette();
}

function apriFoto(src) {
    let m = document.getElementById("photoModal");
    if (!m) {
        m = document.createElement("div");
        m.id = "photoModal";
        m.className = "photo-modal";
        m.innerHTML = '<button onclick="chiudiFoto()">Chiudi ✕</button><img id="modalImg" src="">';
        document.body.appendChild(m);
    }
    document.getElementById("modalImg").src = src;
    m.style.display = "flex";
}

function chiudiFoto() {
    let m = document.getElementById("photoModal");
    if (m) m.style.display = "none";
}

initStruttura();
creaInterfaccia();
mostraRicette();

// Registrazione Service Worker per PWA offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registrato con successo.', reg.scope))
      .catch(err => console.error('Errore registrazione Service Worker:', err));
  });
}
