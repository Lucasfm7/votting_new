// URL da API para obter os candidatos
const API_URL = "https://django-server-production-f3c5.up.railway.app/api/candidatos/";

// Variável global para armazenar o candidato selecionado
let candidatoSelecionado = null;

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

// Função para criar os cards dos candidatos a partir dos dados da API
async function criarCandidatos() {
    const grid = document.getElementById("candidateGrid");
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
        loadingIndicator.classList.remove("hidden"); // Mostra o indicador de carregamento
    }

    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const candidatos = await response.json();

        candidatos.forEach((candidato) => {
            // Cria o elemento do card
            const card = document.createElement("div");
            card.classList.add("candidate-card");
            card.dataset.id = candidato.id; // Usa o ID do candidato
            card.dataset.nome = candidato.nome; // Armazena o nome completo

            // Define o nome do arquivo de imagem baseado no ID para evitar problemas com caracteres
            const nomeArquivoBase = `candidato_${candidato.id}`;

            // Cria a imagem, utilizando a pasta 'assets' e o nome baseado no ID
            const img = document.createElement("img");
            img.src = `assets/${nomeArquivoBase}.png`; // Inicialmente tenta .png
            img.alt = candidato.nome; // Nome com acento para exibição

            // Lista de extensões a serem tentadas
            const extensoes = ['.png', '.jpg', '.jpeg'];
            let tentativa = 0;

            img.onerror = function() {
                tentativa++;
                if (tentativa < extensoes.length) {
                    // Tenta a próxima extensão
                    this.src = `assets/${nomeArquivoBase}${extensoes[tentativa]}`;
                } else {
                    // Todas as tentativas falharam, usa a imagem padrão
                    this.src = `assets/no-perfil.png`;
                    this.classList.add("default-image");
                }
            };

            // Cria o nome do candidato para exibir corretamente
            const nomeElemento = document.createElement("p");
            nomeElemento.textContent = candidato.nome; // Nome com acento para exibição

            // Adiciona os elementos ao card
            card.appendChild(img);
            card.appendChild(nomeElemento);

            // Adiciona o card ao grid
            grid.appendChild(card);

            // Adiciona evento de clique para selecionar o candidato
            card.addEventListener("click", selecionarCandidato);
        });
    } catch (error) {
        console.error("Erro ao buscar os candidatos:", error);
        showNotification("Não foi possível carregar os candidatos. Tente novamente mais tarde.");
    } finally {
        if (loadingIndicator) {
            loadingIndicator.classList.add("hidden"); // Esconde o indicador de carregamento
        }
    }
}

// Função para registrar o voto
async function registrarVoto(cpf, candidateId) {
    const API_URL = "https://django-server-production-f3c5.up.railway.app/api/votos/";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Adicione headers de autenticação se necessário
            },
            body: JSON.stringify({
                cpf: cpf,
                candidate_id: candidateId
            })
        });

        if (response.ok) {
            const data = await response.json();
            showNotification("Voto registrado com sucesso!");
            // Definir variável no sessionStorage para indicar que o voto foi registrado
            sessionStorage.setItem("votoRegistrado", true);
            sessionStorage.setItem("votoCandidato", candidateId);
            // Redirecionar ou atualizar a interface conforme necessário
            window.location.href = 'success_page.html'; // Substitua pelo URL correto
        } else {
            const errorData = await response.json();
            showNotification(`Erro ao registrar voto: ${errorData.detail || 'Tente novamente.'}`);
        }
    } catch (error) {
        console.error("Erro na requisição de voto:", error);
        showNotification("Erro ao registrar voto. Tente novamente mais tarde.");
    }
}

