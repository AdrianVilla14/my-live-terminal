// userInputLogger.js
// Collects all user input events with a timeline, frame, and page URL, allows saving as PDF
// Shows/hides the floating logger with Shift+~ (tilde)
// Persists events in localStorage so data isn't lost on page reload or close
// Groups events by page URL (section per page in the PDF)

(function () {
  const STORAGE_KEY = 'userInputLoggerEvents';
  let userEvents = [];
  let frameVisible = false;
  let frame = null;

  // Helper for current timestamp
  function now() {
    return new Date().toISOString();
  }

  // Get the current page (pathname + search/hash)
  function getPage() {
    return window.location.pathname + window.location.search + window.location.hash;
  }

  // Helper: get context frame info (e.g. element and location)
  function getFrameInfo(element) {
    if (!element) return 'unknown';
    let tag = element.tagName;
    let name = element.getAttribute('name') || '';
    let id = element.id ? `#${element.id}` : '';
    let classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
    return `${tag}${id}${classes}${name ? `[name="${name}"]` : ''}`;
  }

  // Load user events from localStorage
  function loadEvents() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        userEvents = JSON.parse(data);
      } else {
        userEvents = [];
      }
    } catch (e) {
      userEvents = [];
    }
  }

  // Save user events to localStorage
  function saveEvents() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userEvents));
    } catch (e) {
      // Ignore for quota or serialization errors
    }
  }

  // Log event
  function logEvent(type, element, value) {
    userEvents.push({
      time: now(),
      type,
      frame: getFrameInfo(element),
      value,
      page: getPage()
    });
    saveEvents();
    updateDisplay();
  }

  // Listen to input events
  document.addEventListener('input', function (e) {
    const target = e.target;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
      logEvent('input', target, target.value);
    }
  }, true);

  // Listen to button clicks
  document.addEventListener('click', function (e) {
    const target = e.target;
    if (target.tagName === 'BUTTON' || target.type === 'submit') {
      logEvent('click', target, target.innerText || target.value);
    }
  }, true);

  // (Optional) Listen to form submissions
  document.addEventListener('submit', function (e) {
    logEvent('submit', e.target, 'form submitted');
  }, true);

  // Display log in a floating frame
  function updateDisplay() {
    if (!frame) return;
    let logDiv = frame.querySelector('.log-content');
    // Group by page
    const grouped = {};
    for (const ev of userEvents) {
      grouped[ev.page] = grouped[ev.page] || [];
      grouped[ev.page].push(ev);
    }

    let html = '';
    for (const page in grouped) {
      html += `<details open><summary><b>Page: ${page}</b> (${grouped[page].length} events)</summary>`;
      html += '<table style="width:100%;font-size:12px"><tr><th>Time</th><th>Type</th><th>Frame</th><th>Value</th></tr>';
      for (const ev of grouped[page]) {
        html += `<tr><td>${ev.time}</td><td>${ev.type}</td><td>${ev.frame}</td><td>${ev.value}</td></tr>`;
      }
      html += '</table></details>';
    }
    logDiv.innerHTML = html || 'User input timeline will appear here.';
  }

  // Create floating frame with export button and clear button
  function createFrame() {
    frame = document.createElement('div');
    frame.style.position = 'fixed';
    frame.style.bottom = '10px';
    frame.style.right = '10px';
    frame.style.zIndex = 99999;
    frame.style.background = 'rgba(255,255,255,0.97)';
    frame.style.border = '1px solid #888';
    frame.style.padding = '8px';
    frame.style.width = '440px';
    frame.style.maxHeight = '240px';
    frame.style.overflow = 'auto';
    frame.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    frame.style.fontFamily = 'monospace';
    frame.style.fontSize = '12px';
    frame.style.display = 'none'; // Initially hidden

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.innerText = 'Download as PDF';
    exportBtn.style.marginBottom = '8px';
    exportBtn.style.float = 'right';
    exportBtn.onclick = downloadPDF;

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.innerText = 'Clear Log';
    clearBtn.style.marginBottom = '8px';
    clearBtn.style.float = 'left';
    clearBtn.onclick = function() {
      if (confirm('Clear all logged user input events?')) {
        userEvents = [];
        saveEvents();
        updateDisplay();
      }
    };

    // Log content container
    const logDiv = document.createElement('div');
    logDiv.className = 'log-content';
    logDiv.innerText = 'User input timeline will appear here.';

    frame.appendChild(clearBtn);
    frame.appendChild(exportBtn);
    frame.appendChild(logDiv);

    document.body.appendChild(frame);
    window.__userInputLoggerFrame = frame;
  }

  // PDF download using jsPDF, with sections per page
  function downloadPDF() {
    if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
      alert('jsPDF library is required to export PDF.\nYou can add it via CDN:\n<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>');
      return;
    }
    let jsPDF = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
    const doc = new jsPDF('l', 'pt', 'a4');
    const margin = 20;
    let y = margin + 20;

    doc.setFontSize(14);
    doc.text('User Input Timeline', margin, y);
    y += 24;
    doc.setFontSize(10);

    // Group by page
    const grouped = {};
    for (const ev of userEvents) {
      grouped[ev.page] = grouped[ev.page] || [];
      grouped[ev.page].push(ev);
    }

    for (const page in grouped) {
      // Section Header
      doc.setFont('helvetica', 'bold');
      doc.text(`Page: ${page}`, margin, y);
      y += 16;
      doc.setFont('helvetica', 'bold');
      doc.text('Time', margin, y);
      doc.text('Type', margin + 150, y);
      doc.text('Frame', margin + 230, y);
      doc.text('Value', margin + 480, y);
      y += 15;
      doc.setFont('helvetica', 'normal');
      // Table rows
      for (const ev of grouped[page]) {
        doc.text(ev.time, margin, y, { maxWidth: 140 });
        doc.text(ev.type, margin + 150, y);
        doc.text(ev.frame, margin + 230, y, { maxWidth: 240 });
        doc.text(ev.value ? String(ev.value) : '', margin + 480, y, { maxWidth: 250 });
        y += 14;
        if (y > 560) { // new page if needed
          doc.addPage();
          y = margin + 20;
        }
      }
      y += 15;
      if (y > 560) {
        doc.addPage();
        y = margin + 20;
      }
    }

    doc.save('user-input-timeline.pdf');
  }

  // Show/hide frame
  function setFrameVisible(visible) {
    frameVisible = visible;
    if (frame) {
      frame.style.display = visible ? 'block' : 'none';
    }
  }

  // Keyboard shortcut (Shift + ~)
  function handleShortcut(e) {
    // e.code === 'Backquote' is the ~ / ` key (location varies by keyboard)
    if (e.shiftKey && e.code === 'Backquote' && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault();
      setFrameVisible(!frameVisible);
    }
  }

  // Initialize
  window.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    createFrame();
    setFrameVisible(false);
    updateDisplay();
    document.addEventListener('keydown', handleShortcut);
  });

  // Save events before the page unloads (for safety)
  window.addEventListener('beforeunload', saveEvents);
})();