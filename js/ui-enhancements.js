/* CityWide — Global UI enhancements (v4)
   - Public pages: top nav visible on desktop/tablet; on mobile (<992px) the
     nav links collapse into a three-dot menu with Sign In, Theme, Language.
   - Dashboards (user/admin/super-admin): inline Language (EN/SO) + Theme
     controls in the top action bar. No three-dot menu, no top-nav dropdown.
   - Hides Sign In when a user is signed in (cw_user in localStorage).
   - Adds password eye toggles. No back button.
*/
(function () {
  if (window.__cwUiEnh) return;
  window.__cwUiEnh = true;

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function getUser(){
    try { return JSON.parse(localStorage.getItem("cw_user")||"null"); } catch(e){ return null; }
  }
  function getTheme(){ return localStorage.getItem("cw_theme") || "light"; }
  function applyThemeAttr(t){
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.classList.toggle("dark", t === "dark");
    document.querySelectorAll("[data-theme-icon]").forEach(function(el){
      el.className = t === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
  }
  function toggleTheme(){
    var next = getTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem("cw_theme", next); } catch(e){}
    applyThemeAttr(next);
    // Notify listeners (charts, etc.)
    document.dispatchEvent(new CustomEvent("cw:themechange", { detail:{ theme: next } }));
  }
  function getLang(){ return localStorage.getItem("cw_lang") || "en"; }
  function setLang(l){
    try { localStorage.setItem("cw_lang", l); } catch(e){}
    // Defer to app.js i18n if exposed; otherwise click an existing lang button.
    if (typeof window.cwSetLang === "function") { window.cwSetLang(l); return; }
    var btn = document.querySelector('[data-lang-btn="'+l+'"]');
    if (btn) { btn.click(); return; }
    // Fallback: reload so other code can pick up the preference.
    location.reload();
  }

  /* ---------- 1. Inject CSS for mobile menu + dashboard controls ---------- */
  function injectCss(){
    if (document.getElementById("cw-ui-enh-css")) return;
    var s = document.createElement("style");
    s.id = "cw-ui-enh-css";
    s.textContent = [
      /* Mobile-only three-dot menu trigger on public pages */
      ".cw-more-menu .cw-more-btn{ width:38px; height:38px; display:inline-flex; align-items:center; justify-content:center; padding:0; border-radius:10px; }",
      ".cw-more-dropdown{ min-width: 220px; padding:.5rem; border-radius:14px; border:1px solid rgba(0,0,0,.08); }",
      ".cw-more-dropdown .dropdown-header{ font-weight:700; letter-spacing:.06em; color:#6b7280; padding-top:.4rem; }",
      ".cw-more-dropdown .dropdown-item{ border-radius:8px; padding:.5rem .65rem; font-weight:500; }",
      ".cw-more-dropdown .dropdown-item.active, .cw-more-dropdown .dropdown-item:active{ background-color: var(--cw-primary, #0d6efd); color:#fff; }",
      /* On the public site, show the three-dot only on mobile */
      "body:not([data-cw-guard]) .cw-more-menu{ display:none; }",
      "@media (max-width: 991.98px){ body:not([data-cw-guard]) .cw-more-menu{ display:inline-block; } }",
      /* On mobile, the standalone Sign In button hides; it lives inside the menu */
      "@media (max-width: 991.98px){ body:not([data-cw-guard]) .cw-navbar .cw-signin-btn{ display:none !important; } }",
      /* Dashboard inline lang switch */
      ".cw-lang-pill{ display:inline-flex; align-items:center; border:1px solid rgba(0,0,0,.12); border-radius:999px; overflow:hidden; }",
      ".cw-lang-pill button{ background:transparent; border:0; padding:.25rem .6rem; font-size:.75rem; font-weight:700; color:inherit; }",
      ".cw-lang-pill button.is-active{ background: var(--cw-primary, #0d6efd); color:#fff; }",
      ":root[data-theme=\"dark\"] .cw-lang-pill{ border-color: rgba(255,255,255,.15); }",
      ":root[data-theme=\"dark\"] .cw-more-dropdown{ background:#1c2230; color:#e9ecef; border-color:#2b3340; }",
      ":root[data-theme=\"dark\"] .cw-more-dropdown .dropdown-header{ color:#9aa4b2; }",
      ":root[data-theme=\"dark\"] .cw-more-dropdown .dropdown-item{ color:#e9ecef; }",
      ":root[data-theme=\"dark\"] .cw-more-dropdown .dropdown-divider{ border-color:#2b3340; }",
      /* Hero featured card: smaller, right-aligned, never covers CTAs on lg+ */
      ".cw-hero-featured-card{ left:auto !important; right:24px !important; bottom:20px !important; max-width:260px !important; padding:10px 12px !important; gap:10px !important; }",
      ".cw-hero-featured-card img{ width:46px !important; height:46px !important; flex:0 0 46px !important; }",
      ".cw-hero-featured-card .cw-hf-title{ font-size:.85rem !important; }",
      ".cw-hero-featured-card .cw-hf-desc{ font-size:.72rem !important; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; margin-bottom:4px !important; }",
      "@media (max-width: 991.98px){ .cw-hero-featured-card{ display:none !important; } }",
      /* Remove the old back button if present */
      ".cw-back-btn{ display:none !important; }"
    ].join("\n");
    document.head.appendChild(s);
  }

  /* ---------- 2. Build three-dot menu on PUBLIC pages (mobile) ---------- */
  function setupPublicMobileMenu(){
    var navbar = document.querySelector(".cw-navbar");
    if (!navbar) return;
    if (document.body.dataset.cwGuard) return; // skip dashboards

    var container = navbar.querySelector(".container, .container-fluid");
    if (!container) return;

    // Place the menu next to the toggler (so it's visible without expanding nav)
    var toggler = navbar.querySelector(".navbar-toggler");

    if (container.querySelector("[data-cw-more]")) return;

    var u = getUser();
    var wrap = document.createElement("div");
    wrap.className = "dropdown cw-more-menu";
    wrap.innerHTML =
      '<button type="button" class="btn btn-sm btn-outline-secondary cw-more-btn" data-cw-more aria-label="More options" data-bs-toggle="dropdown" aria-expanded="false">'+
        '<i class="bi bi-three-dots-vertical"></i>'+
      '</button>'+
      '<ul class="dropdown-menu dropdown-menu-end cw-more-dropdown shadow">'+
        (u ? '' : '<li><a class="dropdown-item" href="login.html"><i class="bi bi-box-arrow-in-right me-2"></i>Sign In</a></li><li><hr class="dropdown-divider"></li>')+
        '<li class="dropdown-header small text-uppercase">Appearance</li>'+
        '<li><button class="dropdown-item" type="button" data-cw-more-theme>'+
          '<i class="bi bi-moon-stars-fill me-2" data-cw-more-theme-icon></i>'+
          '<span data-cw-more-theme-label>Dark Mode</span>'+
        '</button></li>'+
        '<li><hr class="dropdown-divider"></li>'+
        '<li class="dropdown-header small text-uppercase">Language</li>'+
        '<li><button class="dropdown-item" type="button" data-cw-more-lang="en"><i class="bi bi-globe2 me-2"></i>English (EN)</button></li>'+
        '<li><button class="dropdown-item" type="button" data-cw-more-lang="so"><i class="bi bi-translate me-2"></i>Af-Soomaali (SO)</button></li>'+
      '</ul>';

    // Insert right after the toggler so it sits in the top bar on mobile
    if (toggler && toggler.parentNode) {
      toggler.parentNode.insertBefore(wrap, toggler);
    } else {
      container.appendChild(wrap);
    }

    function syncTheme(){
      var dark = getTheme() === "dark";
      var lbl = wrap.querySelector("[data-cw-more-theme-label]");
      var ico = wrap.querySelector("[data-cw-more-theme-icon]");
      if (lbl) lbl.textContent = dark ? "Light Mode" : "Dark Mode";
      if (ico) ico.className = (dark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill") + " me-2";
      if (ico) ico.setAttribute("data-cw-more-theme-icon","");
    }
    function syncLang(){
      var l = getLang();
      wrap.querySelectorAll("[data-cw-more-lang]").forEach(function(b){
        b.classList.toggle("active", b.getAttribute("data-cw-more-lang") === l);
      });
    }
    syncTheme(); syncLang();
    wrap.querySelector("[data-cw-more-theme]").addEventListener("click", function(){
      toggleTheme(); setTimeout(syncTheme, 20);
    });
    wrap.querySelectorAll("[data-cw-more-lang]").forEach(function(b){
      b.addEventListener("click", function(){ setLang(b.getAttribute("data-cw-more-lang")); syncLang(); });
    });
    document.addEventListener("cw:themechange", syncTheme);

    // If user is signed in, scrub Sign In links from anywhere in the nav
    if (u) {
      navbar.querySelectorAll('a[href="login.html"], a[href="register.html"]').forEach(function(a){
        var li = a.closest("li"); (li || a).remove();
      });
    }
  }

  /* ---------- 3. Dashboards (user/admin/super) inline EN/SO + theme ---------- */
  function setupDashboardControls(){
    var guard = document.body.dataset.cwGuard;
    var navbar = document.querySelector(".cw-navbar");
    if (!navbar) return;

    // USER dashboard pages don't set data-cw-guard but have a profile dropdown.
    var isDashish = guard === "admin" || guard === "superadmin" || guard === "user";
    // Detect "logged-in look": page has a sidebar OR a profile dropdown.
    var hasSidebar = !!document.querySelector(".cw-sidebar");
    if (!isDashish && !hasSidebar) return;

    var container = navbar.querySelector(".container, .container-fluid");
    if (!container) return;
    // Find an actions row to inject into (admin/super use d-flex ms-auto)
    var actions = container.querySelector(".ms-auto.d-flex, .d-flex.ms-auto, .cw-nav-cluster");
    if (!actions) return;

    if (actions.querySelector(".cw-lang-pill")) return;

    // Language pill
    var pill = document.createElement("div");
    pill.className = "cw-lang-pill";
    pill.innerHTML =
      '<button type="button" data-cw-dash-lang="en">EN</button>'+
      '<button type="button" data-cw-dash-lang="so">SO</button>';
    function syncPill(){
      var l = getLang();
      pill.querySelectorAll("[data-cw-dash-lang]").forEach(function(b){
        b.classList.toggle("is-active", b.getAttribute("data-cw-dash-lang") === l);
      });
    }
    pill.addEventListener("click", function(e){
      var b = e.target.closest("[data-cw-dash-lang]"); if (!b) return;
      setLang(b.getAttribute("data-cw-dash-lang")); syncPill();
    });
    syncPill();
    actions.insertBefore(pill, actions.firstChild);

    // Ensure a theme toggle exists (admin/super already render one). If missing, add.
    if (!actions.querySelector("[data-theme-toggle]")) {
      var tBtn = document.createElement("button");
      tBtn.type = "button";
      tBtn.className = "btn btn-sm btn-outline-secondary";
      tBtn.setAttribute("data-theme-toggle", "");
      tBtn.setAttribute("aria-label","Toggle dark mode");
      tBtn.innerHTML = '<i data-theme-icon class="bi '+ (getTheme()==="dark"?"bi-sun-fill":"bi-moon-stars-fill") +'"></i>';
      tBtn.addEventListener("click", toggleTheme);
      actions.insertBefore(tBtn, pill.nextSibling);
    } else {
      // Wrap the existing toggle so it also dispatches our event for charts
      var existing = actions.querySelector("[data-theme-toggle]");
      existing.addEventListener("click", function(){
        // app.js already toggled; dispatch our event after a tick
        setTimeout(function(){
          document.dispatchEvent(new CustomEvent("cw:themechange", { detail:{ theme: getTheme() } }));
        }, 0);
      });
    }
  }

  /* ---------- 4. Hide Sign In when authenticated (all pages) ---------- */
  function scrubSignInIfAuthed(){
    if (!getUser()) return;
    document.querySelectorAll('.cw-navbar a[href$="login.html"], .cw-navbar a[href$="register.html"], .cw-signin-btn').forEach(function(a){
      var li = a.closest("li"); (li || a).remove();
    });
  }

  /* ---------- 5. Password eye icons ---------- */
  function setupPasswordEyes(){
    document.querySelectorAll('input[type="password"]').forEach(function(inp){
      if (inp.dataset.cwEye) return;
      inp.dataset.cwEye = "1";
      var wrap;
      if (inp.parentElement && inp.parentElement.classList.contains("cw-pass-wrap")) wrap = inp.parentElement;
      else {
        wrap = document.createElement("div");
        wrap.className = "cw-pass-wrap";
        inp.parentNode.insertBefore(wrap, inp);
        wrap.appendChild(inp);
      }
      var btn = document.createElement("button");
      btn.type = "button"; btn.className = "cw-pass-eye"; btn.setAttribute("aria-label","Show password");
      btn.innerHTML = '<i class="bi bi-eye"></i>';
      btn.addEventListener("click", function(){
        var showing = inp.type === "text";
        inp.type = showing ? "password" : "text";
        btn.innerHTML = showing ? '<i class="bi bi-eye"></i>' : '<i class="bi bi-eye-slash"></i>';
      });
      wrap.appendChild(btn);
    });
  }

  /* ---------- 6. Remove any pre-existing back button ---------- */
  function removeBackButton(){
    document.querySelectorAll(".cw-back-btn").forEach(function(b){ b.remove(); });
  }

  ready(function(){
    injectCss();
    setupPublicMobileMenu();
    setupDashboardControls();
    scrubSignInIfAuthed();
    setupPasswordEyes();
    removeBackButton();
    var mo = new MutationObserver(function(){
      setupPasswordEyes();
      scrubSignInIfAuthed();
      removeBackButton();
    });
    mo.observe(document.body, { childList:true, subtree:true });
  });
})();
