// URL da API para obter os candidatos
const API_URL = "https://django-server-production-f3c5.up.railway.app/api/candidatos/";

// Lista de extensões de imagem a serem tentadas, na ordem de preferência
const EXTENSOES_IMAGEM = ['png', 'jpg', 'jpeg'];

// Variável global para armazenar o candidato selecionado
let candidatoSelecionado = null;

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
        const confirmButton = document.getElementById("confirmButton");
        if (confirmButton) {
            confirmButton.disabled = false;
        }
    } else {
        candidatoSelecionado = null;
        const confirmButton = document.getElementById("confirmButton");
        if (confirmButton) {
            confirmButton.disabled = true;
        }
    }
}

// Função para exibir o modal de confirmação
function exibirModalConfirmacao() {
    const modal = document.getElementById("confirmationModal");
    if (candidatoSelecionado) {
        const nomeCandidato = candidatoSelecionado.dataset.nome;
        const selectedCandidateName = document.getElementById("selectedCandidateName");
        if (selectedCandidateName) {
            selectedCandidateName.textContent = nomeCandidato;
        }
        modal.classList.remove("hidden");
    } else {
        exibirNotificacao("Nenhum candidato selecionado.");
    }
}

// Função para fechar o modal de confirmação
function fecharModalConfirmacao() {
    const modal = document.getElementById("confirmationModal");
    if (modal) {
        modal.classList.add("hidden");
    } else {
        console.warn("Elemento 'confirmationModal' não encontrado.");
    }
}

// Função para registrar o voto
async function registrarVoto(cpf, candidateId) {
    const API_URL_VOTOS = "https://django-server-production-f3c5.up.railway.app/api/votos/";

    try {
        const response = await fetch(API_URL_VOTOS, {
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
            exibirNotificacao("Voto registrado com sucesso!");
            // Definir variáveis no sessionStorage para indicar que o voto foi registrado
            sessionStorage.setItem("votoRegistrado", "true");
            sessionStorage.setItem("votoCandidato", candidateId);
            // Redirecionar ou atualizar a interface conforme necessário
            window.location.href = 'success_page.html'; // Substitua pelo URL correto
        } else {
            const errorData = await response.json();
            exibirNotificacao(`Erro ao registrar voto: ${errorData.detail || 'Tente novamente.'}`);
        }
    } catch (error) {
        console.error("Erro na requisição de voto:", error);
        exibirNotificacao("Erro ao registrar voto. Tente novamente mais tarde.");
    }
}

// Função para exibir a animação de sucesso
function exibirAnimacaoSucesso() {
    const animacao = document.getElementById("successAnimation");
    const imgCandidato = document.getElementById("candidateImage");

    if (animacao && imgCandidato && candidatoSelecionado) {
        // Atualiza a imagem e exibe a animação
        const nomeArquivoBase = `candidato_${candidatoSelecionado.dataset.id}`;
        imgCandidato.dataset.nomeBase = nomeArquivoBase;
        imgCandidato.dataset.extIndex = 0;
        imgCandidato.src = `assets/${nomeArquivoBase}.${EXTENSOES_IMAGEM[0]}`;

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

        // Opcional: Redirecionar após exibir a animação
        setTimeout(() => {
            window.location.href = 'success_page.html'; // Substitua pelo URL correto
        }, 1000); // 1 segundo de espera para mostrar a animação
    } else {
        console.warn("Elementos necessários para a animação de sucesso não foram encontrados ou nenhum candidato foi selecionado.");
    }
}

// Função para exibir a saudação personalizada
function displayGreeting() {
    const saudacao = getSaudacao();
    const saudacaoElemento = document.getElementById("saudacao");
    if (saudacaoElemento) {
        saudacaoElemento.textContent = saudacao;
    } else {
        console.warn("Elemento 'saudacao' não encontrado.");
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

// Evento para o botão de confirmação de voto no modal
function configurarConfirmarVoto() {
    const confirmarVotoButton = document.getElementById("confirmVoteButton");
    if (confirmarVotoButton) {
        confirmarVotoButton.addEventListener("click", () => {
            const cpf = sessionStorage.getItem("cpf"); // Assegure-se que o CPF foi armazenado anteriormente

            if (!cpf) {
                exibirNotificacao("CPF não encontrado. Por favor, valide seu CPF novamente.");
                window.location.href = 'index_base.html'; // Redirecione para a página inicial
                return;
            }

            const candidateId = candidatoSelecionado ? candidatoSelecionado.dataset.id : null;

            if (candidateId) {
                // Registrar o voto via API
                registrarVoto(cpf, candidateId);
            } else {
                exibirNotificacao("Nenhum candidato selecionado.");
            }
        });
    } else {
        console.warn("Elemento 'confirmVoteButton' não encontrado.");
    }
}

// Eventos para os botões de confirmação e cancelamento no modal e outros
function configurarEventosBotoes() {
    const cancelVoteButton = document.getElementById("cancelVoteButton");
    const backButton = document.getElementById("backButton");

    if (cancelVoteButton) {
        cancelVoteButton.addEventListener("click", fecharModalConfirmacao);
    } else {
        console.warn("Elemento 'cancelVoteButton' não encontrado.");
    }

    if (backButton) {
        backButton.addEventListener("click", () => {
            // Redireciona para a página inicial (ou qualquer outra ação que você queira realizar)
            window.location.href = "index_base.html";
        });
    } else {
        console.warn("Elemento 'backButton' não encontrado.");
    }
}

// Função para configurar os event listeners
function configurarEventListeners() {
    const confirmButton = document.getElementById("confirmButton");
    if (confirmButton) {
        confirmButton.addEventListener("click", exibirModalConfirmacao);
    } else {
        console.warn("Elemento 'confirmButton' não encontrado.");
    }
}

// Chama a função para criar os candidatos ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    // Exibir saudação personalizada
    displayGreeting();

    // Carregar candidatos
    criarCandidatos();

    // Verificar se o voto foi registrado
    if (sessionStorage.getItem("votoRegistrado") === 'true') {
        exibirNotificacao("Seu voto foi registrado com sucesso!");
        // Opcional: redirecionar ou desabilitar a votação
    }

    // Configurar eventos dos botões
    configurarConfirmarVoto();
    configurarEventosBotoes();
    configurarEventListeners();
});
