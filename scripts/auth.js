// auth.js

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("cart");

    window.location.href = "login.html";
}

function getToken() {
    return localStorage.getItem("token");
}

function updateNavbarAuthState() {
    const token = localStorage.getItem("token");

    const loginLink = document.getElementById("loginLink");
    const registerLink = document.getElementById("registerLink");

    const protectedLinks = document.querySelectorAll(".protected-link");

    if (token) {
        // user logged in
        if (loginLink) loginLink.style.display = "none";
        if (registerLink) registerLink.style.display = "none";

        protectedLinks.forEach(el => el.style.display = "inline-block");

    } else {
        // user not logged in
        if (loginLink) loginLink.style.display = "inline-block";
        if (registerLink) registerLink.style.display = "inline-block";

        protectedLinks.forEach(el => el.style.display = "none");
    }
}
