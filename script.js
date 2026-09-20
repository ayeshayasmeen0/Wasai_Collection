// ================= INITIAL DATA STORE =================
let products = JSON.parse(localStorage.getItem('wasai_products')) || [];
let orders = JSON.parse(localStorage.getItem('wasai_orders')) || [];
let cart = JSON.parse(localStorage.getItem('wasai_cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wasai_wishlist')) || [];
let currentUser = JSON.parse(localStorage.getItem('wasai_current_user')) || null;
let users = JSON.parse(localStorage.getItem('wasai_users')) || [];
let activityLog = JSON.parse(localStorage.getItem('wasai_activity')) || [];
let isAdminLoggedIn = false;

// ================= SAVE DATA =================
function saveData() {
    try {
        localStorage.setItem('wasai_products', JSON.stringify(products));
        localStorage.setItem('wasai_orders', JSON.stringify(orders));
        localStorage.setItem('wasai_cart', JSON.stringify(cart));
        localStorage.setItem('wasai_wishlist', JSON.stringify(wishlist));
        localStorage.setItem('wasai_current_user', JSON.stringify(currentUser));
        localStorage.setItem('wasai_users', JSON.stringify(users));
        localStorage.setItem('wasai_activity', JSON.stringify(activityLog));
    } catch (e) {
        console.error('Storage error:', e);
        showToast('Storage full! Try smaller images.', 'error');
    }
}

// ================= ACTIVITY LOGGING =================
function logActivity(action, details) {
    const userName = currentUser ? (currentUser.name || currentUser.email || 'Guest') : 'Guest';
    activityLog.unshift({
        time: new Date().toLocaleString(),
        user: userName,
        action: action,
        details: details
    });
    if (activityLog.length > 100) activityLog = activityLog.slice(0, 100);
    saveData();
}

// ================= TOAST =================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.success}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ================= CONFIRMATION POPUP =================
function showConfirmPopup(title, message, onConfirm) {
    const popup = document.getElementById('confirm-popup-modal');
    if (!popup) return;
    
    document.getElementById('confirm-popup-title').innerText = title;
    document.getElementById('confirm-popup-message').innerText = message;

    const confirmBtn = document.getElementById('confirm-popup-yes');
    const cancelBtn = document.getElementById('confirm-popup-no');

    const newConfirmBtn = confirmBtn.cloneNode(true);
    const newCancelBtn = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

    newConfirmBtn.addEventListener('click', () => {
        popup.classList.remove('active');
        if (onConfirm) onConfirm();
    });

    newCancelBtn.addEventListener('click', () => {
        popup.classList.remove('active');
    });

    popup.classList.add('active');
}

// ================= IMAGE FILE TO BASE64 =================
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ================= DOM READY =================
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) splash.classList.add('fade-out');
    }, 5000);

    renderHomeCategories();
    renderFeaturedProducts();
    updateBadges();
    updateUserDot();
    initEventListeners();
    initCharts();
});

// ================= CATEGORIES LIST =================
const CATEGORIES = [
    { name: 'Beaded Bags', icon: 'fa-shopping-bag', color: '#ff758c' },
    { name: 'Kids Bags', icon: 'fa-child', color: '#ffb3c6' },
    { name: 'Bracelets', icon: 'fa-ring', color: '#c77dff' },
    { name: 'Keychains', icon: 'fa-key', color: '#7b2cbf' },
    { name: 'Money Pouch', icon: 'fa-coins', color: '#ff9a76' },
    { name: 'Mobile Pouch', icon: 'fa-mobile-alt', color: '#ffcbf2' }
];

// ================= RENDER HOME CATEGORIES =================
function renderHomeCategories() {
    const grid = document.getElementById('home-categories-grid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES.map(c => {
        const count = products.filter(p => p.category === c.name).length;
        return `
            <div class="cat-card" onclick="filterByCategory('${c.name}')">
                <div class="cat-icon" style="background: ${c.color}20; color: ${c.color};">
                    <i class="fas ${c.icon}"></i>
                </div>
                <h3>${c.name}</h3>
                <p>${count} items</p>
            </div>
        `;
    }).join('');
}

