// Lista de nomes dos candidatos com acentos
const nomesCandidatos = [
    "Ana Silva",
    "Bruno Souza",
    "Carla Oliveira",
    "Diego Santos",
    "Eduarda Costa",
    "Felipe Lima",
    "Gabriela Alves",
    "Henrique Rodrigues",
    "Isabela Ferreira",
    "João Pereira",
    "Karina Martins",
    "Lucas Fernandes",
    "Mariana Ribeiro",
    "Nicolas Gomes",
    "Patrícia Barros"
];

// Função para remover acentos e espaços dos nomes (utilizado para o nome dos arquivos)
function removerAcentos(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_');
}

// Variável global para armazenar o candidato selecionado
let candidatoSelecionado = null;

// Função para criar os cards dos candidatos
function criarCandidatos() {
    const grid = document.getElementById("candidateGrid");

    nomesCandidatos.forEach((nome, index) => {
        // Cria o elemento do card
        const card = document.createElement("div");
        card.classList.add("candidate-card");
        card.dataset.index = index;

        // Remover acentos e espaços do nome para o caminho da imagem
        const nomeArquivo = removerAcentos(nome);

        // Cria a imagem, utilizando a pasta 'assets' e o nome corrigido (sem acentos)
        const img = document.createElement("img");
        img.src = `assets/${nomeArquivo}.png`; // Caminho da imagem com base no nome sem acento
        img.alt = nome; // Nome com acento para exibição

        // Cria o nome do candidato para exibir corretamente
        const nomeElemento = document.createElement("p");
        nomeElemento.textContent = nome; // Nome com acento para exibição

        // Adiciona os elementos ao card
        card.appendChild(img);
        card.appendChild(nomeElemento);

        // Adiciona o card ao grid
        grid.appendChild(card);

        // Adiciona evento de clique para selecionar o candidato
        card.addEventListener("click", selecionarCandidato);
    });
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
    const nomeCandidato = nomesCandidatos[candidatoSelecionado.dataset.index];
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
    const nomeArquivo = removerAcentos(nomesCandidatos[candidatoSelecionado.dataset.index]);
    imgCandidato.src = `assets/${nomeArquivo}.png`;

    animacao.classList.remove("hidden");

    // Esconde o modal de confirmação
    fecharModalConfirmacao();
}

// Evento para o botão de confirmar voto no modal
document.getElementById("confirmVoteButton").addEventListener("click", exibirAnimacaoSucesso);

// Evento para o botão de cancelar no modal
document.getElementById("cancelVoteButton").addEventListener("click", fecharModalConfirmacao);

// Evento para o botão de confirmar seleção na tela inicial
document.getElementById("confirmButton").addEventListener("click", exibirModalConfirmacao);

// Evento para o botão de voltar ao início
document.getElementById("backButton").addEventListener("click", () => {
    // Redireciona para a página inicial (ou qualquer outra ação que você queira realizar)
    window.location.href = "index_base.html";
});

// Chama a função para criar os candidatos ao carregar a página
document.addEventListener("DOMContentLoaded", criarCandidatos);
