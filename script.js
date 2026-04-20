// Główna funkcja wywoływana przyciskiem
function obliczWszystko() {
    obliczObjetoscZMasy();
    obliczObjetoscZGeometrii();
    obliczStrumienModelu();
}

// 1. Obliczanie objętości na podstawie masy i gęstości
function obliczObjetoscZMasy() {
    const masa = parseFloat(document.getElementById('masa').value);
    const gestosc = parseFloat(document.getElementById('gestosc').value);
    const wyjscie = document.getElementById('objetosc-stali-1');

    if (!isNaN(masa) && !isNaN(gestosc) && gestosc !== 0) {
        const objetosc = masa / gestosc;
        wyjscie.value = objetosc.toFixed(4); // Zaokrąglenie do 4 miejsc po przecinku
    } else {
        wyjscie.value = "";
    }
}

// 2. Obliczanie objętości z geometrii (wzór na objętość stożka ściętego)
function obliczObjetoscZGeometrii() {
    const D = parseFloat(document.getElementById('D').value);
    const d = parseFloat(document.getElementById('d').value);
    const h = parseFloat(document.getElementById('h').value);
    const wyjscie = document.getElementById('objetosc-stali-2');

    if (!isNaN(D) && !isNaN(d) && !isNaN(h)) {
        const promienGorny = D / 2;
        const promienDolny = d / 2;
        
        // V = (1/3) * pi * h * (R^2 + R*r + r^2)
        const objetosc = (1/3) * Math.PI * h * (Math.pow(promienGorny, 2) + (promienGorny * promienDolny) + Math.pow(promienDolny, 2));
        wyjscie.value = objetosc.toFixed(4);
    } else {
        wyjscie.value = "";
    }
}

// 3. Obliczanie strumienia gazu w modelu
function obliczStrumienModelu() {
    const C = parseFloat(document.getElementById('C').value);
    const C_prime = parseFloat(document.getElementById('C_prime').value);
    const SL = parseFloat(document.getElementById('SL').value);
    const Q = parseFloat(document.getElementById('Q').value);
    
    const wyjscie = document.getElementById('Q_prime');
    const wybranaJednostka = document.getElementById('jednostka-Q').value;
    document.getElementById('jednostka-Q-wynik').innerText = wybranaJednostka;

    if (!isNaN(C) && !isNaN(C_prime) && !isNaN(SL) && !isNaN(Q) && C !== 0) {
        
        // Wzór: Q' = (C'/C)^(-1/2) * (SL)^(5/2) * Q
        const potegaC = Math.pow((C_prime / C), -0.5);
        const potegaSL = Math.pow(SL, 2.5); // 5/2 to inaczej 2.5
        
        const Q_prime = potegaC * potegaSL * Q;
        
        wyjscie.value = Q_prime.toFixed(6); 
    } else {
        wyjscie.value = "";
    }
}