// ================= RENDER FEATURED PRODUCTS =================
function renderFeaturedProducts(filteredList = products) {
    const grid = document.getElementById('featured-products-grid');
    if (!grid) return;

    if (filteredList.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-box-open" style="font-size: 3.5rem; color: var(--border-color); margin-bottom: 20px; display: block;"></i>
                <h3 style="color: var(--dark-text); margin-bottom: 8px;">No Products Yet</h3>
                <p style="color: var(--gray-text);">Products will appear here once added ✨</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredList.map(p => {
        const isWishlisted = wishlist.some(item => String(item.id) === String(p.id));
        return `
            <div class="product-card">
                <div class="product-img-box" onclick="viewProductDetail('${p.id}')" style="cursor:pointer;">
                    <img src="${p.image}" alt="${p.name}" onerror="this.src='images/backgrounds/hero.jpg'">
                    <button class="wishlist-toggle-btn ${isWishlisted ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${p.id}')">
                        <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
                <div class="product-info">
                    <span class="product-cat">${p.category}</span>
                    <h3 class="product-title">${p.name}</h3>
                    <div class="product-footer">
                        <span class="product-price">Rs. ${p.price.toLocaleString()}</span>
                        <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); addToCart('${p.id}')"><i class="fas fa-shopping-bag"></i> Add</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByCategory(cat) {
    const filtered = products.filter(p => p.category === cat);
    renderFeaturedProducts(filtered);
    
    // Update active chip
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    const chip = document.querySelector(`.filter-chip[data-filter="${cat}"]`);
    if (chip) chip.classList.add('active');
    
    document.getElementById('products-section-anchor').scrollIntoView({ behavior: 'smooth' });
}

// ================= EVENT LISTENERS =================
function initEventListeners() {
    // Mobile Menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            document.getElementById('nav-links-list').classList.toggle('mobile-open');
        });
    }

    // Filter Chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            const filter = chip.dataset.filter;
            if (filter === 'all') renderFeaturedProducts(products);
            else renderFeaturedProducts(products.filter(p => p.category === filter));
        });
    });

    // Search
    const searchTrigger = document.getElementById('search-trigger-btn');
    if (searchTrigger) searchTrigger.addEventListener('click', () => document.getElementById('search-modal').classList.add('active'));
    
    const closeSearch = document.getElementById('close-search-btn');
    if (closeSearch) closeSearch.addEventListener('click', () => document.getElementById('search-modal').classList.remove('active'));
    
    const searchInput = document.getElementById('live-search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const results = products.filter(p => p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query));
            const container = document.getElementById('search-results-container');
            if (results.length === 0) {
                container.innerHTML = `<p style="text-align:center; color:var(--gray-text); padding:20px;">No products found.</p>`;
                return;
            }
            container.innerHTML = results.map(p => `
                <div class="search-result-item" onclick="viewProductDetail('${p.id}')">
                    <img src="${p.image}" onerror="this.src='images/backgrounds/hero.jpg'">
                    <div>
                        <h4 style="font-size:0.95rem;">${p.name}</h4>
                        <span style="color:var(--secondary-pink); font-weight:600;">Rs. ${p.price.toLocaleString()}</span>
                    </div>
                </div>
            `).join('');
        });
    }

    // User Auth
    const userLoginTrigger = document.getElementById('user-login-trigger');
    if (userLoginTrigger) {
        userLoginTrigger.addEventListener('click', () => {
            if (currentUser) openUserProfile();
            else document.getElementById('user-auth-modal').classList.add('active');
        });
    }
    
    const closeAuthModal = document.getElementById('close-auth-modal');
    if (closeAuthModal) closeAuthModal.addEventListener('click', () => document.getElementById('user-auth-modal').classList.remove('active'));
    
    const closeProfileModal = document.getElementById('close-profile-modal');
    if (closeProfileModal) closeProfileModal.addEventListener('click', () => document.getElementById('user-profile-modal').classList.remove('active'));

    document.querySelectorAll('.auth-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.auth-form-pane').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            document.getElementById(e.target.dataset.tab).classList.add('active');
        });
    });

    // Signup
    const signupForm = document.getElementById('user-signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const pass = document.getElementById('signup-pass').value;

            if (users.find(u => u.email === email)) {
                showToast('Account already exists! Please login.', 'error');
                return;
            }

            currentUser = { name, email, password: pass, joined: new Date().toISOString().split('T')[0] };
            users.push(currentUser);
            saveData();
            updateUserDot();
            logActivity('Sign Up', `New user: ${name}`);
            showToast('Account created successfully! 🎉', 'success');
            document.getElementById('user-auth-modal').classList.remove('active');
        });
    }

    // Login
    const loginForm = document.getElementById('user-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const pass = document.getElementById('login-pass').value;
            const user = users.find(u => u.email === email && u.password === pass);
            
            if (!user) {
                showToast('Invalid credentials! Please try again.', 'error');
                return;
            }

            currentUser = user;
            saveData();
            updateUserDot();
            logActivity('Login', `User logged in: ${user.name}`);
            showToast(`Welcome back, ${user.name}! 🌸`, 'success');
            document.getElementById('user-auth-modal').classList.remove('active');
        });
    }

    // User Logout
    const userLogoutBtn = document.getElementById('user-logout-btn');
    if (userLogoutBtn) {
        userLogoutBtn.addEventListener('click', () => {
            logActivity('Logout', `User logged out: ${currentUser?.name || 'Unknown'}`);
            currentUser = null;
            saveData();
            updateUserDot();
            document.getElementById('user-profile-modal').classList.remove('active');
            showToast('Logged out successfully.', 'info');
        });
    }

    // Cart & Wishlist Drawers
    const cartBtn = document.getElementById('cart-drawer-btn');
    if (cartBtn) cartBtn.addEventListener('click', () => { renderCart(); document.getElementById('cart-drawer').classList.add('active'); });
    
    const closeCart = document.getElementById('close-cart-drawer');
    if (closeCart) closeCart.addEventListener('click', () => document.getElementById('cart-drawer').classList.remove('active'));
    
    const wishBtn = document.getElementById('wishlist-drawer-btn');
    if (wishBtn) wishBtn.addEventListener('click', () => { renderWishlist(); document.getElementById('wishlist-drawer').classList.add('active'); });
    
    const closeWish = document.getElementById('close-wishlist-drawer');
    if (closeWish) closeWish.addEventListener('click', () => document.getElementById('wishlist-drawer').classList.remove('active'));

    // Hero Buttons
    const shopNow = document.getElementById('hero-shop-now');
    if (shopNow) shopNow.addEventListener('click', () => document.getElementById('products-section-anchor').scrollIntoView({ behavior: 'smooth' }));
    
    const explore = document.getElementById('hero-explore');
    if (explore) explore.addEventListener('click', () => document.getElementById('categories-section-anchor').scrollIntoView({ behavior: 'smooth' }));

    // Footer Category Links
    document.querySelectorAll('.footer-cat-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            filterByCategory(link.dataset.cat);
        });
    });

    // Contact Form
    const contactForm = document.getElementById('frontend-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('contact-name').value;
            showToast(`Thank you ${name}! We'll get back to you soon. 💌`, 'success');
            e.target.reset();
        });
    }

    // ================= ADMIN LOGIN =================
    const adminTrigger = document.getElementById('admin-login-trigger');
    if (adminTrigger) adminTrigger.addEventListener('click', () => document.getElementById('admin-login-modal').classList.add('active'));
    
    const closeAdminLogin = document.getElementById('close-admin-login');
    if (closeAdminLogin) closeAdminLogin.addEventListener('click', () => document.getElementById('admin-login-modal').classList.remove('active'));

    const adminSubmit = document.getElementById('admin-login-submit');
    if (adminSubmit) {
        adminSubmit.addEventListener('click', () => {
            const pass = document.getElementById('admin-passcode-input').value;
            if (pass === 'wasai123' || pass === 'admin') {
                isAdminLoggedIn = true;
                document.getElementById('admin-login-modal').classList.remove('active');
                document.getElementById('admin-dashboard-modal').classList.add('active');
                document.getElementById('admin-passcode-input').value = '';
                renderAllAdminData();
                showToast('Welcome to Admin Dashboard! 👑', 'success');
            } else {
                showToast('Incorrect passcode! Try wasai123', 'error');
            }
        });
    }

    // Admin Dashboard Close
    const closeAdminDashboard = document.getElementById('close-admin-dashboard');
    if (closeAdminDashboard) closeAdminDashboard.addEventListener('click', closeAdminDashboardFn);
    
    const adminLogoutBtn = document.getElementById('admin-logout-btn');
    if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', closeAdminDashboardFn);

    // Admin Sidebar Tabs
    document.querySelectorAll('.admin-menu-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.admin-menu-link').forEach(l => l.classList.remove('active'));
            document.querySelectorAll('.admin-tab-pane').forEach(p => p.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(link.dataset.target).classList.add('active');
            document.getElementById('admin-current-title').innerText = link.innerText.trim();
            renderAllAdminData();
        });
    });

    // ================= ADD NEW PRODUCT BUTTON =================
    const addProductBtn = document.getElementById('open-add-product-modal');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            document.getElementById('admin-product-save-form').reset();
            document.getElementById('edit-product-id').value = '';
            document.getElementById('admin-form-modal-title').innerText = 'Add New Product';
            document.getElementById('image-preview-box').style.display = 'none';
            document.getElementById('admin-product-form-modal').classList.add('active');
        });
    }
    
    const closeAdminFormModal = document.getElementById('close-admin-form-modal');
    if (closeAdminFormModal) closeAdminFormModal.addEventListener('click', () => document.getElementById('admin-product-form-modal').classList.remove('active'));

    // ================= IMAGE PREVIEW =================
    const imageFileInput = document.getElementById('prod-image-file');
    if (imageFileInput) {
        imageFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                const base64 = await fileToBase64(file);
                document.getElementById('image-preview').src = base64;
                document.getElementById('image-preview-box').style.display = 'block';
            }
        });
    }

    const imageUrlInput = document.getElementById('prod-image-url');
    if (imageUrlInput) {
        imageUrlInput.addEventListener('input', (e) => {
            if (e.target.value) {
                document.getElementById('image-preview').src = e.target.value;
                document.getElementById('image-preview-box').style.display = 'block';
            } else {
                document.getElementById('image-preview-box').style.display = 'none';
            }
        });
    }

    // ================= SAVE PRODUCT FORM =================
    const saveProductForm = document.getElementById('admin-product-save-form');
    if (saveProductForm) {
        saveProductForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('edit-product-id').value;
            const name = document.getElementById('prod-name').value;
            const category = document.getElementById('prod-category').value;
            const price = Number(document.getElementById('prod-price').value);
            const stock = Number(document.getElementById('prod-stock').value);
            const desc = document.getElementById('prod-desc').value;
            const urlInput = document.getElementById('prod-image-url').value;
            const fileInput = document.getElementById('prod-image-file').files[0];

            // Determine image path - use base64 for file upload so it persists
            let imagePath = 'images/backgrounds/hero.jpg';
            
            if (fileInput) {
                // Convert file to base64 (works everywhere, no path issues)
                try {
                    imagePath = await fileToBase64(fileInput);
                } catch (err) {
                    showToast('Image upload failed!', 'error');
                    return;
                }
            } else if (urlInput) {
                imagePath = urlInput;
            } else if (id) {
                // Keep existing image if editing without new image
                const existing = products.find(item => String(item.id) === String(id));
                if (existing) imagePath = existing.image;
            }

            if (id) {
                // Edit existing
                const p = products.find(item => String(item.id) === String(id));
                if (p) {
                    p.name = name; 
                    p.category = category; 
                    p.price = price; 
                    p.stock = stock; 
                    p.desc = desc;
                    p.image = imagePath;
                }
                logActivity('Edit Product', `Updated: ${name}`);
                showToast('Product updated successfully! ✨', 'success');
            } else {
                // Add new
                products.push({ 
                    id: Date.now(), 
                    name, 
                    category, 
                    price, 
                    stock, 
                    desc, 
                    image: imagePath,
                    createdAt: new Date().toISOString()
                });
                logActivity('Add Product', `New product: ${name} (Rs. ${price})`);
                showToast('Product added successfully! 🎀', 'success');
            }

            saveData();
            document.getElementById('admin-product-form-modal').classList.remove('active');
            renderAllAdminData();
            renderFeaturedProducts();
            renderHomeCategories();
        });
    }

    // Clear Activity Log
    const clearLogBtn = document.getElementById('clear-activity-log');
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', () => {
            showConfirmPopup('Clear Activity Log', 'Are you sure you want to clear all activity logs?', () => {
                activityLog = [];
                saveData();
                renderAdminActivity();
                showToast('Activity log cleared.', 'info');
            });
        });
    }

    // Checkout
    const proceedBtn = document.getElementById('proceed-to-checkout-btn');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', () => {
            if (cart.length === 0) { showToast('Your cart is empty!', 'error'); return; }
            document.getElementById('cart-drawer').classList.remove('active');
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            document.getElementById('chk-items-total').innerText = 'Rs. ' + subtotal.toLocaleString();
            document.getElementById('chk-final-total').innerText = 'Rs. ' + (subtotal + 200).toLocaleString();
            if (currentUser) {
                document.getElementById('chk-name').value = currentUser.name || '';
                document.getElementById('chk-phone').value = currentUser.email || '';
            }
            document.getElementById('checkout-modal').classList.add('active');
        });
    }

    const closeCheckout = document.getElementById('close-checkout-btn');
    if (closeCheckout) closeCheckout.addEventListener('click', () => document.getElementById('checkout-modal').classList.remove('active'));

    // Place Order
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const orderId = 'WSC-2026-' + Math.floor(10000 + Math.random() * 90000);

            const newOrder = {
                id: orderId,
                customerName: document.getElementById('chk-name').value,
                phone: document.getElementById('chk-phone').value,
                whatsapp: document.getElementById('chk-whatsapp').value,
                city: document.getElementById('chk-city').value,
                address: document.getElementById('chk-address').value,
                items: [...cart],
                total: subtotal + 200,
                status: 'Pending',
                date: new Date().toISOString().split('T')[0],
                userEmail: currentUser ? currentUser.email : 'Guest'
            };

            orders.unshift(newOrder);
            logActivity('Place Order', `Order ${orderId} - Rs. ${newOrder.total}`);
            cart = [];
            saveData();
            updateBadges();
            if (isAdminLoggedIn) renderAllAdminData();

            document.getElementById('checkout-modal').classList.remove('active');
            document.getElementById('success-order-id').innerText = orderId;
            document.getElementById('whatsapp-order-btn').href = `https://wa.me/923167428920?text=Hello%20Wasai%20Collection,%20my%20Order%20ID%20is%20${orderId}.%20Total:%20Rs.${newOrder.total}`;
            document.getElementById('order-success-modal').classList.add('active');
            document.getElementById('checkout-form').reset();
        });
    }

    const closeSuccess = document.getElementById('close-success-modal-btn');
    if (closeSuccess) closeSuccess.addEventListener('click', () => document.getElementById('order-success-modal').classList.remove('active'));
}

