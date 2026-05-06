const indexApp = new Vue({
    el: '#dashboard',

    data: {
        products: [],
        searchQuery: '',
        filteredProducts: [],
        token: null,
        apiBase: 'http://localhost:3000/api'
    },

    computed: {
        isLoggedIn() {
            return !!this.token;
        }
    },

    methods: {
        async fetchProducts() {
            try {
                const response = await axios.get(`${this.apiBase}/products`);
                this.products = response.data;
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        },

        logout() {
            const token = this.token;

            fetch(`${this.apiBase}/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            .finally(() => {
                localStorage.removeItem("token");
                this.token = null;
                window.location.href = "login.html";
            });
        },
    },

    mounted() {
        this.token = localStorage.getItem("token")
    
        if (!this.token) {
            window.location.href = "login.html";
            return;
        }
    }
});