// Função para verificar se o CPF foi validado
function isCpfValidado() {
    const cpfValidado = sessionStorage.getItem("cpfValidado");
    const validacaoTime = sessionStorage.getItem("validacaoTime");
    if (cpfValidado && validacaoTime) {
        const agora = new Date().getTime();
        const tempoDecorrido = agora - parseInt(validacaoTime, 10);
        const validade = 10 * 60 * 1000; // 10 minutos em milissegundos
        return tempoDecorrido < validade;
    }
    return false;
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

// Função para selecionar um candidato
function selecionarCandidato(event) {
    const card = event.currentTarget;

    // Desmarca o candidato anterior
    if (candidatoSelecionado && candidatoSelecionado !== card) {
        candidatoSelecionado.classList.remove("selected");
    }

    // Marca ou desmarca o candidato atual
    card.classList.toggle("selected");

    // Atualiza o candidato selecionado
    if (card.classList.contains("selected")) {
        candidatoSelecionado = card;
        document.getElementById("confirmButton").disabled = false;
    } else {
        candidatoSelecionado = null;
        document.getElementById("confirmButton").disabled = true;
    }
}

// Função para exibir o modal de confirmação
function exibirModalConfirmacao() {
    const modal = document.getElementById("confirmationModal");
    const nomeCandidato = candidatoSelecionado.dataset.nome;
    document.getElementById("selectedCandidateName").textContent = nomeCandidato;
    modal.classList.remove("hidden");
}

// Função para fechar o modal de confirmação
function fecharModalConfirmacao() {
    const modal = document.getElementById("confirmationModal");
    modal.classList.add("hidden");
}

// Função para exibir a animação de sucesso
function exibirAnimacaoSucesso() {
    const animacao = document.getElementById("successAnimation");
    const imgCandidato = document.getElementById("candidateImage");

    // Atualiza a imagem e exibe a animação
    const nomeArquivoBase = `candidato_${candidatoSelecionado.dataset.id}`;
    imgCandidato.src = `assets/${nomeArquivoBase}.png`;

    // Tratamento de erro caso a imagem específica também falhe no modal de sucesso
    imgCandidato.onerror = function() {
        this.src = `assets/no-perfil.png`;
        this.classList.add("default-image");
        this.onerror = null;
    };

    animacao.classList.remove("hidden");

    // Definir variável no sessionStorage para indicar que o voto foi registrado
    sessionStorage.setItem("votoRegistrado", true);
    sessionStorage.setItem("votoCandidato", candidatoSelecionado.dataset.id);

    // Esconde o modal de confirmação
    fecharModalConfirmacao();

    // Opcional: Redirecionar após exibir a animação
    setTimeout(() => {
        window.location.href = 'success_page.html'; // Substitua pelo URL correto
    }, 1000); // 1 segundo de espera para mostrar a animação
}

// Eventos para os botões
document.getElementById("confirmVoteButton").addEventListener("click", exibirAnimacaoSucesso);
document.getElementById("cancelVoteButton").addEventListener("click", fecharModalConfirmacao);
document.getElementById("confirmButton").addEventListener("click", exibirModalConfirmacao);
document.getElementById("backButton").addEventListener("click", () => {
    // Redireciona para a página inicial (ou qualquer outra ação que você queira realizar)
    window.location.href = "index_base.html";
});

// Evento para o botão de confirmação de voto
document.getElementById("confirmButton").addEventListener("click", () => {
    const cpfValidado = sessionStorage.getItem("cpfValidado");
    const nomePessoa = sessionStorage.getItem("nomePessoa");
    const empresaPessoa = sessionStorage.getItem("empresaPessoa");

    if (cpfValidado) {
        const cpf = "123.456.789-00"; // Substitua pelo CPF real validado
        const candidateId = candidatoSelecionado.dataset.id;

        // Registrar o voto via API
        registrarVoto(cpf, candidateId);
    } else {
        showNotification("CPF não validado. Por favor, valide seu CPF antes de votar.");
        // Redirecionar para a página de validação de CPF
        window.location.href = 'cpf_validation.html'; // Substitua pelo URL correto
    }
});

// Chama a função para criar os candidatos ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // Verificar se o CPF foi validado
    if (!isCpfValidado()) {
        showNotification("Sua validação expirou ou não foi realizada. Por favor, valide seu CPF.");
        window.location.href = 'cpf_validation.html'; // Substitua pela página correta
    } else {
        // Exibir saudação personalizada
        const saudacao = sessionStorage.getItem("saudacao");
        if (saudacao) {
            document.getElementById("saudacao").textContent = saudacao;
        }

        // Carregar candidatos
        criarCandidatos();
    }

    // Verificar se o voto foi registrado
    if (sessionStorage.getItem("votoRegistrado") === 'true') {
        showNotification("Seu voto foi registrado com sucesso!");
        // Opcional: redirecionar ou desabilitar a votação
    }
});
