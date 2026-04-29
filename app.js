let ricette = JSON.parse(localStorage.getItem("ricetteFlexChannelSKF")) || [];
let fotoCorrente = "";

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

document.getElementById("foto").addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    fotoCorrente = e.target.result;
    const preview = document.getElementById("preview");
    preview.src = fotoCorrente;
    preview.style.display = "block";
  };

  reader.readAsDataURL(file);
});

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
    foto: fotoCorrente,
    data: new Date().toLocaleString("it-IT")
  };

  ricette.unshift(nuova);
  salvaArchivio();

  alert("✅ Ricetta salvata correttamente!");
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

  document.getElementById("foto").value = "";
  fotoCorrente = "";

  const preview = document.getElementById("preview");
  preview.src = "";
  preview.style.display = "none";
}

function rimuoviFoto() {
  document.getElementById("foto").value = "";
  fotoCorrente = "";

  const preview = document.getElementById("preview");
  preview.src = "";
  preview.style.display = "none";
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
    div.innerHTML += `
      <div class="card">
        <div class="card-title">${escapeHTML(r.codice)}</div>
        <div class="card-subtitle">
          ${escapeHTML(r.tipo || "Tipo non indicato")} • ${escapeHTML(r.data)}
        </div>

        ${r.foto ? `<img src="${r.foto}" class="foto-ricetta" alt="Foto ricetta">` : ""}

        <div class="info-grid">
          <div class="info-box"><strong>Zona 1</strong><br>${testo(r.zona1)}</div>
          <div class="info-box"><strong>Zona 2</strong><br>${testo(r.zona2)}</div>
          <div class="info-box"><strong>Zona 3</strong><br>${testo(r.zona3)}</div>
          <div class="info-box"><strong>Robot</strong><br>${testo(r.robot)}</div>
          <div class="info-box"><strong>Keyence</strong><br>${testo(r.keyence)}</div>
          <div class="info-box"><strong>Gioco radiale</strong><br>${testo(r.gioco)}</div>
          <div class="info-box"><strong>Rumorosità</strong><br>${testo(r.rumorosita)}</div>
          <div class="info-box"><strong>Operatore / Turno</strong><br>${testo(r.operatore)} ${r.turno ? " - " + escapeHTML(r.turno) : ""}</div>
          <div class="info-box"><strong>Problema</strong><br>${testo(r.problema)}</div>
          <div class="info-box"><strong>Soluzione</strong><br>${testo(r.soluzione)}</div>
        </div>

        <button class="danger-btn" onclick="eliminaRicetta(${r.id})">🗑 Elimina Ricetta</button>
      </div>
    `;
  });
}

function testo(valore) {
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

mostraRicette();
