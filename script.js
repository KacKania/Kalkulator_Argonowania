// Zamiana przecinka na kropkę w locie
document.addEventListener('input', function(e) {
    if (e.target.tagName.toLowerCase() === 'input' && e.target.type === 'text') {
        if (!e.target.readOnly) {
            e.target.value = e.target.value.replace(',', '.');
        }
    }
});

// ============================================
// DANE ZASZYTE NA SZTYWNO (Tylko Argon i Tlen)
// ============================================
const M_POWIETRZA = 28.96; // Masa molowa powietrza [g/mol]
const RHO_POWIETRZA = 1.202; // Gęstość powietrza [kg/m³]
const RHO_WODY = 1000;       // Gęstość wody w modelu [kg/m³]

const BAZA_GAZOW = {
    'argon': { M: 39.95, rho: 1.784 },
    'tlen':  { M: 32.00, rho: 1.429 }
};

// ============================================
// LOGIKA SEKCJI 1: WŁAŚCIWOŚCI CIECZY
// ============================================
function obliczSekcje1() {
    const masaInput = parseFloat(document.getElementById('masa').value);
    const gestoscInput = parseFloat(document.getElementById('gestosc').value);
    
    if (isNaN(masaInput) || isNaN(gestoscInput) || gestoscInput === 0) {
        document.getElementById('objetosc-stali').value = "";
        return;
    }

    const jMasa = document.getElementById('j-masa').value;
    const jGestosc = document.getElementById('j-gestosc').value;
    const jObjetosc = document.getElementById('j-objetosc1').value;

    let masaKg = jMasa === 't' ? masaInput * 1000 : masaInput;
    let gestoscKgM3 = jGestosc === 'g/cm3' ? gestoscInput * 1000 : gestoscInput;

    let objM3 = masaKg / gestoscKgM3;
    let wynik = jObjetosc === 'l' ? objM3 * 1000 : objM3;
    
    document.getElementById('objetosc-stali').value = wynik.toFixed(4);
}

// ============================================
// LOGIKA SEKCJI 2: GEOMETRIA (W LOCIE)
// ============================================
function obliczGeometrie() {
    const D_in = parseFloat(document.getElementById('D').value);
    const d_in = parseFloat(document.getElementById('d').value);
    const h_in = parseFloat(document.getElementById('h').value);

    if (isNaN(D_in) || isNaN(d_in) || isNaN(h_in)) {
        document.getElementById('objetosc-geometria').value = "";
        return;
    }

    const toMeters = (val, unit) => {
        if (unit === 'cm') return val / 100;
        if (unit === 'mm') return val / 1000;
        return val;
    };

    const D = toMeters(D_in, document.getElementById('j-D').value);
    const d = toMeters(d_in, document.getElementById('j-d').value);
    const h = toMeters(h_in, document.getElementById('j-h').value);

    const R = D / 2;
    const r = d / 2;
    const objM3 = (1/3) * Math.PI * h * (Math.pow(R, 2) + (R * r) + Math.pow(r, 2));

    const jObjetosc = document.getElementById('j-objetosc2').value;
    let wynik = jObjetosc === 'l' ? objM3 * 1000 : objM3;

    document.getElementById('objetosc-geometria').value = wynik.toFixed(4);
}

// ============================================
// LOGIKA SEKCJI 3: STRUMIEŃ Z MIESZANKĄ GAZÓW
// ============================================
function obliczSekcje3() {
    // 1. Odczytywanie i obsługa suwaka gazów
    const procentAr = parseInt(document.getElementById('proporcja-gazu').value);
    const procentO2 = 100 - procentAr;
    
    // Aktualizacja etykiety na żywo
    document.getElementById('gaz-etykieta').innerText = `${procentO2}% O₂ / ${procentAr}% Ar`;

    // 2. Pobieranie Gęstości Stali
    const gestoscInput = parseFloat(document.getElementById('gestosc3').value);
    const jGestosc = document.getElementById('j-gestosc3').value;

    if (isNaN(gestoscInput) || gestoscInput <= 0) {
        document.getElementById('C').value = "";
        document.getElementById('C_prime').value = "";
        document.getElementById('Q_prime').value = "";
        return;
    }

    const gestoscStaliKgM3 = jGestosc === 'g/cm3' ? gestoscInput * 1000 : gestoscInput;

    // 3. Obliczanie efektywnej Masy Molowej i Gęstości Mieszanki Gazu
    const xAr = procentAr / 100;
    const xO2 = procentO2 / 100;

    const masaMolowaMieszanki = (xAr * BAZA_GAZOW['argon'].M) + (xO2 * BAZA_GAZOW['tlen'].M);
    const gestoscMieszanki = (xAr * BAZA_GAZOW['argon'].rho) + (xO2 * BAZA_GAZOW['tlen'].rho);

    // 4. Obliczanie stałych C i C'
    const C_prime = Math.pow(M_POWIETRZA, 2) / (RHO_POWIETRZA * RHO_WODY);
    const C = Math.pow(masaMolowaMieszanki, 2) / (gestoscMieszanki * gestoscStaliKgM3);

    document.getElementById('C_prime').value = C_prime.toFixed(3);
    document.getElementById('C').value = C.toFixed(3);

    // 5. Obliczenia Strumienia (Froude) z ułamkiem skali 1:X
    const slMianownik = parseFloat(document.getElementById('SL_mianownik').value);
    const Q_in = parseFloat(document.getElementById('Q').value);
    
    if (isNaN(slMianownik) || slMianownik <= 0 || isNaN(Q_in)) {
        document.getElementById('Q_prime').value = "";
        return;
    }

    const SL = 1 / slMianownik;
    const jQ = document.getElementById('j-Q').value;
    const jQPrime = document.getElementById('j-Q-prime').value;

    let qM3S = Q_in;
    if (jQ === 'l/min') qM3S = Q_in / 60000;
    if (jQ === 'm3/h') qM3S = Q_in / 3600;

    let qPrimeM3S = Math.pow((C_prime / C), -0.5) * Math.pow(SL, 2.5) * qM3S;

    let wynik = qPrimeM3S;
    if (jQPrime === 'l/min') wynik = qPrimeM3S * 60000;
    if (jQPrime === 'm3/h') wynik = qPrimeM3S * 3600;

    document.getElementById('Q_prime').value = wynik.toFixed(3);
}

