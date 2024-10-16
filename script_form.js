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

// Função para inicializar o input de telefone com intl-tel-input
function initializeTelephoneInput() {
    const input = document.querySelector("#telefone");
    window.intlTelInput(input, {
        initialCountry: "br",          // Define o país inicial para Brasil
        separateDialCode: false,       // Não exibe o código do país separadamente
        autoPlaceholder: false,        // Desabilita o placeholder automático
        formatOnDisplay: false,        // Desabilita formatação automática no display
        nationalMode: true,            // Mantém o número no formato nacional
        allowDropdown: false,          // Desabilita a mudança de país pelo usuário (opcional)
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js" // Script de utilidades
    });
}

// Função para formatar o número de telefone conforme o usuário digita
function formatPhoneNumber(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    let formattedNumber;

    // Formata como (XX) 9 8765-4321
    formattedNumber = value.replace(/(\d{2})(\d)(\d{4})(\d{0,4})/, '($1) $2 $3-$4');

    return formattedNumber;
}

// Função para calcular a nova posição do cursor após a formatação
function getNewCursorPosition(oldPosition, oldValue, newValue) {
    // Conta o número de dígitos antes da posição antiga
    const digitsBeforeCursor = oldValue.slice(0, oldPosition).replace(/\D/g, '').length;

    // Encontra a posição na nova string que corresponde ao mesmo número de dígitos
    let newCursorPosition = 0;
    let digitsCount = 0;

    for (let i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue.charAt(i))) {
            digitsCount++;
        }
        if (digitsCount === digitsBeforeCursor) {
            newCursorPosition = i + 1; // +1 porque as posições são baseadas em 0
            break;
        }
    }

    // Se não alcançou o número desejado de dígitos, define o cursor no final
    if (digitsCount < digitsBeforeCursor) {
        newCursorPosition = newValue.length;
    }

    return newCursorPosition;
}

// Evento para aplicar a formatação conforme o usuário digita
document.getElementById("telefone").addEventListener('input', function (e) {
    const input = e.target;
    const cursorPosition = input.selectionStart;
    const unformattedValue = input.value;

    // Obtém apenas os dígitos do valor do input
    const numbers = unformattedValue.replace(/\D/g, '');

    // Formata o número
    const formattedNumber = formatPhoneNumber(numbers);

    // Define o novo valor
    input.value = formattedNumber;

    // Calcula a nova posição do cursor
    const newCursorPosition = getNewCursorPosition(cursorPosition, unformattedValue, formattedNumber);

    // Define a posição do cursor
    input.setSelectionRange(newCursorPosition, newCursorPosition);
});

// Exibir a mensagem de telefone válido quando o usuário começa a digitar
document.getElementById("telefone").addEventListener("input", function () {
    const telefoneInfo = document.getElementById("telefoneInfo");
    if (!telefoneInfo.innerHTML) {
        // Exibe a mensagem apenas uma vez
        telefoneInfo.innerHTML = "Por favor, insira um telefone que possa receber SMS.";
    }
});

// Função para exibir a saudação personalizada
function displayGreeting() {
    const saudacao = sessionStorage.getItem("saudacao") || "";
    const nomePessoa = sessionStorage.getItem("nomePessoa") || "";
    const empresaPessoa = sessionStorage.getItem("empresaPessoa") || "";

    let mensagem = "Olá";

    if (empresaPessoa) {
        mensagem += `, ${empresaPessoa}`;
    } else if (nomePessoa) {
        mensagem += `, ${nomePessoa}`;
    }

    const nomeDiv = document.getElementById("nomePessoa");
    if (nomeDiv) {
        nomeDiv.textContent = mensagem;
    }
}

// Função para inicializar o formulário
function initializeForm() {
    // Verifica se o CPF/CNPJ está disponível no sessionStorage
    const cpfCnpj = sessionStorage.getItem("cpfCnpj");

    if (!cpfCnpj) {
        // Se não estiver disponível, redireciona para a página inicial
        window.location.href = 'index.html';
        return;
    }

    displayGreeting();
    initializeTelephoneInput();
}

// Evento que executa a inicialização quando a página é carregada
window.addEventListener("DOMContentLoaded", (event) => {
    initializeForm();
});

// Função para processar o envio do formulário
document.getElementById("nameForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Previne o comportamento padrão de envio do formulário

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const telefoneInput = document.querySelector("#telefone");
    const iti = window.intlTelInputGlobals.getInstance(telefoneInput);
    const telefone = iti.getNumber(intlTelInputUtils.numberFormat.E164); // Obtém o número no formato E.164

    // Validações básicas
    if (nome === "" || sobrenome === "") {
        showNotification("Por favor, preencha todos os campos.");
        return;
    }

    if (!iti.isValidNumber()) {
        showNotification("Por favor, insira um número de telefone válido.");
        return;
    }

    // Armazena o nome e sobrenome no sessionStorage
    sessionStorage.setItem("nome", nome);
    sessionStorage.setItem("sobrenome", sobrenome);

    // Recupera o CPF/CNPJ do sessionStorage
    const cpfCnpj = sessionStorage.getItem("cpfCnpj");

    if (!cpfCnpj) {
        showNotification("CPF/CNPJ não encontrado. Por favor, reinicie o processo.");
        return;
    }

    // Exibir animação de carregamento no botão
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");

    // Enviar os dados para o backend, incluindo o CPF/CNPJ
    fetch('https://django-server-production-f3c5.up.railway.app/api/send_verification_code/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            phone_number: telefone,
            cpf_cnpj: cpfCnpj,
            nome: nome,
            sobrenome: sobrenome
        }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200) {
            // Sucesso: mostrar o checkmark e redirecionar
            spinner.classList.add("hidden");
            checkmark.classList.remove("hidden");
            checkmark.classList.add("show");

            // Armazena o número de telefone no sessionStorage para uso na verificação
            sessionStorage.setItem("telefone", telefone);

            // Redireciona para a página de verificação de código após um breve intervalo
            setTimeout(() => {
                window.location.href = "index_code.html";
            }, 1000); // Aguarda 1 segundo para mostrar o checkmark
        } else {
            // Erro: mostrar a mensagem de erro
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
            showNotification(body.detail || "Erro ao enviar o código de verificação.");
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        spinner.classList.add("hidden");
        btnText.classList.remove("hidden");
        showNotification("Erro ao enviar o código de verificação.");
    });
});
