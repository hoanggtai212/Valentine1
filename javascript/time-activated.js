document.addEventListener("DOMContentLoaded", function () {
    show_date_time();
});

function show_date_time() {

    // 👉 Đổi ngày ở đây nếu muốn
    const BirthDay = new Date("2023-08-06T00:00:00");
    const today = new Date();

    const timeDiff = today - BirthDay;

    const totalSeconds = Math.floor(timeDiff / 1000);

    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    const momk = document.getElementById("momk");

    if (momk) {
        momk.innerHTML =
            days + " ngày " +
            hours + " giờ " +
            minutes + " phút " +
            seconds + " giây";
    }

    setTimeout(show_date_time, 1000);
}
