(function(){
  function rootPrefix(){
    var p = location.pathname.replace(/\\/g, "/");
    if (/\/pages\/(admin|superadmin)\//.test(p)) return "../../";
    if (/\/pages\//.test(p)) return "../";
    if (/\/(admin|superadmin)\//.test(p)) return "../";
    return "";
  }
  window.cwRootPrefix = rootPrefix;
  window.cwPath = function(path){
    if (!path || /^(https?:|data:|#|mailto:|tel:)/i.test(path)) return path;
    if (/^(\.\.?\/|\/)/.test(path)) return path;
    if (/^(assets|data|css|js)\//.test(path)) return rootPrefix() + path;
    return path;
  };
})();
/* Citywide Jigjiga — shared client script */
(function () {
  var USER_KEY = "cw_user";
  var THEME_KEY = "cw_theme";
  var LANG_KEY  = "cw_lang";

  // ===== User =====
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
    catch (e) { return null; }
  }
  function setUser(u) { localStorage.setItem(USER_KEY, JSON.stringify(u)); }
  function clearUser() { localStorage.removeItem(USER_KEY); }
  function initials(name) {
    if (!name) return "G";
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // ===== Theme =====
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.className = t === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
  }
  function getTheme() { return localStorage.getItem(THEME_KEY) || "light"; }
  function toggleTheme() {
    var next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }
  applyTheme(getTheme());

  // ===== i18n =====
  var DICT = {
    "Home":"Guriga","Browse":"Eeg","List Item":"Liis Geli","About":"Ku Saabsan","Contact":"Nala Soo Xiriir",
    "Sign In":"Soo Gal","Register":"Diiwaan Geli","Logout":"Ka Bax","Dashboard":"Dashboor","Profile":"Akoonkayga",
    "Find what you need":"Hel waxaad u baahan tahay","What do you need?":"Maxaad u baahan tahay?",
    "Search listings...":"Raadi liisaska...","Where in Jigjiga?":"Xaggee Jigjiga?","Search":"Raadi",
    "Browse Rentals":"Eeg Kirooyinka","List Your Item":"Liis Geli Alaabtaada",
    "View Details":"Eeg Faahfaahinta","View all":"Eeg dhammaan",
    "Popular categories":"Qaybaha caanka ah","Browse by category":"Eeg qayb walba",
    "Popular listings":"Liisaska caanka ah","Trending in Jigjiga right now":"Waxa Jigjiga ka socda hadda",
    "Available today":"La heli karo maanta","Ready for pickup now":"Diyaar u ah qaadis hadda",
    "Recently added":"Dhowaan la daray","Fresh on Citywide":"Cusub Citywide",
    "How it works":"Sida ay u shaqayso","Renting in Jigjiga, made simple":"Kireynta Jigjiga, oo fudud",
    "1. Search nearby":"1. Raadi meel u dhow","2. Book safely":"2. Buug si nabad ah","3. Pick up & enjoy":"3. Qaado oo ku raaxayso",
    "Filter by area, price, and availability across Jigjiga.":"Sift ku samee aag, qiimo iyo helitaan Jigjiga oo dhan.",
    "Payment held in escrow until handoff is complete.":"Lacagta waxaa lagu hayaa escrow ilaa wareejinta la dhammeeyo.",
    "Meet your verified neighbour, collect the item, return on time.":"La kulan deriskaaga xaqiijisan, qaado alaabta, soo celi waqtigeeda.",
    "Active listings":"Liisas firfircoon","Verified members":"Xubno xaqiijisan",
    "Jigjiga neighbourhoods":"Xaafadaha Jigjiga","Average rating":"Celceliska qiimaynta",
    "Explore":"Sahmin","Account":"Akoonka",
    "Trusted across Jigjiga · 2,400+ local listings":"Lagu kalsoon yahay Jigjiga oo dhan · 2,400+ liisas maxalli",
    "Rent Anything Nearby in Jigjiga":"Kireyso Wax Kasta oo Jigjiga ku yaal",
    "Jigjiga's trusted marketplace for renting and sharing items locally. Pay in ETB. Safe escrow on every booking.":
      "Suuqa lagu kalsoon yahay ee Jigjiga ee kireynta iyo wadaagista alaabta maxalli ahaan. Ku bixi ETB. Escrow nabdoon mar walba.",
    "Close":"Xidh","Request to Book":"Codso Buug","Item details":"Faahfaahinta Alaabta",
    "All areas":"Dhammaan aagagga","All categories":"Dhammaan qaybaha","Filter":"Sift",
    "Brand":"Astaanta","Model":"Nooca","Category":"Qaybta","Daily rental":"Kireynta maalinta",
    "Weekly rental":"Kireynta toddobaadka","Security deposit":"Dhigaalka damaanadda","Condition":"Xaaladda",
    "Availability":"Helitaan","Available":"La heli karo","Description":"Sharaxaad",
    "Owner":"Mulkiilaha","Rental requirements":"Shuruudaha kireynta",
    "Sign Out":"Ka Bax","Bookings":"Buugaagta","Messages":"Fariimaha","My Listings":"Liisaskayga",
    "Earnings":"Daqliga","Settings":"Dejimaha"
  };
  function getLang(){ return localStorage.getItem(LANG_KEY) || "en"; }
  function setLang(l){ localStorage.setItem(LANG_KEY, l); applyLang(l); }
  // Walk text nodes once and store originals
  function indexTextNodes(){
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function(n){
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        var tag = p.nodeName;
        if (tag==="SCRIPT"||tag==="STYLE"||tag==="NOAH") return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes=[], n;
    while ((n = walker.nextNode())) {
      if (!n.__cwOrig) n.__cwOrig = n.nodeValue;
      nodes.push(n);
    }
    // Also translatable placeholders
    document.querySelectorAll("[placeholder]").forEach(function(el){
      if (!el.__cwOrigPh) el.__cwOrigPh = el.getAttribute("placeholder");
    });
    // <option> values are within text nodes already.
    return nodes;
  }
  function translateString(s, lang){
    var key = s.trim();
    if (!key) return s;
    if (lang === "en") return s;
    if (DICT[key]) return s.replace(key, DICT[key]);
    return s;
  }
  function applyLang(lang){
    document.documentElement.setAttribute("lang", lang === "so" ? "so" : "en");
    var nodes = indexTextNodes();
    nodes.forEach(function(n){
      var orig = n.__cwOrig;
      if (lang === "en") { n.nodeValue = orig; return; }
      var key = orig.trim();
      if (DICT[key]) {
        n.nodeValue = orig.replace(key, DICT[key]);
      } else {
        n.nodeValue = orig;
      }
    });
    document.querySelectorAll("[placeholder]").forEach(function(el){
      var orig = el.__cwOrigPh;
      if (!orig) return;
      el.setAttribute("placeholder", lang==="en" ? orig : (DICT[orig.trim()] || orig));
    });
    // Update language switcher active state
    document.querySelectorAll("[data-lang-btn]").forEach(function(b){
      b.classList.toggle("active", b.getAttribute("data-lang-btn") === lang);
    });
  }

  // ===== Render dynamic user info =====
  function renderUser() {
    var u = getUser();
    var guard = document.body.getAttribute("data-cw-guard") || "";
    var fallbackName = guard === "superadmin" ? "Super Admin" : guard === "admin" ? "Admin" : "User";
    var name = (u && u.name) ? u.name : fallbackName;
    var area = (u && u.area) ? u.area : "Jigjiga Central";
    document.querySelectorAll("[data-user-name]").forEach(function (el) { el.textContent = name; });
    document.querySelectorAll("[data-user-area]").forEach(function (el) { el.textContent = area; });
    document.querySelectorAll("[data-user-initial]").forEach(function (el) { el.textContent = initials(name); });
    document.querySelectorAll(".cw-avatar").forEach(function (el) {
      if (!el.hasAttribute("data-user-initial") && el.textContent.trim().length <= 1) {
        el.textContent = initials(name);
      }
    });
    document.querySelectorAll(".cw-sidebar .fw-semibold.small").forEach(function (el) {
      if (el.textContent.trim() === "User") el.textContent = name;
    });
  }

  // ===== Navbar enhancements =====
  function enhanceNavbar() {
    var navbar = document.querySelector(".cw-navbar .container");
    if (!navbar) return;
    // Dashboard intentionally NOT injected into the navbar; it lives in the profile dropdown only.
    var navList = document.querySelector(".cw-navbar #mainNav .navbar-nav");
    if (navList) {
      navList.querySelectorAll('a[href="dashboard.html"]').forEach(function (a) {
        var li = a.closest("li"); if (li) li.remove(); else a.remove();
      });
    }
    // Active link
    var page = (location.pathname.split("/").pop() || "home.html").toLowerCase();
    document.querySelectorAll(".cw-navbar .nav-link, .cw-sidebar .nav-link").forEach(function (a) {
      var href = (a.getAttribute("href") || "").toLowerCase();
      if (href === page) a.classList.add("active"); else a.classList.remove("active");
    });

    var u = getUser();
    var navCollapse = document.querySelector(".cw-navbar #mainNav");
    if (!navCollapse) return;
    var btnRow = navCollapse.querySelector(".cw-nav-cluster");
    if (!btnRow) {
      btnRow = document.createElement("div");
      btnRow.className = "d-flex flex-column flex-lg-row align-items-lg-center ms-lg-auto cw-nav-cluster mt-2 mt-lg-0";
      // Place BEFORE existing right-side cluster (Sign In / profile dropdown) so EN/SO appears first
      var existingRight = navCollapse.querySelector(".d-flex.ms-lg-auto, .dropdown.ms-lg-auto");
      if (existingRight) {
        existingRight.classList.remove("ms-lg-auto");
        navCollapse.insertBefore(btnRow, existingRight);
      } else {
        navCollapse.appendChild(btnRow);
      }
    }

    // --- Build language switcher ---
    if (!btnRow.querySelector(".cw-lang-switch")) {
      var langWrap = document.createElement("div");
      langWrap.className = "cw-lang-switch";
      langWrap.innerHTML =
        '<button type="button" data-lang-btn="en" aria-label="English">EN</button>' +
        '<span class="cw-lang-sep">|</span>' +
        '<button type="button" data-lang-btn="so" aria-label="Af-Soomaali">SO</button>';
      langWrap.addEventListener("click", function(e){
        var b = e.target.closest("[data-lang-btn]");
        if (!b) return;
        setLang(b.getAttribute("data-lang-btn"));
      });
      btnRow.appendChild(langWrap);
    }

    // --- Compact theme toggle ---
    if (!btnRow.querySelector("[data-theme-toggle]")) {
      var tBtn = document.createElement("button");
      tBtn.type = "button";
      tBtn.setAttribute("data-theme-toggle", "");
      tBtn.className = "cw-theme-toggle";
      tBtn.title = "Toggle dark mode";
      tBtn.setAttribute("aria-label","Toggle dark mode");
      tBtn.innerHTML = '<i data-theme-icon class="bi bi-moon-stars-fill"></i>';
      tBtn.addEventListener("click", toggleTheme);
      btnRow.appendChild(tBtn);
    }

    // Pages can either have a hardcoded profile dropdown (dashboard area) or just a Sign In button (public area)
    navCollapse.querySelectorAll(".dropdown.ms-lg-auto, .cw-profile-link, .cw-profile-drop").forEach(function(el){ el.remove(); });
    if (u) {
      // Hide Sign In on public pages when signed in
      navCollapse.querySelectorAll('a[href="login.html"], a[href="register.html"]').forEach(function (a) { a.remove(); });
      btnRow.querySelectorAll(".cw-profile-drop").forEach(function(el){ el.remove(); });
    } else {
      var prof = btnRow.querySelector(".cw-profile-drop");
      if (prof) prof.remove();
      // On dashboard pages without a user, leave the hardcoded "Guest" dropdown in place
    }
  }

  // ===== Auth forms =====
  function bindAuthForms() {
    if (/register\.html$/i.test(location.pathname)) {
      var rform = document.querySelector("form");
      if (rform) {
        rform.addEventListener("submit", function () {
          var nameEl = rform.querySelector('input[name="fullName"], input[type="text"]');
          var emailEl = rform.querySelector('input[type="email"]');
          var areaEl = rform.querySelector("select");
          setUser({
            name: nameEl ? nameEl.value.trim() : "",
            email: emailEl ? emailEl.value.trim() : "",
            area: areaEl ? areaEl.value.trim() : ""
          });
        });
      }
    }
    if (/login\.html$/i.test(location.pathname)) {
      var lform = document.querySelector("form");
      if (lform) {
        lform.addEventListener("submit", function () {
          var nameEl = lform.querySelector('input[name="fullName"], input[type="text"]');
          var emailEl = lform.querySelector('input[type="email"]');
          var email = emailEl ? emailEl.value.trim() : "";
          var name = nameEl ? nameEl.value.trim() : "";
          if (!name) {
            name = email ? email.split("@")[0].replace(/[._-]+/g, " ") : "";
            name = name.replace(/\b\w/g, function (c) { return c.toUpperCase(); });
          }
          setUser({ name: name || "Member", email: email, area: "Jigjiga Central" });
        });
      }
    }
    if (/logout\.html$/i.test(location.pathname)) { clearUser(); }
  }

  // ===== Item details modal =====
  function ensureDetailsModal() {
    if (document.getElementById("cwDetailsModal")) return;
    var html =
      '<div class="modal fade" id="cwDetailsModal" tabindex="-1" aria-hidden="true">' +
        '<div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">' +
          '<div class="modal-content">' +
            '<div class="modal-header">' +
              '<h5 class="modal-title" id="cwDetailsTitle">Item details</h5>' +
              '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
            '</div>' +
            '<div class="modal-body" id="cwDetailsBody"></div>' +
            '<div class="modal-footer">' +
              '<button class="btn btn-outline-brand" data-bs-dismiss="modal">Close</button>' +
              '<a class="btn btn-brand" href="bookings.html"><i class="bi bi-calendar-check me-1"></i>Request to Book</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);
  }

  function inferBrandModel(name) {
    var tokens = (name || "").split(/\s+/);
    if (tokens.length >= 2) return { brand: tokens[0], model: tokens.slice(1).join(" ") };
    return { brand: name || "—", model: "—" };
  }

  function buildDetails(data) {
    var img = window.cwPath(data.img || "assets/images/electronics.jpg");
    var name = data.name || "Rental item";
    var bm = inferBrandModel(name);
    var category = data.category || "General";
    var location = data.location || "Jigjiga";
    var price = data.price || "—";
    var weekly = data.weekly || (data.priceNum ? Math.round(data.priceNum * 6).toLocaleString() + " ETB / week" : "Ask owner");
    var deposit = data.priceNum ? Math.round(data.priceNum * 2).toLocaleString() + " ETB" : "Ask owner";
    return (
      '<div class="row g-4">' +
        '<div class="col-md-6"><img src="' + img + '" alt="' + name + '" class="img-fluid rounded-3 w-100" style="object-fit:cover;max-height:320px"/></div>' +
        '<div class="col-md-6">' +
          '<span class="badge bg-brand-soft text-brand mb-2">' + category + '</span>' +
          '<h4 class="mb-1">' + name + '</h4>' +
          '<p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> ' + location + '</p>' +
          '<dl class="row small mb-0">' +
            '<dt class="col-5">Brand</dt><dd class="col-7">' + bm.brand + '</dd>' +
            '<dt class="col-5">Model</dt><dd class="col-7">' + bm.model + '</dd>' +
            '<dt class="col-5">Category</dt><dd class="col-7">' + category + '</dd>' +
            '<dt class="col-5">Daily rental</dt><dd class="col-7 fw-bold text-brand">' + price + '</dd>' +
            '<dt class="col-5">Weekly rental</dt><dd class="col-7">' + weekly + '</dd>' +
            '<dt class="col-5">Security deposit</dt><dd class="col-7">' + deposit + '</dd>' +
            '<dt class="col-5">Condition</dt><dd class="col-7">Excellent — recently serviced</dd>' +
            '<dt class="col-5">Availability</dt><dd class="col-7"><span class="badge bg-success">Available</span></dd>' +
          '</dl>' +
        '</div>' +
        '<div class="col-12">' +
          '<h6 class="mt-2">Description</h6>' +
          '<p class="small text-muted mb-3">High-quality ' + name + ' available for short and long-term rental in ' + location + '. Well-maintained, ready for pickup. Includes accessories and a quick handover from the owner.</p>' +
          '<div class="row g-3">' +
            '<div class="col-md-6">' +
              '<h6 class="mb-1">Owner</h6>' +
              '<div class="d-flex align-items-center"><span class="cw-avatar me-2">A</span><div><div class="fw-semibold small">Verified Jigjiga owner</div><div class="text-muted small"><i class="bi bi-star-fill text-warning"></i> 4.9 · Responds within 1 hour</div></div></div>' +
            '</div>' +
            '<div class="col-md-6">' +
              '<h6 class="mb-1">Rental requirements</h6>' +
              '<ul class="small text-muted mb-0 ps-3"><li>Valid Kebele ID or passport</li><li>Refundable deposit on pickup</li><li>Return in original condition</li></ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function openDetails(data) {
    ensureDetailsModal();
    document.getElementById("cwDetailsTitle").textContent = data.name || "Item details";
    document.getElementById("cwDetailsBody").innerHTML = buildDetails(data);
    // re-apply current language to the freshly inserted content
    applyLang(getLang());
    var modalEl = document.getElementById("cwDetailsModal");
    if (window.bootstrap && bootstrap.Modal) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  }

  function parsePrice(text) {
    if (!text) return { text: "—", num: 0 };
    var m = text.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
    var num = m ? parseFloat(m[1]) : 0;
    return { text: text.trim(), num: num };
  }

  function wireItemCards() {
    ensureDetailsModal();
    document.querySelectorAll(".cw-card").forEach(function (card) {
      var img = card.querySelector("img");
      var title = card.querySelector("h6");
      if (!title) return;
      var badge = card.querySelector(".badge");
      var loc = card.querySelector(".bi-geo-alt") ? card.querySelector(".bi-geo-alt").parentNode.textContent.trim() : "";
      var priceEl = card.querySelector(".fw-bold.text-brand, .cw-feature-price");
      var p = parsePrice(priceEl ? priceEl.textContent : "");
      var data = {
        name: title.textContent.trim(),
        category: badge ? badge.textContent.trim() : "General",
        location: loc.replace(/^\s*/, ""),
        price: p.text,
        priceNum: p.num,
        img: img ? img.getAttribute("src") : ""
      };
      var actionAnchor = card.querySelector('a.btn-outline-brand, a.btn-sm');
      var existingBtn = card.querySelector('button[data-cw-details]');
      if (existingBtn) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-cw-details","");
      btn.className = "btn btn-sm btn-outline-brand";
      btn.textContent = "View Details";
      btn.addEventListener("click", function () { openDetails(data); });
      if (actionAnchor) {
        actionAnchor.parentNode.replaceChild(btn, actionAnchor);
      } else {
        var body = card.querySelector(".cw-feature-body, .p-3");
        if (body) {
          var wrap = document.createElement("div");
          wrap.className = "mt-2";
          wrap.appendChild(btn);
          body.appendChild(wrap);
        }
      }
      card.setAttribute("data-cw-name", data.name.toLowerCase());
      card.setAttribute("data-cw-category", data.category.toLowerCase());
      card.setAttribute("data-cw-location", data.location.toLowerCase());
    });
  }

  // ===== Search + filter (listings page) =====
  function wireSearchFilter() {
    var isListings = /listings\.html$/i.test(location.pathname);
    if (!isListings) return;
    var bar = document.querySelector("section .row.g-2.mb-4");
    if (!bar) return;
    var input = bar.querySelector("input");
    var selects = bar.querySelectorAll("select");
    var areaSelect = selects[0];
    var catSelect = selects[1];
    var btn = bar.querySelector("button");
    var cards = document.querySelectorAll(".cw-card");

    function applyFilters() {
      var q = (input && input.value || "").trim().toLowerCase();
      var area = (areaSelect && areaSelect.value || "").toLowerCase();
      var cat = (catSelect && catSelect.value || "").toLowerCase();
      var areaAll = area.indexOf("all") === 0 || !area;
      var catAll = cat.indexOf("all") === 0 || !cat;
      var shown = 0;
      cards.forEach(function (card) {
        var col = card.closest(".col-md-6, .col-lg-4, .col-sm-6, .col-lg-3, [class*='col-']") || card;
        var name = card.getAttribute("data-cw-name") || "";
        var category = card.getAttribute("data-cw-category") || "";
        var loc = card.getAttribute("data-cw-location") || "";
        var matchQ = !q || name.indexOf(q) !== -1 || category.indexOf(q) !== -1 || loc.indexOf(q) !== -1;
        var matchA = areaAll || loc.indexOf(area) !== -1;
        var matchC = catAll || category.indexOf(cat) !== -1;
        var show = matchQ && matchA && matchC;
        col.style.display = show ? "" : "none";
        if (show) shown++;
      });
      var empty = document.getElementById("cwEmptyState");
      if (!empty) {
        empty = document.createElement("div");
        empty.id = "cwEmptyState";
        empty.className = "text-center text-muted py-5";
        empty.innerHTML = '<i class="bi bi-search fs-1 d-block mb-2"></i>No items match your search.';
        var grid = document.querySelector(".row.g-4");
        if (grid) grid.parentNode.appendChild(empty);
      }
      empty.style.display = shown === 0 ? "" : "none";
    }

    if (input) input.addEventListener("input", applyFilters);
    if (areaSelect) areaSelect.addEventListener("change", applyFilters);
    if (catSelect) catSelect.addEventListener("change", applyFilters);
    if (btn) btn.addEventListener("click", function (e) { e.preventDefault(); applyFilters(); });

    try {
      var params = new URLSearchParams(location.search);
      if (params.get("q") && input) input.value = params.get("q");
      if (params.get("area") && areaSelect) areaSelect.value = params.get("area");
      if (params.get("cat") && catSelect) catSelect.value = params.get("cat");
      if (params.toString()) applyFilters();
    } catch (e) {}
  }

  function wireHomeSearch() {
    if (!/home\.html$|^\/$/i.test(location.pathname)) return;
    var heroCard = document.querySelector(".cw-hero .bg-white");
    if (!heroCard) return;
    var btn = heroCard.querySelector("a.btn-brand");
    var input = heroCard.querySelector("input");
    var select = heroCard.querySelector("select");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      if (input && input.value.trim()) params.set("q", input.value.trim());
      if (select && select.value && select.value.toLowerCase().indexOf("all") !== 0) params.set("area", select.value);
      location.href = "listings.html" + (params.toString() ? "?" + params.toString() : "");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getTheme());
    enhanceNavbar();
    bindAuthForms();
    renderUser();
    wireItemCards();
    wireSearchFilter();
    wireHomeSearch();
    applyLang(getLang());
  });
})();


/* ====================================================================
   Global language synchronization for public, user, admin and superadmin
   ==================================================================== */
(function(){
  var KEY = "cw_lang";
  var SO = {
    "Home":"Guriga","Browse":"Eeg","List Item":"Liis Geli","About":"Ku Saabsan","Contact":"Nala Soo Xiriir","Sign In":"Soo Gal","Sign out":"Ka Bax","Logout":"Ka Bax",
    "Dashboard":"Dashboor","Dashboard Overview":"Guudmarka Dashboorka","Overview":"Guudmar","Profile":"Akoonka","Settings":"Dejimaha","Messages":"Fariimaha",
    "My Bookings":"Dalabyadayda","Rental History":"Taariikhda Kirada","Wishlist":"Liiska Rabitaanka","My Listings":"Liisaskayga","Incoming Bookings":"Dalabyada Soo Galaya","Earnings":"Dakhliga",
    "Admin":"Maamule","Super Admin":"Maamule Sare","Manage Users":"Maamul Isticmaalayaasha","Manage Listings":"Maamul Liisaska","Categories":"Qaybaha","Reports":"Warbixinnada","Transactions":"Macaamilada","Analytics":"Falanqayn","Manage Admins":"Maamul Maamulayaasha","All Users":"Dhammaan Isticmaalayaasha","Audit Logs":"Diiwaanka Hawlaha","Site Settings":"Dejinta Goobta",
    "Search":"Raadi","Search dashboard":"Raadi dashboorka","Notifications":"Ogeysiisyo","Language":"Luqad","Appearance":"Muuqaal","Dark Mode":"Hab Madow","Light Mode":"Hab Iftiin",
    "Welcome back,":"Soo dhowow,","One account — switch between lending and renting any time.":"Hal akoon ayaad ku kala beddeli kartaa kirayn iyo kireynsi wakhti kasta.","New listing":"Liis cusub","I'm Lending":"Waxaan kireynayaa","I'm Renting":"Waxaan kiraysanayaa",
    "My listings":"Liisaskayga","Incoming requests":"Codsiyada soo galaya","Total earnings":"Wadarta dakhliga","Messages from renters":"Fariimaha kiraystayaasha","Active rentals":"Kirooyin socda","Spent this month":"Kharashka bishan","Messages with owners":"Fariimaha mulkiilayaasha",
    "Product Ratings":"Qiimaynta Alaabta","Reviews from verified renters.":"Faallooyin ka yimid kiraystayaal la xaqiijiyay.","Average Rating":"Celceliska Qiimaynta","total reviews":"faallooyin guud","Verified Renter":"Kirayste La Xaqiijiyay","No reviews yet. Be the first to review this item.":"Weli faallo ma jirto. Noqo qofka ugu horreeya ee qiimeeya alaabtan.","Rate This Item":"Qiimee Alaabtan","Star Rating":"Qiimaynta Xiddigaha","Review Comment":"Faallada Qiimaynta","Submit Review":"Gudbi Qiimaynta",
    "Items you are currently renting from other people.":"Alaabta aad hadda ka kiraysatay dadka kale.","Past items you rented and payments made.":"Alaabtii hore ee aad kiraysatay iyo lacagihii la bixiyay.","Booking":"Dalab","Item":"Alaab","Owner":"Mulkiile","Return by":"Soo celi","Status":"Xaalad","Completed":"Dhammaystiran","Active":"Socda","Pending":"Sugaya","Track":"Raac","View":"Eeg",
    "Profile updated.":"Akoonka waa la cusboonaysiiyay.","Personal details":"Faahfaahinta qofka","Full name":"Magaca buuxa","Email address":"Cinwaanka emailka","Phone number":"Lambarka telefoonka","Neighbourhood":"Xaafadda","Address":"Cinwaanka","About you":"Adiga kugu saabsan","Save changes":"Kaydi isbeddelada","Upload a clear profile picture.":"Soo geli sawir cad oo akoonka ah.",
    "Owner Information":"Macluumaadka Mulkiilaha","Rental Conditions":"Shuruudaha Kirada","Description":"Sharaxaad","Request to Rent":"Codso Kiraysi","Contact Owner":"La Xiriir Mulkiilaha","Rental Guarantee":"Dammaanadda Kirada","Contact Information":"Macluumaadka Xiriirka",
    "Operations Control":"Xakamaynta Hawlgalka","Moderate listings, review approvals and keep the marketplace healthy.":"Hubi liisaska, ansixi dalabyada, kuna ilaali suuqa inuu caafimaad qabo.","Review listings":"Eeg liisaska","Manage users":"Maamul isticmaalayaasha","Open reports":"Fur warbixinnada",
    "Today's queue":"Safka maanta","Pending listings":"Liisaska sugaya","Recent contact messages":"Fariimaha xiriirka ee dhowaan","Rental Requests":"Codsiyada Kirada","Request ID":"Aqoonsiga Codsiga","Renter":"Kirayste","Date":"Taariikh","Platform owner":"Milkiilaha Platform-ka",
    "Search dashboard":"Raadi dashboorka","Manage Listings":"Maamul Liisaska","Manage Admins":"Maamul Maamulayaasha","All Users":"Dhammaan Isticmaalayaasha","Audit Logs":"Diiwaanka Hawlaha","Site Settings":"Dejinta Goobta","Session":"Kalfadhi","Dashboard Menu":"Liiska Dashboorka",
    "List Your Item — Free":"Liis Geli Alaabtaada — Bilaash","Free to join. Rent or lend across Jigjiga.":"Ku biiristu waa bilaash. Ka kirayso ama ku kiree Jigjiga.",
    "About Citywide Jigjiga":"Ku Saabsan Citywide Jigjiga","Built for Jigjiga's rental economy":"Waxaa loo dhisay dhaqaalaha kirada ee Jigjiga","Why Citywide?":"Maxaa Citywide?","Local-first":"Maxalli marka hore","Safe rentals":"Kirooyin ammaan ah","Simple payments":"Lacag bixin fudud",
    "Contact Citywide Jigjiga":"La Xiriir Citywide Jigjiga","Send us a message":"Noo dir fariin","Your name":"Magacaaga","Your email":"Emailkaaga","Subject":"Mawduuc","Message":"Fariin","Send Message":"Dir Fariin","Contact Information":"Macluumaadka Xiriirka",
    "Browse Listings":"Eeg Liisaska","Search rentals":"Raadi kirooyinka","Daily price":"Qiimaha maalintii","Security deposit":"Dhigaalka damaanadda","Available now":"Hadda waa la heli karaa","View Details":"Eeg Faahfaahinta",
    "Item title":"Cinwaanka alaabta","Item category":"Qaybta alaabta","Upload photos":"Soo geli sawirro","Rental price":"Qiimaha kirada","Submit listing":"Gudbi liiska","Add Listing":"Ku dar Liis","List":"Liis",
    "Import projects":"Soo geli mashruucyo","Projects":"Mashruucyo","Toggle navigation menu":"Fur ama xir liiska navigation-ka"
  };
  function lang(){ try { return localStorage.getItem(KEY) || "en"; } catch(e){ return "en"; } }
  function originalText(node){
    if (!node.__cwI18nOriginal) node.__cwI18nOriginal = node.nodeValue;
    return node.__cwI18nOriginal;
  }
  function translateText(text, target){
    if (target === "en") return text;
    var trimmed = text.trim();
    if (!trimmed) return text;
    var translated = SO[trimmed];
    if (!translated) return text;
    return text.replace(trimmed, translated);
  }
  var applying = false;
  function apply(target, options){
    if (applying) return;
    applying = true;
    options = options || {};
    document.documentElement.setAttribute("lang", target === "so" ? "so" : "en");
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode:function(node){
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentElement;
        if (!parent || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest("[data-cw-no-translate]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function(node){ node.nodeValue = translateText(originalText(node), target); });
    document.querySelectorAll("[placeholder]").forEach(function(el){
      if (!el.__cwI18nPlaceholder) el.__cwI18nPlaceholder = el.getAttribute("placeholder");
      el.setAttribute("placeholder", translateText(el.__cwI18nPlaceholder, target));
    });
    document.querySelectorAll("[data-lang-btn], [data-cw-lang]").forEach(function(btn){
      var bLang = btn.getAttribute("data-lang-btn") || btn.getAttribute("data-cw-lang");
      btn.classList.toggle("active", bLang === target);
    });
    applying = false;
    if (!options.silent) window.dispatchEvent(new CustomEvent("cw:languagechange", { detail:{ lang:target } }));
  }
  window.cwSetLanguage = function(target){
    target = target === "so" ? "so" : "en";
    try { localStorage.setItem(KEY, target); } catch(e){}
    apply(target);
  };
  window.cwApplyLanguage = function(){ apply(lang(), { silent:true }); };
  document.addEventListener("click", function(e){
    var btn = e.target.closest("[data-lang-btn], [data-cw-lang]");
    if (!btn) return;
    var target = btn.getAttribute("data-lang-btn") || btn.getAttribute("data-cw-lang");
    if (target) window.cwSetLanguage(target);
  });
  document.addEventListener("DOMContentLoaded", function(){
    apply(lang());
    var timer;
    new MutationObserver(function(){
      clearTimeout(timer);
      timer = setTimeout(function(){ apply(lang(), { silent:true }); }, 80);
    }).observe(document.body, { childList:true, subtree:true });
  });
})();


/* ====================================================================
   Dashboard architecture v11 — role guard + grouped sidebar
   ==================================================================== */
(function(){
  var USER_KEY = "cw_user";
  function getUser(){ try { return JSON.parse(localStorage.getItem(USER_KEY)||"null"); } catch(e){ return null; } }

  // ---- Role guard handled by v12 IIFE below ----

  // ---- Grouped USER sidebar ----
  var USER_GROUPS = [
    { label: "Lending (Owner)", items: [
      { key:"overview",    href:"dashboard.html",   icon:"speedometer2",   text:"Dashboard Overview" },
      { key:"my-listings", href:"my-listings.html", icon:"collection",     text:"My Listings" },
      { key:"add-listing", href:"add-item.html",    icon:"plus-square",    text:"Add Listing" },
      { key:"bookings",    href:"bookings.html",    icon:"calendar-check", text:"Incoming Bookings" },
      { key:"earnings",    href:"earnings.html",    icon:"cash-coin",      text:"Earnings" }
    ]},
    { label: "Renting", items: [
      { key:"my-bookings",    href:"my-bookings.html",    icon:"bag-check",      text:"My Bookings" },
      { key:"rental-history", href:"rental-history.html", icon:"clock-history",  text:"Rental History" },
      { key:"wishlist",       href:"wishlist.html",       icon:"heart",          text:"Wishlist" }
    ]},
    { label: "Account", items: [
      { key:"messages", href:"messages.html", icon:"chat-dots",      text:"Messages" },
      { key:"settings", href:"settings.html", icon:"gear",           text:"Settings" },
      { key:"logout",   href:"logout.html",   icon:"box-arrow-right",text:"Logout" }
    ]}
  ];

  var ADMIN_GROUPS = [
    { label: "Admin", items: [
      { key:"overview",     href:"index.html",        icon:"speedometer2",   text:"Overview" },
      { key:"users",        href:"users.html",        icon:"people",         text:"Manage Users" },
      { key:"listings",     href:"listings.html",     icon:"collection",     text:"Manage Listings" },
      { key:"categories",   href:"categories.html",   icon:"tags",           text:"Categories" },
      { key:"reports",      href:"reports.html",      icon:"flag",           text:"Reports" },
      { key:"transactions", href:"transactions.html", icon:"cash-stack",     text:"Transactions" },
      { key:"analytics",    href:"analytics.html",    icon:"graph-up",       text:"Analytics" }
    ]},
    { label: "Session", items: [
      { key:"profile", href:"profile.html", icon:"person-circle", text:"Profile" },
      { key:"signout", href:"login.html", icon:"box-arrow-right", text:"Sign out" }
    ]}
  ];

  // Builds the sidebar HTML for user/admin pages, including logo, user card, and grouped nav links.
  function renderSidebar(host, groups){
    var u = getUser() || {};
    var guard = document.body.getAttribute("data-cw-guard") || "";
    var name = u.name || (guard === "superadmin" ? "Super Admin" : guard === "admin" ? "Admin" : "User");
    var area = u.area || "Jigjiga Central";
    var ini  = (name||"G").trim().split(/\s+/).map(function(p){return p.charAt(0);}).slice(0,2).join("").toUpperCase()||"G";
    var active = host.getAttribute("data-active") || "";
    // Pick logo path depending on whether we are inside /admin or /superadmin
    var inSection = /\/(admin|superadmin)\//.test(location.pathname);
    var logoSrc = window.cwPath("assets/logos/logo-header.svg");
    var profileHref = "profile.html";
    var html = '<div class="cw-sidebar-logo"><img src="'+logoSrc+'" alt="Citywide"/></div>'+
               '<a class="px-2 mb-3 d-flex align-items-center gap-2 cw-sidebar-profile text-decoration-none" href="'+profileHref+'" aria-label="Open profile">'+
               '<div class="cw-avatar">'+ini+'</div>'+
               '<div><div class="fw-semibold small">'+name+'</div>'+
               '<div class="text-muted small">'+area+'</div></div></a>';
    groups.forEach(function(g){
      html += '<div class="cw-sidebar-group-label text-uppercase text-muted small fw-semibold px-2 mt-3 mb-1" style="letter-spacing:.05em;">'+g.label+'</div>';
      html += '<nav class="nav flex-column">';
      g.items.forEach(function(it){
        html += '<a class="nav-link'+(it.key===active?" active":"")+'" href="'+it.href+'">'+
                '<i class="bi bi-'+it.icon+' me-2"></i>'+it.text+'</a>';
      });
      html += '</nav>';
    });
    host.innerHTML = html;
  }

  document.querySelectorAll("[data-cw-sidebar]").forEach(function(el){ renderSidebar(el, USER_GROUPS); });
  document.querySelectorAll("[data-cw-admin-sidebar]").forEach(function(el){ renderSidebar(el, ADMIN_GROUPS); });
})();


/* ====================================================================
   v12 — role-based auth, JSON-driven, sessionStorage
   ==================================================================== */
(function(){
  var SKEY = "cw_user";
  var BUILTIN_ADMIN_USERS = [
    { id: 4, name: "Anna Lopez", email: "anna@email.com", password: "admin123", role: ["admin"], avatar: null, status: "active" },
    { id: 5, name: "Super Admin", email: "superadmin@email.com", password: "super123", role: ["super_admin"], avatar: null, status: "active" }
  ];
  // sget: returns the active user. Tries sessionStorage first; if missing
  // but a "remembered" user exists in localStorage, restores it so Remember Me
  // survives browser restarts.
  function sget(){
    try {
      var s = JSON.parse(sessionStorage.getItem(SKEY)||"null");
      if (s) return s;
      var rem = JSON.parse(localStorage.getItem(SKEY)||"null");
      if (rem) { sessionStorage.setItem(SKEY, JSON.stringify(rem)); return rem; }
      return null;
    } catch(e){ return null; }
  }
  // sset: stores the user in sessionStorage; also in localStorage when
  // remember=true so the session is restored after closing the browser.
  // If remember is undefined we preserve whatever the user picked last login.
  function sset(u, remember){
    sessionStorage.setItem(SKEY, JSON.stringify(u));
    var wasRemembered = !!localStorage.getItem(SKEY);
    var keep = (remember === undefined) ? wasRemembered : !!remember;
    if (keep) localStorage.setItem(SKEY, JSON.stringify(u));
    else      localStorage.removeItem(SKEY);
  }
  function sclear(){ sessionStorage.removeItem(SKEY); localStorage.removeItem(SKEY); }
  window.cwGetUser = sget;
  window.cwSetUser = sset;
  window.cwClearUser = sclear;

  function initials(name){
    if(!name) return "G";
    var p = name.trim().split(/\s+/);
    return (p.length===1 ? p[0].charAt(0) : p[0].charAt(0)+p[p.length-1].charAt(0)).toUpperCase();
  }

  function roleArr(u){
    if(!u) return [];
    return Array.isArray(u.role) ? u.role : [u.role];
  }

  function landingFor(u){
    var r = roleArr(u);
    if (r.indexOf("super_admin")>=0) return "superadmin/index.html";
    if (r.indexOf("admin")>=0) return "admin/index.html";
    return "dashboard.html";
  }

  function dataPath(rel){
    // Pages may live in /admin or /superadmin — JSON is at root /data
    return window.cwPath("data/" + rel);
  }

  function normalizeEmail(email){
    return String(email || "").trim().toLowerCase();
  }
  function safeLocalUsers(){
    try {
      var rows = JSON.parse(localStorage.getItem("cw_users_extra") || "[]");
      return Array.isArray(rows) ? rows : [];
    } catch(e) {
      console.warn("[CityWide auth] Could not parse cw_users_extra", e);
      return [];
    }
  }
  function mergeBuiltInAdmins(list){
    var rows = Array.isArray(list) ? list.slice() : [];
    BUILTIN_ADMIN_USERS.forEach(function(admin){
      var exists = rows.some(function(u){ return normalizeEmail(u.email) === normalizeEmail(admin.email); });
      if (!exists) rows.push(admin);
    });
    return rows;
  }
  function fetchJSON(name){
    var url = dataPath(name) + "?v=" + Date.now();
    return fetch(url, { cache: "no-store" }).then(function(r){
      if (!r.ok) throw new Error("Failed to fetch " + url + " (" + r.status + " " + r.statusText + ")");
      return r.json();
    });
  }
  window.cwData = fetchJSON;

  // ---- Auth wiring on login/register pages ----
  function wireLogin(){
    var f = document.querySelector('form[data-cw-login], form[action="dashboard.html"]');
    if(!f) return;
    // Remove full-name field on login (kept email+password only)
    var nameField = f.querySelector('input[name="fullName"]');
    if (nameField) {
      var wrap = nameField.closest('.mb-3'); if (wrap) wrap.remove();
    }
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var email = normalizeEmail((f.querySelector('input[type="email"]')||{}).value || "");
      var pass  = (f.querySelector('input[type="password"]')||{}).value || "";
      var remember = !!(f.querySelector('#remember') && f.querySelector('#remember').checked);
      function finishLogin(list){
        var local = safeLocalUsers();
        var all = mergeBuiltInAdmins(list).concat(local);
        var u = all.filter(function(x){ return normalizeEmail(x.email)===email && String(x.password)===String(pass); })[0];
        if (!u) { alert("Invalid email or password."); return; }
        if (u.status === "suspended") { alert("This account has been suspended."); return; }
        sset({id:u.id, name:u.name, email:u.email, role:u.role, avatar:u.avatar||null, area:"Jigjiga Central"}, remember);
        location.replace(landingFor(u));
      }
      var localFirst = safeLocalUsers();
      var localMatch = localFirst.filter(function(x){ return normalizeEmail(x.email)===email && String(x.password)===String(pass); })[0];
      if (localMatch) { finishLogin([]); return; }
      fetchJSON("users.json").then(finishLogin).catch(function(err){
        console.error("[CityWide auth] users.json fetch failed; using built-in admin fallback.", err);
        finishLogin([]);
      });
    });

    // Forgot password: looks up the email in users.json + local users and
    // simulates a reset link. Shows clear success/error messaging.
    var forgotLink = document.getElementById("cwForgot");
    var modalEl    = document.getElementById("cwForgotModal");
    if (forgotLink && modalEl && window.bootstrap){
      var modal = new bootstrap.Modal(modalEl);
      forgotLink.addEventListener("click", function(e){ e.preventDefault(); modal.show(); });
      var fForm = document.getElementById("cwForgotForm");
      var fMsg  = document.getElementById("cwForgotMsg");
      fForm.addEventListener("submit", function(e){
        e.preventDefault();
        var em = document.getElementById("cwForgotEmail").value.trim().toLowerCase();
        fMsg.className = "small mt-2 text-muted";
        fMsg.textContent = "Checking your account…";
        fetchJSON("users.json").then(function(list){
          var local = JSON.parse(localStorage.getItem("cw_users_extra")||"[]");
          var found = list.concat(local).some(function(x){ return x.email.toLowerCase()===em; });
          if (!found){
            fMsg.className = "small mt-2 text-danger";
            fMsg.textContent = "We couldn't find an account with that email.";
            return;
          }
          // Record the reset request locally so a real backend could pick it up
          var reqs = JSON.parse(localStorage.getItem("cw_password_resets")||"[]");
          reqs.push({ email: em, requestedAt: new Date().toISOString() });
          localStorage.setItem("cw_password_resets", JSON.stringify(reqs));
          fMsg.className = "small mt-2 text-success";
          fMsg.textContent = "Reset link sent. Check your inbox for instructions.";
        }).catch(function(){
          fMsg.className = "small mt-2 text-danger";
          fMsg.textContent = "Could not process your request. Please try again.";
        });
      });
    }
  }

  function wireRegister(){
    var f = document.querySelector('form[data-cw-register]');
    if(!f) {
      if (!/register\.html$/i.test(location.pathname)) return;
      f = document.querySelector('form');
      if(!f) return;
    }
    // Remove tel/agree fields if present (kept: name, email, password, confirm, accountType)
    f.querySelectorAll('input[type="tel"]').forEach(function(el){
      var w = el.closest('.mb-3'); if(w) w.remove();
    });
    var agree = f.querySelector('#agree'); if (agree){ var w2=agree.closest('.form-check'); if(w2) w2.remove(); }

    f.addEventListener("submit", function(e){
      e.preventDefault();
      var name  = (f.querySelector('input[name="fullName"]')||{}).value || "";
      var email = (f.querySelector('input[type="email"]')||{}).value || "";
      var pwEls = f.querySelectorAll('input[type="password"]');
      var pass  = (pwEls[0]||{}).value || "";
      var pass2 = (pwEls[1]||{}).value || pass;
      var acct  = (f.querySelector('[name="accountType"]')||{}).value || "";
      if(!name.trim() || !email.trim() || !pass){ alert("Please fill all fields."); return; }
      if(pass !== pass2){ alert("Passwords do not match."); return; }
      if(!acct){ alert("Please choose an account type."); return; }
      var role = acct === "both" ? ["owner","renter"] : (acct === "owner" ? ["owner"] : ["renter"]);
      var extra = JSON.parse(localStorage.getItem("cw_users_extra")||"[]");
      fetchJSON("users.json").then(function(list){
        var dup = list.concat(extra).some(function(x){ return x.email.toLowerCase()===email.toLowerCase(); });
        if (dup){ alert("An account with this email already exists."); return; }
        var newUser = { id: Date.now(), name:name.trim(), email:email.trim(), password:pass, role:role, avatar:null, status:"active" };
        extra.push(newUser);
        localStorage.setItem("cw_users_extra", JSON.stringify(extra));
        sset({id:newUser.id, name:newUser.name, email:newUser.email, role:newUser.role, avatar:null, area:"Jigjiga Central"}, true);
        location.replace("dashboard.html");
      });
    });
  }

  // ---- Guard ----
  function guard(){
    var g = document.body && document.body.getAttribute("data-cw-guard");
    if (!g) return true;
    var u = sget();
    if (!u){
      var prefix = /\/(admin|superadmin)\//.test(location.pathname) ? "../" : "";
      location.replace(prefix + "login.html");
      return false;
    }
    var r = roleArr(u);
    if (g === "profile"){
      return true;
    }
    if (g === "user"){
      if (r.indexOf("super_admin")>=0) { location.replace("superadmin/index.html"); return false; }
      if (r.indexOf("admin")>=0) { location.replace("admin/index.html"); return false; }
    } else if (g === "admin"){
      if (r.indexOf("super_admin")<0 && r.indexOf("admin")<0) { location.replace("../dashboard.html"); return false; }
      // Restrict admin from forbidden pages
      var page = location.pathname.split("/").pop().toLowerCase();
      var forbidden = ["admins.html","audit.html"];
      if (r.indexOf("admin")>=0 && r.indexOf("super_admin")<0 && forbidden.indexOf(page)>=0){
        location.replace("index.html"); return false;
      }
    } else if (g === "superadmin"){
      if (r.indexOf("super_admin")<0) { location.replace("../login.html"); return false; }
    }
    return true;
  }

  // ---- Sidebar (role-aware, with toggle) ----
  var MODE_KEY = "cw_mode";
  function getMode(u){
    var r = roleArr(u);
    var hasO = r.indexOf("owner")>=0, hasR = r.indexOf("renter")>=0;
    if (hasO && !hasR) return "lend";
    if (hasR && !hasO) return "rent";
    return sessionStorage.getItem(MODE_KEY) || "lend";
  }
  function setMode(m){ sessionStorage.setItem(MODE_KEY, m); renderUserSidebars(); applyDashboardMode(); }
  window.cwSetMode = setMode;

  var LEND = [
    { key:"overview",    href:"dashboard.html",   icon:"speedometer2",   text:"Dashboard Overview" },
    { key:"my-listings", href:"my-listings.html", icon:"collection",     text:"My Listings" },
    { key:"add-listing", href:"add-item.html",    icon:"plus-square",    text:"Add Listing" },
    { key:"bookings",    href:"bookings.html",    icon:"calendar-check", text:"Incoming Bookings" },
    { key:"earnings",    href:"earnings.html",    icon:"cash-coin",      text:"Earnings" }
  ];
  var RENT = [
    { key:"overview",       href:"dashboard.html",      icon:"speedometer2",   text:"Dashboard Overview" },
    { key:"my-bookings",    href:"my-bookings.html",    icon:"bag-check",      text:"My Bookings" },
    { key:"rental-history", href:"rental-history.html", icon:"clock-history",  text:"Rental History" },
    { key:"wishlist",       href:"wishlist.html",       icon:"heart",          text:"Wishlist" }
  ];
  var ACCT = [
    { key:"profile",  href:"profile.html",  icon:"person-circle",  text:"Profile" },
    { key:"messages", href:"messages.html", icon:"chat-dots",      text:"Messages" },
    { key:"settings", href:"settings.html", icon:"gear",           text:"Settings" },
    { key:"logout",   href:"logout.html",   icon:"box-arrow-right",text:"Logout" }
  ];

  function avatarHTML(u){
    if (u && u.avatar) return '<img src="'+u.avatar+'" class="cw-avatar" style="object-fit:cover;width:36px;height:36px;border-radius:50%;" alt="avatar"/>';
    return '<div class="cw-avatar">'+initials(u && u.name)+'</div>';
  }

  function renderUserSidebars(){
    var u = sget(); if (!u) return;
    var r = roleArr(u);
    var hasO = r.indexOf("owner")>=0, hasR = r.indexOf("renter")>=0;
    var mode = getMode(u);
    document.querySelectorAll("[data-cw-sidebar]").forEach(function(host){
      var active = host.getAttribute("data-active") || "";
      var html = "";
      // Mode toggle FIRST (very top of sidebar) when user has both roles
      if (hasO && hasR){
        html += '<div class="px-2 mb-3"><div class="btn-group btn-group-sm w-100" role="group" aria-label="Switch mode">'+
                '<button type="button" class="btn '+(mode==="lend"?"btn-brand":"btn-outline-secondary")+'" data-cw-mode="lend"><i class="bi bi-box-seam me-1"></i>Lending</button>'+
                '<button type="button" class="btn '+(mode==="rent"?"btn-brand":"btn-outline-secondary")+'" data-cw-mode="rent"><i class="bi bi-bag-check me-1"></i>Renting</button>'+
                '</div></div>';
      }
      html += '<a class="px-2 mb-3 d-flex align-items-center gap-2 cw-sidebar-profile text-decoration-none" href="profile.html" aria-label="Open profile">'+
              avatarHTML(u)+
              '<div><div class="fw-semibold small">'+(u.name||"User")+'</div>'+
              '<div class="text-muted small">'+(u.area||"Jigjiga Central")+'</div></div></a>';
      var groups = [];
      if (hasO && (mode==="lend" || !hasR)) groups.push({label:"Lending", items:LEND});
      if (hasR && (mode==="rent" || !hasO)) groups.push({label:"Renting", items:RENT});
      groups.push({label:"Account", items:ACCT});
      groups.forEach(function(g){
        html += '<div class="cw-sidebar-group-label text-uppercase text-muted small fw-semibold px-2 mt-3 mb-1" style="letter-spacing:.05em;">'+g.label+'</div>';
        html += '<nav class="nav flex-column">';
        g.items.forEach(function(it){
          html += '<a class="nav-link'+(it.key===active?" active":"")+'" href="'+it.href+'"><i class="bi bi-'+it.icon+' me-2"></i>'+it.text+'</a>';
        });
        html += '</nav>';
      });
      host.innerHTML = html;
      host.querySelectorAll("[data-cw-mode]").forEach(function(b){
        b.addEventListener("click", function(){ setMode(b.getAttribute("data-cw-mode")); });
      });
    });
    // Update navbar avatar everywhere
    document.querySelectorAll("[data-user-initial]").forEach(function(el){
      if (u.avatar){
        el.outerHTML = '<img src="'+u.avatar+'" alt="avatar" class="cw-avatar-sm" style="width:32px;height:32px;border-radius:50%;object-fit:cover;"/>';
      } else {
        el.textContent = initials(u.name);
      }
    });
    document.querySelectorAll("[data-user-name]").forEach(function(el){ el.textContent = u.name || "User"; });
  }

  function applyDashboardMode(){
    // On dashboard, switch tabs to match selected mode
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var u = sget(); if(!u) return;
    var mode = getMode(u);
    var r = roleArr(u);
    var roleView = (r.indexOf("owner")>=0 && r.indexOf("renter")>=0) ? "both" : (r.indexOf("owner")>=0 ? "owner" : "renter");
    document.body.setAttribute("data-cw-role-view", roleView);
    document.body.setAttribute("data-cw-mode-view", mode);
    var lendTab = document.getElementById("tab-lend");
    var rentTab = document.getElementById("tab-rent");
    if (window.bootstrap && bootstrap.Tab){
      if (mode==="rent" && rentTab) new bootstrap.Tab(rentTab).show();
      else if (lendTab) new bootstrap.Tab(lendTab).show();
    }
  }

  function injectDashboardSummary(){
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var u = sget(); if(!u) return;
    var r = roleArr(u);
    var hasO = r.indexOf("owner")>=0, hasR = r.indexOf("renter")>=0;
    if (!(hasO && hasR)) return; // Spec: shown when user has both roles
    Promise.all([fetchJSON("listings.json"), fetchJSON("bookings.json"), fetchJSON("earnings.json")]).then(function(res){
      var listings=res[0], bookings=res[1], earnings=res[2];
      var mine = listings.filter(function(l){return l.ownerId===u.id && l.status==="active";}).length;
      var earned = earnings.filter(function(e){return e.ownerId===u.id;}).reduce(function(a,b){return a+b.amount;},0);
      var activeR = bookings.filter(function(b){return b.renterId===u.id && b.status==="active";}).length;
      var pendingR= bookings.filter(function(b){return b.renterId===u.id && b.status==="pending";}).length;
      var html =
        '<div class="row g-3 mb-4" id="cwModeCards">'+
          '<div class="col-md-6"><div class="cw-card p-3 h-100" role="button" data-cw-mode="lend">'+
            '<div class="d-flex justify-content-between"><span class="text-muted small">As Owner</span><i class="bi bi-box-seam text-brand"></i></div>'+
            '<h4 class="mb-0 mt-2">'+mine+' active items</h4>'+
            '<p class="small text-success mb-0">'+earned.toLocaleString()+' ETB earned</p>'+
          '</div></div>'+
          '<div class="col-md-6"><div class="cw-card p-3 h-100" role="button" data-cw-mode="rent">'+
            '<div class="d-flex justify-content-between"><span class="text-muted small">As Renter</span><i class="bi bi-bag-check text-brand"></i></div>'+
            '<h4 class="mb-0 mt-2">'+activeR+' active rentals</h4>'+
            '<p class="small text-muted mb-0">'+pendingR+' pending pickup</p>'+
          '</div></div>'+
        '</div>';
      var tabs = document.querySelector(".cw-dash-tabs");
      if (tabs && !document.getElementById("cwModeCards")){
        tabs.insertAdjacentHTML("beforebegin", html);
        document.querySelectorAll("#cwModeCards [data-cw-mode]").forEach(function(c){
          c.addEventListener("click", function(){ setMode(c.getAttribute("data-cw-mode")); });
        });
      }
    });
  }

  // ---- Profile photo upload binding (profile.html) ----
  function wireProfilePhoto(){
    var fileInput = document.querySelector('input[type="file"][data-cw-avatar]');
    if(!fileInput) return;
    var preview = document.querySelector('[data-cw-avatar-preview]');
    var fallback = document.querySelector('.cw-avatar.cw-avatar-lg[data-user-initial]');
    // Inject remove button next to file input
    var removeBtn = document.querySelector('[data-cw-avatar-remove]');
    if (!removeBtn){
      removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("data-cw-avatar-remove","");
      removeBtn.className = "btn btn-sm btn-outline-danger mt-2 w-100";
      removeBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Remove photo';
      fileInput.parentNode.insertBefore(removeBtn, fileInput.nextSibling);
    }
    function refresh(){
      var u = sget();
      var has = u && u.avatar;
      if (preview){
        if (has){ preview.src = u.avatar; preview.style.display = ""; }
        else { preview.style.display = "none"; }
      }
      if (fallback) fallback.style.display = has ? "none" : "";
      removeBtn.style.display = has ? "" : "none";
    }
    refresh();
    fileInput.addEventListener("change", function(){
      var f = fileInput.files[0]; if(!f) return;
      var rd = new FileReader();
      rd.onload = function(){
        var u = sget(); if(!u) return;
        u.avatar = rd.result; sset(u);
        renderUserSidebars(); refresh();
      };
      rd.readAsDataURL(f);
    });
    removeBtn.addEventListener("click", function(){
      var u = sget(); if(!u) return;
      u.avatar = null; sset(u);
      fileInput.value = "";
      renderUserSidebars(); refresh();
    });
  }


  // ---- Profile details update ----
  function wireProfileName(){
    var f = document.querySelector('form[data-cw-profile]');
    if(!f) return;
    var u0 = sget() || {};
    var setVal = function(name, value){
      var el = f.querySelector('[name="'+name+'"]');
      if (el && value) el.value = value;
    };
    setVal("fullName", u0.name);
    setVal("email", u0.email);
    setVal("phone", u0.phone);
    setVal("area", u0.area);
    setVal("address", u0.address);
    setVal("bio", u0.bio);
    f.addEventListener("submit", function(e){
      e.preventDefault();
      var u = sget(); if(!u) return;
      var read = function(name){
        var el = f.querySelector('[name="'+name+'"]');
        return el ? el.value.trim() : "";
      };
      var n = read("fullName");
      if (n) u.name = n;
      u.email = read("email") || u.email;
      u.phone = read("phone");
      u.area = read("area") || u.area || "Jigjiga Central";
      u.address = read("address");
      u.bio = read("bio");
      sset(u);
      renderUserSidebars();
      document.querySelectorAll("[data-user-name]").forEach(function(el){ el.textContent = u.name || "User"; });
      document.querySelectorAll("[data-user-area]").forEach(function(el){ el.textContent = u.area || "Jigjiga Central"; });
      alert("Profile updated.");
    });
  }

  // ---- Logout ----
  function wireLogout(){
    if (!/logout\.html$/i.test(location.pathname)) return;
    sclear();
    setTimeout(function(){ location.replace("login.html"); }, 400);
  }

  document.addEventListener("DOMContentLoaded", function(){
    if (!guard()) return;
    wireLogout();
    wireLogin();
    wireRegister();
    renderUserSidebars();
    injectDashboardSummary();
    applyDashboardMode();
    wireProfilePhoto();
    wireProfileName();
  });
})();


/* ====================================================================
   v12 — superadmin sidebar
   ==================================================================== */
(function(){
  var SUPER = [
    { key:"overview",    href:"index.html",        icon:"speedometer2",   text:"Overview" },
    { key:"profile",     href:"profile.html",      icon:"person-circle",  text:"Profile" },
    { key:"admins",      href:"admins.html",       icon:"shield-check",   text:"Manage Admins" },
    { key:"users",       href:"users.html",        icon:"people",         text:"All Users" },
    { key:"categories",  href:"categories.html",   icon:"tags",           text:"Categories" },
    { key:"analytics",   href:"analytics.html",    icon:"graph-up",       text:"Analytics" },
    { key:"transactions",href:"transactions.html", icon:"cash-stack",     text:"Transactions" },
    { key:"reports",     href:"reports.html",      icon:"flag",           text:"Reports" },
    { key:"audit",       href:"audit.html",        icon:"journal-text",   text:"Audit Logs" },
    { key:"settings",    href:"settings.html",     icon:"sliders",        text:"Site Settings" }
  ];
  var SESS = [{ key:"signout", href:"../logout.html", icon:"box-arrow-right", text:"Sign out" }];

  function getUser(){ try { return JSON.parse(sessionStorage.getItem("cw_user") || localStorage.getItem("cw_user") || "null"); } catch(e){ return null; } }
  function initials(name){ if(!name) return "G"; var p=name.trim().split(/\s+/); return (p.length===1?p[0].charAt(0):p[0].charAt(0)+p[p.length-1].charAt(0)).toUpperCase(); }

  // Builds the super admin sidebar HTML with logo, profile block, and grouped nav links.
  function render(host, groups){
    var u = getUser() || {};
    var active = host.getAttribute("data-active") || "";
    var avatar = u.avatar
      ? '<img src="'+u.avatar+'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" alt="avatar"/>'
      : '<div class="cw-avatar">'+initials(u.name)+'</div>';
    var html = '<div class="cw-sidebar-logo"><img src="'+window.cwPath("assets/logos/logo-header.svg")+'" alt="Citywide"/></div>'+
               '<a class="px-2 mb-3 d-flex align-items-center gap-2 cw-sidebar-profile text-decoration-none" href="profile.html" aria-label="Open profile">'+avatar+
               '<div><div class="fw-semibold small">'+(u.name||"Super Admin")+'</div>'+
               '<div class="text-muted small">Platform owner</div></div></a>';
    groups.forEach(function(g){
      html += '<div class="cw-sidebar-group-label text-uppercase text-muted small fw-semibold px-2 mt-3 mb-1" style="letter-spacing:.05em;">'+g.label+'</div>';
      html += '<nav class="nav flex-column">';
      g.items.forEach(function(it){
        html += '<a class="nav-link'+(it.key===active?" active":"")+'" href="'+it.href+'"><i class="bi bi-'+it.icon+' me-2"></i>'+it.text+'</a>';
      });
      html += '</nav>';
    });
    host.innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll("[data-cw-super-sidebar]").forEach(function(el){
      render(el, [{label:"Super Admin", items:SUPER}, {label:"Session", items:SESS}]);
    });
  });
})();


/* ====================================================================
   v13 — Admin / Superadmin theme toggle (top navbar)
   ==================================================================== */
(function(){
  var KEY = "cw_theme";
  function getTheme(){ return localStorage.getItem(KEY) || "light"; }
  function applyTheme(t){
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-icon]").forEach(function(el){
      el.className = t==="dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
  }
  function toggle(){
    var next = getTheme()==="dark" ? "light" : "dark";
    localStorage.setItem(KEY, next); applyTheme(next);
  }
  applyTheme(getTheme());
  document.addEventListener("DOMContentLoaded", function(){
    var inAdmin = /\/(admin|superadmin)\//.test(location.pathname);
    if (!inAdmin) return;
    var bar = document.querySelector(".cw-navbar .container .ms-auto, .cw-navbar .container");
    if (!bar) return;
    // Place inside the right-side cluster if present, else append to container
    var host = document.querySelector(".cw-navbar .container .ms-auto") || document.querySelector(".cw-navbar .container");
    if (host.querySelector("[data-theme-toggle]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-theme-toggle","");
    btn.className = "cw-theme-toggle me-2";
    btn.title = "Toggle dark mode";
    btn.setAttribute("aria-label","Toggle dark mode");
    btn.innerHTML = '<i data-theme-icon class="'+ (getTheme()==="dark"?"bi bi-sun-fill":"bi bi-moon-stars-fill") +'"></i>';
    btn.addEventListener("click", toggle);
    // Insert at the beginning of the right cluster (before Sign out)
    if (host.classList.contains("ms-auto")) host.insertBefore(btn, host.firstChild);
    else host.appendChild(btn);
  });
})();


/* ====================================================================
   v14 — Remove duplicate "Sign out" from top navbar on admin/superadmin
   (sidebar keeps the only logout link)
   ==================================================================== */
(function(){
  document.addEventListener("DOMContentLoaded", function(){
    if (!/\/(admin|superadmin)\//.test(location.pathname)) return;
    document.querySelectorAll(".cw-navbar a").forEach(function(a){
      var txt = (a.textContent||"").trim().toLowerCase();
      if (txt.indexOf("sign out") >= 0 || txt.indexOf("logout") >= 0) {
        a.remove();
      }
    });
  });
})();


/* ====================================================================
   v15 — Account Type Management + role-change request workflow
   Storage: localStorage
     - cw_role_requests : [{id,userId,userName,userEmail,from,to,status,createdAt,decidedAt,decidedBy,note}]
     - cw_role_notice   : { userId: { message, kind } }   // shown once on next page load
   Roles: renter | owner | both | admin | super_admin
   ==================================================================== */
(function(){
  var REQ_KEY = "cw_role_requests";
  var NOTICE_KEY = "cw_role_notice";

  function sget(){ try { return JSON.parse(sessionStorage.getItem("cw_user")||"null"); } catch(e){ return null; } }
  function sset(u){ sessionStorage.setItem("cw_user", JSON.stringify(u)); localStorage.setItem("cw_user", JSON.stringify(u)); }
  function loadReqs(){ try { return JSON.parse(localStorage.getItem(REQ_KEY)||"[]"); } catch(e){ return []; } }
  function saveReqs(a){ localStorage.setItem(REQ_KEY, JSON.stringify(a)); }
  function loadNotices(){ try { return JSON.parse(localStorage.getItem(NOTICE_KEY)||"{}"); } catch(e){ return {}; } }
  function saveNotices(o){ localStorage.setItem(NOTICE_KEY, JSON.stringify(o)); }

  function roleArr(u){ if(!u) return []; return Array.isArray(u.role) ? u.role : [u.role]; }
  function currentAccountType(u){
    var r = roleArr(u);
    var hasO = r.indexOf("owner")>=0, hasR = r.indexOf("renter")>=0;
    if (hasO && hasR) return "both";
    if (hasO) return "owner";
    if (hasR) return "renter";
    return r[0] || "renter";
  }
  function labelFor(t){
    return t==="owner"?"Owner (Lender)":t==="renter"?"Renter":t==="both"?"Both (Renter & Owner)":t;
  }
  function applyTypeToUser(u, t){
    if (t==="both") u.role = ["owner","renter"];
    else if (t==="owner") u.role = ["owner"];
    else if (t==="renter") u.role = ["renter"];
    else u.role = [t];
    return u;
  }

  // ---- Page-level role enforcement for regular users ----
  // Owner-only pages must reject pure renters, and vice versa.
  function enforcePageRole(){
    var u = sget(); if (!u) return;
    var page = (location.pathname.split("/").pop()||"").toLowerCase();
    var inAdmin = /\/(admin|superadmin)\//.test(location.pathname);
    if (inAdmin) return;
    var t = currentAccountType(u);
    if (t === "both" || t === "admin" || t === "super_admin") return;
    var ownerOnly = ["my-listings.html","add-item.html","earnings.html","bookings.html"];
    var renterOnly = ["my-bookings.html","rental-history.html","wishlist.html"];
    if (t === "renter" && ownerOnly.indexOf(page) >= 0) {
      alert("This page is only available to Owner accounts. Request an account-type change in Settings.");
      location.replace("dashboard.html");
    } else if (t === "owner" && renterOnly.indexOf(page) >= 0) {
      alert("This page is only available to Renter accounts. Request an account-type change in Settings.");
      location.replace("dashboard.html");
    }
  }

  // ---- One-time notice on approval/rejection ----
  function showNotice(){
    var u = sget(); if (!u) return;
    var all = loadNotices();
    var n = all[u.id];
    if (!n) return;
    delete all[u.id]; saveNotices(all);
    var bar = document.createElement("div");
    bar.className = "alert " + (n.kind==="ok"?"alert-success":"alert-danger") + " alert-dismissible fade show m-3";
    bar.setAttribute("role","alert");
    bar.innerHTML = '<i class="bi bi-'+(n.kind==="ok"?"check-circle":"x-circle")+' me-2"></i>'+n.message+
                    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ---- Inject Account Type Management card on settings.html ----
  function injectSettingsCard(){
    if (!/settings\.html$/i.test(location.pathname)) return;
    if (/\/(admin|superadmin)\//.test(location.pathname)) return;
    if (document.getElementById("cwAcctTypeCard")) return;
    var u = sget(); if (!u) return;
    var grid = document.querySelector("main .row.g-4");
    if (!grid) return;
    var t = currentAccountType(u);
    var reqs = loadReqs().filter(function(r){ return r.userId===u.id && r.status==="pending"; });
    var pending = reqs[0];

    var options = ["renter","owner","both"].filter(function(x){ return x!==t; });
    var optsHTML = options.map(function(x){ return '<option value="'+x+'">'+labelFor(x)+'</option>'; }).join("");

    var statusHTML = pending
      ? '<div class="alert alert-warning small mb-3"><i class="bi bi-hourglass-split me-1"></i>'+
        'Request pending: <strong>'+labelFor(pending.from)+'</strong> → <strong>'+labelFor(pending.to)+'</strong>'+
        ' <button class="btn btn-sm btn-link p-0 ms-2" data-cw-cancel-req>Cancel</button></div>'
      : '';

    var formHTML = pending ? '' :
      '<form data-cw-req-form>'+
        '<div class="mb-2"><label class="form-label small fw-semibold">Requested account type</label>'+
          '<select name="to" class="form-select" required><option value="" disabled selected>Select new type</option>'+optsHTML+'</select></div>'+
        '<div class="mb-3"><label class="form-label small fw-semibold">Reason (optional)</label>'+
          '<textarea name="note" class="form-control" rows="2" placeholder="Tell the admin why"></textarea></div>'+
        '<button type="submit" class="btn btn-brand"><i class="bi bi-send me-1"></i>Request Account Type Change</button>'+
      '</form>';

    var col = document.createElement("div");
    col.className = "col-12";
    col.innerHTML =
      '<div id="cwAcctTypeCard" class="cw-card p-4">'+
        '<h5 class="mb-3"><i class="bi bi-arrow-repeat me-2 text-brand"></i>Account Type Management</h5>'+
        '<p class="small text-muted mb-2">Current account type:</p>'+
        '<p class="mb-3"><span class="badge bg-brand-soft text-brand fs-6 px-3 py-2">'+labelFor(t)+'</span></p>'+
        statusHTML + formHTML +
      '</div>';
    grid.appendChild(col);

    var form = col.querySelector("[data-cw-req-form]");
    if (form) {
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var to = form.querySelector('[name="to"]').value;
        var note = form.querySelector('[name="note"]').value || "";
        if (!to || to===t) { alert("Please choose a different account type."); return; }
        var all = loadReqs();
        all.push({
          id: Date.now(),
          userId: u.id, userName: u.name, userEmail: u.email,
          from: t, to: to, status: "pending",
          createdAt: new Date().toISOString(),
          note: note
        });
        saveReqs(all);
        alert("Your request has been submitted. An administrator will review it shortly.");
        location.reload();
      });
    }
    var cancel = col.querySelector("[data-cw-cancel-req]");
    if (cancel) {
      cancel.addEventListener("click", function(){
        if (!confirm("Cancel this pending request?")) return;
        var all = loadReqs().filter(function(r){ return !(r.userId===u.id && r.status==="pending"); });
        saveReqs(all);
        location.reload();
      });
    }
  }

  // ---- Admin / Superadmin: inject "Role Requests" sidebar link ----
  function injectAdminSidebarLink(){
    // Role Requests is a Super Admin-only surface
    var inSuper = /\/superadmin\//.test(location.pathname);
    if (!inSuper) return;
    // Defensive cleanup: remove any leftover role-requests link from admin sidebars
    document.querySelectorAll('[data-cw-admin-sidebar] a[href="role-requests.html"]').forEach(function(a){ a.remove(); });
    document.querySelectorAll("[data-cw-super-sidebar]").forEach(function(host){
      if (host.querySelector('[href="role-requests.html"]')) return;
      var firstSessionLabel = Array.from(host.querySelectorAll(".cw-sidebar-group-label"))
        .find(function(el){ return /session/i.test(el.textContent); });
      var pending = loadReqs().filter(function(r){return r.status==="pending";}).length;
      var badge = pending ? ' <span class="badge bg-danger ms-1">'+pending+'</span>' : '';
      var active = (location.pathname.split("/").pop()||"").toLowerCase()==="role-requests.html" ? " active" : "";
      var a = document.createElement("a");
      a.className = "nav-link"+active;
      a.href = "role-requests.html";
      a.innerHTML = '<i class="bi bi-arrow-left-right me-2"></i>Role Requests'+badge;
      if (firstSessionLabel) host.insertBefore(a, firstSessionLabel);
      else host.appendChild(a);
    });
  }

  // ---- Admin / Superadmin: render Role Requests page ----
  function renderRoleRequestsPage(){
    var host = document.getElementById("cwRoleReqRoot");
    if (!host) return;
    var u = sget();
    var isSuper = roleArr(u).indexOf("super_admin")>=0;
    var all = loadReqs().slice().sort(function(a,b){ return (b.createdAt||"").localeCompare(a.createdAt||""); });

    function row(r){
      var badge = r.status==="pending" ? '<span class="badge bg-warning text-dark">Pending</span>'
               : r.status==="approved" ? '<span class="badge bg-success">Approved</span>'
               : '<span class="badge bg-danger">Rejected</span>';
      var actions = "";
      if (r.status==="pending") {
        actions = '<button class="btn btn-sm btn-success me-1" data-cw-approve="'+r.id+'"><i class="bi bi-check2"></i> Approve</button>'+
                  '<button class="btn btn-sm btn-outline-danger" data-cw-reject="'+r.id+'"><i class="bi bi-x"></i> Reject</button>';
      } else if (isSuper) {
        actions = '<button class="btn btn-sm btn-outline-secondary" data-cw-override="'+r.id+'"><i class="bi bi-arrow-counterclockwise"></i> Override</button>';
      }
      return '<tr>'+
        '<td><div class="fw-semibold small">'+(r.userName||"")+'</div><div class="text-muted small">'+(r.userEmail||"")+'</div></td>'+
        '<td>'+labelFor(r.from)+'</td>'+
        '<td><i class="bi bi-arrow-right text-muted"></i> '+labelFor(r.to)+'</td>'+
        '<td>'+badge+'</td>'+
        '<td class="small text-muted">'+(r.note||"—")+'</td>'+
        '<td class="text-end">'+actions+'</td>'+
      '</tr>';
    }

    function paint(){
      all = loadReqs().slice().sort(function(a,b){ return (b.createdAt||"").localeCompare(a.createdAt||""); });
      var pending = all.filter(function(r){return r.status==="pending";});
      var others  = all.filter(function(r){return r.status!=="pending";});
      host.innerHTML =
        '<div class="mb-4"><h2 class="mb-1">Role Change Requests</h2>'+
          '<p class="text-muted mb-0">Review and act on account-type change requests.</p></div>'+
        '<div class="cw-card p-3 mb-4">'+
          '<h6 class="mb-3"><i class="bi bi-hourglass-split me-2 text-brand"></i>Pending ('+pending.length+')</h6>'+
          (pending.length ?
            '<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr>'+
            '<th>User</th><th>Current</th><th>Requested</th><th>Status</th><th>Reason</th><th class="text-end">Actions</th>'+
            '</tr></thead><tbody>'+pending.map(row).join("")+'</tbody></table></div>'
            : '<p class="text-muted small mb-0">No pending requests.</p>')+
        '</div>'+
        '<div class="cw-card p-3">'+
          '<h6 class="mb-3"><i class="bi bi-clock-history me-2 text-brand"></i>History</h6>'+
          (others.length ?
            '<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr>'+
            '<th>User</th><th>From</th><th>To</th><th>Status</th><th>Reason</th><th class="text-end">Actions</th>'+
            '</tr></thead><tbody>'+others.map(row).join("")+'</tbody></table></div>'
            : '<p class="text-muted small mb-0">No history yet.</p>')+
        '</div>';
      wireActions();
    }

    function applyToUserRecord(req){
      // Update sessionStorage user if it's the active session, and any cw_users_extra entry
      var extra = JSON.parse(localStorage.getItem("cw_users_extra")||"[]");
      var idx = extra.findIndex(function(x){ return x.id===req.userId; });
      if (idx>=0) { applyTypeToUser(extra[idx], req.to); localStorage.setItem("cw_users_extra", JSON.stringify(extra)); }
      // Active session user (if same browser)
      try {
        var su = JSON.parse(sessionStorage.getItem("cw_user")||"null");
        if (su && su.id===req.userId) { applyTypeToUser(su, req.to); sessionStorage.setItem("cw_user", JSON.stringify(su)); localStorage.setItem("cw_user", JSON.stringify(su)); }
      } catch(e){}
    }
    function notify(userId, kind, message){
      var n = loadNotices(); n[userId] = { kind: kind, message: message }; saveNotices(n);
    }

    function wireActions(){
      host.querySelectorAll("[data-cw-approve]").forEach(function(b){
        b.addEventListener("click", function(){
          var id = parseInt(b.getAttribute("data-cw-approve"),10);
          var arr = loadReqs(); var r = arr.find(function(x){return x.id===id;}); if(!r) return;
          r.status="approved"; r.decidedAt=new Date().toISOString(); r.decidedBy=(u&&u.name)||"Admin";
          saveReqs(arr); applyToUserRecord(r);
          notify(r.userId,"ok","Your account type has been successfully updated.");
          paint();
        });
      });
      host.querySelectorAll("[data-cw-reject]").forEach(function(b){
        b.addEventListener("click", function(){
          var id = parseInt(b.getAttribute("data-cw-reject"),10);
          var arr = loadReqs(); var r = arr.find(function(x){return x.id===id;}); if(!r) return;
          r.status="rejected"; r.decidedAt=new Date().toISOString(); r.decidedBy=(u&&u.name)||"Admin";
          saveReqs(arr);
          notify(r.userId,"err","Your account type change request was rejected by the administrator.");
          paint();
        });
      });
      host.querySelectorAll("[data-cw-override]").forEach(function(b){
        b.addEventListener("click", function(){
          var id = parseInt(b.getAttribute("data-cw-override"),10);
          var arr = loadReqs(); var r = arr.find(function(x){return x.id===id;}); if(!r) return;
          if (!confirm("Override and apply this change anyway?")) return;
          r.status="approved"; r.decidedAt=new Date().toISOString(); r.decidedBy=((u&&u.name)||"Super Admin")+" (override)";
          saveReqs(arr); applyToUserRecord(r);
          notify(r.userId,"ok","Your account type has been successfully updated.");
          paint();
        });
      });
    }

    paint();
  }

  document.addEventListener("DOMContentLoaded", function(){
    enforcePageRole();
    showNotice();
    injectSettingsCard();
    injectAdminSidebarLink();
    renderRoleRequestsPage();
  });
})();

/* ====================================================================
   v16 — Single-role dashboard simplification, Admin vs Super Admin
         visual theme split, and Role Requests CTA on admin Users page.
   No HTML files were edited — everything injected at runtime.
   ==================================================================== */
(function(){
  function sget(){ try { return JSON.parse(sessionStorage.getItem("cw_user")||"null"); } catch(e){ return null; } }
  function roleArr(u){ if(!u) return []; return Array.isArray(u.role) ? u.role : [u.role]; }

  // ---- Single-role dashboard: drop the "I'm Lending / I'm Renting" tabs
  function simplifyDashboard(){
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var u = sget(); if (!u) return;
    var r = roleArr(u);
    var hasO = r.indexOf("owner")>=0, hasR = r.indexOf("renter")>=0;
    if (hasO && hasR) return; // both — keep both tabs

    var tabs = document.querySelector(".cw-dash-tabs");
    if (tabs) tabs.style.display = "none";
    var paneLend = document.getElementById("pane-lend");
    var paneRent = document.getElementById("pane-rent");
    var keepLend = hasO && !hasR;

    if (keepLend){
      if (paneRent) paneRent.remove();
      if (paneLend){ paneLend.classList.add("show","active"); paneLend.classList.remove("fade"); }
    } else {
      if (paneLend) paneLend.remove();
      if (paneRent){ paneRent.classList.add("show","active"); paneRent.classList.remove("fade"); }
    }

    var sub = document.querySelector("main p.text-muted.mb-0");
    if (sub && /switch between lending and renting/i.test(sub.textContent)){
      sub.textContent = keepLend
        ? "Manage your listings, incoming bookings and earnings."
        : "Browse, book and track the items you rent.";
    }
    // Renters don't need the "New listing" CTA
    if (!keepLend){
      document.querySelectorAll('a.btn-brand[href="add-item.html"]').forEach(function(a){ a.style.display="none"; });
    }
  }

  // ---- Admin vs Super Admin: distinct visual theme so the role is obvious
  function themeAdmin(){
    var isSuper = /\/superadmin\//.test(location.pathname);
    var isAdmin = /\/admin\//.test(location.pathname);
    if (!isSuper && !isAdmin) return;
    document.body.classList.add(isSuper ? "cw-theme-super" : "cw-theme-admin");
    if (document.getElementById("cwAdminThemeCSS")) return;
    var css = document.createElement("style");
    css.id = "cwAdminThemeCSS";
    css.textContent =
      /* Admin = red accent on a light shell */
      '.cw-theme-admin .cw-navbar{border-top:4px solid #dc3545;background:#ffffff;}'+
      '.cw-theme-admin .cw-sidebar .nav-link.active{background:#fdecea;color:#dc3545;}'+
      '.cw-theme-admin .cw-sidebar .nav-link.active i{color:#dc3545;}'+
      /* Super Admin = cool teal accent on a clean white shell (no shifting gradient) */
      '.cw-theme-super .cw-navbar{border-top:4px solid #0f766e;background:#ffffff;}'+
      '.cw-theme-super .cw-sidebar{background:#0f1115;color:#e9ecef;min-height:calc(100vh - 64px);}'+
      '.cw-theme-super .cw-sidebar .nav-link{color:#cbd5e1;}'+
      '.cw-theme-super .cw-sidebar .nav-link i{color:#94a3b8;}'+
      '.cw-theme-super .cw-sidebar .nav-link:hover{background:#1f2937;color:#fff;}'+
      '.cw-theme-super .cw-sidebar .nav-link:hover i{color:#fff;}'+
      '.cw-theme-super .cw-sidebar .nav-link.active{background:#0f766e;color:#fff;}'+
      '.cw-theme-super .cw-sidebar .nav-link.active i{color:#fff;}'+
      '.cw-theme-super .cw-sidebar-group-label{color:#94a3b8 !important;}'+
      '.cw-theme-super .cw-sidebar [data-user-name],'+
      '.cw-theme-super .cw-sidebar .fw-semibold{color:#f1f5f9;}'+
      '.cw-theme-super .cw-sidebar .text-muted{color:#94a3b8 !important;}';
    document.head.appendChild(css);
  }

  // ---- Surface Role Requests on Admin/Super Admin "Users" page
  function injectUsersPageCTA(){
    var page = (location.pathname.split("/").pop()||"").toLowerCase();
    if (page !== "users.html") return;
    if (!/\/superadmin\//.test(location.pathname)) return;
    if (document.getElementById("cwUsersRoleReqCTA")) return;
    var header = document.querySelector("main > .mb-4") || document.querySelector("main .mb-4");
    if (!header) return;
    var pending = 0;
    try { pending = (JSON.parse(localStorage.getItem("cw_role_requests")||"[]"))
                     .filter(function(r){return r.status==="pending";}).length; } catch(e){}
    var badge = pending ? ' <span class="badge bg-danger ms-1">'+pending+'</span>' : '';
    var bar = document.createElement("div");
    bar.id = "cwUsersRoleReqCTA";
    bar.className = "d-flex flex-wrap align-items-center gap-2 mb-3";
    bar.innerHTML =
      '<a href="role-requests.html" class="btn btn-brand btn-sm">'+
        '<i class="bi bi-arrow-left-right me-1"></i>Role Change Requests'+badge+'</a>'+
      '<span class="text-muted small">Review and approve users who asked to change their account type.</span>';
    header.insertAdjacentElement("afterend", bar);
  }

  document.addEventListener("DOMContentLoaded", function(){
    themeAdmin();
    simplifyDashboard();
    injectUsersPageCTA();
  });
})();

/* ===== v18: Hero carousel — featured ads + platform promos ===== */
(function(){
  var ADS_KEY = "cw_featured_ads";
  // Future architecture: owners submit ad requests stored in cw_ad_requests
  // (status: pending|approved|rejected). Super Admin approves -> moved into
  // cw_featured_ads. Only approved ads with active=true render here.
  var DEFAULT_ADS = [
    {
      id: "ad-1",
      type: "ad",
      active: true,
      image: "assets/images/cameras.jpg",
      itemName: "Canon DSLR Camera Kit",
      description: "Pro-grade DSLR with 2 lenses — perfect for events, weddings & shoots.",
      ownerName: "Abdiwali Studio",
      ctaText: "View Listing",
      ctaHref: "view-details.html"
    },
    {
      id: "ad-2",
      type: "ad",
      active: true,
      image: "assets/images/generators.jpg",
      itemName: "Honda 5kW Generator",
      description: "Reliable backup power for events, shops and construction sites.",
      ownerName: "Hassan Power Rentals",
      ctaText: "View Listing",
      ctaHref: "view-details.html"
    },
    {
      id: "ad-3",
      type: "ad",
      active: true,
      image: "assets/images/speaker.jpg",
      itemName: "JBL Pro Speaker System",
      description: "Loud, clean sound for weddings, parties and corporate events.",
      ownerName: "Jigjiga Sound Co.",
      ctaText: "View Listing",
      ctaHref: "view-details.html"
    }
  ];
  var PROMOS = [
    {
      id: "promo-list",
      type: "promo",
      image: "assets/images/power-tools.jpg",
      eyebrow: "For Owners",
      title: "List Your Item and Start Earning",
      description: "Turn idle gear into income. List in minutes, get bookings from verified neighbours, and earn in ETB with safe escrow.",
      ctaText: "Become an Owner",
      ctaHref: "add-item.html"
    },
    {
      id: "promo-rent",
      type: "promo",
      image: "assets/images/event-gear.jpg",
      eyebrow: "For Renters",
      title: "Rent What You Need, When You Need It",
      description: "Skip the cost of buying. Browse 2,400+ local listings across Jigjiga and book what you need for as long as you need it.",
      ctaText: "Browse Rentals",
      ctaHref: "listings.html"
    }
  ];
  function loadAds(){
    try {
      var raw = localStorage.getItem(ADS_KEY);
      if (!raw) return DEFAULT_ADS;
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : DEFAULT_ADS;
    } catch(e){ return DEFAULT_ADS; }
  }
  function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];}); }
  function slideAd(ad, idx, active){
    return ''
      + '<div class="carousel-item '+(active?'active':'')+'">'
      + '  <div class="cw-hero-slide" style="background-image:url(\''+esc(window.cwPath(ad.image))+'\')">'
      + '    <div class="cw-hero-overlay"></div>'
      + '    <div class="container">'
      + '      <div class="row align-items-center">'
      + '        <div class="col-lg-8">'
      + '          <span class="eyebrow cw-ad-badge mb-3"><i class="bi bi-megaphone-fill me-1"></i> Featured</span>'
      + '          <h1 class="display-5 fw-bold mt-3">'+esc(ad.itemName)+'</h1>'
      + '          <p class="lead mt-3 mb-2">'+esc(ad.description)+'</p>'
      + '          <p class="cw-hero-owner mb-4"><i class="bi bi-person-circle me-1"></i> by '+esc(ad.ownerName)+'</p>'
      + '          <a href="'+esc(ad.ctaHref||'view-details.html')+'" class="btn btn-light btn-lg">'+esc(ad.ctaText||'View Listing')+'</a>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }
  function slidePromo(p, active){
    return ''
      + '<div class="carousel-item '+(active?'active':'')+'">'
      + '  <div class="cw-hero-slide" style="background-image:url(\''+esc(window.cwPath(p.image))+'\')">'
      + '    <div class="cw-hero-overlay"></div>'
      + '    <div class="container">'
      + '      <div class="row align-items-center">'
      + '        <div class="col-lg-8">'
      + '          <span class="eyebrow mb-3">'+esc(p.eyebrow)+'</span>'
      + '          <h1 class="display-4 fw-bold mt-3">'+esc(p.title)+'</h1>'
      + '          <p class="lead mt-3 mb-4">'+esc(p.description)+'</p>'
      + '          <a href="'+esc(p.ctaHref)+'" class="btn btn-light btn-lg">'+esc(p.ctaText)+'</a>'
      + '        </div>'
      + '      </div>'
      + '    </div>'
      + '  </div>'
      + '</div>';
  }
  function render(){
    var mount = document.getElementById("cwHeroCarousel");
    if (!mount) return;
    var ads = loadAds().filter(function(a){ return a && a.active !== false; }).slice(0,3);
    while (ads.length < 3) ads.push(DEFAULT_ADS[ads.length]);
    var slides = [];
    ads.forEach(function(a,i){ slides.push(slideAd(a,i,false)); });
    PROMOS.forEach(function(p){ slides.push(slidePromo(p,false)); });
    // make first slide active
    slides[0] = slides[0].replace('carousel-item ', 'carousel-item active ');
    var inds = slides.map(function(_,i){
      return '<button type="button" data-bs-target="#cwHeroBsCarousel" data-bs-slide-to="'+i+'"'+(i===0?' class="active" aria-current="true"':'')+' aria-label="Slide '+(i+1)+'"></button>';
    }).join('');
    mount.innerHTML = ''
      + '<div id="cwHeroBsCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="3500">'
      + '  <div class="carousel-indicators">'+inds+'</div>'
      + '  <div class="carousel-inner">'+slides.join('')+'</div>'
      + '  <button class="carousel-control-prev" type="button" data-bs-target="#cwHeroBsCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon"></span><span class="visually-hidden">Previous</span></button>'
      + '  <button class="carousel-control-next" type="button" data-bs-target="#cwHeroBsCarousel" data-bs-slide="next"><span class="carousel-control-next-icon"></span><span class="visually-hidden">Next</span></button>'
      + '</div>';
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();

/* ====================================================================
   v20 — Premium hero background slider + Contact messages workflow
         + Super Admin Analytics charts
   Pure additive module. No HTML/CSS files are modified directly
   (except two new shell pages for messages).
   ==================================================================== */
(function(){
  var page = (location.pathname.split("/").pop()||"home.html").toLowerCase();
  var inAdmin = /\/admin\//.test(location.pathname);
  var inSuper = /\/superadmin\//.test(location.pathname);

  // ---------- shared helpers ----------
  function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
  function lsGet(k,def){ try{var r=localStorage.getItem(k); return r?JSON.parse(r):def;}catch(e){return def;} }
  function lsSet(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch(e){} }
  function uid(p){ return (p||"id")+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7); }
  function nowISO(){ return new Date().toISOString(); }
  function injectStyle(id, css){
    if (document.getElementById(id)) return;
    var s=document.createElement("style"); s.id=id; s.textContent=css; document.head.appendChild(s);
  }
  function whenReady(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function loadScript(src){
    return new Promise(function(res,rej){
      if (document.querySelector('script[data-cw-lib="'+src+'"]')) return res();
      var s=document.createElement("script"); s.src=src; s.async=true; s.setAttribute("data-cw-lib",src);
      s.onload=function(){res();}; s.onerror=function(){rej(new Error("load fail "+src));};
      document.head.appendChild(s);
    });
  }

  /* =================================================================
     1) PREMIUM HERO BACKGROUND SLIDER (home.html)
     ================================================================= */
  var AD_SLIDES_KEY = "cw_hero_ads";
  // Future: Owner submits ad request -> Admin reviews -> Owner pays ->
  // Super Admin approves -> entry appears here with active:true.
  // Featured listings shown in the hero rotator. Hand-picked, high-quality
  // images that represent the platform well.
  var DEFAULT_AD_SLIDES = [
    { id:"ad-1", type:"ad", active:true, image:"assets/images/cameras.jpg",
      title:"Professional Camera Kit",
      description:"Capture every moment with premium photography equipment.",
      ctaText:"View Listing", ctaHref:"view-details.html" },
    { id:"ad-2", type:"ad", active:true, image:"assets/images/generators.jpg",
      title:"Honda 5kW Generator",
      description:"Reliable backup power for events, shops and construction sites.",
      ctaText:"View Listing", ctaHref:"view-details.html" },
    { id:"ad-3", type:"ad", active:true, image:"assets/images/speaker.jpg",
      title:"JBL Pro Speaker System",
      description:"Loud, clean sound for weddings, parties and corporate events.",
      ctaText:"View Listing", ctaHref:"view-details.html" }
  ];
  // Two promotional slides shown after the featured listings.
  var VALUE_SLIDES = [
    { id:"val-1", type:"value", image:"assets/images/event-gear.jpg",
      title:"Rent Anything Nearby",
      description:"Find trusted local rentals quickly — verified owners, safe escrow, pay in ETB.",
      ctaText:"Browse Rentals", ctaHref:"listings.html" },
    { id:"val-2", type:"value", image:"assets/images/power-tools.jpg",
      title:"Turn Your Idle Items Into Income",
      description:"List your unused gear in minutes and start earning from your neighbours.",
      ctaText:"Start Listing", ctaHref:"add-item.html" }
  ];

  function heroSliderCSS(){
    return ''
    +'.cw-hero.cw-hero-modern{position:relative;overflow:hidden;min-height:640px;}'
    +'@media (max-width: 768px){.cw-hero.cw-hero-modern{min-height:560px;}}'
    +'.cw-hero-bg-video{display:none !important;}'
    +'.cw-hero-bg-slider{position:absolute;inset:0;z-index:0;overflow:hidden;}'
    +'.cw-hero-bg-slider .cw-hbg{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.4s ease-in-out;transform:scale(1.06);animation:cwHeroZoom 9s ease-in-out infinite alternate;will-change:opacity,transform;}'
    +'.cw-hero-bg-slider .cw-hbg.is-active{opacity:1;}'
    +'@keyframes cwHeroZoom{0%{transform:scale(1.04);}100%{transform:scale(1.14);}}'
    +'.cw-hero.cw-hero-modern .cw-hero-overlay{position:absolute;inset:0;z-index:1;background:linear-gradient(135deg, rgba(13,42,92,0.72) 0%, rgba(15,52,96,0.62) 50%, rgba(11,33,73,0.78) 100%);}'
    +'.cw-hero.cw-hero-modern > .container{position:relative;z-index:3;}'
    +'.cw-hero-featured-card{position:absolute;left:24px;bottom:24px;z-index:3;max-width:340px;background:rgba(255,255,255,0.96);color:#1c2230;border-radius:14px;padding:14px 16px;box-shadow:0 18px 40px -12px rgba(0,0,0,0.45);display:flex;gap:12px;align-items:flex-start;backdrop-filter:blur(6px);opacity:0;transform:translateY(12px);transition:opacity .5s ease, transform .5s ease;}'
    +'.cw-hero-featured-card.is-visible{opacity:1;transform:translateY(0);}'
    +'.cw-hero-featured-card img{width:60px;height:60px;border-radius:10px;object-fit:cover;flex:0 0 60px;}'
    +'.cw-hero-featured-card .cw-hf-body{min-width:0;}'
    +'.cw-hero-featured-card .cw-hf-badge{display:inline-block;background:#22d3ee;color:#1c2230;font-size:.7rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 8px;border-radius:999px;margin-bottom:4px;}'
    +'.cw-hero-featured-card .cw-hf-badge.is-value{background:#0e7490;color:#fff;}'
    +'.cw-hero-featured-card .cw-hf-title{font-weight:700;font-size:.95rem;line-height:1.2;margin:0 0 2px;}'
    +'.cw-hero-featured-card .cw-hf-desc{font-size:.78rem;color:#5b6370;margin:0 0 6px;line-height:1.3;}'
    +'.cw-hero-featured-card .cw-hf-cta{font-size:.78rem;font-weight:600;text-decoration:none;}'
    +'.cw-hero-dots{position:absolute;right:24px;bottom:24px;z-index:3;display:flex;gap:8px;}'
    +'.cw-hero-dots button{width:28px;height:4px;border-radius:2px;border:0;background:rgba(255,255,255,0.4);padding:0;cursor:pointer;transition:background .3s ease, width .3s ease;}'
    +'.cw-hero-dots button.is-active{background:#fff;width:40px;}'
    +'@media (max-width: 576px){.cw-hero-featured-card{left:12px;right:12px;bottom:12px;max-width:none;}.cw-hero-dots{right:12px;bottom:auto;top:12px;}}'
    +'#cwHeroCarousel{display:none !important;}' // hide legacy below-hero carousel
    ;
  }

  function loadAdSlides(){
    var stored = lsGet(AD_SLIDES_KEY, null);
    if (Array.isArray(stored) && stored.length) return stored;
    return DEFAULT_AD_SLIDES;
  }
  function buildHeroSlider(){
    if (page !== "home.html" && page !== "index.html" && page !== "") return;
    var hero = document.querySelector(".cw-hero.cw-hero-modern");
    if (!hero) return;
    injectStyle("cw-hero-slider-css", heroSliderCSS());

    // Build the rotating background layer
    var ads = loadAdSlides().filter(function(s){return s && s.active !== false;}).slice(0,3);
    while (ads.length < 3) ads.push(DEFAULT_AD_SLIDES[ads.length]);
    var slides = ads.concat(VALUE_SLIDES);

    var bg = document.createElement("div");
    bg.className = "cw-hero-bg-slider";
    bg.innerHTML = slides.map(function(s,i){
      return '<div class="cw-hbg'+(i===0?' is-active':'')+'" style="background-image:url(\''+esc(window.cwPath(s.image))+'\')" aria-hidden="true"></div>';
    }).join("");
    hero.insertBefore(bg, hero.firstChild);

    // Featured/Value info card (compact, bottom-left)
    var card = document.createElement("div");
    card.className = "cw-hero-featured-card";
    card.innerHTML = '<img alt="" /><div class="cw-hf-body">'
      + '<span class="cw-hf-badge">Featured</span>'
      + '<p class="cw-hf-title"></p><p class="cw-hf-desc"></p>'
      + '<a class="cw-hf-cta text-brand" href="#">View →</a></div>';
    hero.appendChild(card);

    // Dots
    var dots = document.createElement("div");
    dots.className = "cw-hero-dots";
    dots.innerHTML = slides.map(function(_,i){
      return '<button type="button" aria-label="Slide '+(i+1)+'"'+(i===0?' class="is-active"':'')+'></button>';
    }).join("");
    hero.appendChild(dots);

    var bgEls = bg.querySelectorAll(".cw-hbg");
    var dotEls = dots.querySelectorAll("button");
    var img = card.querySelector("img");
    var badge = card.querySelector(".cw-hf-badge");
    var title = card.querySelector(".cw-hf-title");
    var desc  = card.querySelector(".cw-hf-desc");
    var cta   = card.querySelector(".cw-hf-cta");

    function show(i){
      bgEls.forEach(function(el,idx){ el.classList.toggle("is-active", idx===i); });
      dotEls.forEach(function(el,idx){ el.classList.toggle("is-active", idx===i); });
      var s = slides[i];
      card.classList.remove("is-visible");
      setTimeout(function(){
        img.src = window.cwPath(s.image);
        img.alt = s.title;
        badge.textContent = s.type === "ad" ? "Featured" : "Platform";
        badge.classList.toggle("is-value", s.type !== "ad");
        title.textContent = s.title;
        desc.textContent = s.description;
        cta.textContent = (s.ctaText || "View") + " →";
        cta.href = s.ctaHref || "#";
        card.classList.add("is-visible");
      }, 250);
    }
    show(0);
    var idx = 0, timer = null;
    function start(){ stop(); timer = setInterval(function(){ idx = (idx+1) % slides.length; show(idx); }, 6000); }
    function stop(){ if (timer) clearInterval(timer); }
    dotEls.forEach(function(d,i){ d.addEventListener("click", function(){ idx=i; show(idx); start(); }); });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  /* =================================================================
     2) CONTACT FORM -> stored as messages
     ================================================================= */
  var MSG_KEY = "cw_contact_messages";
  function loadMessages(){ return lsGet(MSG_KEY, []); }
  function saveMessages(arr){ lsSet(MSG_KEY, arr); }
  function unreadCount(){ return loadMessages().filter(function(m){return m.status==="new";}).length; }
  function escalatedCount(){ return loadMessages().filter(function(m){return m.escalated && m.status!=="resolved";}).length; }

  function wireContactForm(){
    if (page !== "contact.html") return;
    var form = document.querySelector('form');
    if (!form) return;
    form.setAttribute("novalidate","true");
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var inputs = form.querySelectorAll("input, textarea");
      var firstName = inputs[0] ? inputs[0].value.trim() : "";
      var lastName  = inputs[1] ? inputs[1].value.trim() : "";
      var email     = inputs[2] ? inputs[2].value.trim() : "";
      var phone     = inputs[3] ? inputs[3].value.trim() : "";
      var message   = form.querySelector("textarea") ? form.querySelector("textarea").value.trim() : "";
      if (!firstName || !email || !message){ alert("Please fill in name, email and message."); return; }
      var arr = loadMessages();
      arr.unshift({
        id: uid("msg"),
        firstName: firstName, lastName: lastName,
        name: (firstName+" "+lastName).trim(),
        email: email, phone: phone,
        message: message,
        status: "new",          // new | replied | resolved
        escalated: false,
        replies: [],
        createdAt: nowISO(),
        updatedAt: nowISO()
      });
      saveMessages(arr);
      form.reset();
      var ok = document.createElement("div");
      ok.className = "alert alert-success mt-3";
      ok.innerHTML = '<i class="bi bi-check-circle me-2"></i>Thanks! Your message has been sent. Our team will reply within 24 hours.';
      form.parentNode.appendChild(ok);
      setTimeout(function(){ ok.remove(); }, 6000);
    });
  }

  /* =================================================================
     3) ADMIN / SUPER ADMIN sidebar links for messages
     ================================================================= */
  function injectMessagesSidebarLinks(){
    // Admin: "Contact Messages" with unread badge
    if (inAdmin) {
      document.querySelectorAll("[data-cw-admin-sidebar]").forEach(function(host){
        if (host.querySelector('a[href="messages.html"][data-cw-msglink]')) return;
        var n = unreadCount();
        var badge = n ? ' <span class="badge bg-danger ms-1">'+n+'</span>' : '';
        var active = page === "messages.html" ? " active" : "";
        var a = document.createElement("a");
        a.className = "nav-link"+active;
        a.href = "messages.html";
        a.setAttribute("data-cw-msglink","1");
        a.innerHTML = '<i class="bi bi-envelope-fill me-2"></i>Contact Messages'+badge;
        host.appendChild(a);
      });
    }
    // Super Admin: "Escalated Messages"
    if (inSuper) {
      document.querySelectorAll("[data-cw-super-sidebar]").forEach(function(host){
        if (host.querySelector('a[href="messages.html"][data-cw-msglink]')) return;
        var n = escalatedCount();
        var badge = n ? ' <span class="badge bg-warning text-dark ms-1">'+n+'</span>' : '';
        var active = page === "messages.html" ? " active" : "";
        var a = document.createElement("a");
        a.className = "nav-link"+active;
        a.href = "messages.html";
        a.setAttribute("data-cw-msglink","1");
        a.innerHTML = '<i class="bi bi-flag-fill me-2"></i>Escalated Messages'+badge;
        host.appendChild(a);
      });
    }
  }

  /* =================================================================
     4) MESSAGES PAGE renderer (admin + superadmin)
     ================================================================= */
  function renderMessagesPage(){
    var host = document.getElementById("cwMessagesRoot");
    if (!host) return;
    var superMode = inSuper;

    function paint(){
      var all = loadMessages().slice();
      var list = superMode
        ? all.filter(function(m){ return m.escalated; })
        : all;
      var counts = {
        total: list.length,
        unread: list.filter(function(m){return m.status==="new";}).length,
        replied: list.filter(function(m){return m.status==="replied";}).length,
        resolved: list.filter(function(m){return m.status==="resolved";}).length
      };

      function statusBadge(m){
        if (m.status==="resolved") return '<span class="badge bg-success">Resolved</span>';
        if (m.status==="replied")  return '<span class="badge bg-info text-dark">Replied</span>';
        return '<span class="badge bg-warning text-dark">New</span>';
      }
      function row(m){
        var actions = '';
        if (!superMode) {
          actions += '<button class="btn btn-sm btn-outline-primary me-1" data-cw-reply="'+m.id+'"><i class="bi bi-reply"></i> Reply</button>';
          if (m.status!=="resolved") actions += '<button class="btn btn-sm btn-outline-success me-1" data-cw-resolve="'+m.id+'"><i class="bi bi-check2"></i> Resolve</button>';
          if (!m.escalated) actions += '<button class="btn btn-sm btn-outline-warning" data-cw-escalate="'+m.id+'"><i class="bi bi-flag"></i> Escalate</button>';
          else actions += '<span class="badge bg-warning text-dark ms-1">Escalated</span>';
        } else {
          actions += '<button class="btn btn-sm btn-outline-primary me-1" data-cw-reply="'+m.id+'"><i class="bi bi-reply"></i> Reply</button>';
          if (m.status!=="resolved") actions += '<button class="btn btn-sm btn-success" data-cw-resolve="'+m.id+'"><i class="bi bi-check2"></i> Mark Resolved</button>';
        }
        var when = (m.createdAt||"").replace("T"," ").slice(0,16);
        var snippet = esc(m.message||"").slice(0,140) + ((m.message||"").length>140?"…":"");
        var replies = (m.replies||[]).map(function(r){
          return '<div class="border-start ps-2 mt-2 small text-muted"><strong>'+esc(r.by||"Staff")+':</strong> '+esc(r.text)+' <em class="ms-1">'+(r.at||"").slice(0,16).replace("T"," ")+'</em></div>';
        }).join("");
        return '<tr>'
          + '<td><div class="fw-semibold">'+esc(m.name||"")+'</div><div class="small text-muted">'+esc(m.email||"")+(m.phone?' · '+esc(m.phone):'')+'</div></td>'
          + '<td><div class="small">'+esc(snippet)+'</div>'+replies+'</td>'
          + '<td class="small text-muted">'+esc(when)+'</td>'
          + '<td>'+statusBadge(m)+(m.escalated && !superMode ? ' <span class="badge bg-warning text-dark ms-1">Escalated</span>':'')+'</td>'
          + '<td class="text-end" style="min-width:280px;">'+actions+'</td>'
          + '</tr>';
      }

      host.innerHTML =
        '<div class="mb-4"><h2 class="mb-1">'+(superMode?"Escalated Messages":"Contact Messages")+'</h2>'
        + '<p class="text-muted mb-0">'+(superMode
            ? "Only messages escalated by an Admin appear here."
            : "Messages submitted via the public Contact page.")+'</p></div>'
        + '<div class="row g-3 mb-4">'
        +   '<div class="col-sm-6 col-xl-3"><div class="cw-card p-3"><span class="text-muted small">Total</span><h3 class="mb-0 mt-2">'+counts.total+'</h3></div></div>'
        +   '<div class="col-sm-6 col-xl-3"><div class="cw-card p-3"><span class="text-muted small">Unread</span><h3 class="mb-0 mt-2">'+counts.unread+'</h3></div></div>'
        +   '<div class="col-sm-6 col-xl-3"><div class="cw-card p-3"><span class="text-muted small">Replied</span><h3 class="mb-0 mt-2">'+counts.replied+'</h3></div></div>'
        +   '<div class="col-sm-6 col-xl-3"><div class="cw-card p-3"><span class="text-muted small">Resolved</span><h3 class="mb-0 mt-2">'+counts.resolved+'</h3></div></div>'
        + '</div>'
        + '<div class="cw-card p-3">'
        +   (list.length
              ? '<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr>'
                + '<th>From</th><th>Message</th><th>When</th><th>Status</th><th class="text-end">Actions</th>'
                + '</tr></thead><tbody>'+list.map(row).join("")+'</tbody></table></div>'
              : '<p class="text-muted small mb-0">No messages yet.</p>')
        + '</div>';
      wire();
    }

    function update(id, patch){
      var arr = loadMessages();
      var i = arr.findIndex(function(m){return m.id===id;});
      if (i<0) return;
      Object.keys(patch).forEach(function(k){ arr[i][k] = patch[k]; });
      arr[i].updatedAt = nowISO();
      saveMessages(arr);
      paint();
    }

    function wire(){
      host.querySelectorAll("[data-cw-reply]").forEach(function(b){
        b.addEventListener("click", function(){
          var id = b.getAttribute("data-cw-reply");
          var text = prompt("Type your reply:");
          if (!text) return;
          var arr = loadMessages();
          var i = arr.findIndex(function(m){return m.id===id;}); if (i<0) return;
          arr[i].replies = arr[i].replies||[];
          arr[i].replies.push({ by: superMode?"Super Admin":"Admin", text: text, at: nowISO() });
          arr[i].status = "replied";
          arr[i].updatedAt = nowISO();
          saveMessages(arr);
          paint();
        });
      });
      host.querySelectorAll("[data-cw-resolve]").forEach(function(b){
        b.addEventListener("click", function(){ update(b.getAttribute("data-cw-resolve"), { status: "resolved" }); });
      });
      host.querySelectorAll("[data-cw-escalate]").forEach(function(b){
        b.addEventListener("click", function(){
          if (!confirm("Escalate this message to Super Admin?")) return;
          update(b.getAttribute("data-cw-escalate"), { escalated: true });
        });
      });
    }
    paint();
  }

  /* =================================================================
     5) SUPER ADMIN ANALYTICS — charts + summary cards
     ================================================================= */
  function injectAnalyticsDarkCSS(){
    injectStyle("cw-sa-analytics-css",
      '.cw-sa-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:1rem;}'
     +'.cw-sa-chart{position:relative;height:280px;}'
     +':root[data-theme="dark"] .cw-card{background:#1c2230 !important;color:#e9ecef;}'
     +':root[data-theme="dark"] .cw-card .text-muted{color:#9aa4b2 !important;}'
     +':root[data-theme="dark"] table{color:#e9ecef;}'
     +':root[data-theme="dark"] .table>:not(caption)>*>*{background-color:transparent;color:#e9ecef;border-color:#2b3340;}'
    );
  }

  function seedAnalyticsData(){
    // Pull from existing localStorage where possible
    var users   = lsGet("cw_users_extra", []);
    var reqs    = lsGet("cw_role_requests", []);
    var msgs    = loadMessages();
    var ads     = loadAdSlides();

    // Demo-ish growth series — deterministic & honest "—when available"
    var months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var growth = [120,180,260,340,430,520,640,780,910,1050,1180,1284];
    var newRegs = [120,60,80,80,90,90,120,140,130,140,130,104];
    var bookings = [40,55,75,80,110,130,160,180,200,220,240,260];
    var revenue  = [22,28,36,42,55,68,82,95,110,130,150,170]; // in 1000s ETB
    var adRev    = [0,2,3,5,8,10,12,14,16,18,22,26]; // in 1000s ETB

    var owners  = users.filter(function(u){var r=u.role||[]; return r.indexOf("owner")>=0 && r.indexOf("renter")<0;}).length || 312;
    var renters = users.filter(function(u){var r=u.role||[]; return r.indexOf("renter")>=0 && r.indexOf("owner")<0;}).length || 740;
    var both    = users.filter(function(u){var r=u.role||[]; return r.indexOf("owner")>=0 && r.indexOf("renter")>=0;}).length || 232;
    var admins  = users.filter(function(u){var r=u.role||[]; return r.indexOf("admin")>=0 || r.indexOf("super_admin")>=0;}).length || 8;
    var normals = (growth[growth.length-1]) - admins;

    return {
      months: months, growth: growth, newRegs: newRegs,
      bookings: bookings, revenue: revenue, adRev: adRev,
      owners: owners, renters: renters, both: both,
      admins: admins, normals: normals,
      totalUsers: growth[growth.length-1],
      totalListings: 2415,
      totalBookings: bookings.reduce(function(a,b){return a+b;},0),
      totalRevenue: revenue.reduce(function(a,b){return a+b;},0)*1000,
      pendingApprovals: (reqs||[]).filter(function(r){return r.status==="pending";}).length + 17,
      unreadMessages: msgs.filter(function(m){return m.status==="new";}).length,
      categories: [
        {name:"Electronics",count:412},{name:"Power Tools",count:287},{name:"Event Gear",count:196},
        {name:"Vehicles",count:134},{name:"Cameras",count:178},{name:"Generators",count:92},
        {name:"Furniture",count:215},{name:"Kitchen",count:167}
      ],
      listingsActive: 2100, listingsInactive: 315,
      approvedRej: { approved: 1820, rejected: 142 },
      topListings: [
        {name:"Canon DSLR Kit", bookings: 86, revenue: 142000},
        {name:"Honda Generator 5kW", bookings: 74, revenue: 128000},
        {name:"JBL Pro Speakers", bookings: 61, revenue: 98000},
        {name:"Wedding Chairs (×100)", bookings: 58, revenue: 84000},
        {name:"Bosch Power Drill", bookings: 52, revenue: 41000}
      ]
    };
  }

  function renderSuperAnalytics(){
    return;
    if (!inSuper || page !== "analytics.html") return;
    var main = document.querySelector("main");
    if (!main) return;
    // Replace existing analytics content body (keep the heading block at the top)
    var heading = main.querySelector(".mb-4");
    main.innerHTML = "";
    if (heading) main.appendChild(heading);

    injectAnalyticsDarkCSS();

    var d = seedAnalyticsData();
    var fmtN = function(n){ return Number(n||0).toLocaleString(); };

    // Summary cards
    var cards = document.createElement("div");
    cards.className = "row g-3 mb-4";
    var cardItems = [
      {l:"Total Users",      v:fmtN(d.totalUsers),                i:"bi-people-fill",   c:"primary"},
      {l:"Total Owners",     v:fmtN(d.owners+d.both),             i:"bi-shop",          c:"success"},
      {l:"Total Renters",    v:fmtN(d.renters+d.both),            i:"bi-bag-check",     c:"info"},
      {l:"Total Listings",   v:fmtN(d.totalListings),             i:"bi-collection",    c:"warning"},
      {l:"Total Bookings",   v:fmtN(d.totalBookings),             i:"bi-calendar-check",c:"secondary"},
      {l:"Total Revenue",    v:fmtN(d.totalRevenue)+" ETB",       i:"bi-cash-stack",    c:"success"},
      {l:"Pending Approvals",v:fmtN(d.pendingApprovals),          i:"bi-hourglass-split",c:"danger"},
      {l:"Unread Messages",  v:fmtN(d.unreadMessages),            i:"bi-envelope-fill", c:"primary"}
    ];
    cards.innerHTML = cardItems.map(function(x){
      return '<div class="col-sm-6 col-xl-3"><div class="cw-card p-3">'
        + '<div class="d-flex align-items-center justify-content-between">'
        + '<span class="text-muted small">'+x.l+'</span>'
        + '<i class="bi '+x.i+' text-'+x.c+'"></i></div>'
        + '<h3 class="mb-0 mt-2">'+x.v+'</h3></div></div>';
    }).join("");
    main.appendChild(cards);

    // Chart grid
    var grid = document.createElement("div");
    grid.className = "cw-sa-grid mb-4";
    var charts = [
      {id:"chTotalUsers",  title:"Total Users Growth"},
      {id:"chNewUsers",    title:"New Users Per Month"},
      {id:"chUserRoles",   title:"Owners vs Renters vs Both"},
      {id:"chAdminUsers",  title:"Admins vs Normal Users"},
      {id:"chListingsCat", title:"Listings by Category"},
      {id:"chActiveListings", title:"Active vs Inactive Listings"},
      {id:"chBookings",    title:"Monthly Bookings"},
      {id:"chRevenue",     title:"Revenue Trends (ETB, ×1k)"},
      {id:"chAdRevenue",   title:"Featured Advertisement Revenue (ETB, ×1k)"},
      {id:"chApproved",    title:"Approved vs Rejected Listings"},
      {id:"chPopularCats", title:"Most Popular Categories"},
      {id:"chMessages",    title:"Contact Messages Received"}
    ];
    grid.innerHTML = charts.map(function(c){
      return '<div class="cw-card p-3"><h6 class="mb-3">'+c.title+'</h6><div class="cw-sa-chart"><canvas id="'+c.id+'"></canvas></div></div>';
    }).join("");
    main.appendChild(grid);

    // Top performing listings table
    var top = document.createElement("div");
    top.className = "cw-card p-4 mb-4";
    top.innerHTML = '<h5 class="mb-3">Top Performing Listings</h5>'
      + '<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr>'
      + '<th>#</th><th>Listing</th><th>Bookings</th><th class="text-end">Revenue</th>'
      + '</tr></thead><tbody>'
      + d.topListings.map(function(t,i){
          return '<tr><td>'+(i+1)+'</td><td>'+esc(t.name)+'</td><td>'+fmtN(t.bookings)+'</td>'
            + '<td class="text-end">'+fmtN(t.revenue)+' ETB</td></tr>';
        }).join("")
      + '</tbody></table></div>';
    main.appendChild(top);

    loadScript("https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js").then(function(){
      if (typeof Chart === "undefined") return;
      var isDark = document.documentElement.getAttribute("data-theme") === "dark";
      var tick = isDark ? "#cbd5e1" : "#475569";
      var grid = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
      Chart.defaults.color = tick;
      Chart.defaults.borderColor = grid;
      Chart.defaults.plugins.legend.labels.color = tick;
      var palette = ["#0e7490","#198754","#22d3ee","#dc3545","#0f766e","#20c997","#14b8a6","#0dcaf0"];
      function lineCfg(labels, data, label, color){
        return { type:"line", data:{labels:labels, datasets:[{label:label,data:data,borderColor:color,backgroundColor:color+"33",tension:.35,fill:true,pointRadius:3}]},
          options:{maintainAspectRatio:false, plugins:{legend:{display:false}}}};
      }
      function barCfg(labels, data, label, color){
        return { type:"bar", data:{labels:labels, datasets:[{label:label,data:data,backgroundColor:color}]},
          options:{maintainAspectRatio:false, plugins:{legend:{display:false}}}};
      }
      function doughnutCfg(labels, data, colors){
        return { type:"doughnut", data:{labels:labels, datasets:[{data:data,backgroundColor:colors,borderWidth:0}]},
          options:{maintainAspectRatio:false, plugins:{legend:{position:"bottom"}}, cutout:"60%"}};
      }
      new Chart(document.getElementById("chTotalUsers"),  lineCfg(d.months, d.growth,  "Users", palette[0]));
      new Chart(document.getElementById("chNewUsers"),    barCfg (d.months, d.newRegs, "New",   palette[1]));
      new Chart(document.getElementById("chUserRoles"),   doughnutCfg(["Owners","Renters","Both"],[d.owners,d.renters,d.both],[palette[1],palette[0],palette[4]]));
      new Chart(document.getElementById("chAdminUsers"),  doughnutCfg(["Normal Users","Admins/Super Admins"],[d.normals,d.admins],[palette[0],palette[3]]));
      new Chart(document.getElementById("chListingsCat"), barCfg(d.categories.map(function(c){return c.name;}), d.categories.map(function(c){return c.count;}), "Listings", palette[2]));
      new Chart(document.getElementById("chActiveListings"), doughnutCfg(["Active","Inactive"],[d.listingsActive,d.listingsInactive],[palette[1],palette[7]]));
      new Chart(document.getElementById("chBookings"),    barCfg (d.months, d.bookings,"Bookings", palette[5]));
      new Chart(document.getElementById("chRevenue"),     lineCfg(d.months, d.revenue, "Revenue", palette[1]));
      new Chart(document.getElementById("chAdRevenue"),   lineCfg(d.months, d.adRev,   "Ad Revenue", palette[4]));
      new Chart(document.getElementById("chApproved"),    doughnutCfg(["Approved","Rejected"],[d.approvedRej.approved,d.approvedRej.rejected],[palette[1],palette[3]]));
      new Chart(document.getElementById("chPopularCats"), barCfg(d.categories.slice().sort(function(a,b){return b.count-a.count;}).slice(0,5).map(function(c){return c.name;}), d.categories.slice().sort(function(a,b){return b.count-a.count;}).slice(0,5).map(function(c){return c.count;}), "Top", palette[6]));
      // Synthesize message volume from stored + baseline
      var msgVol = [4,6,5,8,9,10,12,14,11,13,15, (loadMessages().length||16)];
      new Chart(document.getElementById("chMessages"),    barCfg(d.months, msgVol, "Messages", palette[0]));
    }).catch(function(){
      var warn = document.createElement("div");
      warn.className = "alert alert-warning";
      warn.textContent = "Charts library failed to load. Please check your internet connection.";
      main.appendChild(warn);
    });
  }

  /* =================================================================
     boot
     ================================================================= */
  whenReady(function(){
    try { buildHeroSlider(); } catch(e){ console.warn("hero slider", e); }
    try { wireContactForm(); } catch(e){ console.warn("contact form", e); }
    // Sidebar links — render after a tick so v11/v12 sidebars finish injecting
    setTimeout(function(){
      try { injectMessagesSidebarLinks(); } catch(e){ console.warn("msg sidebar", e); }
    }, 50);
    try { renderMessagesPage(); } catch(e){ console.warn("messages page", e); }
    try { renderSuperAnalytics(); } catch(e){ console.warn("super analytics", e); }
  });
})();


/* ====================================================================
   Renter dashboard demo reviews
   ==================================================================== */
(function(){
  var KEY = "cw_demo_reviews";
  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function getUser(){
    try { return JSON.parse(sessionStorage.getItem("cw_user") || localStorage.getItem("cw_user") || "null"); }
    catch(e){ return null; }
  }
  function seed(){
    return [
      { user:"Hodan Ali", rating:5, comment:"Clean product, smooth pickup, and friendly owner.", date:"2026-06-05" },
      { user:"Abdi Mohamed", rating:4, comment:"The generator worked well for our event.", date:"2026-06-03" },
      { user:"Muna Yusuf", rating:5, comment:"Excellent condition and quick replies.", date:"2026-05-29" }
    ];
  }
  function load(){
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      return Array.isArray(saved) ? saved : seed();
    } catch(e){ return seed(); }
  }
  function save(rows){ localStorage.setItem(KEY, JSON.stringify(rows)); }
  function stars(n){
    var out = "";
    for (var i=1; i<=5; i++) out += '<i class="bi bi-star'+(i<=n ? "-fill" : "")+'"></i>';
    return out;
  }
  function starButtons(n){
    var out = "";
    for (var i=1; i<=5; i++) {
      out += '<button type="button" class="cw-star'+(i<=n ? " is-active" : "")+'" data-rent-review-star="'+i+'" aria-label="'+i+' stars"><i class="bi bi-star-fill"></i></button>';
    }
    return out;
  }
  function paintStarButtons(form, value){
    form.querySelectorAll("[data-rent-review-star]").forEach(function(btn){
      btn.classList.toggle("is-active", Number(btn.getAttribute("data-rent-review-star")) <= value);
    });
  }
  function renderRows(host){
    var rows = load();
    host.innerHTML = rows.map(function(r){
      return '<tr>'+
        '<td><div class="fw-semibold">'+r.user+'</div></td>'+
        '<td><span class="cw-stars">'+stars(Number(r.rating)||0)+'</span><span class="ms-1 fw-semibold">'+r.rating+'.0</span></td>'+
        '<td class="cw-review-text">'+r.comment+'</td>'+
        '<td class="text-muted">'+r.date+'</td>'+
      '</tr>';
    }).join("");
  }
  function inject(){
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var pane = document.getElementById("pane-rent");
    if (!pane || document.getElementById("cwRentReviews")) return;
    var section = document.createElement("section");
    section.id = "cwRentReviews";
    section.className = "cw-rent-reviews mt-4";
    section.innerHTML =
      '<div class="cw-section-title mt-4"><h5><span class="dot"></span>Reviews and Ratings</h5><span class="small text-muted">Demo renter feedback</span></div>'+
      '<div class="row g-4">'+
        '<div class="col-lg-5"><div class="cw-card p-4 h-100">'+
          '<h5 class="mb-3">Submit a review</h5>'+
          '<form data-cw-review-form>'+
            '<div class="mb-3"><label class="form-label fw-semibold">Rating</label><div class="cw-star-picker" data-rent-review-picker>'+starButtons(5)+'</div><input type="hidden" name="rating" value="5"></div>'+
            '<div class="mb-3"><label class="form-label fw-semibold">Review comment</label><textarea name="comment" class="form-control" rows="4" placeholder="Share your rental experience" required></textarea></div>'+
            '<button class="btn btn-brand w-100" type="submit"><i class="bi bi-send me-1"></i>Submit review</button>'+
          '</form>'+
        '</div></div>'+
        '<div class="col-lg-7"><div class="cw-card cw-review-card">'+
          '<div class="table-responsive"><table class="table align-middle mb-0 cw-review-table">'+
            '<thead><tr><th>User name</th><th>Star rating</th><th>Review comment</th><th>Date</th></tr></thead>'+
            '<tbody data-cw-review-list></tbody>'+
          '</table></div>'+
        '</div></div>'+
      '</div>';
    pane.appendChild(section);
    var tbody = section.querySelector("[data-cw-review-list]");
    renderRows(tbody);
    section.querySelectorAll("[data-rent-review-star]").forEach(function(btn){
      btn.addEventListener("click", function(){
        var form = btn.closest("form");
        var value = Number(btn.getAttribute("data-rent-review-star"));
        form.rating.value = value;
        paintStarButtons(form, value);
      });
    });
    section.querySelector("[data-cw-review-form]").addEventListener("submit", function(e){
      e.preventDefault();
      var form = e.currentTarget;
      var user = getUser() || {};
      var rows = load();
      rows.unshift({
        user: user.name || "User",
        rating: form.rating.value,
        comment: form.comment.value.trim(),
        date: new Date().toISOString().slice(0,10)
      });
      save(rows);
      form.reset();
      form.rating.value = "5";
      paintStarButtons(form, 5);
      renderRows(tbody);
    });
  }
  ready(inject);
})();


/* ====================================================================
   v21 - Admin / Super Admin dashboard redesign helpers
   - Collapsible icon sidebar
   - In-page toolbar with theme + language controls
   - Demo review/rating section for dashboard surfaces
   ==================================================================== */
(function(){
  var LANG_KEY = "cw_lang";
  var COLLAPSE_KEY = "cw_admin_sidebar_collapsed";

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function isAdminArea(){
    return /\/(admin|superadmin)\//.test(location.pathname) || !!document.querySelector("[data-cw-admin-sidebar],[data-cw-super-sidebar]");
  }
  function roleName(){
    return /\/superadmin\//.test(location.pathname) ? "Super Admin" : "Admin";
  }
  function currentLang(){
    try { return localStorage.getItem(LANG_KEY) || "en"; } catch(e){ return "en"; }
  }
  function setLang(lang){
    if (window.cwSetLanguage) {
      window.cwSetLanguage(lang);
      return;
    }
    try { localStorage.setItem(LANG_KEY, lang); } catch(e){}
    document.documentElement.setAttribute("lang", lang === "so" ? "so" : "en");
    document.querySelectorAll("[data-lang-btn]").forEach(function(btn){
      btn.classList.toggle("active", btn.getAttribute("data-lang-btn") === lang);
    });
  }
  function currentTheme(){
    try { return localStorage.getItem("cw_theme") || document.documentElement.getAttribute("data-theme") || "light"; }
    catch(e){ return "light"; }
  }
  function applyThemeIcon(){
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    document.querySelectorAll("[data-theme-icon]").forEach(function(el){
      el.className = dark ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
  }
  function toggleTheme(){
    var next = currentTheme() === "dark" ? "light" : "dark";
    try { localStorage.setItem("cw_theme", next); } catch(e){}
    document.documentElement.setAttribute("data-theme", next);
    applyThemeIcon();
  }
  function storedCollapsed(){
    try { return localStorage.getItem(COLLAPSE_KEY) === "1"; } catch(e){ return false; }
  }
  function setCollapsed(value){
    document.body.classList.toggle("cw-sidebar-collapsed", !!value);
    try { localStorage.setItem(COLLAPSE_KEY, value ? "1" : "0"); } catch(e){}
    document.querySelectorAll("[data-cw-sidebar-toggle]").forEach(function(btn){
      btn.setAttribute("aria-expanded", value ? "false" : "true");
      var icon = btn.querySelector("i");
      if (icon) icon.className = value ? "bi bi-chevron-right" : "bi bi-chevron-left";
    });
  }
  function initials(name){
    var text = (name || roleName()).trim();
    var parts = text.split(/\s+/);
    return parts.map(function(p){ return p.charAt(0); }).slice(0,2).join("").toUpperCase();
  }
  function getUser(){
    try { return JSON.parse(sessionStorage.getItem("cw_user") || localStorage.getItem("cw_user") || "null"); }
    catch(e){ return null; }
  }
  function wrapLinkLabels(sidebar){
    sidebar.querySelectorAll(".nav-link").forEach(function(link){
      if (link.querySelector(".cw-sidebar-label")) return;
      var text = "";
      Array.prototype.slice.call(link.childNodes).forEach(function(node){
        if (node.nodeType === 3 && node.nodeValue.trim()) {
          text += node.nodeValue.trim();
          node.nodeValue = "";
        } else if (node.nodeType === 1 && node.classList && node.classList.contains("badge")) {
          text += node.outerHTML;
          node.remove();
        }
      });
      if (text) {
        var span = document.createElement("span");
        span.className = "cw-sidebar-label";
        span.innerHTML = text;
        link.appendChild(span);
      }
      link.setAttribute("title", (link.textContent || "").trim());
    });
  }
  function enhanceSidebar(){
    var sidebar = document.querySelector("[data-cw-admin-sidebar], [data-cw-super-sidebar]");
    if (!sidebar) return;
    document.body.classList.add("cw-admin-shell");
    var logo = sidebar.querySelector(".cw-sidebar-logo");
    if (logo && !logo.querySelector("[data-cw-sidebar-toggle]")) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "cw-sidebar-toggle";
      btn.setAttribute("data-cw-sidebar-toggle", "");
      btn.setAttribute("aria-label", "Toggle sidebar");
      btn.innerHTML = '<i class="bi bi-chevron-left"></i>';
      btn.addEventListener("click", function(){ setCollapsed(!document.body.classList.contains("cw-sidebar-collapsed")); });
      logo.appendChild(btn);
    }
    wrapLinkLabels(sidebar);
    setCollapsed(storedCollapsed());
    if (!document.querySelector("[data-cw-admin-mobile-toggle]")) {
      var mobile = document.createElement("button");
      mobile.type = "button";
      mobile.className = "cw-mobile-dashboard-toggle cw-admin-mobile-toggle";
      mobile.setAttribute("data-cw-admin-mobile-toggle", "");
      mobile.setAttribute("aria-expanded", "false");
      mobile.innerHTML = '<i class="bi bi-list"></i><span>Dashboard Menu</span>';
      mobile.addEventListener("click", function(){
        var open = !document.body.classList.contains("cw-mobile-dashboard-open");
        document.body.classList.toggle("cw-mobile-dashboard-open", open);
        mobile.setAttribute("aria-expanded", open ? "true" : "false");
        var icon = mobile.querySelector("i");
        if (icon) icon.className = open ? "bi bi-x-lg" : "bi bi-list";
      });
      sidebar.parentNode.insertBefore(mobile, sidebar);
    }
  }
  function ensureLangSwitch(host){
    if (host.querySelector(".cw-lang-switch")) return;
    var lang = document.createElement("div");
    lang.className = "cw-lang-switch";
    lang.innerHTML = '<button type="button" data-lang-btn="en" aria-label="English">EN</button>' +
      '<span class="cw-lang-sep">|</span>' +
      '<button type="button" data-lang-btn="so" aria-label="Af-Soomaali">SO</button>';
    lang.addEventListener("click", function(e){
      var btn = e.target.closest("[data-lang-btn]");
      if (!btn) return;
      setLang(btn.getAttribute("data-lang-btn"));
    });
    host.appendChild(lang);
  }
  function ensureThemeToggle(host){
    if (host.querySelector("[data-theme-toggle]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cw-theme-toggle";
    btn.setAttribute("data-theme-toggle", "");
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.title = "Toggle dark mode";
    btn.innerHTML = '<i data-theme-icon class="bi bi-moon-stars-fill"></i>';
    btn.addEventListener("click", toggleTheme);
    host.appendChild(btn);
    applyThemeIcon();
  }
  function enhanceHeader(){
    var main = document.querySelector("main");
    if (!main || main.querySelector(".cw-admin-topbar")) return;
    var user = getUser() || {};
    var topbar = document.createElement("div");
    topbar.className = "cw-admin-topbar";
    topbar.innerHTML =
      '<div class="cw-admin-search"><i class="bi bi-search"></i><input type="search" aria-label="Search dashboard" placeholder="Search" /></div>' +
      '<div class="cw-admin-actions">' +
        '<button type="button" class="cw-icon-btn" aria-label="Messages"><i class="bi bi-envelope"></i></button>' +
        '<button type="button" class="cw-icon-btn" aria-label="Notifications"><i class="bi bi-bell"></i></button>' +
        '<div class="cw-admin-profile"><span class="cw-avatar cw-avatar-sm">'+initials(user.name || roleName())+'</span><span class="cw-admin-profile-name">'+(user.name || user.fullName || roleName())+'</span></div>' +
      '</div>';
    var actions = topbar.querySelector(".cw-admin-actions");
    ensureLangSwitch(actions);
    ensureThemeToggle(actions);
    main.insertBefore(topbar, main.firstChild);
    setLang(currentLang());
  }
  function reviewRows(){
    return [
      { user:"Hodan Ali", item:"Canon DSLR Kit", rating:5, date:"2026-06-05", text:"Clean item, fast handoff, and the owner explained every accessory clearly.", status:"Verified rental" },
      { user:"Abdi Mohamed", item:"Honda Generator 5kW", rating:4, date:"2026-06-03", text:"Worked well for our event. Pickup timing was smooth.", status:"Verified rental" },
      { user:"Muna Yusuf", item:"JBL Pro Speakers", rating:5, date:"2026-05-29", text:"Excellent sound quality and professional communication.", status:"Verified rental" },
      { user:"Khalid Ahmed", item:"Bosch Power Drill", rating:4, date:"2026-05-24", text:"Good condition and fair pricing. Would rent again.", status:"Demo review" }
    ];
  }
  function stars(n){
    var html = "";
    for (var i=1; i<=5; i++) html += '<i class="bi bi-star'+(i<=n ? "-fill" : "")+'"></i>';
    return html;
  }
  function injectReviews(){
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (["index.html", "analytics.html", ""].indexOf(page) < 0) return;
    var main = document.querySelector("main");
    if (!main || document.getElementById("cwUserReviews")) return;
    var rows = reviewRows();
    var section = document.createElement("section");
    section.id = "cwUserReviews";
    section.className = "cw-reviews-section";
    section.innerHTML =
      '<div class="cw-section-title mt-4"><h5><span class="dot"></span>User reviews</h5><span class="small text-muted">Demo data until backend reviews are connected</span></div>' +
      '<div class="cw-card cw-review-card">' +
        '<div class="table-responsive">' +
          '<table class="table align-middle mb-0 cw-review-table">' +
            '<thead><tr><th>Renter</th><th>Item</th><th>Rating</th><th>Review</th><th>Status</th><th>Date</th></tr></thead>' +
            '<tbody>' + rows.map(function(r){
              return '<tr>' +
                '<td><div class="fw-semibold">'+r.user+'</div></td>' +
                '<td>'+r.item+'</td>' +
                '<td><span class="cw-stars">'+stars(r.rating)+'</span><span class="ms-1 fw-semibold">'+r.rating+'.0</span></td>' +
                '<td class="cw-review-text">'+r.text+'</td>' +
                '<td><span class="badge bg-brand-soft text-brand">'+r.status+'</span></td>' +
                '<td class="text-muted">'+r.date+'</td>' +
              '</tr>';
            }).join("") + '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
    main.appendChild(section);
  }
  function boot(){
    if (!isAdminArea()) return;
    enhanceSidebar();
    enhanceHeader();
    injectReviews();
  }
  ready(function(){
    boot();
    setTimeout(boot, 80);
    setTimeout(boot, 260);
  });
})();
