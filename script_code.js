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

// Função para exibir a notificação de sucesso
function showSuccess(message) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden", "notification");
    notificationBanner.classList.add("success", "show");

    // Esconder o banner após 3 segundos com fade-out
    setTimeout(() => {
        notificationBanner.classList.remove("show", "success");
        notificationBanner.classList.add("hide");
        setTimeout(() => {
            notificationBanner.classList.add("hidden");
            notificationBanner.classList.remove("hide");
        }, 500); // Tempo para o fade-out
    }, 3000);
}

// Função para inicializar o input de telefone com intl-tel-input (se necessário)
function initializeTelephoneInput() {
    const telefone = sessionStorage.getItem("telefone");
    const phoneInfo = document.getElementById("phoneInfo");
    const backButton = document.getElementById("backButton");

    if (telefone) {
        // Exibe o telefone armazenado
        phoneInfo.textContent = `Telefone: ${telefone}`;

        // Exibe o botão de alterar telefone
        phoneInfo.classList.remove("hidden");
        backButton.classList.remove("hidden");
    } else {
        phoneInfo.textContent = "Telefone não encontrado.";
        phoneInfo.classList.remove("hidden");
    }
}

// Função para inicializar o formulário
function initializeForm() {
    initializeTelephoneInput();
    startTimer(); // Inicia o temporizador
}

// Função para iniciar o temporizador de 3 minutos
function startTimer() {
    let timerDisplay = document.getElementById("timer");
    let time = 180; // 3 minutos em segundos

    const countdown = setInterval(() => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        timerDisplay.textContent = `Tempo restante: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (time <= 0) {
            clearInterval(countdown);
            disableInputs(); // Desativa os inputs quando o tempo acabar
        }
        time--;
    }, 1000);
}

// Função para desativar os inputs quando o tempo acabar
function disableInputs() {
    const inputs = document.querySelectorAll(".code-input");
    inputs.forEach(input => {
        input.disabled = true;
    });
    showNotification("Tempo esgotado! Por favor, tente novamente.");
}

// Evento que executa a inicialização quando a página é carregada
window.addEventListener("DOMContentLoaded", (event) => {
    initializeForm();
});

// Função para processar o envio do formulário de verificação de código
document.getElementById("codeForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    // Coleta os códigos inseridos
    const code1 = document.getElementById("code1").value.trim();
    const code2 = document.getElementById("code2").value.trim();
    const code3 = document.getElementById("code3").value.trim();
    const code4 = document.getElementById("code4").value.trim();
    const code5 = document.getElementById("code5").value.trim();
    const code6 = document.getElementById("code6").value.trim();

    const fullCode = `${code1}${code2}${code3}${code4}${code5}${code6}`;

    // Validações básicas
    if (fullCode.length < 6) {
        showNotification("Por favor, insira todos os dígitos do código.");
        return;
    }

    const telefone = sessionStorage.getItem("telefone");

    if (!telefone) {
        showNotification("Número de telefone não encontrado. Por favor, inicie o processo novamente.");
        return;
    }

    // Exibir animação de carregamento no botão
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");
    const submitButton = document.getElementById("submitButton");

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");

    // Enviar a verificação para o backend
    fetch('https://django-server-production-f3c5.up.railway.app/api/verify_code/', { // URL completa do backend
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: telefone, code: fullCode }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200) {
            // Sucesso: mostrar o checkmark e redirecionar
            spinner.classList.add("hidden");
            checkmark.classList.remove("hidden");
            checkmark.classList.add("show");

            showSuccess("Código verificado com sucesso!");

            // Redireciona para a próxima página após um breve intervalo
            setTimeout(() => {
                window.location.href = "index_candidates.html"; // Substitua pelo caminho correto da próxima página
            }, 1000); // Aguarda 1 segundo para mostrar o checkmark
        } else {
            // Erro: mostrar a mensagem de erro
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
            showNotification(body.detail || "Erro ao verificar o código de verificação.");
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        spinner.classList.add("hidden");
        btnText.classList.remove("hidden");
        showNotification("Erro ao verificar o código de verificação.");
    });
});

// Função para permitir que o usuário altere o telefone
document.getElementById("backButton").addEventListener("click", function () {
    // Limpa o telefone armazenado e redireciona para a página anterior
    sessionStorage.removeItem("telefone");
    window.location.href = "index_form.html"; // Alterar para a página de formulário real
});

// Evento para avançar automaticamente para o próximo input
document.querySelectorAll('.code-input').forEach((input, index, inputs) => {
    input.addEventListener('input', () => {
        if (input.value.length >= 1) {
            const nextInput = inputs[index + 1];
            if (nextInput) {
                nextInput.focus();
            }
        }
    });
});
