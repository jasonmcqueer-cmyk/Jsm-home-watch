(function () {
  var CONTACT_EMAIL = "jsmhomewatch@yahoo.com";
  var DRAFT_KEY = "jsm-request-draft";
  var FIELD_NAMES = ["name", "email", "phone", "propertyType", "plan", "message"];
  var sending = false;

  function dialogEl() {
    return document.getElementById("request-service");
  }

  function persistDraft(form) {
    if (!form) return;
    try {
      var next = {};
      var hasAny = false;
      for (var i = 0; i < FIELD_NAMES.length; i++) {
        var value = fieldValue(form, FIELD_NAMES[i]);
        next[FIELD_NAMES[i]] = value;
        if (value) hasAny = true;
      }
      if (!hasAny) return;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(next));
    } catch (error) {
      /* ignore private-mode storage errors */
    }
  }

  function restoreDraft(form) {
    if (!form) return;
    try {
      var raw = sessionStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      var draft = JSON.parse(raw);
      if (!draft || typeof draft !== "object") return;
      for (var i = 0; i < FIELD_NAMES.length; i++) {
        var key = FIELD_NAMES[i];
        var value = draft[key];
        if (value == null || String(value).trim() === "") continue;
        var field = form.querySelector('[name="' + key + '"]');
        if (field && "value" in field && !String(field.value || "").trim()) {
          field.value = String(value);
        }
      }
    } catch (error) {
      /* ignore */
    }
  }

  function clearDraft() {
    try {
      sessionStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      /* ignore */
    }
  }

  function openDialog(plan) {
    var dialog = dialogEl();
    if (!dialog) return false;

    var formEl = document.getElementById("request-service-form");
    var panel = document.getElementById("request-success-panel");
    if (formEl) {
      formEl.hidden = false;
      restoreDraft(formEl);
      clearFormAlerts(formEl);
    }
    if (panel) panel.hidden = true;

    if (plan) {
      var select = dialog.querySelector('select[name="plan"]');
      if (select) {
        select.value = plan;
        persistDraft(formEl);
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

  function setSendingUi(isSending) {
    var btn = document.querySelector("[data-send-request]");
    if (btn) {
      btn.disabled = Boolean(isSending);
      if (isSending) {
        btn.setAttribute("aria-busy", "true");
        btn.textContent = "Sending…";
      } else {
        btn.removeAttribute("aria-busy");
      }
    }
    var statusNode = document.getElementById("request-send-status");
    if (!statusNode) return statusNode;
    if (isSending) {
      statusNode.hidden = false;
      statusNode.textContent = "Sending…";
    }
    return statusNode;
  }

  function keepDialogOpen() {
    var dialog = dialogEl();
    if (!dialog) return;
    try {
      if (typeof dialog.showModal === "function") {
        if (!dialog.open) dialog.showModal();
      } else if (!dialog.hasAttribute("open")) {
        dialog.setAttribute("open", "");
      }
    } catch (error) {
      dialog.setAttribute("open", "");
    }
  }

  function showSuccessPanel(email) {
    var formEl = document.getElementById("request-service-form");
    var panel = document.getElementById("request-success-panel");
    if (panel) {
      panel.hidden = false;
      var heading = document.getElementById("request-received-title");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        try {
          heading.focus();
        } catch (focusError) {
          /* ignore */
        }
      }
    }
    if (formEl) {
      formEl.hidden = true;
      formEl.reset();
    }
    clearDraft();
    keepDialogOpen();
    notify("jsm-request-result", { ok: true, email: email });
  }

  function notify(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {}, bubbles: true }));
    if (name === "jsm-request-start" && typeof window.jsmOnRequestStart === "function") {
      window.jsmOnRequestStart();
    }
    if (name === "jsm-request-result" && typeof window.jsmOnRequestSent === "function") {
      window.jsmOnRequestSent(detail || {});
    }
  }

  function errorSummary(errors) {
    if (errors.message && Object.keys(errors).length === 1) {
      return "Please add a short message about the property, then tap Send again.";
    }
    return "Please complete the highlighted fields so we can follow up.";
  }

  function showFieldErrors(form, errors) {
    if (!form) return;
    var names = ["name", "email", "phone", "propertyType", "message"];
    var first = null;
    for (var i = 0; i < names.length; i++) {
      var key = names[i];
      var field = form.querySelector('[name="' + key + '"]');
      var slot = form.querySelector('[data-field-error="' + key + '"]');
      var message = errors[key] || "";
      if (field) {
        if (message) {
          field.setAttribute("aria-invalid", "true");
          if (!first) first = field;
        } else {
          field.removeAttribute("aria-invalid");
        }
      }
      if (slot) {
        slot.hidden = !message;
        slot.textContent = message;
      }
    }
    var alertBox = document.getElementById("request-form-alert");
    if (alertBox) {
      alertBox.hidden = false;
      alertBox.textContent = errorSummary(errors);
    }
    if (first && typeof first.scrollIntoView === "function") {
      first.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    if (first && typeof first.focus === "function") {
      try {
        first.focus({ preventScroll: true });
      } catch (focusError) {
        try {
          first.focus();
        } catch (ignored) {}
      }
    }
  }

  function clearFormAlerts(form) {
    if (!form) return;
    var fields = form.querySelectorAll("[aria-invalid]");
    for (var i = 0; i < fields.length; i++) {
      fields[i].removeAttribute("aria-invalid");
    }
    var slots = form.querySelectorAll("[data-field-error]");
    for (var s = 0; s < slots.length; s++) {
      slots[s].hidden = true;
      slots[s].textContent = "";
    }
    var alertBox = document.getElementById("request-form-alert");
    if (alertBox) {
      alertBox.hidden = true;
      alertBox.textContent = "";
    }
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
      showFieldErrors(form, parsed.errors);
      notify("jsm-request-result", {
        ok: false,
        errors: parsed.errors,
        error: errorSummary(parsed.errors),
      });
      return false;
    }

    sending = true;
    clearFormAlerts(form);
    notify("jsm-request-start", {});
    var statusNode = setSendingUi(true);

    var plan = fieldValue(form, "plan");
    var payload = {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone,
      propertyType: parsed.propertyType,
      plan: plan,
      message: parsed.message,
    };

    fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok && body && body.ok, body: body || {} };
        });
      })
      .then(function (result) {
        if (result.ok) {
          showSuccessPanel(parsed.email);
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
              _subject: "Home Watch Service Request",
              _template: "table",
              _captcha: "false",
            }),
          }).catch(function () {});
          return;
        }
        var error =
          (result.body && result.body.error) ||
          "We couldn’t send that just now. Email " + CONTACT_EMAIL + " directly.";
        if (statusNode) statusNode.textContent = error;
        setSendingUi(false);
        notify("jsm-request-result", { ok: false, error: error });
      })
      .catch(function () {
        var error =
          "We couldn’t send that just now. Email " + CONTACT_EMAIL + " directly.";
        if (statusNode) statusNode.textContent = error;
        setSendingUi(false);
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

      var sender = target.closest("[data-send-request]");
      if (sender) {
        event.preventDefault();
        var form = document.getElementById("request-service-form");
        if (!form) return;
        var parsed = validate(form);
        if (Object.keys(parsed.errors).length) {
          showFieldErrors(form, parsed.errors);
          notify("jsm-request-result", {
            ok: false,
            errors: parsed.errors,
            error: errorSummary(parsed.errors),
          });
          return;
        }
        event.stopPropagation();
        sendForm(form);
        return;
      }

      var closer = target.closest("[data-close-request]");
      if (closer) {
        event.preventDefault();
        window.__jsmAllowDialogClose = true;
        closeDialog();
      }
    },
    true,
  );

  document.addEventListener("click", function (event) {
    var dialog = dialogEl();
    if (!dialog || !dialog.open) return;
    if (event.target !== dialog) return;
    if (sending) return;
    var panel = document.getElementById("request-success-panel");
    if (panel && !panel.hidden) return;
    closeDialog();
  });

  document.addEventListener(
    "input",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var form = target.closest("#request-service-form");
      if (!form) return;
      persistDraft(form);
      if (target.getAttribute && target.getAttribute("name")) {
        target.removeAttribute("aria-invalid");
        var slot = form.querySelector('[data-field-error="' + target.getAttribute("name") + '"]');
        if (slot) {
          slot.hidden = true;
          slot.textContent = "";
        }
      }
    },
    true,
  );

  document.addEventListener(
    "change",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var form = target.closest("#request-service-form");
      if (form) persistDraft(form);
    },
    true,
  );

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || form.id !== "request-service-form") return;
      event.preventDefault();
      if (form.getAttribute("data-react") === "ready") return;
      event.stopImmediatePropagation();
      sendForm(form);
    },
    true,
  );

  if (location.hash === "#request-service") {
    openDialog("");
  }
})();
