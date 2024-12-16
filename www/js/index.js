document.addEventListener('deviceready', function () {
    console.log('Cordova is ready');
    initializeApp();
});

function initializeApp() {
    document.getElementById('addIncidentBtn').addEventListener('click', showAddIncident);
    document.getElementById('viewIncidentsBtn').addEventListener('click', showIncidents);
    document.getElementById('loginBtn').addEventListener('click', showLogin);

    showLogin();
}

const API_URL = "https://demo.wp-api.org/wp-json/wp/v2";
let authToken = "";

function showAddIncident() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Report an Incident</h2>
        <form id="incidentForm">
            <label for="title">Title</label>
            <input type="text" id="title" name="title" required>
            <label for="category">Category</label>
            <select id="category" name="category">
                <option value="1">Accident</option>
                <option value="2">Fighting</option>
                <option value="3">Rioting</option>
            </select>
            <label for="description">Description</label>
            <textarea id="description" name="description"></textarea>
            <label for="image">Image</label>
            <input type="file" id="image" accept="image/*">
            <button type="button" onclick="submitIncident()">Submit</button>
        </form>
    `;
}

function submitIncident() {
    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const imageFile = document.getElementById('image').files[0];

    const formData = new FormData();
    formData.append('file', imageFile);

    fetch(`${API_URL}/media`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
        body: formData,
    })
        .then((response) => response.json())
        .then((media) => {
            const mediaId = media.id;

            navigator.geolocation.getCurrentPosition((position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const incidentData = {
                    title: title,
                    categories: [category],
                    content: description,
                    meta: {
                        latitude,
                        longitude,
                    },
                    featured_media: mediaId,
                    status: "publish",
                };

                fetch(`${API_URL}/posts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(incidentData),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        alert('Incident reported successfully');
                        showIncidents();
                    })
                    .catch((error) => console.error('Error submitting incident:', error));
            });
        })
        .catch((error) => console.error('Error uploading image:', error));
}

function showIncidents() {
    const content = document.getElementById('content');
    fetch(`${API_URL}/posts`)
        .then((response) => response.json())
        .then((posts) => {
            content.innerHTML = '<h2>Submitted Incidents</h2>';
            posts.forEach((post) => {
                content.innerHTML += `
                    <div class="incident">
                        <h3>${post.title.rendered}</h3>
                        <p>${post.content.rendered}</p>
                    </div>
                `;
            });
        })
        .catch((error) => console.error('Error fetching incidents:', error));
}

function showIncidentsByCategory(categoryId) {
    const content = document.getElementById('content');
    fetch(`${API_URL}/posts?categories=${categoryId}`)
        .then((response) => response.json())
        .then((posts) => {
            content.innerHTML = `<h2>Category ${categoryId} Incidents</h2>`;
            posts.forEach((post) => {
                content.innerHTML += `
                    <div class="incident">
                        <h3>${post.title.rendered}</h3>
                        <p>${post.content.rendered}</p>
                    </div>
                `;
            });
        })
        .catch((error) => console.error('Error fetching incidents by category:', error));
}

function showLogin() {
    const content = document.getElementById('content');
    content.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required>
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
            <button type="button" onclick="login()">Login</button>
        </form>
    `;
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch(`${API_URL}/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then((response) => response.json())
        .then((data) => {
            authToken = data.token;
            alert('Login successful');
            showIncidents();
        })
        .catch((error) => console.error('Error during login:', error));
}

function configurePushNotifications() {
    FirebasePlugin.onMessageReceived((message) => {
        console.log('New notification:', message);
        alert('New Incident Reported!');
    }, (error) => {
        console.error('Error with push notifications:', error);
    });
}
