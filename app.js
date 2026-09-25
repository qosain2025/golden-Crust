```javascript
// ============================================
// THE GOLDEN CRUST
// CUSTOMER APP
// ============================================

let products = [];
let categories = [];
let cart = [];

let selectedCategory = "all";


// ============================================
// BUSINESS SETTINGS
// ============================================

const BUSINESS_WHATSAPP = "923360011022";


// ============================================
// DOM ELEMENTS
// ============================================

const productsContainer =
    document.getElementById("products");

const categoriesContainer =
    document.getElementById("categories");

const loading =
    document.getElementById("loading");

const emptyState =
    document.getElementById("emptyState");

const cartButton =
    document.getElementById("cartButton");

const cartCount =
    document.getElementById("cartCount");

const cartDrawer =
    document.getElementById("cartDrawer");

const cartOverlay =
    document.getElementById("cartOverlay");

const closeCart =
    document.getElementById("closeCart");

const cartItems =
    document.getElementById("cartItems");

const cartTotal =
    document.getElementById("cartTotal");

const checkoutButton =
    document.getElementById("checkoutButton");

const checkoutModal =
    document.getElementById("checkoutModal");

const closeCheckout =
    document.getElementById("closeCheckout");

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const toast =
    document.getElementById("toast");

const themeToggle =
    document.getElementById("themeToggle");


// ============================================
// INITIALIZE
// ============================================

document.addEventListener("DOMContentLoaded", async () => {

    loadSavedCart();
    loadTheme();

    setupEvents();

    await loadMenu();

    updateCartUI();

});


// ============================================
// EVENTS
// ============================================

function setupEvents() {

    cartButton.addEventListener(
        "click",
        openCart
    );

    closeCart.addEventListener(
        "click",
        closeCartDrawer
    );

    cartOverlay.addEventListener(
        "click",
        closeCartDrawer
    );

    checkoutButton.addEventListener(
        "click",
        openCheckout
    );

    closeCheckout.addEventListener(
        "click",
        closeCheckoutModal
    );

    checkoutForm.addEventListener(
        "submit",
        submitOrder
    );

    themeToggle.addEventListener(
        "click",
        toggleTheme
    );

    categoriesContainer.addEventListener(
        "click",
        handleCategoryClick
    );

    productsContainer.addEventListener(
        "click",
        handleProductClick
    );

    cartItems.addEventListener(
        "click",
        handleCartClick
    );

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeCartDrawer();
                closeCheckoutModal();

            }

        }
    );

}


// ============================================
// LOAD MENU
// ============================================

async function loadMenu() {

    showLoading(true);

    try {

        const {
            data: categoryData,
            error: categoryError
        } = await supabaseClient
            .from("categories")
            .select("*")
            .eq("active", true)
            .order("sort_order", {
                ascending: true
            });

        if (categoryError) {
            throw categoryError;
        }


        const {
            data: productData,
            error: productError
        } = await supabaseClient
            .from("products")
            .select(`
                *,
                categories (
                    id,
                    name
                )
            `)
            .eq("available", true)
            .order("created_at", {
                ascending: true
            });

        if (productError) {
            throw productError;
        }


        categories =
            categoryData || [];

        products =
            productData || [];


        renderCategories();

        renderProducts();

    }

    catch (error) {

        console.error(
            "Menu loading error:",
            error
        );

        showToast(
            "Unable to load the menu. Please try again."
        );

        productsContainer.innerHTML = "";

        emptyState.classList.remove(
            "hidden"
        );

    }

    finally {

        showLoading(false);

    }

}


// ============================================
// CATEGORIES
// ============================================

function renderCategories() {

    categoriesContainer.innerHTML = `
        <button
            class="category-btn active"
            data-category="all"
        >
            All
        </button>
    `;

    categories.forEach(category => {

        const button =
            document.createElement("button");

        button.className =
            "category-btn";

        button.dataset.category =
            category.id;

        button.textContent =
            category.name;

        categoriesContainer.appendChild(
            button
        );

    });

}


function handleCategoryClick(event) {

    const button =
        event.target.closest(
            ".category-btn"
        );

    if (!button) return;

    selectedCategory =
        button.dataset.category;


    document
        .querySelectorAll(".category-btn")
        .forEach(btn => {

            btn.classList.remove(
                "active"
            );

        });


    button.classList.add(
        "active"
    );


    renderProducts();

}


// ============================================
// PRODUCTS
// ============================================

function getFilteredProducts() {

    if (selectedCategory === "all") {

        return products;

    }

    return products.filter(
        product =>
            String(product.category_id) ===
            String(selectedCategory)
    );

}


function renderProducts() {

    const filteredProducts =
        getFilteredProducts();


    productsContainer.innerHTML = "";


    if (!filteredProducts.length) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    filteredProducts.forEach(
        product => {

            productsContainer.appendChild(
                createProductCard(product)
            );

        }
    );

}


// ============================================
// PRODUCT CARD
// ============================================

function createProductCard(product) {

    const card =
        document.createElement("article");

    card.className =
        "product-card";


    const categoryName =
        product.categories?.name ||
        "Menu";


    const imageSection =
        product.image_url

            ? `
                <img
                    src="${escapeAttribute(product.image_url)}"
                    alt="${escapeAttribute(product.name)}"
                    loading="lazy"
                >
            `

            : `
                <div class="product-placeholder">
                    ${getCategoryIcon(categoryName)}
                </div>
            `;


    const startingPrice =
        getStartingPrice(product);


    card.innerHTML = `

        <div class="product-image">

            ${imageSection}

            <button
                class="favorite-btn"
                data-favorite="${product.id}"
                aria-label="Add to favourites"
            >
                ♡
            </button>

        </div>


        <div class="product-info">

            <div class="product-category">
                ${escapeHTML(categoryName)}
            </div>

            <h3 class="product-name">
                ${escapeHTML(product.name)}
            </h3>

            <p class="product-description">
                ${escapeHTML(
                    product.description ||
                    "Freshly prepared and full of flavour."
                )}
            </p>


            <div class="product-bottom">

                <div class="product-price">
                    ${formatPrice(startingPrice)}
                </div>

                <button
                    class="add-button"
                    data-add="${product.id}"
                    aria-label="Add to cart"
                >
                    +
                </button>

            </div>

        </div>

    `;


    return card;

}


// ============================================
// PRODUCT ACTIONS
// ============================================

function handleProductClick(event) {

    const favorite =
        event.target.closest(
            "[data-favorite]"
        );

    if (favorite) {

        toggleFavorite(
            favorite.dataset.favorite,
            favorite
        );

        return;

    }


    const addButton =
        event.target.closest(
            "[data-add]"
        );

    if (addButton) {

        const product =
            products.find(
                item =>
                    String(item.id) ===
                    String(addButton.dataset.add)
            );

        if (!product) return;

        addProductToCart(product);

    }

}


// ============================================
// FAVORITES
// ============================================

function toggleFavorite(
    productId,
    button
) {

    const favorites =
        JSON.parse(
            localStorage.getItem(
                "goldenCrustFavorites"
            ) || "[]"
        );


    const index =
        favorites.indexOf(
            String(productId)
        );


    if (index >= 0) {

        favorites.splice(index, 1);

        button.textContent = "♡";

    }

    else {

        favorites.push(
            String(productId)
        );

        button.textContent = "♥";

        button.classList.add(
            "liked"
        );

        setTimeout(() => {

            button.classList.remove(
                "liked"
            );

        }, 400);

    }


    localStorage.setItem(
        "goldenCrustFavorites",
        JSON.stringify(favorites)
    );

}


// ============================================
// ADD TO CART
// ============================================

function addProductToCart(product) {

    const options =
        normalizeOptions(product);


    if (options.length > 1) {

        openProductOptions(product);

        return;

    }


    const option =
        options[0];


    addCartItem(
        product,
        option
    );

}


// ============================================
// PRODUCT OPTIONS
// ============================================

function openProductOptions(product) {

    const options =
        normalizeOptions(product);


    const choice =
        prompt(
            buildOptionMessage(
                product,
                options
            )
        );


    if (choice === null) return;


    const index =
        Number(choice) - 1;


    if (
        index < 0 ||
        index >= options.length
    ) {

        showToast(
            "Please select a valid option."
        );

        return;

    }


    addCartItem(
        product,
        options[index]
    );

}


function buildOptionMessage(
    product,
    options
) {

    let message =
        `${product.name}\n\n`;


    options.forEach(
        (option, index) => {

            message +=
                `${index + 1}. ` +
                `${option.name} — ` +
                `${formatPrice(option.price)}\n`;

        }
    );


    message +=
        "\nEnter option number:";


    return message;

}


// ============================================
// NORMALIZE OPTIONS
// ============================================

function normalizeOptions(product) {

    let options =
        product.options;


    if (
        typeof options === "string"
    ) {

        try {

            options =
                JSON.parse(options);

        }

        catch {

            options = null;

        }

    }


    if (
        Array.isArray(options) &&
        options.length
    ) {

        return options.map(
            option => ({

                name:
                    option.name ||
                    option.size ||
                    "Regular",

                price:
                    Number(
                        option.price
                    )

            })
        );

    }


    return [
        {
            name: "Regular",
            price:
                Number(
                    product.price || 0
                )
        }
    ];

}


// ============================================
// CART
// ============================================

function addCartItem(
    product,
    option
) {

    const optionName =
        option.name;


    const existing =
        cart.find(item =>

            String(item.productId) ===
            String(product.id)

            &&

            item.optionName ===
            optionName

        );


    if (existing) {

        existing.quantity += 1;

    }

    else {

        cart.push({

            productId:
                product.id,

            name:
                product.name,

            imageUrl:
                product.image_url || null,

            optionName,

            price:
                Number(option.price),

            quantity: 1

        });

    }


    saveCart();

    updateCartUI();

    showToast(
        `${product.name} added to cart`
    );

}


// ============================================
// CART UI
// ============================================

function updateCartUI() {

    const itemCount =
        cart.reduce(
            (sum, item) =>
                sum + item.quantity,
            0
        );


    const total =
        getCartTotal();


    cartCount.textContent =
        itemCount;


    cartTotal.textContent =
        formatPrice(total);


    checkoutItems.textContent =
        itemCount;


    checkoutTotal.textContent =
        formatPrice(total);


    renderCartItems();


    checkoutButton.disabled =
        cart.length === 0;


    checkoutButton.style.opacity =
        cart.length === 0
            ? "0.5"
            : "1";

}


function renderCartItems() {

    if (!cart.length) {

        cartItems.innerHTML = `

            <div class="cart-empty">

                <div>🛒</div>

                <h3>Your cart is empty</h3>

                <p>
                    Add something delicious!
                </p>

            </div>

        `;

        return;

    }


    cartItems.innerHTML = "";


    cart.forEach(
        (item, index) => {

            const element =
                document.createElement(
                    "div"
                );

            element.className =
                "cart-item";


            const image =
                item.imageUrl

                    ? `
                        <img
                            src="${escapeAttribute(item.imageUrl)}"
                            alt="${escapeAttribute(item.name)}"
                        >
                    `

                    : getCategoryIcon(
                        "Menu"
                    );


            element.innerHTML = `

                <div class="cart-item-image">
                    ${image}
                </div>


                <div>

                    <div class="cart-item-name">
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="cart-item-price">
                        ${escapeHTML(item.optionName)}
                        •
                        ${formatPrice(item.price)}
                    </div>


                    <div class="quantity-controls">

                        <button
                            data-cart-action="decrease"
                            data-index="${index}"
                        >
                            −
                        </button>

                        <strong>
                            ${item.quantity}
                        </strong>

                        <button
                            data-cart-action="increase"
                            data-index="${index}"
                        >
                            +
                        </button>

                        <button
                            data-cart-action="remove"
                            data-index="${index}"
                            title="Remove"
                        >
                            ×
                        </button>

                    </div>

                </div>


                <div class="cart-item-total">

                    ${formatPrice(
                        item.price *
                        item.quantity
                    )}

                </div>

            `;


            cartItems.appendChild(
                element
            );

        }
    );

}


// ============================================
// CART ACTIONS
// ============================================

function handleCartClick(event) {

    const button =
        event.target.closest(
            "[data-cart-action]"
        );

    if (!button) return;


    const index =
        Number(button.dataset.index);


    const action =
        button.dataset.cartAction;


    if (!cart[index]) return;


    if (action === "increase") {

        cart[index].quantity += 1;

    }


    if (action === "decrease") {

        cart[index].quantity -= 1;

        if (
            cart[index].quantity <= 0
        ) {

            cart.splice(index, 1);

        }

    }


    if (action === "remove") {

        cart.splice(index, 1);

    }


    saveCart();

    updateCartUI();

}


function getCartTotal() {

    return cart.reduce(
        (total, item) =>
            total +
            (
                item.price *
                item.quantity
            ),
        0
    );

}


// ============================================
// CART STORAGE
// ============================================

function saveCart() {

    localStorage.setItem(
        "goldenCrustCart",
        JSON.stringify(cart)
    );

}


function loadSavedCart() {

    try {

        cart =
            JSON.parse(
                localStorage.getItem(
                    "goldenCrustCart"
                ) || "[]"
            );

        if (!Array.isArray(cart)) {

            cart = [];

        }

    }

    catch {

        cart = [];

    }

}


// ============================================
// CART DRAWER
// ============================================

function openCart() {

    cartDrawer.classList.add(
        "active"
    );

    cartOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

}


function closeCartDrawer() {

    cartDrawer.classList.remove(
        "active"
    );

    cartOverlay.classList.remove(
        "active"
    );

    document.body.style.overflow =
        "";

}


// ============================================
// CHECKOUT
// ============================================

function openCheckout() {

    if (!cart.length) {

        showToast(
            "Your cart is empty."
        );

        return;

    }


    checkoutModal.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

}


function closeCheckoutModal() {

    checkoutModal.classList.add(
        "hidden"
    );

    document.body.style.overflow =
        "";

}


// ============================================
// SUBMIT ORDER
// ============================================

async function submitOrder(event) {

    event.preventDefault();


    if (!cart.length) {

        showToast(
            "Your cart is empty."
        );

        return;

    }


    const customerName =
        document
            .getElementById(
                "customerName"
            )
            .value
            .trim();


    const customerPhone =
        document
            .getElementById(
                "customerPhone"
            )
            .value
            .trim();


    const customerAddress =
        document
            .getElementById(
                "customerAddress"
            )
            .value
            .trim();


    const customerNotes =
        document
            .getElementById(
                "customerNotes"
            )
            .value
            .trim();


    if (
        !customerName ||
        !customerPhone ||
        !customerAddress
    ) {

        showToast(
            "Please complete all required fields."
        );

        return;

    }


    placeOrderButton.disabled =
        true;

    placeOrderButton.textContent =
        "Placing Order...";


    try {

        const subtotal =
            getCartTotal();


        /*
         * IMPORTANT:
         * The final secure version will
         * calculate prices again on the
         * server/database side.
         *
         * For now this sends the order
         * structure to Supabase.
         */


        const orderData = {

            customer_name:
                customerName,

            phone:
                customerPhone,

            address:
                customerAddress,

            notes:
                customerNotes,

            subtotal:
                subtotal,

            delivery_fee:
                0,

            total:
                subtotal,

            status:
                "new"

        };


        const {
            data: order,
            error: orderError
        } = await supabaseClient
            .from("orders")
            .insert(orderData)
            .select()
            .single();


        if (orderError) {

            throw orderError;

        }


        const orderItems =
            cart.map(item => ({

                order_id:
                    order.id,

                product_id:
                    item.productId,

                product_name:
                    item.name,

                quantity:
                    item.quantity,

                price:
                    item.price,

                customization:
                    item.optionName,

                subtotal:
                    item.price *
                    item.quantity

            }));


        const {
            error: itemsError
        } = await supabaseClient
            .from("order_items")
            .insert(orderItems);


        if (itemsError) {

            throw itemsError;

        }


        const whatsappMessage =
            buildWhatsAppMessage({

                orderId:
                    order.id,

                customerName,

                customerPhone,

                customerAddress,

                customerNotes,

                subtotal

            });


        const whatsappURL =
            `https://wa.me/${BUSINESS_WHATSAPP}` +
            `?text=${encodeURIComponent(
                whatsappMessage
            )}`;


        cart = [];

        saveCart();

        updateCartUI();

        checkoutForm.reset();

        closeCheckoutModal();

        closeCartDrawer();


        showToast(
            "Order placed successfully!"
        );


        setTimeout(() => {

            window.open(
                whatsappURL,
                "_blank"
            );

        }, 700);


    }

    catch (error) {

        console.error(
            "Order error:",
            error
        );


        showToast(
            "Unable to place order. Please try again."
        );

    }

    finally {

        placeOrderButton.disabled =
            false;

        placeOrderButton.textContent =
            "Place Order";

    }

}


