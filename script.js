document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const navButtons = document.querySelectorAll('.nav-btn');
    const emojiGrid = document.getElementById('emoji-grid');
    const modal = document.getElementById('emoji-modal');
    const selectedEmoji = document.getElementById('selected-emoji');
    const emojiName = document.getElementById('emoji-name');
    const closeBtn = document.getElementById('close-btn');
    const themeSelect = document.getElementById('theme');

    // Fetch emoji.json (placeholder for dynamic loading)
    fetch('emoji.json')
        .then(response => response.json())
        .then(data => {
            data.forEach(emoji => {
                const card = document.createElement('div');
                card.className = 'emoji-card';
                card.textContent = emoji.character;
                card.dataset.name = emoji.name;
                card.addEventListener('click', () => {
                    selectedEmoji.textContent = emoji.character;
                    emojiName.textContent = emoji.name;
                    modal.style.display = 'flex';
                });
                emojiGrid.appendChild(card);
            });
        })
        .catch(error => console.error('Error loading emojis:', error));

    // Navbar section switching
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sectionId = button.dataset.section;
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(sectionId).classList.add('active');
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    // Close modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Theme toggle
    themeSelect.addEventListener('change', (e) => {
        document.body.className = e.target.value;
    });

    // Telegram WebApp integration
    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});
