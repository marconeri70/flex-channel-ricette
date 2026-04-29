let ricette = JSON.parse(localStorage.getItem("ricetteFlexChannelSKF")) || [];
let fotoCorrenti = [];

const campi = [
  "codice",
  "tipo",
  "zona1",
  "zona2",
  "zona3",
  "robot",
  "keyence",
  "gioco",
  "rumorosita",
  "problema",
  "soluzione",
  "operatore",
  "turno"
];

document.getElementById("foto").addEventListener("change", async function () {
  const files = Array.from(this.files || []);

  if (files.length === 0) return;

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const imageData = await comprimiImmagine(file, 1200, 0.78);
    fotoCorrenti.push(imageData);
  }

  aggiornaAnteprime();
  this.value = "";
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

function aggiornaAnteprime() {
  const box = document.getElementById("previewContainer");
  box.innerHTML = "";

  fotoCorrenti.forEach((foto, index) => {
    box.innerHTML += `
      <div class="preview-item">
        <img src="${foto}" alt="Foto ${index + 1}" onclick="apriFoto('${foto}')">
        <button class="mini-danger-btn" type="button" onclick="rimuoviFoto(${index})">Rimuovi</button>
      </div>
    `;
  });
}

function rimuoviFoto(index) {
  fotoCorrenti.splice(index, 1);
  aggiornaAnteprime();
}

function rimuoviTutteFoto() {
  fotoCorrenti = [];
  document.getElementById("foto").value = "";
  aggiornaAnteprime();
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
    codice: codice,
    tipo: valore("tipo"),
    zona1: valore("zona1"),
    zona2: valore("zona2"),
    zona3: valore("zona3"),
    robot: valore("robot"),
    keyence: valore("keyence"),
    gioco: valore("gioco"),
    rumorosita: valore("rumorosita"),
    problema: valore("problema"),
    soluzione: valore("soluzione"),
    operatore: valore("operatore"),
    turno: valore("turno"),
    foto: [...fotoCorrenti],
    data: new Date().toLocaleString("it-IT")
  };

  ricette.unshift(nuova);
  salvaArchivio();

  alert("✅ Ricetta salvata con impostazioni e foto!");
  pulisciCampi();
  mostraRicette();
}

function salvaArchivio() {
  localStorage.setItem("ricetteFlexChannelSKF", JSON.stringify(ricette));
}

function pulisciCampi() {
  campi.forEach(id => {
    document.getElementById(id).value = "";
  });

  rimuoviTutteFoto();
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
    return Object.values(r).join(" ").toLowerCase().includes(testo);
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
    const fotoArray = Array.isArray(r.foto) ? r.foto : (r.foto ? [r.foto] : []);

    const galleria = fotoArray.length > 0
      ? `
        <h3>📸 Foto salvate (${fotoArray.length})</h3>
        <div class="gallery-grid">
          ${fotoArray.map((foto, index) => `
            <div class="gallery-item">
              <img src="${foto}" alt="Foto salvata ${index + 1}" onclick="apriFoto('${foto}')">
            </div>
          `).join("")}
        </div>
      `
      : "";

    div.innerHTML += `
      <div class="card">
        <div class="card-title">${escapeHTML(r.codice)}</div>
        <div class="card-subtitle">
          ${escapeHTML(r.tipo || "Tipo non indicato")} • ${escapeHTML(r.data)}
        </div>

        ${galleria}

        <div class="info-grid">
          <div class="info-box"><strong>Zona 1</strong><br>${testoSicuro(r.zona1)}</div>
          <div class="info-box"><strong>Zona 2</strong><br>${testoSicuro(r.zona2)}</div>
          <div class="info-box"><strong>Zona 3</strong><br>${testoSicuro(r.zona3)}</div>
          <div class="info-box"><strong>Robot</strong><br>${testoSicuro(r.robot)}</div>
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