function closeAdminDashboardFn() {
    isAdminLoggedIn = false;
    document.getElementById('admin-dashboard-modal').classList.remove('active');
    showToast('Admin session ended.', 'info');
}

function updateUserDot() {
    const dot = document.getElementById('user-dot');
    if (dot) dot.style.display = currentUser ? 'block' : 'none';
}

// ================= USER PROFILE =================
function openUserProfile() {
    if (!currentUser) return;
    document.getElementById('profile-name').innerText = currentUser.name || 'User';
    document.getElementById('profile-email').innerText = currentUser.email || '';
    
    const userOrders = orders.filter(o => o.userEmail === currentUser.email);
    document.getElementById('profile-orders-count').innerText = userOrders.length;
    document.getElementById('profile-wishlist-count').innerText = wishlist.length;
    document.getElementById('profile-cart-count').innerText = cart.reduce((s, i) => s + i.qty, 0);

    const container = document.getElementById('profile-orders-container');
    if (userOrders.length === 0) {
        container.innerHTML = `<p style="color:var(--gray-text); font-size:0.9rem;">No orders yet. Start shopping! 🛍️</p>`;
    } else {
        container.innerHTML = userOrders.slice(0, 5).map(o => `
            <div class="profile-order-item">
                <strong>${o.id}</strong> - Rs. ${o.total.toLocaleString()} <span style="color:var(--gray-text);">(${o.status})</span>
            </div>
        `).join('');
    }

    document.getElementById('user-profile-modal').classList.add('active');
}

