// Função para exibir a notificação com esmaecimento
function showNotification(message) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden");
    notificationBanner.classList.add("show");

    // Esconder o banner após 3 segundos com fade-out
    setTimeout(() => {
        notificationBanner.classList.remove("show");
        notificationBanner.classList.add("hide");
        setTimeout(() => {
            notificationBanner.classList.add("hidden");
            notificationBanner.classList.remove("hide");
        }, 500); // Tempo para o fade-out
    }, 3000);
}

// Função para realizar a requisição GET com o CPF
async function fetchPersonByCpf(cpf) {
    const baseUrl = "https://django-server-production-f3c5.up.railway.app/api/pessoas/pesquisar_cpf/";
    const params = { cpf: cpf.replace(/\D/g, '') }; // Remove a formatação e envia apenas números

    try {
        const response = await fetch(`${baseUrl}?cpf=${params.cpf}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Origin': window.location.origin,  // Inclui a origem da requisição
            },
        });

        if (!response.ok) {
            if (response.status === 403) {
                showNotification("Acesso negado. Verifique suas permissões ou se o CSRF está correto.");
            } else {
                showNotification(`Erro HTTP! Status: ${response.status}`);
            }
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Erro ao realizar a requisição:", error);
        showNotification(`Erro ao buscar CPF. Status: ${error.message}`);
        return null;
    }
}

// Função para gerar a saudação baseada no horário
function getSaudacao() {
    const now = new Date();
    const hora = now.getHours();
    let saudacao;

    if (hora >= 0 && hora < 12) {
        saudacao = "Bom dia";
    } else if (hora >= 12 && hora < 18) {
        saudacao = "Boa tarde";
    } else {
        saudacao = "Boa noite";
    }

    return saudacao;
}

// Função para autenticar o usuário
async function autenticarUsuario(username, password) {
    const baseUrl = "django-server-production-f3c5.up.railway.app"; // Substitua pela URL do seu servidor

    try {
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return data;
        } else {
            throw new Error(data.message || 'Erro na autenticação');
        }
    } catch (error) {
        console.error("Erro ao autenticar:", error);
        showNotification(`Erro: ${error.message}`);
        return null;
    }
}

// Atualizar o manipulador de submissão do formulário de login
resultadoLoginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("resultadoUsername").value.trim();
    const password = document.getElementById("resultadoPassword").value.trim();

    if (username === "" || password === "") {
        showNotification("Por favor, preencha todos os campos de login.");
        return;
    }

    // Exibir animação de espera no botão com a bolinha de carregamento
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");

    // Realizar a requisição de autenticação
    const resultado = await autenticarUsuario(username, password);

    if (resultado && resultado.success) {
        // Ocultar animação de espera
        spinner.classList.add("hidden");
        checkmark.classList.remove("hidden");
        checkmark.classList.add("show");

        // Salvar estado de login no sessionStorage
        sessionStorage.setItem("resultadoLogado", true);
        sessionStorage.setItem("resultadoUsuario", username);

        // Fechar o modal
        resultadoModal.classList.remove("show");
        resultadoModal.classList.add("hidden");

        // Redirecionar para a página de resultados
        setTimeout(() => {
            window.location.href = 'index_login.html'; // Substitua pelo nome correto da página de resultados
        }, 1000); // 1 segundo de espera para mostrar o checkmark

    } else {
        // Ocultar animação de espera
        spinner.classList.add("hidden");
        btnText.classList.remove("hidden");
        showNotification("Usuário ou senha inválidos.");
    }
});

// Funções para o botão Resultado

// Elementos do modal Resultado
const resultadoButton = document.querySelector(".resultado-button");
const resultadoModal = document.getElementById("resultadoModal");
const btnCancelarResultado = document.getElementById("btnCancelarResultado");
const resultadoLoginForm = document.getElementById("resultadoLoginForm");

// Abrir o modal Resultado ao clicar no botão
resultadoButton.addEventListener("click", () => {
    resultadoModal.classList.remove("hidden");
    resultadoModal.classList.add("show");
});

// Fechar o modal Resultado ao clicar em Cancelar
btnCancelarResultado.addEventListener("click", () => {
    resultadoModal.classList.remove("show");
    resultadoModal.classList.add("hidden");
});

// Fechar o modal ao clicar fora do conteúdo
window.addEventListener("click", (event) => {
    if (event.target === resultadoModal) {
        resultadoModal.classList.remove("show");
        resultadoModal.classList.add("hidden");
    }
});
