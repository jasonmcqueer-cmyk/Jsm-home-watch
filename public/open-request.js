(function () {
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

  if (location.hash === "#request-service") {
    openDialog("");
  }

  document.addEventListener(
    "submit",
    function (event) {
      var form = event.target;
      if (!form || form.id !== "request-service-form") return;
      event.preventDefault();
      if (form.getAttribute("data-react") === "ready") return;
      event.stopPropagation();
      sendWithoutReact(form);
    },
    true,
  );

  function sendWithoutReact(form) {
    if (form.getAttribute("data-sending") === "1") return;
    form.setAttribute("data-sending", "1");

    var statusNode = document.getElementById("request-send-status");
    if (statusNode) {
      statusNode.hidden = false;
      statusNode.textContent = "Sending…";
    }

    var data = new FormData(form);
    var payload = {};
    data.forEach(function (value, key) {
      payload[key] = value;
    });

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
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (statusNode) {
          statusNode.textContent = result.body && result.body.ok
            ? "Request sent. We’ll follow up by email."
            : (result.body && result.body.error) ||
              "We couldn’t send that just now.";
        }
      })
      .catch(function () {
        if (statusNode) {
          statusNode.textContent =
            "We couldn’t send that just now. Email jsmhomewatch@yahoo.com directly.";
        }
      })
      .then(function () {
        form.removeAttribute("data-sending");
      });
  }
})();
