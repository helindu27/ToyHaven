"use strict";

var ToyHaven = window.ToyHaven;
var CART_KEY = "toyHavenCart";
var WISHLIST_KEY = "toyHavenWishlist";

function readList(key) {
  var savedValue = localStorage.getItem(key);
  if (!savedValue) return [];

  try {
    return JSON.parse(savedValue);
  } catch (error) {
    return [];
  }
}

function saveList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function getCart() { return readList(CART_KEY); }

function saveCart(cart) {
  saveList(CART_KEY, cart);
  updateCartCount();
}

function getWishlist() { return readList(WISHLIST_KEY); }
function saveWishlist(wishlist) { saveList(WISHLIST_KEY, wishlist); }

function findProduct(productId) {
  return PRODUCTS.find(function (product) {
    return product.id === Number(productId);
  });
}

function formatPrice(price) {
  return "LKR " + Number(price).toLocaleString("en-LK");
}

function updateCartCount() {
  var count = 0;
  getCart().forEach(function (item) { count += item.quantity; });

  document.querySelectorAll(".cart-count").forEach(function (badge) {
    badge.textContent = count;
    badge.setAttribute("aria-label", count + " item" + (count === 1 ? "" : "s") + " in cart");
    var cartIconLink = badge.closest(".cart-icon-link");
    if (cartIconLink) {
      cartIconLink.setAttribute("aria-label", "Open shopping cart, " + count + " item" + (count === 1 ? "" : "s"));
    }
  });
}

var toastTimer;
function showToast(message) {
  var toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 2600);
}

function addToCart(productId) {
  var cart = getCart();
  var id = Number(productId);
  var existingItem = cart.find(function (item) { return item.id === id; });

  if (existingItem) existingItem.quantity += 1;
  else cart.push({ id: id, quantity: 1 });

  saveCart(cart);
  showToast(findProduct(id).name + " added to cart.");
}

function addToWishlist(productId) {
  var wishlist = getWishlist();
  var id = Number(productId);
  var alreadySaved = wishlist.some(function (item) { return item.id === id; });

  if (alreadySaved) {
    showToast("This product is already in your wishlist.");
    return;
  }

  wishlist.push({ id: id, status: "Interested" });
  saveWishlist(wishlist);
  showToast(findProduct(id).name + " saved to wishlist.");
}

function createProductImage(product) {
  var imageHTML = "";
  if (product.image.trim() !== "") {
    imageHTML = '<img src="' + product.image + '" alt="' + product.name + '" loading="lazy" onerror="this.hidden=true">';
  }

  return '<div class="product-image">' +
    '<div class="image-fallback" aria-hidden="true"><span>Product image<br>coming soon</span></div>' +
    imageHTML +
    "</div>";
}

function createProductCard(product) {
  return '<article class="product-card">' + createProductImage(product) +
    '<div class="product-info"><p class="product-category">' + product.category + "</p>" +
    "<h3>" + product.name + '</h3><p class="price">' + formatPrice(product.price) + "</p>" +
    '<div class="card-actions"><button class="button button-small add-cart" type="button" data-id="' + product.id + '">Add to cart</button>' +
    '<button class="icon-button add-wishlist" type="button" data-id="' + product.id + '" aria-label="Add ' + product.name + ' to wishlist"><span aria-hidden="true">♡</span></button>' +
    '<button class="icon-button details-button" type="button" data-id="' + product.id + '">View details</button></div></div></article>';
}

function connectProductButtons(area) {
  area.querySelectorAll(".add-cart").forEach(function (button) {
    button.addEventListener("click", function () { addToCart(button.dataset.id); });
  });
  area.querySelectorAll(".add-wishlist").forEach(function (button) {
    button.addEventListener("click", function () { addToWishlist(button.dataset.id); });
  });
}

