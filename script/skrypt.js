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

// Stan gry
let currentUser = null;
let balance = 1000;
let bets = {};
let raceInProgress = false;
let raceResults = [];
let blackHamsterBoost = 0; // Licznik rund do następnego boosta czarnego chomika
let activeSkins = []; // Aktywne skiny użytkownika
let useMyHamster = false; // Czy używać własnego chomika w wyścigach

// Kolory chomików
const hamsterColors = [
    { name: 'Czerwony', color: '#ff6b6b', class: 'ball-red' },
    { name: 'Niebieski', color: '#4ecdc4', class: 'ball-blue' },
    { name: 'Zielony', color: '#95e1d3', class: 'ball-green' },
    { name: 'Czarny', color: '#2c3e50', class: 'ball-black' },
    { name: 'Mój Chomik', color: '#f39c12', class: 'ball-custom' }
];

// Dostępne skiny w sklepie
const availableSkins = [
    { id: 'wings', name: 'Skrzydła', price: 200, image: 'skrzydła.png', layer: 'overlay' },
    { id: 'crown', name: 'Korona', price: 300, image: 'korona.png', layer: 'overlay' },
    { id: 'cape', name: 'Peleryna', price: 250, image: 'peleryna.png', layer: 'back' },
    { id: 'glasses', name: 'Okulary', price: 150, image: 'okulary.png', layer: 'overlay' },
    { id: 'hat', name: 'Czapka', price: 180, image: 'czapka.png', layer: 'overlay' },
    { id: 'halo', name: 'Aureola', price: 400, image: 'aureola.png', layer: 'overlay' }
];

// Mapowanie zawodników na grafiki
const hamsterImages = {
    0: 'modele homikó/czerwony homik.png',
    1: 'modele homikó/niebieski homik.png',
    2: 'modele homikó/zielony homik.png',
    3: 'modele homikó/czarny homik.png',
    4: 'modele homikó/homik.png' // Własny chomik - podstawowy
};

// Cache obrazów
const imageCache = {};

// Funkcja do ładowania obrazu do cache
function loadImage(src) {
    if (imageCache[src]) {
        return imageCache[src];
    }
    const img = new Image();
    img.src = src;
    imageCache[src] = img;
    return img;
}

// Wstępne ładowanie wszystkich obrazów
function preloadImages() {
    // Załaduj grafiki zawodników
    Object.values(hamsterImages).forEach(src => {
        loadImage(src);
    });
    
    // Załaduj grafiki skórek
    availableSkins.forEach(skin => {
        if (skin.image) {
            loadImage(`modele homikó/${skin.image}`);
        }
    });
}

// System kont
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
        userData.activeSkins = [...activeSkins]; // Kopia tablicy
        userData.useMyHamster = useMyHamster;
        saveUserData(currentUser, userData);
    }
}

function logout() {
    saveCurrentUser();
    currentUser = null;
    localStorage.removeItem('currentUser');
    if (window.location.pathname.includes('login.html')) {
        const loginModal = document.getElementById('loginModal');
        const mainContainer = document.getElementById('mainContainer');
        if (loginModal) loginModal.style.display = 'flex';
        if (mainContainer) mainContainer.style.display = 'none';
    } else {
        window.location.href = 'login.html';
    }
}

// Inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const mainContainer = document.getElementById('mainContainer');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const logoutBtn = document.getElementById('logoutBtn');
    const useMyHamsterCheckbox = document.getElementById('useMyHamster');
    const isLoginPage = window.location.pathname.includes('login.html');

    // Sprawdź czy użytkownik jest zalogowany
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        loadUser(savedUser);
        if (loginModal) loginModal.style.display = 'none';
        if (mainContainer) mainContainer.style.display = 'block';
    } else {
        if (isLoginPage) {
            if (loginModal) loginModal.style.display = 'flex';
            if (mainContainer) mainContainer.style.display = 'none';
        } else {
            window.location.href = 'login.html';
            return;
        }
    }
    
    // Logowanie
    const performLogin = () => {
        if (!usernameInput) return;
        const username = usernameInput.value.trim();
        if (username) {
            loadUser(username);
            localStorage.setItem('currentUser', username);
            if (loginModal) loginModal.style.display = 'none';
            if (mainContainer) mainContainer.style.display = 'block';
            usernameInput.value = '';
            if (isLoginPage) {
                window.location.href = 'main.html';
            }
        }
    };
    
    if (loginBtn) loginBtn.addEventListener('click', performLogin);
    if (usernameInput) {
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performLogin();
            }
        });
    }
    
    // Wylogowanie
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    
    // Nawigacja między zakładkami
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Event listeners dla wyścigów
    const canvas = document.getElementById('raceTrack');
    if (canvas) {
        // Dostosuj rozmiar canvas do ekranu mobilnego
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        const ctx = canvas.getContext('2d');
        
        document.getElementById('startRace').addEventListener('click', startRace);
        document.getElementById('resetRace').addEventListener('click', resetRace);
        
        // Wybór chomika
        document.querySelectorAll('.hamster-option').forEach(option => {
            option.addEventListener('click', () => {
                if (!raceInProgress) {
                    option.classList.toggle('selected');
                }
            });
        });
        
        // Rysuj początkowy tor
        drawTrack(ctx, canvas, 'straight');
        
        // Zmiana typu toru
        document.querySelectorAll('input[name="trackType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (!raceInProgress) {
                    drawTrack(ctx, canvas, e.target.value);
                }
            });
        });
    }
    
    // Edytor chomika
    if (useMyHamsterCheckbox) {
        useMyHamsterCheckbox.addEventListener('change', (e) => {
            useMyHamster = e.target.checked;
            saveCurrentUser();
            updateMyHamsterOption();
        });
    }
    
    // Inicjalizuj sklep i edytor
    initShop();
    initHamsterEditor();
    updateMyHamsterOption();
    
    // Wstępne ładowanie obrazów
    preloadImages();

    // Dodatkowe minigry na stronie głównej
    initMiniGames();
});

