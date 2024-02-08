const firebaseConfig = {
  apiKey: "AIzaSyD67hcKrDTHGeW30e5KwsxIfw3cFc82Wnw",
  authDomain: "localhost",
  databaseURL: "https://stronamakaron-default-rtdb.firebaseio.com",
  projectId: "stronamakaron",
  storageBucket: "stronamakaron.appspot.com",
  messagingSenderId: "481194687354",
  appId: "1:481194687354:web:69e692a5508f15d21e34c3",
  measurementId: "G-9K2461DJGY"
};

firebase.initializeApp(firebaseConfig);

const wspolrzedneCollection = firebase.firestore().collection("Wspolrzedne");

const map = L.map('map', {
    scrollWheelZoom: false
}).setView([50.12457054695064, 21.753937868339456], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const markers = [];

wspolrzedneCollection.get().then(snapshot => {
    snapshot.forEach(doc => {
        const data = doc.data();
        const lat = data.lat;
        const lng = data.lng;
        const nazwaSklepu = data.nazwa_sklepu;
        const cena = data.cena;

        const marker = L.marker([lat, lng]);
        marker.bindPopup(`<b>${nazwaSklepu}</b><br>Cena: ${cena}<br><button onclick="editPoint('${doc.id}', '${nazwaSklepu}', ${cena})">Edytuj</button> <button onclick="deletePoint('${doc.id}')">Usuń</button>`).openPopup();
        markers.push(marker);
    });

    const markerGroup = L.layerGroup(markers);
    markerGroup.addTo(map);
}).catch(error => {
    console.error("Błąd pobierania danych z Firebase: ", error);
});

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        if (user.uid === "DkQXcCZgwkOkmQtGgKl4uFBlMxo2") {
            // Użytkownik jest zalogowany i ma określone ID, przepuść go
        } else {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
});

function filterMarkers() {
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    const filteredMarkers = markers.filter(marker => {
        const cenaMarker = parseFloat(marker.getPopup().getContent().split('Cena: ')[1]);
        return (isNaN(minPrice) || cenaMarker >= parseFloat(minPrice)) &&
               (isNaN(maxPrice) || cenaMarker <= parseFloat(maxPrice));
    });

    markers.forEach(marker => map.removeLayer(marker));

    const filteredMarkerGroup = L.layerGroup(filteredMarkers);
    filteredMarkerGroup.addTo(map);
}

function editPoint(docId, nazwaSklepu, cena) {
    const newNazwaSklepu = prompt('Podaj nową nazwę sklepu:', nazwaSklepu);
    const newCena = prompt('Podaj nową cenę:', cena);

    if (newNazwaSklepu !== null && newCena !== null) {
        wspolrzedneCollection.doc(docId).update({
            nazwa_sklepu: newNazwaSklepu,
            cena: parseFloat(newCena)
        }).then(() => {
            console.log('Punkt edytowany pomyślnie!');
            location.reload();
        }).catch(error => {
            console.error('Błąd edycji punktu: ', error);
        });
    }
}

function deletePoint(docId) {
    const confirmation = confirm('Czy na pewno chcesz usunąć ten punkt?');

    if (confirmation) {
        wspolrzedneCollection.doc(docId).delete().then(() => {
            console.log('Punkt usunięty pomyślnie!');
            location.reload();
        }).catch(error => {
            console.error('Błąd usuwania punktu: ', error);
        });
    }
}
