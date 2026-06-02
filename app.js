/* Citywide Jigjiga — shared client script */
(function () {
  var USER_KEY = "cw_user";
  var THEME_KEY = "cw_theme";
  var LANG_KEY = "cw_lang";

  // ===== User =====
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (e) {
      return null;
    }
  }
  function setUser(u) {
    localStorage.setItem(USER_KEY, JSON.stringify(u));
  }
  function clearUser() {
    localStorage.removeItem(USER_KEY);
  }
  function initials(name) {
    if (!name) return "G";
    var parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  }

  // ===== Theme =====
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.className = t === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
  }
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
  }
  function toggleTheme() {
    var next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }
  applyTheme(getTheme());

  // ===== i18n =====
  var DICT = {
    Home: "Guriga",
    Browse: "Eeg",
    "List Item": "Liis Geli",
    About: "Ku Saabsan",
    Contact: "Nala Soo Xiriir",
    "Sign In": "Soo Gal",
    Register: "Diiwaan Geli",
    Logout: "Ka Bax",
    Dashboard: "Dashboor",
    Profile: "Akoonkayga",
    "Find what you need": "Hel waxaad u baahan tahay",
    "What do you need?": "Maxaad u baahan tahay?",
    "Search listings...": "Raadi liisaska...",
    "Where in Jigjiga?": "Xaggee Jigjiga?",
    Search: "Raadi",
    "Browse Rentals": "Eeg Kirooyinka",
    "List Your Item": "Liis Geli Alaabtaada",
    "View Details": "Eeg Faahfaahinta",
    "View all": "Eeg dhammaan",
    "Popular categories": "Qaybaha caanka ah",
    "Browse by category": "Eeg qayb walba",
    "Popular listings": "Liisaska caanka ah",
    "Trending in Jigjiga right now": "Waxa Jigjiga ka socda hadda",
    "Available today": "La heli karo maanta",
    "Ready for pickup now": "Diyaar u ah qaadis hadda",
    "Recently added": "Dhowaan la daray",
    "Fresh on Citywide": "Cusub Citywide",
    "How it works": "Sida ay u shaqayso",
    "Renting in Jigjiga, made simple": "Kireynta Jigjiga, oo fudud",
    "1. Search nearby": "1. Raadi meel u dhow",
    "2. Book safely": "2. Buug si nabad ah",
    "3. Pick up & enjoy": "3. Qaado oo ku raaxayso",
    "Filter by area, price, and availability across Jigjiga.":
      "Sift ku samee aag, qiimo iyo helitaan Jigjiga oo dhan.",
    "Payment held in escrow until handoff is complete.":
      "Lacagta waxaa lagu hayaa escrow ilaa wareejinta la dhammeeyo.",
    "Meet your verified neighbour, collect the item, return on time.":
      "La kulan deriskaaga xaqiijisan, qaado alaabta, soo celi waqtigeeda.",
    "Active listings": "Liisas firfircoon",
    "Verified members": "Xubno xaqiijisan",
    "Jigjiga neighbourhoods": "Xaafadaha Jigjiga",
    "Average rating": "Celceliska qiimaynta",
    Explore: "Sahmin",
    Account: "Akoonka",
    "Trusted across Jigjiga · 2,400+ local listings":
      "Lagu kalsoon yahay Jigjiga oo dhan · 2,400+ liisas maxalli",
    "Rent Anything Nearby in Jigjiga": "Kireyso Wax Kasta oo Jigjiga ku yaal",
    "Jigjiga's trusted marketplace for renting and sharing items locally. Pay in ETB. Safe escrow on every booking.":
      "Suuqa lagu kalsoon yahay ee Jigjiga ee kireynta iyo wadaagista alaabta maxalli ahaan. Ku bixi ETB. Escrow nabdoon mar walba.",
    Close: "Xidh",
    "Request to Book": "Codso Buug",
    "Item details": "Faahfaahinta Alaabta",
    "All areas": "Dhammaan aagagga",
    "All categories": "Dhammaan qaybaha",
    Filter: "Sift",
    Brand: "Astaanta",
    Model: "Nooca",
    Category: "Qaybta",
    "Daily rental": "Kireynta maalinta",
    "Weekly rental": "Kireynta toddobaadka",
    "Security deposit": "Dhigaalka damaanadda",
    Condition: "Xaaladda",
    Availability: "Helitaan",
    Available: "La heli karo",
    Description: "Sharaxaad",
    Owner: "Mulkiilaha",
    "Rental requirements": "Shuruudaha kireynta",
    "Sign Out": "Ka Bax",
    Bookings: "Buugaagta",
    Messages: "Fariimaha",
    "My Listings": "Liisaskayga",
    Earnings: "Daqliga",
    Settings: "Dejimaha",
  };
  function getLang() {
    return localStorage.getItem(LANG_KEY) || "en";
  }
  function setLang(l) {
    localStorage.setItem(LANG_KEY, l);
    applyLang(l);
  }
  // Walk text nodes once and store originals
  function indexTextNodes() {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (n) {
          if (!n.nodeValue || !n.nodeValue.trim())
            return NodeFilter.FILTER_REJECT;
          var p = n.parentNode;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.nodeName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOAH")
            return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      },
    );
    var nodes = [],
      n;
    while ((n = walker.nextNode())) {
      if (!n.__cwOrig) n.__cwOrig = n.nodeValue;
      nodes.push(n);
    }
    // Also translatable placeholders
    document.querySelectorAll("[placeholder]").forEach(function (el) {
      if (!el.__cwOrigPh) el.__cwOrigPh = el.getAttribute("placeholder");
    });
    // <option> values are within text nodes already.
    return nodes;
  }
  function translateString(s, lang) {
    var key = s.trim();
    if (!key) return s;
    if (lang === "en") return s;
    if (DICT[key]) return s.replace(key, DICT[key]);
    return s;
  }
  function applyLang(lang) {
    document.documentElement.setAttribute("lang", lang === "so" ? "so" : "en");
    var nodes = indexTextNodes();
    nodes.forEach(function (n) {
      var orig = n.__cwOrig;
      if (lang === "en") {
        n.nodeValue = orig;
        return;
      }
      var key = orig.trim();
      if (DICT[key]) {
        n.nodeValue = orig.replace(key, DICT[key]);
      } else {
        n.nodeValue = orig;
      }
    });
    document.querySelectorAll("[placeholder]").forEach(function (el) {
      var orig = el.__cwOrigPh;
      if (!orig) return;
      el.setAttribute(
        "placeholder",
        lang === "en" ? orig : DICT[orig.trim()] || orig,
      );
    });
    // Update language switcher active state
    document.querySelectorAll("[data-lang-btn]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang-btn") === lang);
    });
  }

  // ===== Render dynamic user info =====
  function renderUser() {
    var u = getUser();
    var name = u && u.name ? u.name : "Guest User";
    var area = u && u.area ? u.area : "Jigjiga Central";
    document.querySelectorAll("[data-user-name]").forEach(function (el) {
      el.textContent = name;
    });
    document.querySelectorAll("[data-user-area]").forEach(function (el) {
      el.textContent = area;
    });
    document.querySelectorAll("[data-user-initial]").forEach(function (el) {
      el.textContent = initials(name);
    });
    document.querySelectorAll(".cw-avatar").forEach(function (el) {
      if (
        !el.hasAttribute("data-user-initial") &&
        el.textContent.trim().length <= 1
      ) {
        el.textContent = initials(name);
      }
    });
    document
      .querySelectorAll(".cw-sidebar .fw-semibold.small")
      .forEach(function (el) {
        if (el.textContent.trim() === "Guest User") el.textContent = name;
      });
  }

  // ===== Navbar enhancements =====
  function enhanceNavbar() {
    var navbar = document.querySelector(".cw-navbar .container");
    if (!navbar) return;
    // Dashboard intentionally NOT injected into the navbar; it lives in the profile dropdown only.
    var navList = document.querySelector(".cw-navbar #mainNav .navbar-nav");
    if (navList) {
      navList
        .querySelectorAll('a[href="dashboard.html"]')
        .forEach(function (a) {
          var li = a.closest("li");
          if (li) li.remove();
          else a.remove();
        });
    }
    // Active link
    var page = (
      location.pathname.split("/").pop() || "home.html"
    ).toLowerCase();
    document
      .querySelectorAll(".cw-navbar .nav-link, .cw-sidebar .nav-link")
      .forEach(function (a) {
        var href = (a.getAttribute("href") || "").toLowerCase();
        if (href === page) a.classList.add("active");
        else a.classList.remove("active");
      });

    var u = getUser();
    var navCollapse = document.querySelector(".cw-navbar #mainNav");
    if (!navCollapse) return;
    var btnRow = navCollapse.querySelector(".cw-nav-cluster");
    if (!btnRow) {
      btnRow = document.createElement("div");
      btnRow.className =
        "d-flex flex-column flex-lg-row align-items-lg-center ms-lg-auto cw-nav-cluster mt-2 mt-lg-0";
      // Place BEFORE existing right-side cluster (Sign In / profile dropdown) so EN/SO appears first
      var existingRight = navCollapse.querySelector(
        ".d-flex.ms-lg-auto, .dropdown.ms-lg-auto",
      );
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
      langWrap.addEventListener("click", function (e) {
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
      tBtn.setAttribute("aria-label", "Toggle dark mode");
      tBtn.innerHTML = '<i data-theme-icon class="bi bi-moon-stars-fill"></i>';
      tBtn.addEventListener("click", toggleTheme);
      btnRow.appendChild(tBtn);
    }

    // Pages can either have a hardcoded profile dropdown (dashboard area) or just a Sign In button (public area)
    var hardcodedDrop = navCollapse.querySelector(
      ".dropdown [data-user-initial], .dropdown [data-user-name]",
    );
    if (u) {
      // Hide Sign In on public pages when signed in
      navCollapse
        .querySelectorAll('a[href="login.html"], a[href="register.html"]')
        .forEach(function (a) {
          a.remove();
        });
      if (!hardcodedDrop && !btnRow.querySelector(".cw-profile-drop")) {
        var drop = document.createElement("div");
        drop.className = "dropdown cw-profile-drop";
        drop.innerHTML =
          '<button class="cw-avatar cw-avatar-sm cw-profile-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" title="' +
          (u.name || "") +
          '">' +
          initials(u.name) +
          "</button>" +
          '<ul class="dropdown-menu dropdown-menu-end cw-profile-menu">' +
          '<li class="px-3 py-2">' +
          '<div class="d-flex align-items-center">' +
          '<span class="cw-avatar cw-avatar-sm me-2">' +
          initials(u.name) +
          "</span>" +
          '<div class="small"><div class="fw-semibold">' +
          (u.name || "") +
          "</div>" +
          '<div class="text-muted">' +
          (u.email || "") +
          "</div></div>" +
          "</div>" +
          "</li>" +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><a class="dropdown-item" href="profile.html"><i class="bi bi-person me-2"></i>Profile</a></li>' +
          '<li><a class="dropdown-item" href="dashboard.html"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a></li>' +
          '<li><hr class="dropdown-divider"></li>' +
          '<li><a class="dropdown-item text-danger" href="logout.html"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>' +
          "</ul>";
        btnRow.appendChild(drop);
      }
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
          var nameEl = rform.querySelector(
            'input[name="fullName"], input[type="text"]',
          );
          var emailEl = rform.querySelector('input[type="email"]');
          var areaEl = rform.querySelector("select");
          setUser({
            name: nameEl ? nameEl.value.trim() : "",
            email: emailEl ? emailEl.value.trim() : "",
            area: areaEl ? areaEl.value.trim() : "",
          });
        });
      }
    }
    if (/login\.html$/i.test(location.pathname)) {
      var lform = document.querySelector("form");
      if (lform) {
        lform.addEventListener("submit", function () {
          var nameEl = lform.querySelector(
            'input[name="fullName"], input[type="text"]',
          );
          var emailEl = lform.querySelector('input[type="email"]');
          var email = emailEl ? emailEl.value.trim() : "";
          var name = nameEl ? nameEl.value.trim() : "";
          if (!name) {
            name = email ? email.split("@")[0].replace(/[._-]+/g, " ") : "";
            name = name.replace(/\b\w/g, function (c) {
              return c.toUpperCase();
            });
          }
          setUser({
            name: name || "Member",
            email: email,
            area: "Jigjiga Central",
          });
        });
      }
    }
    if (/logout\.html$/i.test(location.pathname)) {
      clearUser();
    }
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
      "</div>" +
      '<div class="modal-body" id="cwDetailsBody"></div>' +
      '<div class="modal-footer">' +
      '<button class="btn btn-outline-brand" data-bs-dismiss="modal">Close</button>' +
      '<a class="btn btn-brand" href="bookings.html"><i class="bi bi-calendar-check me-1"></i>Request to Book</a>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";
    var wrap = document.createElement("div");
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);
  }

  function inferBrandModel(name) {
    var tokens = (name || "").split(/\s+/);
    if (tokens.length >= 2)
      return { brand: tokens[0], model: tokens.slice(1).join(" ") };
    return { brand: name || "—", model: "—" };
  }

  function buildDetails(data) {
    var img = data.img || "images/electronics.jpg";
    var name = data.name || "Rental item";
    var bm = inferBrandModel(name);
    var category = data.category || "General";
    var location = data.location || "Jigjiga";
    var price = data.price || "—";
    var weekly =
      data.weekly ||
      (data.priceNum
        ? Math.round(data.priceNum * 6).toLocaleString() + " ETB / week"
        : "Ask owner");
    var deposit = data.priceNum
      ? Math.round(data.priceNum * 2).toLocaleString() + " ETB"
      : "Ask owner";
    return (
      '<div class="row g-4">' +
      '<div class="col-md-6"><img src="' +
      img +
      '" alt="' +
      name +
      '" class="img-fluid rounded-3 w-100" style="object-fit:cover;max-height:320px"/></div>' +
      '<div class="col-md-6">' +
      '<span class="badge bg-brand-soft text-brand mb-2">' +
      category +
      "</span>" +
      '<h4 class="mb-1">' +
      name +
      "</h4>" +
      '<p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> ' +
      location +
      "</p>" +
      '<dl class="row small mb-0">' +
      '<dt class="col-5">Brand</dt><dd class="col-7">' +
      bm.brand +
      "</dd>" +
      '<dt class="col-5">Model</dt><dd class="col-7">' +
      bm.model +
      "</dd>" +
      '<dt class="col-5">Category</dt><dd class="col-7">' +
      category +
      "</dd>" +
      '<dt class="col-5">Daily rental</dt><dd class="col-7 fw-bold text-brand">' +
      price +
      "</dd>" +
      '<dt class="col-5">Weekly rental</dt><dd class="col-7">' +
      weekly +
      "</dd>" +
      '<dt class="col-5">Security deposit</dt><dd class="col-7">' +
      deposit +
      "</dd>" +
      '<dt class="col-5">Condition</dt><dd class="col-7">Excellent — recently serviced</dd>' +
      '<dt class="col-5">Availability</dt><dd class="col-7"><span class="badge bg-success">Available</span></dd>' +
      "</dl>" +
      "</div>" +
      '<div class="col-12">' +
      '<h6 class="mt-2">Description</h6>' +
      '<p class="small text-muted mb-3">High-quality ' +
      name +
      " available for short and long-term rental in " +
      location +
      ". Well-maintained, ready for pickup. Includes accessories and a quick handover from the owner.</p>" +
      '<div class="row g-3">' +
      '<div class="col-md-6">' +
      '<h6 class="mb-1">Owner</h6>' +
      '<div class="d-flex align-items-center"><span class="cw-avatar me-2">A</span><div><div class="fw-semibold small">Verified Jigjiga owner</div><div class="text-muted small"><i class="bi bi-star-fill text-warning"></i> 4.9 · Responds within 1 hour</div></div></div>' +
      "</div>" +
      '<div class="col-md-6">' +
      '<h6 class="mb-1">Rental requirements</h6>' +
      '<ul class="small text-muted mb-0 ps-3"><li>Valid Kebele ID or passport</li><li>Refundable deposit on pickup</li><li>Return in original condition</li></ul>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>"
    );
  }

  function openDetails(data) {
    ensureDetailsModal();
    document.getElementById("cwDetailsTitle").textContent =
      data.name || "Item details";
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
      var loc = card.querySelector(".bi-geo-alt")
        ? card.querySelector(".bi-geo-alt").parentNode.textContent.trim()
        : "";
      var priceEl = card.querySelector(
        ".fw-bold.text-brand, .cw-feature-price",
      );
      var p = parsePrice(priceEl ? priceEl.textContent : "");
      var data = {
        name: title.textContent.trim(),
        category: badge ? badge.textContent.trim() : "General",
        location: loc.replace(/^\s*/, ""),
        price: p.text,
        priceNum: p.num,
        img: img ? img.getAttribute("src") : "",
      };
      var actionAnchor = card.querySelector("a.btn-outline-brand, a.btn-sm");
      var existingBtn = card.querySelector("button[data-cw-details]");
      if (existingBtn) return;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-cw-details", "");
      btn.className = "btn btn-sm btn-outline-brand";
      btn.textContent = "View Details";
      btn.addEventListener("click", function () {
        openDetails(data);
      });
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
      var q = ((input && input.value) || "").trim().toLowerCase();
      var area = ((areaSelect && areaSelect.value) || "").toLowerCase();
      var cat = ((catSelect && catSelect.value) || "").toLowerCase();
      var areaAll = area.indexOf("all") === 0 || !area;
      var catAll = cat.indexOf("all") === 0 || !cat;
      var shown = 0;
      cards.forEach(function (card) {
        var col =
          card.closest(
            ".col-md-6, .col-lg-4, .col-sm-6, .col-lg-3, [class*='col-']",
          ) || card;
        var name = card.getAttribute("data-cw-name") || "";
        var category = card.getAttribute("data-cw-category") || "";
        var loc = card.getAttribute("data-cw-location") || "";
        var matchQ =
          !q ||
          name.indexOf(q) !== -1 ||
          category.indexOf(q) !== -1 ||
          loc.indexOf(q) !== -1;
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
        empty.innerHTML =
          '<i class="bi bi-search fs-1 d-block mb-2"></i>No items match your search.';
        var grid = document.querySelector(".row.g-4");
        if (grid) grid.parentNode.appendChild(empty);
      }
      empty.style.display = shown === 0 ? "" : "none";
    }

    if (input) input.addEventListener("input", applyFilters);
    if (areaSelect) areaSelect.addEventListener("change", applyFilters);
    if (catSelect) catSelect.addEventListener("change", applyFilters);
    if (btn)
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        applyFilters();
      });

    try {
      var params = new URLSearchParams(location.search);
      if (params.get("q") && input) input.value = params.get("q");
      if (params.get("area") && areaSelect)
        areaSelect.value = params.get("area");
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
      if (
        select &&
        select.value &&
        select.value.toLowerCase().indexOf("all") !== 0
      )
        params.set("area", select.value);
      location.href =
        "listings.html" + (params.toString() ? "?" + params.toString() : "");
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
   Dashboard architecture v11 — role guard + grouped sidebar
   ==================================================================== */
(function () {
  var USER_KEY = "cw_user";
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch (e) {
      return null;
    }
  }

  // ---- Role guard ----
  var guard = document.body && document.body.getAttribute("data-cw-guard");
  if (guard) {
    var u = getUser();
    var role = u && u.role ? u.role : u ? "user" : null;
    if (guard === "admin") {
      if (!u || role !== "admin") {
        location.replace("login.html");
        return;
      }
    } else if (guard === "user") {
      if (!u) {
        location.replace("login.html");
        return;
      }
      if (role === "admin") {
        // admins land in /admin instead of mixing with user dashboard
        if (!/\/admin\//.test(location.pathname)) {
          location.replace("admin/index.html");
          return;
        }
      }
    }
  }

  // ---- Grouped USER sidebar ----
  var USER_GROUPS = [
    {
      label: "Lending (Owner)",
      items: [
        {
          key: "overview",
          href: "dashboard.html",
          icon: "speedometer2",
          text: "Dashboard Overview",
        },
        {
          key: "my-listings",
          href: "my-listings.html",
          icon: "collection",
          text: "My Listings",
        },
        {
          key: "add-listing",
          href: "add-item.html",
          icon: "plus-square",
          text: "Add Listing",
        },
        {
          key: "bookings",
          href: "bookings.html",
          icon: "calendar-check",
          text: "Incoming Bookings",
        },
        {
          key: "earnings",
          href: "earnings.html",
          icon: "cash-coin",
          text: "Earnings",
        },
      ],
    },
    {
      label: "Renting",
      items: [
        {
          key: "my-bookings",
          href: "my-bookings.html",
          icon: "bag-check",
          text: "My Bookings",
        },
        {
          key: "rental-history",
          href: "rental-history.html",
          icon: "clock-history",
          text: "Rental History",
        },
        {
          key: "wishlist",
          href: "wishlist.html",
          icon: "heart",
          text: "Wishlist",
        },
      ],
    },
    {
      label: "Account",
      items: [
        {
          key: "messages",
          href: "messages.html",
          icon: "chat-dots",
          text: "Messages",
        },
        {
          key: "profile",
          href: "profile.html",
          icon: "person-circle",
          text: "Profile",
        },
        {
          key: "settings",
          href: "settings.html",
          icon: "gear",
          text: "Settings",
        },
        {
          key: "logout",
          href: "logout.html",
          icon: "box-arrow-right",
          text: "Logout",
        },
      ],
    },
  ];

  var ADMIN_GROUPS = [
    {
      label: "Admin",
      items: [
        {
          key: "overview",
          href: "index.html",
          icon: "speedometer2",
          text: "Overview",
        },
        {
          key: "users",
          href: "users.html",
          icon: "people",
          text: "Manage Users",
        },
        {
          key: "listings",
          href: "listings.html",
          icon: "collection",
          text: "Manage Listings",
        },
        {
          key: "categories",
          href: "categories.html",
          icon: "tags",
          text: "Categories",
        },
        { key: "reports", href: "reports.html", icon: "flag", text: "Reports" },
        {
          key: "transactions",
          href: "transactions.html",
          icon: "cash-stack",
          text: "Transactions",
        },
        {
          key: "analytics",
          href: "analytics.html",
          icon: "graph-up",
          text: "Analytics",
        },
        {
          key: "settings",
          href: "settings.html",
          icon: "sliders",
          text: "Site Settings",
        },
      ],
    },
    {
      label: "Session",
      items: [
        {
          key: "signout",
          href: "login.html",
          icon: "box-arrow-right",
          text: "Sign out",
        },
      ],
    },
  ];

  function renderSidebar(host, groups) {
    var u = getUser() || {};
    var name = u.name || "Guest User";
    var area = u.area || "Jigjiga Central";
    var ini =
      (name || "G")
        .trim()
        .split(/\s+/)
        .map(function (p) {
          return p.charAt(0);
        })
        .slice(0, 2)
        .join("")
        .toUpperCase() || "G";
    var active = host.getAttribute("data-active") || "";
    var html =
      '<div class="px-2 mb-3 d-flex align-items-center gap-2">' +
      '<div class="cw-avatar">' +
      ini +
      "</div>" +
      '<div><div class="fw-semibold small">' +
      name +
      "</div>" +
      '<div class="text-muted small">' +
      area +
      "</div></div></div>";
    groups.forEach(function (g) {
      html +=
        '<div class="cw-sidebar-group-label text-uppercase text-muted small fw-semibold px-2 mt-3 mb-1" style="letter-spacing:.05em;">' +
        g.label +
        "</div>";
      html += '<nav class="nav flex-column">';
      g.items.forEach(function (it) {
        html +=
          '<a class="nav-link' +
          (it.key === active ? " active" : "") +
          '" href="' +
          it.href +
          '">' +
          '<i class="bi bi-' +
          it.icon +
          ' me-2"></i>' +
          it.text +
          "</a>";
      });
      html += "</nav>";
    });
    host.innerHTML = html;
  }

  document.querySelectorAll("[data-cw-sidebar]").forEach(function (el) {
    renderSidebar(el, USER_GROUPS);
  });
  document.querySelectorAll("[data-cw-admin-sidebar]").forEach(function (el) {
    renderSidebar(el, ADMIN_GROUPS);
  });
})();
