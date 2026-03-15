/* Agent Terminal */

// ----- STATE MANAGEMENT -----
const state = {
    sessionId: null,
    isStreaming: false,
    currentMessageElement: null,
    settings: {
        theme: 'matrix',
        fontSize: 14,
        sound: false,
        animation: true
    }
};

// Tool icons mapping
const TOOL_ICONS = {
    'get_current_weather': '🌤️',
    'get_currency_exchange_rates': '💱',
    'web_search': '🔍',
    'default': '🔧'
};


// ----- DOM ELEMENTS -----
const elements = {
    messages: document.getElementById('messages'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearBtn: document.getElementById('clearBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    status: document.getElementById('status'),
    sessionInfo: document.getElementById('sessionInfo'),
    toolsPanel: document.getElementById('toolsPanel'),
    toolsList: document.getElementById('toolsList'),
    toggleTools: document.getElementById('toggleTools'),
    themeSelect: document.getElementById('themeSelect'),
    fontSizeRange: document.getElementById('fontSizeRange'),
    fontSizeValue: document.getElementById('fontSizeValue'),
    soundToggle: document.getElementById('soundToggle'),
    animationToggle: document.getElementById('animationToggle'),
    resetSettings: document.getElementById('resetSettings'),
    saveSettings: document.getElementById('saveSettings')
};


// ----- INITIALIZATION -----
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadSession();
    loadTools();
    checkHealth();
    setupEventListeners();
});

function loadSettings() {
    const saved = localStorage.getItem('agentTerminalSettings');
    if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
    }
    applySettings();
}

function applySettings() {
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    document.documentElement.style.setProperty('--font-size', `${state.settings.fontSize}px`);
    
    elements.themeSelect.value = state.settings.theme;
    elements.fontSizeRange.value = state.settings.fontSize;
    elements.fontSizeValue.textContent = `${state.settings.fontSize}px`;
    elements.soundToggle.checked = state.settings.sound;
    elements.animationToggle.checked = state.settings.animation;
    
    updateSliderFill(elements.fontSizeRange);
}

function updateSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 100;
    const value = parseFloat(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    const borderColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim();
    
    slider.style.background = `linear-gradient(to right, ${primaryColor} 0%, ${primaryColor} ${percentage}%, ${borderColor} ${percentage}%, ${borderColor} 100%)`;
}

function saveSettings() {
    localStorage.setItem('agentTerminalSettings', JSON.stringify(state.settings));
}

function loadSession() {
    state.sessionId = localStorage.getItem('agentSessionId');
    if (!state.sessionId) {
        state.sessionId = generateUUID();
        localStorage.setItem('agentSessionId', state.sessionId);
    }
    updateSessionDisplay();
}

function updateSessionDisplay() {
    const shortId = state.sessionId.substring(0, 8);
    elements.sessionInfo.querySelector('code').textContent = shortId;
}

async function loadTools() {
    try {
        const response = await fetch('/api/tools');
        const data = await response.json();
        
        elements.toolsList.innerHTML = '';
        data.tools.forEach(tool => {
            const icon = TOOL_ICONS[tool.name] || TOOL_ICONS.default;
            const item = document.createElement('div');
            item.className = 'tool-item';
            item.title = tool.description;
            item.innerHTML = `
                <span class="tool-icon">${icon}</span>
                <span>${formatToolName(tool.name)}</span>
            `;
            elements.toolsList.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load tools:', error);
    }
}

async function checkHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'healthy' && data.agent_ready) {
            setStatus('connected', 'Connected');
        } else {
            setStatus('error', 'Agent not ready');
        }
    } catch (error) {
        setStatus('error', 'Disconnected');
    }
}

function setStatus(type, text) {
    elements.status.className = `status-indicator ${type}`;
    elements.status.querySelector('.status-text').textContent = text;
}


