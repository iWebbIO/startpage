// Modern Startpage JavaScript
class ModernStartpage {
    constructor() {
        this.settings = this.loadSettings();
        this.searchEngines = {
            google: 'https://www.google.com/search?q=',
            bing: 'https://www.bing.com/search?q=',
            duckduckgo: 'https://duckduckgo.com/?q=',
            youtube: 'https://www.youtube.com/results?search_query='
        };
        
        this.defaultQuickLinks = [
            { name: 'Gmail', url: 'https://mail.google.com', icon: 'fas fa-envelope', category: 'productivity' },
            { name: 'GitHub', url: 'https://github.com', icon: 'fab fa-github', category: 'development' },
            { name: 'YouTube', url: 'https://youtube.com', icon: 'fab fa-youtube', category: 'entertainment' },
            { name: 'Netflix', url: 'https://netflix.com', icon: 'fab fa-netflix', category: 'entertainment' },
            { name: 'Spotify', url: 'https://spotify.com', icon: 'fab fa-spotify', category: 'entertainment' },
            { name: 'Twitter', url: 'https://twitter.com', icon: 'fab fa-twitter', category: 'social' },
            { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'fab fa-linkedin', category: 'professional' },
            { name: 'Reddit', url: 'https://reddit.com', icon: 'fab fa-reddit', category: 'social' },
            { name: 'Discord', url: 'https://discord.com', icon: 'fab fa-discord', category: 'social' },
            { name: 'Twitch', url: 'https://twitch.tv', icon: 'fab fa-twitch', category: 'entertainment' },
            { name: 'Steam', url: 'https://store.steampowered.com', icon: 'fab fa-steam', category: 'gaming' },
            { name: 'Amazon', url: 'https://amazon.com', icon: 'fab fa-amazon', category: 'shopping' },
            { name: 'Notion', url: 'https://notion.so', icon: 'fas fa-sticky-note', category: 'productivity' },
            { name: 'Figma', url: 'https://figma.com', icon: 'fab fa-figma', category: 'design' },
            { name: 'ChatGPT', url: 'https://chat.openai.com', icon: 'fas fa-robot', category: 'ai' },
            { name: 'Claude', url: 'https://claude.ai', icon: 'fas fa-brain', category: 'ai' }
        ];

        this.pomodoroTimer = {
            minutes: 25,
            seconds: 0,
            isRunning: false,
            interval: null,
            mode: 'work' // work, shortBreak, longBreak
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateTime();
        this.updateDate();
        this.setupParticles();
        this.loadWeather();
        this.loadQuickLinks();
        this.loadTodos();
        this.loadNotes();
        this.applyTheme();
        this.checkBatteryStatus();
        this.detectLocation();
        
        // Start intervals
        setInterval(() => this.updateTime(), 1000);
        setInterval(() => this.updateDate(), 60000);
        setInterval(() => this.loadWeather(), 600000); // Update weather every 10 minutes
    }

    setupEventListeners() {
        // Settings panel
        document.getElementById('settings-btn').addEventListener('click', () => this.toggleSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.querySelectorAll('input[name="theme"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.setTheme(e.target.value));
        });

        // Search
        document.getElementById('search-form').addEventListener('submit', (e) => this.handleSearch(e));
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearchInput(e));

        // Todo list
        document.getElementById('add-todo-btn').addEventListener('click', () => this.toggleTodoInput());
        document.getElementById('todo-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        // Notes
        document.getElementById('save-notes-btn').addEventListener('click', () => this.saveNotes());
        document.getElementById('notes-textarea').addEventListener('input', () => this.autoSaveNotes());

        // Pomodoro timer
        document.getElementById('pomodoro-start').addEventListener('click', () => this.startPomodoro());
        document.getElementById('pomodoro-pause').addEventListener('click', () => this.pausePomodoro());
        document.getElementById('pomodoro-reset').addEventListener('click', () => this.resetPomodoro());

        // Custom links
        document.getElementById('add-custom-link').addEventListener('click', () => this.showCustomLinkModal());
        document.getElementById('save-custom-link').addEventListener('click', () => this.saveCustomLink());
        document.getElementById('cancel-custom-link').addEventListener('click', () => this.hideCustomLinkModal());

        // Data management
        document.getElementById('export-settings').addEventListener('click', () => this.exportSettings());
        document.getElementById('import-settings').addEventListener('click', () => this.importSettings());
        document.getElementById('reset-settings').addEventListener('click', () => this.resetSettings());

        // Widget toggles
        document.querySelectorAll('.toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => this.toggleWidget(e.target.id, e.target.checked));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Click outside to close settings
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#settings-panel') && !e.target.closest('#settings-btn')) {
                if (document.getElementById('settings-panel').classList.contains('open')) {
                    this.toggleSettings();
                }
            }
        });
    }

    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
        document.getElementById('time').textContent = timeString;
    }

    updateDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('date').textContent = dateString;
    }

    setupParticles() {
        if (!this.settings.particles) return;

        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    async loadWeather() {
        if (!this.settings.weather) return;

        try {
            // Using a free weather API (OpenWeatherMap requires API key)
            // For demo purposes, we'll simulate weather data
            const weatherData = {
                temperature: Math.floor(Math.random() * 30) + 10,
                description: ['Sunny', 'Cloudy', 'Partly Cloudy', 'Rainy'][Math.floor(Math.random() * 4)],
                icon: ['sun', 'cloud', 'cloud-sun', 'cloud-rain'][Math.floor(Math.random() * 4)]
            };

            document.getElementById('temperature').textContent = `${weatherData.temperature}°C`;
            document.getElementById('weather-desc').textContent = weatherData.description;
            
            const weatherIcon = document.querySelector('.weather-icon');
            weatherIcon.className = `fas fa-${weatherData.icon} weather-icon text-2xl text-yellow-400`;
            
            // Update background based on weather
            this.updateWeatherBackground(weatherData.description);
        } catch (error) {
            console.error('Weather loading failed:', error);
            document.getElementById('weather-desc').textContent = 'Weather unavailable';
        }
    }

    updateWeatherBackground(weather) {
        const body = document.body;
        const hour = new Date().getHours();
        
        if (this.settings.theme === 'auto') {
            if (weather.includes('Rain')) {
                body.className = 'text-white relative theme-night';
            } else if (hour < 6) {
                body.className = 'text-white relative theme-night';
            } else if (hour < 12) {
                body.className = 'text-white relative theme-morning';
            } else if (hour < 18) {
                body.className = 'text-white relative theme-afternoon';
            } else {
                body.className = 'text-white relative theme-evening';
            }
        }
    }

    loadQuickLinks() {
        const container = document.getElementById('quick-links');
        const settingsContainer = document.getElementById('quick-links-settings');
        
        container.innerHTML = '';
        settingsContainer.innerHTML = '';

        const allLinks = [...this.defaultQuickLinks, ...this.settings.customLinks];
        
        allLinks.forEach((link, index) => {
            if (this.settings.enabledLinks.includes(link.name)) {
                // Add to main display
                const linkElement = document.createElement('a');
                linkElement.href = link.url;
                linkElement.className = 'quick-link flex flex-col items-center p-3 rounded-xl hover:bg-white/10 text-center';
                linkElement.innerHTML = `
                    <i class="${link.icon} text-2xl mb-2"></i>
                    <span class="text-xs font-medium">${link.name}</span>
                `;
                container.appendChild(linkElement);
            }

            // Add to settings
            const settingElement = document.createElement('label');
            settingElement.className = 'flex items-center justify-between p-2 rounded-lg hover:bg-white/5';
            settingElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <i class="${link.icon} text-sm"></i>
                    <span class="text-sm">${link.name}</span>
                </div>
                <input type="checkbox" ${this.settings.enabledLinks.includes(link.name) ? 'checked' : ''} 
                       onchange="startpage.toggleQuickLink('${link.name}', this.checked)">
            `;
            settingsContainer.appendChild(settingElement);
        });
    }

    toggleQuickLink(name, enabled) {
        if (enabled) {
            if (!this.settings.enabledLinks.includes(name)) {
                this.settings.enabledLinks.push(name);
            }
        } else {
            this.settings.enabledLinks = this.settings.enabledLinks.filter(link => link !== name);
        }
        this.saveSettings();
        this.loadQuickLinks();
    }

    loadTodos() {
        if (!this.settings.todos) return;

        const container = document.getElementById('todo-list');
        container.innerHTML = '';

        this.settings.todos.forEach((todo, index) => {
            const todoElement = document.createElement('div');
            todoElement.className = `todo-item flex items-center justify-between p-2 rounded-lg ${todo.completed ? 'completed' : ''}`;
            todoElement.innerHTML = `
                <div class="flex items-center space-x-3">
                    <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                           onchange="startpage.toggleTodo(${index})">
                    <span class="text-sm">${todo.text}</span>
                </div>
                <button onclick="startpage.deleteTodo(${index})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash text-xs"></i>
                </button>
            `;
            container.appendChild(todoElement);
        });
    }

    toggleTodoInput() {
        const container = document.getElementById('todo-input-container');
        const input = document.getElementById('todo-input');
        
        if (container.style.display === 'none') {
            container.style.display = 'block';
            input.focus();
        } else {
            container.style.display = 'none';
            input.value = '';
        }
    }

    addTodo() {
        const input = document.getElementById('todo-input');
        const text = input.value.trim();
        
        if (text) {
            this.settings.todos.push({ text, completed: false, createdAt: new Date().toISOString() });
            this.saveSettings();
            this.loadTodos();
            this.toggleTodoInput();
        }
    }

    toggleTodo(index) {
        this.settings.todos[index].completed = !this.settings.todos[index].completed;
        this.saveSettings();
        this.loadTodos();
    }

    deleteTodo(index) {
        this.settings.todos.splice(index, 1);
        this.saveSettings();
        this.loadTodos();
    }

    loadNotes() {
        const textarea = document.getElementById('notes-textarea');
        textarea.value = this.settings.notes || '';
    }

    saveNotes() {
        const textarea = document.getElementById('notes-textarea');
        this.settings.notes = textarea.value;
        this.saveSettings();
        
        // Show save confirmation
        const btn = document.getElementById('save-notes-btn');
        const originalIcon = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            btn.innerHTML = originalIcon;
        }, 1000);
    }

    autoSaveNotes() {
        clearTimeout(this.notesTimeout);
        this.notesTimeout = setTimeout(() => {
            this.saveNotes();
        }, 2000);
    }

    startPomodoro() {
        if (!this.pomodoroTimer.isRunning) {
            this.pomodoroTimer.isRunning = true;
            this.pomodoroTimer.interval = setInterval(() => this.updatePomodoro(), 1000);
            document.getElementById('pomodoro-status').textContent = 'Focus time!';
        }
    }

    pausePomodoro() {
        this.pomodoroTimer.isRunning = false;
        clearInterval(this.pomodoroTimer.interval);
        document.getElementById('pomodoro-status').textContent = 'Paused';
    }

    resetPomodoro() {
        this.pomodoroTimer.isRunning = false;
        clearInterval(this.pomodoroTimer.interval);
        this.pomodoroTimer.minutes = 25;
        this.pomodoroTimer.seconds = 0;
        this.updatePomodoroDisplay();
        document.getElementById('pomodoro-status').textContent = 'Ready to focus';
    }

    updatePomodoro() {
        if (this.pomodoroTimer.seconds === 0) {
            if (this.pomodoroTimer.minutes === 0) {
                // Timer finished
                this.pomodoroTimer.isRunning = false;
                clearInterval(this.pomodoroTimer.interval);
                this.showPomodoroNotification();
                return;
            }
            this.pomodoroTimer.minutes--;
            this.pomodoroTimer.seconds = 59;
        } else {
            this.pomodoroTimer.seconds--;
        }
        this.updatePomodoroDisplay();
    }

    updatePomodoroDisplay() {
        const display = document.getElementById('pomodoro-time');
        const minutes = this.pomodoroTimer.minutes.toString().padStart(2, '0');
        const seconds = this.pomodoroTimer.seconds.toString().padStart(2, '0');
        display.textContent = `${minutes}:${seconds}`;
    }

    showPomodoroNotification() {
        document.getElementById('pomodoro-status').textContent = 'Time\'s up! Take a break.';
        
        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
            new Notification('Pomodoro Timer', {
                body: 'Time\'s up! Take a break.',
                icon: '/favicon.ico'
            });
        }
    }

    handleSearch(e) {
        e.preventDefault();
        const query = document.getElementById('search-input').value.trim();
        const engine = document.getElementById('search-engine').value;
        
        if (query) {
            window.open(this.searchEngines[engine] + encodeURIComponent(query), '_blank');
            document.getElementById('search-input').value = '';
        }
    }

    handleSearchInput(e) {
        // Could implement search suggestions here
    }

    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        panel.classList.toggle('open');
    }

    toggleTheme() {
        const themes = ['auto', 'morning', 'afternoon', 'evening', 'night'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length];
        this.setTheme(nextTheme);
    }

    setTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();
        this.applyTheme();
        
        // Update radio button
        document.querySelector(`input[name="theme"][value="${theme}"]`).checked = true;
    }

    applyTheme() {
        const body = document.body;
        const hour = new Date().getHours();
        
        if (this.settings.theme === 'auto') {
            if (hour < 6) {
                body.className = 'text-white relative theme-night';
            } else if (hour < 12) {
                body.className = 'text-white relative theme-morning';
            } else if (hour < 18) {
                body.className = 'text-white relative theme-afternoon';
            } else {
                body.className = 'text-white relative theme-evening';
            }
        } else {
            body.className = `text-white relative theme-${this.settings.theme}`;
        }
    }

    toggleWidget(widgetId, enabled) {
        const widgetName = widgetId.replace('-toggle', '');
        this.settings[widgetName] = enabled;
        this.saveSettings();
        
        // Apply widget visibility
        this.applyWidgetSettings();
    }

    applyWidgetSettings() {
        // Weather widget
        const weatherWidget = document.getElementById('weather-widget');
        if (weatherWidget) {
            weatherWidget.style.display = this.settings.weather ? 'flex' : 'none';
        }
        
        // Particles
        const particles = document.getElementById('particles');
        if (particles) {
            particles.style.display = this.settings.particles ? 'block' : 'none';
        }
    }

    showCustomLinkModal() {
        document.getElementById('custom-link-modal').style.display = 'flex';
    }

    hideCustomLinkModal() {
        document.getElementById('custom-link-modal').style.display = 'none';
        document.getElementById('custom-link-name').value = '';
        document.getElementById('custom-link-url').value = '';
        document.getElementById('custom-link-icon').value = '';
    }

    saveCustomLink() {
        const name = document.getElementById('custom-link-name').value.trim();
        const url = document.getElementById('custom-link-url').value.trim();
        const icon = document.getElementById('custom-link-icon').value.trim() || 'fas fa-globe';
        
        if (name && url) {
            this.settings.customLinks.push({ name, url, icon, category: 'custom' });
            this.settings.enabledLinks.push(name);
            this.saveSettings();
            this.loadQuickLinks();
            this.hideCustomLinkModal();
        }
    }

    async checkBatteryStatus() {
        if ('getBattery' in navigator) {
            try {
                const battery = await navigator.getBattery();
                const batteryElement = document.getElementById('battery-status');
                
                const updateBattery = () => {
                    const level = Math.round(battery.level * 100);
                    const charging = battery.charging;
                    
                    batteryElement.style.display = 'block';
                    batteryElement.innerHTML = `
                        <i class="fas fa-battery-${this.getBatteryIcon(level, charging)} mr-2"></i>
                        <span>${level}%</span>
                    `;
                };
                
                battery.addEventListener('chargingchange', updateBattery);
                battery.addEventListener('levelchange', updateBattery);
                updateBattery();
            } catch (error) {
                console.log('Battery API not supported');
            }
        }
    }

    getBatteryIcon(level, charging) {
        if (charging) return 'bolt';
        if (level > 75) return 'full';
        if (level > 50) return 'three-quarters';
        if (level > 25) return 'half';
        if (level > 10) return 'quarter';
        return 'empty';
    }

    async detectLocation() {
        if ('geolocation' in navigator) {
            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });
                
                // For demo purposes, we'll show a generic location
                document.getElementById('location').innerHTML = `
                    <i class="fas fa-map-marker-alt mr-2"></i>
                    <span>Your Location</span>
                `;
            } catch (error) {
                document.getElementById('location').innerHTML = `
                    <i class="fas fa-globe mr-2"></i>
                    <span>Location unavailable</span>
                `;
            }
        }
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search focus
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
        
        // Escape to close settings
        if (e.key === 'Escape') {
            if (document.getElementById('settings-panel').classList.contains('open')) {
                this.toggleSettings();
            }
        }
    }

    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'startpage-settings.json';
        link.click();
        
        URL.revokeObjectURL(url);
    }

    importSettings() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const importedSettings = JSON.parse(e.target.result);
                        this.settings = { ...this.getDefaultSettings(), ...importedSettings };
                        this.saveSettings();
                        location.reload();
                    } catch (error) {
                        alert('Invalid settings file');
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settings = this.getDefaultSettings();
            this.saveSettings();
            location.reload();
        }
    }

    getDefaultSettings() {
        return {
            theme: 'auto',
            enabledLinks: ['Gmail', 'GitHub', 'YouTube', 'Netflix', 'Spotify', 'Twitter', 'LinkedIn', 'Reddit'],
            customLinks: [],
            todos: [],
            notes: '',
            weather: true,
            todo: true,
            notes: true,
            pomodoro: true,
            particles: true
        };
    }

    loadSettings() {
        const saved = localStorage.getItem('startpage-settings');
        return saved ? { ...this.getDefaultSettings(), ...JSON.parse(saved) } : this.getDefaultSettings();
    }

    saveSettings() {
        localStorage.setItem('startpage-settings', JSON.stringify(this.settings));
    }
}

// Initialize the startpage
const startpage = new ModernStartpage();

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}