// Dostosuj rozmiar canvas do ekranu
function resizeCanvas() {
    const canvas = document.getElementById('raceTrack');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth - 30; // Odlicz padding
    const maxWidth = 800;
    const maxHeight = 400;
    
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;
    
    if (window.innerWidth <= 767) {
        // Na urządzeniach mobilnych
        canvas.width = Math.min(containerWidth, maxWidth);
        canvas.height = Math.min((canvas.width / maxWidth) * maxHeight, 300);
    } else {
        // Na większych ekranach
        canvas.width = Math.min(containerWidth, maxWidth);
        canvas.height = maxHeight;
    }
    
    // Jeśli rozmiar się zmienił, przerysuj tor
    if (canvas.width !== oldWidth || canvas.height !== oldHeight) {
        const ctx = canvas.getContext('2d');
        const trackType = document.querySelector('input[name="trackType"]:checked')?.value || 'straight';
        if (!raceInProgress) {
            drawTrack(ctx, canvas, trackType);
        }
    }
}

// Przełączanie zakładek
function switchTab(tabName) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (tabName === 'myHamster') {
        updateHamsterPreview();
    }
}

// Aktualizuj UI
function updateUI() {
    if (!currentUser) return;

    const userNameElement = document.getElementById('userName');
    if (userNameElement) {
        userNameElement.textContent = currentUser;
    }

    updateBalance();
    updateShop();
    updateHamsterEditor();
    updateMyHamsterOption();
}

// Aktualizuj opcję własnego chomika
function updateMyHamsterOption() {
    const myHamsterOption = document.getElementById('myHamsterOption');
    if (myHamsterOption) {
        if (useMyHamster && activeSkins.length > 0) {
            myHamsterOption.style.display = 'block';
            updateMyHamsterPreview();
        } else {
            myHamsterOption.style.display = 'none';
        }
    }
}

// Sklep
function initShop() {
    updateShop();
}

function updateShop() {
    if (!currentUser) return;
    
    const userData = getUserData(currentUser);
    const ownedSkins = userData.ownedSkins || [];
    const shopGrid = document.getElementById('shopGrid');
    
    if (!shopGrid) return;
    
    shopGrid.innerHTML = '';
    
    availableSkins.forEach(skin => {
        const isOwned = ownedSkins.includes(skin.id);
        const shopItem = document.createElement('div');
        shopItem.className = `shop-item ${isOwned ? 'owned' : ''}`;
        
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = 100;
        previewCanvas.height = 100;
        drawSkinPreview(previewCanvas.getContext('2d'), skin);
        
        shopItem.innerHTML = `
            <div class="shop-item-preview"></div>
            <div class="shop-item-name">${skin.name}</div>
            <div class="shop-item-price">${skin.price} zł</div>
            <button class="shop-item-btn" ${isOwned ? 'disabled' : ''} data-skin-id="${skin.id}">
                ${isOwned ? 'Posiadasz' : 'Kup'}
            </button>
        `;
        
        shopItem.querySelector('.shop-item-preview').appendChild(previewCanvas);
        
        if (!isOwned) {
            shopItem.querySelector('.shop-item-btn').addEventListener('click', () => {
                buySkin(skin);
            });
        }
        
        shopGrid.appendChild(shopItem);
    });
}

function buySkin(skin) {
    if (!currentUser) return;
    
    // Upewnij się, że balance jest liczbą
    balance = parseFloat(balance) || 0;
    
    if (balance < skin.price) {
        alert(`Nie masz wystarczających środków! Potrzebujesz ${skin.price} zł.`);
        return;
    }
    
    const userData = getUserData(currentUser);
    if (!userData) {
        alert('Błąd: Nie znaleziono danych użytkownika!');
        return;
    }
    
    if (!userData.ownedSkins) {
        userData.ownedSkins = [];
    }
    
    if (userData.ownedSkins.includes(skin.id)) {
        alert('Już posiadasz ten skin!');
        return;
    }
    
    // Odejmij cenę od salda
    balance = balance - skin.price;
    balance = parseFloat(balance.toFixed(2)); // Zaokrąglij do 2 miejsc po przecinku
    
    // Zapisz zakupiony skin
    userData.ownedSkins.push(skin.id);
    userData.balance = balance;
    saveUserData(currentUser, userData);
    
    // Aktualizuj UI
    updateBalance();
    updateShop();
    updateHamsterEditor();
    alert(`Kupiłeś ${skin.name} za ${skin.price} zł!`);
}

