// Déclaration des variables globales
let rarePepes = []; // Tableau pour stocker les données des Rare Pepes
let currentPair = []; // Paire actuelle pour le face-off
let playerId = null; // Identifiant du joueur
let db = null; // Instance Firestore (si vous l’utilisez)

// Initialisation de Firebase (si vous l’utilisez, ajustez selon votre configuration)
const firebaseConfig = {
    apiKey: "AIzaSyDtuqKNn9hmjwy6tRJhhQA0gsFVgZYdBS8",
    authDomain: "rarepepefaceoff.firebaseapp.com",
    projectId: "rarepepefaceoff",
    storageBucket: "rarepepefaceoff.appspot.com",
    messagingSenderId: "284305192714",
    appId: "1:284305192714:web:852aac140fe64d2774ecf3",
    measurementId: "G-81FK1HMT03"
};

// Vérifiez si Firebase est chargé
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} else {
    console.error('Firebase SDK not loaded');
}

// Charger les données des Rare Pepes
function loadRarePepes() {
    fetch('rarepepes.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load rarepepes.json');
            return response.json();
        })
        .then(data => {
            rarePepes = data; // Stocker les données
            console.log('Rare Pepes loaded:', rarePepes);
            startGame(); // Lancer le jeu une fois les données chargées
        })
        .catch(error => {
            console.error('Error loading rarepepes.json:', error);
            // Afficher un message à l’utilisateur
            document.getElementById('game').innerHTML = '<p>Error loading Rare Pepes. Please try refreshing the page.</p>';
        });
}

// Fonction pour démarrer le jeu
function startGame() {
    if (rarePepes.length === 0) {
        console.error('No Rare Pepes loaded');
        return;
    }

    // Sélectionner une paire aléatoire pour le face-off
    currentPair = selectRandomPair();
    displayPair(currentPair);
}

// Sélectionner une paire aléatoire de Rare Pepes
function selectRandomPair() {
    const index1 = Math.floor(Math.random() * rarePepes.length);
    let index2 = Math.floor(Math.random() * rarePepes.length);
    while (index2 === index1) {
        index2 = Math.floor(Math.random() * rarePepes.length); // Éviter de sélectionner le même Pepe
    }
    return [rarePepes[index1], rarePepes[index2]];
}

// Afficher la paire de Rare Pepes
function displayPair(pair) {
    const gameDiv = document.getElementById('game');
    gameDiv.innerHTML = ''; // Vider le contenu actuel

    // Créer les éléments pour le face-off
    const leftPepe = document.createElement('div');
    leftPepe.className = 'pepe';
    leftPepe.innerHTML = `
        <img src="${pair[0].imageUrl}" alt="${pair[0].name}">
        <p>${pair[0].name}</p>
        <button onclick="vote(0)">Vote for this Pepe</button>
    `;

    const rightPepe = document.createElement('div');
    rightPepe.className = 'pepe';
    rightPepe.innerHTML = `
        <img src="${pair[1].imageUrl}" alt="${pair[1].name}">
        <p>${pair[1].name}</p>
        <button onclick="vote(1)">Vote for this Pepe</button>
    `;

    gameDiv.appendChild(leftPepe);
    gameDiv.appendChild(rightPepe);
}

// Fonction pour gérer le vote
function vote(index) {
    const winner = currentPair[index];
    const loser = currentPair[1 - index];
    console.log(`Voted for ${winner.name} over ${loser.name}`);

    // Mettre à jour les scores ou sauvegarder le vote (si vous utilisez Firestore)
    saveVote(winner.name, loser.name);

    // Charger une nouvelle paire
    currentPair = selectRandomPair();
    displayPair(currentPair);
}

// Sauvegarder le vote (si Firestore est utilisé)
function saveVote(winnerName, loserName) {
    if (!db) {
        console.error('Firestore not initialized');
        return;
    }
    // Exemple : Incrémenter le score du gagnant
    db.collection('votes').doc(winnerName).set({
        name: winnerName,
        votes: firebase.firestore.FieldValue.increment(1)
    }, { merge: true }).catch(error => {
        console.error('Error saving vote:', error);
    });
}

// Lancer le chargement des données au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadRarePepes();
});