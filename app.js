let ricette = JSON.parse(localStorage.getItem("ricetteFlexChannelSKFCompleta")) || [];
let fotoSezioni = {};
let backupRobot = {};
let schedeEliminate = {};

function keyZona(zona, index) {
  return `${zona}_${index}`;
}

function initStruttura() {
  fotoSezioni = {};
  backupRobot = {
    robotZona1: "",
    robotZona2: "",
    robotZona3: ""
  };
  schedeEliminate = {};

  Object.keys(ZONE_CONFIG).forEach(zona => {
    ZONE_CONFIG[zona].forEach((_, i) => {
      fotoSezioni[keyZona(zona, i)] = [];
    });
  });

  Object.keys(ROBOT_CONFIG).forEach(robot => {
    fotoSezioni[robot] = [];
  });
}

function creaInterfaccia() {
  creaZone();
  creaRobot();
  collegaImportBackup();
}

function creaZone() {
  const box = document.getElementById("zoneContainer");
  box.innerHTML = "";

  Object.keys(ZONE_CONFIG).forEach(zona => {
    const titolo = zona.replace("zona", "Zona ");
    let html = `
      <button class="zone-main-btn" type="button" onclick="togglePanel('zoneContent_${zona}','zoneArrow_${zona}')">
        <span>⚙️ ${titolo}</span><span id="zoneArrow_${zona}">＋</span>
      </button>
      <div id="zoneContent_${zona}" class="zone-content">
        <div class="zone-card">
    `;

    ZONE_CONFIG[zona].forEach((voce, i) => {
      const id = keyZona(zona, i);
      html += schedaHtml(id, voce);
    });

    html += `</div></div>`;
    box.innerHTML += html;
  });

  collegaEventiFoto();
}

function creaRobot() {
  const box = document.getElementById("robotContainer");
  box.innerHTML = "";

  Object.keys(ROBOT_CONFIG).forEach(robot => {
    box.innerHTML += `
      <div class="zone-card robot-card" id="wrap_${robot}">
        <button class="collapse-btn" type="button" onclick="togglePanel('content_${robot}','arrow_${robot}')">
          <span>${escapeHTML(ROBOT_CONFIG[robot])}</span><span id="arrow_${robot}">＋</span>
        </button>

        <div id="content_${robot}" class="collapse-content">
          <div class="sub-card">
            <textarea id="note_${robot}" placeholder="Scrivi impostazioni, quote, prese, pinze, punti robot..."></textarea>

            <div class="grid two">
              <div>
                <label>📁 Importa backup/dati ABB</label>
                <input id="backup_${robot}" type="file" accept=".txt,.mod,.prg,.cfg,.json,.xml,.csv,.log,*/*">
              </div>
              <div>
                ${photoHtml(robot, ROBOT_CONFIG[robot])}
              </div>
            </div>

            <textarea id="backupText_${robot}" class="backup-box" readonly placeholder="Qui verrà visualizzato il contenuto del backup ABB..."></textarea>

            <div id="preview_${robot}" class="preview-grid"></div>

            <div class="delete-row">
              <button class="clear-btn" type="button" onclick="svuotaScheda('${robot}')">🧹 Svuota scheda</button>
              <button class="danger-btn" type="button" onclick="eliminaScheda('${robot}')">🗑 Elimina scheda</button>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  collegaEventiFoto();
  collegaBackupRobot();
}

function schedaHtml(id, voce) {
  return `
    <div id="wrap_${id}">
      <button class="collapse-btn" type="button" onclick="togglePanel('content_${id}','arrow_${id}')">
        <span>${escapeHTML(voce)}</span><span id="arrow_${id}">＋</span>
      </button>

      <div id="content_${id}" class="collapse-content">
        <div class="sub-card">
          <textarea id="note_${id}" placeholder="Scrivi le impostazioni per: ${escapeHTML(voce)}"></textarea>
          ${photoHtml(id, voce)}
          <div id="preview_${id}" class="preview-grid"></div>

          <div class="delete-row">
            <button class="clear-btn" type="button" onclick="svuotaScheda('${id}')">🧹 Svuota scheda</button>
            <button class="danger-btn" type="button" onclick="eliminaScheda('${id}')">🗑 Elimina scheda</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function photoHtml(id, label) {
  return `
    <div class="photo-area">
      <label>📸 Foto impostazioni - ${escapeHTML(label)}</label>
      <div class="photo-buttons">
        <label class="fake-file-btn" for="file_${id}">📁 Carica foto</label>
        <label class="fake-camera-btn" for="camera_${id}">📷 Scatta foto</label>
      </div>
      <input class="hidden-file" id="file_${id}" type="file" accept="image/*" multiple>
      <input class="hidden-file" id="camera_${id}" type="file" accept="image/*" capture="environment">
    </div>
  `;
}

function togglePanel(contentId, arrowId) {
  const c = document.getElementById(contentId);
  const a = document.getElementById(arrowId);
  if (!c) return;
  c.classList.toggle("open");
  if (a) a.textContent = c.classList.contains("open") ? "−" : "＋";
}

function toggleSaved(id) {
  togglePanel(id, "arrow_" + id);
}

function apriTuttoInserimento() {
  document.querySelectorAll(".collapse-content,.zone-content").forEach(e => e.classList.add("open"));
  document.querySelectorAll("[id^='arrow_'],[id^='zoneArrow_'],#robotPanelArrow,#extraPanelArrow").forEach(e => e.textContent = "−");
}

function chiudiTuttoInserimento() {
  document.querySelectorAll(".collapse-content,.zone-content").forEach(e => e.classList.remove("open"));
  document.querySelectorAll("[id^='arrow_'],[id^='zoneArrow_'],#robotPanelArrow,#extraPanelArrow").forEach(e => e.textContent = "＋");
}

function collegaEventiFoto() {
  Object.keys(fotoSezioni).forEach(id => {
    const fileInput = document.getElementById(`file_${id}`);
    const cameraInput = document.getElementById(`camera_${id}`);

    if (fileInput && !fileInput.dataset.ready) {
      fileInput.dataset.ready = "1";
      fileInput.addEventListener("change", async function () {
        await caricaFotoDaInput(this, id);
      });
    }

    if (cameraInput && !cameraInput.dataset.ready) {
      cameraInput.dataset.ready = "1";
      cameraInput.addEventListener("change", async function () {
        await caricaFotoDaInput(this, id);
      });
    }
  });
}

function collegaBackupRobot() {
  Object.keys(ROBOT_CONFIG).forEach(robot => {
    const input = document.getElementById(`backup_${robot}`);
    if (!input || input.dataset.ready) return;

    input.dataset.ready = "1";
    input.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        const text =
          "FILE IMPORTATO: " + file.name + "\\n" +
          "DATA IMPORTAZIONE: " + new Date().toLocaleString("it-IT") + "\\n\\n" +
          e.target.result;

        backupRobot[robot] = text;
        document.getElementById(`backupText_${robot}`).value = text;
      };

      reader.readAsText(file);
    });
  });
}