// ----- EVENT LISTENERS -----
function setupEventListeners() {
    // Input handling
    elements.userInput.addEventListener('input', handleInputChange);
    elements.userInput.addEventListener('keydown', handleKeyDown);
    elements.sendBtn.addEventListener('click', sendMessage);
    
    // Header buttons
    elements.clearBtn.addEventListener('click', clearChat);
    elements.settingsBtn.addEventListener('click', openSettings);
    elements.closeSettings.addEventListener('click', closeSettings);
    
    // Settings modal
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeSettings();
    });
    elements.themeSelect.addEventListener('change', (e) => {
        state.settings.theme = e.target.value;
        document.documentElement.setAttribute('data-theme', state.settings.theme);
        // Update slider fill with new theme colors
        setTimeout(() => updateSliderFill(elements.fontSizeRange), 10);
    });
    elements.fontSizeRange.addEventListener('input', (e) => {
        state.settings.fontSize = parseInt(e.target.value);
        elements.fontSizeValue.textContent = `${state.settings.fontSize}px`;
        updateSliderFill(e.target);
    });
    elements.soundToggle.addEventListener('change', (e) => {
        state.settings.sound = e.target.checked;
    });
    elements.animationToggle.addEventListener('change', (e) => {
        state.settings.animation = e.target.checked;
    });
    elements.saveSettings.addEventListener('click', () => {
        applySettings();
        saveSettings();
        closeSettings();
    });
    elements.resetSettings.addEventListener('click', () => {
        state.settings = {
            theme: 'matrix',
            fontSize: 14,
            sound: false,
            animation: true
        };
        applySettings();
    });
    
    // Tools panel toggle
    elements.toggleTools.addEventListener('click', () => {
        elements.toolsPanel.classList.toggle('collapsed');
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSettings();
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            clearChat();
        }
    });
}

function handleInputChange() {
    elements.sendBtn.disabled = !elements.userInput.value.trim() || state.isStreaming;
    
    // Auto-resize textarea
    elements.userInput.style.height = 'auto';
    elements.userInput.style.height = Math.min(elements.userInput.scrollHeight, 150) + 'px';
}

function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!state.isStreaming && elements.userInput.value.trim()) {
            sendMessage();
        }
    }
}


// ----- CHAT FUNCTIONALITY -----
async function sendMessage() {
    const message = elements.userInput.value.trim();
    if (!message || state.isStreaming) return;
    
    // Clear input and reset height
    elements.userInput.value = '';
    elements.userInput.style.height = 'auto';
    elements.sendBtn.disabled = true;
    state.isStreaming = true;
    
    // Add user message
    addUserMessage(message);
    
    // Create agent message placeholder
    const agentMessage = createAgentMessage();
    state.currentMessageElement = agentMessage.querySelector('.message-content');
    
    try {
        await streamResponse(message, agentMessage);
    } catch (error) {
        console.error('Stream error:', error);
        addErrorMessage('Connection error. Please try again.');
    } finally {
        state.isStreaming = false;
        removeCursor();
        handleInputChange();
        elements.userInput.focus();
    }
}

async function streamResponse(message, agentMessage) {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({
            message: message,
            session_id: state.sessionId
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentToolPanel = null;
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                    const event = JSON.parse(data);
                    handleStreamEvent(event, agentMessage, (panel) => {
                        currentToolPanel = panel;
                    });
                } catch (e) {
                }
            }
        }
    }
}

function handleStreamEvent(event, agentMessage, setToolPanel) {
    switch (event.type) {
        case 'session':
            if (event.session_id !== state.sessionId) {
                state.sessionId = event.session_id;
                localStorage.setItem('agentSessionId', state.sessionId);
                updateSessionDisplay();
            }
            break;
            
        case 'token':
            appendToken(event.content);
            break;
            
        case 'tool_start':
            const toolPanel = createToolPanel(event.tool);
            agentMessage.insertBefore(toolPanel, state.currentMessageElement.parentElement);
            setToolPanel(toolPanel);
            break;
            
        case 'tool_result':
            const panel = agentMessage.querySelector('.tool-panel:last-of-type');
            if (panel) {
                completeToolPanel(panel, event.result);
            }
            break;
            
        case 'error':
            addErrorMessage(event.message);
            break;
            
        case 'done':
            removeCursor();
            break;
    }
}


// ----- MESSAGE RENDERING -----
function addUserMessage(text) {
    const message = document.createElement('div');
    message.className = 'message user-message';
    message.innerHTML = `
        <div class="message-content">${escapeHtml(text)}</div>
    `;
    elements.messages.appendChild(message);
    scrollToBottom(true); 
}

