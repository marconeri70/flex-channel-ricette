let ricette = JSON.parse(localStorage.getItem("ricetteFlexChannelSKF_v2")) || [];

const sezioniFoto = [
  "zona1",
  "zona2",
  "zona3",
  "robotZona1",
  "robotZona2",
  "robotZona3"
];

let fotoSezioni = {
  zona1: [],
  zona2: [],
  zona3: [],
  robotZona1: [],
  robotZona2: [],
  robotZona3: []
};

const campi = [
  "codice",
  "tipo",
  "zona1",
  "zona2",
  "zona3",
  "robotZona1",
  "robotZona2",
  "robotZona3",
  "robotZona1Backup",
  "robotZona2Backup",
  "robotZona3Backup",
  "keyence",
  "gioco",
  "rumorosita",
  "problema",
  "soluzione",
  "operatore",
  "turno"
];

const fileInputMap = {
  fotoZona1: "zona1",
  fotoZona2: "zona2",
  fotoZona3: "zona3",
  fotoRobotZona1: "robotZona1",
  fotoRobotZona2: "robotZona2",
  fotoRobotZona3: "robotZona3"
};

Object.keys(fileInputMap).forEach(inputId => {
  document.getElementById(inputId).addEventListener("change", async function () {
    const sezione = fileInputMap[inputId];
    const files = Array.from(this.files || []);
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const imageData = await comprimiImmagine(file, 1200, 0.78);
      fotoSezioni[sezione].push(imageData);
    }
    aggiornaAnteprime(sezione);
    this.value = "";
  });
});

const backupInputMap = {
  backupRobotZona1: "robotZona1Backup",
  backupRobotZona2: "robotZona2Backup",
  backupRobotZona3: "robotZona3Backup"
};

Object.keys(backupInputMap).forEach(inputId => {
  document.getElementById(inputId).addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const targetId = backupInputMap[inputId];
    const reader = new FileReader();

    reader.onload = function (e) {
      document.getElementById(targetId).value =
        "FILE IMPORTATO: " + file.name + "\n" +
        "DATA IMPORTAZIONE: " + new Date().toLocaleString("it-IT") + "\n\n" +
        e.target.result;
    };

    reader.readAsText(file);
  });
});

function comprimiImmagine(file, maxSize = 1200, quality = 0.78) {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = function (event) {
      const img = new Image();

      img.onload = function () {
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };

      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  });
}

function aggiornaAnteprime(sezione) {
  const containerId = "preview" + nomePreview(sezione);
  const box = document.getElementById(containerId);
  box.innerHTML = "";

  fotoSezioni[sezione].forEach((foto, index) => {
    box.innerHTML += `
      <div class="preview-item">
        <img src="${foto}" alt="Foto ${index + 1}" onclick="apriFoto('${foto}')">
        <button class="mini-danger-btn" type="button" onclick="rimuoviFoto('${sezione}', ${index})">Rimuovi</button>
      </div>
    `;
  });
}

function nomePreview(sezione) {
  const map = {
    zona1: "Zona1",
    zona2: "Zona2",
    zona3: "Zona3",
    robotZona1: "RobotZona1",
    robotZona2: "RobotZona2",
    robotZona3: "RobotZona3"
  };
  return map[sezione];
}

function rimuoviFoto(sezione, index) {
  fotoSezioni[sezione].splice(index, 1);
  aggiornaAnteprime(sezione);
}

function valore(id) {
  return document.getElementById(id).value.trim();
}

