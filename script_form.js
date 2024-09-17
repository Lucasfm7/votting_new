// Function to show notifications with fade-in and fade-out
function showNotification(message) {
    const notificationBanner = document.getElementById("notificationBanner");
    notificationBanner.textContent = message;
    notificationBanner.classList.remove("hidden");
    notificationBanner.classList.add("show");

    // Hide the banner after 3 seconds with fade-out
    setTimeout(() => {
        notificationBanner.classList.remove("show");
        notificationBanner.classList.add("hide");
        setTimeout(() => {
            notificationBanner.classList.add("hidden");
            notificationBanner.classList.remove("hide");
        }, 500); // Time for fade-out
    }, 3000);
}

// Initialize the phone input field with intl-tel-input
var input = document.querySelector("#telefone");
var iti = window.intlTelInput(input, {
    initialCountry: "br",        // Set initial country to Brazil
    separateDialCode: false,     // Do not display separate dial code
    autoPlaceholder: "aggressive", // Show suggested placeholder as typing
    formatOnDisplay: true,       // Automatically format as typing
    nationalMode: true,          // Show numbers in national format
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js"
});

// Function to format the phone number as the user types
function formatPhoneNumber(value) {
    value = value.replace(/\D/g, '');

    if (value.length > 11) {
        value = value.slice(0, 11);
    }

    var formattedNumber;

    if (value.length <= 10) {
        // Format as (XX) XXXX-XXXX
        formattedNumber = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else {
        // Format as (XX) XXXXX-XXXX
        formattedNumber = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }

    return formattedNumber;
}

// Apply formatting as the user types
input.addEventListener('input', function (e) {
    // Store the cursor position and input value before formatting
    var cursorPosition = input.selectionStart;
    var unformattedValue = input.value;

    // Get only the digits from the input value
    var numbers = unformattedValue.replace(/\D/g, '');

    // Format the number
    var formattedNumber = formatPhoneNumber(numbers);

    // Set the new value
    input.value = formattedNumber;

    // Calculate the new cursor position
    var newCursorPosition = getNewCursorPosition(cursorPosition, unformattedValue, formattedNumber);

    // Set the cursor position
    input.setSelectionRange(newCursorPosition, newCursorPosition);
});

// Function to calculate the new cursor position after formatting
function getNewCursorPosition(oldPosition, oldValue, newValue) {
    // Count the number of digits before the old cursor position
    var digitsBeforeCursor = oldValue.slice(0, oldPosition).replace(/\D/g, '').length;

    // Find the position in the new value that corresponds to the same number of digits
    var newCursorPosition = 0;
    var digitsCount = 0;

    for (var i = 0; i < newValue.length; i++) {
        if (/\d/.test(newValue.charAt(i))) {
            digitsCount++;
        }
        if (digitsCount === digitsBeforeCursor) {
            newCursorPosition = i + 1; // +1 because positions are 0-based
            break;
        }
    }

    // If we didn't reach the desired number of digits, set cursor at the end
    if (digitsCount < digitsBeforeCursor) {
        newCursorPosition = newValue.length;
    }

    return newCursorPosition;
}

// Display valid phone message when the user starts typing
input.addEventListener("input", function () {
    const telefoneInfo = document.getElementById("telefoneInfo");
    if (!telefoneInfo.innerHTML) {
        // Display the message only once
        telefoneInfo.innerHTML = "Por favor, insira um telefone que possa receber SMS.";
    }
});

// Form processing logic
document.getElementById("nameForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent default form submission

    const nome = document.getElementById("nome").value.trim();
    const sobrenome = document.getElementById("sobrenome").value.trim();
    const telefone = iti.getNumber(intlTelInputUtils.numberFormat.E164); // Get the number in E.164 format

    // Basic validations
    if (nome === "" || sobrenome === "") {
        showNotification("Por favor, preencha todos os campos.");
        return;
    }

    if (!iti.isValidNumber()) {
        showNotification("Por favor, insira um número de telefone válido.");
        return;
    }

    // Show loading animation on the button
    const spinner = document.getElementById("spinner");
    const btnText = document.getElementById("btnText");
    const checkmark = document.getElementById("checkmark");

    spinner.classList.remove("hidden");
    spinner.classList.add("show");
    btnText.classList.add("hidden");

    // Simulate data submission and redirect to code page
    setTimeout(() => {
        // Simulate data submission and display checkmark
        spinner.classList.add("hidden");
        checkmark.classList.remove("hidden");
        checkmark.classList.add("show");

        // Store the phone number in sessionStorage
        sessionStorage.setItem("telefone", telefone);

        // Hide the loading animation and redirect
        setTimeout(() => {
            // Redirect to the code verification page
            window.location.href = "index_code.html";
        }, 1000); // Wait 1 second to show the checkmark

    }, 2000);
});
