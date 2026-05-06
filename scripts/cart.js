const appCart = new Vue({
    el: '#cartApp',

    data: {
        cart: [],
        title: 'Our Cart',
        subtitle: 'These are the items you have added to your cart.',
        token: localStorage.getItem("token")
    },

    computed: {
        total() {
            return 'Ksh ' + this.cart.reduce((sum, item) => {
                return sum + (item.price * item.qty);
            }, 0).toLocaleString();
        },
         isLoggedIn() {
            return !!this.token;
        }
    },

    mounted() {
        const saved = localStorage.getItem('cart');
        if (saved) {
            this.cart = JSON.parse(saved);
        }
    },

    methods: {
        save() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },

        increaseQty(item) {
            item.qty++;
            this.save();
        },

        decreaseQty(item) {
            if (item.qty > 1) {
                item.qty--;
            } else {
                this.cart = this.cart.filter(p => p.id !== item.id);
            }
            this.save();
        },

        async logout() {
            const token = localStorage.getItem("token");

            fetch(`${this.apiBase}/logout`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
                .finally(() => {
                    localStorage.removeItem("token");
                    window.location.href = "login.html";
                });
        },

        async checkout() {

            if (!this.cart.length) {
                alert("Cart is empty");
                return;
            }

            const confirmBuy = confirm(`Proceed to checkout? Total: ${this.total}`);
            if (!confirmBuy) return;

            try {
                // 🔥 Step 1: create sales for each item
                const saleRequests = this.cart.map(item => {
                    return axios.post("http://127.0.0.1:5000/sales", {
                        product_id: item.id
                    }, {
                        headers: {
                            Authorization: "Bearer " + localStorage.getItem("token")
                        }
                    });
                });

                const responses = await Promise.all(saleRequests);

                // 🔥 Step 2: collect sale IDs
                const saleIds = responses.map(res => res.data.sale_id);

                // use first sale (simple version)
                const sale_id = saleIds[0];

                // 🔥 Step 3: calculate total amount
                const amount = this.cart.reduce((sum, item) => {
                    return sum + (item.price * item.qty);
                }, 0);

                // 🔥 Step 4: trigger M-Pesa
                await axios.post("http://127.0.0.1:5000/stk-push", {
                    phone_number: phone_number, // 🔴 replace with real number
                    amount: amount,
                    sale_id: sale_id
                });

                alert("STK Push sent 📲");

                // 🔥 Step 5: clear cart
                this.cart = [];
                this.save();

            } catch (error) {
                console.error("Checkout error:", error.response?.data || error);
                alert("Checkout failed");
            }
        }
    }
});