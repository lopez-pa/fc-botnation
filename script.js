document.addEventListener('DOMContentLoaded', () => {
    initNavbarScroll();
    initMobileNav();
    initParticleSystem();
    initIntersectionObserver();
    initFlipCardsTouch();
    initChatbotModal();
    initTokenStatus();
});

/* ==========================================
   1. STICKY NAVBAR SCROLL EFFECT
   ========================================== */
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    const checkScroll = () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    };
    
    // Check immediately on load in case of page refresh
    checkScroll();
    window.addEventListener('scroll', checkScroll);
}

/* ==========================================
   2. MOBILE NAV MENU TOGGLE
   ========================================== */
function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }
}

/* ==========================================
   3. CANVAS PARTICLE SYSTEM (50 Particles)
   ========================================== */
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Size between 1px and 4px
            this.size = Math.random() * 3 + 1;
            // Slow luxury tech float speed
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            // Random opacity for depth
            this.alpha = Math.random() * 0.4 + 0.1;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            // Screen wrapping
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }
        
        draw() {
            ctx.save();
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // Electric blue fill color with alpha
            ctx.fillStyle = `rgba(59, 130, 246, ${this.alpha})`;
            // Add subtle glow
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#3b82f6';
            ctx.fill();
            ctx.restore();
        }
    }
    
    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    };
    animate();
}

/* ==========================================
   4. INTERSECTION OBSERVER & STAGGER ANIMATIONS
   ========================================== */
function initIntersectionObserver() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observerOptions = {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully in view
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // If it is a parent with stagger children (like module cards)
                if (entry.target.classList.contains('stagger-container')) {
                    const children = entry.target.querySelectorAll('.reveal-child');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('animate-in');
                        }, index * 100); // 0.1s stagger delay
                    });
                }
                
                entry.target.classList.add('animate-in');
                
                // If it has metrics numbers, start counter animation
                if (entry.target.classList.contains('metrics-grid')) {
                    animateCounters();
                }
                
                // Stop observing after animating
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    revealElements.forEach(el => {
        observer.observe(el);
    });
}

/* ==========================================
   5. METRICS NUMERICAL ANIMATION (animateCounter)
   ========================================== */
let countersAnimated = false;

function animateCounters() {
    if (countersAnimated) return;
    countersAnimated = true;
    
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds animation duration
        const startTime = performance.now();
        const startValue = 0;
        const isFloat = counter.getAttribute('data-float') === 'true';
        
        const updateCounter = (currentTime) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            // EaseOutQuad function
            const easeProgress = progress * (2 - progress);
            
            const currentValue = startValue + easeProgress * (target - startValue);
            
            if (isFloat) {
                counter.textContent = currentValue.toFixed(1);
            } else {
                counter.textContent = Math.floor(currentValue);
            }
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = isFloat ? target.toFixed(1) : target;
            }
        };
        
        requestAnimationFrame(updateCounter);
    });
}

/* ==========================================
   6. MOBILE TOUCH SUPPORT FOR 3D FLIP CARDS
   ========================================== */
function initFlipCardsTouch() {
    const cards = document.querySelectorAll('.module-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Check if user is clicking on a tag (which shouldn't flip the card, or should it?)
            // Normally tapping anywhere on the card toggles flip on mobile
            if (window.innerWidth <= 768) {
                // Remove flip from other cards first for clean experience
                cards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('flipped');
                    }
                });
                
                card.classList.toggle('flipped');
            }
        });
    });
}

/* ==========================================
   7. TOKEN STATUS BAR
   ========================================== */
function initTokenStatus() {
    startResetCountdown();
}

