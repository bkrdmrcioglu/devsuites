/**
 * Shared marketing header — single source of truth for static HTML pages.
 * Keep product list in sync with `lib/siteNav.ts`.
 *
 * Usage:
 *   <div data-site-header data-current="devmail" data-download="#download"></div>
 *   <script src="/site-header.js?v=1"></script>
 */
(function () {
  var PRODUCTS = [
    { id: "devdock", label: "DevDock", href: "/devdock/" },
    { id: "devmail", label: "DevMail", href: "/devmail/" },
    { id: "devsql", label: "DevSQL", href: "/devsql/" },
    { id: "devcheck", label: "DevCheck", href: "/devcheck/" },
  ];
  var PORTAL = { id: "licenses", label: "Licenses", href: "/licenses" };

  function mount(root) {
    var current = (root.getAttribute("data-current") || "").toLowerCase();
    var download =
      root.getAttribute("data-download") ||
      (current === "home" || current === "licenses" ? "/#apps" : "#download");

    var links = PRODUCTS.map(function (item) {
      var currentAttr = current === item.id ? ' aria-current="page"' : "";
      return '<a href="' + item.href + '"' + currentAttr + ">" + item.label + "</a>";
    }).join("");

    var portalCurrent = current === PORTAL.id ? ' aria-current="page"' : "";
    links +=
      '<a href="' +
      PORTAL.href +
      '"' +
      portalCurrent +
      ">" +
      PORTAL.label +
      "</a>";
    links += '<a href="' + download + '" class="nav-cta">Download</a>';

    var header = document.createElement("header");
    header.className = "top";
    header.innerHTML =
      '<a class="brand" href="/">' +
      '<img src="/assets/mark.png" width="28" height="28" alt="" />' +
      "DevSuites" +
      "</a>" +
      '<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="site-nav" aria-label="Menu">' +
      "<span></span><span></span>" +
      "</button>" +
      '<nav id="site-nav">' +
      links +
      "</nav>";

    root.replaceWith(header);
    wireToggle(header);
  }

  function wireToggle(header) {
    var toggle = header.querySelector(".nav-toggle");
    var nav = header.querySelector("#site-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function boot() {
    document.querySelectorAll("[data-site-header]").forEach(mount);
  }

  // Script sits right after the mount point — run immediately to avoid an empty header flash.
  boot();
})();
