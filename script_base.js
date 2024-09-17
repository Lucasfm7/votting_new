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
    const baseUrl = "http://django-server-production-f3c5.up.railway.app/pessoas/pesquisar_cpf/";
    const params = { cpf: cpf.replace(/\D/g, '') }; // Remove a formatação e envia apenas números

    try {
        const response = await fetch(`${baseUrl}?cpf=${params.cpf}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        showNotification("Erro ao buscar CPF. Tente novamente.");
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

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");

    // Simulação de uma requisição de verificação de CPF
    setTimeout(async () => {
        // Simulação de uma resposta de sucesso
        const pessoa = await fetchPersonByCpf(cpfCnpj);

        if (pessoa) {
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
                window.location.href = 'index_form.html'; // Redirecionar para a página seguinte
            }, 1000); // 1 segundo de espera para mostrar o checkmark

        } else {
            // Ocultar animação de espera
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
            showNotification("CPF não encontrado.");
        }
    }, 1500);  // Simulação de atraso na resposta
});