async function caricaFotoDaInput(input, id) {
  const files = Array.from(input.files || []);

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    fotoSezioni[id].push(await comprimiImmagine(file, 1200, 0.78));
  }

  aggiornaAnteprime(id);
  input.value = "";
}

function comprimiImmagine(file, maxSize = 1200, quality = 0.78) {
  return new Promise(resolve => {
    const reader = new FileReader();

    reader.onload = e => {
      const img = new Image();

      img.onload = () => {
        let w = img.width;
        let h = img.height;

        if (w > h && w > maxSize) {
          h = Math.round((h * maxSize) / w);
          w = maxSize;
        } else if (h > maxSize) {
          w = Math.round((w * maxSize) / h);
          h = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
  });
}

function aggiornaAnteprime(id) {
  const box = document.getElementById(`preview_${id}`);
  if (!box) return;

  box.innerHTML = "";

  (fotoSezioni[id] || []).forEach((foto, i) => {
    box.innerHTML += `
      <div class="preview-item">
        <img src="${foto}" onclick="apriFoto('${foto}')">
        <button class="mini-danger-btn" type="button" onclick="rimuoviFoto('${id}',${i})">Rimuovi</button>
      </div>
    `;
  });
}

function rimuoviFoto(id, index) {
  fotoSezioni[id].splice(index, 1);
  aggiornaAnteprime(id);
}

function svuotaScheda(id) {
  if (!confirm("Vuoi svuotare questa scheda?")) return;
  svuotaSilenzioso(id);
  aggiornaAnteprime(id);
}

function eliminaScheda(id) {
  if (!confirm("Vuoi eliminare completamente questa scheda da questa ricetta? Tornerà disponibile con Nuova Ricetta.")) return;

  schedeEliminate[id] = true;
  svuotaSilenzioso(id);

  const wrap = document.getElementById(`wrap_${id}`);
  if (wrap) wrap.remove();
}

function svuotaSilenzioso(id) {
  const note = document.getElementById(`note_${id}`);
  if (note) note.value = "";

  const backup = document.getElementById(`backupText_${id}`);
  if (backup) backup.value = "";

  if (backupRobot[id] !== undefined) backupRobot[id] = "";
  fotoSezioni[id] = [];
}

function valore(id) {
  const e = document.getElementById(id);
  return e ? e.value.trim() : "";
}

function salvaRicetta() {
  const codice = valore("codice");

  if (!codice) {
    alert("Inserisci almeno il codice ricetta.");
    return;
  }

  const zone = {};
  Object.keys(ZONE_CONFIG).forEach(zona => {
    zone[zona] = ZONE_CONFIG[zona].map((voce, i) => {
      const id = keyZona(zona, i);
      if (schedeEliminate[id]) return null;

      return {
        voce,
        note: valore(`note_${id}`),
        foto: [...(fotoSezioni[id] || [])]
      };
    }).filter(Boolean);
  });

  const robot = {};
  Object.keys(ROBOT_CONFIG).forEach(r => {
    if (schedeEliminate[r]) return;

    robot[r] = {
      titolo: ROBOT_CONFIG[r],
      note: valore(`note_${r}`),
      backup: backupRobot[r] || valore(`backupText_${r}`),
      foto: [...(fotoSezioni[r] || [])]
    };
  });

  const nuova = {
    id: Date.now(),
    codice,
    tipo: valore("tipo"),
    zone,
    robot,
    keyence: valore("keyence"),
    gioco: valore("gioco"),
    rumorosita: valore("rumorosita"),
    problema: valore("problema"),
    soluzione: valore("soluzione"),
    operatore: valore("operatore"),
    turno: valore("turno"),
    data: new Date().toLocaleString("it-IT")
  };

  ricette.unshift(nuova);
  salvaArchivio();

  alert("✅ Ricetta salvata correttamente!");
  nuovaRicetta();
  mostraRicette();
}

function nuovaRicetta() {
  document.querySelectorAll("input,textarea").forEach(e => {
    if (e.id !== "search") e.value = "";
  });

  initStruttura();
  creaInterfaccia();
}

function salvaArchivio() {
  localStorage.setItem("ricetteFlexChannelSKFCompleta", JSON.stringify(ricette));
}

function eliminaRicetta(id) {
  if (!confirm("Vuoi eliminare questa ricetta?")) return;

  ricette = ricette.filter(r => r.id !== id);
  salvaArchivio();
  mostraRicette();
}

function cercaRicetta() {
  const t = document.getElementById("search").value.toLowerCase();
  mostraRicette(ricette.filter(r => JSON.stringify(r).toLowerCase().includes(t)));
}

function mostraRicette(lista = ricette) {
  const div = document.getElementById("lista");
  document.getElementById("contatore").innerText = `Ricette salvate: ${lista.length}`;

  if (!lista.length) {
    div.innerHTML = '<div class="empty">Nessuna ricetta trovata.</div>';
    return;
  }

  div.innerHTML = "";

  lista.forEach(r => {
    const rid = "savedRicetta_" + r.id;
    let inner = "";

    Object.keys(r.zone || {}).forEach(z => {
      const zid = `saved_${r.id}_${z}`;
      let zoneBody = "";

      (r.zone[z] || []).forEach((it, idx) => {
        if (!it.note && (!it.foto || !it.foto.length)) return;

        const sid = `saved_${r.id}_${z}_${idx}`;
        zoneBody += `
          <button class="saved-sub-btn" onclick="toggleSaved('${sid}')">
            <span>${escapeHTML(it.voce)}</span><span id="arrow_${sid}">＋</span>
          </button>
          <div id="${sid}" class="saved-content">
            <div class="saved-sub-box">
              ${testoSicuro(it.note)}
              ${galleria(it.foto)}
            </div>
          </div>
        `;
      });

      if (zoneBody) {
        inner += `
          <button class="saved-zone-btn" onclick="toggleSaved('${zid}')">
            <span>⚙️ ${escapeHTML(z.replace("zona", "Zona "))}</span><span id="arrow_${zid}">＋</span>
          </button>
          <div id="${zid}" class="saved-content">
            <div class="saved-section">${zoneBody}</div>
          </div>
        `;
      }
    });

    Object.keys(r.robot || {}).forEach(k => {
      const rb = r.robot[k];
      const ridRobot = `saved_${r.id}_${k}`;

      inner += `
        <button class="saved-zone-btn" onclick="toggleSaved('${ridRobot}')">
          <span>🤖 ${escapeHTML(rb.titolo || k)}</span><span id="arrow_${ridRobot}">＋</span>
        </button>
        <div id="${ridRobot}" class="saved-content">
          <div class="saved-section">
            ${testoSicuro(rb.note)}
            ${backupBox(rb.backup)}
            ${galleria(rb.foto)}
          </div>
        </div>
      `;
    });

    inner += `
      <div class="info-grid">
        <div class="info-box"><strong>Keyence</strong><br>${testoSicuro(r.keyence)}</div>
        <div class="info-box"><strong>Gioco radiale</strong><br>${testoSicuro(r.gioco)}</div>
        <div class="info-box"><strong>Rumorosità</strong><br>${testoSicuro(r.rumorosita)}</div>
        <div class="info-box"><strong>Operatore / Turno</strong><br>${testoSicuro(r.operatore)} ${r.turno ? " - " + escapeHTML(r.turno) : ""}</div>
        <div class="info-box"><strong>Problema</strong><br>${testoSicuro(r.problema)}</div>
        <div class="info-box"><strong>Soluzione</strong><br>${testoSicuro(r.soluzione)}</div>
      </div>
      <button class="danger-btn" onclick="eliminaRicetta(${r.id})">🗑 Elimina Ricetta</button>
    `;

    div.innerHTML += `
      <div class="card">
        <button class="saved-main-btn" onclick="toggleSaved('${rid}')">
          <span>${escapeHTML(r.codice)} - ${escapeHTML(r.tipo || "Tipo non indicato")}</span><span id="arrow_${rid}">＋</span>
        </button>
        <div class="card-subtitle">${escapeHTML(r.data)}</div>
        <div id="${rid}" class="saved-content">${inner}</div>
      </div>
    `;
  });
}

function galleria(a) {
  if (!Array.isArray(a) || !a.length) return "";

  return `
    <div class="gallery-grid">
      ${a.map(f => `
        <div class="gallery-item">
          <img src="${f}" onclick="apriFoto('${f}')">
        </div>
      `).join("")}
    </div>
  `;
}

function backupBox(t) {
  if (!t) return "";

  const breve = t.length > 1200
    ? t.substring(0, 1200) + "\\n\\n[...] Backup più lungo salvato nel file JSON di esportazione."
    : t;

  return `<textarea class="backup-box" readonly>${escapeHTML(breve)}</textarea>`;
}

function testoSicuro(v) {
  return v ? escapeHTML(v).replace(/\\n/g, "<br>") : "-";
}

function escapeHTML(s) {
  return String(s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function esportaBackup() {
  const blob = new Blob([JSON.stringify(ricette, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "backup-ricette-flex-channel-skf.json";
  a.click();

  URL.revokeObjectURL(url);
}

function collegaImportBackup() {
  const input = document.getElementById("importBackup");
  if (!input || input.dataset.ready) return;

  input.dataset.ready = "1";
  input.addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const dati = JSON.parse(e.target.result);

        if (!Array.isArray(dati)) {
          alert("File backup non valido.");
          return;
        }

        const sostituisci = confirm("Vuoi sostituire tutte le ricette attuali con quelle del backup? Premi Annulla per aggiungerle.");
        ricette = sostituisci ? dati : [...dati, ...ricette];

        salvaArchivio();
        mostraRicette();
        alert("✅ Backup importato correttamente!");
      } catch (err) {
        alert("Errore: il file non è un backup JSON valido.");
      }
    };

    reader.readAsText(file);
    this.value = "";
  });
}

function cancellaTutto() {
  if (!confirm("Attenzione: vuoi cancellare tutte le ricette salvate?")) return;

  ricette = [];
  salvaArchivio();
  mostraRicette();
}

function apriFoto(src) {
  let modal = document.getElementById("photoModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "photoModal";
    modal.className = "photo-modal";
    modal.innerHTML = '<button onclick="chiudiFoto()">Chiudi ✕</button><img id="modalImg" src="">';
    document.body.appendChild(modal);
  }

  document.getElementById("modalImg").src = src;
  modal.style.display = "flex";
}

function chiudiFoto() {
  const modal = document.getElementById("photoModal");
  if (modal) modal.style.display = "none";
}

initStruttura();
creaInterfaccia();
mostraRicette();
