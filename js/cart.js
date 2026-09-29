"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var cartArea = document.querySelector("#cart-items");
  var totalText = document.querySelector("#cart-total");
  var clearButton = document.querySelector("#clear-cart");
  var checkoutLink = document.querySelector("#checkout-link");

  function calculateTotal(cart) {
    var total = 0;
    cart.forEach(function (item) {
      var product = ToyHaven.findProduct(item.id);
      if (product) total += product.price * item.quantity;
    });
    return total;
  }

  function displayCart() {
    var cart = ToyHaven.getCart();

    if (cart.length === 0) {
      cartArea.innerHTML = '<div class="empty-state"><span aria-hidden="true">🛒</span>' +
        '<h2>Your cart is empty</h2><p>Add a little joy from our toy shelves.</p>' +
        '<a class="button" href="products.html">Browse products</a></div>';
      totalText.textContent = ToyHaven.formatPrice(0);
      checkoutLink.setAttribute("aria-disabled", "true");
      checkoutLink.classList.add("button-secondary");
      return;
    }

    var cartHTML = "";
    cart.forEach(function (item) {
      var product = ToyHaven.findProduct(item.id);
      if (!product) return;
      var image = ToyHaven.createProductImage(product).replace("product-image", "cart-thumb");
      cartHTML += '<article class="cart-item">' + image + '<div class="cart-item-details">' +
        "<h2>" + product.name + "</h2><p>" + ToyHaven.formatPrice(product.price) + " each</p>" +
        '<div class="cart-controls"><div class="quantity-control" aria-label="Quantity for ' + product.name + '">' +
        '<button type="button" class="decrease" data-id="' + product.id + '" aria-label="Decrease ' + product.name + ' quantity">−</button>' +
        "<span>" + item.quantity + "</span>" +
        '<button type="button" class="increase" data-id="' + product.id + '" aria-label="Increase ' + product.name + ' quantity">+</button></div>' +
        '<button type="button" class="remove-button" data-id="' + product.id + '">Remove</button>' +
        '<span class="item-subtotal">' + ToyHaven.formatPrice(product.price * item.quantity) + "</span></div></div></article>";
    });

    cartArea.innerHTML = cartHTML;
    totalText.textContent = ToyHaven.formatPrice(calculateTotal(cart));
    checkoutLink.removeAttribute("aria-disabled");
    checkoutLink.classList.remove("button-secondary");
    connectCartButtons();
  }

  function changeQuantity(productId, change) {
    var cart = ToyHaven.getCart();
    var item = cart.find(function (cartItem) { return cartItem.id === Number(productId); });
    if (!item) return;
    item.quantity += change;
    cart = cart.filter(function (cartItem) { return cartItem.quantity > 0; });
    ToyHaven.saveCart(cart);
    displayCart();
  }

  function connectCartButtons() {
    cartArea.querySelectorAll(".increase").forEach(function (button) {
      button.addEventListener("click", function () { changeQuantity(button.dataset.id, 1); });
    });
    cartArea.querySelectorAll(".decrease").forEach(function (button) {
      button.addEventListener("click", function () { changeQuantity(button.dataset.id, -1); });
    });
    cartArea.querySelectorAll(".remove-button").forEach(function (button) {
      button.addEventListener("click", function () {
        var updatedCart = ToyHaven.getCart().filter(function (item) {
          return item.id !== Number(button.dataset.id);
        });
        ToyHaven.saveCart(updatedCart);
        displayCart();
      });
    });
  }

  clearButton.addEventListener("click", function () {
    if (ToyHaven.getCart().length > 0 && window.confirm("Remove every item from your cart?")) {
      ToyHaven.saveCart([]);
      displayCart();
      ToyHaven.showToast("Cart cleared.");
    }
  });

  checkoutLink.addEventListener("click", function (event) {
    if (ToyHaven.getCart().length === 0) event.preventDefault();
  });

  displayCart();
});
