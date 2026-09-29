"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.querySelector("#feedback-form");
  var confirmation = document.querySelector("#feedback-confirmation");

  function setError(fieldName, message) {
    var input = document.querySelector("#feedback-" + fieldName);
    var errorText = document.querySelector("#feedback-" + fieldName + "-error");
    input.setAttribute("aria-invalid", String(message !== ""));
    errorText.textContent = message;
    return message === "";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var topic = form.elements.topic.value;
    var message = form.elements.message.value.trim();
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var nameOK = setError("name", name === "" ? "Please enter your name." : "");
    var emailMessage = "";
    if (email === "") emailMessage = "Please enter your email address.";
    else if (!validEmail.test(email)) emailMessage = "Please enter a valid email address.";
    var emailOK = setError("email", emailMessage);
    var messageOK = setError("message", message === "" ? "Please enter your message." : "");

    if (!nameOK || !emailOK || !messageOK) {
      var firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) firstError.focus();
      return;
    }

    var feedback = [];
    try { feedback = JSON.parse(localStorage.getItem("toyHavenFeedback")) || []; }
    catch (error) { feedback = []; }
    feedback.push({ name: name, email: email, topic: topic, message: message, date: new Date().toISOString() });
    localStorage.setItem("toyHavenFeedback", JSON.stringify(feedback));
    form.reset();
    confirmation.textContent = "Thank you. Your message has been saved successfully.";
  });

  document.querySelectorAll(".faq-item button").forEach(function (button) {
    button.addEventListener("click", function () {
      var isOpen = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!isOpen));
      document.querySelector("#" + button.getAttribute("aria-controls")).hidden = isOpen;
    });
  });
});
