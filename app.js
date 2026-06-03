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

  // ---- Role guard handled by v12 IIFE below ----

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

/* ====================================================================
   v12 — role-based auth, JSON-driven, sessionStorage
   ==================================================================== */
(function () {
  var SKEY = "cw_user";
  function sget() {
    try {
      return JSON.parse(sessionStorage.getItem(SKEY) || "null");
    } catch (e) {
      return null;
    }
  }
  function sset(u) {
    sessionStorage.setItem(SKEY, JSON.stringify(u));
    localStorage.setItem("cw_user", JSON.stringify(u));
  }
  function sclear() {
    sessionStorage.removeItem(SKEY);
    localStorage.removeItem("cw_user");
  }
  window.cwGetUser = sget;
  window.cwSetUser = sset;
  window.cwClearUser = sclear;

  function initials(name) {
    if (!name) return "G";
    var p = name.trim().split(/\s+/);
    return (
      p.length === 1
        ? p[0].charAt(0)
        : p[0].charAt(0) + p[p.length - 1].charAt(0)
    ).toUpperCase();
  }

  function roleArr(u) {
    if (!u) return [];
    return Array.isArray(u.role) ? u.role : [u.role];
  }

  function landingFor(u) {
    var r = roleArr(u);
    if (r.indexOf("super_admin") >= 0) return "superadmin/index.html";
    if (r.indexOf("admin") >= 0) return "admin/index.html";
    return "dashboard.html";
  }

  function dataPath(rel) {
    // Pages may live in /admin or /superadmin — JSON is at root /data
    var depth = location.pathname.match(/\/(admin|superadmin)\//) ? "../" : "";
    return depth + "data/" + rel;
  }

  function fetchJSON(name) {
    return fetch(dataPath(name) + "?v=" + Date.now()).then(function (r) {
      return r.json();
    });
  }
  window.cwData = fetchJSON;

  // ---- Auth wiring on login/register pages ----
  function wireLogin() {
    var f = document.querySelector(
      'form[data-cw-login], form[action="dashboard.html"]',
    );
    if (!f) return;
    // Remove full-name field on login (kept email+password only)
    var nameField = f.querySelector('input[name="fullName"]');
    if (nameField) {
      var wrap = nameField.closest(".mb-3");
      if (wrap) wrap.remove();
    }
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = (f.querySelector('input[type="email"]') || {}).value || "";
      var pass = (f.querySelector('input[type="password"]') || {}).value || "";
      fetchJSON("users.json")
        .then(function (list) {
          // Merge any locally-registered users
          var local = JSON.parse(
            localStorage.getItem("cw_users_extra") || "[]",
          );
          var all = list.concat(local);
          var u = all.filter(function (x) {
            return (
              x.email.toLowerCase() === email.toLowerCase() &&
              x.password === pass
            );
          })[0];
          if (!u) {
            alert("Invalid email or password.");
            return;
          }
          if (u.status === "suspended") {
            alert("This account has been suspended.");
            return;
          }
          sset({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            avatar: u.avatar || null,
            area: "Jigjiga Central",
          });
          location.replace(landingFor(u));
        })
        .catch(function () {
          alert("Could not load users.");
        });
    });
  }

  function wireRegister() {
    var f = document.querySelector("form[data-cw-register]");
    if (!f) {
      if (!/register\.html$/i.test(location.pathname)) return;
      f = document.querySelector("form");
      if (!f) return;
    }
    // Remove tel/agree fields if present (kept: name, email, password, confirm, accountType)
    f.querySelectorAll('input[type="tel"]').forEach(function (el) {
      var w = el.closest(".mb-3");
      if (w) w.remove();
    });
    var agree = f.querySelector("#agree");
    if (agree) {
      var w2 = agree.closest(".form-check");
      if (w2) w2.remove();
    }

    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (f.querySelector('input[name="fullName"]') || {}).value || "";
      var email = (f.querySelector('input[type="email"]') || {}).value || "";
      var pwEls = f.querySelectorAll('input[type="password"]');
      var pass = (pwEls[0] || {}).value || "";
      var pass2 = (pwEls[1] || {}).value || pass;
      var acct = (f.querySelector('[name="accountType"]') || {}).value || "";
      if (!name.trim() || !email.trim() || !pass) {
        alert("Please fill all fields.");
        return;
      }
      if (pass !== pass2) {
        alert("Passwords do not match.");
        return;
      }
      if (!acct) {
        alert("Please choose an account type.");
        return;
      }
      var role =
        acct === "both"
          ? ["owner", "renter"]
          : acct === "owner"
            ? ["owner"]
            : ["renter"];
      var extra = JSON.parse(localStorage.getItem("cw_users_extra") || "[]");
      fetchJSON("users.json").then(function (list) {
        var dup = list.concat(extra).some(function (x) {
          return x.email.toLowerCase() === email.toLowerCase();
        });
        if (dup) {
          alert("An account with this email already exists.");
          return;
        }
        var newUser = {
          id: Date.now(),
          name: name.trim(),
          email: email.trim(),
          password: pass,
          role: role,
          avatar: null,
          status: "active",
        };
        extra.push(newUser);
        localStorage.setItem("cw_users_extra", JSON.stringify(extra));
        sset({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          avatar: null,
          area: "Jigjiga Central",
        });
        location.replace("dashboard.html");
      });
    });
  }

  // ---- Guard ----
  function guard() {
    var g = document.body && document.body.getAttribute("data-cw-guard");
    if (!g) return true;
    var u = sget();
    if (!u) {
      var prefix = /\/(admin|superadmin)\//.test(location.pathname)
        ? "../"
        : "";
      location.replace(prefix + "login.html");
      return false;
    }
    var r = roleArr(u);
    if (g === "user") {
      if (r.indexOf("super_admin") >= 0) {
        location.replace("superadmin/index.html");
        return false;
      }
      if (r.indexOf("admin") >= 0) {
        location.replace("admin/index.html");
        return false;
      }
    } else if (g === "admin") {
      if (r.indexOf("super_admin") < 0 && r.indexOf("admin") < 0) {
        location.replace("../dashboard.html");
        return false;
      }
      // Restrict admin from forbidden pages
      var page = location.pathname.split("/").pop().toLowerCase();
      var forbidden = [
        "categories.html",
        "settings.html",
        "admins.html",
        "audit.html",
      ];
      if (
        r.indexOf("admin") >= 0 &&
        r.indexOf("super_admin") < 0 &&
        forbidden.indexOf(page) >= 0
      ) {
        location.replace("index.html");
        return false;
      }
    } else if (g === "superadmin") {
      if (r.indexOf("super_admin") < 0) {
        location.replace("../login.html");
        return false;
      }
    }
    return true;
  }

  // ---- Sidebar (role-aware, with toggle) ----
  var MODE_KEY = "cw_mode";
  function getMode(u) {
    var r = roleArr(u);
    var hasO = r.indexOf("owner") >= 0,
      hasR = r.indexOf("renter") >= 0;
    if (hasO && !hasR) return "lend";
    if (hasR && !hasO) return "rent";
    return sessionStorage.getItem(MODE_KEY) || "lend";
  }
  function setMode(m) {
    sessionStorage.setItem(MODE_KEY, m);
    renderUserSidebars();
    applyDashboardMode();
  }
  window.cwSetMode = setMode;

  var LEND = [
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
  ];
  var RENT = [
    {
      key: "overview",
      href: "dashboard.html",
      icon: "speedometer2",
      text: "Dashboard Overview",
    },
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
    { key: "wishlist", href: "wishlist.html", icon: "heart", text: "Wishlist" },
  ];
  var ACCT = [
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
    { key: "settings", href: "settings.html", icon: "gear", text: "Settings" },
    {
      key: "logout",
      href: "logout.html",
      icon: "box-arrow-right",
      text: "Logout",
    },
  ];

  function avatarHTML(u) {
    if (u && u.avatar)
      return (
        '<img src="' +
        u.avatar +
        '" class="cw-avatar" style="object-fit:cover;width:36px;height:36px;border-radius:50%;" alt="avatar"/>'
      );
    return '<div class="cw-avatar">' + initials(u && u.name) + "</div>";
  }

  function renderUserSidebars() {
    var u = sget();
    if (!u) return;
    var r = roleArr(u);
    var hasO = r.indexOf("owner") >= 0,
      hasR = r.indexOf("renter") >= 0;
    var mode = getMode(u);
    document.querySelectorAll("[data-cw-sidebar]").forEach(function (host) {
      var active = host.getAttribute("data-active") || "";
      var html = "";
      // Mode toggle FIRST (very top of sidebar) when user has both roles
      if (hasO && hasR) {
        html +=
          '<div class="px-2 mb-3"><div class="btn-group btn-group-sm w-100" role="group" aria-label="Switch mode">' +
          '<button type="button" class="btn ' +
          (mode === "lend" ? "btn-brand" : "btn-outline-secondary") +
          '" data-cw-mode="lend"><i class="bi bi-box-seam me-1"></i>Lending</button>' +
          '<button type="button" class="btn ' +
          (mode === "rent" ? "btn-brand" : "btn-outline-secondary") +
          '" data-cw-mode="rent"><i class="bi bi-bag-check me-1"></i>Renting</button>' +
          "</div></div>";
      }
      html +=
        '<div class="px-2 mb-3 d-flex align-items-center gap-2">' +
        avatarHTML(u) +
        '<div><div class="fw-semibold small">' +
        (u.name || "User") +
        "</div>" +
        '<div class="text-muted small">' +
        (u.area || "Jigjiga Central") +
        "</div></div></div>";
      var groups = [];
      if (hasO && (mode === "lend" || !hasR))
        groups.push({ label: "Lending", items: LEND });
      if (hasR && (mode === "rent" || !hasO))
        groups.push({ label: "Renting", items: RENT });
      groups.push({ label: "Account", items: ACCT });
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
            '"><i class="bi bi-' +
            it.icon +
            ' me-2"></i>' +
            it.text +
            "</a>";
        });
        html += "</nav>";
      });
      host.innerHTML = html;
      host.querySelectorAll("[data-cw-mode]").forEach(function (b) {
        b.addEventListener("click", function () {
          setMode(b.getAttribute("data-cw-mode"));
        });
      });
    });
    // Update navbar avatar everywhere
    document.querySelectorAll("[data-user-initial]").forEach(function (el) {
      if (u.avatar) {
        el.outerHTML =
          '<img src="' +
          u.avatar +
          '" alt="avatar" class="cw-avatar-sm" style="width:32px;height:32px;border-radius:50%;object-fit:cover;"/>';
      } else {
        el.textContent = initials(u.name);
      }
    });
    document.querySelectorAll("[data-user-name]").forEach(function (el) {
      el.textContent = u.name || "User";
    });
  }

  function applyDashboardMode() {
    // On dashboard, switch tabs to match selected mode
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var u = sget();
    if (!u) return;
    var mode = getMode(u);
    var lendTab = document.getElementById("tab-lend");
    var rentTab = document.getElementById("tab-rent");
    if (window.bootstrap && bootstrap.Tab) {
      if (mode === "rent" && rentTab) new bootstrap.Tab(rentTab).show();
      else if (lendTab) new bootstrap.Tab(lendTab).show();
    }
  }

  function injectDashboardSummary() {
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var u = sget();
    if (!u) return;
    var r = roleArr(u);
    var hasO = r.indexOf("owner") >= 0,
      hasR = r.indexOf("renter") >= 0;
    if (!(hasO && hasR)) return; // Spec: shown when user has both roles
    Promise.all([
      fetchJSON("listings.json"),
      fetchJSON("bookings.json"),
      fetchJSON("earnings.json"),
    ]).then(function (res) {
      var listings = res[0],
        bookings = res[1],
        earnings = res[2];
      var mine = listings.filter(function (l) {
        return l.ownerId === u.id && l.status === "active";
      }).length;
      var earned = earnings
        .filter(function (e) {
          return e.ownerId === u.id;
        })
        .reduce(function (a, b) {
          return a + b.amount;
        }, 0);
      var activeR = bookings.filter(function (b) {
        return b.renterId === u.id && b.status === "active";
      }).length;
      var pendingR = bookings.filter(function (b) {
        return b.renterId === u.id && b.status === "pending";
      }).length;
      var html =
        '<div class="row g-3 mb-4" id="cwModeCards">' +
        '<div class="col-md-6"><div class="cw-card p-3 h-100" role="button" data-cw-mode="lend">' +
        '<div class="d-flex justify-content-between"><span class="text-muted small">As Owner</span><i class="bi bi-box-seam text-brand"></i></div>' +
        '<h4 class="mb-0 mt-2">' +
        mine +
        " active items</h4>" +
        '<p class="small text-success mb-0">' +
        earned.toLocaleString() +
        " ETB earned</p>" +
        "</div></div>" +
        '<div class="col-md-6"><div class="cw-card p-3 h-100" role="button" data-cw-mode="rent">' +
        '<div class="d-flex justify-content-between"><span class="text-muted small">As Renter</span><i class="bi bi-bag-check text-brand"></i></div>' +
        '<h4 class="mb-0 mt-2">' +
        activeR +
        " active rentals</h4>" +
        '<p class="small text-muted mb-0">' +
        pendingR +
        " pending pickup</p>" +
        "</div></div>" +
        "</div>";
      var tabs = document.querySelector(".cw-dash-tabs");
      if (tabs && !document.getElementById("cwModeCards")) {
        tabs.insertAdjacentHTML("beforebegin", html);
        document
          .querySelectorAll("#cwModeCards [data-cw-mode]")
          .forEach(function (c) {
            c.addEventListener("click", function () {
              setMode(c.getAttribute("data-cw-mode"));
            });
          });
      }
    });
  }

  // ---- Profile photo upload binding (profile.html) ----
  function wireProfilePhoto() {
    var fileInput = document.querySelector(
      'input[type="file"][data-cw-avatar]',
    );
    if (!fileInput) return;
    var preview = document.querySelector("[data-cw-avatar-preview]");
    var fallback = document.querySelector(
      ".cw-avatar.cw-avatar-lg[data-user-initial]",
    );
    // Inject remove button next to file input
    var removeBtn = document.querySelector("[data-cw-avatar-remove]");
    if (!removeBtn) {
      removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.setAttribute("data-cw-avatar-remove", "");
      removeBtn.className = "btn btn-sm btn-outline-danger mt-2 w-100";
      removeBtn.innerHTML = '<i class="bi bi-trash me-1"></i>Remove photo';
      fileInput.parentNode.insertBefore(removeBtn, fileInput.nextSibling);
    }
    function refresh() {
      var u = sget();
      var has = u && u.avatar;
      if (preview) {
        if (has) {
          preview.src = u.avatar;
          preview.style.display = "";
        } else {
          preview.style.display = "none";
        }
      }
      if (fallback) fallback.style.display = has ? "none" : "";
      removeBtn.style.display = has ? "" : "none";
    }
    refresh();
    fileInput.addEventListener("change", function () {
      var f = fileInput.files[0];
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () {
        var u = sget();
        if (!u) return;
        u.avatar = rd.result;
        sset(u);
        renderUserSidebars();
        refresh();
      };
      rd.readAsDataURL(f);
    });
    removeBtn.addEventListener("click", function () {
      var u = sget();
      if (!u) return;
      u.avatar = null;
      sset(u);
      fileInput.value = "";
      renderUserSidebars();
      refresh();
    });
  }

  // ---- Profile name update ----
  function wireProfileName() {
    var f = document.querySelector("form[data-cw-profile]");
    if (!f) return;
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = (f.querySelector('input[name="fullName"]') || {}).value;
      if (!n) return;
      var u = sget();
      if (!u) return;
      u.name = n.trim();
      sset(u);
      renderUserSidebars();
      alert("Profile updated.");
    });
  }

  // ---- Logout ----
  function wireLogout() {
    if (!/logout\.html$/i.test(location.pathname)) return;
    sclear();
    setTimeout(function () {
      location.replace("login.html");
    }, 400);
  }

  document.addEventListener("DOMContentLoaded", function () {
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
(function () {
  var SUPER = [
    {
      key: "overview",
      href: "index.html",
      icon: "speedometer2",
      text: "Overview",
    },
    {
      key: "admins",
      href: "admins.html",
      icon: "shield-check",
      text: "Manage Admins",
    },
    { key: "users", href: "users.html", icon: "people", text: "All Users" },
    {
      key: "categories",
      href: "categories.html",
      icon: "tags",
      text: "Categories",
    },
    {
      key: "analytics",
      href: "analytics.html",
      icon: "graph-up",
      text: "Analytics",
    },
    {
      key: "transactions",
      href: "transactions.html",
      icon: "cash-stack",
      text: "Transactions",
    },
    { key: "reports", href: "reports.html", icon: "flag", text: "Reports" },
    {
      key: "audit",
      href: "audit.html",
      icon: "journal-text",
      text: "Audit Logs",
    },
    {
      key: "settings",
      href: "settings.html",
      icon: "sliders",
      text: "Site Settings",
    },
  ];
  var SESS = [
    {
      key: "signout",
      href: "../logout.html",
      icon: "box-arrow-right",
      text: "Sign out",
    },
  ];

  function getUser() {
    try {
      return JSON.parse(sessionStorage.getItem("cw_user") || "null");
    } catch (e) {
      return null;
    }
  }
  function initials(name) {
    if (!name) return "G";
    var p = name.trim().split(/\s+/);
    return (
      p.length === 1
        ? p[0].charAt(0)
        : p[0].charAt(0) + p[p.length - 1].charAt(0)
    ).toUpperCase();
  }

  function render(host, groups) {
    var u = getUser() || {};
    var active = host.getAttribute("data-active") || "";
    var avatar = u.avatar
      ? '<img src="' +
        u.avatar +
        '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" alt="avatar"/>'
      : '<div class="cw-avatar">' + initials(u.name) + "</div>";
    var html =
      '<div class="px-2 mb-3 d-flex align-items-center gap-2">' +
      avatar +
      '<div><div class="fw-semibold small">' +
      (u.name || "Super Admin") +
      "</div>" +
      '<div class="text-muted small">Platform owner</div></div></div>';
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
          '"><i class="bi bi-' +
          it.icon +
          ' me-2"></i>' +
          it.text +
          "</a>";
      });
      html += "</nav>";
    });
    host.innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-cw-super-sidebar]").forEach(function (el) {
      render(el, [
        { label: "Super Admin", items: SUPER },
        { label: "Session", items: SESS },
      ]);
    });
  });
})();

