const paymentsApp = new Vue({

    el: '#payments',

    data: {

        token: null,

        payments: [],

        loading: false,

        apiBase: 'http://127.0.0.1:5000'
    },

    methods: {

        async fetchPayments() {

            this.loading = true;

            try {

                const response = await axios.get(
                    `${this.apiBase}/mpesa-payments`,
                    {
                        headers: {
                            Authorization: `Bearer ${this.token}`
                        }
                    }
                );

                this.payments = response.data;

            } catch (error) {

                console.error('Error fetching payments:', error);

            } finally {

                this.loading = false;
            }
        },

        logout() {

            localStorage.removeItem('token');

            this.token = null;

            window.location.href = 'login.html';
        }
    },

    mounted() {

        this.token = localStorage.getItem('token');

        if (!this.token) {
            window.location.href = 'login.html';
        }
    }
});