/* Right Coat Painting — site interactions */
(function () {
  var PHONE = "+18182572338";
  var body = document.body;

  // Sticky header shadow
  var header = document.querySelector(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  var toggle = document.querySelector(".nav-toggle");
  var panel = document.querySelector(".nav-panel");
  function closeMenu() {
    body.classList.remove("nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  }
  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Services page: highlight current service chip
  var chips = document.querySelectorAll(".service-nav a");
  if (chips.length && "IntersectionObserver" in window) {
    var map = {};
    chips.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && map[entry.target.id]) {
          chips.forEach(function (c) { c.classList.remove("active"); });
          map[entry.target.id].classList.add("active");
          map[entry.target.id].scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll(".service-detail").forEach(function (s) { so.observe(s); });
  }

  // Pre-select a service when arriving from a "Request a Free Estimate" link (?service=...)
  var select = document.getElementById("service");
  if (select) {
    var wanted = new URLSearchParams(window.location.search).get("service");
    if (wanted) {
      Array.prototype.forEach.call(select.options, function (o) {
        if (o.value === wanted) select.value = wanted;
      });
    }
  }

  // Quote form
  // To receive submissions by email, create a free form at https://formspree.io
  // and paste its endpoint into the form's data-endpoint attribute in contact.html.
  // Until then, the form prepares a text message to the business phone instead.
  var form = document.getElementById("quote-form");
  if (form) {
    var status = form.querySelector(".form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      var data = new FormData(form);
      var endpoint = form.getAttribute("data-endpoint");
      var btn = form.querySelector("button[type=submit]");

      function show(msg, isError) {
        status.innerHTML = msg;
        status.classList.toggle("error", !!isError);
        status.classList.add("show");
        status.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }

      if (endpoint) {
        btn.disabled = true;
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (r) {
            if (!r.ok) throw new Error("bad status");
            form.reset();
            show("<strong>Thank you!</strong> Your request has been sent. We'll get back to you soon. For a faster response, call <a href='tel:" + PHONE + "'><strong>(818) 257-2338</strong></a>.");
          })
          .catch(function () {
            show("Sorry, something went wrong sending your request. Please call us at <a href='tel:" + PHONE + "'><strong>(818) 257-2338</strong></a>.", true);
          })
          .then(function () { btn.disabled = false; });
        return;
      }

      // Fallback: build a text message with the request details
      var lines = [
        "Free estimate request",
        "Name: " + data.get("name"),
        "Phone: " + data.get("phone"),
        data.get("email") ? "Email: " + data.get("email") : "",
        "Service: " + (select ? select.options[select.selectedIndex].text : data.get("service")),
        "Preferred contact: " + (data.get("contact_method") || "Phone call"),
        "Details: " + data.get("details")
      ].filter(Boolean).join("\n");
      var sep = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? "&" : "?";
      var smsHref = "sms:" + PHONE + sep + "body=" + encodeURIComponent(lines);
      show("<strong>Almost done!</strong> Tap below to send your request by text, or give us a call.<div class='btn-row' style='margin-top:14px'><a class='btn btn-primary' href='" + smsHref + "'>Send as Text Message</a><a class='btn btn-outline' href='tel:" + PHONE + "'>Call (818) 257-2338</a></div>");
    });
  }

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
