// Zamiana przecinka na kropkę w locie
document.addEventListener('input', function(e) {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'text') {
        if (!e.target.readOnly) {
            e.target.value = e.target.value.replace(',', '.');
        }
    }
});

const bazaDanych = {
    'argon_7000': { C: 0.127, C_prime: 0.698 },
    'argon_7200': { C: 0.124, C_prime: 0.698 },
    'tlen_7000': { C: 0.102, C_prime: 0.698 },
    'tlen_7200': { C: 0.099, C_prime: 0.698 }
};

function wczytajZBazy() {
    const wybor = document.getElementById('baza-gazow').value;
    if (bazaDanych[wybor]) {
        document.getElementById('C').value = bazaDanych[wybor].C;
        document.getElementById('C_prime').value = bazaDanych[wybor].C_prime;
    }
}

// OBLICZENIA GŁÓWNE
function obliczWszystko() {
    // 1. Objętość z masy
    const masa = parseFloat(document.getElementById('masa').value);
    const gestosc = parseFloat(document.getElementById('gestosc').value);
    if (!isNaN(masa) && !isNaN(gestosc) && gestosc !== 0) {
        document.getElementById('objetosc-stali').value = (masa / gestosc).toFixed(4);
    } else {
        document.getElementById('objetosc-stali').value = "";
    }

    // 2. Objętość z geometrii stożka ściętego
    const D = parseFloat(document.getElementById('D').value);
    const d = parseFloat(document.getElementById('d').value);
    const h = parseFloat(document.getElementById('h').value);
    if (!isNaN(D) && !isNaN(d) && !isNaN(h)) {
        const R = D / 2;
        const r = d / 2;
        const objetoscGeo = (1/3) * Math.PI * h * (Math.pow(R, 2) + (R * r) + Math.pow(r, 2));
        document.getElementById('objetosc-geometria').value = objetoscGeo.toFixed(4);
    } else {
        document.getElementById('objetosc-geometria').value = "";
    }

    // 3. Strumień modelu
    const C = parseFloat(document.getElementById('C').value);
    const C_prime = parseFloat(document.getElementById('C_prime').value);
    const SL = parseFloat(document.getElementById('SL').value);
    const Q = parseFloat(document.getElementById('Q').value);
    
    if (!isNaN(C) && !isNaN(C_prime) && !isNaN(SL) && !isNaN(Q) && C !== 0) {
        const Q_prime = Math.pow((C_prime / C), -0.5) * Math.pow(SL, 2.5) * Q;
        document.getElementById('Q_prime').value = Q_prime.toFixed(3);
    }
}

// MODUŁ RTD
let rtdPunkty = [];
let wykresRTD = null;

function inicjujWykres() {
    if (typeof Chart === 'undefined') {
        console.warn("Zablokowano Chart.js - wykres nie zostanie narysowany.");
        return;
    }
    const ctx = document.getElementById('rtdChart').getContext('2d');
    wykresRTD = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Krzywa RTD',
                data: rtdPunkty,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                borderWidth: 2, pointRadius: 4, fill: true, tension: 0.3
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', title: { display: true, text: 'Czas [s]' } },
                y: { title: { display: true, text: 'Stężenie' }, beginAtZero: true }
            }
        }
    });
}

function dodajPunktRTD() {
    const czas = parseFloat(document.getElementById('rtd-czas').value);
    const stezenie = parseFloat(document.getElementById('rtd-stezenie').value);

    if (!isNaN(czas) && !isNaN(stezenie)) {
        rtdPunkty.push({ x: czas, y: stezenie });
        rtdPunkty.sort((a, b) => a.x - b.x); 
        if(wykresRTD) wykresRTD.update();
        document.getElementById('rtd-czas').value = '';
        document.getElementById('rtd-stezenie').value = '';
        document.getElementById('rtd-czas').focus();
    } else {
        alert("Wpisz poprawne wartości liczbowe dla czasu i stężenia.");
    }
}

function wyczyscRTD() {
    rtdPunkty.length = 0; 
    if(wykresRTD) wykresRTD.update();
}

window.onload = inicjujWykres;

