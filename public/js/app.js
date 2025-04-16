 // app.js - Main application functionality
 document.addEventListener('DOMContentLoaded', function() {
  // Update cart count
  updateCartCount();
  
  // Load appropriate page content based on URL
  const path = window.location.pathname;
  
  if (path === '/' || path === '/index.html') {
    loadHomePage();
  } else if (path === '/categories.html') {
    loadCategoriesPage();
  } else if (path === '/search.html') {
    loadSearchPage();
  } else if (path === '/login.html') {
    loadLoginPage();
  } else if (path === '/register.html') {
    loadRegisterPage();
  } else if (path === '/cart.html') {
    loadCartPage();
  } else if (path === '/checkout.html') {
    loadCheckoutPage();
  } else if (path === '/dashboard.html') {
    loadDashboardPage();
  } else if (path.includes('/product/')) {
    const productId = path.split('/').pop().replace('.html', '');
    loadProductDetailPage(productId);
  }
});

// Load home page
function loadHomePage() {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <h1>Welcome to ShopGoodwill Clone</h1>
      <p>Find amazing deals on unique items!</p>
      
      <div class="search-container">
        <form id="home-search-form" class="search-form">
          <input type="text" class="search-input" placeholder="Search for products..." id="home-search-input">
          <button type="submit" class="btn">Search</button>
        </form>
      </div>
      
      <h2>Featured Categories</h2>
      <div id="featured-categories" class="products-container">
        <div class="loading">Loading categories...</div>
      </div>
      
      <h2>Latest Products</h2>
      <div id="latest-products" class="products-container">
        <div class="loading">Loading products...</div>
      </div>
    </div>
  `;
  
  // Load featured categories
  loadCategories()
    .then(categories => {
      const featuredCategories = document.getElementById('featured-categories');
      
      if (categories.length === 0) {
        featuredCategories.innerHTML = '<p>No categories found</p>';
        return;
      }
      
      let categoriesHTML = '';
      categories.forEach(category => {
        categoriesHTML += `
          <div class="product-card">
            <div class="product-info">
              <h3 class="product-title">${category.name}</h3>
              <p>${category.description || 'Browse items in this category'}</p>
              <a href="/search.html?category=${category.id}" class="btn">Browse</a>
            </div>
          </div>
        `;
      });
      
      featuredCategories.innerHTML = categoriesHTML;
    })
    .catch(error => {
      console.error('Error loading categories:', error);
      document.getElementById('featured-categories').innerHTML = '<p>Error loading categories</p>';
    });
  
  // Load latest products
  loadProducts()
    .then(data => {
      const latestProducts = document.getElementById('latest-products');
      
      if (data.products.length === 0) {
        latestProducts.innerHTML = '<p>No products found</p>';
        return;
      }
      
      let productsHTML = '';
      data.products.forEach(product => {
        productsHTML += createProductCard(product);
      });
      
      latestProducts.innerHTML = productsHTML;
    })
    .catch(error => {
      console.error('Error loading products:', error);
      document.getElementById('latest-products').innerHTML = '<p>Error loading products</p>';
    });
  
  // Home search form
  const homeSearchForm = document.getElementById('home-search-form');
  if (homeSearchForm) {
    homeSearchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchTerm = document.getElementById('home-search-input').value.trim();
      if (searchTerm) {
        window.location.href = `/search.html?q=${encodeURIComponent(searchTerm)}`;
      }
    });
  }
}

// Load categories page
function loadCategoriesPage() {
  return Promise.resolve([
    { id: 1, name: 'Electronics', description: 'Devices and gadgets' },
    { id: 2, name: 'Clothing', description: 'Apparel and fashion' },
    { id: 3, name: 'Books', description: 'Read and learn' }
  ]);
  // const appContainer = document.getElementById('app');
  // appContainer.innerHTML = `
  //   <div class="container">
  //     <h1>Browse Categories</h1>
  //     <div id="categories-list" class="products-container">
  //       <div class="loading">Loading categories...</div>
  //     </div>
  //   </div>
  // `;
  
  // // Load categories
  // loadCategories()
  //   .then(categories => {
  //     const categoriesList = document.getElementById('categories-list');
      
  //     if (categories.length === 0) {
  //       categoriesList.innerHTML = '<p>No categories found</p>';
  //       return;
  //     }
      
  //     let categoriesHTML = '';
  //     categories.forEach(category => {
  //       categoriesHTML += `
  //         <div class="product-card">
  //           <div class="product-info">
  //             <h3 class="product-title">${category.name}</h3>
  //             <p>${category.description || 'Browse items in this category'}</p>
  //             <a href="/search.html?category=${category.id}" class="btn">Browse</a>
  //           </div>
  //         </div>
  //       `;
  //     });
      
  //     categoriesList.innerHTML = categoriesHTML;
  //   })
  //   .catch(error => {
  //     console.error('Error loading categories:', error);
  //     document.getElementById('categories-list').innerHTML = '<p>Error loading categories</p>';
  //   });
}