function drawSkinPreview(ctx, skin) {
    ctx.clearRect(0, 0, 100, 100);
    
    // Rysuj podstawowego chomika
    const baseImg = loadImage('modele homikó/homik.png');
    if (baseImg.complete) {
        ctx.drawImage(baseImg, 25, 25, 50, 50);
        
        // Rysuj skin jeśli dostępny
        if (skin.image) {
            const skinImg = loadImage(`modele homikó/${skin.image}`);
            if (skinImg.complete) {
                ctx.drawImage(skinImg, 25, 25, 50, 50);
            } else {
                skinImg.onload = () => {
                    ctx.drawImage(skinImg, 25, 25, 50, 50);
                };
            }
        }
    } else {
        baseImg.onload = () => {
            ctx.drawImage(baseImg, 25, 25, 50, 50);
            if (skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (skinImg.complete) {
                    ctx.drawImage(skinImg, 25, 25, 50, 50);
                } else {
                    skinImg.onload = () => {
                        ctx.drawImage(skinImg, 25, 25, 50, 50);
                    };
                }
            }
        };
    }
}

// Edytor chomika
function initHamsterEditor() {
    updateHamsterEditor();
}

function updateHamsterEditor() {
    if (!currentUser) return;
    
    const userData = getUserData(currentUser);
    const ownedSkins = userData.ownedSkins || [];
    const ownedSkinsDiv = document.getElementById('ownedSkins');
    const activeLayersDiv = document.getElementById('activeLayers');
    const useMyHamsterCheckbox = document.getElementById('useMyHamster');
    
    if (!ownedSkinsDiv || !activeLayersDiv) return;
    
    // Pokaż zakupione skiny
    ownedSkinsDiv.innerHTML = '';
    
    if (ownedSkins.length === 0) {
        ownedSkinsDiv.innerHTML = '<p class="no-skins">Nie masz jeszcze żadnych skórek. Odwiedź sklep!</p>';
    } else {
        ownedSkins.forEach(skinId => {
            const skin = availableSkins.find(s => s.id === skinId);
            if (!skin) return;
            
            const isActive = activeSkins.includes(skinId);
            const skinItem = document.createElement('div');
            skinItem.className = `owned-skin-item ${isActive ? 'active' : ''}`;
            
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 80;
            previewCanvas.height = 80;
            drawSkinPreview(previewCanvas.getContext('2d'), skin);
            
            skinItem.innerHTML = `
                <div class="owned-skin-preview"></div>
                <div class="owned-skin-name">${skin.name}</div>
            `;
            
            skinItem.querySelector('.owned-skin-preview').appendChild(previewCanvas);
            
            skinItem.addEventListener('click', () => {
                toggleSkin(skinId);
            });
            
            ownedSkinsDiv.appendChild(skinItem);
        });
    }
    
    // Pokaż aktywne warstwy
    activeLayersDiv.innerHTML = '';
    
    if (activeSkins.length === 0) {
        activeLayersDiv.innerHTML = '<p class="no-skins">Brak aktywnych skórek</p>';
    } else {
        activeSkins.forEach(skinId => {
            const skin = availableSkins.find(s => s.id === skinId);
            if (!skin) return;
            
            const layerItem = document.createElement('div');
            layerItem.className = 'active-layer-item';
            layerItem.innerHTML = `
                <span>${skin.name}</span>
                <button onclick="removeSkin('${skinId}')">Usuń</button>
            `;
            activeLayersDiv.appendChild(layerItem);
        });
    }
    
    if (useMyHamsterCheckbox) {
        useMyHamsterCheckbox.checked = useMyHamster;
    }
    
    updateHamsterPreview();
}

function toggleSkin(skinId) {
    const index = activeSkins.indexOf(skinId);
    if (index > -1) {
        activeSkins.splice(index, 1);
    } else {
        activeSkins.push(skinId);
    }
    saveCurrentUser();
    updateHamsterEditor();
    updateMyHamsterOption();
}

function removeSkin(skinId) {
    const index = activeSkins.indexOf(skinId);
    if (index > -1) {
        activeSkins.splice(index, 1);
        saveCurrentUser();
        updateHamsterEditor();
        updateMyHamsterOption();
    }
}

