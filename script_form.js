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

// Função para exibir a saudação personalizada
function displayGreeting() {
    const saudacao = sessionStorage.getItem("saudacao") || "";
    const nomePessoa = sessionStorage.getItem("nomePessoa") || "";
    const empresaPessoa = sessionStorage.getItem("empresaPessoa") || "";

    let mensagem = saudacao;

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

// Função para inicializar o input de telefone com intl-tel-input
function initializeTelephoneInput() {
    const input = document.querySelector("#telefone");
    window.intlTelInput(input, {
        initialCountry: "br",
        separateDialCode: false,
        autoPlaceholder: false,
        formatOnDisplay: false,
        nationalMode: true,
        allowDropdown: false,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
    });
}

// Função para formatar o número de telefone conforme o usuário digita
function formatPhoneNumber(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    let formattedNumber;

    formattedNumber = value.replace(/(\d{2})(\d)(\d{4})(\d{0,4})/, '($1) $2 $3-$4');

    return formattedNumber;
}

// Função para calcular a nova posição do cursor após a formatação
function getNewCursorPosition(oldPosition, oldValue, newValue) {
    const digitsBeforeCursor = oldValue.slice(0, oldPosition).replace(/\D/g, '').length;

    let newCursorPosition = 0;
    let digitsCount = 0;

    for (let i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue.charAt(i))) {
            digitsCount++;
        }
        if (digitsCount === digitsBeforeCursor) {
            newCursorPosition = i + 1;
            break;
        }
    }

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

    const numbers = unformattedValue.replace(/\D/g, '');

    const formattedNumber = formatPhoneNumber(numbers);

    input.value = formattedNumber;

    const newCursorPosition = getNewCursorPosition(cursorPosition, unformattedValue, formattedNumber);

    input.setSelectionRange(newCursorPosition, newCursorPosition);
});

// Exibir a mensagem de telefone válido quando o usuário começa a digitar
document.getElementById("telefone").addEventListener("input", function () {
    const telefoneInfo = document.getElementById("telefoneInfo");
    if (!telefoneInfo.innerHTML) {
        telefoneInfo.innerHTML = "Por favor, insira um telefone que possa receber SMS.";
    }
});

// Função para processar o envio do formulário
document.getElementById("nameForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const telefoneInput = document.querySelector("#telefone");
    const iti = window.intlTelInputGlobals.getInstance(telefoneInput);
    const telefone = iti.getNumber(intlTelInputUtils.numberFormat.E164);

    if (nome === "" || sobrenome === "") {
        showNotification("Por favor, preencha todos os campos.", true);
        return;
    }

    if (!iti.isValidNumber()) {
        showNotification("Por favor, insira um número de telefone válido.", true);
        return;
    }

    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");
    checkmark.classList.add("hidden");

    fetch('https://django-server-production-f3c5.up.railway.app/api/send_verification_code/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number: telefone }),
    })
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status === 200) {
            spinner.classList.add("hidden");
            checkmark.classList.remove("hidden");
            checkmark.classList.add("show");

            sessionStorage.setItem("telefone", telefone);

            setTimeout(() => {
                window.location.href = "index_code.html"; // Certifique-se de que a página de verificação existe
            }, 1000);
        } else {
            spinner.classList.add("hidden");
            btnText.classList.remove("hidden");
            showNotification(body.detail || "Erro ao enviar o código de verificação.", true);
        }
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        spinner.classList.add("hidden");
        btnText.classList.remove("hidden");
        showNotification("Erro ao enviar o código de verificação.", true);
    });
});
