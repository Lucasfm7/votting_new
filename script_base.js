// Função para exibir a notificação com esmaecimento
function showNotification(message, isError = true) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden", "success", "error");
    notificationBanner.classList.add("show", isError ? "error" : "success");

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

// Função para realizar a requisição GET com o CPF e verificar `ja_votou`
async function fetchPersonByCpf(cpf) {
    const baseUrl = "https://django-server-production-f3c5.up.railway.app/api/pessoas/pesquisar_cpf/";
    const cpfNumeros = cpf.replace(/\D/g, ''); // Remove a formatação e envia apenas números

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
        console.log("Dados recebidos da API:", data); // Log para depuração

        // Interpretação genérica de `ja_votou`
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

// Função para verificar o CPF ou CNPJ
document.getElementById("cpfForm").addEventListener("submit", async function(event) {
    event.preventDefault(); // Impede o comportamento padrão de recarregar a página

    const cpfCnpj = document.getElementById("cpfCnpj").value.trim();
    if (cpfCnpj === "") {
        showNotification("Por favor, insira um CPF ou CNPJ.");
        return;
    }

    // Exibir animação de espera no botão com a bolinha de carregamento
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");
    const btnAvancar = document.getElementById("btnAvancar"); // Adicionado para desabilitar o botão

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");
    checkmark.classList.add("hidden"); // Garantir que o checkmark está oculto inicialmente
    btnAvancar.disabled = true; // Desabilitar o botão para evitar múltiplos cliques

    try {
        const response = await fetchPersonByCpf(cpfCnpj);

        if (response.status === 'success') {
            const pessoa = response.data;

            // Exibir o checkmark verde
            spinner.classList.add("hidden");
            checkmark.classList.remove("hidden");
            checkmark.classList.add("show");

            // Salvando os dados no sessionStorage
            sessionStorage.setItem("cpfValidado", true);
            sessionStorage.setItem("validacaoTime", new Date().getTime());
            sessionStorage.setItem("nomePessoa", pessoa.nome || '');
            sessionStorage.setItem("empresaPessoa", pessoa.empresa || '');

            // Gerando saudação e salvando
            const saudacao = getSaudacao();
            sessionStorage.setItem("saudacao", saudacao);

            // Aguardar um pouco para exibir o checkmark antes de redirecionar
            setTimeout(() => {
                window.location.href = 'index_form.html'; // Redirecionar para a página de votação
            }, 1000); // 1 segundo de espera para mostrar o checkmark

        } else if (response.status === 'ja_votou') {
            // Já votou, a notificação já foi exibida
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
            btnAvancar.disabled = false; // Reabilitar o botão

        } else if (response.status === 'error') {
            // Ocultar animação de espera
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
            showNotification(response.message);
            btnAvancar.disabled = false; // Reabilitar o botão
        }

    } catch (error) {
        // Ocultar animação de espera e exibir o botão novamente
        spinner.classList.add("hidden");
        btnText.classList.remove("hidden");
        btnAvancar.disabled = false; // Reabilitar o botão
        // A notificação já foi exibida na função fetchPersonByCpf
    }
});

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

// Handle login form submission
resultadoLoginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("resultadoUsername").value.trim();
    const password = document.getElementById("resultadoPassword").value.trim();

    if (username === "" || password === "") {
        showNotification("Por favor, preencha todos os campos de login.");
        return;
    }

    try {
        const response = await fetch('https://django-server-production-f3c5.up.railway.app/api/admin/login/', { // Atualize a URL conforme seu endpoint
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const result = await response.json();
            if (result.success) {
                // Salvar estado de login no sessionStorage
                sessionStorage.setItem("resultadoLogado", true);
                sessionStorage.setItem("resultadoUsuario", username);

                // Fechar o modal
                resultadoModal.classList.remove("show");
                resultadoModal.classList.add("hidden");

                // Redirecionar para a página de resultados
                window.location.href = 'index_login.html'; // Substitua pelo nome correto da página de resultados
            } else {
                showNotification("Usuário ou senha inválidos.");
            }
        } else {
            showNotification("Erro na autenticação. Tente novamente mais tarde.");
        }
    } catch (error) {
        console.error("Erro na requisição de login:", error);
        showNotification("Erro ao tentar fazer login.");
    }
});