function salvaRicetta() {
  const codice = valore("codice");

  if (!codice) {
    alert("Inserisci almeno il codice ricetta.");
    return;
  }

  const nuova = {
    id: Date.now(),
    codice,
    tipo: valore("tipo"),
    zone: {
      zona1: {
        note: valore("zona1"),
        foto: [...fotoSezioni.zona1]
      },
      zona2: {
        note: valore("zona2"),
        foto: [...fotoSezioni.zona2]
      },
      zona3: {
        note: valore("zona3"),
        foto: [...fotoSezioni.zona3]
      }
    },
    robot: {
      zona1: {
        note: valore("robotZona1"),
        backup: valore("robotZona1Backup"),
        foto: [...fotoSezioni.robotZona1]
      },
      zona2: {
        note: valore("robotZona2"),
        backup: valore("robotZona2Backup"),
        foto: [...fotoSezioni.robotZona2]
      },
      zona3: {
        note: valore("robotZona3"),
        backup: valore("robotZona3Backup"),
        foto: [...fotoSezioni.robotZona3]
      }
    },
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

  alert("✅ Ricetta salvata con foto per zona e dati robot ABB!");
  pulisciCampi();
  mostraRicette();
}

function salvaArchivio() {
  localStorage.setItem("ricetteFlexChannelSKF_v2", JSON.stringify(ricette));
}

function pulisciCampi() {
  campi.forEach(id => {
    document.getElementById(id).value = "";
  });

  Object.keys(fileInputMap).forEach(id => document.getElementById(id).value = "");
  Object.keys(backupInputMap).forEach(id => document.getElementById(id).value = "");

  fotoSezioni = {
    zona1: [],
    zona2: [],
    zona3: [],
    robotZona1: [],
    robotZona2: [],
    robotZona3: []
  };

  sezioniFoto.forEach(sezione => aggiornaAnteprime(sezione));
}

function eliminaRicetta(id) {
  if (!confirm("Vuoi eliminare questa ricetta?")) return;

  ricette = ricette.filter(r => r.id !== id);
  salvaArchivio();
  mostraRicette();
}

function cercaRicetta() {
  const testo = document.getElementById("search").value.toLowerCase();

  const filtrate = ricette.filter(r => {
    return JSON.stringify(r).toLowerCase().includes(testo);
  });

  mostraRicette(filtrate);
}

function mostraRicette(lista = ricette) {
  const div = document.getElementById("lista");
  const contatore = document.getElementById("contatore");

  contatore.innerText = `Ricette salvate: ${lista.length}`;

  if (lista.length === 0) {
    div.innerHTML = `<div class="empty">Nessuna ricetta trovata.</div>`;
    return;
  }

  div.innerHTML = "";

  lista.forEach(r => {
    div.innerHTML += `
      <div class="card">
        <div class="card-title">${escapeHTML(r.codice)}</div>
        <div class="card-subtitle">
          ${escapeHTML(r.tipo || "Tipo non indicato")} • ${escapeHTML(r.data)}
        </div>

        <div class="saved-section">
          <h4>⚙️ Zona 1</h4>
          <div>${testoSicuro(r.zone?.zona1?.note)}</div>
          ${galleria(r.zone?.zona1?.foto)}
        </div>

        <div class="saved-section">
          <h4>⚙️ Zona 2</h4>
          <div>${testoSicuro(r.zone?.zona2?.note)}</div>
          ${galleria(r.zone?.zona2?.foto)}
        </div>

        <div class="saved-section">
          <h4>⚙️ Zona 3</h4>
          <div>${testoSicuro(r.zone?.zona3?.note)}</div>
          ${galleria(r.zone?.zona3?.foto)}
        </div>

        <div class="saved-section robot">
          <h4>🤖 Robot Zona 1</h4>
          <div>${testoSicuro(r.robot?.zona1?.note)}</div>
          ${backupBox(r.robot?.zona1?.backup)}
          ${galleria(r.robot?.zona1?.foto)}
        </div>

        <div class="saved-section robot">
          <h4>🤖 Robot Zona 2</h4>
          <div>${testoSicuro(r.robot?.zona2?.note)}</div>
          ${backupBox(r.robot?.zona2?.backup)}
          ${galleria(r.robot?.zona2?.foto)}
        </div>

        <div class="saved-section robot">
          <h4>🤖 Robot Zona 3</h4>
          <div>${testoSicuro(r.robot?.zona3?.note)}</div>
          ${backupBox(r.robot?.zona3?.backup)}
          ${galleria(r.robot?.zona3?.foto)}
        </div>

        <div class="info-grid">
          <div class="info-box"><strong>Keyence</strong><br>${testoSicuro(r.keyence)}</div>
          <div class="info-box"><strong>Gioco radiale</strong><br>${testoSicuro(r.gioco)}</div>
          <div class="info-box"><strong>Rumorosità</strong><br>${testoSicuro(r.rumorosita)}</div>
          <div class="info-box"><strong>Operatore / Turno</strong><br>${testoSicuro(r.operatore)} ${r.turno ? " - " + escapeHTML(r.turno) : ""}</div>
          <div class="info-box"><strong>Problema</strong><br>${testoSicuro(r.problema)}</div>
          <div class="info-box"><strong>Soluzione</strong><br>${testoSicuro(r.soluzione)}</div>
        </div>

        <button class="danger-btn" onclick="eliminaRicetta(${r.id})">🗑 Elimina Ricetta</button>
      </div>
    `;
  });
}

function galleria(fotoArray) {
  if (!Array.isArray(fotoArray) || fotoArray.length === 0) return "";
  return `
    <div class="gallery-grid">
      ${fotoArray.map((foto, index) => `
        <div class="gallery-item">
          <img src="${foto}" alt="Foto ${index + 1}" onclick="apriFoto('${foto}')">
        </div>
      `).join("")}
    </div>
  `;
}

function backupBox(text) {
  if (!text) return "";
  const breve = text.length > 1200 ? text.substring(0, 1200) + "\n\n[...] Backup più lungo salvato nel file JSON di esportazione." : text;
  return `<textarea class="backup-box" readonly>${escapeHTML(breve)}</textarea>`;
}

function testoSicuro(valore) {
  return valore ? escapeHTML(valore).replace(/\n/g, "<br>") : "-";
}

function escapeHTML(str) {
  return String(str || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function esportaBackup() {
  const dati = JSON.stringify(ricette, null, 2);
  const blob = new Blob([dati], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
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
  let modal = document.getElementById("photoModal");

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "photoModal";
    modal.className = "photo-modal";
    modal.innerHTML = `
      <button onclick="chiudiFoto()">Chiudi ✕</button>
      <img id="modalImg" src="" alt="Foto ingrandita">
    `;
    document.body.appendChild(modal);
  }

  document.getElementById("modalImg").src = src;
  modal.style.display = "flex";
}

function chiudiFoto() {
  const modal = document.getElementById("photoModal");
  if (modal) modal.style.display = "none";
}

mostraRicette();
