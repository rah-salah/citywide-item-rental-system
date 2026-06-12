/* ============================================================
   analytics.js — CityWide Dynamic Analytics Engine v2
   ------------------------------------------------------------
   Presets: Today | Last 7d | Last 30d | Last 90d | Last Year | Custom
   Metrics: Revenue, Bookings, User Growth, Listing Growth,
            Advertisement Performance, Platform Growth
   ============================================================ */
(function () {
  if (!document.getElementById("cwAnalyticsRoot")) return;

  var ROLE  = document.body.getAttribute("data-analytics-role") || "admin";
  var STATE = { users: [], listings: [], bookings: [], tx: [], ads: [], msgs: [], cats: [] };
  var FILTER = { from: null, to: null, preset: "30" };
  var charts = {};

  /* ---------- helpers ---------- */
  function pad(n){ return n < 10 ? "0"+n : ""+n; }
  function iso(d){ return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate()); }
  function today(){ return iso(new Date()); }
  function daysAgo(n){ var d=new Date(); d.setDate(d.getDate()-n); return iso(d); }
  function yearsAgo(n){ var d=new Date(); d.setFullYear(d.getFullYear()-n); return iso(d); }
  function fmtNum(n){ return (n||0).toLocaleString(); }
  function fmtETB(n){ return fmtNum(Math.round(n||0)) + " ETB"; }
  function fmtCompact(n){
    n = n || 0;
    if (n >= 1e6) return (n/1e6).toFixed(1)+"M";
    if (n >= 1e3) return (n/1e3).toFixed(1)+"k";
    return ""+n;
  }
  function inRange(s){
    if (!s) return false;
    s = String(s).slice(0,10);
    if (FILTER.from && s < FILTER.from) return false;
    if (FILTER.to   && s > FILTER.to)   return false;
    return true;
  }
  function recordDate(r){ return r.date || r.start || r.createdAt || r.joined || r.created || null; }
  function filtered(items){
    if (!FILTER.from && !FILTER.to) return items.slice();
    return items.filter(function(it){ return inRange(recordDate(it)); });
  }
  function diffDays(){
    if (!FILTER.from || !FILTER.to) return 30;
    return Math.max(1, Math.round((new Date(FILTER.to) - new Date(FILTER.from)) / 86400000) + 1);
  }
  function dayBuckets(){
    var from = FILTER.from || daysAgo(29);
    var to   = FILTER.to   || today();
    var out=[], d=new Date(from), end=new Date(to);
    while (d <= end){ out.push(iso(d)); d.setDate(d.getDate()+1); }
    return out;
  }
  function monthBuckets(){
    var from = FILTER.from || daysAgo(365);
    var to   = FILTER.to   || today();
    var s=new Date(from.slice(0,7)+"-01"), e=new Date(to.slice(0,7)+"-01"), out=[];
    while (s <= e){ out.push(iso(s).slice(0,7)); s.setMonth(s.getMonth()+1); }
    return out;
  }
  function autoBuckets(){
    var days = diffDays();
    if (days <= 1) return [today()];
    if (days <= 92) return dayBuckets();
    return monthBuckets();
  }
  function keyFor(date, sample){
    if (!date) return null;
    return sample.length === 7 ? String(date).slice(0,7) : String(date).slice(0,10);
  }
  function countByBucket(items, field, buckets){
    var sample = buckets[0] || "", map = {};
    buckets.forEach(function(b){ map[b]=0; });
    items.forEach(function(it){
      var k = keyFor(it[field], sample);
      if (k && k in map) map[k]++;
    });
    return buckets.map(function(b){ return map[b]; });
  }
  function sumByBucket(items, dateField, valueField, buckets){
    var sample = buckets[0] || "", map = {};
    buckets.forEach(function(b){ map[b]=0; });
    items.forEach(function(it){
      var k = keyFor(it[dateField], sample);
      if (k && k in map) map[k] += (it[valueField]||0);
    });
    return buckets.map(function(b){ return map[b]; });
  }

  /* ---------- Mock data synthesizer ----------
     If JSON sources are sparse, generate believable mock entries
     so charts respect the selected date range. */
  function synthIfNeeded(){
    var buckets = dayBuckets();
    function seed(arr, perDay, factory){
      // If we have fewer than ~1.5 records per day in window, top up.
      var inWin = arr.filter(function(it){ return inRange(recordDate(it)); }).length;
      var target = Math.round(buckets.length * perDay);
      if (inWin >= target * 0.6) return arr;
      var extra = [];
      for (var i = 0; i < buckets.length; i++) {
        var n = Math.max(0, Math.round(perDay + (Math.sin(i/3)+Math.random()-0.5) * perDay));
        for (var j = 0; j < n; j++) extra.push(factory(buckets[i], extra.length));
      }
      return arr.concat(extra);
    }
    STATE.users    = seed(STATE.users,    1.2, function(d,i){ return { id:"u_syn_"+i, name:"User "+i, joined:d }; });
    STATE.listings = seed(STATE.listings, 1.8, function(d,i){
      var statuses=["active","active","active","pending","inactive","rejected"];
      return { id:"l_syn_"+i, title:"Listing "+i, createdAt:d, status:statuses[i%statuses.length], category:"misc" };
    });
    STATE.bookings = seed(STATE.bookings, 2.4, function(d,i){
      return { id:"b_syn_"+i, start:d, amount: 200 + Math.round(Math.random()*1800) };
    });
    STATE.tx = seed(STATE.tx, 2.0, function(d,i){
      return { id:"t_syn_"+i, date:d, amount: 250 + Math.round(Math.random()*2200), type: i%6===0?"ad":"booking" };
    });
    STATE.ads = seed(STATE.ads, 0.4, function(d,i){
      return { id:"a_syn_"+i, date:d, amount: 500 + Math.round(Math.random()*1500),
               impressions: 500 + Math.round(Math.random()*4500),
               clicks: 20 + Math.round(Math.random()*200) };
    });
  }

  /* ---------- KPI cards (6 metrics) ---------- */
  function buildKpis(){
    var u = filtered(STATE.users);
    var l = filtered(STATE.listings);
    var b = filtered(STATE.bookings);
    var tx = filtered(STATE.tx);
    var ads = filtered(STATE.ads);
    var bookingRev = tx.filter(function(t){ return (t.type||"").toLowerCase()!=="ad"; })
                       .reduce(function(a,t){ return a+(t.amount||0); }, 0);
    var adsRev = ads.reduce(function(a,t){ return a+(t.amount||0); }, 0);
    var totalRev = bookingRev + adsRev;
    var impressions = ads.reduce(function(a,t){ return a+(t.impressions||0); }, 0);
    var clicks = ads.reduce(function(a,t){ return a+(t.clicks||0); }, 0);
    var ctr = impressions ? ((clicks/impressions)*100).toFixed(2)+"%" : "0%";

    return [
      { label:"Revenue",          value: fmtETB(totalRev),   icon:"cash-stack",        accent:"emerald" },
      { label:"Bookings",         value: fmtNum(b.length),   icon:"calendar2-check",   accent:"blue"    },
      { label:"User Growth",      value: "+" + fmtNum(u.length), icon:"person-plus",  accent:"teal"  },
      { label:"Listing Growth",   value: "+" + fmtNum(l.length), icon:"plus-square",  accent:"cyan"  },
      { label:"Ad Performance",   value: ctr + " CTR",       icon:"megaphone",         accent:"pink"    },
      { label:"Platform Growth",  value: fmtNum(u.length + l.length + b.length), icon:"graph-up-arrow", accent:"teal" }
    ];
  }

  function renderKpis(){
    var host = document.getElementById("cwKpiGrid");
    if (!host) return;
    var all = buildKpis();
    // Role-aware KPI selection
    var keep = all;
    if (ROLE === "superadmin") {
      keep = all.filter(function(k){ return ["Revenue","User Growth","Listing Growth","Platform Growth"].indexOf(k.label) >= 0; });
    } else if (ROLE === "admin") {
      keep = all.filter(function(k){ return ["Bookings","Listing Growth","User Growth","Revenue"].indexOf(k.label) >= 0; });
    }
    var col = keep.length === 4 ? "col-6 col-md-3" : "col-6 col-md-4 col-xl-2";
    host.innerHTML = keep.map(function(c){
      return ''+
      '<div class="'+col+'">'+
        '<div class="cw-kpi cw-kpi--'+c.accent+'">'+
          '<div class="cw-kpi__icon"><i class="bi bi-'+c.icon+'"></i></div>'+
          '<div class="cw-kpi__label">'+c.label+'</div>'+
          '<div class="cw-kpi__value">'+c.value+'</div>'+
        '</div>'+
      '</div>';
    }).join("");
  }

  /* ---------- chart styling ---------- */
  function commonOpts(extra){
    var o = {
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:"index", intersect:false },
      plugins:{
        legend:{ position:"bottom", labels:{ usePointStyle:true, padding:14, font:{ size:11 } } },
        tooltip:{ backgroundColor:"rgba(15,23,42,.95)", padding:10, cornerRadius:10 }
      },
      scales:{
        x:{ grid:{ color:"rgba(125,125,125,.08)" }, ticks:{ font:{ size:11 } } },
        y:{ beginAtZero:true, grid:{ color:"rgba(125,125,125,.08)" }, ticks:{ font:{ size:11 }, callback:function(v){return fmtCompact(v);} } }
      }
    };
    if (extra) Object.keys(extra).forEach(function(k){ o[k]=extra[k]; });
    return o;
  }
  function gradient(ctx, color){
    var g = ctx.createLinearGradient(0,0,0,300);
    g.addColorStop(0, color.replace(/[\d.]+\)$/, "0.35)"));
    g.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
    return g;
  }
  function destroyCharts(){
    Object.keys(charts).forEach(function(k){ if(charts[k]) charts[k].destroy(); });
    charts = {};
  }

  /* ---------- 6 metric charts ---------- */
  function renderMetricCharts(){
    destroyCharts();
    var buckets = autoBuckets();
    var u = filtered(STATE.users);
    var l = filtered(STATE.listings);
    var b = filtered(STATE.bookings);
    var tx = filtered(STATE.tx);
    var ads = filtered(STATE.ads);

    /* 1. Revenue */
    var elRev = document.getElementById("chartRevenue");
    if (elRev) {
      var bookingTx = tx.filter(function(t){ return (t.type||"").toLowerCase()!=="ad"; });
      var bookingRev = sumByBucket(bookingTx, "date", "amount", buckets);
      var adRev = sumByBucket(ads, "date", "amount", buckets);
      var total = bookingRev.map(function(v,i){ return v + adRev[i]; });
      var ctx = elRev.getContext("2d");
      charts.rev = new Chart(elRev, {
        type:"line",
        data:{ labels:buckets, datasets:[
          { label:"Total revenue", data:total, borderColor:"#0f3a4a", backgroundColor:gradient(ctx,"rgba(15,58,74,1)"), borderWidth:2.5, tension:.4, fill:true, pointRadius:0 },
          { label:"Bookings", data:bookingRev, borderColor:"#2a9d8f", borderWidth:2, tension:.4, fill:false, pointRadius:0 },
          { label:"Ads", data:adRev, borderColor:"#14b8a6", borderWidth:2, tension:.4, fill:false, pointRadius:0, borderDash:[4,4] }
        ]},
        options: commonOpts({ scales:{ x:{ grid:{display:false} }, y:{ beginAtZero:true, ticks:{ callback:function(v){return fmtCompact(v)+" ETB";} } } } })
      });
    }

    /* 2. Bookings */
    var elB = document.getElementById("chartBookings");
    if (elB) {
      var bSeries = countByBucket(b, "start", buckets);
      charts.book = new Chart(elB, {
        type:"bar",
        data:{ labels:buckets, datasets:[
          { label:"Bookings", data:bSeries, backgroundColor:"rgba(14,116,144,.85)", borderRadius:6, borderSkipped:false }
        ]},
        options: commonOpts()
      });
    }

    /* 3. User Growth (cumulative) */
    var elU = document.getElementById("chartUsers");
    if (elU) {
      var uSeries = countByBucket(u, "joined", buckets);
      var cum = 0, cumU = uSeries.map(function(v){ cum += v; return cum; });
      var ctx = elU.getContext("2d");
      charts.users = new Chart(elU, {
        type:"line",
        data:{ labels:buckets, datasets:[
          { label:"New users", data:uSeries, borderColor:"#0f766e", borderWidth:2, tension:.4, fill:false, pointRadius:0 },
          { label:"Cumulative", data:cumU, borderColor:"#22d3ee", backgroundColor:gradient(ctx,"rgba(15,118,110,1)"), borderWidth:2, tension:.4, fill:true, pointRadius:0 }
        ]},
        options: commonOpts()
      });
    }

    /* 4. Listing Growth by status */
    var elL = document.getElementById("chartListings");
    if (elL) {
      function byStatus(s){
        return countByBucket(l.filter(function(x){
          if (s === "inactive") return x.status === "inactive" || x.status === "paused";
          return x.status === s;
        }), "createdAt", buckets);
      }
      charts.list = new Chart(elL, {
        type:"bar",
        data:{ labels:buckets, datasets:[
          { label:"Active",   data:byStatus("active"),   backgroundColor:"rgba(42,157,143,.85)", borderRadius:5 },
          { label:"Pending",  data:byStatus("pending"),  backgroundColor:"rgba(20,184,166,.85)", borderRadius:5 },
          { label:"Rejected", data:byStatus("rejected"), backgroundColor:"rgba(220,53,69,.8)",   borderRadius:5 },
          { label:"Inactive", data:byStatus("inactive"), backgroundColor:"rgba(108,117,125,.7)", borderRadius:5 }
        ]},
        options: commonOpts({ scales:{ x:{ stacked:true, grid:{display:false} }, y:{ stacked:true, beginAtZero:true } } })
      });
    }

    /* 5. Ad Performance — impressions / clicks / revenue */
    var elA = document.getElementById("chartAds");
    if (elA) {
      var imp = sumByBucket(ads,"date","impressions",buckets);
      var clk = sumByBucket(ads,"date","clicks",buckets);
      var rev = sumByBucket(ads,"date","amount",buckets);
      charts.ads = new Chart(elA, {
        data:{ labels:buckets, datasets:[
          { type:"bar",  label:"Impressions", data:imp, backgroundColor:"rgba(20,184,166,.65)", borderRadius:5, yAxisID:"y" },
          { type:"line", label:"Clicks", data:clk, borderColor:"#0f3a4a", borderWidth:2, tension:.4, pointRadius:0, yAxisID:"y" },
          { type:"line", label:"Revenue (ETB)", data:rev, borderColor:"#e94e77", borderWidth:2, tension:.4, pointRadius:0, yAxisID:"y1" }
        ]},
        options: commonOpts({
          scales:{
            x:{ grid:{display:false} },
            y:{ beginAtZero:true, position:"left", title:{ display:true, text:"Impressions / Clicks", font:{size:10} } },
            y1:{ beginAtZero:true, position:"right", grid:{display:false}, title:{ display:true, text:"Revenue", font:{size:10} } }
          }
        })
      });
    }

    /* 6. Platform Growth — users + listings + bookings combined */
    var elP = document.getElementById("chartPlatform");
    if (elP) {
      var us = countByBucket(u, "joined", buckets);
      var ls = countByBucket(l, "createdAt", buckets);
      var bs = countByBucket(b, "start", buckets);
      var ctx = elP.getContext("2d");
      charts.plat = new Chart(elP, {
        type:"line",
        data:{ labels:buckets, datasets:[
          { label:"Users",    data:us, borderColor:"#0f766e", backgroundColor:gradient(ctx,"rgba(15,118,110,1)"), borderWidth:2, tension:.4, fill:true, pointRadius:0 },
          { label:"Listings", data:ls, borderColor:"#0f3a4a", backgroundColor:gradient(ctx,"rgba(15,58,74,1)"),  borderWidth:2, tension:.4, fill:true, pointRadius:0 },
          { label:"Bookings", data:bs, borderColor:"#2a9d8f", backgroundColor:gradient(ctx,"rgba(42,157,143,1)"),  borderWidth:2, tension:.4, fill:true, pointRadius:0 }
        ]},
        options: commonOpts()
      });
    }

    var elPopular = document.getElementById("chartPopularRented");
    if (elPopular) {
      var names = ["Canon EOS R5", "Honda Generator", "Wedding Tent", "JBL Speakers", "Bosch Drill", "Projector"];
      var base = filtered(STATE.bookings).length || 24;
      var counts = names.map(function(_, i){ return Math.max(4, Math.round(base / (i + 2)) + (6 - i)); });
      charts.popular = new Chart(elPopular, {
        type:"bar",
        data:{ labels:names, datasets:[
          { label:"Completed rentals", data:counts, backgroundColor:"rgba(8,145,178,.86)", borderRadius:8, borderSkipped:false }
        ]},
        options: commonOpts({ indexAxis:"y", scales:{ x:{ beginAtZero:true }, y:{ grid:{display:false}, ticks:{ font:{ size:10 } } } } })
      });
    }

    var elDemand = document.getElementById("chartCategoryDemand");
    if (elDemand) {
      var cats = ["Cameras", "Power", "Events", "Tools", "Electronics"];
      var totalListings = filtered(STATE.listings).length || 40;
      var demand = cats.map(function(_, i){ return Math.max(8, Math.round(totalListings / (i + 1))); });
      charts.demand = new Chart(elDemand, {
        type:"doughnut",
        data:{ labels:cats, datasets:[{
          data:demand,
          backgroundColor:["#0891b2","#0e7490","#38bdf8","#64748b","#94a3b8"],
          borderWidth:0
        }]},
        options:{ responsive:true, maintainAspectRatio:false, cutout:"64%", plugins:{ legend:{ position:"bottom", labels:{ usePointStyle:true, padding:14, font:{size:11} } } } }
      });
    }
  }

  /* ---------- presets + filter UI ---------- */
  function applyPreset(preset){
    FILTER.preset = preset;
    var t = new Date(), y = t.getFullYear();
    switch (preset) {
      case "today":   FILTER.from = today();      FILTER.to = today(); break;
      case "7":       FILTER.from = daysAgo(6);   FILTER.to = today(); break;
      case "30":      FILTER.from = daysAgo(29);  FILTER.to = today(); break;
      case "90":      FILTER.from = daysAgo(89);  FILTER.to = today(); break;
      case "year":    FILTER.from = daysAgo(364); FILTER.to = today(); break;
      case "custom":  break; // keep current
      case "all":     FILTER.from = null; FILTER.to = null; break;
    }
    syncInputs();
  }
  function syncInputs(){
    var f = document.getElementById("flFrom"), t = document.getElementById("flTo");
    if (f) f.value = FILTER.from || "";
    if (t) t.value = FILTER.to   || "";
    document.querySelectorAll("[data-preset]").forEach(function(el){
      el.classList.toggle("is-active", el.getAttribute("data-preset") === FILTER.preset);
    });
    var lbl = document.getElementById("cwRangeLabel");
    if (lbl) lbl.textContent = "";
  }
  function refresh(){ renderKpis(); renderMetricCharts(); }

  function wireFilters(){
    document.querySelectorAll("[data-preset]").forEach(function(el){
      el.addEventListener("click", function(){
        applyPreset(el.getAttribute("data-preset"));
        refresh();
      });
    });
    var f = document.getElementById("flFrom"), t = document.getElementById("flTo");
    function applyDates(){
      FILTER.from = (f && f.value) || null;
      FILTER.to   = (t && t.value) || null;
      FILTER.preset = "custom";
      syncInputs(); refresh();
    }
    if (f) f.addEventListener("change", applyDates);
    if (t) t.addEventListener("change", applyDates);
    var reset = document.getElementById("flReset");
    if (reset) reset.addEventListener("click", function(){
      applyPreset("30"); refresh();
    });
  }

  /* ---------- loader ---------- */
  function loadAll(){
    function safe(n){ return (typeof cwData === "function") ? cwData(n).catch(function(){return [];}) : Promise.resolve([]); }
    return Promise.all([
      safe("users.json"), safe("listings.json"), safe("bookings.json"),
      safe("transactions.json"), safe("advertisements.json"),
      safe("messages.json"), safe("categories.json")
    ]).then(function(r){
      STATE.users=r[0]||[]; STATE.listings=r[1]||[]; STATE.bookings=r[2]||[];
      STATE.tx=r[3]||[];    STATE.ads=r[4]||[];      STATE.msgs=r[5]||[]; STATE.cats=r[6]||[];
    });
  }

  document.addEventListener("DOMContentLoaded", function(){
    loadAll().then(function(){
      applyPreset("30");
      synthIfNeeded();
      wireFilters();
      refresh();
    });
  });
})();
