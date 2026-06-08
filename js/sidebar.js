/* CityWide — Telegram-inspired floating bottom navigation for mobile.
   Auto-injects into public pages. Hidden on admin/superadmin areas. */
(function () {
  if (window.__cwMobNavInit) return;
  window.__cwMobNavInit = true;

  function init() {
    if (document.body.dataset.cwGuard) return; // skip admin/superadmin
    if (document.body.querySelector(".cw-mobnav")) return;

    var path = (location.pathname.split("/").pop() || "home.html").toLowerCase();
    var items = [
      { id: "home",      icon: "bi-house-door-fill", label: "Home",     href: "home.html",        match: ["home.html","",""] },
      { id: "browse",    icon: "bi-compass",         label: "Browse",   href: "listings.html",    match: ["listings.html","view-details.html"] },
      { id: "list",      icon: "bi-plus-circle-fill",label: "List",     href: "add-item.html",    match: ["add-item.html"] },
      { id: "contact",   icon: "bi-envelope-fill",   label: "Contact",  href: "contact.html",     match: ["contact.html"] },
      { id: "profile",   icon: "bi-person-circle",   label: "Profile",  href: "dashboard.html",   match: ["dashboard.html","profile.html","settings.html","messages.html","wishlist.html","my-listings.html","earnings.html"] }
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