// Load search page
function loadSearchPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('q') || '';
  const categoryId = urlParams.get('category') || '';
  const page = parseInt(urlParams.get('page')) || 1;
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <h1>Search Products</h1>
      
      <div class="search-container">
        <form id="search-form" class="search-form">
          <input type="text" class="search-input" placeholder="Search for products..." id="search-input" value="${searchTerm}">
          <button type="submit" class="btn">Search</button>
        </form>
        
        <div class="filter-container">
          <select id="category-filter" class="filter-select">
            <option value="">All Categories</option>
            <!-- Categories will be loaded here -->
          </select>
        </div>
      </div>
      
      <div id="search-results" class="products-container">
        <div class="loading">Loading products...</div>
      </div>
      
      <div id="pagination" class="pagination">
        <!-- Pagination will be added here -->
      </div>
    </div>
  `;
  
  // Load categories for filter
  loadCategories()
    .then(categories => {
      const categoryFilter = document.getElementById('category-filter');
      
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        if (category.id.toString() === categoryId) {
          option.selected = true;
        }
        categoryFilter.appendChild(option);
      });
      
      // Add event listener to category filter
      categoryFilter.addEventListener('change', function() {
        const searchInput = document.getElementById('search-input').value.trim();
        const selectedCategory = this.value;
        let url = '/search.html?';
        
        if (searchInput) {
          url += `q=${encodeURIComponent(searchInput)}`;
        }
        
        if (selectedCategory) {
          url += `${searchInput ? '&' : ''}category=${selectedCategory}`;
        }
        
        window.location.href = url;
      });
    })
    .catch(error => {
      console.error('Error loading categories:', error);
    });
  
  // Load search results
  loadProducts(searchTerm, categoryId, page)
    .then(data => {
      const searchResults = document.getElementById('search-results');
      
      if (data.products.length === 0) {
        searchResults.innerHTML = '<p>No products found matching your criteria</p>';
        return;
      }
      
      let productsHTML = '';
      data.products.forEach(product => {
        productsHTML += createProductCard(product);
      });
      
      searchResults.innerHTML = productsHTML;
      
      // Create pagination
      createPagination(data.pagination, searchTerm, categoryId);
    })
    .catch(error => {
      console.error('Error loading products:', error);
      document.getElementById('search-results').innerHTML = '<p>Error loading products</p>';
    });
  
  // Search form
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const searchTerm = document.getElementById('search-input').value.trim();
      const selectedCategory = document.getElementById('category-filter').value;
      
      let url = '/search.html?';
      
      if (searchTerm) {
        url += `q=${encodeURIComponent(searchTerm)}`;
      }
      
      if (selectedCategory) {
        url += `${searchTerm ? '&' : ''}category=${selectedCategory}`;
      }
      
      window.location.href = url;
    });
  }
}

// Load login page
function loadLoginPage() {
  // Redirect if already logged in
  if (checkAuthStatus()) {
    window.location.href = '/dashboard.html';
    return;
  }
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <div class="form-container">
        <h1 class="form-title">Login</h1>
        
        <form id="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" required>
          </div>
          
          <button type="submit" class="btn btn-block">Login</button>
        </form>
        
        <p style="margin-top: 20px; text-align: center;">
          Don't have an account? <a href="/register.html">Register</a>
        </p>
      </div>
    </div>
  `;
  
  // Login form submission
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      login(email, password)
        .then(() => {
          showAlert('Login successful! Redirecting...', 'success');
          setTimeout(() => {
            window.location.href = '/dashboard.html';
          }, 1000);
        })
        .catch(error => {
          console.error('Login error:', error);
          showAlert('Login failed. Please check your credentials.', 'danger');
        });
    });
  }
}

