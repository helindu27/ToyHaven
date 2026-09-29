"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var wishlistArea = document.querySelector("#wishlist-items");

  function displayWishlist() {
    var wishlist = ToyHaven.getWishlist();
    if (wishlist.length === 0) {
      wishlistArea.innerHTML = '<div class="empty-state"><span aria-hidden="true">💛</span>' +
        '<h2>Your wishlist is waiting</h2><p>Save toys you love and build your collection here.</p>' +
        '<a class="button" href="products.html">Find favourites</a></div>';
      return;
    }

    var wishlistHTML = "";
    wishlist.forEach(function (item) {
      var product = ToyHaven.findProduct(item.id);
      if (!product) return;
      wishlistHTML += '<article class="wishlist-card">' + ToyHaven.createProductImage(product) +
        '<div class="wishlist-content"><p class="product-category">' + product.category + "</p><h2>" + product.name +
        '</h2><p class="price">' + ToyHaven.formatPrice(product.price) + "</p>" +
        '<label for="status-' + product.id + '">Collection status</label>' +
        '<select id="status-' + product.id + '" class="wishlist-status" data-id="' + product.id + '">' +
        '<option' + (item.status === "Interested" ? " selected" : "") + '>Interested</option>' +
        '<option' + (item.status === "Owned" ? " selected" : "") + '>Owned</option>' +
        '<option' + (item.status === "Not Interested" ? " selected" : "") + '>Not Interested</option></select>' +
        '<button class="button button-small add-cart" data-id="' + product.id + '" type="button">Add to cart</button> ' +
        '<button class="remove-button" data-id="' + product.id + '" type="button">Remove</button></div></article>';
    });

    wishlistArea.innerHTML = wishlistHTML;
    ToyHaven.connectProductButtons(wishlistArea);
    connectWishlistControls();
  }

  function connectWishlistControls() {
    wishlistArea.querySelectorAll(".wishlist-status").forEach(function (select) {
      select.addEventListener("change", function () {
        var wishlist = ToyHaven.getWishlist();
        var item = wishlist.find(function (savedItem) {
          return savedItem.id === Number(select.dataset.id);
        });
        if (item) {
          item.status = select.value;
          ToyHaven.saveWishlist(wishlist);
          ToyHaven.showToast("Collection status updated.");
        }
      });
    });

    wishlistArea.querySelectorAll(".remove-button").forEach(function (button) {
      button.addEventListener("click", function () {
        var updatedWishlist = ToyHaven.getWishlist().filter(function (item) {
          return item.id !== Number(button.dataset.id);
        });
        ToyHaven.saveWishlist(updatedWishlist);
        displayWishlist();
      });
    });
  }

  displayWishlist();
});
