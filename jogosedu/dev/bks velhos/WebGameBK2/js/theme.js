document.addEventListener('DOMContentLoaded', function() {
    // Elementos do tema
    const themeToggle = document.getElementById('themeToggle');
    const logoImage = document.getElementById('logoImage');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Carregar tema salvo ou usar preferência do sistema
    const savedTheme = localStorage.getItem('theme') || 
                      (prefersDarkScheme.matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateLogo(savedTheme);
    
    // Adicionar botão de tema se não existir
    if (!themeToggle) {
        const header = document.querySelector('.header') || document.body;
        const newThemeToggle = document.createElement('button');
        newThemeToggle.id = 'themeToggle';
        newThemeToggle.className = 'theme-toggle';
        newThemeToggle.textContent = '🌓';
        header.appendChild(newThemeToggle);
    }
    
    // Evento de clique no botão de tema
    document.getElementById('themeToggle').addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateLogo(newTheme);
    });

    // Função para atualizar a logo baseado no tema
    function updateLogo(theme) {
        if (logoImage) {
            logoImage.src = theme === 'dark' ? 
                'images/logo_whitefont.png' : 
                'images/logo_blackfont.png';
        }
    }

    // Atualizar tema quando a preferência do sistema mudar
    prefersDarkScheme.addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            updateLogo(newTheme);
        }
    });
}); 