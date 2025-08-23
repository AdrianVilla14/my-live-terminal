(function () {
  const STORAGE_KEY = 'termyTHEbot_history';
  const MODEL = 'gpt-4o'; // Or 'gpt-4-turbo', etc.

  let frameVisible = false;
  let frame = null;
  let chatHistory = [];

  // Load chat from localStorage
  function loadChat() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      chatHistory = data ? JSON.parse(data) : [];
    } catch {
      chatHistory = [];
    }
  }

  // Save chat to localStorage
  function saveChat() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }

  // Render chat
  function updateDisplay() {
    if (!frame) return;
    const chatDiv = frame.querySelector('.chat-content');
    chatDiv.innerHTML = chatHistory.map(msg => `
      <div style="margin-bottom:8px;">
        <b style="color:${msg.role === 'user' ? '#1976d2' : '#388e3c'}">${msg.role === 'user' ? 'You' : 'Bot'}:</b>
        <div style="white-space:pre-wrap;margin-left:8px;">${msg.content}</div>
      </div>
    `).join('') || '<i style="color:#777">No messages yet.</i>';
    chatDiv.scrollTop = chatDiv.scrollHeight;
  }

  // Floating frame
  function createFrame() {
    frame = document.createElement('div');
    frame.style.position = 'fixed';
    frame.style.bottom = '10px';
    frame.style.left = '10px';
    frame.style.zIndex = 99999;
    frame.style.background = 'rgba(255,255,255,0.97)';
    frame.style.border = '1px solid #888';
    frame.style.padding = '10px';
    frame.style.width = '350px';
    frame.style.maxHeight = '400px';
    frame.style.overflow = 'auto';
    frame.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    frame.style.fontFamily = 'monospace';
    frame.style.fontSize = '13px';
    frame.style.display = 'none';

    const header = document.createElement('div');
    header.innerHTML = `<b>ChatGPT-4 Bot</b>
      <button style="float:right;" title="Clear chat" id="gpt-clear-btn">🗑️</button>`;
    header.style.marginBottom = '8px';
    frame.appendChild(header);

    const chatDiv = document.createElement('div');
    chatDiv.className = 'chat-content';
    chatDiv.style.height = '250px';
    chatDiv.style.overflowY = 'auto';
    chatDiv.style.background = '#fafafa';
    chatDiv.style.border = '1px solid #eee';
    chatDiv.style.padding = '6px';
    chatDiv.style.marginBottom = '8px';
    frame.appendChild(chatDiv);

    const inputDiv = document.createElement('div');
    inputDiv.style.display = 'flex';
    inputDiv.style.gap = '6px';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Type your message...';
    input.style.flex = '1';
    input.style.padding = '5px';

    const sendBtn = document.createElement('button');
    sendBtn.innerText = 'Send';
    sendBtn.style.padding = '5px 10px';

    inputDiv.appendChild(input);
    inputDiv.appendChild(sendBtn);
    frame.appendChild(inputDiv);

    document.body.appendChild(frame);

    sendBtn.onclick = () => sendMessage(input.value.trim());
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage(input.value.trim());
    });
    header.querySelector('#gpt-clear-btn').onclick = () => {
      if (confirm('Clear chat history?')) {
        chatHistory = [];
        saveChat();
        updateDisplay();
      }
    };
  }

  // Send message (calls backend instead of OpenAI directly)
  async function sendMessage(msg) {
    if (!msg) return;
    chatHistory.push({ role: 'user', content: msg });
    updateDisplay();
    saveChat();

    chatHistory.push({ role: 'assistant', content: '...' });
    updateDisplay();

    try {
      const history = chatHistory.filter(m => m.role === 'user' || m.role === 'assistant');
      history.pop(); // remove "..." placeholder

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: MODEL, messages: history })
      });

      const data = await res.json();
      chatHistory.pop();
      if (data.reply) {
        chatHistory.push({ role: 'assistant', content: data.reply });
      } else {
        chatHistory.push({ role: 'assistant', content: 'Sorry, API error.' });
      }
    } catch (e) {
      chatHistory.pop();
      chatHistory.push({ role: 'assistant', content: 'Error contacting server.' });
    }
    saveChat();
    updateDisplay();
  }

  function setFrameVisible(visible) {
    frameVisible = visible;
    if (frame) {
      frame.style.display = visible ? 'block' : 'none';
      if (visible) updateDisplay();
    }
  }

  function handleShortcut(e) {
    if (e.shiftKey && e.code === 'Backquote' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setFrameVisible(!frameVisible);
    }
  }

  window.addEventListener('DOMContentLoaded', function() {
    loadChat();
    createFrame();
    setFrameVisible(false);
    updateDisplay();
    document.addEventListener('keydown', handleShortcut);
  });
})();