/* ====================================================================
   v13 — Admin / Superadmin theme toggle (top navbar)
   ==================================================================== */
(function () {
  var KEY = "cw_theme";
  function getTheme() {
    return localStorage.getItem(KEY) || "light";
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    document.querySelectorAll("[data-theme-icon]").forEach(function (el) {
      el.className = t === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    });
  }
  function toggle() {
    var next = getTheme() === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, next);
    applyTheme(next);
  }
  applyTheme(getTheme());
  document.addEventListener("DOMContentLoaded", function () {
    var inAdmin = /\/(admin|superadmin)\//.test(location.pathname);
    if (!inAdmin) return;
    var bar = document.querySelector(
      ".cw-navbar .container .ms-auto, .cw-navbar .container",
    );
    if (!bar) return;
    // Place inside the right-side cluster if present, else append to container
    var host =
      document.querySelector(".cw-navbar .container .ms-auto") ||
      document.querySelector(".cw-navbar .container");
    if (host.querySelector("[data-theme-toggle]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("data-theme-toggle", "");
    btn.className = "cw-theme-toggle me-2";
    btn.title = "Toggle dark mode";
    btn.setAttribute("aria-label", "Toggle dark mode");
    btn.innerHTML =
      '<i data-theme-icon class="' +
      (getTheme() === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill") +
      '"></i>';
    btn.addEventListener("click", toggle);
    // Insert at the beginning of the right cluster (before Sign out)
    if (host.classList.contains("ms-auto"))
      host.insertBefore(btn, host.firstChild);
    else host.appendChild(btn);
  });
})();

/* ====================================================================
   v14 — Remove duplicate "Sign out" from top navbar on admin/superadmin
   (sidebar keeps the only logout link)
   ==================================================================== */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    if (!/\/(admin|superadmin)\//.test(location.pathname)) return;
    document.querySelectorAll(".cw-navbar a").forEach(function (a) {
      var txt = (a.textContent || "").trim().toLowerCase();
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
(function () {
  var REQ_KEY = "cw_role_requests";
  var NOTICE_KEY = "cw_role_notice";

  function sget() {
    try {
      return JSON.parse(sessionStorage.getItem("cw_user") || "null");
    } catch (e) {
      return null;
    }
  }
  function sset(u) {
    sessionStorage.setItem("cw_user", JSON.stringify(u));
    localStorage.setItem("cw_user", JSON.stringify(u));
  }
  function loadReqs() {
    try {
      return JSON.parse(localStorage.getItem(REQ_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }
  function saveReqs(a) {
    localStorage.setItem(REQ_KEY, JSON.stringify(a));
  }
  function loadNotices() {
    try {
      return JSON.parse(localStorage.getItem(NOTICE_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function saveNotices(o) {
    localStorage.setItem(NOTICE_KEY, JSON.stringify(o));
  }

  function roleArr(u) {
    if (!u) return [];
    return Array.isArray(u.role) ? u.role : [u.role];
  }
  function currentAccountType(u) {
    var r = roleArr(u);
    var hasO = r.indexOf("owner") >= 0,
      hasR = r.indexOf("renter") >= 0;
    if (hasO && hasR) return "both";
    if (hasO) return "owner";
    if (hasR) return "renter";
    return r[0] || "renter";
  }
  function labelFor(t) {
    return t === "owner"
      ? "Owner (Lender)"
      : t === "renter"
        ? "Renter"
        : t === "both"
          ? "Both (Renter & Owner)"
          : t;
  }
  function applyTypeToUser(u, t) {
    if (t === "both") u.role = ["owner", "renter"];
    else if (t === "owner") u.role = ["owner"];
    else if (t === "renter") u.role = ["renter"];
    else u.role = [t];
    return u;
  }

  // ---- Page-level role enforcement for regular users ----
  // Owner-only pages must reject pure renters, and vice versa.
  function enforcePageRole() {
    var u = sget();
    if (!u) return;
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    var inAdmin = /\/(admin|superadmin)\//.test(location.pathname);
    if (inAdmin) return;
    var t = currentAccountType(u);
    if (t === "both" || t === "admin" || t === "super_admin") return;
    var ownerOnly = [
      "my-listings.html",
      "add-item.html",
      "earnings.html",
      "bookings.html",
    ];
    var renterOnly = [
      "my-bookings.html",
      "rental-history.html",
      "wishlist.html",
    ];
    if (t === "renter" && ownerOnly.indexOf(page) >= 0) {
      alert(
        "This page is only available to Owner accounts. Request an account-type change in Settings.",
      );
      location.replace("dashboard.html");
    } else if (t === "owner" && renterOnly.indexOf(page) >= 0) {
      alert(
        "This page is only available to Renter accounts. Request an account-type change in Settings.",
      );
      location.replace("dashboard.html");
    }
  }

  // ---- One-time notice on approval/rejection ----
  function showNotice() {
    var u = sget();
    if (!u) return;
    var all = loadNotices();
    var n = all[u.id];
    if (!n) return;
    delete all[u.id];
    saveNotices(all);
    var bar = document.createElement("div");
    bar.className =
      "alert " +
      (n.kind === "ok" ? "alert-success" : "alert-danger") +
      " alert-dismissible fade show m-3";
    bar.setAttribute("role", "alert");
    bar.innerHTML =
      '<i class="bi bi-' +
      (n.kind === "ok" ? "check-circle" : "x-circle") +
      ' me-2"></i>' +
      n.message +
      '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>';
    document.body.insertBefore(bar, document.body.firstChild);
  }

  // ---- Inject Account Type Management card on settings.html ----
  function injectSettingsCard() {
    if (!/settings\.html$/i.test(location.pathname)) return;
    if (/\/(admin|superadmin)\//.test(location.pathname)) return;
    if (document.getElementById("cwAcctTypeCard")) return;
    var u = sget();
    if (!u) return;
    var grid = document.querySelector("main .row.g-4");
    if (!grid) return;
    var t = currentAccountType(u);
    var reqs = loadReqs().filter(function (r) {
      return r.userId === u.id && r.status === "pending";
    });
    var pending = reqs[0];

    var options = ["renter", "owner", "both"].filter(function (x) {
      return x !== t;
    });
    var optsHTML = options
      .map(function (x) {
        return '<option value="' + x + '">' + labelFor(x) + "</option>";
      })
      .join("");

    var statusHTML = pending
      ? '<div class="alert alert-warning small mb-3"><i class="bi bi-hourglass-split me-1"></i>' +
        "Request pending: <strong>" +
        labelFor(pending.from) +
        "</strong> → <strong>" +
        labelFor(pending.to) +
        "</strong>" +
        ' <button class="btn btn-sm btn-link p-0 ms-2" data-cw-cancel-req>Cancel</button></div>'
      : "";

    var formHTML = pending
      ? ""
      : "<form data-cw-req-form>" +
        '<div class="mb-2"><label class="form-label small fw-semibold">Requested account type</label>' +
        '<select name="to" class="form-select" required><option value="" disabled selected>Select new type</option>' +
        optsHTML +
        "</select></div>" +
        '<div class="mb-3"><label class="form-label small fw-semibold">Reason (optional)</label>' +
        '<textarea name="note" class="form-control" rows="2" placeholder="Tell the admin why"></textarea></div>' +
        '<button type="submit" class="btn btn-brand"><i class="bi bi-send me-1"></i>Request Account Type Change</button>' +
        "</form>";

    var col = document.createElement("div");
    col.className = "col-12";
    col.innerHTML =
      '<div id="cwAcctTypeCard" class="cw-card p-4">' +
      '<h5 class="mb-3"><i class="bi bi-arrow-repeat me-2 text-brand"></i>Account Type Management</h5>' +
      '<p class="small text-muted mb-2">Current account type:</p>' +
      '<p class="mb-3"><span class="badge bg-brand-soft text-brand fs-6 px-3 py-2">' +
      labelFor(t) +
      "</span></p>" +
      statusHTML +
      formHTML +
      "</div>";
    grid.appendChild(col);

    var form = col.querySelector("[data-cw-req-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var to = form.querySelector('[name="to"]').value;
        var note = form.querySelector('[name="note"]').value || "";
        if (!to || to === t) {
          alert("Please choose a different account type.");
          return;
        }
        var all = loadReqs();
        all.push({
          id: Date.now(),
          userId: u.id,
          userName: u.name,
          userEmail: u.email,
          from: t,
          to: to,
          status: "pending",
          createdAt: new Date().toISOString(),
          note: note,
        });
        saveReqs(all);
        alert(
          "Your request has been submitted. An administrator will review it shortly.",
        );
        location.reload();
      });
    }
    var cancel = col.querySelector("[data-cw-cancel-req]");
    if (cancel) {
      cancel.addEventListener("click", function () {
        if (!confirm("Cancel this pending request?")) return;
        var all = loadReqs().filter(function (r) {
          return !(r.userId === u.id && r.status === "pending");
        });
        saveReqs(all);
        location.reload();
      });
    }
  }

  // ---- Admin / Superadmin: inject "Role Requests" sidebar link ----
  function injectAdminSidebarLink() {
    // Role Requests is a Super Admin-only surface
    var inSuper = /\/superadmin\//.test(location.pathname);
    if (!inSuper) return;
    // Defensive cleanup: remove any leftover role-requests link from admin sidebars
    document
      .querySelectorAll('[data-cw-admin-sidebar] a[href="role-requests.html"]')
      .forEach(function (a) {
        a.remove();
      });
    document
      .querySelectorAll("[data-cw-super-sidebar]")
      .forEach(function (host) {
        if (host.querySelector('[href="role-requests.html"]')) return;
        var firstSessionLabel = Array.from(
          host.querySelectorAll(".cw-sidebar-group-label"),
        ).find(function (el) {
          return /session/i.test(el.textContent);
        });
        var pending = loadReqs().filter(function (r) {
          return r.status === "pending";
        }).length;
        var badge = pending
          ? ' <span class="badge bg-danger ms-1">' + pending + "</span>"
          : "";
        var active =
          (location.pathname.split("/").pop() || "").toLowerCase() ===
          "role-requests.html"
            ? " active"
            : "";
        var a = document.createElement("a");
        a.className = "nav-link" + active;
        a.href = "role-requests.html";
        a.innerHTML =
          '<i class="bi bi-arrow-left-right me-2"></i>Role Requests' + badge;
        if (firstSessionLabel) host.insertBefore(a, firstSessionLabel);
        else host.appendChild(a);
      });
  }

  // ---- Admin / Superadmin: render Role Requests page ----
  function renderRoleRequestsPage() {
    var host = document.getElementById("cwRoleReqRoot");
    if (!host) return;
    var u = sget();
    var isSuper = roleArr(u).indexOf("super_admin") >= 0;
    var all = loadReqs()
      .slice()
      .sort(function (a, b) {
        return (b.createdAt || "").localeCompare(a.createdAt || "");
      });

    function row(r) {
      var badge =
        r.status === "pending"
          ? '<span class="badge bg-warning text-dark">Pending</span>'
          : r.status === "approved"
            ? '<span class="badge bg-success">Approved</span>'
            : '<span class="badge bg-danger">Rejected</span>';
      var actions = "";
      if (r.status === "pending") {
        actions =
          '<button class="btn btn-sm btn-success me-1" data-cw-approve="' +
          r.id +
          '"><i class="bi bi-check2"></i> Approve</button>' +
          '<button class="btn btn-sm btn-outline-danger" data-cw-reject="' +
          r.id +
          '"><i class="bi bi-x"></i> Reject</button>';
      } else if (isSuper) {
        actions =
          '<button class="btn btn-sm btn-outline-secondary" data-cw-override="' +
          r.id +
          '"><i class="bi bi-arrow-counterclockwise"></i> Override</button>';
      }
      return (
        "<tr>" +
        '<td><div class="fw-semibold small">' +
        (r.userName || "") +
        '</div><div class="text-muted small">' +
        (r.userEmail || "") +
        "</div></td>" +
        "<td>" +
        labelFor(r.from) +
        "</td>" +
        '<td><i class="bi bi-arrow-right text-muted"></i> ' +
        labelFor(r.to) +
        "</td>" +
        "<td>" +
        badge +
        "</td>" +
        '<td class="small text-muted">' +
        (r.note || "—") +
        "</td>" +
        '<td class="text-end">' +
        actions +
        "</td>" +
        "</tr>"
      );
    }

    function paint() {
      all = loadReqs()
        .slice()
        .sort(function (a, b) {
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        });
      var pending = all.filter(function (r) {
        return r.status === "pending";
      });
      var others = all.filter(function (r) {
        return r.status !== "pending";
      });
      host.innerHTML =
        '<div class="mb-4"><h2 class="mb-1">Role Change Requests</h2>' +
        '<p class="text-muted mb-0">Review and act on account-type change requests.</p></div>' +
        '<div class="cw-card p-3 mb-4">' +
        '<h6 class="mb-3"><i class="bi bi-hourglass-split me-2 text-brand"></i>Pending (' +
        pending.length +
        ")</h6>" +
        (pending.length
          ? '<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr>' +
            '<th>User</th><th>Current</th><th>Requested</th><th>Status</th><th>Reason</th><th class="text-end">Actions</th>' +
            "</tr></thead><tbody>" +
            pending.map(row).join("") +
            "</tbody></table></div>"
          : '<p class="text-muted small mb-0">No pending requests.</p>') +
        "</div>" +
        '<div class="cw-card p-3">' +
        '<h6 class="mb-3"><i class="bi bi-clock-history me-2 text-brand"></i>History</h6>' +
        (others.length
          ? '<div class="table-responsive"><table class="table align-middle mb-0"><thead><tr>' +
            '<th>User</th><th>From</th><th>To</th><th>Status</th><th>Reason</th><th class="text-end">Actions</th>' +
            "</tr></thead><tbody>" +
            others.map(row).join("") +
            "</tbody></table></div>"
          : '<p class="text-muted small mb-0">No history yet.</p>') +
        "</div>";
      wireActions();
    }

    function applyToUserRecord(req) {
      // Update sessionStorage user if it's the active session, and any cw_users_extra entry
      var extra = JSON.parse(localStorage.getItem("cw_users_extra") || "[]");
      var idx = extra.findIndex(function (x) {
        return x.id === req.userId;
      });
      if (idx >= 0) {
        applyTypeToUser(extra[idx], req.to);
        localStorage.setItem("cw_users_extra", JSON.stringify(extra));
      }
      // Active session user (if same browser)
      try {
        var su = JSON.parse(sessionStorage.getItem("cw_user") || "null");
        if (su && su.id === req.userId) {
          applyTypeToUser(su, req.to);
          sessionStorage.setItem("cw_user", JSON.stringify(su));
          localStorage.setItem("cw_user", JSON.stringify(su));
        }
      } catch (e) {}
    }
    function notify(userId, kind, message) {
      var n = loadNotices();
      n[userId] = { kind: kind, message: message };
      saveNotices(n);
    }

    function wireActions() {
      host.querySelectorAll("[data-cw-approve]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = parseInt(b.getAttribute("data-cw-approve"), 10);
          var arr = loadReqs();
          var r = arr.find(function (x) {
            return x.id === id;
          });
          if (!r) return;
          r.status = "approved";
          r.decidedAt = new Date().toISOString();
          r.decidedBy = (u && u.name) || "Admin";
          saveReqs(arr);
          applyToUserRecord(r);
          notify(
            r.userId,
            "ok",
            "Your account type has been successfully updated.",
          );
          paint();
        });
      });
      host.querySelectorAll("[data-cw-reject]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = parseInt(b.getAttribute("data-cw-reject"), 10);
          var arr = loadReqs();
          var r = arr.find(function (x) {
            return x.id === id;
          });
          if (!r) return;
          r.status = "rejected";
          r.decidedAt = new Date().toISOString();
          r.decidedBy = (u && u.name) || "Admin";
          saveReqs(arr);
          notify(
            r.userId,
            "err",
            "Your account type change request was rejected by the administrator.",
          );
          paint();
        });
      });
      host.querySelectorAll("[data-cw-override]").forEach(function (b) {
        b.addEventListener("click", function () {
          var id = parseInt(b.getAttribute("data-cw-override"), 10);
          var arr = loadReqs();
          var r = arr.find(function (x) {
            return x.id === id;
          });
          if (!r) return;
          if (!confirm("Override and apply this change anyway?")) return;
          r.status = "approved";
          r.decidedAt = new Date().toISOString();
          r.decidedBy = ((u && u.name) || "Super Admin") + " (override)";
          saveReqs(arr);
          applyToUserRecord(r);
          notify(
            r.userId,
            "ok",
            "Your account type has been successfully updated.",
          );
          paint();
        });
      });
    }

    paint();
  }

  document.addEventListener("DOMContentLoaded", function () {
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
(function () {
  function sget() {
    try {
      return JSON.parse(sessionStorage.getItem("cw_user") || "null");
    } catch (e) {
      return null;
    }
  }
  function roleArr(u) {
    if (!u) return [];
    return Array.isArray(u.role) ? u.role : [u.role];
  }

  // ---- Single-role dashboard: drop the "I'm Lending / I'm Renting" tabs
  function simplifyDashboard() {
    if (!/dashboard\.html$/i.test(location.pathname)) return;
    var u = sget();
    if (!u) return;
    var r = roleArr(u);
    var hasO = r.indexOf("owner") >= 0,
      hasR = r.indexOf("renter") >= 0;
    if (hasO && hasR) return; // both — keep both tabs

    var tabs = document.querySelector(".cw-dash-tabs");
    if (tabs) tabs.style.display = "none";
    var paneLend = document.getElementById("pane-lend");
    var paneRent = document.getElementById("pane-rent");
    var keepLend = hasO && !hasR;

    if (keepLend) {
      if (paneRent) paneRent.remove();
      if (paneLend) {
        paneLend.classList.add("show", "active");
        paneLend.classList.remove("fade");
      }
    } else {
      if (paneLend) paneLend.remove();
      if (paneRent) {
        paneRent.classList.add("show", "active");
        paneRent.classList.remove("fade");
      }
    }

    var sub = document.querySelector("main p.text-muted.mb-0");
    if (sub && /switch between lending and renting/i.test(sub.textContent)) {
      sub.textContent = keepLend
        ? "Manage your listings, incoming bookings and earnings."
        : "Browse, book and track the items you rent.";
    }
    // Renters don't need the "New listing" CTA
    if (!keepLend) {
      document
        .querySelectorAll('a.btn-brand[href="add-item.html"]')
        .forEach(function (a) {
          a.style.display = "none";
        });
    }
  }

  // ---- Admin vs Super Admin: distinct visual theme so the role is obvious
  function themeAdmin() {
    var isSuper = /\/superadmin\//.test(location.pathname);
    var isAdmin = /\/admin\//.test(location.pathname);
    if (!isSuper && !isAdmin) return;
    document.body.classList.add(isSuper ? "cw-theme-super" : "cw-theme-admin");
    if (document.getElementById("cwAdminThemeCSS")) return;
    var css = document.createElement("style");
    css.id = "cwAdminThemeCSS";
    css.textContent =
      /* Admin = red accent on a light shell */
      ".cw-theme-admin .cw-navbar{border-top:4px solid #dc3545;background:#ffffff;}" +
      ".cw-theme-admin .cw-sidebar .nav-link.active{background:#fdecea;color:#dc3545;}" +
      ".cw-theme-admin .cw-sidebar .nav-link.active i{color:#dc3545;}" +
      /* Super Admin = purple accent on a clean white shell (no shifting gradient) */
      ".cw-theme-super .cw-navbar{border-top:4px solid #6f42c1;background:#ffffff;}" +
      ".cw-theme-super .cw-sidebar{background:#0f1115;color:#e9ecef;min-height:calc(100vh - 64px);}" +
      ".cw-theme-super .cw-sidebar .nav-link{color:#cbd5e1;}" +
      ".cw-theme-super .cw-sidebar .nav-link i{color:#94a3b8;}" +
      ".cw-theme-super .cw-sidebar .nav-link:hover{background:#1f2937;color:#fff;}" +
      ".cw-theme-super .cw-sidebar .nav-link:hover i{color:#fff;}" +
      ".cw-theme-super .cw-sidebar .nav-link.active{background:#6f42c1;color:#fff;}" +
      ".cw-theme-super .cw-sidebar .nav-link.active i{color:#fff;}" +
      ".cw-theme-super .cw-sidebar-group-label{color:#94a3b8 !important;}" +
      ".cw-theme-super .cw-sidebar [data-user-name]," +
      ".cw-theme-super .cw-sidebar .fw-semibold{color:#f1f5f9;}" +
      ".cw-theme-super .cw-sidebar .text-muted{color:#94a3b8 !important;}";
    document.head.appendChild(css);
  }

  // ---- Surface Role Requests on Admin/Super Admin "Users" page
  function injectUsersPageCTA() {
    var page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (page !== "users.html") return;
    if (!/\/superadmin\//.test(location.pathname)) return;
    if (document.getElementById("cwUsersRoleReqCTA")) return;
    var header =
      document.querySelector("main > .mb-4") ||
      document.querySelector("main .mb-4");
    if (!header) return;
    var pending = 0;
    try {
      pending = JSON.parse(
        localStorage.getItem("cw_role_requests") || "[]",
      ).filter(function (r) {
        return r.status === "pending";
      }).length;
    } catch (e) {}
    var badge = pending
      ? ' <span class="badge bg-danger ms-1">' + pending + "</span>"
      : "";
    var bar = document.createElement("div");
    bar.id = "cwUsersRoleReqCTA";
    bar.className = "d-flex flex-wrap align-items-center gap-2 mb-3";
    bar.innerHTML =
      '<a href="role-requests.html" class="btn btn-brand btn-sm">' +
      '<i class="bi bi-arrow-left-right me-1"></i>Role Change Requests' +
      badge +
      "</a>" +
      '<span class="text-muted small">Review and approve users who asked to change their account type.</span>';
    header.insertAdjacentElement("afterend", bar);
  }

  document.addEventListener("DOMContentLoaded", function () {
    themeAdmin();
    simplifyDashboard();
    injectUsersPageCTA();
  });
})();