// EKSPORT
function generujTekst() {
    obliczWszystko(); 
    
    const volGeo = document.getElementById('objetosc-geometria').value || "Brak danych";
    const Q = document.getElementById('Q').value || "Brak danych";
    const C = document.getElementById('C').value || "Brak danych";
    const C_prime = document.getElementById('C_prime').value || "Brak danych";
    const SL = document.getElementById('SL').value || "Brak danych";
    const Q_prime = document.getElementById('Q_prime').value || "Brak obliczen";
    const ksztaltka = document.getElementById('typ-ksztaltki').value;
    const znacznik = document.getElementById('znacznik').value || "Brak danych";

    let raportTekst = `WYNIKI EKSPERYMENTU - MODELOWANIE FIZYCZNE KADZI
--------------------------------------------------
Zastosowana ksztaltka: ${ksztaltka}
Objetosc znacznika (KMnO4+NaCl): ${znacznik} ml

Geometria: Objetosc reaktora obliczona: ${volGeo} m3
Wspolczynnik skali (SL): ${SL}
Stala reaktora (C): ${C}
Stala modelu (C'): ${C_prime}

Zalozony strumien gazu dla reaktora (Q): ${Q} m3/s
OBLICZONY STRUMIEN DLA MODELU (Q'): ${Q_prime} m3/s
--------------------------------------------------\nZarejestrowane punkty RTD:\n`;

    if (rtdPunkty.length === 0) {
        raportTekst += "Brak wprowadzonych punktow pomiarowych.";
    } else {
        rtdPunkty.forEach((pkt, i) => {
            raportTekst += `${i + 1}. Czas: ${pkt.x} s | Stezenie: ${pkt.y}\n`;
        });
    }

    const kontener = document.getElementById('raport-container');
    const poleTekstowe = document.getElementById('raport-text');
    kontener.classList.remove('hidden');
    poleTekstowe.value = raportTekst;
}

function generujPDF() {
    obliczWszystko();
    if (!window.jspdf) {
        alert("Blad: Nie udalo sie zaladowac biblioteki do PDF. Uzyj przycisku 'Sprawozdanie Tekstowe'.");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Protokol z cwiczenia laboratoryjnego", 20, 20); 

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Objetosc obliczona z geometrii: ${document.getElementById('objetosc-geometria').value || '-'} m3`, 20, 35);
    doc.text(`Wspolczynnik skali (SL): ${document.getElementById('SL').value || '-'}`, 20, 45);
    doc.text(`Stala (C): ${document.getElementById('C').value || '-'}  |  Stala modelu (C'): ${document.getElementById('C_prime').value || '-'}`, 20, 55);
    doc.text(`Strumien w reaktorze (Q): ${document.getElementById('Q').value || '-'} m3/s`, 20, 65);
    doc.text(`Strumien w modelu (Q'): ${document.getElementById('Q_prime').value || '-'} m3/s`, 20, 75);
    doc.text(`Typ ksztaltki: ${document.getElementById('typ-ksztaltki').value}`, 20, 90);
    doc.text(`Objetosc znacznika (KMnO4+NaCl): ${document.getElementById('znacznik').value || '-'} ml`, 20, 100);
    
    doc.text("Zarejestrowane punkty RTD:", 20, 120);
    let yPos = 130;
    rtdPunkty.forEach((pkt, index) => {
        doc.text(`${index + 1}. Czas: ${pkt.x} s | Stezenie: ${pkt.y}`, 30, yPos);
        yPos += 10;
        if(yPos > 280) { doc.addPage(); yPos = 20; }
    });

    doc.save("Protokol_Argonowanie.pdf");
}

function generujCSV() {
    if (rtdPunkty.length === 0) {
        alert("Brak danych w tabeli punktów do wyeksportowania!");
        return;
    }
    let csvContent = "data:text/csv;charset=utf-8,Czas_s;Stezenie\n";
    rtdPunkty.forEach(function(rowArray) {
        let row = rowArray.x + ";" + rowArray.y;
        csvContent += row + "\n";
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Dane_Krzywej_RTD.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}