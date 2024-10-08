// script_base.js

// Função para exibir notificações
function showNotification(message, isError = true) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden", "success", "error");
    notificationBanner.classList.add("show", isError ? "error" : "success");

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

// Função para buscar pessoa pelo CPF/CNPJ
async function fetchPersonByCpf(cpf) {
    const baseUrl = "https://django-server-production-f3c5.up.railway.app/api/pessoas/pesquisar_cpf/";
    const cpfNumeros = cpf.replace(/\D/g, '');

    try {
        const response = await fetch(`${baseUrl}?cpf=${cpfNumeros}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 403) {
                return { status: 'error', message: "Acesso negado. Verifique suas permissões ou se o CSRF está correto." };
            } else if (response.status === 404) {
                return { status: 'error', message: "CPF não encontrado." };
            } else {
                return { status: 'error', message: `Erro HTTP! Status: ${response.status}` };
            }
        }

        const data = await response.json();
        console.log("Dados recebidos da API:", data);

        const jaVotou = data.ja_votou;
        const jaVotouInterpretado = jaVotou === true || jaVotou === 1 || jaVotou === '1';

        if (jaVotouInterpretado) {
            showNotification("Você já votou e não pode votar novamente.", true);
            return { status: 'ja_votou' };
        }

        return { status: 'success', data };

    } catch (error) {
        console.error("Erro ao realizar a requisição:", error);
        return { status: 'error', message: `Erro ao buscar CPF. ${error.message}` };
    }
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
cpfForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const cpfCnpj = document.getElementById("cpfCnpj").value.trim();
    if (cpfCnpj === "") {
        showNotification("Por favor, insira um CPF ou CNPJ.");
        return;
    }

    showElement(spinner);
    btnText.classList.add("hidden");
    btnAvancar.disabled = true;

    try {
        const response = await fetchPersonByCpf(cpfCnpj);

        if (response.status === 'success') {
            const pessoa = response.data;

            hideElement(spinner);

            // Armazenar informações no sessionStorage
            sessionStorage.setItem("cpfCnpj", cpfCnpj);
            sessionStorage.setItem("cpfValidado", true);
            sessionStorage.setItem("validacaoTime", new Date().getTime());
            sessionStorage.setItem("nomePessoa", pessoa.nome || '');
            sessionStorage.setItem("empresaPessoa", pessoa.empresa || '');

            // Redirecionar para a próxima página imediatamente
            window.location.href = 'index_form.html'; // Redirecionar para a próxima página

        } else if (response.status === 'ja_votou') {
            resetButtonState();

        } else if (response.status === 'error') {
            resetButtonState();
            showNotification(response.message);
        }

    } catch (error) {
        resetButtonState();
    }
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
        showNotification("Por favor, preencha todos os campos de login.");
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
                showNotification("Usuário ou senha inválidos.");
                loginButton.removeChild(loginSpinner);
                loginButton.textContent = "Entrar";
            }
        } else {
            showNotification("Erro na autenticação. Tente novamente mais tarde.");
            loginButton.removeChild(loginSpinner);
            loginButton.textContent = "Entrar";
        }
    } catch (error) {
        console.error("Erro na requisição de login:", error);
        showNotification("Erro ao tentar fazer login.");
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