function createAgentMessage() {
    const message = document.createElement('div');
    message.className = 'message agent-message';
    message.innerHTML = `
        <div class="message-header">
            <span>⚡</span>
            <span>Agent</span>
        </div>
        <div class="message-content"><span class="typing-cursor"></span></div>
    `;
    elements.messages.appendChild(message);
    scrollToBottom(true); 
    return message;
}

function appendToken(content) {
    if (!state.currentMessageElement) return;
    
    // Remove cursor if present
    const cursor = state.currentMessageElement.querySelector('.typing-cursor');
    
    // Create text node and insert before cursor
    const textNode = document.createTextNode(content);
    if (cursor) {
        state.currentMessageElement.insertBefore(textNode, cursor);
    } else {
        state.currentMessageElement.appendChild(textNode);
    }
    
    scrollToBottom();
}

function removeCursor() {
    const cursor = document.querySelector('.typing-cursor');
    if (cursor) cursor.remove();
}

function addErrorMessage(text) {
    const message = document.createElement('div');
    message.className = 'message error-message';
    message.innerHTML = `
        <div class="message-content">⚠️ ${escapeHtml(text)}</div>
    `;
    elements.messages.appendChild(message);
    scrollToBottom(true); // Force scroll for errors
}


// ----- TOOL PANELS -----
function createToolPanel(toolName) {
    const icon = TOOL_ICONS[toolName] || TOOL_ICONS.default;
    const displayName = formatToolName(toolName);
    
    const panel = document.createElement('div');
    panel.className = 'tool-panel';
    panel.innerHTML = `
        <div class="tool-panel-header">
            <div class="tool-info">
                <div class="tool-icon-wrapper">${icon}</div>
                <span class="tool-name">${displayName}</span>
            </div>
            <div class="tool-status running">
                <div class="spinner"></div>
                <span>Running...</span>
            </div>
        </div>
        <div class="tool-panel-body">
            <div class="tool-result">Executing...</div>
        </div>
    `;
    
    // Toggle expansion on header click
    panel.querySelector('.tool-panel-header').addEventListener('click', () => {
        panel.classList.toggle('expanded');
    });
    
    return panel;
}

function completeToolPanel(panel, result) {
    const status = panel.querySelector('.tool-status');
    status.className = 'tool-status completed';
    status.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span>Done</span>
    `;
    
    const resultEl = panel.querySelector('.tool-result');
    try {
        const parsed = JSON.parse(result);
        resultEl.textContent = JSON.stringify(parsed, null, 2);
    } catch {
        resultEl.textContent = result;
    }
}


// ----- UI HELPERS -----
function clearChat() {
    const welcomeMessage = elements.messages.querySelector('.system-message');
    elements.messages.innerHTML = '';
    if (welcomeMessage) {
        elements.messages.appendChild(welcomeMessage);
    }
    
    // Generate new session
    state.sessionId = generateUUID();
    localStorage.setItem('agentSessionId', state.sessionId);
    updateSessionDisplay();
}

function openSettings() {
    elements.settingsModal.classList.add('active');
}

function closeSettings() {
    elements.settingsModal.classList.remove('active');
}

function isNearBottom() {
    const threshold = 100; // pixels from bottom
    const { scrollTop, scrollHeight, clientHeight } = elements.messages;
    return scrollHeight - scrollTop - clientHeight < threshold;
}

function scrollToBottom(force = false) {
    // Only auto-scroll if user is near bottom or force is true
    if (force || isNearBottom()) {
        elements.messages.scrollTop = elements.messages.scrollHeight;
    }
}


// ----- UTILITY FUNCTIONS -----
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatToolName(name) {
    return name
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase());
}


// ----- SOUND EFFECTS (Optional) -----
const sounds = {
    send: null,
    receive: null,
    tool: null
};

function playSound(type) {
    if (!state.settings.sound || !sounds[type]) return;
    sounds[type].currentTime = 0;
    sounds[type].play().catch(() => {});
}

// Preload sounds if enabled
function initSounds() {
    // sounds.send = new Audio('/static/sounds/send.mp3');
    // sounds.receive = new Audio('/static/sounds/receive.mp3');
    // sounds.tool = new Audio('/static/sounds/tool.mp3');
}
