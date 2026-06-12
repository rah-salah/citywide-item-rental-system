/* Demo rental request flow. Stores requests locally so the prototype can be
   evaluated without a backend. */
(function () {
  if (window.__cwRentalRequests) return;
  window.__cwRentalRequests = true;

  var KEY = "cw_rental_requests";

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  function read(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function currentUser() {
    return read("cw_user", null) ||
      (function () {
        try { return JSON.parse(sessionStorage.getItem("cw_user") || "null"); }
        catch (e) { return null; }
      })();
  }

  function formatDate(date) {
    return new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "2-digit" }).format(date);
  }

  function seedRequests() {
    var requests = read(KEY, []);
    if (requests.length) return requests;
    requests = [
      {
        id: "REQ-DEMO-1001",
        itemId: "canon-eos-r5-camera",
        itemTitle: "Canon EOS R5 Camera",
        renterName: "Ayan Hassan",
        renterEmail: "ayan@example.com",
        requestedAt: "Jun 06, 2026",
        status: "Pending"
      }
    ];
    write(KEY, requests);
    return requests;
  }

  function submitRequest(button) {
    var user = currentUser() || {};
    var requests = seedRequests();
    var request = {
      id: "REQ-" + Date.now().toString().slice(-7),
      itemId: button.getAttribute("data-item-id") || "demo-item",
      itemTitle: button.getAttribute("data-item-title") || "Rental item",
      renterName: user.name || user.fullName || "Demo Renter",
      renterEmail: user.email || "demo.renter@citywide.local",
      requestedAt: formatDate(new Date()),
      status: "Pending"
    };
    requests.unshift(request);
    write(KEY, requests);
    button.textContent = "Request sent to Admin";
    button.disabled = true;
    window.dispatchEvent(new CustomEvent("cw:rentalrequest", { detail: request }));
  }

  function renderAdminRequests() {
    var main = document.querySelector('body[data-cw-guard="admin"] main');
    if (!main || document.querySelector("[data-cw-admin-rental-requests]")) return;

    var section = document.createElement("section");
    section.className = "cw-admin-rental-requests mt-4";
    section.setAttribute("data-cw-admin-rental-requests", "");
    section.innerHTML =
      '<div class="cw-section-title">'+
        '<h5><span class="dot"></span> Rental Requests</h5>'+
        '<span class="small text-muted" data-cw-rental-count></span>'+
      '</div>'+
      '<div class="cw-card p-4">'+
        '<div class="table-responsive">'+
          '<table class="table align-middle mb-0">'+
            '<thead><tr><th>Request ID</th><th>Item</th><th>Renter</th><th>Date</th><th>Status</th></tr></thead>'+
            '<tbody data-cw-rental-rows></tbody>'+
          '</table>'+
        '</div>'+
      '</div>';
    main.appendChild(section);
    updateAdminRequests();
  }

  function updateAdminRequests() {
    var rows = document.querySelector("[data-cw-rental-rows]");
    var count = document.querySelector("[data-cw-rental-count]");
    if (!rows) return;
    var requests = seedRequests();
    if (count) count.textContent = requests.length + " demo request" + (requests.length === 1 ? "" : "s");
    rows.innerHTML = requests.map(function (request) {
      return '<tr>'+
        '<td class="fw-semibold">'+request.id+'</td>'+
        '<td>'+request.itemTitle+'</td>'+
        '<td><div class="fw-semibold">'+request.renterName+'</div><div class="small text-muted">'+request.renterEmail+'</div></td>'+
        '<td>'+request.requestedAt+'</td>'+
        '<td><span class="badge cw-status-pending">'+request.status+'</span></td>'+
      '</tr>';
    }).join("");
  }

  ready(function () {
    seedRequests();
    document.querySelectorAll("[data-cw-rent-request]").forEach(function (button) {
      button.addEventListener("click", function () { submitRequest(button); });
    });
    renderAdminRequests();
    window.addEventListener("cw:rentalrequest", updateAdminRequests);
  });
})();
