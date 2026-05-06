const token = localStorage.getItem("token");

if (token) {
    axios.defaults.headers.common['Authorization'] = "Bearer " + token;
}

const appProducts = new Vue({
    el: '#products',

    data: {
        title: 'Our Products',
        subtitle: 'Manage your inventory easily',
        products: [],
        product_name: '',
        quantity: null,
        price: null,
        loader: false,
        editingId: null,
        alertErrorShow: false,
        alertSuccessShow: false,
        alertMessage: '',
        token: localStorage.getItem("token"),
        apiBase: 'http://127.0.0.1:5000'
    },
    computed: {
        isLoggedIn() {
            return !!this.token;
        }
    },

    methods: {

        // ✅ CREATE PRODUCT
        async createProduct() {

            const qty = Number(this.quantity);
            const prc = Number(this.price);

            if (
                !this.product_name.trim() ||
                this.quantity === null ||
                this.price === null ||
                isNaN(qty) ||
                isNaN(prc)
            ) {
                this.alertErrorShow = true;
                this.alertMessage = "All fields are required and must be valid numbers";
                return;
            }

            this.loader = true;

            try {
                const payload = {
                    product_name: this.product_name,
                    quantity: qty,
                    price: prc
                };

                console.log({
                    product_name: this.product_name,
                    quantity: qty,
                    price: prc
                });

                if (this.editingId) {

                    await axios.put(
                        `${this.apiBase}/products/${this.editingId}`,
                        payload
                    );

                    this.editingId = null;

                } else {

                    await axios.post(`${this.apiBase}/products`, payload, {
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
                }

                // reset form
                this.product_name = '';
                this.quantity = null;
                this.price = null;

                await this.getProducts();

            } catch (error) {
                console.log("Full error:", error);

                // 🔌 No response → server down / network issue
                if (!error.response) {
                    this.alertMessage = "Cannot connect to server. Check your internet or backend.";
                } else {
                    console.log("Server response:", error.response.data);

                    // ✅ show actual backend message
                    this.alertMessage =
                        error.response.data.error ||
                        error.response.data.message ||
                        "Failed to save product";
                    this.alertErrorShow = true;
                }

                
            } finally {
                this.loader = false;
            }
        },
        editProduct(product) {
            this.editingId = product.id;

            this.product_name = product.product_name;
            this.quantity = product.quantity;
            this.price = product.price;
        },

        async deleteProduct(id) {
            if (!confirm("Are you sure?")) return;

            

            try {
                await axios.delete(`${this.apiBase}/products/${id}`, {
                    headers: {
                        Authorization: "Bearer " + localStorage.getItem("token")
                    }
                });

                this.products = this.products.filter(p => p.id !== id);
            }
            catch (error) {
                console.error(error.response?.data || error);
                this.alertMessage = "Delete failed"
                this.alertErrorShow = true;
            }
        },

        logout() {
            const token = localStorage.getItem("token");

            fetch(`${this.apiBase}/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .finally(() => {
                    localStorage.removeItem("token");
                    this.token = null; // 🔥 IMPORTANT (updates UI)
                    window.location.href = "login.html";
                });
        },

        // ✅ GET PRODUCTS
        async getProducts() {
            try {
                const response = await axios.get(`${this.apiBase}/products`);

                this.products = response.data;

                this.$nextTick(() => {
                    if ($.fn.DataTable.isDataTable('#productsTable')) {
                        $('#productsTable').DataTable().destroy();
                    }

                    $('#productsTable').DataTable({
                        responsive: true
                    });
                });

            } catch (error) {
                console.error("Fetch error:", error.response?.data || error);
            }
        }
    },

    mounted() {
        const token = localStorage.getItem("token");

        if (!token) {
            window.location.href = "login.html";
            return;
        }

        this.token = token;

        this.getProducts();

    }
});
