// URL da API para obter os candidatos
const API_URL = "https://django-server-production-f3c5.up.railway.app/api/candidatos/";

// Lista de extensões de imagem a serem tentadas, na ordem de preferência
const EXTENSOES_IMAGEM = ['png', 'jpg', 'jpeg'];

// Variável global para armazenar o candidato selecionado
let candidatoSelecionado = null;

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

            // Define o nome base do arquivo de imagem baseado no ID
            const nomeBaseArquivo = `candidato_${candidato.id}`;

            // Cria a imagem, utilizando a primeira extensão da lista
            const img = document.createElement("img");
            img.dataset.nomeBase = nomeBaseArquivo; // Armazena o nome base para tentativas futuras
            img.dataset.extIndex = 0; // Índice da extensão atual
            img.src = `assets/${nomeBaseArquivo}.${EXTENSOES_IMAGEM[0]}`; // Tenta a primeira extensão
            img.alt = candidato.nome; // Nome com acento para exibição

            // Evento para tratar erro no carregamento da imagem
            img.onerror = function() {
                const currentIndex = parseInt(this.dataset.extIndex);
                const nextIndex = currentIndex + 1;

                if (nextIndex < EXTENSOES_IMAGEM.length) {
                    // Tenta a próxima extensão
                    this.src = `assets/${this.dataset.nomeBase}.${EXTENSOES_IMAGEM[nextIndex]}`;
                    this.dataset.extIndex = nextIndex;
                } else {
                    // Se todas as extensões falharem, usa a imagem padrão
                    this.src = `assets/no-perfil.png`;
                    // Remove o manipulador de erro para evitar loops infinitos caso a no-perfil.png falhe
                    this.onerror = null;
                    // Opcional: adicionar uma classe para estilizar a imagem de fallback
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
        exibirNotificacao("Não foi possível carregar os candidatos. Tente novamente mais tarde.");
    } finally {
        if (loadingIndicator) {
            loadingIndicator.classList.add("hidden"); // Esconde o indicador de carregamento
        }
    }
}

// Função para exibir notificações (banner no topo)
function exibirNotificacao(mensagem) {
    const notification = document.createElement("div");
    notification.classList.add("notification", "show");
    notification.textContent = mensagem;

    document.body.prepend(notification);

    // Ocultar a notificação após 5 segundos
    setTimeout(() => {
        notification.classList.remove("show");
        notification.classList.add("hide");

        // Remover o elemento do DOM após a animação
        notification.addEventListener("transitionend", () => {
            notification.remove();
        });
    }, 5000);
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
    const nomeArquivo = `candidato_${candidatoSelecionado.dataset.id}`;
    imgCandidato.dataset.nomeBase = nomeArquivo;
    imgCandidato.dataset.extIndex = 0;
    imgCandidato.src = `assets/${nomeArquivo}.${EXTENSOES_IMAGEM[0]}`;

    // Evento para tratar erro no carregamento da imagem no modal de sucesso
    imgCandidato.onerror = function() {
        const currentIndex = parseInt(this.dataset.extIndex);
        const nextIndex = currentIndex + 1;

        if (nextIndex < EXTENSOES_IMAGEM.length) {
            // Tenta a próxima extensão
            this.src = `assets/${this.dataset.nomeBase}.${EXTENSOES_IMAGEM[nextIndex]}`;
            this.dataset.extIndex = nextIndex;
        } else {
            // Se todas as extensões falharem, usa a imagem padrão
            this.src = `assets/no-perfil.png`;
            // Remove o manipulador de erro para evitar loops infinitos caso a no-perfil.png falhe
            this.onerror = null;
            // Opcional: adicionar uma classe para estilizar a imagem de fallback
            this.classList.add("default-image");
        }
    };

    animacao.classList.remove("hidden");

    // Esconde o modal de confirmação
    fecharModalConfirmacao();
}

// Eventos para os botões
document.getElementById("confirmVoteButton").addEventListener("click", exibirAnimacaoSucesso);
document.getElementById("cancelVoteButton").addEventListener("click", fecharModalConfirmacao);
document.getElementById("confirmButton").addEventListener("click", exibirModalConfirmacao);
document.getElementById("backButton").addEventListener("click", () => {
    // Redireciona para a página inicial (ou qualquer outra ação que você queira realizar)
    window.location.href = "index_base.html";
});

// Chama a função para criar os candidatos ao carregar a página
document.addEventListener("DOMContentLoaded", criarCandidatos);
