async function setupSignup() {
    const response = await fetch("/public/html/templates/signup.html");

    if (!response.ok) {
        throw new Error(`Unable to load signup form: ${response.status}`);
    }

    const html = await response.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const signupModal = document.getElementById("signup-modal");
    const signupForm = document.getElementById("signup-form");
    const signupMessage = document.getElementById("signup-message");
    const signupButton = document.getElementById("sign-up");

    if (!signupModal || !signupForm || !signupMessage || !signupButton) {
        throw new Error("Missing required signup elements. Check their IDs.");
    }

    signupButton.addEventListener("click", () => {
        signupModal.showModal();
    });

    signupModal.querySelector(".dialog-close").addEventListener("click", () => {
        signupModal.close();
    });

    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const fields = new FormData(signupForm);
        const name = fields.get("name").trim();
        const email = fields.get("email").trim();
        const password = fields.get("password");
        const confirmedPassword = fields.get("confirmed-password");

        if (password !== confirmedPassword) {
            signupMessage.textContent = "Passwords do not match.";
            return;
        }

        const button = signupForm.querySelector('button[type="submit"]');
        button.disabled = true;
        signupMessage.textContent = "Creating your account...";

        try {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: {
                    data: { name },
                },
            });

            if (error) {
                signupMessage.textContent = error.message;
                return;
            }

            signupMessage.textContent = data.session
                ? "Account created. You are signed in."
                : "Check your email for a confirmation link.";

            signupForm.reset();
        } catch (error) {
            signupMessage.textContent = "Unable to connect. Please try again.";
        } finally {
            button.disabled = false;
        }
    });
}

setupSignup().catch((error) => {
    console.error("Signup setup failed:", error);
});
