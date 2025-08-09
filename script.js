// --- GLOBAL STATE & DOM REFERENCES ---
let messages = [];
let selectedModel = Object.keys(MODEL_CONFIGS)[0];
let systemPrompt = null;

const dom = {
    chatWindow: document.getElementById('chat-window'),
    messageInput: document.getElementById('message-input'),
    sendButton: document.getElementById('send-button'),
    modelSelect: document.getElementById('model-select'),
    classSelect: document.getElementById('class-select'),
    subjectContainer: document.getElementById('subject-container'),
    subjectSelect: document.getElementById('subject-select'),
    restartChatButton: document.getElementById('restart-chat-button'),
    themeToggle: document.getElementById('theme-toggle'),
    errorBanner: document.getElementById('error-banner'),
    themeToggleKnob: document.getElementById('theme-toggle-knob'),
    themeLabel: document.getElementById('theme-label'),
    mainSidebar: document.getElementById('main-sidebar'),
    sidebarOverlay: document.getElementById('sidebar-overlay'),
    menuToggle: document.getElementById('menu-toggle'),
    sidebarCloseButton: document.getElementById('sidebar-close-button'),
    // NEW: References for Welcome Screen
    welcomeScreen: document.getElementById('welcome-screen'),
    getStartedButton: document.getElementById('get-started-button'),
};

