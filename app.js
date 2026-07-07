let dati = JSON.parse(localStorage.getItem("ricette")) || [];

function salva() {
    localStorage.setItem("ricette", JSON.stringify(dati));
}

function nuovaRicetta() {
    dati.push({zone: [{foto:[]},{foto:[]},{foto:[]}]});
    salva();
    render();
}

function elimina(index){
    if(confirm("Eliminare questa ricetta?")){
        dati.splice(index,1);
        salva();
        render();
    }
}

function aggiungiFoto(e, r, z){
    let files = e.target.files;
    for(let file of files){
        let reader = new FileReader();
        reader.onload = function(ev){
            dati[r].zone[z].foto.push(ev.target.result);
            salva();
            render();
        }
        reader.readAsDataURL(file);
    }
}

function render(){
    let html = "";
    dati.forEach((ricetta, i)=>{

        html += `<div class="card">
        <button onclick="this.nextElementSibling.classList.toggle('hidden')">Ricetta ${i+1}</button>
        <button onclick="elimina(${i})">❌ Elimina</button>

        <div class="hidden">`;

        ricetta.zone.forEach((zona,z)=>{

            html += `
            <div class="card">
            <button onclick="this.nextElementSibling.classList.toggle('hidden')">Zona ${z+1}</button>

            <div class="hidden">
                <input type="file" multiple accept="image/*" onchange="aggiungiFoto(event,${i},${z})">

                <div>
                    ${zona.foto.map(f=>`<img src="${f}">`).join("")}
                </div>
            </div>
            </div>`;
        });

        html += `</div></div>`;
    });

    document.getElementById("contenitore").innerHTML = html;
}

render();
