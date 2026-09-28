async function setupSignin() {
    const response = await fetch("/public/html/templates/signin.html");

    if (!response.ok) {
        throw new Error(`Unable to load signin form: ${response.status}`);
    }

    const html = await response.text();
    document.body.insertAdjacentHTML("beforeend", html);

    const signinModal = document.getElementById("signin-modal");
    const signinForm = document.getElementById("signin");
    const signinMessage = document.getElementById("signin-message");
    const signinButton = document.getElementById("sign-in");

    if (!signinModal || !signinForm || !signinMessage || !signinButton) {
        throw new Error("Missing required signin elements. Check their IDs.");
    }

    signinModal.querySelector(".dialog-close").addEventListener("click", () => {
        signinModal.close();
    });

    signinButton.addEventListener("click", () => {
        signinMessage.textContent = "";
        signinModal.showModal();
    });

    const forgotPasswordButton = document.getElementById("forgot-password");

    forgotPasswordButton.addEventListener("click", async () => {
        const emailInput = signinForm.elements.namedItem("email");

        // Validate only email; a password isn't needed here.
        if (!emailInput.reportValidity()) return;

        forgotPasswordButton.disabled = true;
        signinMessage.textContent = "Sending reset email...";

        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(emailInput.value.trim(), {
                redirectTo: `${window.location.origin}/public/html/templates/reset-password.html`,
            });

            if (error) {
                signinMessage.textContent = error.message;
                return;
            }

            signinMessage.textContent = "If an account exists for that email, you’ll receive a reset link.";
        } catch (error) {
            signinMessage.textContent = "Unable to connect. Please try again.";
        } finally {
            forgotPasswordButton.disabled = false;
        }
    });

    signinForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const button = signinForm.querySelector('button[type="submit"]');

        if (button.disabled) return;

        const fields = new FormData(signinForm);
        const email = fields.get("email").trim();
        const password = fields.get("password");

        button.disabled = true;
        signinMessage.textContent = "Signing in...";

        try {
            const { error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                signinMessage.textContent = error.message;
                return;
            }

            const {
                data: { session },
                error: sessionError,
            } = await supabaseClient.auth.getSession();

            if (sessionError || !session) {
                signinMessage.textContent = "Please sign in again.";

                return;
            }

            const response = await fetch("/api/account", {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });
            const account = await response.json();

            if (!response.ok) {
                signinMessage.textContent = account.error || "Unable to load account.";
                return;
            }

            signinMessage.textContent = `Signed in as ${account.email}`;
            signinForm.reset();
        } catch (error) {
            console.error("Signin failed:", error);
            signinMessage.textContent = error.message;
        } finally {
            button.disabled = false;
        }
    });
}

function initializeSignin() {
    setupSignin().catch((error) => {
        console.error("Signin setup failed:", error);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSignin, {
        once: true,
    });
} else {
    initializeSignin();
}
