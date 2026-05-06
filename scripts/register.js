const appRegister = new Vue({
    el: '#register',

    data: {
        full_name: '',
        email: '',
        password: '',
        loader: false,
        alertErrorShow: false,
        alertSuccessShow: false,
        alertMessage: '',
        apiBase: 'http://127.0.0.1:5000'
    },

    methods: {

        async registerUser() {

            if (!this.full_name || !this.email || !this.password) {
                this.alertMessage = "All fields are required";
                this.alertErrorShow = true;
                return;
            }

            this.loader = true;

            try {
                const response = await axios.post(`${this.apiBase}/register`, {
                    full_name: this.full_name,
                    email: this.email,
                    password: this.password
                });


                const token = response.data.access_token;

                if (token) {
                    localStorage.setItem("token", token);
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                }

                console.log(response.data);

                this.alertMessage = "Registration successful";
                this.alertSuccessShow = true;

                // redirect
                window.location.href = "dashboard.html";

            } catch (error) {
                console.log(error);

                alert(
                    error.response?.data?.error ||
                    error.response?.data?.message ||
                    "Registration failed"
                );
            } finally {
                this.loader = false;
            }
        }
    },
    mounted() {
        console.log("Vue is working");
    }
});