// Load register page
function loadRegisterPage() {
  // Redirect if already logged in
  if (checkAuthStatus()) {
    window.location.href = '/dashboard.html';
    return;
  }
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <div class="form-container">
        <h1 class="form-title">Register</h1>
        
        <form id="register-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="first-name">First Name</label>
            <input type="text" id="first-name" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label for="last-name">Last Name</label>
            <input type="text" id="last-name" class="form-control" required>
          </div>
          
          <button type="submit" class="btn btn-block">Register</button>
        </form>
        
        <p style="margin-top: 20px; text-align: center;">
          Already have an account? <a href="/login.html">Login</a>
        </p>
      </div>
    </div>
  `;
  
  // Register form submission
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        firstName: document.getElementById('first-name').value,
        lastName: document.getElementById('last-name').value
      };
      
      register(formData)
        .then(() => {
          showAlert('Registration successful! Please login.', 'success');
          setTimeout(() => {
            window.location.href = '/login.html';
          }, 1000);
        })
        .catch(error => {
          console.error('Registration error:', error);
          showAlert('Registration failed. Please try again.', 'danger');
        });
    });
  }
}

// Load cart page
function loadCartPage() {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <h1>Shopping Cart</h1>
      
      <div id="cart-container" class="cart-container">
        <div class="loading">Loading cart...</div>
      </div>
    </div>
  `;
  
  // Load cart items
  getCartItems()
    .then(cartItems => {
      const cartContainer = document.getElementById('cart-container');
      
      if (cartItems.length === 0) {
        cartContainer.innerHTML = `
          <p>Your cart is empty.</p>
          <a href="/" class="btn">Continue Shopping</a>
        `;
        return;
      }
      
      let cartHTML = '<div class="cart-items">';
      let totalAmount = 0;
      
      cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        cartHTML += `
          <div class="cart-item" data-id="${item.id}">
            <img src="${item.image_url || '/images/placeholder.jpg'}" alt="${item.title}" class="cart-item-img">
            
            <div class="cart-item-details">
              <h3 class="cart-item-title">${item.title}</h3>
              <p class="cart-item-price">$${item.price.toFixed(2)}</p>
              
              <div class="cart-item-quantity">
                <button class="quantity-decrease">-</button>
                <input type="number" min="1" value="${item.quantity}" class="quantity-input">
                <button class="quantity-increase">+</button>
              </div>
              
              <p>Total: $${itemTotal.toFixed(2)}</p>
            </div>
            
            <button class="cart-item-remove">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        `;
      });
      
      cartHTML += '</div>';
      
      cartHTML += `
        <div class="cart-summary">
          <p class="cart-total">Total: $${totalAmount.toFixed(2)}</p>
          <a href="/checkout.html" class="btn">Proceed to Checkout</a>
        </div>
      `;
      
      cartContainer.innerHTML = cartHTML;
      
      // Add event listeners for cart actions
      setupCartEventListeners();
    })
    .catch(error => {
      console.error('Error loading cart:', error);
      const cartContainer = document.getElementById('cart-container');
      
      if (error.message === 'Unauthorized') {
        cartContainer.innerHTML = `
          <p>Please login to view your cart.</p>
          <a href="/login.html" class="btn">Login</a>
        `;
      } else {
        cartContainer.innerHTML = '<p>Error loading cart</p>';
      }
    });
}

