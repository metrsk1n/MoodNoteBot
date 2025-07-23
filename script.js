// MoodNoteBot Mini App
class MoodNoteApp {
    constructor() {
        this.data = null;
        this.currentCategory = null;
        this.currentEmotion = null;
        this.currentScreen = 'loading';
        this.quotes = [
            "Каждый день — это новая возможность изменить свою жизнь.",
            "Улыбка — это кривая, которая всё выпрямляет.",
            "Жизнь прекрасна, если знать, как её прожить.",
            "Счастье не в том, чтобы делать всегда то, что хочешь, а в том, чтобы всегда хотеть то, что делаешь.",
            "Самое важное в жизни — это быть самим собой.",
            "Позитивные мысли создают позитивную жизнь.",
            "Каждое утро мы рождаемся заново. То, что мы делаем сегодня, важнее всего.",
            "Мечты сбываются, если у нас хватает мужества следовать им.",
            "Будь собой, все остальные уже заняты.",
            "Жизнь — это то, что происходит с тобой, пока ты строишь планы."
        ];

        this.init();
    }

    async init() {
        // Initialize Telegram WebApp
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            // Set theme colors
            document.body.style.setProperty('--tg-color-scheme', tg.colorScheme);
        }

        // Load mock data if emoji.json is not available
        await this.loadData();
        this.setupEventListeners();
        this.showScreen('categories');
        this.loadLastEmotion();
    }

    async loadData() {
        try {
            // Try to load emoji.json
            const response = await fetch('emoji.json');
            if (response.ok) {
                this.data = await response.json();
            } else {
                throw new Error('emoji.json not found');
            }
        } catch (error) {
            console.log('Loading mock data...');
            // Mock data structure for testing
            this.data = {
                "categories": {
                    "positive": {
                        "name": "Позитивные",
                        "emoji": "😊",
                        "emotions": {
                            "joy": { "name": "Радость", "emoji": "😄" },
                            "love": { "name": "Любовь", "emoji": "❤️" },
                            "excitement": { "name": "Восторг", "emoji": "🤩" },
                            "gratitude": { "name": "Благодарность", "emoji": "🙏" },
                            "peace": { "name": "Умиротворение", "emoji": "😌" },
                            "hope": { "name": "Надежда", "emoji": "🌟" }
                        }
                    },
                    "negative": {
                        "name": "Негативные",
                        "emoji": "😔",
                        "emotions": {
                            "sadness": { "name": "Грусть", "emoji": "😢" },
                            "anger": { "name": "Злость", "emoji": "😠" },
                            "fear": { "name": "Страх", "emoji": "😰" },
                            "anxiety": { "name": "Тревога", "emoji": "😟" },
                            "frustration": { "name": "Фрустрация", "emoji": "😤" },
                            "disappointment": { "name": "Разочарование", "emoji": "😞" }
                        }
                    },
                    "neutral": {
                        "name": "Нейтральные",
                        "emoji": "😐",
                        "emotions": {
                            "calm": { "name": "Спокойствие", "emoji": "😐" },
                            "tired": { "name": "Усталость", "emoji": "😴" },
                            "confused": { "name": "Смущение", "emoji": "😕" },
                            "bored": { "name": "Скука", "emoji": "😑" },
                            "thoughtful": { "name": "Задумчивость", "emoji": "🤔" },
                            "curious": { "name": "Любопытство", "emoji": "🧐" }
                        }
                    },
                    "complex": {
                        "name": "Сложные",
                        "emoji": "🤯",
                        "emotions": {
                            "nostalgia": { "name": "Ностальгия", "emoji": "🥺" },
                            "melancholy": { "name": "Меланхолия", "emoji": "😔" },
                            "overwhelmed": { "name": "Перегруженность", "emoji": "🤯" },
                            "conflicted": { "name": "Противоречие", "emoji": "😵‍💫" },
                            "vulnerable": { "name": "Уязвимость", "emoji": "🥹" },
                            "inspired": { "name": "Вдохновение", "emoji": "✨" }
                        }
                    }
                }
            };
        }
    }

    setupEventListeners() {
        // Back buttons
        document.getElementById('backToCategories').addEventListener('click', () => {
            this.showScreen('categories');
        });

        document.getElementById('backToEmotions').addEventListener('click', () => {
            this.showScreen('emotions');
        });

        // Action buttons
        document.getElementById('newQuoteBtn').addEventListener('click', () => {
            this.showRandomQuote();
        });

        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareEmotion();
        });
    }

    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active', 'prev');
        });

        // Show loading briefly
        if (screenName !== 'loading') {
            document.getElementById('loading').classList.add('active');
            setTimeout(() => {
                document.getElementById('loading').classList.remove('active');
                document.getElementById(screenName).classList.add('active');

                // Load content based on screen
                if (screenName === 'categories') {
                    this.loadCategories();
                } else if (screenName === 'emotions' && this.currentCategory) {
                    this.loadEmotions(this.currentCategory);
                } else if (screenName === 'result' && this.currentEmotion) {
                    this.showEmotionResult();
                }
            }, 300);
        } else {
            document.getElementById(screenName).classList.add('active');
        }

        this.currentScreen = screenName;
    }

    loadCategories() {
        const grid = document.getElementById('categoriesGrid');
        grid.innerHTML = '';

        Object.entries(this.data.categories).forEach(([key, category]) => {
            const card = this.createCategoryCard(key, category);
            grid.appendChild(card);
        });
    }

    createCategoryCard(categoryKey, category) {
        const card = document.createElement('button');
        card.className = 'category-card';
        card.innerHTML = `
            <span class="category-emoji">${category.emoji}</span>
            <span class="category-name">${category.name}</span>
        `;

        card.addEventListener('click', () => {
            this.currentCategory = categoryKey;
            this.showScreen('emotions');
        });

        return card;
    }

    loadEmotions(categoryKey) {
        const category = this.data.categories[categoryKey];
        const grid = document.getElementById('emotionsGrid');
        const title = document.getElementById('categoryTitle');

        title.textContent = category.name;
        grid.innerHTML = '';

        Object.entries(category.emotions).forEach(([key, emotion]) => {
            const card = this.createEmotionCard(key, emotion);
            grid.appendChild(card);
        });
    }

    createEmotionCard(emotionKey, emotion) {
        const card = document.createElement('button');
        card.className = 'emotion-card';
        card.innerHTML = `
            <span class="emotion-emoji">${emotion.emoji}</span>
            <span class="emotion-name">${emotion.name}</span>
        `;

        card.addEventListener('click', () => {
            this.currentEmotion = { key: emotionKey, ...emotion };
            this.saveLastEmotion();
            this.showScreen('result');
        });

        return card;
    }

    showEmotionResult() {
        document.getElementById('selectedEmoji').textContent = this.currentEmotion.emoji;
        document.getElementById('selectedEmotion').textContent = this.currentEmotion.name;
        this.showRandomQuote();
    }

    showRandomQuote() {
        const randomQuote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        const quoteElement = document.getElementById('quoteText');

        // Fade out animation
        quoteElement.style.opacity = '0';

        setTimeout(() => {
            quoteElement.textContent = randomQuote;
            // Fade in animation
            quoteElement.style.opacity = '1';
        }, 150);
    }

    shareEmotion() {
        if (window.Telegram?.WebApp) {
            const tg = window.Telegram.WebApp;
            const message = `Сейчас я чувствую: ${this.currentEmotion.name} ${this.currentEmotion.emoji}`;

            // Try to send data back to bot
            tg.sendData(JSON.stringify({
                emotion: this.currentEmotion.key,
                category: this.currentCategory,
                name: this.currentEmotion.name,
                emoji: this.currentEmotion.emoji
            }));
        } else {
            // Fallback for testing outside Telegram
            if (navigator.share) {
                navigator.share({
                    title: 'MoodNoteBot',
                    text: `Сейчас я чувствую: ${this.currentEmotion.name} ${this.currentEmotion.emoji}`,
                });
            } else {
                // Copy to clipboard
                const text = `Сейчас я чувствую: ${this.currentEmotion.name} ${this.currentEmotion.emoji}`;
                navigator.clipboard.writeText(text).then(() => {
                    this.showToast('Скопировано в буфер обмена!');
                });
            }
        }
    }

    saveLastEmotion() {
        const emotionData = {
            category: this.currentCategory,
            emotion: this.currentEmotion,
            timestamp: Date.now()
        };

        // Use in-memory storage instead of localStorage for Claude.ai compatibility
        this.lastEmotion = emotionData;
    }

    loadLastEmotion() {
        // In a real app, you might load from localStorage here
        // For now, we'll just use the in-memory storage
        if (this.lastEmotion) {
            const data = this.lastEmotion;
            // Check if saved within last 24 hours
            if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                this.currentCategory = data.category;
                this.currentEmotion = data.emotion;
            }
        }
    }

    showToast(message) {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 20px;
            border-radius: 20px;
            font-size: 14px;
            z-index: 1000;
            animation: fadeInOut 3s ease-in-out;
        `;
        toast.textContent = message;

        // Add fade animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translate(-50%, 20px); }
                20%, 80% { opacity: 1; transform: translate(-50%, 0); }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
            document.head.removeChild(style);
        }, 3000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MoodNoteApp();
});

// Handle Telegram WebApp events
window.addEventListener('load', () => {
    if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;

        // Handle back button
        tg.BackButton.onClick(() => {
            const app = window.moodApp;
            if (app.currentScreen === 'result') {
                app.showScreen('emotions');
            } else if (app.currentScreen === 'emotions') {
                app.showScreen('categories');
            }
        });

        // Show back button when not on main screen
        if (window.moodApp && window.moodApp.currentScreen !== 'categories') {
            tg.BackButton.show();
        }
    }
});