// ================= CART & WISHLIST =================
function addToCart(productId) {
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) { showToast('Product not found!', 'error'); return; }
    if (product.stock <= 0) { showToast('Out of stock!', 'error'); return; }

    const existing = cart.find(item => String(item.id) === String(productId));
    if (existing) existing.qty += 1;
    else cart.push({ ...product, qty: 1 });

    saveData();
    updateBadges();
    logActivity('Add to Cart', `Added: ${product.name}`);
    showToast(`${product.name} added to cart! 🛍️`, 'success');
}

function toggleWishlist(productId) {
    const index = wishlist.findIndex(item => String(item.id) === String(productId));
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) return;
    
    if (index > -1) {
        wishlist.splice(index, 1);
        logActivity('Remove Wishlist', `Removed: ${product.name}`);
        showToast('Removed from wishlist.', 'info');
    } else {
        wishlist.push(product);
        logActivity('Add Wishlist', `Added: ${product.name}`);
        showToast('Added to wishlist! 💕', 'success');
    }
    saveData();
    updateBadges();
    renderFeaturedProducts();
}

function updateBadges() {
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const cartEl = document.getElementById('cart-count');
    const wishEl = document.getElementById('wishlist-count');
    if (cartEl) cartEl.innerText = cartCount;
    if (wishEl) wishEl.innerText = wishlist.length;
}

