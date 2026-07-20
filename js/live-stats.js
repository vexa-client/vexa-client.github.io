const VERCEL_API_URL = "https://vexa-vercel-api.vercel.app";

async function fetchLiveUsers() {
    const badge = document.getElementById("liveUsersBadge");
    const countSpan = document.getElementById("liveUsersCount");
    if (!badge || !countSpan) return;

    try {
        const response = await fetch(`${VERCEL_API_URL}/api/stats`, { cache: "no-store" });
        const data = await response.json();

        if (!data.success) return;

        const currentCount = parseInt(countSpan.textContent, 10) || 0;
        const targetCount = data.activeUsers || 0;

        badge.hidden = false;

        if (currentCount !== targetCount) {
            countSpan.textContent = targetCount;
            countSpan.animate([
                { transform: "scale(1)" },
                { transform: "scale(1.28)" },
                { transform: "scale(1)" }
            ], {
                duration: 260,
                easing: "ease-out"
            });
        }
    } catch (err) {
        console.warn("Live stats alınamadı:", err);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchLiveUsers();
    setInterval(fetchLiveUsers, 15000);
});
