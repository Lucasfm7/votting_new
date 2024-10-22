// script_base.js

// Função para exibir notificações
function showNotification(message, type = "error") { // Tipos: "error", "success", "closed"
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden", "success", "error", "closed");
    notificationBanner.classList.add("show", type);

    setTimeout(() => {
        notificationBanner.classList.remove("show");
        notificationBanner.classList.add("hide");
        setTimeout(() => {
            notificationBanner.classList.add("hidden");
            notificationBanner.classList.remove("hide");
        }, 500);
    }, 3000);
}

// Funções para mostrar e esconder elementos
function showElement(element) {
    element.classList.remove("hidden");
    element.classList.add("show");
}

function hideElement(element) {
    element.classList.remove("show");
    element.classList.add("hidden");
}

// Função para resetar o estado do botão
function resetButtonState() {
    spinner.classList.add("hidden");
    btnText.classList.remove("hidden");
    btnAvancar.disabled = false;
}

// Seleção de elementos do formulário de CPF/CNPJ
const cpfForm = document.getElementById("cpfForm");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const btnAvancar = document.getElementById("btnAvancar");

// Manipulador de submissão do formulário de CPF/CNPJ
cpfForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const cpfCnpj = document.getElementById("cpfCnpj").value.trim();
    if (cpfCnpj === "") {
        showNotification("Por favor, insira um CPF ou CNPJ.", "error");
        return;
    }

    // Opcional: Mostrar spinner e desabilitar botão se desejar
    showElement(spinner);
    btnText.classList.add("hidden");
    btnAvancar.disabled = true;

    // Exibir a mensagem "Votação encerrada..." com fundo dourado
    showNotification("Votação encerrada, gentileza aguardar o resultado!", "closed");

    // Resetar o estado do botão após exibir a notificação
    setTimeout(() => {
        resetButtonState();
    }, 3000); // Tempo igual ao da notificação para consistência visual
});

// Seleção de elementos do modal de Resultado
const resultadoButton = document.querySelectorAll(".resultado-button");
const resultadoModal = document.getElementById("resultadoModal");
const btnCancelarResultado = document.getElementById("btnCancelarResultado");

// Função para abrir o modal de Resultado
function openResultadoModal() {
    showElement(resultadoModal);
}

// Função para fechar o modal de Resultado
function closeResultadoModal() {
    hideElement(resultadoModal);
}

// Adicionar event listeners aos botões "Resultado"
resultadoButton.forEach(button => {
    button.addEventListener("click", openResultadoModal);
});

// Event listener para o botão "Cancelar" no modal de Resultado
btnCancelarResultado.addEventListener("click", function() {
    closeResultadoModal();
});

// Manipulador de submissão do formulário de login do Resultado
const resultadoLoginForm = document.getElementById("resultadoLoginForm");

resultadoLoginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("resultadoUsername").value.trim();
    const password = document.getElementById("resultadoPassword").value.trim();

    if (username === "" || password === "") {
        showNotification("Por favor, preencha todos os campos de login.", "error");
        return;
    }

    const loginButton = resultadoLoginForm.querySelector("button[type='submit']");

    // Criar e exibir o spinner no botão de login
    const loginSpinner = document.createElement("div");
    loginSpinner.classList.add("spinner", "show");
    loginButton.textContent = "";
    loginButton.appendChild(loginSpinner);

    try {
        const response = await fetch('https://django-server-production-f3c5.up.railway.app/api/admin/login/', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                sessionStorage.setItem("resultadoLogado", true);
                sessionStorage.setItem("resultadoUsuario", username);

                closeResultadoModal();

                window.location.href = 'index_login.html';
            } else {
                showNotification("Usuário ou senha inválidos.", "error");
                loginButton.removeChild(loginSpinner);
                loginButton.textContent = "Entrar";
            }
        } else {
            showNotification("Erro na autenticação. Tente novamente mais tarde.", "error");
            loginButton.removeChild(loginSpinner);
            loginButton.textContent = "Entrar";
        }
    } catch (error) {
        console.error("Erro na requisição de login:", error);
        showNotification("Erro ao tentar fazer login.", "error");
        loginButton.removeChild(loginSpinner);
        loginButton.textContent = "Entrar";
    }
});

// Função para fechar o modal ao clicar fora do conteúdo
window.addEventListener("click", function(event) {
    if (event.target === resultadoModal) {
        closeResultadoModal();
    }
});
