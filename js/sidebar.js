/* CityWide — mobile navigation injector.
   - Public pages: floating bottom nav (Telegram-style).
   - Admin / Superadmin: floating top-left three-dots that opens the sidebar as a left drawer. */
(function () {
  if (window.__cwMobNavInit) return;
  window.__cwMobNavInit = true;

  function initPublic() {
    if (document.body.querySelector(".cw-mobnav")) return;
    var path = (location.pathname.split("/").pop() || "home.html").toLowerCase();
    var items = [
      { id: "home",    icon: "bi-house-door-fill", label: "Home",    href: "home.html",      match: ["home.html",""] },
      { id: "browse",  icon: "bi-compass",         label: "Browse",  href: "listings.html",  match: ["listings.html","view-details.html"] },
      { id: "list",    icon: "bi-plus-circle-fill",label: "List",    href: "add-item.html",  match: ["add-item.html"] },
      { id: "contact", icon: "bi-envelope-fill",   label: "Contact", href: "contact.html",   match: ["contact.html"] },
      { id: "profile", icon: "bi-person-circle",   label: "Profile", href: "dashboard.html", match: ["dashboard.html","profile.html","settings.html","messages.html","wishlist.html","my-listings.html","earnings.html"] }
    ];
    var nav = document.createElement("nav");
    nav.className = "cw-mobnav";
    nav.setAttribute("aria-label", "Mobile navigation");
    items.forEach(function (it) {
      var a = document.createElement("a");
      a.href = it.href;
      a.className = "cw-mobnav__item";
      if (it.match.indexOf(path) !== -1) a.classList.add("is-active");
      a.innerHTML = '<i class="bi ' + it.icon + '"></i><span>' + it.label + '</span>';
      nav.appendChild(a);
    });
    document.body.appendChild(nav);
  }

  function initAdminDrawer() {
    if (document.body.querySelector(".cw-admin-mob-toggle")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cw-admin-mob-toggle";
    btn.setAttribute("aria-label", "Open menu");
    btn.innerHTML = '<i class="bi bi-three-dots-vertical"></i>';

    var backdrop = document.createElement("div");
    backdrop.className = "cw-admin-mob-backdrop";

    function toggle(open) {
      var isOpen = (typeof open === "boolean") ? open : !document.body.classList.contains("cw-mob-sidebar-open");
      document.body.classList.toggle("cw-mob-sidebar-open", isOpen);
      btn.innerHTML = isOpen
        ? '<i class="bi bi-x-lg"></i>'
        : '<i class="bi bi-three-dots-vertical"></i>';
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    btn.addEventListener("click", function () { toggle(); });
    backdrop.addEventListener("click", function () { toggle(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggle(false);
    });
    // Close drawer when a sidebar link is clicked
    document.addEventListener("click", function (e) {
      var link = e.target.closest(".cw-sidebar a");
      if (link) toggle(false);
    });

    document.body.appendChild(btn);
    document.body.appendChild(backdrop);
  }

  function init() {
    var guard = document.body.dataset.cwGuard;
    if (guard === "admin" || guard === "superadmin") {
      initAdminDrawer();
    } else {
      initPublic();
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
