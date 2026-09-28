const resetForm = document.getElementById("reset-password");
const resetMessage = document.getElementById("reset-message");
const resetButton = resetForm.querySelector('button[type="submit"]');

let recoveryReady = false;

supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
        recoveryReady = true;
        resetButton.disabled = false;
        resetMessage.textContent = "Enter your new password.";
    }

    if (event === "INITIAL_SESSION" && !recoveryReady) {
        resetMessage.textContent = "Please open a fresh password reset link from your email.";
    }
});

resetForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!recoveryReady || resetButton.disabled) return;

    const fields = new FormData(resetForm);
    const password = fields.get("password");
    const confirmation = fields.get("confirmation");

    if (password !== confirmation) {
        resetMessage.textContent = "Passwords do not match.";
        return;
    }

    resetButton.disabled = true;
    resetMessage.textContent = "Updating password...";

    try {
        const { error } = await supabaseClient.auth.updateUser({
            password,
        });

        if (error) {
            resetMessage.textContent = error.message;
            return;
        }

        recoveryReady = false;
        resetForm.reset();
        resetForm.hidden = true;
        resetMessage.textContent = "Your password has been updated. You can return to the home page.";
    } catch (error) {
        resetMessage.textContent = "Unable to connect. Please try again.";
    } finally {
        resetButton.disabled = !recoveryReady;
    }
});
