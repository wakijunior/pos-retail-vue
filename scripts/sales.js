const API = axios.create({
    baseURL: 'http://127.0.0.1:5000'
});

// attach token automatically
API.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = "Bearer " + token;
    }
    return config;
});

const appSales = new Vue({
    el: '#sales',

    data: {
        cart: [],
        products: [],
        searchQuery: '',
        receipt: null,
        alertErrorShow: false,
        alertSuccessShow: false,
        alertMessage: '',
        store: {
            name: "HewStore Pos",
            location: "Nairobi, Kenya",
            phone: "0789 000000"
        },
        token: localStorage.getItem("token")
    },

    computed: {
        filteredProducts() {

            const search = (this.searchQuery || '')
                .toLowerCase()
                .trim();

            return this.products.filter(p => {

                const name = String(p.product_name || '')
                    .toLowerCase()
                    .trim();

                return name.includes(search);
            });
        },


        total() {
            return this.cart.reduce((sum, item) => {
                return sum + (Number(item.price) * Number(item.quantity));
            }, 0);
        }
    },

    methods: {

        // 🔥 LOAD PRODUCTS FROM BACKEND
        getProducts() {
            API.get('/products')
                .then(res => {
                    this.products = res.data.map(product => ({
                        id: product.id,
                        product_name: product.product_name,
                        price: product.price,
                    }));
                })
                .catch(err => console.error(err));
        },

        addToCart(product) {
            const existing = this.cart.find(item => item.id === product.id);

            if (existing) {
                existing.quantity++;
            } else {
                this.cart.push({
                    id: product.id,
                    product_name: product.product_name,
                    price: Number(product.price),
                    quantity: Number(1)
                });
            }

            this.saveCart();
        },

        increaseQty(item) {
            const cartItem = this.cart.find(product => product.id === item.id);
            if (cartItem) cartItem.quantity++;
            this.saveCart();
        },

        decreaseQty(item) {
            const cartItem = this.cart.find(product => product.id === item.id);

            if (!cartItem) return;

            if (cartItem.quantity > 1) {
                cartItem.quantity--;
            } else {
                this.removeItem(item);
            }

            this.saveCart();
        },

        removeItem(item) {
            this.cart = this.cart.filter(product => product.id !== item.id);
            this.saveCart();
        },

        // checkout() {
        //     if (!this.cart.length) return;

        //     const confirmBuy = confirm(`Proceed to checkout? Total: ${this.total}`);
        //     if (!confirmBuy) return;

        //     const requests = this.cart.map(item => {
        //         return API.post('/sales', {
        //             product_id: item.id
        //         });
        //     });

        //     Promise.all(requests)
        //         .then(responses => {
        //             const saleIds = responses.map(r => r.data.sale_id);
        //             const sale_id = saleIds[0];

        //             return API.post('/stk-push', {
        //                 phone_number: '2547XXXXXXXX',
        //                 amount: this.cart.reduce((a, b) => a + b.price * b.qty, 0),
        //                 sale_id: sale_id
        //             });
        //         })
        //         .then(() => {
        //             alert("STK Push sent 📲");
        //             this.cart = [];
        //             this.saveCart();
        //         })
        //         .catch(err => {
        //             console.error(err);
        //             alert("Checkout failed");
        //         });
        // },

        checkout() {
            if (!this.cart.length) return;

            const confirmBuy = confirm(`Proceed to checkout? Total: ${this.total}`);
            if (!confirmBuy) return;

            const receiptData = {
                items: [...this.cart],
                total: this.total,
                date: new Date().toLocaleString()
            };

            const requests = this.cart.map(item => {
                return API.post('/sales', {
                    product_id: item.id
                });
            });

            Promise.all(requests)
                .then(responses => {
                    const saleIds = responses.map(r => r.data.sale_id);
                    const sale_id = saleIds[0];

                    return API.post('/stk-push', {
                        phone_number: '2547XXXXXXXX',
                        amount: this.cart.reduce((a, b) => a + b.price * b.qty, 0),
                        sale_id: sale_id
                    });
                })
                .then(() => {
                    this.receipt = receiptData;   // ✅ SAVE RECEIPT
                    this.alertMessage = "STK Push sent 📲";
                    this.alertSuccessShow = true;
                    this.cart = [];
                    this.saveCart();
                })
                .catch(err => {
                    console.error(err);
                    this.alertMessage = "Checkout failed";
                    this.alertErrorShow = true;
                });
        },

        printReceipt() {
            const content = document.getElementById("receipt").innerHTML;

            const win = window.open('', '', 'width=300,height=600');

            win.document.write(`
        <html>
        <head>
            <title>Receipt</title>
            <style>
                body {
                    font-family: monospace;
                    font-size: 12px;
                    width: 280px;
                    margin: auto;
                }
                hr {
                    border-top: 1px dashed black;
                }
            </style>
        </head>
        <body onload="window.print();window.close()">
            ${content}
        </body>
        </html>
    `);

            win.document.close();
        },
        logout() {
            API.post('/logout')
                .finally(() => {
                    localStorage.removeItem("token");
                    this.token = null;
                    window.location.href = "login.html";
                });
        },

        saveCart() {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        },

        loadCart() {
            const saved = localStorage.getItem('cart');
            if (saved) {
                this.cart = JSON.parse(saved);
            }
        }
    },

    mounted() {
        API.get('/products')
            .then(res => {
                this.products = JSON.parse(JSON.stringify(res.data));
                console.log("PRODUCTS LOADED:", this.products);
            })
            .catch(err => {
                console.log("PRODUCT ERROR:", err);
            });
    }
});