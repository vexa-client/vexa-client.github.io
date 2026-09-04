const REPO_RELEASE_API = "https://api.github.com/repos/vexa-client/vexa/releases/latest";
const DIRECT_DOWNLOAD_URL = "https://vexaclient.com/#download";
const DIRECT_EXE_URL = "https://github.com/vexa-client/vexa/releases/latest/download/vexa-setup-x64.exe";

function formatDate(value) {
    if (!value) return "Yayın tarihi bekleniyor.";

    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(new Date(value));
}

async function hydrateLatestRelease() {
    const version = document.getElementById("releaseVersion");
    const releaseDate = document.getElementById("releaseDate");
    const downloadButton = document.getElementById("downloadButton");
    const launcherReleaseStatus = document.getElementById("launcherReleaseStatus");

    if (!version || !releaseDate || !downloadButton) return;

    // 1. Butonları resmi indirme alanına ayarla
    downloadButton.href = DIRECT_DOWNLOAD_URL;
    downloadButton.textContent = "HaxBall Client İndir ↓";
    downloadButton.classList.remove("is-loading");

    // Sitedeki diğer indirme butonlarını da ayarla
    document.querySelectorAll('.download a.button, .header-links .nav-download').forEach(link => {
        link.href = DIRECT_DOWNLOAD_URL;
    });

    try {
        // 2. Sadece ekrandaki metinleri (V1.4.4 gibi) güncellemek için API'ye istek at
        const response = await fetch(REPO_RELEASE_API, {
            headers: { Accept: "application/vnd.github+json" },
            cache: "no-store"
        });

        if (!response.ok) throw new Error(`GitHub ${response.status}`);

        const release = await response.json();

        version.textContent = release.tag_name || "Son sürüm";
        if (launcherReleaseStatus) launcherReleaseStatus.textContent = `${release.tag_name || "Son sürüm"} hazır`;
        releaseDate.textContent = `${formatDate(release.published_at)} tarihinde yayınlandı.`;

    } catch (error) {
        // API limiti dolsa bile butonlar zaten EXE indirmeye ayarlandı, sadece metinleri yedekle
        version.textContent = "Son sürüm";
        if (launcherReleaseStatus) launcherReleaseStatus.textContent = "Son sürüm hazır";
        releaseDate.textContent = "Hemen indirip oynamaya başla.";
        console.warn("Sürüm bilgisi çekilemedi (API limiti dolmuş olabilir), ancak indirme linki sorunsuz çalışacak:", error);
    }
}

function setupRevealAnimations() {
    if (!("IntersectionObserver" in window)) {
        document.querySelectorAll("[data-anime]").forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.14,
        rootMargin: "0px 0px -40px 0px"
    });

    document.querySelectorAll("[data-anime]").forEach((element) => observer.observe(element));
}

function setupFaqAccordion() {
    const items = Array.from(document.querySelectorAll(".faq-list details"));
    if (!items.length) return;

    const wrapContent = (details) => {
        if (details.querySelector(":scope > .faq-panel")) return details.querySelector(":scope > .faq-panel");
        const panel = document.createElement("div");
        panel.className = "faq-panel";
        Array.from(details.children).forEach((child) => {
            if (child.tagName.toLowerCase() !== "summary") panel.appendChild(child);
        });
        details.appendChild(panel);
        return panel;
    };

    const closeItem = (details) => {
        const panel = wrapContent(details);
        panel.style.height = `${panel.scrollHeight}px`;
        details.classList.remove("is-open");
        requestAnimationFrame(() => {
            panel.style.height = "0px";
        });
        window.setTimeout(() => {
            if (!details.classList.contains("is-open")) details.open = false;
        }, 280);
    };

    const openItem = (details) => {
        const panel = wrapContent(details);
        items.forEach((item) => {
            if (item !== details && item.open) closeItem(item);
        });
        details.open = true;
        details.classList.add("is-open");
        panel.style.height = "0px";
        requestAnimationFrame(() => {
            panel.style.height = `${panel.scrollHeight}px`;
        });
        window.setTimeout(() => {
            if (details.classList.contains("is-open")) panel.style.height = "auto";
        }, 280);
    };

    items.forEach((details, index) => {
        const panel = wrapContent(details);
        const summary = details.querySelector("summary");
        const shouldOpen = details.open || index === 0;
        details.open = shouldOpen;
        details.classList.toggle("is-open", shouldOpen);
        panel.style.height = shouldOpen ? "auto" : "0px";

        summary?.addEventListener("click", (event) => {
            event.preventDefault();
            if (details.open && details.classList.contains("is-open")) closeItem(details);
            else openItem(details);
        });
    });
}

function setupScreenshotLightbox() {
    const links = Array.from(document.querySelectorAll(".shot-frame[href]"));
    if (!links.length) return;

    const modal = document.createElement("div");
    modal.className = "image-lightbox";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
        <button class="lightbox-close" type="button" aria-label="Görseli kapat">×</button>
        <figure class="lightbox-panel">
            <img class="lightbox-image" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
    `;
    document.body.appendChild(modal);

    const image = modal.querySelector(".lightbox-image");
    const caption = modal.querySelector(".lightbox-caption");
    const closeButton = modal.querySelector(".lightbox-close");

    const close = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("lightbox-open");
        window.setTimeout(() => {
            if (!modal.classList.contains("is-open")) image.removeAttribute("src");
        }, 180);
    };

    const open = (link) => {
        const source = link.getAttribute("href");
        const thumb = link.querySelector("img");
        const title = link.closest("figure")?.querySelector("figcaption strong")?.textContent || thumb?.alt || "Ekran görüntüsü";
        const description = link.closest("figure")?.querySelector("figcaption span")?.textContent || "";

        image.src = source;
        image.alt = thumb?.alt || title;
        caption.innerHTML = `<strong>${title}</strong>${description ? `<span>${description}</span>` : ""}`;
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("lightbox-open");
        closeButton.focus({ preventScroll: true });
    };

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            open(link);
        });
    });

    closeButton.addEventListener("click", close);
    modal.addEventListener("click", (event) => {
        if (event.target === modal) close();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) close();
    });
}

function setupMobileNav() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector(".nav-toggle");
    const links = document.querySelectorAll(".header-links a");

    if (!header || !toggle) return;

    toggle.addEventListener("click", () => {
        const isOpen = header.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.forEach((link) => {
        link.addEventListener("click", () => {
            header.classList.remove("is-open");
            toggle.setAttribute("aria-expanded", "false");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupRevealAnimations();
    setupMobileNav();
    setupFaqAccordion();
    setupScreenshotLightbox();
    hydrateLatestRelease();
});