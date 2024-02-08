function showUserData(uid, daysAgo = 30) {
    const userDataList = document.getElementById('userDataList');

    userDataList.innerHTML = '';

    // Oblicz datę, która jest dniem granicznym (30 dni wstecz)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    db.collection('users').doc(uid).collection('formData')
        .where('data', '>=', startDate)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const formData = doc.data();
                const listItem = document.createElement('li');
                const date = formData.data ? formData.data.toDate().toLocaleString() : 'Brak daty';

                // Zmiany w tej sekcji
                const produktyList = formData.zamowienie.map((item) => {
                    return `<li>${item.ilosc} szt. ${item.produkt}</li>`;
                }).join('');

 listItem.innerHTML = `
    <div class="data">

      <strong>Data:</strong> ${date}<br>
    </div>

    <div class="user-detailss">
      <div class="orderFrame">
        <h3>Zamawiane produkty</h3>
        <ul>${produktyList}</ul>
      </div>

      <div class="user-infoo">
        <h3>Dane zamówienia</h3>
        <strong>Imię:</strong> ${formData.imie}<br>
        <strong>Email:</strong> ${formData.email}<br>
        <strong>Nr. telefonu:</strong> ${formData.telefon}<br>
        <strong>Opis:</strong> ${formData.opis}<br>
      </div>
    </div>
    

  `;
                userDataList.appendChild(listItem);
            });
        })
        .catch((error) => {
            alert(error.message);
        });
}

// Dodaj funkcję do obsługi przycisku lub innej formy wyboru zakresu dat
function handleDateRangeSelection() {
    const daysAgo = parseInt(document.getElementById('daysAgoInput').value, 10);
    showUserData(currentUser.uid, daysAgo);
}

// Sprawdź, czy użytkownik jest zalogowany
auth.onAuthStateChanged((user) => {
    if (user) {
        // Użytkownik jest zalogowany, pobierz i wyświetl jego dane
        currentUser = user;
        showUserData(user.uid);

        // Dodaj nasłuchiwanie na zmiany w zakresie dat
        document.getElementById('daysAgoInput').addEventListener('change', handleDateRangeSelection);
    } else {
        // Użytkownik nie jest zalogowany, przekieruj na stronę logowania
        window.location.href = 'login.html';
    }
});
