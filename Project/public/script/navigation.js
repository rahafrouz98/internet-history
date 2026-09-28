const menuToggle = document.getElementById("menu-toggle");
const toolbar = document.getElementById("toolbar");

if (menuToggle && toolbar) {
    const header = menuToggle.closest("header");
    const mobile = window.matchMedia("(width < 700px)");
    const setOpen = (open) => menuToggle.setAttribute("aria-expanded", String(open));
    header.classList.add("menu-ready");
    setOpen(false);

    menuToggle.addEventListener("click", () => {
        setOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });
    toolbar.addEventListener("click", (event) => {
        if (mobile.matches && event.target.closest("button")) {
            setOpen(false);
            // Preserve focus if the page action has already moved it elsewhere.
            if (toolbar.contains(document.activeElement)) menuToggle.focus();
        }
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mobile.matches && menuToggle.getAttribute("aria-expanded") === "true") {
            setOpen(false);
            menuToggle.focus();
        }
    });
    document.addEventListener("click", (event) => {
        if (mobile.matches && !toolbar.contains(event.target) && !menuToggle.contains(event.target)) setOpen(false);
    });
    header.addEventListener("focusout", (event) => {
        if (mobile.matches && !header.contains(event.relatedTarget)) setOpen(false);
    });
    mobile.addEventListener("change", () => {
        const focused = document.activeElement;
        setOpen(false);
        if (mobile.matches && toolbar.contains(focused)) menuToggle.focus();
        if (!mobile.matches && focused === menuToggle) toolbar.querySelector("button")?.focus();
    });
}
