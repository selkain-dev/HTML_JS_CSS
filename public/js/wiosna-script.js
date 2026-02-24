document.addEventListener("DOMContentLoaded", () => {
    const countdownElement = document.getElementById("countdown");

    function pad(num) {
        return num.toString().padStart(2, "0");
    }

    function pluralPL(number, one, few, many) {
        if (number === 1) return one;

        const lastDigit = number % 10;
        const lastTwo = number % 100;

        if (
            lastDigit >= 2 &&
            lastDigit <= 4 &&
            !(lastTwo >= 12 && lastTwo <= 14)
        ) {
            return few;
        }

        return many;
    }

    function getSpringDate() {
        const now = new Date();
        let year = now.getFullYear();

        let springDate = new Date(year, 2, 20, 0, 0, 0);

        if (now > springDate) {
            springDate = new Date(year + 1, 2, 20, 0, 0, 0);
        }

        return springDate;
    }

    function updateCountdown() {
        const now = new Date();
        const springDate = getSpringDate();

        const totalSeconds = Math.floor((springDate - now) / 1000);

        if (totalSeconds <= 0) {
            countdownElement.innerHTML = "🌸 WIOSNA JUŻ TU JEST! 🌸";
            return;
        }

        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        countdownElement.innerHTML = `
            <div><span class="days">${days}</span> ${pluralPL(days, "dzień", "dni", "dni")}</div>
            <div><span class="hours">${pad(hours)}</span> ${pluralPL(hours, "godzina", "godziny", "godzin")}</div>
            <div><span class="minutes">${pad(minutes)}</span> ${pluralPL(minutes, "minuta", "minuty", "minut")}</div>
            <div><span class="seconds">${pad(seconds)}</span> ${pluralPL(seconds, "sekunda", "sekundy", "sekund")}</div>
        `;
    }

    setInterval(() => {
        requestAnimationFrame(updateCountdown);
    }, 1000);

    updateCountdown();
});