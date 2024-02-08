// Kontakt.js

document.addEventListener('DOMContentLoaded', () => {
    // Importuj funkcje Firestore
    const { getDocs, collection } = firebase.firestore;

    // Pobierz referencję do kolekcji "kontakt" z Firestore
    const kontaktCollection = collection(firebase.firestore(), 'kontakt');

    // Pobierz wszystkie dokumenty z kolekcji
    getDocs(kontaktCollection)
        .then((querySnapshot) => {
            const contactList = document.getElementById('contact-list');

            // Iteruj przez dokumenty i dodaj do listy
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Twórz elementy listy
                const listItem = document.createElement('li');
                listItem.innerHTML = `<strong>Email:</strong> ${data.email}, <strong>Temat:</strong> ${data.temat}, <strong>Wiadomość:</strong> ${data.wiadomosc}`;

                // Dodaj element listy do dokumentu
                contactList.appendChild(listItem);
            });
        })
        .catch((error) => {
            console.error('Błąd podczas pobierania danych:', error);
        });
});
