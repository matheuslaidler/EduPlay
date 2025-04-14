document.addEventListener('DOMContentLoaded', function() {
    // Função para atualizar a logo baseado no tema atual
    function updateIndexLogo() {
        const logoImage = document.getElementById('logoImage');
        if (logoImage) {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            logoImage.src = currentTheme === 'dark' ? 
                'img/logo_whitefont.png' : 
                'img/logo_blackfont.png';
        }
    }

    // Atualizar logo inicialmente
    updateIndexLogo();

    // Observar mudanças no tema
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'data-theme') {
                updateIndexLogo();
            }
        });
    });

    // Configurar o observer
    observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme']
    });
}); 