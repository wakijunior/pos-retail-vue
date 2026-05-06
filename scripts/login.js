new Vue({
    el: '#login',

    data: {
        email: '',
        password: '',
        title: 'Amazing Products You Will Love',
        subtitle: 'Login today and get access to our amazing products at unbeatable prices.',
        loader: false,
        alertErrorShow: false,
        alertSuccessShow: false,
        alertMessage: '',
        token: localStorage.getItem("token")
    },
    computed: {
        isLoggedIn() {
            return !!this.token;
        }
    },

    methods: {

        loginUser() {
            this.loader = true;

            axios.post('http://localhost:5000/login', {
                email: this.email,
                password: this.password
            })
                .then((response) => {

                    console.log(response.data);

                    // ✅ Save token
                    localStorage.setItem(
                        "token",
                        response.data.access_token
                    );
                    this.alertMessage = "Login successful.";
                    this.alertSuccessShow = true;
                    this.loader = false;

                    //optional redirect
                    window.location.href = "dashboard.html";

                })
                .catch((error) => {

                    const msg = error.response?.data?.error;

                    if (msg === "User not found") {
                        // redirect to register page
                        window.location.href = "register.html";
                        return;
                    }
                    this.loader = false;
                });
        }
    },
    mounted() {
        console.log("Vue is working");

        // 🔒 protect page
        if (this.token) {
            window.location.href = "dashboard.html";
        }
    }
});