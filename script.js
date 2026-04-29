// ============================================
// SYSTEM PAMIĘCI I OBSŁUGA BŁĘDÓW
// ============================================
function zapiszStan() {
    const inputs = document.querySelectorAll('input:not([readonly]), select');
    const stan = {};
    inputs.forEach(el => {
        if(el.id) stan[el.id] = el.value;
    });
    stan['rtdPunkty'] = rtdPunkty;
    localStorage.setItem('argonowanie_sesja_pro', JSON.stringify(stan));
}

function odtworzStan() {
    const zapisany = localStorage.getItem('argonowanie_sesja_pro');
    if (zapisany) {
        const stan = JSON.parse(zapisany);
        for (const klucz in stan) {
            if (klucz === 'rtdPunkty') {
                rtdPunkty = stan[klucz] || [];
            } else {
                const el = document.getElementById(klucz);
                if (el) el.value = stan[klucz];
            }
        }
    }
    obliczWszystko();
    inicjujWykres();
}

document.addEventListener('input', function(e) {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'text') {
        if (!e.target.readOnly) {
            e.target.value = e.target.value.replace(',', '.');
        }
    }
    zapiszStan();
});

document.addEventListener('change', zapiszStan);

window.onload = odtworzStan;

// ============================================
// PARAMETRY FIZYCZNE I MATEMATYKA
// ============================================
const M_POWIETRZA = 28.96; 
const RHO_POWIETRZA = 1.202; 
const RHO_WODY = 1000;       

const BAZA_GAZOW = {
    'argon': { M: 39.95, rho: 1.784 },
    'tlen':  { M: 32.00, rho: 1.429 }
};

function obliczSekcje1() {
    const m = parseFloat(document.getElementById('masa').value);
    const rho = parseFloat(document.getElementById('gestosc').value);
    if (isNaN(m) || isNaN(rho) || rho === 0) {
        document.getElementById('objetosc-stali').value = "";
        return;
    }
    const mKg = document.getElementById('j-masa').value === 't' ? m * 1000 : m;
    const rhoKg = document.getElementById('j-gestosc').value === 'g/cm3' ? rho * 1000 : rho;
    const vM3 = mKg / rhoKg;
    const res = document.getElementById('j-objetosc1').value === 'l' ? vM3 * 1000 : vM3;
    document.getElementById('objetosc-stali').value = res.toFixed(4);
}

function obliczGeometrie() {
    const Din = parseFloat(document.getElementById('D').value);
    const din = parseFloat(document.getElementById('d').value);
    const hin = parseFloat(document.getElementById('h').value);
    if (isNaN(Din) || isNaN(din) || isNaN(hin)) {
        document.getElementById('objetosc-geometria').value = "";
        return;
    }
    const toM = (v, u) => u === 'cm' ? v / 100 : v;
    const D = toM(Din, document.getElementById('j-D').value);
    const d = toM(din, document.getElementById('j-d').value);
    const h = toM(hin, document.getElementById('j-h').value);
    const vM3 = (1/3) * Math.PI * h * (Math.pow(D/2, 2) + (D/2 * d/2) + Math.pow(d/2, 2));
    const res = document.getElementById('j-objetosc2').value === 'l' ? vM3 * 1000 : vM3;
    document.getElementById('objetosc-geometria').value = res.toFixed(4);
}