const ICONS = {
    user: `<svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    ai: `👋`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" /><path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" /></svg>`,
    copied: `<svg class="w-4 h-4 text-[var(--accent-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`,
    restart: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 11M20 20l-1.5-1.5A9 9 0 013.5 13" /></svg>`,
    menu: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>`,
    close: `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`,
};

// --- CORE FUNCTIONS ---
const handleSuggestionClick = (prompt) => {
    dom.messageInput.value = prompt;
    adjustTextareaHeight();
    handleSend();
};

const renderWelcomeScreen = () => {
    const suggestions = [
        { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>`, text: 'AI Study Tips' },
        { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2M5 15h14"></path></svg>`, text: 'Future AI Careers' },
        { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>`, text: 'Responsible AI' },
        { icon: `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>`, text: 'পরীক্ষার প্রস্তুতির টিপস' }
    ];

    let buttonsHTML = suggestions.map(s => `
                <button onclick="handleSuggestionClick('${s.text}')" class="flex items-center justify-center text-left p-4 bg-[var(--button-bg)] border border-[var(--border-color)] rounded-xl hover:bg-[var(--button-hover-bg)] hover:shadow-md transition-all duration-200 group">
                    <div class="mr-4 text-[var(--text-color)] group-hover:text-[var(--accent-color)] transition-colors">${s.icon}</div>
                    <span class="font-semibold text-md">${s.text}</span>
                </button>
            `).join('');

    dom.chatWindow.innerHTML = `
                <div class="flex-1 flex flex-col justify-center items-center text-center max-w-2xl mx-auto px-4 animate-fade-in-up">
                    <h1 class="text-4xl md:text-5xl font-bold text-[var(--text-color)] mb-3">
                        <span class="inline-block mr-2 animate-wiggle">👋</span> Hi! I'm TBD-01 –
                    </h1>
                    <h2 class="text-3xl md:text-4xl font-semibold text-[var(--text-color)] mb-8">
                        your AI study buddy.<br/>How can I help you grow today?
                    </h2>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">${buttonsHTML}</div>
                </div>`;
};

const copyToClipboard = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
        document.execCommand('copy');
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    } finally {
        document.body.removeChild(textarea);
    }
};

const createCopyButton = (textToCopy) => {
    const copyButton = document.createElement('button');
    copyButton.className = 'message-copy-button';
    copyButton.title = 'Copy message';
    copyButton.innerHTML = ICONS.copy;
    copyButton.onclick = (e) => {
        e.stopPropagation();
        if (copyToClipboard(textToCopy)) {
            copyButton.innerHTML = ICONS.copied;
            setTimeout(() => { copyButton.innerHTML = ICONS.copy; }, 2000);
        } else {
            showError('Failed to copy text.');
        }
    };
    return copyButton;
};

const renderMessage = (msg) => {
    const isUser = msg.sender === 'user';
    const wrapper = document.createElement('div');
    wrapper.className = `chat-message-wrapper animate-fade-in-up ${isUser ? 'user' : ''}`;

    const msgBubble = document.createElement('div');
    msgBubble.className = `relative group chat-message-bubble ${isUser ? 'user-message-bubble' : 'ai-message-bubble'}`;

    const prose = document.createElement('div');
    prose.className = `prose ${isUser ? 'text-[var(--user-msg-text)]' : 'text-[var(--ai-msg-text)]'}`;

    if (msg.streaming) {
        prose.innerHTML = `<div class="flex items-center space-x-3 text-[var(--ai-msg-text)]"><svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating response...</span></div>`;
    } else {
        prose.innerHTML = marked.parse(msg.text || '');
    }

    msgBubble.appendChild(prose);
    msg.domElement = prose;

    wrapper.appendChild(msgBubble);
    return wrapper;
};

const renderAllMessages = () => {
    dom.chatWindow.innerHTML = '';
    if (messages.length === 0) {
        renderWelcomeScreen();
        return;
    }
    messages.forEach(msg => {
        const messageElement = renderMessage(msg);
        dom.chatWindow.appendChild(messageElement);
        if (!msg.streaming && window.MathJax && msg.domElement) {
            MathJax.typesetPromise([msg.domElement]);
        }
    });
    dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
};

const showError = (message) => {
    dom.errorBanner.textContent = message;
    dom.errorBanner.classList.remove('hidden', 'opacity-0');
    dom.errorBanner.classList.add('opacity-100');
    setTimeout(() => {
        dom.errorBanner.classList.remove('opacity-100');
        dom.errorBanner.classList.add('opacity-0');
        setTimeout(() => dom.errorBanner.classList.add('hidden'), 300);
    }, 5000);
};

const toggleSendButton = (enable) => {
    dom.sendButton.disabled = !enable;
    dom.messageInput.disabled = !enable;
};

const handleSend = async () => {
    const text = dom.messageInput.value.trim();
    if (!text || dom.sendButton.disabled) return;

    toggleSendButton(false);
    dom.messageInput.value = '';
    adjustTextareaHeight();

    if (messages.length === 0) dom.chatWindow.innerHTML = '';

    const userMessage = { sender: 'user', text };
    messages.push(userMessage);
    dom.chatWindow.appendChild(renderMessage(userMessage));
    dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;

    const modelConfig = MODEL_CONFIGS[selectedModel];
    const aiMessage = { sender: 'ai', text: '', streaming: true };
    messages.push(aiMessage);
    const aiMessageElement = renderMessage(aiMessage);
    dom.chatWindow.appendChild(aiMessageElement);
    dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;

    try {
        let payload;
        let fetchOptions;
        let apiUrl;

        if (modelConfig.type === 'openrouter') {
            apiUrl = modelConfig.apiUrl;

            const messagesForApi = [];
            if (systemPrompt) {
                messagesForApi.push({ role: 'system', content: systemPrompt });
            }
            const visibleHistory = messages.slice(0, -1).map(m => ({
                role: m.sender === 'user' ? 'user' : 'assistant',
                content: m.text
            }));
            messagesForApi.push(...visibleHistory);

            payload = {
                model: modelConfig.modelName,
                messages: messagesForApi,
                temperature: 0.7
            };

            fetchOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.apiKey}`,
                    'HTTP-Referer': 'https://tbd-chat-app.com',
                    'X-Title': 'TBD-01 Chat' // BRANDING: Updated API Title
                },
                body: JSON.stringify(payload)
            };
        } else { // 'gemini'
            apiUrl = `${modelConfig.apiUrl}?key=${modelConfig.apiKey}`;

            const contentsForApi = [];
            if (systemPrompt) {
                contentsForApi.push({ role: 'user', parts: [{ text: systemPrompt }] });
                contentsForApi.push({ role: 'model', parts: [{ text: "Understood. I will act as the specified teacher and use LaTeX for all math, ensuring correct single backslashes and proper delimiters." }] });
            }
            const visibleHistory = messages.slice(0, -1).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }));
            contentsForApi.push(...visibleHistory);

            payload = {
                contents: contentsForApi,
                generationConfig: { temperature: 0.7 }
            };

            fetchOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            };
        }

        const response = await fetch(apiUrl, fetchOptions);
        const result = await response.json();

        if (!response.ok || result.error) {
            throw new Error(result.error?.message || `HTTP Error ${response.status}: ${JSON.stringify(result)}`);
        }

        let rawAiText;
        if (modelConfig.type === 'openrouter') {
            rawAiText = result.choices?.[0]?.message?.content || "No response received.";
        } else { // 'gemini'
            rawAiText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
        }

        // --- ROBUST LATEX PRE-PROCESSING AND SANITIZATION ---
        const mathBlocks = [];
        const mathRegex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
        let tempTextToProcess = rawAiText;

        let match;
        mathRegex.lastIndex = 0;
        let processedTextWithPlaceholders = rawAiText;

        while ((match = mathRegex.exec(tempTextToProcess)) !== null) {
            const fullMatch = match[0];

            let latexContent = fullMatch;
            latexContent = latexContent.replace(/\\\\/g, '\\');

            const placeholder = `MATH_PLACEHOLDER_${mathBlocks.length}__`;
            mathBlocks.push({ placeholder: placeholder, latex: latexContent });

            processedTextWithPlaceholders =
                processedTextWithPlaceholders.substring(0, match.index) +
                placeholder +
                processedTextWithPlaceholders.substring(match.index + fullMatch.length);

            mathRegex.lastIndex = match.index + placeholder.length;
            tempTextToProcess = processedTextWithPlaceholders;
        }

        let htmlContent = marked.parse(processedTextWithPlaceholders);

        mathBlocks.forEach(block => {
            const globalPlaceholderRegex = new RegExp(block.placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            htmlContent = htmlContent.replace(globalPlaceholderRegex, block.latex);
        });

        aiMessage.text = htmlContent;

    } catch (error) {
        aiMessage.text = `**Error:** ${error.message}`;
        console.error('API Error:', error);
        showError(error.message);
    } finally {
        aiMessage.streaming = false;
        const proseElement = aiMessage.domElement;
        const msgBubbleElement = proseElement.parentElement;

        proseElement.innerHTML = aiMessage.text;

        if (window.MathJax) {
            MathJax.typesetPromise([proseElement]).then(() => {
                dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
            }).catch(err => {
                console.error("MathJax rendering failed:", err);
                showError("Failed to render math formulas.");
            });
        } else {
            dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
        }

        if (msgBubbleElement && !msgBubbleElement.querySelector('.message-copy-button')) {
            msgBubbleElement.appendChild(createCopyButton(aiMessage.text));
        }

        dom.chatWindow.scrollTop = dom.chatWindow.scrollHeight;
        toggleSendButton(true);
    }
};

