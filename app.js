let ricette = JSON.parse(localStorage.getItem("ricette")) || [];

function salvaRicetta() {

  let nuova = {
    codice: document.getElementById("codice").value,
    tipo: document.getElementById("tipo").value,
    zona1: document.getElementById("zona1").value,
    zona2: document.getElementById("zona2").value,
    zona3: document.getElementById("zona3").value,
    robot: document.getElementById("robot").value,
    keyence: document.getElementById("keyence").value,
    gioco: document.getElementById("gioco").value,
    rumorosita: document.getElementById("rumorosita").value,
    problema: document.getElementById("problema").value,
    soluzione: document.getElementById("soluzione").value,
    operatore: document.getElementById("operatore").value,
    turno: document.getElementById("turno").value,
    data: new Date().toLocaleString()
  };

  ricette.push(nuova);
  localStorage.setItem("ricette", JSON.stringify(ricette));

  alert("✅ Ricetta salvata!");
  mostraRicette();
}

function mostraRicette(lista = ricette) {
  let div = document.getElementById("lista");
  div.innerHTML = "";

  lista.forEach(r => {
    div.innerHTML += `
      <div class="card">
        <b>${r.codice}</b> (${r.tipo})<br>
        🕒 ${r.data}<br>
        👷 ${r.operatore} - ${r.turno}<br>
        ⚙️ Zona1: ${r.zona1}<br>
        ⚙️ Zona2: ${r.zona2}<br>
        ⚙️ Zona3: ${r.zona3}<br>
        🤖 Robot: ${r.robot}<br>
        📷 Keyence: ${r.keyence}<br>
        🎯 Gioco: ${r.gioco}<br>
        🔊 Rumore: ${r.rumorosita}<br>
        ❗ Problema: ${r.problema}<br>
        ✅ Soluzione: ${r.soluzione}
      </div>
    `;
  });
}

function cercaRicetta() {
  let val = document.getElementById("search").value.toLowerCase();
  let filtrate = ricette.filter(r => r.codice.toLowerCase().includes(val));
  mostraRicette(filtrate);
}

mostraRicette();