function updateHamsterPreview() {
    const canvas = document.getElementById('hamsterPreview');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 200, 200);
    
    const baseImgSrc = hamsterImages[4];
    const baseImg = loadImage(baseImgSrc);
    
    const backSkins = activeSkins.filter(skinId => {
        const skin = availableSkins.find(s => s.id === skinId);
        return skin && skin.layer === 'back';
    });
    
    const overlaySkins = activeSkins.filter(skinId => {
        const skin = availableSkins.find(s => s.id === skinId);
        return skin && skin.layer === 'overlay';
    });
    
    // Funkcja sprawdzająca czy wszystkie obrazy są załadowane
    const checkAllImagesLoaded = () => {
        if (!baseImg.complete || baseImg.naturalWidth === 0) return false;
        
        for (const skinId of backSkins) {
            const skin = availableSkins.find(s => s.id === skinId);
            if (skin && skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (!skinImg.complete || skinImg.naturalWidth === 0) return false;
            }
        }
        
        for (const skinId of overlaySkins) {
            const skin = availableSkins.find(s => s.id === skinId);
            if (skin && skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (!skinImg.complete || skinImg.naturalWidth === 0) return false;
            }
        }
        
        return true;
    };
    
    const drawPreview = () => {
        ctx.clearRect(0, 0, 200, 200);
        
        // WARSTWA 1: Rysuj podstawowego chomika - NAJPIERW (podstawa)
        if (baseImg.complete && baseImg.naturalWidth > 0 && baseImg.naturalHeight > 0) {
            ctx.drawImage(baseImg, 50, 50, 100, 100);
        }
        
        // WARSTWA 2: Rysuj skiny z tyłu (peleryna) - PO chomiku (NAD chomikiem)
        for (let i = 0; i < backSkins.length; i++) {
            const skinId = backSkins[i];
            const skin = availableSkins.find(s => s.id === skinId);
            if (skin && skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (skinImg.complete && skinImg.naturalWidth > 0 && skinImg.naturalHeight > 0) {
                    ctx.drawImage(skinImg, 50, 50, 100, 100);
                }
            }
        }
        
        // WARSTWA 3: Rysuj skiny z przodu (okulary, czapka, korona itp.) - NA KOŃCU, NA SAMYM WIERZCHU
        for (let i = 0; i < overlaySkins.length; i++) {
            const skinId = overlaySkins[i];
            const skin = availableSkins.find(s => s.id === skinId);
            if (skin && skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (skinImg.complete && skinImg.naturalWidth > 0 && skinImg.naturalHeight > 0) {
                    ctx.drawImage(skinImg, 50, 50, 100, 100);
                }
            }
        }
    };
    
    // Czekaj na załadowanie wszystkich obrazów
    if (checkAllImagesLoaded()) {
        drawPreview();
    } else {
        // Czekaj na załadowanie podstawowego obrazu
        const tryDraw = () => {
            if (checkAllImagesLoaded()) {
                drawPreview();
            } else {
                setTimeout(tryDraw, 50); // Spróbuj ponownie za 50ms
            }
        };
        
        if (baseImg.complete) {
            tryDraw();
        } else {
            baseImg.onload = tryDraw;
        }
    }
}

function updateMyHamsterPreview() {
    const canvas = document.getElementById('myHamsterPreview');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 50, 50);
    
    const baseImgSrc = hamsterImages[4];
    const baseImg = loadImage(baseImgSrc);
    
    const backSkins = activeSkins.filter(skinId => {
        const skin = availableSkins.find(s => s.id === skinId);
        return skin && skin.layer === 'back';
    });
    
    const overlaySkins = activeSkins.filter(skinId => {
        const skin = availableSkins.find(s => s.id === skinId);
        return skin && skin.layer === 'overlay';
    });
    
    const drawPreview = () => {
        ctx.clearRect(0, 0, 50, 50);
        
        // WARSTWA 1: Rysuj podstawowego chomika - NAJPIERW (podstawa)
        if (baseImg.complete && baseImg.naturalWidth > 0 && baseImg.naturalHeight > 0) {
            ctx.drawImage(baseImg, 0, 0, 50, 50);
        }
        
        // WARSTWA 2: Rysuj skiny z tyłu (peleryna) - PO chomiku (NAD chomikiem)
        for (let i = 0; i < backSkins.length; i++) {
            const skinId = backSkins[i];
            const skin = availableSkins.find(s => s.id === skinId);
            if (skin && skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (skinImg.complete && skinImg.naturalWidth > 0 && skinImg.naturalHeight > 0) {
                    ctx.drawImage(skinImg, 0, 0, 50, 50);
                }
            }
        }
        
        // WARSTWA 3: Rysuj skiny z przodu - NA KOŃCU, NA SAMYM WIERZCHU
        for (let i = 0; i < overlaySkins.length; i++) {
            const skinId = overlaySkins[i];
            const skin = availableSkins.find(s => s.id === skinId);
            if (skin && skin.image) {
                const skinImg = loadImage(`modele homikó/${skin.image}`);
                if (skinImg.complete && skinImg.naturalWidth > 0 && skinImg.naturalHeight > 0) {
                    ctx.drawImage(skinImg, 0, 0, 50, 50);
                }
            }
        }
    };
    
    if (baseImg.complete && baseImg.naturalWidth > 0) {
        drawPreview();
    } else {
        baseImg.onload = () => {
            if (baseImg.naturalWidth > 0) {
                drawPreview();
            }
        };
    }
}