const adjustTextareaHeight = () => {
    const textarea = dom.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 192)}px`;
};

const setTheme = (theme) => {
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        dom.themeToggle.style.backgroundColor = 'var(--accent-color)';
        dom.themeToggleKnob.style.transform = 'translateX(20px)';
        dom.themeLabel.textContent = 'Dark';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
        dom.themeToggle.style.backgroundColor = 'var(--button-border)';
        dom.themeToggleKnob.style.transform = 'translateX(0px)';
        dom.themeLabel.textContent = 'Light';
    }
};

const toggleTheme = () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
};

const toggleSidebar = () => {
    dom.mainSidebar.classList.toggle('open');
    dom.sidebarOverlay.classList.toggle('open');
};

const startTeacherSession = (subjectKey) => {
    if (!subjectKey) return;

    const confirmAction = (message, onConfirm, onCancel) => {
        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modalOverlay.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-auto text-center">
                        <p class="text-lg font-semibold mb-4 text-[var(--text-color)]">${message}</p>
                        <div class="flex justify-center space-x-4">
                            <button id="modal-cancel" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                            <button id="modal-confirm" class="px-4 py-2 rounded-md bg-[var(--send-button-bg)] text-white hover:bg-[var(--send-button-hover-bg)] transition-colors">Confirm</button>
                        </div>
                    </div>
                `;
        document.body.appendChild(modalOverlay);

        document.getElementById('modal-confirm').onclick = () => {
            modalOverlay.remove();
            onConfirm();
        };
        document.getElementById('modal-cancel').onclick = () => {
            modalOverlay.remove();
            onCancel();
        };
    };

    confirmAction(`Start a new chat session with the selected Teacher? This will clear your current conversation.`, () => {
        dom.chatWindow.style.opacity = '0';
        if (window.innerWidth < 768) {
            toggleSidebar();
        }
        setTimeout(() => {
            const teacher = TEACHER_PROMPTS[subjectKey];
            systemPrompt = teacher.prompt;
            messages = [{ sender: 'ai', text: teacher.initialEngagementMessage }];
            renderAllMessages();

            // Ensure model select is always enabled
            dom.modelSelect.disabled = false;

            dom.chatWindow.style.opacity = '1';
        }, 300);
    }, () => {
        dom.subjectSelect.value = '';
    });
}

