/* Demo localStorage review system. No backend integration. */
(function(){
  var KEY = "cw_item_reviews";
  var currentItem = null;

  function ready(fn){
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }
  function getUser(){
    try { return JSON.parse(sessionStorage.getItem("cw_user") || localStorage.getItem("cw_user") || "null"); }
    catch(e){ return null; }
  }
  function today(){ return new Date().toISOString().slice(0, 10); }
  function seed(){
    return {
      "canon-eos-r5-camera": [
        { user:"Hodan Ali", rating:5, comment:"The camera was clean, fully charged, and perfect for an event shoot.", date:"2026-06-04", verified:true },
        { user:"Abdi Mohamed", rating:4, comment:"Excellent image quality. Pickup was quick and professional.", date:"2026-05-28", verified:true },
        { user:"Muna Yusuf", rating:5, comment:"Everything matched the listing and the owner explained the kit clearly.", date:"2026-05-19", verified:true }
      ]
    };
  }
  function load(){
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved && typeof saved === "object") return saved;
    } catch(e){}
    var initial = seed();
    localStorage.setItem(KEY, JSON.stringify(initial));
    return initial;
  }
  function save(data){ localStorage.setItem(KEY, JSON.stringify(data)); }
  function stars(n, interactive){
    var out = "";
    for (var i=1; i<=5; i++) {
      out += '<button type="button" class="cw-star'+(i<=n ? " is-active" : "")+'" '+(interactive ? 'data-star="'+i+'"' : 'tabindex="-1" aria-hidden="true"')+'><i class="bi bi-star-fill"></i></button>';
    }
    return out;
  }
  function average(rows){
    if (!rows.length) return 0;
    return rows.reduce(function(sum, r){ return sum + Number(r.rating || 0); }, 0) / rows.length;
  }
  function ensureModal(){
    if (document.getElementById("cwReviewModal")) return;
    var wrap = document.createElement("div");
    wrap.innerHTML =
      '<div class="modal fade" id="cwReviewModal" tabindex="-1" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered">' +
          '<div class="modal-content cw-review-modal">' +
            '<div class="modal-header">' +
              '<div><h5 class="modal-title">Rate This Item</h5><p class="small text-muted mb-0" data-cw-review-title></p></div>' +
              '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
            '</div>' +
            '<form data-cw-review-form>' +
              '<div class="modal-body">' +
                '<label class="form-label fw-semibold">Star Rating</label>' +
                '<div class="cw-star-picker mb-3" data-cw-star-picker>'+stars(5, true)+'</div>' +
                '<input type="hidden" name="rating" value="5" />' +
                '<label class="form-label fw-semibold">Review Comment</label>' +
                '<textarea class="form-control" name="comment" rows="4" required placeholder="Share your rental experience"></textarea>' +
              '</div>' +
              '<div class="modal-footer"><button type="submit" class="btn btn-brand">Submit Review</button></div>' +
            '</form>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(wrap.firstElementChild);
  }
  function openModal(itemId, title){
    ensureModal();
    currentItem = { id:itemId, title:title };
    var modalEl = document.getElementById("cwReviewModal");
    modalEl.querySelector("[data-cw-review-title]").textContent = title || "";
    modalEl.querySelector('[name="rating"]').value = "5";
    modalEl.querySelector('[name="comment"]').value = "";
    paintPicker(5);
    if (window.bootstrap) new bootstrap.Modal(modalEl).show();
  }
  function paintPicker(value){
    document.querySelectorAll("#cwReviewModal [data-star]").forEach(function(btn){
      btn.classList.toggle("is-active", Number(btn.getAttribute("data-star")) <= value);
    });
  }
  function submitReview(e){
    e.preventDefault();
    if (!currentItem) return;
    var form = e.currentTarget;
    var user = getUser() || {};
    var data = load();
    var rows = data[currentItem.id] || [];
    rows.unshift({
      user: user.name || "Demo Renter",
      rating: Number(form.rating.value || 5),
      comment: form.comment.value.trim(),
      date: today(),
      verified: true
    });
    data[currentItem.id] = rows;
    save(data);
    var modalEl = document.getElementById("cwReviewModal");
    if (window.bootstrap) bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    renderReviewSections();
  }
  function renderReviewSections(){
    document.querySelectorAll("[data-cw-item-reviews]").forEach(function(host){
      var itemId = host.getAttribute("data-item-id");
      var rows = (load()[itemId] || []);
      var avg = average(rows);
      host.innerHTML =
        '<div class="cw-card cw-product-ratings p-4">' +
          '<div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">' +
            '<div><h4 class="mb-1">Product Ratings</h4><p class="text-muted mb-0">Reviews from verified renters.</p></div>' +
            '<div class="cw-rating-summary text-end">' +
              '<div class="fs-3 fw-bold text-brand">'+(avg ? avg.toFixed(1) : "0.0")+'</div>' +
              '<div class="cw-stars-static">'+stars(Math.round(avg), false)+'</div>' +
              '<div class="small text-muted">'+rows.length+' total reviews</div>' +
            '</div>' +
          '</div>' +
          (rows.length ? rows.map(function(r){
            return '<article class="cw-review-item">' +
              '<div class="d-flex justify-content-between gap-3">' +
                '<div><div class="fw-semibold">'+r.user+'</div><span class="badge bg-brand-soft text-brand">Verified Renter</span></div>' +
                '<div class="text-end"><div class="cw-stars-static">'+stars(Number(r.rating), false)+'</div><div class="small text-muted">'+r.date+'</div></div>' +
              '</div>' +
              '<p class="mb-0 mt-3 text-muted">'+r.comment+'</p>' +
            '</article>';
          }).join("") : '<div class="text-muted py-3">No reviews yet. Be the first to review this item.</div>') +
        '</div>';
    });
  }
  function bind(){
    ensureModal();
    document.addEventListener("click", function(e){
      var star = e.target.closest("#cwReviewModal [data-star]");
      if (star) {
        var value = Number(star.getAttribute("data-star"));
        document.querySelector('#cwReviewModal [name="rating"]').value = value;
        paintPicker(value);
        return;
      }
      var btn = e.target.closest("[data-cw-rate-item]");
      if (btn) openModal(btn.getAttribute("data-cw-rate-item"), btn.getAttribute("data-cw-rate-title") || "Rental item");
    });
    document.querySelector("[data-cw-review-form]").addEventListener("submit", submitReview);
    renderReviewSections();
  }
  ready(bind);
})();