function obliczSekcje3() {
    const prAr = parseInt(document.getElementById('proporcja-gazu').value);
    const prO2 = 100 - prAr;
    document.getElementById('gaz-etykieta').innerText = `${prO2}% O₂ / ${prAr}% Ar`;
    const rhoIn = parseFloat(document.getElementById('gestosc3').value);
    const jRho = document.getElementById('j-gestosc3').value;
    if (isNaN(rhoIn) || rhoIn <= 0) {
        document.getElementById('C').value = ""; document.getElementById('C_prime').value = ""; document.getElementById('Q_prime').value = "";
        return;
    }
    const rhoL = jRho === 'g/cm3' ? rhoIn * 1000 : rhoIn;
    const xAr = prAr / 100; const xO2 = prO2 / 100;
    const mixM = (xAr * BAZA_GAZOW['argon'].M) + (xO2 * BAZA_GAZOW['tlen'].M);
    const mixRhoG = (xAr * BAZA_GAZOW['argon'].rho) + (xO2 * BAZA_GAZOW['tlen'].rho);
    const Cp = Math.pow(M_POWIETRZA, 2) / (RHO_POWIETRZA * RHO_WODY);
    const C = Math.pow(mixM, 2) / (mixRhoG * rhoL);
    document.getElementById('C_prime').value = Cp.toFixed(3);
    document.getElementById('C').value = C.toFixed(3);
    const slM = parseFloat(document.getElementById('SL_mianownik').value);
    const Qin = parseFloat(document.getElementById('Q').value);
    if (isNaN(slM) || slM <= 0 || isNaN(Qin)) {
        document.getElementById('Q_prime').value = ""; return;
    }
    const SL = 1 / slM;
    const qM3s = document.getElementById('j-Q').value === 'l/min' ? Qin / 60000 : Qin;
    let qpM3s = Math.pow((Cp / C), -0.5) * Math.pow(SL, 2.5) * qM3s;
    const res = document.getElementById('j-Q-prime').value === 'l/min' ? qpM3s * 60000 : qpM3s;
    document.getElementById('Q_prime').value = res.toFixed(3);
}

function obliczWszystko() {
    obliczSekcje1(); obliczGeometrie(); obliczSekcje3();
}

// ============================================
// MODUŁ RTD I WYKRES
// ============================================
let rtdPunkty = [];
let wykresRTD = null;

function inicjujWykres() {
    if (typeof Chart === 'undefined') return;
    if (wykresRTD) wykresRTD.destroy();
    const ctx = document.getElementById('rtdChart').getContext('2d');
    wykresRTD = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Krzywa retencji RTD',
                data: rtdPunkty,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                borderWidth: 2, pointRadius: 4, fill: true, tension: 0.3
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Czas t [s]' } },
                y: { title: { display: true, text: 'Stężenie C(t)' }, beginAtZero: true }
            }
        }
    });
}

function dodajPunktRTD() {
    const t = parseFloat(document.getElementById('rtd-czas').value);
    const ct = parseFloat(document.getElementById('rtd-stezenie').value);
    if (!isNaN(t) && !isNaN(ct)) {
        rtdPunkty.push({ x: t, y: ct });
        rtdPunkty.sort((a, b) => a.x - b.x); 
        if(wykresRTD) wykresRTD.update();
        document.getElementById('rtd-czas').value = '';
        document.getElementById('rtd-stezenie').value = '';
        document.getElementById('rtd-czas').focus();
        zapiszStan();
    }
}

function wyczyscRTD() {
    rtdPunkty.length = 0; if(wykresRTD) wykresRTD.update(); zapiszStan();
}

// ============================================
// EKSPORTY (PDF, CSV, TEKST)
// ============================================
function generujTekst() {
    obliczWszystko();
    const slM = document.getElementById('SL_mianownik').value;
    let txt = `PROTOKÓŁ EKSPERYMENTALNY - MODELOWANIE FIZYCZNE\n`;
    txt += `--------------------------------------------------\n`;
    txt += `SEKCJA 1: Objętość stali (V): ${document.getElementById('objetosc-stali').value} ${document.getElementById('j-objetosc1').value}\n`;
    txt += `SEKCJA 2: Objętość geometryczna (Vgeo): ${document.getElementById('objetosc-geometria').value} ${document.getElementById('j-objetosc2').value}\n`;
    txt += `SEKCJA 3: Skala SL: 1:${slM} | Sklad gazu: ${document.getElementById('gaz-etykieta').innerText}\n`;
    txt += `Stała C: ${document.getElementById('C').value} | Stała C': ${document.getElementById('C_prime').value}\n`;
    txt += `Przepływ model (Q'): ${document.getElementById('Q_prime').value} ${document.getElementById('j-Q-prime').value}\n`;
    txt += `SEKCJA 4: Kształtka: ${document.getElementById('typ-ksztaltki').value} | Znacznik: ${document.getElementById('znacznik').value} ml\n`;
    txt += `--------------------------------------------------\nLiczba punktów RTD: ${rtdPunkty.length}\n`;
    
    document.getElementById('raport-container').classList.remove('hidden');
    document.getElementById('raport-text').value = txt;
}

