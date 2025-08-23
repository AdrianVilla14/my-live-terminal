// Floating ChatGPT-4 Bot Widget for your website
// Shift+` toggles visibility. Remembers chat history in localStorage.
// You must set your OpenAI API key below for this to work.


(function () {
  const STORAGE_KEY = 'termyTHEbot_history';
  const API_KEY = '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'; // <-- Put your OpenAI key here (never expose in client code for production!)
  const MODEL = 'gpt-4o'; // Or 'gpt-4-turbo', etc.

  let frameVisible = false;
  let frame = null;
  let chatHistory = [];

  // Load chat from localStorage
  function loadChat() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) chatHistory = JSON.parse(data);
      else chatHistory = [];
    } catch {
      chatHistory = [];
    }
  }

  // Save chat to localStorage
  function saveChat() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatHistory));
  }

  // Render chat in widget
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

  // Floating frame & UI
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

    // Header
    const header = document.createElement('div');
    header.innerHTML = `<b>ChatGPT-4 Bot</b>
      <button style="float:right;" title="Clear chat" id="gpt-clear-btn">🗑️</button>`;
    header.style.marginBottom = '8px';
    frame.appendChild(header);

    // Chat history
    const chatDiv = document.createElement('div');
    chatDiv.className = 'chat-content';
    chatDiv.style.height = '250px';
    chatDiv.style.overflowY = 'auto';
    chatDiv.style.background = '#fafafa';
    chatDiv.style.border = '1px solid #eee';
    chatDiv.style.padding = '6px';
    chatDiv.style.marginBottom = '8px';
    frame.appendChild(chatDiv);

    // Message input
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

    // Events
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

  // Send message to OpenAI API
  async function sendMessage(msg) {
    if (!msg) return;
    if (API_KEY === 'YOUR_OPENAI_API_KEY') {
      alert('Set your OpenAI API key in chatgpt4bot.js!');
      return;
    }
    chatHistory.push({ role: 'user', content: msg });
    updateDisplay();
    saveChat();

    // Show typing...
    chatHistory.push({ role: 'assistant', content: '...' });
    updateDisplay();

    try {
      const history = chatHistory
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));
      // Remove the '...' typing placeholder before sending
      history.pop();

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL,
          messages: history,
          max_tokens: 700,
          temperature: 0.7
        })
      });
      const data = await res.json();
      // Remove '...' placeholder
      chatHistory.pop();
      if (data.choices && data.choices[0]) {
        chatHistory.push({
          role: 'assistant',
          content: data.choices[0].message.content.trim()
        });
      } else {
        chatHistory.push({
          role: 'assistant',
          content: 'Sorry, there was a problem. (API error)'
        });
      }
    } catch (e) {
      chatHistory.pop();
      chatHistory.push({ role: 'assistant', content: 'Error contacting OpenAI API.' });
    }
    saveChat();
    updateDisplay();
  }

  // Show/hide frame
  function setFrameVisible(visible) {
    frameVisible = visible;
    if (frame) {
      frame.style.display = visible ? 'block' : 'none';
      if (visible) updateDisplay();
    }
  }

  // Keyboard shortcut (Shift + ~)
  function handleShortcut(e) {
    if (e.shiftKey && e.code === 'Backquote' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setFrameVisible(!frameVisible);
    }
  }

  // Initialize
  window.addEventListener('DOMContentLoaded', function() {
    loadChat();
    createFrame();
    setFrameVisible(false);
    updateDisplay();
    document.addEventListener('keydown', handleShortcut);
  });
})();
