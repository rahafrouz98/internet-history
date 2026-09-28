const guestControls = document.getElementById("guests-links");
const userControls = document.getElementById("user-controls");
const userName = document.getElementById("user-name");
const signOutButton = document.getElementById("sign-out");

function updateAuthUI(session) {
    const user = session?.user;

    guestControls.hidden = Boolean(user);
    userControls.hidden = !user;

    userName.textContent = user ? `Hi ${user.user_metadata?.name}` || user.email : "";

    if (user) {
        const signinModal = document.getElementById("signin-modal");

        if (signinModal?.open) {
            signinModal.close();
        }
    }
}

// Update the buttons when the page loads, or login state changes.
supabaseClient.auth.onAuthStateChange((event, session) => {
    updateAuthUI(session);
});

signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;

    try {
        const { error } = await supabaseClient.auth.signOut();



    } catch (error) {
        authMessage.textContent = "Unable to sign out. Please try again.";
    } finally {
        signOutButton.disabled = false;
    }
});