const init = () => {
    // Populate Model Select
    Object.keys(MODEL_CONFIGS).forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.innerText = name;
        dom.modelSelect.appendChild(option);
    });
    selectedModel = Object.keys(MODEL_CONFIGS)[0];
    dom.modelSelect.value = selectedModel;

    // Populate Class Select
    const defaultClassOption = document.createElement('option');
    defaultClassOption.value = "";
    defaultClassOption.innerText = "Select a Class...";
    defaultClassOption.disabled = true;
    defaultClassOption.selected = true;
    dom.classSelect.appendChild(defaultClassOption);

    const classOption8 = document.createElement('option');
    classOption8.value = "8";
    classOption8.innerText = "Class 8";
    dom.classSelect.appendChild(classOption8);

    const classOption910 = document.createElement('option');
    classOption910.value = "9-10";
    classOption910.innerText = "Class 9-10";
    dom.classSelect.appendChild(classOption910);

    // Add "No Class" option at the very bottom
    const noClassOption = document.createElement('option');
    noClassOption.value = "no-class";
    noClassOption.innerText = "No Class";
    dom.classSelect.appendChild(noClassOption);

    const populateSubjectSelect = (selectedClass) => {
        dom.subjectSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.innerText = "Select a Subject...";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        dom.subjectSelect.appendChild(defaultOption);

        const subjects = CLASS_SUBJECTS[selectedClass];
        if (subjects) {
            Object.keys(subjects).forEach(displayName => {
                const option = document.createElement('option');
                option.value = subjects[displayName]; // The value is the key for TEACHER_PROMPTS
                option.innerText = displayName; // The text is the user-friendly name
                dom.subjectSelect.appendChild(option);
            });
        }
    };

    // Event listener for class selection
    dom.classSelect.addEventListener('change', (e) => {
        const selectedClass = e.target.value;
        if (selectedClass === '8' || selectedClass === '9-10') {
            populateSubjectSelect(selectedClass);
            dom.subjectContainer.classList.remove('hidden');
            dom.modelSelect.disabled = false;
        } else if (selectedClass === 'no-class') {
            dom.subjectContainer.classList.add('hidden');
            dom.subjectSelect.value = '';

            messages = [];
            systemPrompt = null;
            renderAllMessages();

            dom.modelSelect.disabled = false;
            dom.modelSelect.value = Object.keys(MODEL_CONFIGS)[0];
            selectedModel = Object.keys(MODEL_CONFIGS)[0];
        } else {
            dom.subjectContainer.classList.add('hidden');
            dom.modelSelect.disabled = false;
        }
    });

    // Set icons
    dom.restartChatButton.innerHTML = ICONS.restart;
    dom.menuToggle.innerHTML = ICONS.menu;
    dom.sidebarCloseButton.innerHTML = ICONS.close;

    // Set theme
    const preferredTheme = localStorage.getItem('theme') || 'light';
    setTheme(preferredTheme);

    renderAllMessages();

    // Event Listeners
    // NEW: Add event listener for the 'Get Started' button
    dom.getStartedButton.addEventListener('click', () => {
        dom.welcomeScreen.classList.add('hidden');
        // Use setTimeout to remove the element from the DOM after the fade-out transition completes
        setTimeout(() => {
            dom.welcomeScreen.style.display = 'none';
        }, 500); // This duration should match the transition time in CSS
    });

    dom.modelSelect.addEventListener('change', (e) => {
        selectedModel = e.target.value;
    });
    dom.subjectSelect.addEventListener('change', (e) => {
        const subjectKey = e.target.value;
        startTeacherSession(subjectKey);
    });
    dom.themeToggle.addEventListener('click', toggleTheme);
    dom.restartChatButton.addEventListener('click', () => {
        const confirmAction = (message, onConfirm, onCancel) => {
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
            modalOverlay.innerHTML = `
                        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-sm mx-auto text-center">
                            <p class="text-lg font-semibold mb-4 text-[var(--text-color)]">${message}</p>
                            <div class="flex justify-center space-x-4">
                                <button id="modal-cancel" class="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                                <button id="modal-confirm" class="px-4 py-2 rounded-md bg-[var(--send-button-bg)] text-white hover:bg-[var(--send-button-hover-bg)] transition-colors">Confirm</button>
                            </div>
                        </div>
                    `;
            document.body.appendChild(modalOverlay);

            document.getElementById('modal-confirm').onclick = () => {
                modalOverlay.remove();
                onConfirm();
            };
            document.getElementById('modal-cancel').onclick = () => {
                modalOverlay.remove();
                onCancel();
            };
        };

        confirmAction('Are you sure you want to clear this conversation and end the current session?', () => {
            dom.chatWindow.style.opacity = '0';
            setTimeout(() => {
                messages = [];
                systemPrompt = null;
                renderAllMessages();

                dom.classSelect.value = "";
                dom.subjectSelect.value = "";
                dom.subjectContainer.classList.add('hidden');
                dom.modelSelect.disabled = false;
                dom.modelSelect.value = Object.keys(MODEL_CONFIGS)[0];
                selectedModel = Object.keys(MODEL_CONFIGS)[0];

                dom.chatWindow.style.opacity = '1';
            }, 300);
        }, () => {
        });
    });
    dom.sendButton.addEventListener('click', handleSend);
    dom.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });
    dom.messageInput.addEventListener('input', adjustTextareaHeight);
    dom.menuToggle.addEventListener('click', toggleSidebar);
    dom.sidebarOverlay.addEventListener('click', toggleSidebar);
    dom.sidebarCloseButton.addEventListener('click', toggleSidebar);

    adjustTextareaHeight();
};

init();

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const bottomDecorationPath = document.querySelector('#bottom-decoration path');

    const updatePathFill = () => {
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            bottomDecorationPath.setAttribute('fill', '#064E3B');
        } else {
            bottomDecorationPath.setAttribute('fill', '#065f46');
        }
    };

    // Initial set
    updatePathFill();

    // Observe theme changes
    const observer = new MutationObserver(updatePathFill);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
});