function setupNavigation() {
  var menuButton = document.querySelector(".menu-toggle");
  var navigation = document.querySelector(".primary-nav");
  if (!menuButton || !navigation) return;

  var navigationWrapper = document.querySelector(".nav-wrap");
  var cartLink = navigation.querySelector('a[href="cart.html"]');
  var wishlistLink = navigation.querySelector('a[href="wishlist.html"]');

  var actionLinks = document.createElement("div");
  actionLinks.className = "nav-actions";
  actionLinks.innerHTML =
    '<a class="nav-icon-link" href="wishlist.html" aria-label="Open wishlist">' +
      '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>' +
    '</a>' +
    '<a class="nav-icon-link cart-icon-link" href="cart.html" aria-label="Open shopping cart">' +
      '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 3h2l2.4 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 7H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>' +
      '<span class="cart-count" aria-label="0 items in cart">0</span>' +
    '</a>';
  navigationWrapper.appendChild(actionLinks);

  if (wishlistLink.hasAttribute("aria-current")) {
    actionLinks.querySelector('a[href="wishlist.html"]').setAttribute("aria-current", "page");
  }
  if (cartLink.hasAttribute("aria-current")) {
    actionLinks.querySelector('a[href="cart.html"]').setAttribute("aria-current", "page");
  }

  menuButton.addEventListener("click", function () {
    var isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("open", !isOpen);
    menuButton.querySelector(".sr-only").textContent = isOpen ? "Open navigation menu" : "Close navigation menu";
  });
}

function setupHeroBanners() {
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dots button");
  var previousButton = document.querySelector(".hero-prev");
  var nextButton = document.querySelector(".hero-next");
  if (slides.length === 0) return;
  var currentSlide = 0;
  var sliderTimer;

  slides.forEach(function (slide) {
    var bannerPath = slide.dataset.banner;
    if (!bannerPath) return;
    var bannerImage = new Image();
    bannerImage.onload = function () {
      slide.style.backgroundImage = 'url("' + bannerPath + '")';
      slide.classList.add("has-custom-banner");
    };
    bannerImage.src = bannerPath;
  });

  function showSlide(slideNumber) {
    currentSlide = slideNumber;
    slides.forEach(function (slide, index) {
      slide.classList.toggle("active", index === slideNumber);
      slide.setAttribute("aria-hidden", String(index !== slideNumber));
    });
    dots.forEach(function (dot, index) {
      dot.classList.toggle("active", index === slideNumber);
      dot.setAttribute("aria-pressed", String(index === slideNumber));
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      showSlide(Number(dot.dataset.slide));
      restartSlider();
    });
  });

  previousButton.addEventListener("click", function () {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
    restartSlider();
  });

  nextButton.addEventListener("click", function () {
    showSlide((currentSlide + 1) % slides.length);
    restartSlider();
  });

  function restartSlider() {
    clearInterval(sliderTimer);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sliderTimer = setInterval(function () {
        showSlide((currentSlide + 1) % slides.length);
      }, 5500);
    }
  }

  restartSlider();
}

function setupHomePage() {
  var featuredArea = document.querySelector("#featured-products");
  var dailyArea = document.querySelector("#product-of-day");

  if (featuredArea) {
    var featuredProducts = PRODUCTS.filter(function (product) {
      return [1, 6, 9, 13].includes(product.id);
    });
    featuredArea.innerHTML = featuredProducts.map(createProductCard).join("");
    connectProductButtons(featuredArea);
  }

  if (dailyArea) {
    var startOfYear = new Date(new Date().getFullYear(), 0, 0);
    var dayNumber = Math.floor((new Date() - startOfYear) / 86400000);
    var dailyProduct = PRODUCTS[dayNumber % PRODUCTS.length];
    dailyArea.innerHTML = createProductImage(dailyProduct) +
      '<div class="daily-copy"><p class="product-category">' + dailyProduct.category + "</p>" +
      "<h3>" + dailyProduct.name + "</h3><p>" + dailyProduct.description + "</p>" +
      '<p class="price">' + formatPrice(dailyProduct.price) + "</p>" +
      '<button class="button add-cart" type="button" data-id="' + dailyProduct.id + '">Add to cart</button> ' +
      '<a class="button button-secondary" href="products.html">View all</a></div>';
    connectProductButtons(dailyArea);
  }
}

