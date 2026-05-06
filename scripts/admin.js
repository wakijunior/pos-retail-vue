const token = localStorage.getItem("token");

// 🔒 protect page
if (!token) {
    window.location.href = "login.html";
}

// load users
fetch("http://127.0.0.1:5000/admin/users", {
    headers: {
        "Authorization": "Bearer " + token
    }
})
.then(res => res.json())
.then(data => {
    const table = document.getElementById("usersTable");

    data.forEach(user => {
        table.innerHTML += `
            <tr>
                <td>${user.id}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="deleteUser(${user.id})" class="btn btn-danger btn-sm">Delete</button>
                </td>
            </tr>
        `;
    });

    document.getElementById("usersCount").innerText = data.length;
});

// delete user
function deleteUser(id) {
    fetch(`http://127.0.0.1:5000/admin/users/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": "Bearer " + token
        }
    }).then(() => location.reload());
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}