// Load checkout page
function loadCheckoutPage() {
  // Protect route
  if (!protectRoute()) {
    return;
  }
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <h1>Checkout</h1>
      
      <div class="checkout-container">
        <div class="checkout-form">
          <h2>Shipping & Payment Information</h2>
          
          <form id="checkout-form">
            <h3>Shipping Address</h3>
            <div class="form-group">
              <label for="shipping-address">Address</label>
              <input type="text" id="shipping-address" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label for="shipping-city">City</label>
              <input type="text" id="shipping-city" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label for="shipping-state">State</label>
              <input type="text" id="shipping-state" class="form-control" required>
            </div>
            
            <div class="form-group">
              <label for="shipping-zip">ZIP Code</label>
              <input type="text" id="shipping-zip" class="form-control" required>
            </div>
            
            <h3>Billing Address</h3>
            <div class="form-group">
              <input type="checkbox" id="same-address"> 
              <label for="same-address">Same as shipping address</label>
            </div>
            
            <div id="billing-address-container">
              <div class="form-group">
                <label for="billing-address">Address</label>
                <input type="text" id="billing-address" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="billing-city">City</label>
                <input type="text" id="billing-city" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="billing-state">State</label>
                <input type="text" id="billing-state" class="form-control" required>
              </div>
              
              <div class="form-group">
                <label for="billing-zip">ZIP Code</label>
                <input type="text" id="billing-zip" class="form-control" required>
              </div>
            </div>
            
            <h3>Payment Information</h3>
            <div class="form-group">
              <label for="payment-method">Payment Method</label>
              <select id="payment-method" class="form-control" required>
                <option value="">Select Payment Method</option>
                <option value="credit_card">Credit Card</option>
                <option value="paypal">PayPal</option>
              </select>
            </div>
            
            <div id="credit-card-fields" style="display: none;">
              <div class="form-group">
                <label for="card-number">Card Number</label>
                <input type="text" id="card-number" class="form-control" placeholder="XXXX XXXX XXXX XXXX">
              </div>
              
              <div class="form-group">
                <label for="card-expiry">Expiration Date</label>
                <input type="text" id="card-expiry" class="form-control" placeholder="MM/YY">
              </div>
              
              <div class="form-group">
                <label for="card-cvv">CVV</label>
                <input type="text" id="card-cvv" class="form-control" placeholder="XXX">
              </div>
            </div>
            
            <button type="submit" class="btn btn-block">Place Order</button>
          </form>
        </div>
        
        <div class="checkout-summary">
          <h2>Order Summary</h2>
          <div id="checkout-items" class="checkout-items">
            <div class="loading">Loading items...</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load cart items for summary
  getCartItems()
  .then(cartItems => {
      const checkoutItems = document.getElementById('checkout-items');
      
      if (cartItems.length === 0) {
        checkoutItems.innerHTML = `
          <p>Your cart is empty.</p>
          <a href="/" class="btn">Continue Shopping</a>
        `;
        window.location.href = '/cart.html'; // Redirect to cart if empty
        return;
      }
      
      let itemsHTML = '';
      let totalAmount = 0;
      
      cartItems.forEach(item => {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        
        itemsHTML += `
          <div class="checkout-item">
            <span class="checkout-item-title">${item.title} x ${item.quantity}</span>
            <span class="checkout-item-price">$${itemTotal.toFixed(2)}</span>
          </div>
        `;
      });
      
      itemsHTML += `<div class="checkout-total">Total: $${totalAmount.toFixed(2)}</div>`;
      
      checkoutItems.innerHTML = itemsHTML;
    })
    .catch(error => {
      console.error('Error loading cart items:', error);
      document.getElementById('checkout-items').innerHTML = '<p>Error loading cart items</p>';
    });
  
  // Handle billing address checkbox
  const sameAddressCheckbox = document.getElementById('same-address');
  const billingAddressContainer = document.getElementById('billing-address-container');
  
  sameAddressCheckbox.addEventListener('change', function() {
    if (this.checked) {
      billingAddressContainer.style.display = 'none';
    } else {
      billingAddressContainer.style.display = 'block';
    }
  });
  
  // Handle payment method change
  const paymentMethodSelect = document.getElementById('payment-method');
  const creditCardFields = document.getElementById('credit-card-fields');
  
  paymentMethodSelect.addEventListener('change', function() {
    if (this.value === 'credit_card') {
      creditCardFields.style.display = 'block';
    } else {
      creditCardFields.style.display = 'none';
    }
  });
  
  // Checkout form submission
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const shippingAddress = `${document.getElementById('shipping-address').value}, ${document.getElementById('shipping-city').value}, ${document.getElementById('shipping-state').value} ${document.getElementById('shipping-zip').value}`;
      
      let billingAddress;
      if (sameAddressCheckbox.checked) {
        billingAddress = shippingAddress;
      } else {
        billingAddress = `${document.getElementById('billing-address').value}, ${document.getElementById('billing-city').value}, ${document.getElementById('billing-state').value} ${document.getElementById('billing-zip').value}`;
      }
      
      const paymentMethod = document.getElementById('payment-method').value;
      
      // Create order
      createOrder({
        shippingAddress,
        billingAddress,
        paymentMethod
      })
        .then(data => {
          showAlert('Order placed successfully!', 'success');
          // Redirect to confirmation page or dashboard
          setTimeout(() => {
            window.location.href = `/dashboard.html?tab=orders`;
          }, 1000);
        })
        .catch(error => {
          console.error('Error placing order:', error);
          showAlert('Error placing order. Please try again.', 'danger');
        });
    });
  }
}

