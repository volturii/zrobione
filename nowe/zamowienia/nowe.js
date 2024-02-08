const confirmationMessage = document.getElementById('confirmationMessage');
// Zdefiniuj referencję do kolekcji produkty na poziomie globalnym
const productsRef = db.collection('produkty');
// Funkcja do pobierania listy produktów i aktualizowania rozwijanej listy w formularzu
function loadProducts() {
    const produktyContainer = document.getElementById('produktyContainer');

    // Sprawdź, czy element został znaleziony
    if (!produktyContainer) {
        console.error('Nie można znaleźć elementu "produktyContainer" na stronie.');
        return;
    }

    // Wyczyść istniejące opcje przed dodaniem nowych
    produktyContainer.innerHTML = '';

    // Dodaj pierwsze pole produktu
    addProductRow();
}

// Dodaj nowe pole produktu do formularza
function addProductRow() {
    const produktyContainer = document.getElementById('produktyContainer');

    if (!produktyContainer) {
        console.error('Nie można znaleźć elementu "produktyContainer" na stronie.');
        return;
    }

    const produktRow = document.createElement('div');
    produktRow.classList.add('produkt-row');

    produktRow.innerHTML = `
        <label for="produkt">Wybierz produkt:</label>
        <select class="produkt" name="produkt" required></select>
        <label for="ilosc">Ilość produktu (Dostępne: <span class="dostepnaIlosc"></span>):</label>
        <input type="number" class="ilosc" name="ilosc" required>
    `;

    produktyContainer.appendChild(produktRow);

    const produktySelect = produktRow.querySelector('.produkt');
    const dostepnaIloscSpan = produktRow.querySelector('.dostepnaIlosc');


    productsRef.get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const productData = doc.data();
                const option = document.createElement('option');
                option.value = doc.id;
                option.text = productData.nazwa;
                produktySelect.appendChild(option);
            });
        })
        .catch((error) => {
            console.error('Error loading products: ', error);
        });

    produktySelect.addEventListener('change', function () {
        const selectedProductId = produktySelect.value;

        productsRef.doc(selectedProductId).get()
            .then((doc) => {
                const productData = doc.data();
                const dostepnaIlosc = productData.dostepna_ilosc || 0;

                dostepnaIloscSpan.textContent = dostepnaIlosc;
            })
            .catch((error) => {
                console.error('Error loading product details: ', error);
            });
    });
}

// Funkcja sprawdzająca dostępność konkretnego produktu
function checkProductAvailability(productId, callback) {
    productsRef.doc(productId).get()
        .then((doc) => {
            const productData = doc.data();
            const dostepnaIlosc = productData.dostepna_ilosc || 'nie';

            const isAvailable = dostepnaIlosc === 'tak';
            callback(isAvailable);
        })
        .catch((error) => {
            console.error('Error checking product availability: ', error);
            callback(false);
        });
}

// Funkcja sprawdzająca dostępność wszystkich produktów przed wysłaniem zamówienia
function checkAllProductsAvailability(products, callback) {
    let allAvailable = true;
    let counter = 0;

    function checkNextProduct() {
        if (counter < products.length) {
            const produktSelect = products[counter].querySelector('.produkt');
            const iloscInput = products[counter].querySelector('.ilosc');
            const dostepnaIloscSpan = products[counter].querySelector('.dostepnaIlosc');
            const selectedProductId = produktSelect.value;
            const selectedQuantity = iloscInput.value;

            checkProductAvailability(selectedProductId, function (isAvailable) {
                if (!isAvailable) {
                    allAvailable = false;
                    dostepnaIloscSpan.style.color = 'red';
                } else {
                    dostepnaIloscSpan.style.color = 'black';
                }
                counter++;
                checkNextProduct();
            });
        } else {
            callback(allAvailable);
        }
    }

    checkNextProduct();
}

// Wywołaj funkcję załadowania produktów przy starcie aplikacji
loadProducts();

// Sprawdź, czy użytkownik jest zalogowany
auth.onAuthStateChanged((user) => {
    if (user) {
        // Użytkownik jest zalogowany, pobierz i wyświetl jego dane

        // Dodaj nasłuchiwanie na zdarzenie submit formularza
        const form = document.querySelector('form');
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            const imie = document.getElementById('imie').value;
            const email = document.getElementById('email').value;
            const telefon = document.getElementById('telefon').value;

            const produkty = document.querySelectorAll('.produkt-row');
            const zamowienie = [];

            checkAllProductsAvailability(produkty, function (allAvailable) {
                if (allAvailable) {
                    produkty.forEach((produkt) => {
                        const produktSelect = produkt.querySelector('.produkt');
                        const iloscInput = produkt.querySelector('.ilosc');

                        const produktId = produktSelect.value;
                        const ilosc = iloscInput.value;

                        const selectedProduct = Array.from(produktSelect.options).find(option => option.value === produktId);
                        const produktNazwa = selectedProduct ? selectedProduct.text : 'Nieznany produkt';

                        zamowienie.push({
                            produkt: produktNazwa,
                            ilosc: ilosc,
                        });
                    });

                    const uid = auth.currentUser.uid;
                    const currentDate = new Date();
                    const opis = 'Wysłano';

                    db.collection('users').doc(uid).collection('formData').add({
                        imie: imie,
                        email: email,
                        telefon: telefon,
                        zamowienie: zamowienie,
                        data: currentDate,
                        opis: opis
                    })
                    .then(() => {
                        console.log('Dane zapisane poprawnie');
                        form.reset();
                        
                        confirmationMessage.textContent = 'Pomyślnie wysłano!';
                    })
                    .catch((error) => {
                        console.error('Błąd podczas zapisywania danych: ', error);
                        alert(error.message);
                    });

                    console.log('Po zapisie do Firestore');
                } else {
                    alert('Jeden z produktów jest niedostępny. Proszę wybrać inny produkt.');
                }
            });
        });
    } else {
        window.location.href = '../logowanie-rejestracja/logowanie.html';
    }
});
