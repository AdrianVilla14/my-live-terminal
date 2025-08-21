// Demo password
const CORRECT_PASSWORD = "251914";

// Text to type in the terminal
const message = [
    "Welcome User!",
    "",
    "$ echo 'Loading file!'",
    "Cycle complete - Stand by for assessment!",
    "",
    "From the ground which we inhabited , for as long as our time can recall. We have ought to desire a simple ideology obtained by even the smallest creatures like ants, peace. We are all faced with the choice, to follow human nature to consume or to be consumed by nature's love. As some look at the past to decide this only to forget they can live now, to where others look to the future and die now as if they never lived, while the ones who don't look die as if they would have never died. All only leaving a rust of questions behind to the living to be held, not understanding why this happens, leaves us to grow strong with the weight. As strength is followed by weakness as too light is followed by darkness, when we fall, hate in its camouflage of promise tempts us to stay, to feed off strength as it must consume all to survive, the unjust words of hate act as water always reshaping to fit. Some of us realize our insolence choice but only too late for which they are entrapped, doomed to drown in it. To weak now get back up themselves they bring back someone to take their place. We have cheated our way ahead, destroying and expecting a reward. We reaped more than we could sow, taken more than what could be given. To this degree where we have to become hate, to consume all to survive. We thrive for peace while we tip the balance of life and destroy the chain. Perhaps we are the weed of the garden, so abundant over time all who isnt has been entitled as the weed. The roses in the garden with bloody roots so deep it has forgotten where it started. Peace is rather only viewed by those who choose to paint in one color but not knowing they are contributing in painting the whole painting. The garden must be cleansed of the weeded roses. For all of man problems are by man, so in a way no man no problems "
].join("\n");

// Timing setup
const startDelay = 1500; // ms before typing begins
const totalTypeDuration = 4000; // ms total for typing animation (after delay)
const timerDuration = 15; // seconds for timer countdown

const typewriter = document.getElementById('typewriter');
const terminalBody = document.querySelector('.terminal-body');
const timerElement = document.getElementById('timer');
const loginForm = document.getElementById('loginForm');
const loginMessage = document.getElementById('login-message');
let timerInterval = null;
let timerCancelled = false;
let timerStarted = false;

// --- Typewriter Animation ---
function typeText(text, element, duration) {
    const length = text.length;
    const interval = duration / length;
    let i = 0;

    function typeChar() {
        element.innerHTML = text.slice(0, i) + '<span class="caret">|</span>';
        terminalBody.scrollTop = terminalBody.scrollHeight;
        if (i < length) {
            i++;
            setTimeout(typeChar, interval);
        } else {
            element.innerHTML = text + '<span class="caret">|</span>';
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }
    typeChar();
}

// --- Timer Logic ---
function startTimer(duration, display, onEnd) {
    if (timerStarted) return; // Prevent multiple timers
    timerStarted = true;
    let timer = duration;
    display.textContent = `Timer: ${timer}s`;
    timerInterval = setInterval(function () {
        if (timerCancelled) {
            clearInterval(timerInterval);
            return;
        }
        timer--;
        if (timer < 0) {
            clearInterval(timerInterval);
            display.textContent = "Timer: 0s";
            if (!timerCancelled && typeof onEnd === 'function') onEnd();
        } else {
            display.textContent = `Timer: ${timer}s`;
        }
    }, 1000);
}

function cancelTimer() {
    if (timerCancelled) return; // Prevent double cancel
    timerCancelled = true;
    if (timerInterval) clearInterval(timerInterval);
    timerElement.textContent = "Timer cancelled";
    timerElement.style.color = "#39ff14";
    // Show redirect modal after a short delay for user experience
    setTimeout(() => {
        if (window.showRedirectModal) window.showRedirectModal();
    }, 600);
}

// --- Window close/redirect logic ---
function closeOrRedirect() {
    // Try to close window (will only work if opened by script)
    window.close();
    // If window wasn't closed, redirect
    setTimeout(function() {
        window.location.href = "https://www.example.com/";
    }, 400);
}

// --- Start up sequence ---
setTimeout(() => {
    typeText(message, typewriter, totalTypeDuration);
}, startDelay);

startTimer(timerDuration, timerElement, closeOrRedirect);

// --- Login password logic ---
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const pwd = document.getElementById('password').value;
    if (pwd === CORRECT_PASSWORD) {
        cancelTimer();
        loginMessage.textContent = "Timer cancelled!";
        loginMessage.style.color = "#39ff14";
        document.getElementById('password').value = "";
        loginForm.querySelector('button').disabled = true;
        loginForm.querySelector('input').disabled = true;
    } else {
        loginMessage.textContent = "Incorrect password";
        loginMessage.style.color = "#ff4b47";
        document.getElementById('password').value = "";
    }
});