function renderCart() {
    const container = document.getElementById('cart-drawer-items');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 0;"><i class="fas fa-shopping-bag" style="font-size:3rem; color:var(--border-color); margin-bottom:15px; display:block;"></i><p style="color:var(--gray-text);">Your cart is empty.</p></div>`;
        document.getElementById('cart-drawer-subtotal').innerText = 'Rs. 0';
        return;
    }

    container.innerHTML = cart.map(item => `
        <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px;">
            <img src="${item.image}" style="width:65px; height:65px; object-fit:cover; border-radius:10px;" onerror="this.src='images/backgrounds/hero.jpg'">
            <div style="flex-grow:1;">
                <h4 style="font-size:0.92rem; margin-bottom:3px;">${item.name}</h4>
                <p style="color:var(--secondary-pink); font-weight:600; font-size:0.9rem;">Rs. ${item.price.toLocaleString()} × ${item.qty}</p>
                <div style="display:flex; gap:8px; margin-top:6px; align-items:center;">
                    <button onclick="changeQty('${item.id}', -1)" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:white;cursor:pointer;">−</button>
                    <span style="font-size:0.85rem;">${item.qty}</span>
                    <button onclick="changeQty('${item.id}', 1)" style="width:24px;height:24px;border-radius:50%;border:1px solid var(--border-color);background:white;cursor:pointer;">+</button>
                </div>
            </div>
            <button onclick="removeFromCart('${item.id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1rem;"><i class="fas fa-trash"></i></button>
        </div>
    `).join('');

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    document.getElementById('cart-drawer-subtotal').innerText = 'Rs. ' + subtotal.toLocaleString();
}

