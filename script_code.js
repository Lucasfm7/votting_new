// Simula o código de verificação enviado (por exemplo, 123456)
const codigoEnviado = "123456";

// Função para verificar o código inserido
function verificarCodigo() {
    const codigoInserido = Array.from(document.querySelectorAll(".code-input"))
        .map(input => input.value)
        .join("");

    if (codigoInserido.length === 6 && codigoInserido === codigoEnviado) {
        showSuccess();
        setTimeout(() => {
            window.location.href = "index_candidates.html"; // Redireciona para a página de seleção de candidatos
        }, 1000);
    } else if (codigoInserido.length === 6) {
        alert("Código incorreto. Tente novamente.");
    }
}

// Muda o foco para o próximo campo após digitar e permite colagem de 6 dígitos
document.querySelectorAll(".code-input").forEach((input, index, inputs) => {
    input.addEventListener("input", (e) => {
        const value = e.target.value;
        if (value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        } else if (value.length === 1 && index === inputs.length - 1) {
            verificarCodigo(); // Verifica automaticamente ao digitar o último dígito
        }
    });

    // Permite colar o código inteiro no primeiro campo
    input.addEventListener("paste", (e) => {
        const pasteData = e.clipboardData.getData('text').trim();
        const pasteArray = pasteData.split('');

        // Verifica se o código colado tem 6 dígitos
        if (pasteArray.length === 6) {
            inputs.forEach((field, i) => {
                field.value = pasteArray[i] || ''; // Preenche cada campo
            });
            verificarCodigo(); // Verifica o código após colar todos os dígitos
        }

        e.preventDefault(); // Impede o comportamento padrão de colagem
    });
});

// Função para mostrar o número de telefone na tela
function mostrarTelefone() {
    const numero = sessionStorage.getItem("telefone");
    const phoneInfo = document.getElementById("phoneInfo");
    phoneInfo.textContent = `Código enviado para o número: ${numero}`;
}

// Exibe o número na tela
mostrarTelefone();

// Função para mostrar sucesso no botão
function showSuccess() {
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");

    spinner.classList.add("hidden");
    btnText.classList.add("hidden");
    checkmark.classList.remove("hidden");
    checkmark.classList.add("show");
}

// Função para o temporizador de 3 minutos
function startTimer(duration, display) {
    let timer = duration, minutes, seconds;
    const intervalId = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = `Tempo restante: ${minutes}:${seconds}`;

        if (--timer < 0) {
            clearInterval(intervalId);
            bloquearCampos();
        }
    }, 1000);
}

// Função para bloquear os campos após expirar o tempo
function bloquearCampos() {
    document.querySelectorAll(".code-input").forEach(input => {
        input.disabled = true;
    });
    alert("O código expirou. Por favor, solicite um novo código.");
}

// Iniciar o temporizador de 3 minutos
window.onload = function () {
    const duration = 60 * 3; // 3 minutos em segundos
    const display = document.getElementById("timer");
    startTimer(duration, display);
};

// Voltar para a página de formulário de telefone
document.getElementById("backButton").addEventListener("click", () => {
    window.location.href = "index_form.html"; // Redireciona para a página de telefone
});

// Lógica para o botão de verificar código
document.getElementById("codeForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Exibir animação de espera no botão com a bolinha de carregamento
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");

    setTimeout(() => {
        verificarCodigo();

        // Ocultar spinner caso o código esteja incorreto
        if (document.querySelector(".checkmark.hidden")) {
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
        }
    }, 1000);
});
