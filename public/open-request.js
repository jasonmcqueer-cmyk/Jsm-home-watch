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

  function notify(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
    if (typeof window.jsmOnRequestSent === "function" && name === "jsm-request-result") {
      window.jsmOnRequestSent(detail || {});
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
      statusNode.className =
        "mt-5 rounded-xl border border-gold bg-gold/25 px-4 py-3 text-sm font-semibold text-forest";
      statusNode.textContent = "Sending…";
    }

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
          if (statusNode) {
            statusNode.textContent = "Request received. We’ll follow up by email.";
          }
          var formEl = document.getElementById("request-service-form");
          var panel = document.getElementById("request-success-panel");
          if (formEl) {
            formEl.reset();
            formEl.hidden = true;
          }
          if (panel) panel.hidden = false;
          clearDraft();
          notify("jsm-request-result", { ok: true, email: parsed.email });
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
        notify("jsm-request-result", { ok: false, error: error });
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

      var sender = target.closest("[data-send-request]");
      if (sender) {
        event.preventDefault();
        event.stopPropagation();
        var form = document.getElementById("request-service-form");
        if (form) sendForm(form);
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
    "input",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var form = target.closest("#request-service-form");
      if (form) persistDraft(form);
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
