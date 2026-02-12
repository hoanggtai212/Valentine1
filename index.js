/* =======================================================================
   PHẦN 1: KHỞI TẠO VÀ CÁC HIỆU ỨNG GIAO DIỆN (UI)
   ======================================================================= */

// Hàm chạy khi web tải xong
function onCreate() {
    ShowToast();
    checkip_address();   // Gọi hàm hiển thị IP
}

// --- Hiệu ứng Toast (Thông báo nổi) ---
function ShowToast() {
    var x = document.getElementById("Toast");
    if (x) {
        x.className = "show";
        setTimeout(function() { x.className = x.className.replace("show", ""); }, 3900);
    }
}

// --- Hiệu ứng gõ chữ (Typewriter) ---
const text = "Hello everyone, I'm a Developer.\nI like website design :3";
const delay = 150;
const contentLetter = document.querySelector(".contentLetter");
let index = 0;
let isDeleting = false;

function typeEffect() {
    if (contentLetter) {
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
                setTimeout(typeEffect, delay / 1);
            }
        } else {
            isDeleting = true;
            setTimeout(typeEffect, delay);
        }
    }
}
typeEffect();

// --- Chế độ tối (Dark Mode) ---
function DarkMode() {
    var element = document.body;
    element.classList.toggle("dark-mode");
}

/* =======================================================================
   PHẦN 2: CÁC TIỆN ÍCH HỆ THỐNG (FPS, LIÊN KẾT)
   ======================================================================= */

// --- Bộ đếm FPS ---
var fps = document.getElementById("fps");
var startTime = Date.now();
var frame = 0;

function tick() {
    var time = Date.now();
    frame++;
    if (time - startTime > 1000) {
        if (fps) {
            fps.innerHTML = (frame / ((time - startTime) / 1000)).toFixed(1);
        }
        startTime = time;
        frame = 0;
    }
    window.requestAnimationFrame(tick);
}
tick();

// --- Mở liên kết Mạng xã hội ---
function OpenUrl(url) {
    setTimeout(function() {
        window.open(url, '_blank');
    }, 100);
}

function TikTok() { OpenUrl('https://www.tiktok.com/@duy.khanh98'); }
function Facebook() { OpenUrl('https://www.facebook.com/profile.php?id=100084065153231'); }
function Instagram() { OpenUrl('https://github.com/DuyKhanh068'); }
function Telegram() { OpenUrl('https://youtube.com/@DuyyKhanh68'); }

/* =======================================================================
   PHẦN 3: XỬ LÝ NHẠC (AUDIO PLAYER)
   ======================================================================= */

// Danh sách bài hát random (Từ 1 đến 20)
const songList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]; 

function getRandomAudio() {
    const randomIndex = Math.floor(Math.random() * songList.length);
    const songId = songList[randomIndex];
    return 'music/' + songId + '.mp3';
}

function playMusic() {
    var audio = document.getElementById("myAudio");
    if(audio) {
        audio.src = getRandomAudio();
        audio.play().catch(error => {
            console.log("Phát nhạc thất bại (Do trình duyệt chặn autoplay): " + error);
        });
        
        // Tự động chuyển bài khi hết
        audio.onended = function() {
            playMusic();
        };
    }
}

function hideNotification() {
    var notif = document.getElementById("notification");
    if(notif) {
        notif.style.display = "none";
        playMusic();
    }
}

/* =======================================================================
   PHẦN 4: HIỂN THỊ IP - NHÀ MẠNG - TỈNH (ĐÃ THÊM ICON)
   ======================================================================= */

// Biến lưu thông tin
let ipData = {
    ip: "Checking...",
    isp: "Checking...",
    location: "Checking...",
    city: "Checking...",
    lat: null,
    lon: null,
    ready: false
};

let ipViewState = 0; // 0: IP, 1: ISP, 2: Tỉnh

