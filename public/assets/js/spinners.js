document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("addUserButton")
    .addEventListener("click", function () {
      // Exibir o spinner
      document.getElementById("spinner").style.display = "inline-block";

      // Desabilitar o botão para evitar múltiplos cliques
      this.classList.add("disabled");
    });
});
