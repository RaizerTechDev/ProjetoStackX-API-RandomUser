document.addEventListener('DOMContentLoaded', () => {
    const alertElement = document.querySelector('.alert');
    
    if (alertElement) {
        // Exibir o alerta
        alertElement.style.display = 'block';
        
        // Definir um temporizador para ocultar o alerta após 5 segundos
        setTimeout(() => {
            alertElement.style.opacity = '0';
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 300); // Tempo para a transição de opacidade
        }, 5000); // Tempo de exibição do alerta em milissegundos
    }
});