// --- Hàm loại bỏ AS number và chuẩn hóa ISP ---
function normalizeISP(isp) {
    if (!isp || isp === "Unknown ISP" || isp === "Network Hidden") {
        return "Unknown ISP";
    }
    
    // Loại bỏ các mã AS như AS7552, ASN, v.v.
    let cleanISP = isp
        .replace(/^AS\d+\s*/i, '')  // Loại bỏ AS số ở đầu
        .replace(/\s*AS\d+$/i, '')  // Loại bỏ AS số ở cuối
        .replace(/^ASN\s*/i, '')    // Loại bỏ ASN ở đầu
        .replace(/\s*\(AS\d+\)/i, '') // Loại bỏ (AS7552) trong ngoặc
        .replace(/^"|"$/g, '')      // Loại bỏ dấu ngoặc kép
        .trim();
    
    // Nếu sau khi làm sạch vẫn rỗng
    if (!cleanISP || cleanISP === "") {
        return "Unknown ISP";
    }
    
    // Giới hạn độ dài
    if (cleanISP.length > 25) {
        cleanISP = cleanISP.substring(0, 22) + "...";
    }
    
    return cleanISP;
}

// --- Hàm kiểm tra IP hợp lệ ---
function isValidIP(ip) {
    if (!ip || ip === "undefined" || ip === "null") return false;
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Pattern.test(ip)) {
        const parts = ip.split('.');
        return parts.every(part => {
            const num = parseInt(part, 10);
            return num >= 0 && num <= 255;
        });
    }
    return false;
}

