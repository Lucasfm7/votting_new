const API_URL = "https://django-server-production-f3c5.up.railway.app/api/candidatos/";
const EXTENSOES_IMAGEM = ['png', 'jpg', 'jpeg'];
let candidatoSelecionado = null;

function exibirNotificacao(mensagem) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = mensagem;
    notificationBanner.classList.remove("hidden");
    notificationBanner.classList.add("show");

    setTimeout(() => {
        notificationBanner.classList.remove("show");
        notificationBanner.classList.add("hide");
        setTimeout(() => {
            notificationBanner.classList.add("hidden");
            notificationBanner.classList.remove("hide");
        }, 500);
    }, 5000);
}

async function criarCandidatos() {
    const grid = document.getElementById("candidateGrid");
    const loadingIndicator = document.getElementById("loadingIndicator");
    if (loadingIndicator) {
        loadingIndicator.classList.remove("hidden");
    }
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }
        const candidatos = await response.json();
        candidatos.forEach((candidato) => {
            const card = document.createElement("div");
            card.classList.add("candidate-card");
            card.dataset.id = candidato.id;
            card.dataset.nome = candidato.nome;
            const nomeBaseArquivo = `candidato_${candidato.id}`;
            const img = document.createElement("img");
            img.dataset.nomeBase = nomeBaseArquivo;
            img.dataset.extIndex = 0;
            img.src = `assets/${nomeBaseArquivo}.${EXTENSOES_IMAGEM[0]}`;
            img.alt = candidato.nome;
            img.onerror = function() {
                const currentIndex = parseInt(this.dataset.extIndex);
                const nextIndex = currentIndex + 1;
                if (nextIndex < EXTENSOES_IMAGEM.length) {
                    this.src = `assets/${this.dataset.nomeBase}.${EXTENSOES_IMAGEM[nextIndex]}`;
                    this.dataset.extIndex = nextIndex;
                } else {
                    this.src = `assets/no-perfil.png`;
                    this.onerror = null;
                    this.classList.add("default-image");
                }
            };
            const nomeElemento = document.createElement("p");
            nomeElemento.textContent = candidato.nome;
            card.appendChild(img);
            card.appendChild(nomeElemento);
            grid.appendChild(card);
            card.addEventListener("click", selecionarCandidato);
        });
    } catch (error) {
        console.error("Erro ao buscar os candidatos:", error);
        exibirNotificacao("Não foi possível carregar os candidatos. Tente novamente mais tarde.");
    } finally {
        if (loadingIndicator) {
            loadingIndicator.classList.add("hidden");
        }
    }
}

function selecionarCandidato(event) {
    const card = event.currentTarget;
    if (candidatoSelecionado && candidatoSelecionado !== card) {
        candidatoSelecionado.classList.remove("selected");
    }
    card.classList.toggle("selected");
    const confirmButton = document.getElementById("confirmButton");
    if (card.classList.contains("selected")) {
        candidatoSelecionado = card;
        if (confirmButton) {
            confirmButton.disabled = false;
        }
    } else {
        candidatoSelecionado = null;
        if (confirmButton) {
            confirmButton.disabled = true;
        }
    }
}

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

function fecharModalConfirmacao() {
    const modal = document.getElementById("confirmationModal");
    if (modal) {
        modal.classList.add("hidden");
    } else {
        console.warn("Elemento 'confirmationModal' não encontrado.");
    }
}

async function registrarVoto(cpf, candidateId, nome, sobrenome, telefone) {
    const API_URL_VOTOS = "https://django-server-production-f3c5.up.railway.app/api/votos/";
    try {
        // Sanitiza o CPF antes de enviar
        const response = await fetch(API_URL_VOTOS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cpf: cpf,
                candidate_id: candidateId,
                nome: nome,
                sobrenome: sobrenome,
                telefone: telefone
            })
        });

        // Log da resposta
        console.log("Resposta da API de votos:", response);

        if (response.ok) {
            exibirNotificacao("Voto registrado com sucesso!");
            sessionStorage.setItem("votoRegistrado", "true");
            sessionStorage.setItem("votoCandidato", candidateId);
            exibirAnimacaoSucesso(); // Exibir a animação de sucesso
        } else {
            const errorData = await response.json();
            console.error("Erro ao registrar voto:", errorData);
            exibirNotificacao(`Erro ao registrar voto: ${errorData.detail || 'Tente novamente.'}`);
        }
    } catch (error) {
        console.error("Erro na requisição de voto:", error);
        exibirNotificacao("Erro ao registrar voto. Tente novamente mais tarde.");
    }
}

