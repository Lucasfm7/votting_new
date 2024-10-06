// script.js (First Page)
function showNotification(message, isError = true) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden", "success", "error");
    notificationBanner.classList.add("show", isError ? "error" : "success");

    setTimeout(() => {
        notificationBanner.classList.remove("show");
        notificationBanner.classList.add("hide");
        setTimeout(() => {
            notificationBanner.classList.add("hidden");
            notificationBanner.classList.remove("hide");
        }, 500);
    }, 3000);
}

function showElement(element) {
    element.classList.remove("hidden");
    element.classList.add("show");
}

function hideElement(element) {
    element.classList.remove("show");
    element.classList.add("hidden");
}

async function fetchPersonByCpf(cpf) {
    const baseUrl = "https://django-server-production-f3c5.up.railway.app/api/pessoas/pesquisar_cpf/";
    const cpfNumeros = cpf.replace(/\D/g, '');

    try {
        const response = await fetch(`${baseUrl}?cpf=${cpfNumeros}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            if (response.status === 403) {
                return { status: 'error', message: "Acesso negado. Verifique suas permissões ou se o CSRF está correto." };
            } else if (response.status === 404) {
                return { status: 'error', message: "CPF não encontrado." };
            } else {
                return { status: 'error', message: `Erro HTTP! Status: ${response.status}` };
            }
        }

        const data = await response.json();
        console.log("Dados recebidos da API:", data);

        const jaVotou = data.ja_votou;
        const jaVotouInterpretado = jaVotou === true || jaVotou === 1 || jaVotou === '1';

        if (jaVotouInterpretado) {
            showNotification("Você já votou e não pode votar novamente.", true);
            return { status: 'ja_votou' };
        }

        return { status: 'success', data };

    } catch (error) {
        console.error("Erro ao realizar a requisição:", error);
        return { status: 'error', message: `Erro ao buscar CPF. ${error.message}` };
    }
}

function resetButtonState() {
    spinner.classList.add("hidden");
    btnText.classList.remove("hidden");
    btnAvancar.disabled = false;
}

const cpfForm = document.getElementById("cpfForm");
const spinner = document.getElementById("spinner");
const btnText = document.getElementById("btnText");
const checkmark = document.getElementById("checkmark");
const btnAvancar = document.getElementById("btnAvancar");

cpfForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const cpfCnpj = document.getElementById("cpfCnpj").value.trim();
    if (cpfCnpj === "") {
        showNotification("Por favor, insira um CPF ou CNPJ.");
        return;
    }

    showElement(spinner);
    btnText.classList.add("hidden");
    checkmark.classList.add("hidden");
    btnAvancar.disabled = true;

    try {
        const response = await fetchPersonByCpf(cpfCnpj);

        if (response.status === 'success') {
            const pessoa = response.data;

            hideElement(spinner);
            showElement(checkmark);

            // Store cpfCnpj in sessionStorage
            sessionStorage.setItem("cpfCnpj", cpfCnpj);

            sessionStorage.setItem("cpfValidado", true);
            sessionStorage.setItem("validacaoTime", new Date().getTime());
            sessionStorage.setItem("nomePessoa", pessoa.nome || '');
            sessionStorage.setItem("empresaPessoa", pessoa.empresa || '');

            setTimeout(() => {
                window.location.href = 'index_form.html'; // Redirect to the next page
            }, 1000);

        } else if (response.status === 'ja_votou') {
            resetButtonState();

        } else if (response.status === 'error') {
            resetButtonState();
            showNotification(response.message);
        }

    } catch (error) {
        resetButtonState();
    }
});