// Funkcja zbiorcza do odświeżenia przed eksportem
function obliczWszystko() {
    obliczSekcje1();
    obliczGeometrie();
    obliczSekcje3();
}

// ============================================
// MODUŁ RTD
// ============================================
let rtdPunkty = [];
let wykresRTD = null;

function inicjujWykres() {
    if (typeof Chart === 'undefined') return;
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

// ============================================
// EKSPORT I RAPORTY
// ============================================
function generujTekst() {
    obliczWszystko(); 
    
    const volGeo = document.getElementById('objetosc-geometria').value || "Brak danych";
    const unitGeo = document.getElementById('j-objetosc2').value;
    const Q = document.getElementById('Q').value || "Brak danych";
    const unitQ = document.getElementById('j-Q').value;
    const C = document.getElementById('C').value || "Brak danych";
    const C_prime = document.getElementById('C_prime').value || "Brak danych";
    
    const slMianownik = document.getElementById('SL_mianownik').value;
    const SL = slMianownik ? `1 : ${slMianownik}` : "Brak danych";
    
    const gazMix = document.getElementById('gaz-etykieta').innerText;
    
    const Q_prime = document.getElementById('Q_prime').value || "Brak obliczen";
    const unitQPrime = document.getElementById('j-Q-prime').value;
    const ksztaltka = document.getElementById('typ-ksztaltki').value;
    const znacznik = document.getElementById('znacznik').value || "Brak danych";

    let raportTekst = `WYNIKI EKSPERYMENTU - MODELOWANIE FIZYCZNE KADZI
--------------------------------------------------
Zastosowana ksztaltka: ${ksztaltka}
Objetosc znacznika (KMnO4+NaCl): ${znacznik} ml

Geometria: Objetosc reaktora obliczona: ${volGeo} ${unitGeo}
Wspolczynnik skali modelu: ${SL}
Gaz roboczy (mieszanka): ${gazMix}
Stala reaktora (C): ${C}
Stala modelu (C'): ${C_prime}

Zalozony strumien gazu dla reaktora (Q): ${Q} ${unitQ}
OBLICZONY STRUMIEN DLA MODELU (Q'): ${Q_prime} ${unitQPrime}
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
    
    const uGeo = document.getElementById('j-objetosc2').value;
    const uQ = document.getElementById('j-Q').value;
    const uQp = document.getElementById('j-Q-prime').value;
    
    const slMianownik = document.getElementById('SL_mianownik').value;
    const SL = slMianownik ? `1 : ${slMianownik}` : "-";
    const gazMix = document.getElementById('gaz-etykieta').innerText;

    doc.text(`Objetosc obliczona z geometrii: ${document.getElementById('objetosc-geometria').value || '-'} ${uGeo}`, 20, 35);
    doc.text(`Wspolczynnik skali modelu: ${SL}`, 20, 45);
    doc.text(`Mieszanka gazowa: ${gazMix}`, 20, 55);
    doc.text(`Stala (C): ${document.getElementById('C').value || '-'}  |  Stala modelu (C'): ${document.getElementById('C_prime').value || '-'}`, 20, 65);
    doc.text(`Strumien w reaktorze (Q): ${document.getElementById('Q').value || '-'} ${uQ}`, 20, 75);
    doc.text(`Strumien w modelu (Q'): ${document.getElementById('Q_prime').value || '-'} ${uQp}`, 20, 85);
    doc.text(`Typ ksztaltki: ${document.getElementById('typ-ksztaltki').value}`, 20, 100);
    doc.text(`Objetosc znacznika (KMnO4+NaCl): ${document.getElementById('znacznik').value || '-'} ml`, 20, 110);
    
    doc.text("Zarejestrowane punkty RTD:", 20, 130);
    let yPos = 140;
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