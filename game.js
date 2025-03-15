let pepes = [];
let votes = new Map();
let audioEnabled = true;
let audioContextActivated = false;
let playerName = '';
let playerVoteCount = 0;
let playerId = '';

const voteSounds = [
    document.getElementById('vote-sound-1'),
    document.getElementById('vote-sound-2'),
    document.getElementById('vote-sound-3'),
    document.getElementById('vote-sound-4'),
    document.getElementById('vote-sound-5'),
    document.getElementById('vote-sound-6')
];
const fightSound = document.getElementById('fight-sound');
const startSound = document.getElementById('start-sound');

// Initialisation Firebase avec votre configuration
const firebaseConfig = {
    apiKey: "AIzaSyDtuqKNn9hmjwy6tRJhhQA0gsFVgZYdBS8",
    authDomain: "rarepepefaceoff.firebaseapp.com",
    projectId: "rarepepefaceoff",
    storageBucket: "rarepepefaceoff.firebasestorage.app",
    messagingSenderId: "284305192714",
    appId: "1:284305192714:web:852aac140fe64d2774ecf3",
    measurementId: "G-81FK1HMT03"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

if (typeof gsap === 'undefined') {
    console.error('GSAP is not loaded!');
}

async function getUserData() {
    if (!playerId) {
        playerId = localStorage.getItem('playerId') || crypto.randomUUID();
        localStorage.setItem('playerId', playerId);
    }
    if (!db) {
        console.error('Firestore not initialized!');
        return { name: '', voteCount: 0, votes: {} };
    }
    try {
        const doc = await db.collection('users').doc(playerId).get();
        if (doc.exists) {
            return doc.data();
        } else {
            return { name: '', voteCount: 0, votes: {} };
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return { name: '', voteCount: 0, votes: {} };
    }
}

async function setUserData(name, voteCount, votesMap) {
    if (!playerId || !db) return;
    const votesObj = Object.fromEntries(votesMap);
    try {
        await db.collection('users').doc(playerId).set({
            name,
            voteCount,
            votes: votesObj
        });
    } catch (error) {
        console.error('Error setting user data:', error);
    }
}

async function startGame() {
    const usernameInput = document.getElementById('username-input');
    const enteredName = usernameInput.value.trim() || 'Anonymous';
    
    playerId = localStorage.getItem('playerId') || crypto.randomUUID();
    localStorage.setItem('playerId', playerId);
    
    const userData = await getUserData();
    playerName = enteredName;
    playerVoteCount = userData.voteCount || 0;
    votes = new Map(Object.entries(userData.votes || {}));
    
    await setUserData(playerName, playerVoteCount, votes);
    
    console.log('Start Game, player:', playerName, 'ID:', playerId);
    console.log('Player vote count:', playerVoteCount);
    audioContextActivated = true;
    console.log('Audio context activated');
    hideLoadingScreen();
}

function toggleTop10() {
    const top10 = document.getElementById('top-10');
    if (top10.classList.contains('hidden')) {
        top10.classList.remove('hidden');
        updateTop10();
        console.log('Top 10 opened');
    } else {
        top10.classList.add('hidden');
        console.log('Top 10 closed');
    }
}

function resetCard(cardElement) {
    if (!cardElement) {
        console.error('resetCard: cardElement is null or undefined');
        return;
    }
    cardElement.classList.remove('sliced');
    const cardImage = cardElement.querySelector('.card-image');
    if (!cardImage) {
        console.error('resetCard: .card-image not found in', cardElement);
        return;
    }
    cardImage.style.display = 'block';
    if (gsap) {
        gsap.set(cardElement, { scale: 1, y: 0, rotation: 0, opacity: 1 });
        gsap.killTweensOf(cardElement);
    }
    console.log('Card reset:', cardElement);
}

function animatePepecashCards() {
    const container = document.getElementById('pepecash-container');
    const numCards = 200;

    console.log('Starting Pepecash animation...');
    for (let i = 0; i < numCards; i++) {
        const card = document.createElement('div');
        card.className = 'pepecash-card';
        card.innerHTML = `<img src="http://rarepepedirectory.com/wp-content/uploads/2016/09/pepecash3.jpg" alt="Pepecash Card">`;
        card.style.left = `${Math.random() * (window.innerWidth - 80)}px`;
        card.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(card);
    }
    console.log(`${numCards} cards added to container.`);
}

function showLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'flex';
    console.log('Loading screen displayed.');
}

function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
    const gameScreen = document.getElementById('game-screen');
    if (!gameScreen) {
        console.error('hideLoadingScreen: #game-screen not found');
        return;
    }
    gameScreen.classList.remove('hidden');

    if (audioEnabled && audioContextActivated) {
        startSound.currentTime = 0;
        startSound.play().then(() => console.log('Start sound played')).catch(error => console.log('Start sound error:', error));
        document.getElementById('bg-music').play().catch(error => console.log('BG music error:', error));
    }

    document.getElementById('player-name').textContent = playerName;
    document.getElementById('vote-count').textContent = playerVoteCount;
    setTimeout(startNewVote, 500);
}

