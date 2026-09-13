(function () {
  var CONTACT_EMAIL = "jsmhomewatch@yahoo.com";
  var sending = false;

  function dialogEl() {
    return document.getElementById("request-service");
  }

  function openDialog(plan) {
    var dialog = dialogEl();
    if (!dialog) return false;

    if (plan) {
      var select = dialog.querySelector('select[name="plan"]');
      if (select) {
        select.value = plan;
        select.dispatchEvent(new Event("input", { bubbles: true }));
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }

    try {
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    } catch (error) {
      dialog.setAttribute("open", "");
    }

    var nameInput = document.getElementById("contact-name");
    if (nameInput && typeof nameInput.focus === "function") {
      window.setTimeout(function () {
        try {
          nameInput.focus();
        } catch (focusError) {
          /* ignore */
        }
      }, 40);
    }

    return true;
  }

  function closeDialog() {
    var dialog = dialogEl();
    if (!dialog) return;

    try {
      if (typeof dialog.close === "function" && dialog.open) {
        dialog.close();
      } else {
        dialog.removeAttribute("open");
      }
    } catch (error) {
      dialog.removeAttribute("open");
    }

    if (location.hash === "#request-service") {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  function notify(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
  }

  function fieldValue(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    return el && typeof el.value === "string" ? el.value.trim() : "";
  }

  function validate(form) {
    var name = fieldValue(form, "name");
    var email = fieldValue(form, "email");
    var phone = fieldValue(form, "phone");
    var propertyType = fieldValue(form, "propertyType");
    var message = fieldValue(form, "message");
    var errors = {};
    if (!name) errors.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Enter a valid email address.";
    }
    if (phone.replace(/\D/g, "").length < 10) {
      errors.phone = "Enter a 10-digit phone number.";
    }
    if (!propertyType) errors.propertyType = "Select a property type.";
    if (message.length < 10) {
      errors.message = "Tell us a bit about the property or what you need.";
    }
    return { name: name, email: email, phone: phone, propertyType: propertyType, message: message, errors: errors };
  }

  function sendForm(form) {
    if (sending) return;
    var parsed = validate(form);
    if (Object.keys(parsed.errors).length) {
      notify("jsm-request-result", {
        ok: false,
        errors: parsed.errors,
        error: "Please complete the highlighted fields so we can follow up.",
      });
      return;
    }

    sending = true;
    notify("jsm-request-start", {});
    var statusNode = document.getElementById("request-send-status");
    if (statusNode) {
      statusNode.hidden = false;
      statusNode.textContent = "Sending…";
    }

    var plan = fieldValue(form, "plan");
    var subject =
      plan === "monthly"
        ? "Monthly Home Watch Request"
        : plan === "yearly"
          ? "Yearly Home Watch Request"
          : "Home Watch Service Request";

    fetch("https://formsubmit.co/ajax/" + CONTACT_EMAIL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone,
        "Property Type": parsed.propertyType,
        "Service Plan": plan || "Not specified",
        message: parsed.message,
        _subject: subject,
        _template: "table",
        _captcha: "false",
      }),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { status: response.status, body: body || {} };
        });
      })
      .then(function (result) {
        var success =
          result.body.success === true || result.body.success === "true";
        var message = result.body.message || "";
        var activate = /activat/i.test(message) && !success;
        if (success) {
          if (statusNode) {
            statusNode.textContent = "Request sent. We’ll follow up by email.";
          }
          notify("jsm-request-result", { ok: true, email: parsed.email });
          form.reset();
          return;
        }
        var error = activate
          ? "Check " +
            CONTACT_EMAIL +
            " (and spam) for an email from FormSubmit. Click Activate Form once, then send this request again."
          : message ||
            "We couldn’t send that just now. Email " +
              CONTACT_EMAIL +
              " directly.";
        if (statusNode) statusNode.textContent = error;
        notify("jsm-request-result", { ok: false, activate: activate, error: error });
      })
      .catch(function () {
        var error =
          "We couldn’t send that just now. Email " + CONTACT_EMAIL + " directly.";
        if (statusNode) statusNode.textContent = error;
        notify("jsm-request-result", { ok: false, error: error });
      })
      .then(function () {
        sending = false;
      });
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;

      var opener = target.closest("[data-open-request]");
      if (opener) {
        event.preventDefault();
        openDialog(opener.getAttribute("data-plan") || "");
        return;
      }

      var closer = target.closest("[data-close-request]");
      if (closer) {
        event.preventDefault();
        closeDialog();
      }
    },
    true,
  );

  document.addEventListener("click", function (event) {
    var dialog = dialogEl();
    if (!dialog || !dialog.open) return;
    if (event.target === dialog) closeDialog();
  });

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || form.id !== "request-service-form") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      sendForm(form);
    },
    true,
  );

  if (location.hash === "#request-service") {
    openDialog("");
  }
})();