// --- Hàm chính: Tự động thử các nguồn ---
async function checkip_address() {
    console.log("Đang lấy IP từ nhiều nguồn...");

    // DANH SÁCH CÁC API với fallback nhiều tầng
    const sources = [
        {
            name: "ipinfo.io",
            url: "https://ipinfo.io/json",
            parse: (data) => {
                if (!isValidIP(data.ip)) throw new Error("IP không hợp lệ");
                const loc = data.loc ? data.loc.split(',') : [null, null];
                return {
                    ip: data.ip,
                    isp: data.org || "Unknown ISP",
                    city: data.city || "Unknown",
                    region: data.region || "Unknown",
                    country: data.country || "Unknown",
                    location: `${data.city || "Unknown"}, ${data.country || "Unknown"}`,
                    lat: parseFloat(loc[0]) || null,
                    lon: parseFloat(loc[1]) || null
                };
            }
        },
        {
            name: "ip-api.com",
            url: "http://ip-api.com/json/?fields=status,message,country,city,lat,lon,query,org",
            parse: (data) => {
                if (data.status !== "success" || !isValidIP(data.query)) {
                    throw new Error("API lỗi hoặc IP không hợp lệ");
                }
                return {
                    ip: data.query,
                    isp: data.org || "Unknown ISP",
                    city: data.city || "Unknown",
                    region: data.region || "Unknown",
                    country: data.country || "Unknown",
                    location: `${data.city || "Unknown"}, ${data.country || "Unknown"}`,
                    lat: data.lat || null,
                    lon: data.lon || null
                };
            }
        },
        {
            name: "ipwho.is",
            url: "https://ipwho.is/",
            parse: (data) => {
                if (!data.success || !isValidIP(data.ip)) throw new Error("API không thành công");
                return {
                    ip: data.ip,
                    isp: data.connection?.isp || data.isp || "Unknown ISP",
                    city: data.city || "Unknown",
                    region: data.region || "Unknown",
                    country: data.country || "Unknown",
                    location: `${data.city || "Unknown"}, ${data.country || "Unknown"}`,
                    lat: data.latitude || null,
                    lon: data.longitude || null
                };
            }
        }
    ];

    let lastError = null;
    
    // Thử từng nguồn theo thứ tự
    for (const source of sources) {
        try {
            console.log(`Thử nguồn: ${source.name}`);
            
            // Thêm timeout cho mỗi request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000);
            
            const response = await fetch(source.url, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const parsed = source.parse(data);
            
            // CHUẨN HÓA ISP - LOẠI BỎ AS7552
            parsed.isp = normalizeISP(parsed.isp);
            
            // Nếu thành công thì lưu và dừng lại
            ipData.ip = parsed.ip;
            ipData.isp = parsed.isp;
            ipData.city = parsed.city;
            ipData.location = parsed.location;
            ipData.lat = parsed.lat || 21.0285; // Mặc định Hà Nội nếu không có lat/lon
            ipData.lon = parsed.lon || 105.8542; // Mặc định Hà Nội nếu không có lat/lon
            ipData.ready = true;
            
            console.log(`Thành công từ ${source.name}: IP=${parsed.ip}, ISP=${parsed.isp}, City=${parsed.city}`);
            
            // Cập nhật hiển thị ngay
            rotateIPInfo();
            
            // Cập nhật thời tiết với vị trí từ IP
            updateWeatherData(parsed.lat, parsed.lon, parsed.city);
            
            return; 
            
        } catch (err) {
            lastError = err;
            console.log(`${source.name} lỗi: ${err.message}`);
            // Tiếp tục thử nguồn tiếp theo
        }
    }

    // Nếu tất cả nguồn đều lỗi, dùng giá trị mặc định
    console.log("Tất cả nguồn đều lỗi, dùng giá trị mặc định");
    ipData.ip = "192.168." + Math.floor(Math.random() * 255) + "." + Math.floor(Math.random() * 255);
    ipData.isp = "Local Network";
    ipData.city = "Local";
    ipData.location = "Local Network";
    ipData.lat = 21.0285;
    ipData.lon = 105.8542;
    ipData.ready = true;
    
    rotateIPInfo();
    updateWeatherData();
}

// --- Hàm hiển thị xoay vòng (ĐÃ THÊM ICON) ---
function rotateIPInfo() {
    if (!ipData.ready) return;

    const el = document.getElementById("checkip_address");
    if (el) {
        // Hiệu ứng mờ
        el.style.transition = "opacity 0.3s";
        el.style.opacity = 0;

        setTimeout(() => {
            if (ipViewState === 0) {
                // HIỂN THỊ IP VỚI ICON
                el.innerHTML = `<i class="fas fa-globe" style="margin-right: 6px; color: #00FFFF;"></i> <span style="color: #00FFFF; font-weight: bold;">${ipData.ip}</span>`;
                el.style.color = "#00FFFF";
                ipViewState = 1;
            } 
            else if (ipViewState === 1) {
                // HIỂN THỊ NHÀ MẠNG VỚI ICON (ĐÃ LOẠI BỎ AS7552)
                el.innerHTML = `<i class="fas fa-network-wired" style="margin-right: 6px; color: #F1C40F;"></i> <span style="color: #F1C40F; font-weight: bold;">${ipData.isp}</span>`;
                el.style.color = "#F1C40F";
                ipViewState = 2;
            } 
            else {
                // HIỂN THỊ VỊ TRÍ VỚI ICON
                el.innerHTML = `<i class="fas fa-map-marker-alt" style="margin-right: 6px; color: #2ECC71;"></i> <span style="color: #2ECC71; font-weight: bold;">${ipData.location}</span>`;
                el.style.color = "#2ECC71";
                ipViewState = 0;
            }
            
            // Thêm tooltip với thông tin đầy đủ
            el.title = `IP: ${ipData.ip}\nISP: ${ipData.isp}\nLocation: ${ipData.location}\nCity: ${ipData.city}`;
            
            // Hiện lại
            el.style.opacity = 1;
        }, 300);
    }
}

/* =======================================================================
   PHẦN 5: THỜI TIẾT TỰ ĐỘNG XOAY VÒNG (SỬ DỤNG VỊ TRÍ TỪ IP)
   ======================================================================= */

// Biến lưu trữ dữ liệu thời tiết
let wData = {
    city: "Loading...",
    temp: "--",
    rain_mm: 0,
    rain_prob: 0,
    aqi: "--",
    ready: false
};

let viewState = 0; // 0: Nhiệt độ, 1: Mưa, 2: AQI

async function updateWeatherData(customLat = null, customLon = null, customCity = null) {
    // Sử dụng vị trí từ IP nếu có, nếu không dùng mặc định
    let lat = customLat || ipData.lat || 21.0285;
    let lon = customLon || ipData.lon || 105.8542;
    let city = customCity || ipData.city || "Hanoi";
    
    wData.city = city;
    
    // Cập nhật tên thành phố ngay lập tức nếu có phần tử
    const elLoc = document.getElementById('weather_loc');
    if (elLoc) {
        elLoc.innerText = wData.city;
    }
    
    console.log(`Lấy thời tiết cho: ${city} (${lat}, ${lon})`);

    // B1: Lấy Thời tiết (Nhiệt độ, Lượng mưa, Xác suất mưa)
    try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&hourly=precipitation_probability&timezone=auto`;
        const wRes = await fetch(weatherUrl);
        
        if (!wRes.ok) throw new Error("Lỗi API thời tiết");
        
        const wJson = await wRes.json();
        
        if (wJson.current) {
            wData.temp = Math.round(wJson.current.temperature_2m);
            wData.rain_mm = wJson.current.precipitation || 0;
            
            // Lấy % mưa của giờ hiện tại
            if (wJson.hourly && wJson.hourly.precipitation_probability) {
                const currentHour = new Date().getHours();
                wData.rain_prob = wJson.hourly.precipitation_probability[currentHour] || 0;
            }
            
            console.log(`Thời tiết: ${wData.temp}°C, Mưa: ${wData.rain_mm}mm`);
        }
    } catch (e) { 
        console.log("Lỗi lấy thời tiết:", e.message);
        // Dữ liệu mẫu nếu API lỗi
        wData.temp = Math.floor(Math.random() * 15) + 20;
        wData.rain_mm = (Math.random() * 5).toFixed(1);
        wData.rain_prob = Math.floor(Math.random() * 100);
    }

    // B2: Lấy chỉ số AQI (Chất lượng không khí)
    try {
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;
        const aqiRes = await fetch(aqiUrl);
        
        if (aqiRes.ok) {
            const aqiJson = await aqiRes.json();
            if (aqiJson.current && aqiJson.current.us_aqi !== undefined) {
                wData.aqi = aqiJson.current.us_aqi;
            }
        } else {
            throw new Error("API AQI không phản hồi");
        }
    } catch (e) { 
        console.log("Lỗi lấy AQI:", e.message);
        wData.aqi = Math.floor(Math.random() * 150) + 30;
    }

    wData.ready = true;
    
    // Cập nhật hiển thị nếu đây là lần đầu
    if (!window.weatherInitialized) {
        rotateView();
        window.weatherInitialized = true;
    }
}

// Hàm xoay vòng hiển thị
function rotateView() {
    if (!wData.ready) return;

    // Tìm phần tử hiển thị thời tiết
    const elDynamic = document.getElementById('weather_temp');
    
    // Tìm icon (có thể nằm trong cùng container)
    let elIcon = null;
    if (elDynamic && elDynamic.parentElement) {
        elIcon = elDynamic.parentElement.querySelector('i');
    }

    if (elDynamic) {
        // Hiệu ứng mờ
        elDynamic.style.transition = "opacity 0.3s";
        elDynamic.style.opacity = 0;
        
        setTimeout(() => {
            if (viewState === 0) {
                // HIỂN THỊ NHIỆT ĐỘ VỚI ICON
                if (elIcon) {
                    elIcon.className = "fas fa-temperature-high";
                    
                    // Màu theo nhiệt độ
                    if (wData.temp > 30) {
                        elIcon.style.color = "#e74c3c"; // Đỏ (nóng)
                    } else if (wData.temp > 25) {
                        elIcon.style.color = "#f39c12"; // Cam (ấm)
                    } else {
                        elIcon.style.color = "#3498db"; // Xanh dương (mát)
                    }
                }
                
                // Format nhiệt độ
                let tempDisplay = wData.temp;
                if (typeof wData.temp === 'number') {
                    tempDisplay = Math.round(wData.temp);
                }
                elDynamic.innerHTML = `<span style="font-weight: bold;">${tempDisplay}°C</span>`;
                viewState = 1;
            } 
            else if (viewState === 1) {
                // HIỂN THỊ MƯA VỚI ICON
                if (elIcon) {
                    elIcon.className = "fas fa-cloud-rain";
                    elIcon.style.color = "#3498db"; // Xanh dương
                }
                
                // Format lượng mưa
                let rainDisplay;
                if (wData.rain_mm > 0) {
                    rainDisplay = `<span style="font-weight: bold;">${parseFloat(wData.rain_mm).toFixed(1)}mm</span> (${Math.round(wData.rain_prob)}%)`;
                } else {
                    rainDisplay = `<span style="font-weight: bold;">${Math.round(wData.rain_prob)}%</span>`;
                }
                
                elDynamic.innerHTML = rainDisplay;
                viewState = 2;
            } 
            else {
                // HIỂN THỊ AQI VỚI ICON
                if (elIcon) {
                    elIcon.className = "fas fa-wind";
                    
                    // Đổi màu icon theo mức độ ô nhiễm
                    let color = "#27ae60"; // Xanh lá (Tốt: 0-50)
                    if (wData.aqi > 50) color = "#f1c40f"; // Vàng (Trung bình: 51-100)
                    if (wData.aqi > 100) color = "#e67e22"; // Cam (Kém: 101-150)
                    if (wData.aqi > 150) color = "#e74c3c"; // Đỏ (Xấu: 151+)
                    
                    elIcon.style.color = color;
                }
                
                // Format AQI
                let aqiDisplay = wData.aqi;
                if (typeof wData.aqi === 'number') {
                    aqiDisplay = Math.round(wData.aqi);
                }
                
                elDynamic.innerHTML = `<span style="font-weight: bold;">AQI ${aqiDisplay}</span>`;
                viewState = 0;
            }
            
            // Hiện lại
            elDynamic.style.opacity = 1;
        }, 300);
    }
}

/* =======================================================================
   KHỞI CHẠY VÀ CÀI ĐẶT INTERVAL
   ======================================================================= */

// Kích hoạt khi trang load xong
document.addEventListener('DOMContentLoaded', function() {
    console.log("Khởi động hệ thống...");
    
    // Kiểm tra xem các phần tử HTML có tồn tại không
    if (!document.getElementById("checkip_address")) {
        console.warn("Không tìm thấy phần tử #checkip_address");
    }
    
    if (!document.getElementById("weather_temp")) {
        console.warn("Không tìm thấy phần tử #weather_temp");
    }
    
    // Thêm CSS cho icon và hiệu ứng
    const style = document.createElement('style');
    style.textContent = `
        #checkip_address {
            cursor: pointer;
            user-select: none;
            transition: all 0.3s ease !important;
            display: inline-flex;
            align-items: center;
        }
        #checkip_address:hover {
            transform: translateY(-2px);
            text-shadow: 0 0 10px currentColor;
        }
        #checkip_address i {
            transition: all 0.3s ease;
        }
        #checkip_address:hover i {
            transform: scale(1.2);
        }
        #weather_temp {
            transition: all 0.3s ease !important;
            font-weight: bold;
        }
        .weather-icon {
            margin-right: 8px;
        }
    `;
    document.head.appendChild(style);
    
    // Hiển thị trạng thái loading ban đầu
    const ipEl = document.getElementById("checkip_address");
    if (ipEl) {
        ipEl.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 6px; color: #f39c12;"></i> <span style="color: #f39c12;">Loading your address...</span>';
    }
    
    // Bắt đầu lấy thông tin IP
    setTimeout(() => {
        checkip_address();
    }, 1000);
    
    // Đặt interval cho việc xoay thông tin
    setInterval(rotateIPInfo, 4000); // 4 giây đổi thông tin IP/ISP/Vị trí
    setInterval(rotateView, 4000);   // 4 giây đổi thông tin thời tiết
    
    // Tự động cập nhật thời tiết mỗi 10 phút
    setInterval(() => {
        if (ipData.ready) {
            console.log("Tự động cập nhật thời tiết...");
            updateWeatherData();
        }
    }, 600000); // 10 phút
    
    // Tự động refresh IP mỗi 5 phút (nếu đang dùng IP local)
    setInterval(() => {
        if (ipData.ready && ipData.ip.startsWith("192.168.")) {
            console.log("Thử lấy lại IP thật...");
            checkip_address();
        }
    }, 300000); // 5 phút
});

// Hàm để refresh thủ công nếu cần
window.refreshIP = function() {
    console.log("Refresh thủ công...");
    ipData.ready = false;
    wData.ready = false;
    
    // Hiển thị loading state
    const ipEl = document.getElementById("checkip_address");
    if (ipEl) {
        ipEl.innerHTML = '<i class="fas fa-sync-alt fa-spin" style="margin-right: 6px; color: #f39c12;"></i> <span style="color: #f39c12;">Refreshing...</span>';
        ipEl.style.opacity = "0.7";
    }
    
    const weatherEl = document.getElementById("weather_temp");
    if (weatherEl) {
        weatherEl.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i>';
        weatherEl.style.opacity = "0.7";
    }
    
    // Gọi lại hàm lấy IP
    setTimeout(() => {
        checkip_address();
    }, 500);
};

// Thêm event listener cho việc click để refresh IP
document.addEventListener('click', function(e) {
    if (e.target && (e.target.id === 'checkip_address' || e.target.closest('#checkip_address'))) {
        window.refreshIP();
    }
});
