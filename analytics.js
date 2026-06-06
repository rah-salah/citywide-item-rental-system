/* ============================================================
   analytics.js — Role-aware analytics with date range filtering
   Admin focus: operations (activity, listing performance).
   Super Admin focus: business (growth, revenue).
   ============================================================ */
(function(){
  // Skip on pages without the analytics root
  if (!document.getElementById("cwAnalyticsRoot")) return;

  var ROLE  = document.body.getAttribute("data-analytics-role") || "admin";
  var STATE = { users:[], listings:[], bookings:[], tx:[], ads:[], msgs:[], cats:[] };
  // Active filter range as ISO YYYY-MM-DD strings (inclusive)
  var FILTER = { from: null, to: null };
  var charts = {};

  // ---------- date helpers ----------
  function fmtNum(n){ return (n||0).toLocaleString(); }
  function fmtETB(n){ return fmtNum(Math.round(n||0)) + " ETB"; }
  function today(){ return new Date().toISOString().slice(0,10); }
  function daysAgo(n){ var d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
  function firstOfMonth(y,m){ return new Date(y,m,1).toISOString().slice(0,10); }
  function lastOfMonth(y,m){ return new Date(y,m+1,0).toISOString().slice(0,10); }

  // Returns true when a date string is inside the current filter window.
  function inRange(dateStr){
    if (!dateStr) return false;
    var d = dateStr.slice(0,10);
    if (FILTER.from && d < FILTER.from) return false;
    if (FILTER.to   && d > FILTER.to)   return false;
    return true;
  }
  function recordDate(r){
    return r.date || r.start || r.createdAt || r.joined || r.created || null;
  }
  function filtered(items){
    if (!FILTER.from && !FILTER.to) return items.slice();
    return items.filter(function(it){ return inRange(recordDate(it)); });
  }

  // Bucket builders for time-series charts.
  function dayBuckets(){
    var from = FILTER.from || daysAgo(29);
    var to   = FILTER.to   || today();
    var out=[], d=new Date(from), end=new Date(to);
    while (d <= end){ out.push(d.toISOString().slice(0,10)); d.setDate(d.getDate()+1); }
    return out;
  }
  function monthBuckets(){
    var from = FILTER.from || daysAgo(180);
    var to   = FILTER.to   || today();
    var s=new Date(from.slice(0,7)+"-01"), e=new Date(to.slice(0,7)+"-01"), out=[];
    while (s <= e){ out.push(s.toISOString().slice(0,7)); s.setMonth(s.getMonth()+1); }
    return out;
  }
  function autoBuckets(){
    var b = dayBuckets();
    return b.length > 62 ? monthBuckets() : b;
  }
  function keyFor(date, buckets){
    if (!date) return null;
    var sample = buckets[0] || "";
    return sample.length === 7 ? date.slice(0,7) : date.slice(0,10);
  }
  function countByBucket(items, dateField, buckets){
    var map={}; buckets.forEach(function(b){ map[b]=0; });
    items.forEach(function(it){
      var k = keyFor(it[dateField], buckets);
      if (k && k in map) map[k]++;
    });
    return buckets.map(function(b){ return map[b]; });
  }
  function sumByBucket(items, dateField, valueField, buckets){
    var map={}; buckets.forEach(function(b){ map[b]=0; });
    items.forEach(function(it){
      var k = keyFor(it[dateField], buckets);
      if (k && k in map) map[k] += (it[valueField]||0);
    });
    return buckets.map(function(b){ return map[b]; });
  }

  // ---------- summary cards (role-specific) ----------
  function buildCards(){
    var u  = filtered(STATE.users);
    var l  = filtered(STATE.listings);
    var b  = filtered(STATE.bookings);
    var tx = filtered(STATE.tx);
    var ads= filtered(STATE.ads);

    if (ROLE === "superadmin"){
      var bookingRev = tx.filter(function(t){ return (t.type||"").toLowerCase()!=="ad"; })
                         .reduce(function(a,t){ return a+(t.amount||0); },0);
      var adsRev = ads.reduce(function(a,t){return a+(t.amount||0);},0);
      var totalRev = bookingRev + adsRev;
      return [
        { label:"Total Users",       value:fmtNum(u.length),     icon:"people" },
        { label:"Total Listings",    value:fmtNum(l.length),     icon:"collection" },
        { label:"Total Bookings",    value:fmtNum(b.length),     icon:"calendar2-check" },
        { label:"Total Revenue",     value:fmtETB(totalRev),     icon:"cash-stack" },
        { label:"Booking Revenue",   value:fmtETB(bookingRev),   icon:"wallet2" },
        { label:"Advertisement Rev", value:fmtETB(adsRev),       icon:"megaphone" }
      ];
    }
    // Admin role — operational metrics
    var pending  = l.filter(function(x){return x.status==="pending";}).length;
    var active   = l.filter(function(x){return x.status==="active";}).length;
    var inactive = l.filter(function(x){return x.status==="inactive" || x.status==="paused";}).length;
    var rejected = l.filter(function(x){return x.status==="rejected";}).length;
    return [
      { label:"New Users",         value:fmtNum(u.length),  icon:"person-plus" },
      { label:"New Listings",      value:fmtNum(l.length),  icon:"plus-square" },
      { label:"Bookings",          value:fmtNum(b.length),  icon:"calendar2-check" },
      { label:"Pending Approvals", value:fmtNum(pending),   icon:"hourglass-split" },
      { label:"Active Listings",   value:fmtNum(active),    icon:"check2-circle" },
      { label:"Rejected Listings", value:fmtNum(rejected),  icon:"x-circle" }
    ];
  }

  function renderSummary(){
    var host = document.getElementById("cwSummaryCards");
    if (!host) return;
    host.innerHTML = buildCards().map(function(c){
      return '<div class="col-sm-6 col-lg-4 col-xl-2">'+
               '<div class="cw-card cw-stat cw-premium p-3 h-100">'+
                 '<div class="d-flex justify-content-between align-items-start">'+
                   '<div><div class="stat-label text-muted small">'+c.label+'</div>'+
                   '<div class="stat-value h4 mb-0 mt-1">'+c.value+'</div></div>'+
                   '<i class="bi bi-'+c.icon+' fs-4 text-muted"></i>'+
                 '</div>'+
               '</div>'+
             '</div>';
    }).join("");
  }

  // ---------- chart helpers ----------
  function commonOpts(extra){
    var o = {
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:"index", intersect:false },
      plugins:{ legend:{ position:"bottom" } },
      scales:{
        x:{ grid:{ color:"rgba(125,125,125,.1)" } },
        y:{ beginAtZero:true, grid:{ color:"rgba(125,125,125,.1)" } }
      }
    };
    if (extra) Object.keys(extra).forEach(function(k){ o[k]=extra[k]; });
    return o;
  }
  function destroyCharts(){
    Object.keys(charts).forEach(function(k){ if(charts[k]) charts[k].destroy(); });
    charts = {};
  }

  // Counts listings by status across buckets (for admin Listing Performance chart).
  function countListingsByStatus(buckets, status){
    var items = filtered(STATE.listings).filter(function(x){
      if (status === "inactive") return x.status === "inactive" || x.status === "paused";
      return x.status === status;
    });
    return countByBucket(items, "createdAt", buckets);
  }

  // ---------- chart renderers ----------
  function renderAdminCharts(buckets){
    var l = filtered(STATE.listings);
    var u = filtered(STATE.users);
    var b = filtered(STATE.bookings);
    var pending = l.filter(function(x){ return x.status==="pending"; });

    // Chart 1 — Platform Activity
    if (document.getElementById("growthChart")){
      charts.growth = new Chart(document.getElementById("growthChart"), {
        type:"line",
        data:{ labels:buckets, datasets:[
          { label:"New Users",        data:countByBucket(u,"joined",buckets),
            borderColor:"#6f42c1", backgroundColor:"rgba(111,66,193,.15)", tension:.35, fill:true },
          { label:"New Listings",     data:countByBucket(l,"createdAt",buckets),
            borderColor:"#0d6efd", backgroundColor:"rgba(13,110,253,.15)", tension:.35, fill:true },
          { label:"Pending Approvals",data:countByBucket(pending,"createdAt",buckets),
            borderColor:"#ffc107", backgroundColor:"rgba(255,193,7,.15)", tension:.35, fill:true },
          { label:"Bookings",         data:countByBucket(b,"start",buckets),
            borderColor:"#198754", backgroundColor:"rgba(25,135,84,.15)", tension:.35, fill:true }
        ]},
        options:commonOpts()
      });
    }

    // Chart 2 — Listing Performance (by status)
    if (document.getElementById("revenueChart")){
      charts.perf = new Chart(document.getElementById("revenueChart"), {
        type:"bar",
        data:{ labels:buckets, datasets:[
          { label:"Active",   data:countListingsByStatus(buckets,"active"),   backgroundColor:"rgba(25,135,84,.8)",  borderColor:"#198754" },
          { label:"Inactive", data:countListingsByStatus(buckets,"inactive"), backgroundColor:"rgba(108,117,125,.8)",borderColor:"#6c757d" },
          { label:"Approved", data:countListingsByStatus(buckets,"approved"), backgroundColor:"rgba(13,110,253,.8)", borderColor:"#0d6efd" },
          { label:"Rejected", data:countListingsByStatus(buckets,"rejected"), backgroundColor:"rgba(220,53,69,.8)",  borderColor:"#dc3545" }
        ]},
        options:commonOpts()
      });
    }
  }

  function renderSuperAdminCharts(buckets){
    var u  = filtered(STATE.users);
    var l  = filtered(STATE.listings);
    var b  = filtered(STATE.bookings);
    var tx = filtered(STATE.tx);
    var ads= filtered(STATE.ads);
    var bookingTx = tx.filter(function(t){ return (t.type||"").toLowerCase()!=="ad"; });

    // Chart 1 — Platform Growth
    if (document.getElementById("growthChart")){
      charts.growth = new Chart(document.getElementById("growthChart"), {
        type:"line",
        data:{ labels:buckets, datasets:[
          { label:"Total Users",    data:countByBucket(u,"joined",buckets),
            borderColor:"#6f42c1", backgroundColor:"rgba(111,66,193,.15)", tension:.35, fill:true },
          { label:"Total Listings", data:countByBucket(l,"createdAt",buckets),
            borderColor:"#0d6efd", backgroundColor:"rgba(13,110,253,.15)", tension:.35, fill:true },
          { label:"Total Bookings", data:countByBucket(b,"start",buckets),
            borderColor:"#198754", backgroundColor:"rgba(25,135,84,.15)", tension:.35, fill:true }
        ]},
        options:commonOpts()
      });
    }

    // Chart 2 — Revenue & Business Performance
    if (document.getElementById("revenueChart")){
      var bookingSeries = sumByBucket(bookingTx,"date","amount",buckets);
      var adSeries      = sumByBucket(ads,"date","amount",buckets);
      var totalSeries   = bookingSeries.map(function(v,i){ return v + adSeries[i]; });
      charts.rev = new Chart(document.getElementById("revenueChart"), {
        type:"bar",
        data:{ labels:buckets, datasets:[
          { type:"line", label:"Total Revenue",         data:totalSeries,
            borderColor:"#0d6efd", backgroundColor:"rgba(13,110,253,.2)", tension:.35, fill:false },
          { label:"Booking Revenue",        data:bookingSeries,
            backgroundColor:"rgba(25,135,84,.8)",  borderColor:"#198754" },
          { label:"Advertisement Revenue",  data:adSeries,
            backgroundColor:"rgba(255,193,7,.85)", borderColor:"#ffc107" }
        ]},
        options:commonOpts()
      });
    }
  }

  function renderCharts(){
    destroyCharts();
    var buckets = autoBuckets();
    if (ROLE === "superadmin") renderSuperAdminCharts(buckets);
    else renderAdminCharts(buckets);
  }

  // ---------- filter UI ----------
  function applyPreset(preset){
    var t = new Date(), y = t.getFullYear(), m = t.getMonth();
    switch (preset){
      case "today":      FILTER.from = today();             FILTER.to = today(); break;
      case "7":          FILTER.from = daysAgo(6);          FILTER.to = today(); break;
      case "30":         FILTER.from = daysAgo(29);         FILTER.to = today(); break;
      case "this-month": FILTER.from = firstOfMonth(y,m);   FILTER.to = lastOfMonth(y,m);   break;
      case "last-month": FILTER.from = firstOfMonth(y,m-1); FILTER.to = lastOfMonth(y,m-1); break;
      case "this-year":  FILTER.from = y+"-01-01";          FILTER.to = y+"-12-31";         break;
      case "all":        FILTER.from = null;                FILTER.to = null;               break;
    }
    var fromEl=document.getElementById("flFrom"), toEl=document.getElementById("flTo");
    if (fromEl) fromEl.value = FILTER.from || "";
    if (toEl)   toEl.value   = FILTER.to   || "";
  }

  // Refresh summary cards and charts with the current filter state.
  function refresh(){
    renderSummary();
    renderCharts();
  }

  // Wire preset and date inputs so changes refresh charts immediately.
  function wireFilters(){
    var apply = document.getElementById("flApply");
    var reset = document.getElementById("flReset");
    var preset= document.getElementById("flPreset");
    var from  = document.getElementById("flFrom");
    var to    = document.getElementById("flTo");
    function applyDates(){
      FILTER.from = (from && from.value) || null;
      FILTER.to   = (to   && to.value)   || null;
      if (preset) preset.value = "all";
      refresh();
    }
    if (apply) apply.addEventListener("click", applyDates);
    if (reset) reset.addEventListener("click", function(){
      FILTER.from = null; FILTER.to = null;
      if (from) from.value=""; if (to) to.value=""; if (preset) preset.value="all";
      refresh();
    });
    if (preset) preset.addEventListener("change", function(){
      applyPreset(preset.value); refresh();
    });
    if (from) from.addEventListener("change", applyDates);
    if (to)   to.addEventListener("change", applyDates);
  }

  // Load all dashboard JSON files. Missing files resolve to [] so analytics
  // can still render with partial data.
  function loadAll(){
    function safe(n){ return cwData(n).catch(function(){ return []; }); }
    return Promise.all([
      safe("users.json"), safe("listings.json"), safe("bookings.json"),
      safe("transactions.json"), safe("advertisements.json"),
      safe("messages.json"), safe("categories.json")
    ]).then(function(r){
      STATE.users=r[0]; STATE.listings=r[1]; STATE.bookings=r[2];
      STATE.tx=r[3];    STATE.ads=r[4];      STATE.msgs=r[5]; STATE.cats=r[6];
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    loadAll().then(function(){
      wireFilters();
      refresh();
      window.addEventListener("storage", function(e){
        if (e.key === "cw_data_changed") loadAll().then(refresh);
      });
    });
  });
})();