function changeQty(id, delta) {
    const item = cart.find(i => String(i.id) === String(id));
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) { removeFromCart(id); return; }
    saveData();
    renderCart();
    updateBadges();
}

function removeFromCart(id) {
    const item = cart.find(i => String(i.id) === String(id));
    cart = cart.filter(item => String(item.id) !== String(id));
    saveData();
    renderCart();
    updateBadges();
    if (item) logActivity('Remove Cart', `Removed: ${item.name}`);
}

function renderWishlist() {
    const container = document.getElementById('wishlist-drawer-items');
    if (!container) return;
    if (wishlist.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:40px 0;"><i class="far fa-heart" style="font-size:3rem; color:var(--border-color); margin-bottom:15px; display:block;"></i><p style="color:var(--gray-text);">Your wishlist is empty.</p></div>`;
        return;
    }
    container.innerHTML = wishlist.map(item => `
        <div style="display:flex; gap:15px; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px;">
            <img src="${item.image}" style="width:65px; height:65px; object-fit:cover; border-radius:10px;" onerror="this.src='images/backgrounds/hero.jpg'">
            <div style="flex-grow:1;">
                <h4 style="font-size:0.92rem;">${item.name}</h4>
                <p style="color:var(--secondary-pink); font-weight:600; font-size:0.9rem;">Rs. ${item.price.toLocaleString()}</p>
            </div>
            <button onclick="addToCart('${item.id}'); toggleWishlist('${item.id}'); renderWishlist();" class="btn btn-primary btn-sm">Move</button>
        </div>
    `).join('');
}

// ================= ADMIN DASHBOARD =================
function renderAllAdminData() {
    if (!isAdminLoggedIn) return;
    renderAdminStats();
    renderAdminRecentOrders();
    renderAdminProducts();
    renderAdminOrders();
    renderAdminUsers();
    renderAdminActivity();
    updateAdminTime();
    updateCharts();
}

function renderAdminStats() {
    const el = (id, val) => { const e = document.getElementById(id); if (e) e.innerText = val; };
    el('stat-total-products', products.length);
    el('stat-total-orders', orders.length);
    const totalRev = orders.reduce((sum, o) => sum + o.total, 0);
    el('stat-total-revenue', 'Rs. ' + totalRev.toLocaleString());
    el('stat-total-customers', new Set(orders.map(o => o.phone)).size);
}

function renderAdminRecentOrders() {
    const tbody = document.getElementById('admin-recent-orders-tbody');
    if (!tbody) return;
    if (orders.length === 0) { tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--gray-text);">No orders yet.</td></tr>'; return; }
    tbody.innerHTML = orders.slice(0, 5).map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}</td>
            <td>Rs. ${o.total.toLocaleString()}</td>
            <td><span class="status-badge ${o.status.toLowerCase()}">${o.status}</span></td>
            <td>${o.date || 'N/A'}</td>
        </tr>
    `).join('');
}

// ================= ADMIN PRODUCTS TABLE =================
function renderAdminProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:50px 20px;">
                    <i class="fas fa-box-open" style="font-size:2.5rem; color:var(--border-color); display:block; margin-bottom:15px;"></i>
                    <p style="color:var(--gray-text); font-size:0.95rem;">No products yet.</p>
                    <p style="color:var(--secondary-pink); font-weight:600; font-size:0.9rem; margin-top:5px;">Click "Add New Product" to get started ✨</p>
                </td>
            </tr>
        `;
        return;
    }
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><img src="${p.image}" onerror="this.src='images/backgrounds/hero.jpg'" style="width:55px;height:55px;object-fit:cover;border-radius:10px;"></td>
            <td><strong>${p.name}</strong><br><small style="color:var(--gray-text); font-size:0.78rem;">${(p.desc || '').substring(0, 40)}${(p.desc || '').length > 40 ? '...' : ''}</small></td>
            <td><span class="cat-pill">${p.category}</span></td>
            <td><strong>Rs. ${p.price.toLocaleString()}</strong></td>
            <td><span class="stock-pill ${p.stock < 5 ? 'low' : ''}">${p.stock}</span></td>
            <td>
                <div class="action-btns">
                    <button class="action-btn edit-btn" data-edit-id="${p.id}" title="Edit Product"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" data-delete-id="${p.id}" title="Delete Product"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    // Attach listeners
    tbody.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editProduct(btn.dataset.editId));
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteProduct(btn.dataset.deleteId));
    });
}

