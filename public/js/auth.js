// auth.js - Authentication functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    
    // Logout button functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
  });
  
  // Check if user is logged in
  function checkAuthStatus() {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
      document.body.classList.add('is-authenticated');
      return true;
    } else {
      document.body.classList.remove('is-authenticated');
      return false;
    }
  }
  
  // User registration
  function register(formData) {
    return fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      return response.json();
    });
  }
  
  // User login
  function login(email, password) {
    return fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.user));
      document.body.classList.add('is-authenticated');
      return data;
    });
  }
  
  // User logout
  function logout() {
    return fetch('/api/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => response.json())
    .then(() => {
      // Clear user data from localStorage
      localStorage.removeItem('user');
      document.body.classList.remove('is-authenticated');
      // Redirect to home page
      window.location.href = '/';
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
  }
  
  // Get current user
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  }
  
  // Protect route - redirect if not authenticated
  function protectRoute() {
    if (!checkAuthStatus()) {
      // Show alert
      showAlert('You need to be logged in to access this page', 'danger');
      // Redirect to login
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
      return false;
    }
    return true;
  }
  
  // Create alert
  function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at top of main content
    const mainContent = document.getElementById('app');
    mainContent.insertBefore(alertDiv, mainContent.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
  
 