async function loadPepes() {
    showLoadingScreen();
    try {
        console.log('Fetching rarepepes.json...');
        const response = await fetch('rarepepes.json');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        pepes = await response.json();
        console.log(`Loaded ${pepes.length} Pepes!`, pepes.slice(0, 2));
        pepes.forEach(pepe => {
            if (!votes.has(pepe.name)) votes.set(pepe.name, 0);
        });
        console.log('Votes initialized:', votes);
        animatePepecashCards();
    } catch (error) {
        console.error('Error loading Pepes:', error);
        document.getElementById('loading-text').textContent = 'Loading Error! Check Console';
        pepes = [{ name: "Default Pepe", imageUrl: "https://via.placeholder.com/286x400", rarity: "Common" }];
        votes.set("Default Pepe", 0);
        console.log('Fallback Pepes loaded:', pepes);
        animatePepecashCards();
        setTimeout(hideLoadingScreen, 3000);
    }
}

function getRandomPepe() {
    if (pepes.length === 0) {
        console.error('No Pepes loaded!');
        return { name: "Error Pepe", imageUrl: "https://via.placeholder.com/286x400", rarity: "N/A" };
    }
    return pepes[Math.floor(Math.random() * pepes.length)];
}

function startNewVote() {
    let pepe1 = getRandomPepe();
    let pepe2 = getRandomPepe();
    while (pepe2.name === pepe1.name) {
        pepe2 = getRandomPepe();
    }

    const leftCard = document.getElementById('pepe-left');
    const rightCard = document.getElementById('pepe-right');
    if (!leftCard || !rightCard) {
        console.error('startNewVote: pepe-left or pepe-right not found');
        return;
    }

    const leftPepeCard = leftCard.querySelector('.pepe-card');
    const rightPepeCard = rightCard.querySelector('.pepe-card');
    if (!leftPepeCard || !rightPepeCard) {
        console.error('startNewVote: .pepe-card not found in', leftCard, rightCard);
        return;
    }

    const leftImage = leftPepeCard.querySelector('.card-image');
    const rightImage = rightPepeCard.querySelector('.card-image');
    if (!leftImage || !rightImage) {
        console.error('startNewVote: .card-image not found in cards');
        return;
    }

    resetCard(leftPepeCard);
    resetCard(rightPepeCard);

    leftImage.src = pepe1.imageUrl;
    leftImage.alt = pepe1.name;
    leftCard.querySelector('.name').textContent = pepe1.name;
    leftCard.querySelector('.rarity').textContent = `Rarity: ${pepe1.rarity}`;

    rightImage.src = pepe2.imageUrl;
    rightImage.alt = pepe2.name;
    rightCard.querySelector('.name').textContent = pepe2.name;
    rightCard.querySelector('.rarity').textContent = `Rarity: ${pepe2.rarity}`;

    document.getElementById('vote-left').style.opacity = 0;
    document.getElementById('vote-right').style.opacity = 0;

    updateTop10();

    if (audioEnabled && audioContextActivated) {
        fightSound.currentTime = 0;
        fightSound.play().catch(error => console.log('Fight sound error:', error));
    }
}

