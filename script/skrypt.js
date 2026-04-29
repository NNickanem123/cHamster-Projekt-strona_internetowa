if (localStorage.getItem("tryb_nocny") === "on") {
  document.body.classList.add("tryb_nocny");
}

function tryb_nocny() {
  document.body.classList.toggle("tryb_nocny");

  if (document.body.classList.contains("tryb_nocny")) {
    localStorage.setItem("tryb_nocny", "on");
  } else {
    localStorage.setItem("tryb_nocny", "off");
  }
}
let currentUser = null;
let balance = 1000;
let bets = {};
let raceInProgress = false;
let raceResults = [];
let blackHamsterBoost = 0;
let activeSkins = [];
let useMyHamster = false;

const hamsterColors = [
    { name: 'Czerwony', color: '#ff6b6b', class: 'ball-red' },
    { name: 'Niebieski', color: '#4ecdc4', class: 'ball-blue' },
    { name: 'Zielony', color: '#95e1d3', class: 'ball-green' },
    { name: 'Czarny', color: '#2c3e50', class: 'ball-black' },
    { name: 'Mój Chomik', color: '#f39c12', class: 'ball-custom' }
];

const availableSkins = [
    { id: 'wings', name: 'Skrzydła', price: 200, image: 'skrzydła.png', layer: 'overlay' },
    { id: 'crown', name: 'Korona', price: 300, image: 'korona.png', layer: 'overlay' },
    { id: 'cape', name: 'Peleryna', price: 250, image: 'peleryna.png', layer: 'back' },
    { id: 'glasses', name: 'Okulary', price: 150, image: 'okulary.png', layer: 'overlay' },
    { id: 'hat', name: 'Czapka', price: 180, image: 'czapka.png', layer: 'overlay' },
    { id: 'halo', name: 'Aureola', price: 400, image: 'aureola.png', layer: 'overlay' }
];

const hamsterImages = {
    0: 'modele homikó/czerwony homik.png',
    1: 'modele homikó/niebieski homik.png',
    2: 'modele homikó/zielony homik.png',
    3: 'modele homikó/czarny homik.png',
    4: 'modele homikó/homik.png'
};

const imageCache = {};

function loadImage(src) {
    if (imageCache[src]) {
        return imageCache[src];
    }
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
}

function preloadImages() {
    Object.values(hamsterImages).forEach(src => {
        loadImage(src);
    });
    
    availableSkins.forEach(skin => {
        if (skin.image) {
            loadImage(`modele homikó/${skin.image}`);
        }
    });
}

function getUsers() {
    const users = localStorage.getItem('hamsterRaceUsers');
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem('hamsterRaceUsers', JSON.stringify(users));
}

function getUserData(username) {
    const users = getUsers();
    return users[username] || null;
}

function saveUserData(username, data) {
    const users = getUsers();
    users[username] = data;
    saveUsers(users);
}

function createUser(username) {
    const userData = {
        username: username,
        balance: 1000,
        ownedSkins: [],
        activeSkins: [],
        useMyHamster: false
    };
    saveUserData(username, userData);
    return userData;
}

function loadUser(username) {
    let userData = getUserData(username);
    if (!userData) {
        userData = createUser(username);
    }
    currentUser = username;
    balance = userData.balance;
    activeSkins = userData.activeSkins || [];
    useMyHamster = userData.useMyHamster || false;
    updateUI();
}

function saveCurrentUser() {
    if (!currentUser) return;
    const userData = getUserData(currentUser);
    if (userData) {
        userData.balance = parseFloat(balance) || 0;
        userData.activeSkins = [...activeSkins];
        userData.useMyHamster = useMyHamster;
        saveUserData(currentUser, userData);
    }
}

function logout() {
    saveCurrentUser();
    currentUser = null;
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('mainContainer').style.display = 'none';
}