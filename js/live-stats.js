const VERCEL_API_URL = 'https://vexa-vercel-api.vercel.app';

async function fetchLiveUsers() {
    try {
        const response = await fetch(`${VERCEL_API_URL}/api/stats`);
        const data = await response.json();
        
        if (data.success) {
            const badge = document.getElementById('liveUsersBadge');
            const countSpan = document.getElementById('liveUsersCount');
            
            // Animasyonlu sayac guncelleme
            const currentCount = parseInt(countSpan.innerText) || 0;
            const targetCount = data.activeUsers || 0;
            
            if (targetCount > 0) {
                badge.style.display = 'flex';
                // Eger sayi degistiyse minik bir pop animasyonu verelim
                if (currentCount !== targetCount) {
                    countSpan.innerText = targetCount;
                    countSpan.style.transition = 'transform 0.2s ease';
                    countSpan.style.transform = 'scale(1.5)';
                    setTimeout(() => {
                        countSpan.style.transform = 'scale(1)';
                    }, 200);
                }
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (err) {
        console.error('Failed to fetch live stats:', err);
    }
}

// Fetch stats initially and then every 15 seconds
document.addEventListener("DOMContentLoaded", () => {
    fetchLiveUsers();
    setInterval(fetchLiveUsers, 15000);
});
