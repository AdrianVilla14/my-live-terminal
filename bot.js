// Termy Security Bot Widget Logic

const botContainer = document.getElementById('aiBotWidget');
const botMessages = document.getElementById('botMessages');
const botForm = document.getElementById('botForm');
const botInput = document.getElementById('botInput');
const botCloseBtn = document.getElementById('botCloseBtn');
const botOpenBtn = document.getElementById('botOpenBtn');

// Responsive show/hide
botCloseBtn.onclick = () => {
    botContainer.style.display = "none";
    botOpenBtn.style.display = "block";
};
botOpenBtn.onclick = () => {
    botContainer.style.display = "flex";
    botOpenBtn.style.display = "none";
};

// Start hidden on mobile, open on desktop
function initBotDisplay() {
    if (window.innerWidth < 700) {
        botContainer.style.display = "none";
        botOpenBtn.style.display = "block";
    } else {
        botContainer.style.display = "flex";
        botOpenBtn.style.display = "none";
    }
}
window.addEventListener("resize", initBotDisplay);
window.addEventListener("DOMContentLoaded", initBotDisplay);

// Bot AI logic with special responses
function getSystemStatus() {
    return "✅ All systems are operational. No security threats detected.";
}
function getSecurityAdvice() {
    return "🔒 Tip: Use strong, unique passwords and never share sensitive info. Our system uses encryption to protect your data.";
}
function getIncidentReportHelp() {
    return "🛡️ If you notice any suspicious activity or believe your data may be compromised, please report it to our support team immediately.";
}
function getBotName() {
    return "🤖 My name is Termy! I'm here to help you monitor the site and keep your data safe.";
}

// Special QA logic
function checkSpecialQuestions(msg) {
    // Q1: How old are you?
    if (
        msg.includes("how old are you") ||
        msg.match(/\bage\b.*\b(you|your)\b/)
    ) {
        return "I'm a bot but I was made by my creator Villalon Inc in early March 2024";
    }
    // Q2: Are you going to take over the world? (or similar)
    if (
        msg.includes("take over the world") ||
        (msg.includes("take over") && msg.includes("world")) ||
        msg.match(/(are|will|do|could|can).*take over.*world/)
    ) {
        return "Depends 😎 but for now I'm here for security purposes";
    }
    return null;
}

function generateBotReply(userMsg) {
    const msg = userMsg.toLowerCase();

    // Custom Q&A
    const special = checkSpecialQuestions(msg);
    if (special) return special;

    if (msg.includes("name")) return getBotName();
    if (msg.includes("status")) return getSystemStatus();
    if (msg.includes("secure") || msg.includes("security")) return getSecurityAdvice();
    if (msg.includes("password")) return "Your passwords are securely stored using top industry practices.";
    if (msg.includes("report") || msg.includes("breach")) return getIncidentReportHelp();
    if (msg.includes("hello") || msg.includes("hi")) return "Hello! How can I assist you with security or monitoring today?";
    if (msg.includes("help")) return "You can ask me about system status, report issues, or get security tips!";
    return "I'm Termy, your AI assistant. I'm here to monitor site health and keep your data safe. Ask about system status or security help!";
}

function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `bot-message ${sender}`;
    div.textContent = text;
    botMessages.appendChild(div);
    botMessages.scrollTop = botMessages.scrollHeight;
}

botForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userMsg = botInput.value.trim();
    if (!userMsg) return;
    appendMessage(userMsg, "user");
    botInput.value = "";
    setTimeout(() => {
        const botReply = generateBotReply(userMsg);
        appendMessage(botReply, "bot");
    }, 600);
});