function generujPDF() {
    obliczWszystko();
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.text("PROTOKOL BADANIA MODELOWEGO - ANALIZA RTD", 20, 20);
    
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    let y = 35;
    const sekcje = [
        ["1. DANE HUTNICZE", `Masa: ${document.getElementById('masa').value}${document.getElementById('j-masa').value}, Gestosc: ${document.getElementById('gestosc').value}, Obj: ${document.getElementById('objetosc-stali').value}`],
        ["2. GEOMETRIA KADZI", `Wymiary D/d/h: ${document.getElementById('D').value}/${document.getElementById('d').value}/${document.getElementById('h').value}, Obj Geo: ${document.getElementById('objetosc-geometria').value}`],
        ["3. PODOBIENSTWO", `Skala 1:${document.getElementById('SL_mianownik').value}, Gaz: ${document.getElementById('gaz-etykieta').innerText}, C/C': ${document.getElementById('C').value}/${document.getElementById('C_prime').value}, Q/Q': ${document.getElementById('Q').value}/${document.getElementById('Q_prime').value}`],
        ["4. WARUNKI RTD", `Ksztaltka: ${document.getElementById('typ-ksztaltki').value}, Znacznik: ${document.getElementById('znacznik').value}ml`]
    ];

    sekcje.forEach(s => {
        doc.setFont("helvetica", "bold"); doc.text(s[0], 20, y); y += 7;
        doc.setFont("helvetica", "normal"); doc.text(s[1], 25, y); y += 12;
    });

    doc.setFont("helvetica", "bold"); doc.text("PUNKTY POMIAROWE RTD:", 20, y); y += 8;
    doc.setFont("helvetica", "normal");
    rtdPunkty.forEach((p, i) => {
        doc.text(`${i+1}. t: ${p.x}s | C(t): ${p.y}`, 25, y); y += 7;
        if(y > 280) { doc.addPage(); y = 20; }
    });
    doc.save("Protokol_Kompletny_RTD.pdf");
}

function generujCSV() {
    obliczWszystko();
    let csv = "data:text/csv;charset=utf-8,Sekcja;Parametr;Wartosc;Jednostka\n";
    csv += `1;Masa;${document.getElementById('masa').value};${document.getElementById('j-masa').value}\n`;
    csv += `1;Gestosc;${document.getElementById('gestosc').value};${document.getElementById('j-gestosc').value}\n`;
    csv += `2;Srednica D;${document.getElementById('D').value};${document.getElementById('j-D').value}\n`;
    csv += `3;Skala;1:${document.getElementById('SL_mianownik').value};-\n`;
    csv += `3;Gaz;${document.getElementById('gaz-etykieta').innerText};-\n`;
    csv += `3;Q_reaktor;${document.getElementById('Q').value};${document.getElementById('j-Q').value}\n`;
    csv += `3;Q_model;${document.getElementById('Q_prime').value};${document.getElementById('j-Q-prime').value}\n`;
    csv += `4;Ksztaltka;${document.getElementById('typ-ksztaltki').value};-\n`;
    csv += `\nDANE_RTD;Czas[s];Stezenie;-\n`;
    rtdPunkty.forEach(p => csv += `RTD;${p.x};${p.y};-\n`);
    
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "Eksperyment_Kompletny.csv";
    link.click();
}