function exibirAnimacaoSucesso() {
    const successAnimation = document.getElementById("successAnimation");
    if (successAnimation) {
        successAnimation.classList.remove("hidden");
        // Atualizar a imagem do candidato selecionado
        const candidateImage = document.getElementById("candidateImage");
        if (candidateImage && candidatoSelecionado) {
            const imgSrc = candidatoSelecionado.querySelector("img").src;
            candidateImage.src = imgSrc;
        }

        // Botão para voltar ao início
        const backButton = document.getElementById("backButton");
        if (backButton) {
            backButton.addEventListener("click", () => {
                // Limpar o sessionStorage e redirecionar para a página inicial
                sessionStorage.clear();
                window.location.href = 'index.html';
            });
        }
    } else {
        console.warn("Elemento 'successAnimation' não encontrado.");
    }
}

function configurarConfirmarVoto() {
    const confirmarVotoButton = document.getElementById("confirmVoteButton");
    if (confirmarVotoButton) {
        confirmarVotoButton.addEventListener("click", () => {
            let cpf = sessionStorage.getItem("cpfCnpj");
            let nome = sessionStorage.getItem("nome");
            let sobrenome = sessionStorage.getItem("sobrenome");
            let telefone = sessionStorage.getItem("telefone");
            if (!cpf) {
                exibirNotificacao("CPF não encontrado. Por favor, valide seu CPF novamente.");
                window.location.href = 'index.html';
                return;
            }
            // Sanitiza o CPF
            cpf = cpf.replace(/\D/g, '');

            const candidateId = candidatoSelecionado ? candidatoSelecionado.dataset.id : null;
            if (candidateId) {
                registrarVoto(cpf, candidateId, nome, sobrenome, telefone);
                fecharModalConfirmacao();
            } else {
                exibirNotificacao("Nenhum candidato selecionado.");
            }
        });
    } else {
        console.warn("Elemento 'confirmVoteButton' não encontrado.");
    }
}

function configurarEventosBotoes() {
    const cancelVoteButton = document.getElementById("cancelVoteButton");
    if (cancelVoteButton) {
        cancelVoteButton.addEventListener("click", fecharModalConfirmacao);
    } else {
        console.warn("Elemento 'cancelVoteButton' não encontrado.");
    }
}

function configurarEventListeners() {
    const confirmButton = document.getElementById("confirmButton");
    if (confirmButton) {
        confirmButton.addEventListener("click", exibirModalConfirmacao);
    } else {
        console.warn("Elemento 'confirmButton' não encontrado.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // Recupera os dados do sessionStorage
    let cpfCnpj = sessionStorage.getItem("cpfCnpj");
    let nome = sessionStorage.getItem("nome");
    let sobrenome = sessionStorage.getItem("sobrenome");
    let telefone = sessionStorage.getItem("telefone");

    // Sanitiza o CPF/CNPJ
    let cpfSanitized = cpfCnpj ? cpfCnpj.replace(/\D/g, '') : '';

    // Log dos valores recuperados
    console.log("CPF/CNPJ:", cpfCnpj);
    console.log("CPF Sanitizado:", cpfSanitized);
    console.log("Nome:", nome);
    console.log("Sobrenome:", sobrenome);
    console.log("Telefone:", telefone);

    // Verificação de dados ausentes
    if (!cpfSanitized || !nome || !sobrenome || !telefone) {
        exibirNotificacao("Dados não encontrados. Por favor, reinicie o processo.");
        window.location.href = 'index.html';
        return;
    }

    criarCandidatos();
    configurarConfirmarVoto();
    configurarEventosBotoes();
    configurarEventListeners();
});