// ============================================
// WHATSAPP MESSAGE
// ============================================

function buildWhatsAppMessage(data) {

    let message =
`*NEW GOLDEN CRUST ORDER*

Order #: ${data.orderId}

*Customer*
Name: ${data.customerName}
Phone: ${data.customerPhone}

*Delivery Address*
${data.customerAddress}

*ORDER ITEMS*
`;


    cart.forEach(item => {

        message +=
            `\n• ${item.name}` +
            ` (${item.optionName})` +
            ` x${item.quantity}` +
            ` — ${formatPrice(
                item.price *
                item.quantity
            )}`;

    });


    message +=
`
    
*Subtotal:* ${formatPrice(
    data.subtotal
)}

*Delivery:* FREE

*TOTAL:* ${formatPrice(
    data.subtotal
)}

*Payment:* Cash on Delivery
`;


    if (data.customerNotes) {

        message +=
            `\n*Notes:*\n${data.customerNotes}`;

    }


    message +=
        "\n\nThank you for ordering from The Golden Crust!";


    return message;

}


// ============================================
// THEME
// ============================================

function toggleTheme() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "goldenCrustTheme",
        dark
            ? "dark"
            : "light"
    );


    themeToggle.textContent =
        dark
            ? "☀"
            : "☾";

}


function loadTheme() {

    const saved =
        localStorage.getItem(
            "goldenCrustTheme"
        );


    if (saved === "dark") {

        document.body.classList.add(
            "dark"
        );

        themeToggle.textContent =
            "☀";

    }

}