function startResetCountdown() {
    const el = document.getElementById('token-reset-value');
    if (!el) return;

    const ctpEl = document.getElementById('ctp-reset-value');

    function tick() {
        const now = new Date();
        const midnight = new Date(Date.UTC(
            now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1
        ));
        const diff = midnight - now;

        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        const timeStr = `${String(h).padStart(2,'0')}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
        if (el) el.textContent = timeStr;
        if (ctpEl) ctpEl.textContent = timeStr;
    }

    tick();
    setInterval(tick, 1000);
}

function updateTokenBar(rateLimit) {
    const { limitTokens, remainingTokens } = rateLimit;
    if (!limitTokens) return;

    const usedTokens = limitTokens - remainingTokens;
    const pct = Math.min((usedTokens / limitTokens) * 100, 100);

    const fill = document.getElementById('token-bar-fill');
    const numbers = document.getElementById('token-numbers');
    const ctpFill = document.getElementById('ctp-bar-fill');

    const applyBar = (el) => {
        if (!el) return;
        el.style.width = pct + '%';
        el.classList.remove('warning', 'danger');
        if (pct >= 90) el.classList.add('danger');
        else if (pct >= 65) el.classList.add('warning');
    };

    applyBar(fill);
    applyBar(ctpFill);

    const fmt = n => n >= 1000 ? (n / 1000).toFixed(0) + 'k' : n;
    if (numbers) numbers.textContent = `${fmt(usedTokens)} / ${fmt(limitTokens)} tokens`;
}

/* ==========================================
   8. CHATBOT SIMULATOR MODAL
   ========================================== */
function initChatbotModal() {
    const modal = document.getElementById('chatbot-modal');
    const overlay = document.getElementById('chatbot-overlay');
    const closeBtn = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messagesContainer = document.getElementById('chatbot-messages');
    const briefingScreen = document.getElementById('chatbot-briefing');
    const chatArea = document.getElementById('chatbot-chat-area');
    const startBtn = document.getElementById('briefing-start');
    const ctaButtons = document.querySelectorAll('[data-open-simulator]');

    if (!modal) return;

    const BOT_ICON = '👩‍💼';
    const BOT_OPENING = 'Weller. Guten Tag. Ich habe heute noch drei Meetings, also nutzen Sie die Zeit gut. Was möchten Sie wissen?';

    // Full conversation history sent to the API each turn
    const conversationHistory = [];
    let isLoading = false;
    let chatStarted = false;
    let conversationEnded = false;
    let endConvBox = null;

    function openModal() {
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
        showBriefing();
    }

    function closeModal() {
        modal.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    function showBriefing() {
        briefingScreen.classList.remove('hidden');
        chatArea.classList.remove('active');
    }

    function startChat() {
        briefingScreen.classList.add('hidden');
        chatArea.classList.add('active');
        if (!chatStarted) {
            chatStarted = true;
            // Add opening line to history so the model has context from the start
            conversationHistory.push({ role: 'assistant', content: BOT_OPENING });
            addBotMessage(BOT_OPENING, BOT_ICON);
        }
        setTimeout(() => input.focus(), 200);
    }

    ctaButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    startBtn.addEventListener('click', startChat);
    overlay.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });

    async function sendMessage() {
        const text = input.value.trim();
        if (!text || isLoading || conversationEnded) return;

        addUserMessage(text);
        conversationHistory.push({ role: 'user', content: text });
        input.value = '';
        input.style.height = 'auto';

        isLoading = true;
        sendBtn.disabled = true;
        const typingEl = showTypingIndicator();

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: conversationHistory })
            });

            typingEl.remove();

            if (response.status === 429) {
                const data = await response.json().catch(() => ({}));
                addErrorMessage(data.message || 'Das tägliche Anfragelimit wurde erreicht. Bitte morgen wieder versuchen.');
                return;
            }

            if (!response.ok) {
                addErrorMessage('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
                return;
            }

            const data = await response.json();
            let content = data.content || '';

            const END_TAG = '[GESPRÄCH_BEENDEN]';
            const hasEndTag = content.includes(END_TAG);
            const cleanContent = content.replace(END_TAG, '').trimEnd();

            conversationHistory.push({ role: 'assistant', content: cleanContent });
            addBotMessage(cleanContent, BOT_ICON);
            if (data.rateLimit) updateTokenBar(data.rateLimit);

            if (hasEndTag) showEndConvBox();

        } catch (err) {
            typingEl.remove();
            addErrorMessage('Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.');
        } finally {
            isLoading = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    function addBotMessage(htmlContent, icon) {
        const el = document.createElement('div');
        el.className = 'chat-message bot-message';
        el.innerHTML = `
            <div class="message-avatar">${icon || '🤖'}</div>
            <div class="message-bubble">
                <p>${escapeHtml(htmlContent)}</p>
                <span class="message-time">${getTime()}</span>
            </div>`;
        messagesContainer.appendChild(el);
        scrollToBottom();
    }

    function addUserMessage(text) {
        const el = document.createElement('div');
        el.className = 'chat-message user-message';
        el.innerHTML = `
            <div class="message-bubble">
                <p>${escapeHtml(text)}</p>
                <span class="message-time">${getTime()}</span>
            </div>`;
        messagesContainer.appendChild(el);
        scrollToBottom();
    }

    function addErrorMessage(text) {
        const el = document.createElement('div');
        el.className = 'system-message system-message--error';
        el.textContent = text;
        messagesContainer.appendChild(el);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const el = document.createElement('div');
        el.className = 'chat-message bot-message';
        el.innerHTML = `
            <div class="message-avatar">${BOT_ICON}</div>
            <div class="message-bubble">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>`;
        messagesContainer.appendChild(el);
        scrollToBottom();
        return el;
    }

    sendBtn.addEventListener('click', sendMessage);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 120) + 'px';
    });

    function scrollToBottom() {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getTime() {
        return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }

    function showEndConvBox() {
        if (endConvBox) return;
        endConvBox = document.createElement('div');
        endConvBox.className = 'end-conv-box';
        endConvBox.innerHTML = `
            <p class="end-conv-label">Gespräch beenden &amp; Bewertung erhalten?</p>
            <div class="end-conv-actions">
                <button class="end-conv-btn end-conv-confirm" title="Beenden &amp; Bewertung">✓</button>
                <button class="end-conv-btn end-conv-cancel" title="Fortfahren">✗</button>
            </div>`;
        messagesContainer.appendChild(endConvBox);
        scrollToBottom();

        endConvBox.querySelector('.end-conv-confirm').addEventListener('click', requestFeedback);
        endConvBox.querySelector('.end-conv-cancel').addEventListener('click', dismissEndConvBox);
    }

    function dismissEndConvBox() {
        if (endConvBox) {
            endConvBox.remove();
            endConvBox = null;
        }
        input.focus();
    }

    async function requestFeedback() {
        if (endConvBox) { endConvBox.remove(); endConvBox = null; }
        conversationEnded = true;
        input.disabled = true;
        sendBtn.disabled = true;
        input.placeholder = 'Gespräch beendet.';

        const typingEl = showTypingIndicator();
        const feedbackMsg = { role: 'user', content: 'FEEDBACK_ANFRAGE' };

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [...conversationHistory, feedbackMsg] })
            });

            typingEl.remove();

            if (!response.ok) {
                addErrorMessage('Feedback konnte nicht geladen werden.');
                return;
            }

            const data = await response.json();
            addFeedbackMessage(data.content || '');
            if (data.rateLimit) updateTokenBar(data.rateLimit);

        } catch {
            typingEl.remove();
            addErrorMessage('Verbindungsfehler beim Laden des Feedbacks.');
        }
    }

    function addFeedbackMessage(text) {
        const el = document.createElement('div');
        el.className = 'feedback-message';

        const escaped = escapeHtml(text);
        const html = escaped
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            .replace(/^[•\-] (.+)$/gm, '<li>$1</li>')
            .replace(/\n/g, '<br>');

        el.innerHTML = `
            <div class="feedback-header">📋 Feedback &amp; Bewertung</div>
            <div class="feedback-body">${html}</div>`;
        messagesContainer.appendChild(el);
        scrollToBottom();
    }
}
