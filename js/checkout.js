"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector("#checkout-form");
  var itemArea = document.querySelector("#checkout-items");
  var totalText = document.querySelector("#checkout-total");
  var layout = document.querySelector("#checkout-layout");
  var successPanel = document.querySelector("#checkout-success");

  function displayOrderSummary() {
    var cart = ToyHaven.getCart();
    if (cart.length === 0) {
      layout.innerHTML = '<div class="empty-state"><span aria-hidden="true">🧺</span>' +
        '<h2>There is nothing to check out</h2><p>Add products to your cart before placing an order.</p>' +
        '<a class="button" href="products.html">Browse products</a></div>';
      return;
    }

    var summaryHTML = "";
    var total = 0;
    cart.forEach(function (item) {
      var product = ToyHaven.findProduct(item.id);
      if (!product) return;
      var itemTotal = product.price * item.quantity;
      total += itemTotal;
      var productImage = ToyHaven.createProductImage(product)
        .replace("product-image", "checkout-summary-image");
      summaryHTML += '<div class="summary-item">' + productImage +
        '<div class="summary-item-details"><strong>' + product.name + "</strong>" +
        '<span>Quantity: ' + item.quantity + "</span></div>" +
        '<strong class="summary-item-subtotal">' + ToyHaven.formatPrice(itemTotal) + "</strong></div>";
    });
    itemArea.innerHTML = summaryHTML;
    totalText.textContent = ToyHaven.formatPrice(total);
  }

  function showFieldError(input, errorElement, message) {
    input.setAttribute("aria-invalid", String(message !== ""));
    errorElement.textContent = message;
    return message === "";
  }

  function validateForm() {
    var fullName = form.elements.fullName;
    var email = form.elements.email;
    var address = form.elements.address;
    var payment = form.querySelector('input[name="payment"]:checked');
    var paymentGroup = document.querySelector("#payment-method");
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var nameOK = showFieldError(fullName, document.querySelector("#full-name-error"),
      fullName.value.trim().length < 2 ? "Please enter your full name." : "");
    var emailOK = showFieldError(email, document.querySelector("#email-error"),
      validEmail.test(email.value.trim()) ? "" : "Please enter a valid email.");
    var addressOK = showFieldError(address, document.querySelector("#address-error"),
      address.value.trim().length < 8 ? "Please enter a complete delivery address." : "");

    paymentGroup.setAttribute("aria-invalid", String(!payment));
    document.querySelector("#payment-error").textContent = payment ? "" : "Please choose a payment method.";
    return nameOK && emailOK && addressOK && Boolean(payment);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!validateForm()) {
      var firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        if (firstError.tagName === "FIELDSET") firstError.querySelector('input[name="payment"]').focus();
        else firstError.focus();
      }
      return;
    }

    var cart = ToyHaven.getCart();
    var orders = [];
    try { orders = JSON.parse(localStorage.getItem("toyHavenOrders")) || []; }
    catch (error) { orders = []; }

    var total = 0;
    cart.forEach(function (item) {
      var product = ToyHaven.findProduct(item.id);
      if (product) total += product.price * item.quantity;
    });

    orders.push({
      id: "TH-" + Date.now(),
      date: new Date().toISOString(),
      customer: {
        name: form.elements.fullName.value.trim(),
        email: form.elements.email.value.trim(),
        address: form.elements.address.value.trim()
      },
      payment: form.querySelector('input[name="payment"]:checked').value,
      items: cart,
      total: total
    });

    localStorage.setItem("toyHavenOrders", JSON.stringify(orders));
    ToyHaven.saveCart([]);
    layout.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  });

  displayOrderSummary();
});