// ============================================
// LOADING
// ============================================

function showLoading(show) {

    loading.classList.toggle(
        "hidden",
        !show
    );

}


// ============================================
// TOAST
// ============================================

let toastTimer;

function showToast(message) {

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 3000);

}


// ============================================
// FORMATTING
// ============================================

function formatPrice(price) {

    return `Rs. ${Number(price || 0)
        .toLocaleString("en-PK")}`;

}


function getStartingPrice(product) {

    const options =
        normalizeOptions(product);


    if (!options.length) {

        return Number(
            product.price || 0
        );

    }


    return Math.min(
        ...options.map(
            option =>
                Number(option.price)
        )
    );

}


// ============================================
// CATEGORY ICONS
// ============================================

function getCategoryIcon(
    categoryName
) {

    const name =
        String(
            categoryName || ""
        ).toLowerCase();


    if (name.includes("pizza")) {
        return "🍕";
    }

    if (
        name.includes("burger")
    ) {
        return "🍔";
    }

    if (
        name.includes("drink") ||
        name.includes("beverage")
    ) {
        return "🥤";
    }

    if (
        name.includes("chicken")
    ) {
        return "🍗";
    }

    if (
        name.includes("fish")
    ) {
        return "🐟";
    }

    if (
        name.includes("fries") ||
        name.includes("side")
    ) {
        return "🍟";
    }

    if (
        name.includes("pasta")
    ) {
        return "🍝";
    }

    if (
        name.includes("wrap") ||
        name.includes("shawarma")
    ) {
        return "🌯";
    }

    if (
        name.includes("deal") ||
        name.includes("feast")
    ) {
        return "🍱";
    }

    if (
        name.includes("kiddy") ||
        name.includes("kids")
    ) {
        return "🍟";
    }

    return "🍽️";

}


// ============================================
// SECURITY HELPERS
// ============================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => ({

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character])
        );

}


function escapeAttribute(value) {

    return escapeHTML(value);

}
```
