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
    var guard = document.body.dataset.cwGuard || "";
    var isAdminArea = guard === "admin" || guard === "superadmin";

    var container = navbar.querySelector(".container, .container-fluid");
    if (!container) return;
    if (isAdminArea) {
      navbar.remove();
      return;
    }

    // Build / find right-side action group
    container = navbar.querySelector(".container, .container-fluid");
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
        '<li><button class="dropdown-item active" type="button" data-cw-lang="en" data-lang-btn="en"><i class="bi bi-globe2 me-2"></i>English (EN)</button></li>'+
        '<li><button class="dropdown-item" type="button" data-cw-lang="so" data-lang-btn="so"><i class="bi bi-translate me-2"></i>Somali (SO)</button></li>'+
        '<li><hr class="dropdown-divider"></li>'+
        '<li><a class="dropdown-item" href="'+(isAdminArea ? "../login.html" : "login.html")+'"><i class="bi bi-box-arrow-in-right me-2"></i>Sign In</a></li>'+
        '<li><hr class="dropdown-divider"></li>'+
        '<li class="dropdown-header small text-uppercase">Appearance</li>'+
        '<li><button class="dropdown-item" type="button" data-cw-more-theme>'+
          '<i class="bi bi-moon-stars-fill me-2" data-cw-more-theme-icon></i>'+
          '<span data-cw-more-theme-label>Dark Mode</span>'+
        '</button></li>'+
      '</ul>';
    actions.appendChild(wrap);

    wrap.querySelectorAll("[data-cw-lang]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var lang = btn.getAttribute("data-cw-lang");
        if (window.cwSetLanguage) window.cwSetLanguage(lang);
        else {
          try { localStorage.setItem("cw_lang", lang); } catch(e){}
          document.documentElement.setAttribute("lang", lang === "so" ? "so" : "en");
        }
      });
    });

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

    cleanupDuplicateNavControls(navbar);
  }

  function cleanupDuplicateNavControls(navbar){
    var collapse = navbar.querySelector("#mainNav, .navbar-collapse");
    if (!collapse) return;
    collapse.querySelectorAll(".cw-desktop-auth").forEach(function(el){ el.remove(); });
    var clusters = collapse.querySelectorAll(".cw-nav-cluster");
    clusters.forEach(function(cluster, idx){ if (idx > 0) cluster.remove(); });
    var host = collapse.querySelector(".cw-nav-cluster") || collapse;
    host.querySelectorAll(".cw-lang-switch").forEach(function(el, idx){ if (idx > 0) el.remove(); });
    host.querySelectorAll("[data-theme-toggle]").forEach(function(el, idx){ if (idx > 0) el.remove(); });
  }

  /* ---------- 2. Back buttons intentionally disabled ---------- */
  function setupBackButton(){
    document.querySelectorAll(".cw-back-btn").forEach(function(btn){ btn.remove(); });
  }

  function removeRangeLabels(){
    document.querySelectorAll("#cwRangeLabel").forEach(function(label){
      var host = label.closest(".text-muted.small, .ms-auto, div");
      if (host) host.remove();
      else label.remove();
    });
  }

  /* ---------- 2b. Dashboard sidebar collapse + mobile drawer ---------- */
  function setupDashboardSidebar(){
    var sidebar = document.querySelector("body[data-cw-guard='user'] .cw-sidebar, body[data-cw-guard='profile'] .cw-sidebar");
    if (!sidebar || sidebar.dataset.cwUserSidebarEnhanced) return;
    sidebar.dataset.cwUserSidebarEnhanced = "1";
    document.body.classList.add("cw-user-shell");

    sidebar.querySelectorAll(".nav-link").forEach(function(link){
      if (link.querySelector(".cw-sidebar-label")) return;
      var label = "";
      Array.prototype.slice.call(link.childNodes).forEach(function(node){
        if (node.nodeType === 3 && node.nodeValue.trim()) {
          label += node.nodeValue.trim();
          node.nodeValue = "";
        }
      });
      if (label) {
        var span = document.createElement("span");
        span.className = "cw-sidebar-label";
        span.textContent = label;
        link.appendChild(span);
      }
      link.setAttribute("title", (link.textContent || "").trim());
    });

    var logo = sidebar.querySelector(".cw-sidebar-logo") || sidebar.firstElementChild;
    if (logo && !logo.querySelector("[data-cw-user-sidebar-toggle]")) {
      var toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "cw-sidebar-toggle cw-user-sidebar-toggle";
      toggle.setAttribute("data-cw-user-sidebar-toggle", "");
      toggle.setAttribute("aria-label", "Toggle dashboard sidebar");
      toggle.innerHTML = '<i class="bi bi-chevron-left"></i>';
      toggle.addEventListener("click", function(){
        var collapsed = !document.body.classList.contains("cw-user-sidebar-collapsed");
        document.body.classList.toggle("cw-user-sidebar-collapsed", collapsed);
        toggle.querySelector("i").className = collapsed ? "bi bi-chevron-right" : "bi bi-chevron-left";
      });
      logo.appendChild(toggle);
    }

    if (!document.querySelector("[data-cw-mobile-dashboard-toggle]")) {
      var mobile = document.createElement("button");
      mobile.type = "button";
      mobile.className = "cw-mobile-dashboard-toggle";
      mobile.setAttribute("data-cw-mobile-dashboard-toggle", "");
      mobile.setAttribute("aria-expanded", "false");
      mobile.innerHTML = '<i class="bi bi-list"></i><span>Dashboard Menu</span>';
      mobile.addEventListener("click", function(){
        var open = !document.body.classList.contains("cw-mobile-dashboard-open");
        document.body.classList.toggle("cw-mobile-dashboard-open", open);
        mobile.setAttribute("aria-expanded", open ? "true" : "false");
        mobile.querySelector("i").className = open ? "bi bi-x-lg" : "bi bi-list";
      });
      sidebar.parentNode.insertBefore(mobile, sidebar);
    }
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
    removeRangeLabels();
    setupDashboardSidebar();
    setupPasswordEyes();
    // Re-scan for password fields injected later (modals etc.)
    var mo = new MutationObserver(function(){ setupPasswordEyes(); });
    mo.observe(document.body, { childList:true, subtree:true });
  });
})();