// ================= ADMIN ORDERS TABLE =================
function renderAdminOrders() {
    const tbody = document.getElementById('admin-orders-tbody');
    if (!tbody) return;
    if (orders.length === 0) { tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--gray-text);">No orders yet.</td></tr>'; return; }
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td><strong>${o.id}</strong></td>
            <td>${o.customerName}<br><small style="color:var(--gray-text);">${o.phone}</small></td>
            <td style="max-width:200px; font-size:0.82rem;">${o.address}</td>
            <td style="font-size:0.82rem;">${o.items.map(i => `${i.name} (×${i.qty})`).join('<br>')}</td>
            <td><strong>Rs. ${o.total.toLocaleString()}</strong></td>
            <td>
                <select class="status-select" data-order-id="${o.id}">
                    <option ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
                    <option ${o.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td><button class="action-btn delete-btn" data-delete-order="${o.id}" title="Delete Order"><i class="fas fa-trash"></i></button></td>
        </tr>
    `).join('');

    tbody.querySelectorAll('.status-select').forEach(sel => {
        sel.addEventListener('change', () => updateOrderStatus(sel.dataset.orderId, sel.value));
    });

    tbody.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteOrder(btn.dataset.deleteOrder));
    });
}

function updateOrderStatus(orderId, newStatus) {
    const order = orders.find(o => String(o.id) === String(orderId));
    if (order) {
        order.status = newStatus;
        saveData();
        renderAdminStats();
        renderAdminRecentOrders();
        logActivity('Update Order', `${orderId} → ${newStatus}`);
        showToast(`Order ${orderId} marked as ${newStatus}`, 'success');
    }
}

function deleteOrder(orderId) {
    showConfirmPopup('Delete Order', `Are you sure you want to permanently delete order ${orderId}? This action cannot be undone.`, () => {
        orders = orders.filter(o => String(o.id) !== String(orderId));
        saveData();
        renderAllAdminData();
        logActivity('Delete Order', `Deleted order: ${orderId}`);
        showToast('Order deleted successfully.', 'info');
    });
}

function renderAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;
    if (users.length === 0) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--gray-text);">No registered users yet.</td></tr>'; return; }
    tbody.innerHTML = users.map(u => {
        const userOrders = orders.filter(o => o.userEmail === u.email).length;
        return `
            <tr>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td><span class="cat-pill">${cart.length} items</span></td>
                <td><span class="cat-pill">${wishlist.length} items</span></td>
                <td><strong>${userOrders}</strong></td>
                <td>${u.joined || 'N/A'}</td>
            </tr>
        `;
    }).join('');
}

function renderAdminActivity() {
    const tbody = document.getElementById('admin-activity-tbody');
    if (!tbody) return;
    if (activityLog.length === 0) { tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--gray-text);">No activity recorded yet.</td></tr>'; return; }
    tbody.innerHTML = activityLog.slice(0, 50).map(a => `
        <tr>
            <td style="font-size:0.82rem; color:var(--gray-text); white-space:nowrap;">${a.time}</td>
            <td><strong>${a.user}</strong></td>
            <td><span class="action-pill">${a.action}</span></td>
            <td style="font-size:0.85rem;">${a.details}</td>
        </tr>
    `).join('');
}

function updateAdminTime() {
    const el = document.getElementById('admin-current-time');
    if (el) el.innerText = new Date().toLocaleString();
}

function editProduct(id) {
    const p = products.find(item => String(item.id) === String(id));
    if (!p) {
        showToast('Product not found! Please refresh.', 'error');
        return;
    }
    
    // Direct open edit form (no confirmation popup)
    document.getElementById('edit-product-id').value = p.id;
    document.getElementById('prod-name').value = p.name;
    document.getElementById('prod-category').value = p.category;
    document.getElementById('prod-price').value = p.price;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('prod-desc').value = p.desc || '';
    document.getElementById('prod-image-url').value = p.image.startsWith('data:') ? '' : p.image;
    document.getElementById('image-preview').src = p.image;
    document.getElementById('image-preview-box').style.display = 'block';
    document.getElementById('admin-form-modal-title').innerText = 'Edit Product';
    document.getElementById('admin-product-form-modal').classList.add('active');
}

function deleteProduct(id) {
    const p = products.find(item => String(item.id) === String(id));
    if (!p) {
        showToast('Product not found! Please refresh.', 'error');
        return;
    }
    
    showConfirmPopup(
        'Delete Product',
        `Are you sure you want to delete "${p.name}"? This action cannot be undone.`,
        () => {
            products = products.filter(item => String(item.id) !== String(id));
            saveData();
            renderAllAdminData();
            renderFeaturedProducts();
            renderHomeCategories();
            logActivity('Delete Product', `Deleted: ${p.name}`);
            showToast(`"${p.name}" deleted successfully.`, 'info');
        }
    );
}

// ================= CHARTS =================
let salesChartInstance = null;
let categoryChartInstance = null;
let statusChartInstance = null;
let topProductsChartInstance = null;

function initCharts() {
    updateCharts();
}

function updateCharts() {
    const salesCtx = document.getElementById('salesChart');
    const categoryCtx = document.getElementById('categoryChart');
    const statusCtx = document.getElementById('statusChart');
    const topProdCtx = document.getElementById('topProductsChart');
    if (!salesCtx || !categoryCtx) return;

    if (salesChartInstance) salesChartInstance.destroy();
    if (categoryChartInstance) categoryChartInstance.destroy();
    if (statusChartInstance) statusChartInstance.destroy();
    if (topProductsChartInstance) topProductsChartInstance.destroy();

    salesChartInstance = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Revenue (Rs.)',
                data: [1200, 2400, 1800, 3500],
                borderColor: '#ff758c',
                backgroundColor: 'rgba(255,117,140,0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    const catCounts = {};
    products.forEach(p => { catCounts[p.category] = (catCounts[p.category] || 0) + 1; });
    categoryChartInstance = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(catCounts),
            datasets: [{
                data: Object.values(catCounts),
                backgroundColor: ['#ff758c', '#ffb3c6', '#ffcbf2', '#c77dff', '#7b2cbf', '#ff9a76']
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    if (statusCtx) {
        const statusCounts = {};
        orders.forEach(o => { statusCounts[o.status] = (statusCounts[o.status] || 0) + 1; });
        statusChartInstance = new Chart(statusCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(statusCounts),
                datasets: [{
                    label: 'Orders',
                    data: Object.values(statusCounts),
                    backgroundColor: ['#ed8936', '#3182ce', '#38a169', '#e53e3e']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    if (topProdCtx) {
        const productSales = {};
        orders.forEach(o => {
            o.items.forEach(item => {
                productSales[item.name] = (productSales[item.name] || 0) + item.qty;
            });
        });
        const sorted = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);
        topProductsChartInstance = new Chart(topProdCtx, {
            type: 'bar',
            data: {
                labels: sorted.map(s => s[0]),
                datasets: [{
                    label: 'Units Sold',
                    data: sorted.map(s => s[1]),
                    backgroundColor: '#ff758c'
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y' }
        });
    }
}

// ================= PRODUCT DETAIL VIEW =================
function viewProductDetail(id) {
    const p = products.find(item => String(item.id) === String(id));
    if (!p) return;
    const modal = document.getElementById('product-modal-content-box');
    modal.innerHTML = `
        <button class="close-modal-btn" onclick="document.getElementById('product-modal').classList.remove('active')"><i class="fas fa-times"></i></button>
        <div class="product-modal-grid">
            <div class="product-modal-img">
                <img src="${p.image}" alt="${p.name}" onerror="this.src='images/backgrounds/hero.jpg'">
            </div>
            <div class="product-modal-details">
                <span class="product-cat">${p.category}</span>
                <h2>${p.name}</h2>
                <div class="price">Rs. ${p.price.toLocaleString()}</div>
                <p class="desc">${p.desc || 'Beautiful handmade creation from Wasai Collection.'}</p>
                <div style="display:flex; gap:10px; flex-wrap:wrap;">
                    <button class="btn btn-primary" onclick="addToCart('${p.id}'); document.getElementById('product-modal').classList.remove('active');"><i class="fas fa-shopping-bag"></i> Add to Cart</button>
                    <button class="btn btn-secondary" onclick="toggleWishlist('${p.id}')"><i class="far fa-heart"></i> Wishlist</button>
                </div>
            </div>
        </div>
    `;
    document.getElementById('product-modal').classList.add('active');
}

// ================= GLOBAL FUNCTIONS =================
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.deleteOrder = deleteOrder;
window.updateOrderStatus = updateOrderStatus;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
window.filterByCategory = filterByCategory;
window.viewProductDetail = viewProductDetail;
window.renderWishlist = renderWishlist;