// Load dashboard page
function loadDashboardPage() {
  // Protect route
  if (!protectRoute()) {
    return;
  }
  
  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab') || 'profile';
  
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <h1>My Account</h1>
      
      <div class="dashboard-container">
        <div class="dashboard-menu">
          <ul>
            <li><a href="/dashboard.html?tab=profile" class="${activeTab === 'profile' ? 'active' : ''}">Profile</a></li>
            <li><a href="/dashboard.html?tab=orders" class="${activeTab === 'orders' ? 'active' : ''}">Orders</a></li>
          </ul>
        </div>
        
        <div class="dashboard-content">
          <div id="dashboard-tab-content">
            <div class="loading">Loading...</div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Load appropriate tab content
  if (activeTab === 'profile') {
    loadProfileTab();
  } else if (activeTab === 'orders') {
    loadOrdersTab();
  }
}

// Load profile tab in dashboard
function loadProfileTab() {
  const tabContent = document.getElementById('dashboard-tab-content');
  tabContent.innerHTML = `
    <h2 class="dashboard-title">My Profile</h2>
    
    <div id="profile-container">
      <div class="loading">Loading profile...</div>
    </div>
  `;
  
  // Get user profile
  getUserProfile()
    .then(user => {
      const profileContainer = document.getElementById('profile-container');
      
      profileContainer.innerHTML = `
        <form id="profile-form">
          <div class="form-group">
            <label for="profile-username">Username</label>
            <input type="text" id="profile-username" class="form-control" value="${user.username}" readonly>
          </div>
          
          <div class="form-group">
            <label for="profile-email">Email</label>
            <input type="email" id="profile-email" class="form-control" value="${user.email}" readonly>
          </div>
          
          <div class="form-group">
            <label for="profile-first-name">First Name</label>
            <input type="text" id="profile-first-name" class="form-control" value="${user.first_name || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="profile-last-name">Last Name</label>
            <input type="text" id="profile-last-name" class="form-control" value="${user.last_name || ''}" required>
          </div>
          
          <div class="form-group">
            <label for="profile-address">Address</label>
            <input type="text" id="profile-address" class="form-control" value="${user.address || ''}">
          </div>
          
          <div class="form-group">
            <label for="profile-city">City</label>
            <input type="text" id="profile-city" class="form-control" value="${user.city || ''}">
          </div>
          
          <div class="form-group">
            <label for="profile-state">State</label>
            <input type="text" id="profile-state" class="form-control" value="${user.state || ''}">
          </div>
          
          <div class="form-group">
            <label for="profile-zip">ZIP Code</label>
            <input type="text" id="profile-zip" class="form-control" value="${user.zip_code || ''}">
          </div>
          
          <div class="form-group">
            <label for="profile-phone">Phone</label>
            <input type="text" id="profile-phone" class="form-control" value="${user.phone || ''}">
          </div>
          
          <button type="submit" class="btn">Update Profile</button>
        </form>
      `;
      
      // Profile form submission
      const profileForm = document.getElementById('profile-form');
      if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const formData = {
            firstName: document.getElementById('profile-first-name').value,
            lastName: document.getElementById('profile-last-name').value,
            address: document.getElementById('profile-address').value,
            city: document.getElementById('profile-city').value,
            state: document.getElementById('profile-state').value,
            zipCode: document.getElementById('profile-zip').value,
            phone: document.getElementById('profile-phone').value
          };
          
          updateUserProfile(formData)
            .then(() => {
              showAlert('Profile updated successfully!', 'success');
            })
            .catch(error => {
              console.error('Error updating profile:', error);
              showAlert('Error updating profile. Please try again.', 'danger');
            });
        });
      }
    })
    .catch(error => {
      console.error('Error loading profile:', error);
      document.getElementById('profile-container').innerHTML = '<p>Error loading profile</p>';
    });
}

