/* CityWide — Global UI enhancements
   - Removes top nav dropdown on public pages (keeps logo + mobile bottom nav)
   - Adds 3-dot menu (top-right) with Language (EN) + Light/Dark toggle
   - Adds Back button (top-left) when arriving from another in-app page
   - Adds show/hide eye icon to every password input
*/
(function () {
  if (window.__cwUiEnh) return;
  window.__cwUiEnh = true;

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  /* ---------- 1. Top nav cleanup + 3-dot menu ---------- */
  function setupTopNav(){
    var navbar = document.querySelector(".cw-navbar");
    if (!navbar) return;
    var isAdminArea = !!document.body.dataset.cwGuard;

    if (!isAdminArea) {
      // Remove the dropdown menu (links + sign-in collapse) on public pages.
      var toggler = navbar.querySelector(".navbar-toggler");
      if (toggler) toggler.remove();
      var collapse = navbar.querySelector("#mainNav, .navbar-collapse");
      if (collapse) collapse.remove();
    }

    // Build / find right-side action group
    var container = navbar.querySelector(".container, .container-fluid");
    if (!container) return;
    var actions = container.querySelector(".cw-nav-actions");
    if (!actions) {
      actions = document.createElement("div");
      actions.className = "cw-nav-actions ms-auto d-flex align-items-center gap-2";
      container.appendChild(actions);
    }

    // Build the three-dot menu (skip if there's already one)
    if (actions.querySelector("[data-cw-more]")) return;

    var wrap = document.createElement("div");
    wrap.className = "dropdown cw-more-menu";
    wrap.innerHTML =
      '<button type="button" class="btn btn-sm btn-outline-secondary cw-more-btn" data-cw-more aria-label="More options" data-bs-toggle="dropdown" aria-expanded="false">'+
        '<i class="bi bi-three-dots-vertical"></i>'+
      '</button>'+
      '<ul class="dropdown-menu dropdown-menu-end cw-more-dropdown shadow">'+
        '<li class="dropdown-header small text-uppercase">Language</li>'+
        '<li><button class="dropdown-item active" type="button" data-cw-lang="en"><i class="bi bi-globe2 me-2"></i>English (EN)</button></li>'+
        '<li><hr class="dropdown-divider"></li>'+
        '<li class="dropdown-header small text-uppercase">Appearance</li>'+
        '<li><button class="dropdown-item" type="button" data-cw-more-theme>'+
          '<i class="bi bi-moon-stars-fill me-2" data-cw-more-theme-icon></i>'+
          '<span data-cw-more-theme-label>Dark Mode</span>'+
        '</button></li>'+
      '</ul>';
    actions.appendChild(wrap);

    // Theme toggle inside menu — delegates to existing theme system if available.
    function syncThemeLabel(){
      var isDark = document.documentElement.getAttribute("data-theme") === "dark"
                || document.documentElement.classList.contains("dark");
      var lbl = wrap.querySelector("[data-cw-more-theme-label]");
      var ico = wrap.querySelector("[data-cw-more-theme-icon]");
      if (lbl) lbl.textContent = isDark ? "Light Mode" : "Dark Mode";
      if (ico) ico.className = (isDark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill") + " me-2";
      ico && ico.setAttribute("data-cw-more-theme-icon", "");
    }
    syncThemeLabel();
    wrap.querySelector("[data-cw-more-theme]").addEventListener("click", function(){
      var existing = document.querySelector("[data-theme-toggle]");
      if (existing && existing !== this) { existing.click(); }
      else {
        var html = document.documentElement;
        var dark = html.getAttribute("data-theme") === "dark";
        html.setAttribute("data-theme", dark ? "light" : "dark");
        html.classList.toggle("dark", !dark);
        try { localStorage.setItem("cw_theme", dark ? "light" : "dark"); } catch(e){}
      }
      setTimeout(syncThemeLabel, 30);
    });

    // Hide redundant standalone theme toggle in admin/superadmin top bars
    // (the same control is now in the 3-dot menu).
    var standalone = container.querySelector("[data-theme-toggle]");
    if (standalone && standalone.closest(".cw-nav-actions") !== actions) {
      // keep it (it's outside our actions container)
    }
  }

  /* ---------- 2. Back buttons intentionally disabled ---------- */
  function setupBackButton(){
    document.querySelectorAll(".cw-back-btn").forEach(function(btn){ btn.remove(); });
  }

  /* ---------- 3. Password eye icons ---------- */
  function setupPasswordEyes(){
    var inputs = document.querySelectorAll('input[type="password"]');
    inputs.forEach(function(inp){
      if (inp.dataset.cwEye) return;
      inp.dataset.cwEye = "1";

      // Wrap if not already wrapped
      var wrap;
      if (inp.parentElement && inp.parentElement.classList.contains("cw-pass-wrap")) {
        wrap = inp.parentElement;
      } else {
        wrap = document.createElement("div");
        wrap.className = "cw-pass-wrap";
        inp.parentNode.insertBefore(wrap, inp);
        wrap.appendChild(inp);
      }

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cw-pass-eye";
      btn.setAttribute("aria-label", "Show password");
      btn.innerHTML = '<i class="bi bi-eye"></i>';
      btn.addEventListener("click", function(){
        var showing = inp.type === "text";
        inp.type = showing ? "password" : "text";
        btn.innerHTML = showing ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
        btn.setAttribute("aria-label", showing ? "Show password" : "Hide password");
      });
      wrap.appendChild(btn);
    });
  }

  ready(function(){
    setupTopNav();
    setupBackButton();
    setupPasswordEyes();
    // Re-scan for password fields injected later (modals etc.)
    var mo = new MutationObserver(function(){ setupPasswordEyes(); });
    mo.observe(document.body, { childList:true, subtree:true });
  });
})();