// Rysowanie toru
function drawTrack(ctx, canvas, trackType) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Tło trawy
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Wzór trawy
    ctx.fillStyle = '#3a6b1f';
    for (let i = 0; i < canvas.width; i += 20) {
        for (let j = 0; j < canvas.height; j += 20) {
            if ((i + j) % 40 === 0) {
                ctx.fillRect(i, j, 10, 10);
            }
        }
    }
    
    if (trackType === 'straight') {
        drawStraightTrack(ctx, canvas);
    } else {
        drawCurvedTrack(ctx, canvas);
    }
    
    // Linia startu (tylko dla prostego toru)
    if (trackType === 'straight') {
        const margin = window.innerWidth <= 767 ? 20 : 50;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = window.innerWidth <= 767 ? 2 : 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(margin, 0);
        ctx.lineTo(margin, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Linia mety
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = window.innerWidth <= 767 ? 3 : 4;
        ctx.setLineDash([15, 5]);
        ctx.beginPath();
        ctx.moveTo(canvas.width - margin, 0);
        ctx.lineTo(canvas.width - margin, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawStraightTrack(ctx, canvas) {
    // Prosty tor - pasy
    const isMobile = window.innerWidth <= 767;
    const margin = isMobile ? 20 : 50;
    const laneWidth = (canvas.height - (margin * 2)) / 4;
    const startY = margin;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isMobile ? 1.5 : 2;
    
    for (let i = 0; i < 5; i++) {
        const y = startY + i * laneWidth;
        ctx.beginPath();
        ctx.moveTo(margin, y);
        ctx.lineTo(canvas.width - margin, y);
        ctx.stroke();
    }
}

function drawCurvedTrack(ctx, canvas) {
    // Tor z zakrętami
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dostosuj margines i szerokość pasa do rozmiaru canvas
    const isMobile = window.innerWidth <= 767;
    const margin = isMobile ? 20 : 50;
    const radius = Math.min(canvas.width, canvas.height) / 2 - margin;
    
    // Główny tor (okrągły)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = isMobile ? 3 : 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Pasy toru
    const lanes = 4;
    const laneWidth = isMobile ? Math.max(15, radius / 5) : 30;
    
    for (let i = 1; i < lanes; i++) {
        const r = radius - (i * laneWidth);
        if (r > 10) { // Upewnij się, że promień jest wystarczająco duży
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = isMobile ? 1.5 : 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    // Linia startu/mety
    const lineLength = isMobile ? 15 : 20;
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = isMobile ? 2 : 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY - radius - lineLength);
    ctx.stroke();
}

// Start wyścigu
function startRace() {
    if (raceInProgress) return;
    
    // Zbierz zakłady
    bets = {};
    let totalBet = 0;
    
    document.querySelectorAll('.hamster-option').forEach((option, index) => {
        const betInput = option.querySelector('.bet-amount');
        const betAmount = parseInt(betInput.value) || 0;
        
        if (betAmount > 0) {
            if (betAmount > balance) {
                alert(`Nie masz wystarczających środków! Saldo: ${balance} zł`);
                return;
            }
            bets[index] = betAmount;
            totalBet += betAmount;
        }
    });
    
    if (Object.keys(bets).length === 0) {
        alert('Najpierw postaw zakład!');
        return;
    }
    
    if (totalBet > balance) {
        alert(`Nie masz wystarczających środków! Saldo: ${balance} zł`);
        return;
    }
    
    // Odejmij zakłady od salda
    balance -= totalBet;
    updateBalance();
    
    // Zablokuj przyciski
    raceInProgress = true;
    document.getElementById('startRace').disabled = true;
    document.querySelectorAll('.bet-amount').forEach(input => input.disabled = true);
    
    // Rozpocznij wyścig
    runRace();
}

// Główna funkcja wyścigu
function runRace() {
    const canvas = document.getElementById('raceTrack');
    const ctx = canvas.getContext('2d');
    const trackType = document.querySelector('input[name="trackType"]:checked').value;
    
    // Pozycje chomików (5 jeśli używamy własnego chomika)
    const numHamsters = useMyHamster && activeSkins.length > 0 ? 5 : 4;
    const positions = new Array(numHamsters).fill(0);
    const speeds = [];
    
    // Dla zakrętów - pełne okrążenie (360 stopni = 2π radianów)
    // Dla prostego toru - odległość od startu do mety
    const isMobile = window.innerWidth <= 767;
    const margin = isMobile ? 20 : 50;
    const finishLine = trackType === 'straight' 
        ? canvas.width - (margin * 2) 
        : Math.PI * 2 * 100; // Dla zakrętów - pełne okrążenie w jednostkach kątowych
    
    // Losuj prędkości
    for (let i = 0; i < numHamsters; i++) {
        let baseSpeed = Math.random() * 3 + 1; // Podstawowa prędkość 1-4
        
        // Specjalne właściwości czarnego chomika
        if (i === 3) { // Czarny chomik
            // 30% szansy na boost w każdej rundzie
            // Lub co 3 rundy gwarantowany boost
            if (blackHamsterBoost === 0 || Math.random() < 0.3) {
                baseSpeed *= 1.5; // 50% szybszy
                blackHamsterBoost = 3; // Reset licznika
            } else {
                blackHamsterBoost--;
            }
        }
        
        // Własny chomik ma mały bonus prędkości (10%)
        if (i === 4 && useMyHamster) {
            baseSpeed *= 1.1;
        }
        
        speeds.push(baseSpeed);
    }
    
    // Animacja wyścigu
    const raceInterval = setInterval(() => {
        // Wyczyść i narysuj tor
        drawTrack(ctx, canvas, trackType);
        
        // Aktualizuj pozycje
        let raceFinished = false;
        
        for (let i = 0; i < numHamsters; i++) {
            positions[i] += speeds[i] * (0.5 + Math.random() * 0.5); // Dodaj losowość
            
            if (trackType === 'straight') {
                if (positions[i] >= finishLine) {
                    positions[i] = finishLine;
                    raceFinished = true;
                }
                drawHamsterStraight(ctx, canvas, i, positions[i], numHamsters);
            } else {
                if (positions[i] >= finishLine) {
                    positions[i] = finishLine;
                    raceFinished = true;
                }
                drawHamsterCurved(ctx, canvas, i, positions[i], finishLine, numHamsters);
            }
        }
        
        // Sprawdź czy wyścig zakończony
        if (raceFinished) {
            clearInterval(raceInterval);
            finishRace(positions, speeds);
        }
    }, 16); // ~60 FPS
}

// Rysowanie chomika na prostym torze
function drawHamsterStraight(ctx, canvas, hamsterIndex, position, numHamsters = 4) {
    const laneWidth = (canvas.height - 100) / numHamsters;
    const startY = 50;
    const y = startY + hamsterIndex * laneWidth + laneWidth / 2;
    const x = 50 + position;
    
    const color = hamsterColors[hamsterIndex];
    
    // Kula
    const gradient = ctx.createRadialGradient(x - 10, y - 10, 0, x, y, 40);
    if (hamsterIndex === 0) {
        gradient.addColorStop(0, '#ff8a8a');
        gradient.addColorStop(1, '#ff6b6b');
    } else if (hamsterIndex === 1) {
        gradient.addColorStop(0, '#6eddd6');
        gradient.addColorStop(1, '#4ecdc4');
    } else if (hamsterIndex === 2) {
        gradient.addColorStop(0, '#b5f1e7');
        gradient.addColorStop(1, '#95e1d3');
    } else if (hamsterIndex === 3) {
        gradient.addColorStop(0, '#34495e');
        gradient.addColorStop(1, '#2c3e50');
    } else {
        gradient.addColorStop(0, '#f39c12');
        gradient.addColorStop(1, '#e67e22');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Obramowanie dla czarnego
    if (hamsterIndex === 3) {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    
    // Chomik - jeśli to własny chomik, rysuj z skinami
    if (hamsterIndex === 4 && useMyHamster) {
        drawCustomHamster(ctx, x, y, 30);
    } else {
        // Standardowy chomik - użyj grafiki z cache
        const imgSrc = hamsterImages[hamsterIndex] || 'modele homikó/homik.png';
        const img = loadImage(imgSrc);
        if (img.complete) {
            ctx.drawImage(img, x - 30, y - 30, 60, 60);
        } else {
            img.onload = () => {
                ctx.drawImage(img, x - 30, y - 30, 60, 60);
            };
        }
    }
}

// Rysowanie własnego chomika z skinami
function drawCustomHamster(ctx, x, y, size) {
    const baseImgSrc = hamsterImages[4];
    const baseImg = loadImage(baseImgSrc);
    
    // Pobierz skiny w odpowiedniej kolejności
    const backSkins = activeSkins.filter(skinId => {
        const skin = availableSkins.find(s => s.id === skinId);
        return skin && skin.layer === 'back';
    });
    
    const overlaySkins = activeSkins.filter(skinId => {
        const skin = availableSkins.find(s => s.id === skinId);
        return skin && skin.layer === 'overlay';
    });
    
    // WARSTWA 1: Rysuj podstawowego chomika - NAJPIERW (podstawa)
    if (baseImg.complete && baseImg.naturalWidth > 0 && baseImg.naturalHeight > 0) {
        ctx.drawImage(baseImg, x - size, y - size, size * 2, size * 2);
    }
    
    // WARSTWA 2: Rysuj skiny z tyłu (peleryna) - PO chomiku (NAD chomikiem)
    // Peleryna jest rysowana nad chomikiem, ale pod overlay
    for (let i = 0; i < backSkins.length; i++) {
        const skinId = backSkins[i];
        const skin = availableSkins.find(s => s.id === skinId);
        if (skin && skin.image) {
            const skinImg = loadImage(`modele homikó/${skin.image}`);
            // Rysuj tylko jeśli obraz jest w pełni załadowany
            if (skinImg.complete && skinImg.naturalWidth > 0 && skinImg.naturalHeight > 0) {
                ctx.drawImage(skinImg, x - size, y - size, size * 2, size * 2);
            }
        }
    }
    
    // WARSTWA 3: Rysuj skiny z przodu (okulary, czapka, korona itp.) - NA KOŃCU, NA SAMYM WIERZCHU
    // Te skiny są rysowane na końcu, żeby były widoczne na wierzchu wszystkiego
    for (let i = 0; i < overlaySkins.length; i++) {
        const skinId = overlaySkins[i];
        const skin = availableSkins.find(s => s.id === skinId);
        if (skin && skin.image) {
            const skinImg = loadImage(`modele homikó/${skin.image}`);
            if (skinImg.complete && skinImg.naturalWidth > 0 && skinImg.naturalHeight > 0) {
                ctx.drawImage(skinImg, x - size, y - size, size * 2, size * 2);
            }
        }
    }
}

// Rysowanie chomika na zakręconym torze
function drawHamsterCurved(ctx, canvas, hamsterIndex, position, finishLine, numHamsters = 4) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Dostosuj do rozmiaru ekranu
    const isMobile = window.innerWidth <= 767;
    const margin = isMobile ? 20 : 50;
    const radius = Math.min(canvas.width, canvas.height) / 2 - margin;
    const laneWidth = isMobile ? Math.max(15, radius / 5) : 30;
    const currentRadius = radius - (hamsterIndex * laneWidth);
    
    // Pozycja kątowa (0-360 stopni)
    const angle = (position / finishLine) * Math.PI * 2;
    const x = centerX + Math.cos(angle - Math.PI / 2) * currentRadius;
    const y = centerY + Math.sin(angle - Math.PI / 2) * currentRadius;
    
    const color = hamsterColors[hamsterIndex];
    
    // Rozmiar kuli i chomika dostosowany do ekranu
    const ballRadius = isMobile ? 20 : 30;
    const hamsterSize = isMobile ? 20 : 30;
    
    // Kula
    const gradient = ctx.createRadialGradient(x - ballRadius/3, y - ballRadius/3, 0, x, y, ballRadius);
    if (hamsterIndex === 0) {
        gradient.addColorStop(0, '#ff8a8a');
        gradient.addColorStop(1, '#ff6b6b');
    } else if (hamsterIndex === 1) {
        gradient.addColorStop(0, '#6eddd6');
        gradient.addColorStop(1, '#4ecdc4');
    } else if (hamsterIndex === 2) {
        gradient.addColorStop(0, '#b5f1e7');
        gradient.addColorStop(1, '#95e1d3');
    } else {
        gradient.addColorStop(0, '#34495e');
        gradient.addColorStop(1, '#2c3e50');
    }
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Obramowanie dla czarnego
    if (hamsterIndex === 3) {
        ctx.strokeStyle = '#f39c12';
        ctx.lineWidth = isMobile ? 2 : 3;
        ctx.stroke();
    }
    
    // Chomik - jeśli to własny chomik, rysuj z skinami
    if (hamsterIndex === 4 && useMyHamster) {
        drawCustomHamster(ctx, x, y, hamsterSize);
    } else {
        // Standardowy chomik - użyj grafiki z cache
        const imgSrc = hamsterImages[hamsterIndex] || 'modele homikó/homik.png';
        const img = loadImage(imgSrc);
        const size = hamsterSize * 2;
        if (img.complete) {
            ctx.drawImage(img, x - hamsterSize, y - hamsterSize, size, size);
        } else {
            img.onload = () => {
                ctx.drawImage(img, x - hamsterSize, y - hamsterSize, size, size);
            };
        }
    }
}

// Zakończenie wyścigu
function finishRace(positions, speeds) {
    // Znajdź zwycięzcę
    const winnerIndex = positions.indexOf(Math.max(...positions));
    let winner;
    if (winnerIndex < hamsterColors.length) {
        winner = hamsterColors[winnerIndex];
    } else {
        winner = { name: 'Mój Chomik', color: '#f39c12' };
    }
    
    // Oblicz wygrane
    let totalWinnings = 0;
    let won = false;
    
    if (bets[winnerIndex]) {
        // Wygrana = zakład * 3 (dla czarnego * 2.5, dla własnego chomika * 3.5)
        let multiplier = 3;
        if (winnerIndex === 3) multiplier = 2.5; // Czarny
        if (winnerIndex === 4) multiplier = 3.5; // Własny chomik
        totalWinnings = bets[winnerIndex] * multiplier;
        balance += totalWinnings;
        won = true;
    }
    
    // Aktualizuj saldo
    updateBalance();
    
    // Pokaż wyniki
    const resultsDiv = document.getElementById('results');
    const resultClass = won ? 'win' : 'loss';
    const resultText = won 
        ? `🎉 Wygrałeś! ${winner.name} chomik wygrał! Wygrana: ${totalWinnings.toFixed(2)} zł`
        : `😢 Przegrałeś. ${winner.name} chomik wygrał.`;
    
    resultsDiv.innerHTML = `
        <div class="result-item ${resultClass}">
            <strong>Wynik wyścigu:</strong><br>
            ${resultText}<br>
            <small>Zwycięzca: ${winner.name} | Prędkość: ${speeds[winnerIndex].toFixed(2)}</small>
        </div>
    `;
    
    document.getElementById('raceStatus').textContent = `🏁 Wyścig zakończony! Zwycięzca: ${winner.name}`;
    
    // Odblokuj przyciski
    raceInProgress = false;
    document.getElementById('startRace').disabled = false;
    document.querySelectorAll('.bet-amount').forEach(input => input.disabled = false);
    
    // Wyczyść zakłady
    document.querySelectorAll('.bet-amount').forEach(input => input.value = '');
    document.querySelectorAll('.hamster-option').forEach(option => option.classList.remove('selected'));
    bets = {};
}

// Reset wyścigu
function resetRace() {
    if (raceInProgress) return;
    
    const canvas = document.getElementById('raceTrack');
    const ctx = canvas.getContext('2d');
    const trackType = document.querySelector('input[name="trackType"]:checked').value;
    
    drawTrack(ctx, canvas, trackType);
    document.getElementById('raceStatus').textContent = '';
    document.getElementById('results').innerHTML = '';
    
    // Wyczyść zakłady
    document.querySelectorAll('.bet-amount').forEach(input => input.value = '');
    document.querySelectorAll('.hamster-option').forEach(option => option.classList.remove('selected'));
    bets = {};
}

// Aktualizuj saldo
function updateBalance() {
    if (!currentUser) return;
    
    // Upewnij się, że balance jest liczbą
    balance = parseFloat(balance) || 0;
    
    const balanceElement = document.getElementById('balance');
    if (balanceElement) {
        balanceElement.textContent = balance.toFixed(2);
    }
    const legacyBalanceElement = document.getElementById('kwota_kwota');
    if (legacyBalanceElement) {
        legacyBalanceElement.textContent = balance.toFixed(2);
    }
    
    // Zapisz do localStorage
    const userData = getUserData(currentUser);
    if (userData) {
        userData.balance = balance;
        saveUserData(currentUser, userData);
    }
    
    if (balance <= 0) {
        alert('Skończyły Ci się środki! Gra zostanie zresetowana.');
        balance = 1000;
        const userData = getUserData(currentUser);
        if (userData) {
            userData.balance = balance;
            saveUserData(currentUser, userData);
        }
        updateBalance();
    }
}

function initMiniGames() {
    const slotsBtn = document.getElementById('playSlots');
    const slotsBetInput = document.getElementById('slotsBet');
    const slotsReels = document.getElementById('slotsReels');
    const slotsResult = document.getElementById('slotsResult');
    const cupButtons = document.querySelectorAll('.cup-choice');
    const cupsBetInput = document.getElementById('cupsBet');
    const cupsResult = document.getElementById('cupsResult');

    if (slotsBtn && slotsBetInput && slotsReels && slotsResult) {
        const symbols = ['🐹', '🐭', '🐰', '🧀', '⭐'];
        slotsBtn.addEventListener('click', () => {
            const bet = parseFloat(slotsBetInput.value);
            if (!bet || bet <= 0) {
                slotsResult.textContent = 'Podaj poprawną stawkę.';
                return;
            }
            if (bet > balance) {
                slotsResult.textContent = 'Brak środków na taki zakład.';
                return;
            }

            balance -= bet;
            const rolls = [
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)],
                symbols[Math.floor(Math.random() * symbols.length)]
            ];
            slotsReels.textContent = `${rolls[0]} | ${rolls[1]} | ${rolls[2]}`;

            let multiplier = 0;
            if (rolls[0] === rolls[1] && rolls[1] === rolls[2]) multiplier = 5;
            else if (rolls[0] === rolls[1] || rolls[1] === rolls[2] || rolls[0] === rolls[2]) multiplier = 2;

            const win = bet * multiplier;
            if (win > 0) {
                balance += win;
                slotsResult.textContent = `Wygrana ${win.toFixed(2)} zł (x${multiplier})!`;
            } else {
                slotsResult.textContent = 'Niestety, tym razem bez wygranej.';
            }
            updateBalance();
        });
    }

    if (cupButtons.length > 0 && cupsBetInput && cupsResult) {
        cupButtons.forEach((btn) => {
            btn.addEventListener('click', () => {
                const bet = parseFloat(cupsBetInput.value);
                if (!bet || bet <= 0) {
                    cupsResult.textContent = 'Podaj poprawną stawkę.';
                    return;
                }
                if (bet > balance) {
                    cupsResult.textContent = 'Brak środków na taki zakład.';
                    return;
                }

                const selectedCup = parseInt(btn.dataset.cup, 10);
                const winningCup = Math.floor(Math.random() * 3);
                balance -= bet;

                if (selectedCup === winningCup) {
                    const win = bet * 3;
                    balance += win;
                    cupsResult.textContent = `Trafiony kubeczek! Wygrywasz ${win.toFixed(2)} zł.`;
                } else {
                    cupsResult.textContent = `Pudło! Chomik był pod kubkiem ${winningCup + 1}.`;
                }
                updateBalance();
            });
        });
    }
}