// Load orders tab in dashboard
function loadOrdersTab() {
  const tabContent = document.getElementById('dashboard-tab-content');
  tabContent.innerHTML = `
    <h2 class="dashboard-title">My Orders</h2>
    
    <div id="orders-container">
      <div class="loading">Loading orders...</div>
    </div>
  `;
  
  // Get user orders
  getUserOrders()
    .then(orders => {
      const ordersContainer = document.getElementById('orders-container');
      
      if (orders.length === 0) {
        ordersContainer.innerHTML = '<p>You have no orders yet.</p>';
        return;
      }
      
      let ordersHTML = '<div class="order-list">';
      
      orders.forEach(order => {
        const statusClass = `status-${order.status.toLowerCase()}`;
        const date = new Date(order.created_at).toLocaleDateString();
        
        ordersHTML += `
          <div class="order-item">
            <div class="order-header">
              <span class="order-number">Order #${order.id}</span>
              <span class="order-date">${date}</span>
            </div>
            
            <div class="order-total">$${order.total_amount.toFixed(2)}</div>
            
            <span class="order-status ${statusClass}">${order.status}</span>
            
            <a href="#" class="btn order-details-btn" data-id="${order.id}">View Details</a>
          </div>
        `;
      });
      
      ordersHTML += '</div>';
      
      ordersContainer.innerHTML = ordersHTML;
      
      // Add event listeners for order details buttons
      const orderDetailsBtns = document.querySelectorAll('.order-details-btn');
      orderDetailsBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          const orderId = this.getAttribute('data-id');
          
          // Show order details in a modal or new page
          showOrderDetails(orderId);
        });
      });
    })
    .catch(error => {
      console.error('Error loading orders:', error);
      document.getElementById('orders-container').innerHTML = '<p>Error loading orders</p>';
    });
}

// Show order details
function showOrderDetails(orderId) {
  // Create modal for order details
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="modal-close">&times;</span>
      <h2>Order Details</h2>
      <div id="order-details-content">
        <div class="loading">Loading order details...</div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close modal when clicking the close button
  const closeBtn = modal.querySelector('.modal-close');
  closeBtn.addEventListener('click', function() {
    document.body.removeChild(modal);
  });
  
  // Close modal when clicking outside the content
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
  
  // Get order details
  getOrderDetails(orderId)
    .then(data => {
      const orderDetailsContent = document.getElementById('order-details-content');
      
      let detailsHTML = `
        <div class="order-info">
          <p>Order #${data.order.id}</p>
          <p>Date: ${new Date(data.order.created_at).toLocaleDateString()}</p>
          <p>Status: <span class="order-status status-${data.order.status.toLowerCase()}">${data.order.status}</span></p>
          <p>Total: $${data.order.total_amount.toFixed(2)}</p>
          <p>Shipping Address: ${data.order.shipping_address}</p>
        </div>
        
        <h3>Items</h3>
        <div class="order-items">
      `;
      
      data.items.forEach(item => {
        detailsHTML += `
          <div class="order-item-detail">
            <img src="${item.image_url || '/images/placeholder.jpg'}" alt="${item.title}" class="order-item-img">
            <div class="order-item-info">
              <h4>${item.title}</h4>
              <p>Quantity: ${item.quantity}</p>
              <p>Price: $${item.price.toFixed(2)}</p>
              <p>Total: $${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          </div>
        `;
      });
      
      detailsHTML += '</div>';
      
      orderDetailsContent.innerHTML = detailsHTML;
    })
    .catch(error => {
      console.error('Error loading order details:', error);
      document.getElementById('order-details-content').innerHTML = '<p>Error loading order details</p>';
    });
}

