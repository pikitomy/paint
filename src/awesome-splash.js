// Keep the startup overlay visible briefly, then release the editor.
(() => {
    const splash = document.getElementById('awesome-splash');
    if (!splash) return;
    const start = performance.now();
    let closing = false;
    function dismiss() {
        if (closing) return;
        closing = true;
        splash.classList.add('awesome-splash-hidden');
        setTimeout(() => splash.remove(), 350);
    }
    function ready() {
        setTimeout(dismiss, Math.max(0, 1200 - (performance.now() - start)));
    }
    if (document.readyState === 'complete') ready();
    else window.addEventListener('load', ready, { once: true });
    // Fail open if a resource stalls; never permanently block the editor.
    setTimeout(dismiss, 10000);
})();
