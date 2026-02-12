/* ==========================================================
   KHỞI ĐỘNG HỆ THỐNG
========================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("🚀 Hệ thống đang khởi động...");

    ShowToast();
    startFPS();
    startTypeEffect();
    initIPSystem();

});


/* ==========================================================
   PHẦN 1: UI - TOAST + DARKMODE + TYPE EFFECT
========================================================== */

function ShowToast() {
    const x = document.getElementById("Toast");
    if (!x) return;

    x.className = "show";
    setTimeout(() => {
        x.className = x.className.replace("show", "");
    }, 3900);
}

function DarkMode() {
    document.body.classList.toggle("dark-mode");
}


/* ================= TYPE EFFECT ================= */

const text = "Hello everyone, I'm a Developer.\nI like website design :3";
const delay = 120;
let index = 0;
let isDeleting = false;

function startTypeEffect() {

    const contentLetter = document.querySelector(".contentLetter");
    if (!contentLetter) return;

    function typeEffect() {

        if (index < text.length && !isDeleting) {

            if (text.charAt(index) === "\n") {
                contentLetter.innerHTML += "<br>";
            } else {
                contentLetter.innerHTML += text.charAt(index);
            }

            index++;
            setTimeout(typeEffect, delay);

        } else if (isDeleting) {

            contentLetter.innerHTML = contentLetter.innerHTML.slice(0, -1);

            if (contentLetter.innerHTML === "") {
                isDeleting = false;
                index = 0;
                setTimeout(typeEffect, delay);
            } else {
                setTimeout(typeEffect, delay / 2);
            }

        } else {
            isDeleting = true;
            setTimeout(typeEffect, 1000);
        }
    }

    typeEffect();
}


/* ==========================================================
   PHẦN 2: FPS COUNTER
========================================================== */

function startFPS() {

    const fps = document.getElementById("fps");
    if (!fps) return;

    let startTime = Date.now();
    let frame = 0;

    function tick() {
        const time = Date.now();
        frame++;

        if (time - startTime > 1000) {
            fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
            startTime = time;
            frame = 0;
        }

        requestAnimationFrame(tick);
    }

    tick();
}


/* ==========================================================
   PHẦN 3: AUDIO PLAYER
========================================================== */

const songList = Array.from({ length: 20 }, (_, i) => i + 1);

function getRandomAudio() {
    const randomIndex = Math.floor(Math.random() * songList.length);
    return "music/" + songList[randomIndex] + ".mp3";
}

function playMusic() {
    const audio = document.getElementById("myAudio");
    if (!audio) return;

    audio.src = getRandomAudio();

    audio.play().catch(() => {
        console.log("⚠️ Trình duyệt chặn autoplay.");
    });

    audio.onended = playMusic;
}

function hideNotification() {
    const notif = document.getElementById("notification");
    if (notif) notif.style.display = "none";
    playMusic();
}


/* ==========================================================
   PHẦN 4: IP + ISP + LOCATION SYSTEM (ANTI CORS)
========================================================== */

let ipData = {
    ip: "Loading...",
    isp: "Loading...",
    location: "Loading...",
    lat: 21.0285,
    lon: 105.8542,
    ready: false
};

let ipViewState = 0;

function initIPSystem() {

    const ipEl = document.getElementById("checkip_address");
    if (!ipEl) return;

    ipEl.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading...`;

    fetchIP();

    setInterval(rotateIPInfo, 4000);
}


async function fetchIP() {

    const sources = [

        {
            url: "https://ipinfo.io/json",
            parse: data => ({
                ip: data.ip,
                isp: data.org,
                location: data.city + ", " + data.country,
                lat: data.loc?.split(",")[0],
                lon: data.loc?.split(",")[1]
            })
        },

        {
            url: "https://ip-api.com/json/?fields=status,country,city,lat,lon,query,org",
            parse: data => {
                if (data.status !== "success") throw Error();
                return {
                    ip: data.query,
                    isp: data.org,
                    location: data.city + ", " + data.country,
                    lat: data.lat,
                    lon: data.lon
                };
            }
        }

    ];

    for (const source of sources) {

        try {

            const res = await fetch(source.url);
            const data = await res.json();
            const parsed = source.parse(data);

            ipData = { ...parsed, ready: true };

            updateWeatherData();
            rotateIPInfo();

            console.log("✅ IP loaded");
            return;

        } catch (e) {
            console.log("❌ Source failed");
        }
    }

    // fallback local
    ipData = {
        ip: "192.168.1.1",
        isp: "Local Network",
        location: "Local",
        lat: 21.0285,
        lon: 105.8542,
        ready: true
    };

    rotateIPInfo();
    updateWeatherData();
}


function rotateIPInfo() {

    if (!ipData.ready) return;

    const el = document.getElementById("checkip_address");
    if (!el) return;

    el.style.opacity = 0;

    setTimeout(() => {

        if (ipViewState === 0) {
            el.innerHTML = `<i class="fas fa-globe"></i> ${ipData.ip}`;
            ipViewState = 1;
        }
        else if (ipViewState === 1) {
            el.innerHTML = `<i class="fas fa-network-wired"></i> ${ipData.isp}`;
            ipViewState = 2;
        }
        else {
            el.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${ipData.location}`;
            ipViewState = 0;
        }

        el.style.opacity = 1;

    }, 300);
}


/* ==========================================================
   PHẦN 5: WEATHER SYSTEM (OPEN-METEO)
========================================================== */

let wData = { temp: "--", rain: 0, aqi: "--", ready: false };
let weatherView = 0;

async function updateWeatherData() {

    if (!ipData.ready) return;

    try {

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?latitude=${ipData.lat}&longitude=${ipData.lon}&current=temperature_2m,precipitation`;

        const res = await fetch(weatherUrl);
        const data = await res.json();

        wData.temp = Math.round(data.current.temperature_2m);
        wData.rain = data.current.precipitation;
        wData.ready = true;

        rotateWeather();

        setInterval(rotateWeather, 4000);

    } catch {
        wData.temp = 28;
        wData.rain = 0;
        wData.ready = true;
    }
}


function rotateWeather() {

    if (!wData.ready) return;

    const el = document.getElementById("weather_temp");
    if (!el) return;

    el.style.opacity = 0;

    setTimeout(() => {

        if (weatherView === 0) {
            el.innerHTML = `<i class="fas fa-temperature-high"></i> ${wData.temp}°C`;
            weatherView = 1;
        }
        else {
            el.innerHTML = `<i class="fas fa-cloud-rain"></i> ${wData.rain}mm`;
            weatherView = 0;
        }

        el.style.opacity = 1;

    }, 300);
}