// Load product detail page
function loadProductDetailPage(productId) {
  const appContainer = document.getElementById('app');
  appContainer.innerHTML = `
    <div class="container">
      <div id="product-detail-container">
        <div class="loading">Loading product details...</div>
      </div>
    </div>
  `;
  
  // Get product details
  getProductDetails(productId)
    .then(product => {
      const productDetailContainer = document.getElementById('product-detail-container');
      
      productDetailContainer.innerHTML = `
        <div class="product-detail">
          <div class="product-detail-image">
            <img src="${product.image_url || '/images/placeholder.jpg'}" alt="${product.title}" class="product-detail-img">
          </div>
          
          <div class="product-detail-info">
            <h1>${product.title}</h1>
            <p class="product-detail-price">$${product.price.toFixed(2)}</p>
            <p class="product-detail-condition">Condition: ${product.condition}</p>
            <p class="product-detail-seller">Seller: ${product.seller_name}</p>
            <p class="product-detail-category">Category: ${product.category_name}</p>
            
            <div class="product-detail-description">
              <h3>Description</h3>
              <p>${product.description || 'No description available'}</p>
            </div>
            
            <div class="product-detail-actions">
              <form id="add-to-cart-form">
                <div class="form-group">
                  <label for="quantity">Quantity</label>
                  <input type="number" id="quantity" class="form-control" value="1" min="1" required>
                </div>
                
                <button type="submit" class="btn">Add to Cart</button>
              </form>
            </div>
          </div>
        </div>
      `;
      
      // Add to cart form submission
      const addToCartForm = document.getElementById('add-to-cart-form');
      if (addToCartForm) {
        addToCartForm.addEventListener('submit', function(e) {
          e.preventDefault();
          
          const quantity = parseInt(document.getElementById('quantity').value);
          
          addToCart(productId, quantity)
            .then(() => {
              showAlert('Product added to cart!', 'success');
              updateCartCount();
            })
            .catch(error => {
              if (error.message === 'Unauthorized') {
                showAlert('Please login to add items to cart.', 'warning');
                setTimeout(() => {
                  window.location.href = '/login.html';
                }, 2000);
              } else {
                console.error('Error adding to cart:', error);
                showAlert('Error adding product to cart.', 'danger');
              }
            });
        });
      }
    })
    .catch(error => {
      console.error('Error loading product details:', error);
      document.getElementById('product-detail-container').innerHTML = '<p>Error loading product details</p>';
    });
}

// API Functions

// Load categories
function loadCategories() {
  return fetch('/api/categories')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    });
}

// Load products
function loadProducts(search = '', category = '', page = 1, limit = 10) {
  let url = `/api/products?page=${page}&limit=${limit}`;
  
  if (search) {
    url += `&search=${encodeURIComponent(search)}`;
  }
  
  if (category) {
    url += `&category=${category}`;
  }
  
  return fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    });
}

// Get product details
function getProductDetails(productId) {
  return fetch(`/api/products/${productId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch product details');
      }
      return response.json();
    });
}

// Get cart items
function getCartItems() {
  return fetch('/api/cart')
    .then(response => {
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      return response.json();
    });
}

// Add to cart
function addToCart(productId, quantity) {
  return fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ productId, quantity })
  })
  .then(response => {
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    return response.json();
  });
}

// Remove from cart
function removeFromCart(cartItemId) {
  return fetch(`/api/cart/${cartItemId}`, {
    method: 'DELETE'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }
    return response.json();
  });
}

// Update cart item quantity
function updateCartItemQuantity(cartItemId, quantity) {
  return fetch(`/api/cart/${cartItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ quantity })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to update cart');
    }
    return response.json();
  });
}

// Create order
function createOrder(orderData) {
  return fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to create order');
    }
    return response.json();
  });
}

// Get user orders
function getUserOrders() {
  return fetch('/api/orders')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    });
}

