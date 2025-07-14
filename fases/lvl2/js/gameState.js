
import { updateScore, updateTimer, updateTruckCounter, showGameOverScreen, hideGameOverScreen } from './ui.js';

const gameState = {
    totalScore: 0,
    currentTruckScore: 100,
    currentTruckErrors: 0,
    trucksCompleted: 0,
    totalTrucksInMatch: 10,
    gameStartTime: 0,
    isGameActive: true,
};

export function setupGameState() {
    gameState.gameStartTime = Date.now();
    gameState.isGameActive = true;
    gameState.trucksCompleted = 0;
    gameState.totalScore = 0;
    
    hideGameOverScreen(); 
    updateScore(0);
    updateTruckCounter(0, gameState.totalTrucksInMatch);
}

export function addError() {
    if (!gameState.isGameActive || gameState.currentTruckErrors >= 8) return;
    gameState.currentTruckErrors++;
    gameState.currentTruckScore -= 10;
}

export function truckCompletedSuccess() {
    if (!gameState.isGameActive) return;
    const pointsGained = Math.max(gameState.currentTruckScore, 20);
    gameState.totalScore += pointsGained;
    gameState.trucksCompleted++;
    updateScore(gameState.totalScore);
    updateTruckCounter(gameState.trucksCompleted, gameState.totalTrucksInMatch);
    gameState.currentTruckScore = 100;
    gameState.currentTruckErrors = 0;
    if (gameState.trucksCompleted >= gameState.totalTrucksInMatch) {
        endGame();
    }
}

function endGame() {
    if (!gameState.isGameActive) return;

    gameState.isGameActive = false;
    const finalTime = formatTime(Date.now() - gameState.gameStartTime);
    showGameOverScreen(gameState.totalScore, finalTime);
}

export function isGameRunning() {
    return gameState.isGameActive;
}

export function updateGameTimer() {
    if (!gameState.isGameActive) return;
    const elapsedTime = Date.now() - gameState.gameStartTime;
    updateTimer(formatTime(elapsedTime));
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}