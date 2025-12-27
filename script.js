// Product Data
const products = [
    {
        id: 1,
        name: "Oversized 'VOID' Tee",
        price: 29.99,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 2,
        name: "Graphic Street Tee",
        price: 34.50,
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 3,
        name: "Urban Beige Essential",
        price: 24.99,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600"
    },
    {
        id: 4,
        name: "Retro Neon Vibe",
        price: 32.00,
        image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&q=80&w=600"
    }
];

// App State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let userProfile = JSON.parse(localStorage.getItem('street_user_profile')) || {
    name: '',
    phone: '',
    address: '',
    orders: []
};

// DOM Elements
const productGrid = document.getElementById('product-grid');
const cartSidebar = document.getElementById('cart-sidebar');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.getElementById('cart-count');
const overlay = document.getElementById('overlay');
const checkoutModal = document.getElementById('checkout-modal');
const profileModal = document.getElementById('profile-modal');
const navLinks = document.getElementById('nav-links');

// Init
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();

    // Register Service Worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.error('SW Registration Failed', err));
    }
});

// Render Products
function renderProducts() {
    productGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <div class="product-info">
                <h3>${product.name}</h3>
                <span class="price">$${product.price.toFixed(2)}</span>
                <button class="add-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
            </div>
        </div>
    `).join('');
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showToast(`Added ${product.name} to bag`);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update UI
function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElement.innerText = totalCount;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Your bag is empty.</p>';
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <span class="price">$${item.price.toFixed(2)} x ${item.quantity}</span>
                    <br>
                    <span class="item-remove" onclick="removeFromCart(${item.id})">Remove</span>
                </div>
            </div>
        `).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotalElement.innerText = '$' + total.toFixed(2);
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// UI Toggles
function toggleCart(forceOpen = false) {
    if (forceOpen) {
        cartSidebar.classList.add('open');
        overlay.classList.add('active');
    } else {
        cartSidebar.classList.toggle('open');
        overlay.classList.toggle('active');
    }
}

function toggleMobileMenu() {
    navLinks.classList.toggle('active');
}

// Checkout Logic
function openCheckoutModal() {
    if (cart.length === 0) return showToast("Your cart is empty!", true);
    toggleCart(false);

    // Auto-fill if profile exists
    if (userProfile.name) document.getElementById('customer-name').value = userProfile.name;
    if (userProfile.address) document.getElementById('customer-address').value = userProfile.address;

    checkoutModal.classList.add('active');
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('active');
}

function processWhatsAppCheckout(event) {
    event.preventDefault();

    const name = document.getElementById('customer-name').value;
    const address = document.getElementById('customer-address').value;
    const phoneNumber = "+91 9443656854";

    // Save Logic (Update Profile if new info provided)
    if (name && address) {
        userProfile.name = name;
        userProfile.address = address;
        // Don't overwrite phone if not asked here, but we could add it
    }

    // Construct Message
    let message = `*New Order Request from STREET*\n\n`;
    message += `*Customer:* ${name}\n`;
    message += `*Address:* ${address}\n\n`;
    message += `*Order Details:*\n`;

    cart.forEach(item => {
        message += `- ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total Amount:* $${total.toFixed(2)}`;

    // Add to Order History
    const newOrder = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        items: cart,
        total: total
    };
    userProfile.orders.unshift(newOrder); // Add to top
    saveProfileData();

    // Redirect
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    cart = [];
    saveCart();
    updateCartUI();
    closeCheckoutModal();
    showToast("Redirecting to WhatsApp...");
}

// User Profile System
function openProfileModal() {
    profileModal.classList.add('active');

    // Fill data
    document.getElementById('profile-name').value = userProfile.name || '';
    document.getElementById('profile-phone').value = userProfile.phone || '';
    document.getElementById('profile-address').value = userProfile.address || '';

    renderOrderHistory();
}

function closeProfileModal() {
    profileModal.classList.remove('active');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    // Find button that triggered it - simplified:
    const buttons = document.querySelectorAll('.tab-btn');
    if (tabName === 'details') buttons[0].classList.add('active');
    else buttons[1].classList.add('active');
}

function saveProfile(event) {
    event.preventDefault();
    userProfile.name = document.getElementById('profile-name').value;
    userProfile.phone = document.getElementById('profile-phone').value;
    userProfile.address = document.getElementById('profile-address').value;

    saveProfileData();
    showToast("Profile Saved!");
    closeProfileModal();
}

function saveProfileData() {
    localStorage.setItem('street_user_profile', JSON.stringify(userProfile));
}

function renderOrderHistory() {
    const container = document.getElementById('order-history-list');
    if (userProfile.orders.length === 0) {
        container.innerHTML = '<p class="empty-msg">No past orders found.</p>';
        return;
    }

    container.innerHTML = userProfile.orders.map(order => `
        <div class="order-history-item">
            <span class="order-date">${order.date}</span>
            <div class="order-summary">
                ${order.items.length} Items
                <span class="order-total">$${order.total.toFixed(2)}</span>
            </div>
        </div>
    `).join('');
}

// Toast Notification
function showToast(message, isError = false) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.borderColor = isError ? 'red' : 'var(--accent-color)';
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-circle-exclamation' : 'fa-check'}"></i> ${message}`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
