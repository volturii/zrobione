// Ukryj przycisk logowania na samym początku
document.getElementById('loginButton').style.display = 'none';

firebase.auth().onAuthStateChanged(async function(user) {
    // Pokaż przycisk logowania tylko wtedy, gdy stan autentykacji został już sprawdzony
    document.getElementById('loginButton').style.display = user ? 'none' : 'block';

    if (user) {
        if (user.displayName !== null) {
            showDisplayName(user.displayName);
        } else {
            try {
                const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
                const usernameFromFirestore = userDoc.data().displayName;
                if (usernameFromFirestore) {
                    showDisplayName(usernameFromFirestore);
                } else {
                    console.warn("Nazwa użytkownika jest ustawiona na null.");
                }
            } catch (error) {
                console.error("Błąd podczas pobierania danych z Firestore:", error);
            }
        }
    } else {
        hideDisplayName();
    }
});

function hideLoginButton() {
    const loginButtonElement = document.getElementById('loginButton');

    if (loginButtonElement) {
        loginButtonElement.style.display = 'none';
    } else {
        console.error("Element 'loginButton' not found.");
    }
}

function showDisplayName(displayName) {
    const userDisplayNameElement = document.getElementById('userDisplayName');
    const loginButtonElement = document.getElementById('loginButton');
    const logoutButtonElement = document.getElementById('logoutButton');

    if (userDisplayNameElement && loginButtonElement && logoutButtonElement) {
        userDisplayNameElement.innerHTML = 'Witaj, ' + displayName + '!';
        loginButtonElement.style.display = 'none';
        logoutButtonElement.style.display = 'block';
    } else {
        console.error("One or more elements not found.");
    }
}

function hideDisplayName() {
    const userDisplayNameElement = document.getElementById('userDisplayName');

    if (userDisplayNameElement) {
        userDisplayNameElement.innerHTML = '';
    } else {
        console.error("Element 'userDisplayName' not found.");
    }
}

function logout() {
    auth.signOut().then(() => {
        alert('Wylogowano pomyślnie!');
        document.getElementById('userDisplayName').innerText = '';
    }).catch((error) => {
        alert(error.message);
    });
}