// Get order details
function getOrderDetails(orderId) {
  return fetch(`/api/orders/${orderId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }
      return response.json();
    });
}

// Get user profile
function getUserProfile() {
  return fetch('/api/profile')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      return response.json();
    });
}

// Update user profile
function updateUserProfile(profileData) {
  return fetch('/api/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(profileData)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    return response.json();
  });
}

// Utility Functions

// Create product card
function createProductCard(product) {
  return `
    <div class="product-card">
      <a href="/product/${product.id}">
        <img src="${product.image_url || '/images/placeholder.jpg'}" alt="${product.title}" class="product-img">
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-price">$${product.price.toFixed(2)}</p>
          <p class="product-category">${product.category_name || 'Uncategorized'}</p>
        </div>
      </a>
    </div>
  `;
}

// Create pagination
function createPagination(pagination, search, category) {
  const paginationContainer = document.getElementById('pagination');
  if (!paginationContainer) return;
  
  let paginationHTML = '';
  
  // Previous button
  paginationHTML += `
    <button 
      ${pagination.page === 1 ? 'disabled' : ''} 
      onclick="window.location.href='/search.html?page=${pagination.page - 1}${search ? '&q=' + encodeURIComponent(search) : ''}${category ? '&category=' + category : ''}'">
      &laquo; Previous
    </button>
  `;
  
  // Page numbers
  for (let i = 1; i <= pagination.totalPages; i++) {
    paginationHTML += `
      <button 
        class="${i === pagination.page ? 'active' : ''}" 
        onclick="window.location.href='/search.html?page=${i}${search ? '&q=' + encodeURIComponent(search) : ''}${category ? '&category=' + category : ''}'">
        ${i}
      </button>
    `;
  }
  
  // Next button
  paginationHTML += `
    <button 
      ${pagination.page === pagination.totalPages ? 'disabled' : ''} 
      onclick="window.location.href='/search.html?page=${pagination.page + 1}${search ? '&q=' + encodeURIComponent(search) : ''}${category ? '&category=' + category : ''}'">
      Next &raquo;
    </button>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
}

// Setup cart event listeners
function setupCartEventListeners() {
  // Quantity increase buttons
  const increaseButtons = document.querySelectorAll('.quantity-increase');
  increaseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const cartItem = this.closest('.cart-item');
      const cartItemId = cartItem.getAttribute('data-id');
      const quantityInput = cartItem.querySelector('.quantity-input');
      
      let quantity = parseInt(quantityInput.value) + 1;
      quantityInput.value = quantity;
      
      updateCartItem(cartItemId, quantity);
    });
  });
  
  // Quantity decrease buttons
  const decreaseButtons = document.querySelectorAll('.quantity-decrease');
  decreaseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const cartItem = this.closest('.cart-item');
      const cartItemId = cartItem.getAttribute('data-id');
      const quantityInput = cartItem.querySelector('.quantity-input');
      
      let quantity = parseInt(quantityInput.value) - 1;
      if (quantity < 1) quantity = 1;
      quantityInput.value = quantity;
      
      updateCartItem(cartItemId, quantity);
    });
  });
  
  // Quantity input change
  const quantityInputs = document.querySelectorAll('.quantity-input');
  quantityInputs.forEach(input => {
    input.addEventListener('change', function() {
      const cartItem = this.closest('.cart-item');
      const cartItemId = cartItem.getAttribute('data-id');
      
      let quantity = parseInt(this.value);
      if (quantity < 1) {
        quantity = 1;
        this.value = 1;
      }
      
      updateCartItem(cartItemId, quantity);
    });
  });
  
  // Remove from cart buttons
  const removeButtons = document.querySelectorAll('.cart-item-remove');
  removeButtons.forEach(button => {
    button.addEventListener('click', function() {
      const cartItem = this.closest('.cart-item');
      const cartItemId = cartItem.getAttribute('data-id');
      
      removeFromCart(cartItemId)
        .then(() => {
          // Remove item from UI
          cartItem.remove();
          
          // Update cart count
          updateCartCount();
          
          // Reload cart if empty
          const cartItems = document.querySelectorAll('.cart-item');
          if (cartItems.length === 0) {
            loadCartPage();
          }
          
          showAlert('Item removed from cart!', 'success');
        })
        .catch(error => {
          console.error('Error removing item:', error);
          showAlert('Error removing item from cart.', 'danger');
        });
    });
  });
}

// Update cart item
function updateCartItem(cartItemId, quantity) {
  addToCart(cartItemId, quantity)
    .then(() => {
      // Reload cart page to show updated totals
      loadCartPage();
      updateCartCount();
    })
    .catch(error => {
      console.error('Error updating cart:', error);
      showAlert('Error updating cart.', 'danger');
    });
}

// Update cart count in header
function updateCartCount() {
  const cartCountElement = document.getElementById('cart-count');
  
  getCartItems()
    .then(cartItems => {
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      cartCountElement.textContent = count;
    })
    .catch(error => {
      // Ignore unauthorized errors for non-logged in users
      if (error.message !== 'Unauthorized') {
        console.error('Error updating cart count:', error);
      }
      cartCountElement.textContent = '0';
    });
}