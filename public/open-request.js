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
})();