async function voteForPepe(side) {
    const pepeName = document.querySelector(`#pepe-${side} .name`).textContent;
    if (!pepeName) {
        console.error('No pepeName found for side:', side);
        return;
    }

    votes.set(pepeName, (votes.get(pepeName) || 0) + 1);
    playerVoteCount++;
    console.log('Votes updated:', votes.get(pepeName));
    console.log('Player vote count:', playerVoteCount);

    const voteDisplay = document.getElementById(`vote-${side}`);
    voteDisplay.textContent = `${votes.get(pepeName)} votes`;

    document.getElementById('vote-count').textContent = playerVoteCount;

    const winnerCard = document.getElementById(`pepe-${side}`).querySelector('.pepe-card');
    const loserSide = side === 'left' ? 'right' : 'left';
    const loserCard = document.getElementById(`pepe-${loserSide}`).querySelector('.pepe-card');

    if (gsap) {
        const tl = gsap.timeline();
        tl.to(voteDisplay, { opacity: 1, duration: 0.2 });
        tl.to(winnerCard, { duration: 0.5, y: -20, scale: 1.1, ease: 'power2.out', yoyo: true, repeat: 1 }, '<');
        tl.to(loserCard, { duration: 0.7, scale: 0, opacity: 0, rotation: 10, ease: 'power2.in' }, '<');
        tl.to(voteDisplay, { duration: 0.5, opacity: 0, onComplete: startNewVote }, '+=0.3');
    } else {
        voteDisplay.style.opacity = 1;
        setTimeout(() => {
            voteDisplay.style.opacity = 0;
            startNewVote();
        }, 1000);
    }

    const bgMusic = document.getElementById('bg-music');
    if (audioEnabled && !bgMusic.paused) bgMusic.pause();
    if (audioEnabled) {
        fightSound.currentTime = 0;
        fightSound.play().catch(error => console.log('Fight sound error:', error));
        const randomSound = voteSounds[Math.floor(Math.random() * voteSounds.length)];
        randomSound.currentTime = 0;
        randomSound.play().catch(error => console.log('Audio error:', error));
    }

    await setUserData(playerName, playerVoteCount, votes);
}

function updateTop10() {
    const topList = document.getElementById('top-list');
    if (!topList) {
        console.error('updateTop10: #top-list not found');
        return;
    }
    const sortedPepes = [...votes.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);
    console.log('Updating Top 10 with:', sortedPepes);
    topList.innerHTML = sortedPepes.map(([name, voteCount]) => {
        const pepe = pepes.find(p => p.name === name);
        const imageUrl = pepe ? pepe.imageUrl : 'https://via.placeholder.com/40';
        return `<li><img src="${imageUrl}" alt="${name}">${name} - ${voteCount} votes</li>`;
    }).join('');
}

// Initialiser le jeu
loadPepes();

// Gestion du toggle audio
document.getElementById('audio-toggle').addEventListener('change', (e) => {
    audioEnabled = e.target.checked;
    const bgMusic = document.getElementById('bg-music');
    if (audioEnabled && audioContextActivated) {
        bgMusic.play().catch(error => console.log('BG music error:', error));
    } else {
        bgMusic.pause();
    }
    console.log('Audio enabled:', audioEnabled);
});

fetch('rarepepes.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load rarepepes.json');
        return response.json();
    })
    .then(data => {
        rarePepes = data;
        startGame();
    })
    .catch(error => {
        console.error('Error loading rarepepes.json:', error);
    });