function setupProductsPage() {
  var productArea = document.querySelector("#product-list");
  if (!productArea) return;

  var searchBox = document.querySelector("#product-search");
  var resultText = document.querySelector("#product-results");
  var filterButtons = document.querySelectorAll("[data-category]");
  var modal = document.querySelector("#product-modal");
  var modalContent = document.querySelector("#modal-content");
  var selectedCategory = new URLSearchParams(window.location.search).get("category") || "All";
  var lastModalButton;

  function displayProducts() {
    var searchText = searchBox.value.trim().toLowerCase();
    var matches = PRODUCTS.filter(function (product) {
      var correctCategory = selectedCategory === "All" || product.category === selectedCategory;
      var correctName = product.name.toLowerCase().includes(searchText);
      return correctCategory && correctName;
    });

    resultText.textContent = "Showing " + matches.length + " of " + PRODUCTS.length + " products";
    if (matches.length === 0) {
      productArea.innerHTML = '<div class="empty-state"><span aria-hidden="true">🔎</span><h2>No toys found</h2><p>Try a different name or category.</p></div>';
      return;
    }

    productArea.innerHTML = matches.map(createProductCard).join("");
    connectProductButtons(productArea);
    productArea.querySelectorAll(".details-button").forEach(function (button) {
      button.addEventListener("click", function () { openProductModal(button); });
    });
  }

  function openProductModal(button) {
    var product = findProduct(button.dataset.id);
    lastModalButton = button;
    modalContent.innerHTML = '<article class="modal-product">' + createProductImage(product) +
      '<div class="modal-copy"><p class="product-category">' + product.category + "</p>" +
      '<h2 id="modal-title">' + product.name + "</h2><p>" + product.description + "</p>" +
      '<p class="price">' + formatPrice(product.price) + "</p>" +
      '<button class="button add-cart" type="button" data-id="' + product.id + '">Add to cart</button></div></article>';
    connectProductButtons(modalContent);
    modal.showModal();
    document.body.classList.add("modal-open");
    modal.querySelector(".modal-close").focus();
  }

  filterButtons.forEach(function (button) {
    var selected = button.dataset.category === selectedCategory;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.addEventListener("click", function () {
      selectedCategory = button.dataset.category;
      filterButtons.forEach(function (otherButton) {
        var isCurrent = otherButton === button;
        otherButton.classList.toggle("active", isCurrent);
        otherButton.setAttribute("aria-pressed", String(isCurrent));
      });
      displayProducts();
    });
  });

  searchBox.addEventListener("input", displayProducts);
  modal.querySelector(".modal-close").addEventListener("click", function () { modal.close(); });
  modal.addEventListener("click", function (event) { if (event.target === modal) modal.close(); });
  modal.addEventListener("close", function () {
    document.body.classList.remove("modal-open");
    if (lastModalButton) lastModalButton.focus();
  });
  displayProducts();
}

function setupNewsletterForms() {
  document.querySelectorAll(".newsletter-form").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.elements.email.value.trim().toLowerCase();
      var message = form.querySelector(".form-message");
      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!validEmail.test(email)) {
        message.textContent = "Please enter a valid email address.";
        return;
      }

      var subscriptions = readList("toyHavenSubscriptions");
      if (!subscriptions.includes(email)) {
        subscriptions.push(email);
        saveList("toyHavenSubscriptions", subscriptions);
      }
      message.textContent = "You’re subscribed — welcome to the play list!";
      form.reset();
    });
  });
}

function setupScrollAnimations() {
  var elements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    elements.forEach(function (element) { element.classList.add("visible"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  elements.forEach(function (element) { observer.observe(element); });
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function (error) {
        console.warn("Service worker registration skipped: " + error.message);
      });
    });
  }
}

ToyHaven.getCart = getCart;
ToyHaven.saveCart = saveCart;
ToyHaven.getWishlist = getWishlist;
ToyHaven.saveWishlist = saveWishlist;
ToyHaven.findProduct = findProduct;
ToyHaven.formatPrice = formatPrice;
ToyHaven.updateCartCount = updateCartCount;
ToyHaven.showToast = showToast;
ToyHaven.addToCart = addToCart;
ToyHaven.addToWishlist = addToWishlist;
ToyHaven.createProductImage = createProductImage;
ToyHaven.connectProductButtons = connectProductButtons;

document.addEventListener("DOMContentLoaded", function () {
  setupNavigation();
  setupHeroBanners();
  setupHomePage();
  setupProductsPage();
  setupNewsletterForms();
  setupScrollAnimations();
  updateCartCount();
  document.querySelectorAll(".current-year").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });
  registerServiceWorker();
});
