document.addEventListener('deviceready', function () {
    console.log('Cordova is ready');
    initializeApp();
});

function initializeApp() {
    authToken = localStorage.getItem('authToken') || "";
    if (authToken) {
        showIncidents();
        document.getElementById('addIncidentBtn').style.display = 'inline-block';
        document.getElementById('viewIncidentsBtn').style.display = 'inline-block';
    } else {
        showLogin();
    }

    document.getElementById('addIncidentBtn').addEventListener('click', () => {
        if (!authToken) {
            alert("Please log in to add an incident.");
            showLogin();
        } else {
            showAddIncident();
        }
    });

    document.getElementById('viewIncidentsBtn').addEventListener('click', () => {
        if (!authToken) {
            alert("Please log in to view incidents.");
            showLogin();
        } else {
            showIncidents();
        }
    });

    document.getElementById('loginBtn').addEventListener('click', showLogin);
}


const API_URL = "https://jsonplaceholder.typicode.com";
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
    if (!authToken) {
        alert("You must be logged in to submit an incident.");
        showLogin();
        return;
    }

    const title = document.getElementById('title').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;

    const incidentData = {
        title: title,
        body: description,
        userId: 1, // For testing
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
            console.log('Incident submitted:', data);
            alert('Incident reported successfully!');
            showIncidents();
        })
        .catch((error) => {
            console.error('Error submitting incident:', error);
            alert('Failed to submit the incident. Please try again.');
        });
}


function showIncidents() {
    if (!authToken) {
        alert("You must be logged in to view incidents.");
        showLogin();
        return;
    }

    const content = document.getElementById('content');
    content.innerHTML = '<h2>Loading...</h2>';

    fetch(`${API_URL}/posts`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`,
        },
    })
        .then((response) => response.json())
        .then((posts) => {
            content.innerHTML = '<h2>Submitted Incidents</h2>';
            posts.forEach((post) => {
                content.innerHTML += `
                    <div class="incident">
                        <h3>${post.title}</h3>
                        <p>${post.body}</p>
                    </div>
                `;
            });
        })
        .catch((error) => {
            console.error('Error fetching incidents:', error);
            alert('Failed to load incidents. Please try again.');
            showLogin();
        });
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
            if (data.token) {
                authToken = data.token;
                console.log('Token received:', authToken);
                alert('Login successful');

                showIncidents();
            } else {
                throw new Error('Invalid login. Please check your credentials.');
            }
        })
        .catch((error) => {
            console.error('Error during login:', error);
            alert('Login failed. Please try again.');
        });

    localStorage.setItem('authToken', data.token);
}


/**
function configurePushNotifications() {
    FirebasePlugin.onMessageReceived((message) => {
        console.log('New notification:', message);
        alert('New Incident Reported!');
    }, (error) => {
        console.error('Error with push notifications:', error);
    });
}
*/
