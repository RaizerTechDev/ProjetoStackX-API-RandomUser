document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addUserButton').addEventListener('click', function(event) {
        event.preventDefault(); // Impedir a navegação padrão

        // Exibir o spinner
        document.getElementById('spinner').style.display = 'inline-block';
        console.log('Spinner exibido');

        // Desabilitar o botão para evitar múltiplos cliques
        document.getElementById('addUserButton').classList.add('disabled');

        // Fazer a requisição para buscar os usuários
        fetch('/fetch-users')
            .then(response => {
                if (response.ok) {
                    // Redirecionar para a página principal após o sucesso
                    window.location.href = '/';
                } else {
                    // Tratar o erro
                    alert('Erro ao buscar usuários.');
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Erro na requisição.');
            })
            .finally(() => {
                // Reativar o botão e esconder o spinner quando a requisição terminar
                document.getElementById('spinner').style.display = 'none';
                document.getElementById('addUserButton').classList.remove('disabled');
            });
    });
});
