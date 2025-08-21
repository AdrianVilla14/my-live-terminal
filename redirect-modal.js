// redirect-modal.js
// This modal will NOT show on page load; it only appears when showRedirectModal() is called!

// Ensure your CSS for .redirect-modal includes: display: none; (hidden by default).

function showRedirectModal() {
    const modal = document.getElementById("redirect-modal");
    const btnYes = document.getElementById("redirect-yes");
    const btnNo = document.getElementById("redirect-no");
    const loader = document.getElementById("redirect-loader");
    const actions = btnYes.parentElement;

    // Reset modal state
    actions.style.display = "flex";
    loader.style.display = "none";
    modal.style.display = "flex";

    // Remove previous handlers to avoid stacking
    btnNo.onclick = null;
    btnYes.onclick = null;

    btnNo.onclick = () => {
        modal.style.display = "none";
    };

    btnYes.onclick = () => {
        actions.style.display = "none";
        loader.style.display = "flex";
        setTimeout(() => {
            window.location.href = "https://georgiacyber.instructure.com/";
        }, 1500);
    };
}

// Expose globally for use in other scripts (e.g. after timer cancellation)
window.showRedirectModal = showRedirectModal;