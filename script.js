// Główna funkcja wywoływana przyciskiem obliczeń
function obliczWszystko() {
    obliczObjetoscStali();
    obliczObjetoscGeometrii();
    obliczStrumienModelu();
}

// 1. Objętość cieczy na podstawie masy i gęstości
function obliczObjetoscStali() {
    const masa = parseFloat(document.getElementById('masa').value);
    const gestosc = parseFloat(document.getElementById('gestosc').value);
    const wyjscie = document.getElementById('objetosc-stali');

    if (!isNaN(masa) && !isNaN(gestosc) && gestosc !== 0) {
        wyjscie.value = (masa / gestosc).toFixed(4);
    } else {
        wyjscie.value = "";
    }
}

// 2. Objętość stożka ściętego (kadź)
function obliczObjetoscGeometrii() {
    const D = parseFloat(document.getElementById('D').value);
    const d = parseFloat(document.getElementById('d').value);
    const h = parseFloat(document.getElementById('h').value);
    const wyjscie = document.getElementById('objetosc-geometria');

    if (!isNaN(D) && !isNaN(d) && !isNaN(h)) {
        const R = D / 2;
        const r = d / 2;
        // Wzór: V = 1/3 * pi * h * (R^2 + R*r + r^2)
        const v = (1/3) * Math.PI * h * (Math.pow(R, 2) + (R * r) + Math.pow(r, 2));
        wyjscie.value = v.toFixed(4);
    } else {
        wyjscie.value = "";
    }
}

// 3. Strumień gazu w modelu (zmodyfikowana liczba Froude'a)
function obliczStrumienModelu() {
    const cRatio = parseFloat(document.getElementById('C_ratio').value);
    const SL = parseFloat(document.getElementById('SL').value);
    const Q = parseFloat(document.getElementById('Q').value);
    const wyjscie = document.getElementById('Q_prime');

    if (!isNaN(cRatio) && !isNaN(SL) && !isNaN(Q)) {
        // Wzór: Q' = (C'/C)^(-1/2) * (SL)^(5/2) * Q
        const potegaCRatio = Math.pow(cRatio, -0.5);
        const potegaSL = Math.pow(SL, 2.5);
        
        const qPrime = potegaCRatio * potegaSL * Q;
        wyjscie.value = qPrime.toFixed(6); 
    } else {
        wyjscie.value = "";
    }
}

// 4. Generowanie podsumowania do sprawozdania
function generujSprawozdanie() {
    // Odpalenie obliczeń na wypadek gdyby użytkownik zapomniał
    obliczWszystko(); 

    const typKsztaltki = document.getElementById('typ-ksztaltki').options[document.getElementById('typ-ksztaltki').selectedIndex].text;
    const znacznik = document.getElementById('znacznik').value || "Brak danych";
    const czasWymieszania = document.getElementById('czas-wymieszania').value || "Brak danych";
    const qPrime = document.getElementById('Q_prime').value || "Brak danych";
    const volGeometria = document.getElementById('objetosc-geometria').value || "Brak danych";

    const raportTekst = `WYNIKI EKSPERYMENTU - MODELOWANIE FIZYCZNE KADZI
--------------------------------------------------
Zastosowana kształtka: ${typKsztaltki}
Obliczona objętość cieczy w modelu: ${volGeometria} m³
Wymagany strumień gazu (Q'): ${qPrime} m³/s
Ilość dodanego znacznika (KMnO4 + NaCl): ${znacznik} ml

WYNIKI Z REJESTRATORA (Krzywe RTD):
Wyznaczony minimalny czas wymieszania znacznika: ${czasWymieszania} s.`;

    // Pokaż kontener i wrzuć tekst
    const kontener = document.getElementById('raport-container');
    const poleTekstowe = document.getElementById('raport-text');
    
    kontener.classList.remove('hidden');
    poleTekstowe.value = raportTekst;
}