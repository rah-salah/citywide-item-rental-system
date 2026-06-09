/* Citywide Jigjiga — additional fixes (appended)
   - Expanded Somali translations covering all dashboards, chatbot, settings, analytics, profile.
   - Dashboard nav cleanup: hides the top public navbar on dashboard pages (sidebar only).
   - Removes duplicate language switchers, duplicate mobile top nav.
   - Hides Sign In links when a user is logged in.
   - Sets the avatar and shown name from the logged-in user (initials computed dynamically).
   - Re-applies translations on dynamic DOM changes and on EN<->SO switching. */
(function(){
  if (window.__cwFixesInit) return;
  window.__cwFixesInit = true;

  // ---------- Extra dictionary (EN -> SO) ----------
  var EXTRA = {
    // Generic / common
    "Save":"Kaydi","Cancel":"Jooji","Edit":"Wax ka beddel","Delete":"Tirtir","Update":"Cusboonaysii",
    "Close":"Xidh","Open":"Fur","Yes":"Haa","No":"Maya","Submit":"Gudbi","Send":"Dir","Reply":"Ka jawaab",
    "Loading...":"Waa la soo dejinayaa...","Please wait":"Fadlan sug","Confirm":"Xaqiiji","Apply":"Adeegso",
    "Filter":"Sift","Sort":"Habee","Search...":"Raadi...","Type a message...":"Qor fariin...",
    "Username":"Magaca isticmaalaha","Password":"Furaha sirta ah","Email":"Iimaylka","Phone":"Telefoonka",
    "Address":"Cinwaanka","City":"Magaalada","Country":"Wadanka","Date":"Taariikhda","Time":"Waqtiga",
    "Name":"Magaca","Role":"Doorka","Action":"Ficil","Actions":"Ficillada","Details":"Faahfaahin",
    "Today":"Maanta","Yesterday":"Shalay","This Week":"Toddobaadkan","This Month":"Bishan","All":"Dhammaan",
    "Approved":"La ansixiyay","Rejected":"La diiday","Active":"Firfircoon","Inactive":"Aan firfircoonayn",
    "Banned":"La mamnuucay","Suspended":"La hakiyay","Online":"Khadka tooska","Offline":"Khadka ka maqan",
    "View Details":"Eeg Faahfaahinta","View":"Eeg","Back":"Dib u noqo","Next":"Xiga","Previous":"Hore",
    "Add":"Ku dar","Remove":"Ka saar","Refresh":"Cusboonaysii","Logout":"Ka Bax","Sign Out":"Ka Bax",
    "Sign In":"Soo Gal","Sign Up":"Diiwaan Geli","Continue":"Sii wad","Get Started":"Bilow",
    "Welcome":"Soo dhowow","Welcome back":"Soo dhowow mar kale","Hello":"Salaan",
    "Notifications":"Ogeysiisyo","No notifications":"Ogeysiis ma jirto","Mark all as read":"Calaamadi dhammaan inay akhriyeen",

    // Navigation / sidebar
    "Home":"Guriga","Browse":"Eeg","About":"Ku Saabsan","Contact":"Nala Soo Xiriir",
    "Dashboard":"Dashboor","Profile":"Akoonkayga","Settings":"Dejimaha","Messages":"Fariimaha",
    "My Bookings":"Dalabyadayda","My Listings":"Liisaskayga","Wishlist":"Liiska Rabitaanka",
    "Earnings":"Dakhliga","Bookings":"Buugaagta","Rental History":"Taariikhda Kirada",
    "Categories":"Qaybaha","Reports":"Warbixinnada","Transactions":"Macaamilada",
    "Analytics":"Falanqayn","Users":"Isticmaalayaasha","Admins":"Maamulayaasha",
    "All Users":"Dhammaan Isticmaalayaasha","Manage Users":"Maamul Isticmaalayaasha",
    "Manage Listings":"Maamul Liisaska","Manage Admins":"Maamul Maamulayaasha",
    "Audit Logs":"Diiwaanka Hawlaha","Site Settings":"Dejinta Goobta","Role Requests":"Codsiyada Doorka",
    "Listings":"Liisaska","Listing":"Liis","Overview":"Guudmar",
    "Dashboard Overview":"Guudmarka Dashboorka","Admin Dashboard":"Dashboorka Maamulaha",
    "Super Admin Dashboard":"Dashboorka Maamulaha Sare","User Dashboard":"Dashboorka Isticmaalaha",
    "Owner Dashboard":"Dashboorka Mulkiilaha","Renter Dashboard":"Dashboorka Kiraystaha",

    // Profile / Settings
    "Personal details":"Faahfaahinta qofka","Personal Information":"Macluumaadka qofka",
    "Full name":"Magaca buuxa","Full Name":"Magaca Buuxa","First Name":"Magaca Hore","Last Name":"Magaca Dambe",
    "Email address":"Cinwaanka emailka","Phone number":"Lambarka telefoonka",
    "Neighbourhood":"Xaafadda","About you":"Adiga kugu saabsan","Save changes":"Kaydi isbeddelada",
    "Change password":"Beddel furaha sirta ah","Current password":"Furaha hadda jira",
    "New password":"Furaha cusub","Confirm password":"Xaqiiji furaha sirta ah",
    "Notifications preferences":"Doorashooyinka ogeysiisyada","Email notifications":"Ogeysiisyada emailka",
    "SMS notifications":"Ogeysiisyada SMS","Push notifications":"Ogeysiisyada riixista",
    "Language":"Luqad","Appearance":"Muuqaal","Dark Mode":"Hab Madow","Light Mode":"Hab Iftiin",
    "Account":"Akoonka","Security":"Amniga","Privacy":"Asturnaanta","Preferences":"Doorashooyinka",
    "Upload a clear profile picture.":"Soo geli sawir cad oo akoonka ah.",
    "Profile updated.":"Akoonka waa la cusboonaysiiyay.",

    // Reviews
    "Rate This Item":"Qiimee Alaabtan","Star Rating":"Qiimaynta Xiddigaha",
    "Review Comment":"Faallada Qiimaynta","Submit Review":"Gudbi Qiimaynta",
    "Average Rating":"Celceliska Qiimaynta","Reviews":"Faallooyin","Review":"Faallo",
    "Verified Renter":"Kirayste La Xaqiijiyay","Verified":"La Xaqiijiyay",
    "No reviews yet. Be the first to review this item.":"Weli faallo ma jirto. Noqo qofka ugu horreeya ee qiimeeya alaabtan.",
    "Share your rental experience":"La wadaag waayo-aragnimadaada kirada",
    "total reviews":"faallooyin guud",

    // Dashboard widgets / charts / analytics
    "Total Users":"Wadarta Isticmaalayaasha","Total Listings":"Wadarta Liisaska",
    "Total Bookings":"Wadarta Dalabyada","Total Revenue":"Wadarta Dakhliga",
    "Active Listings":"Liisaska Firfircoon","Pending Listings":"Liisaska Sugaya",
    "Pending Approvals":"Ansixinta Sugaya","Open Disputes":"Murankaaga Furan",
    "Recent Activity":"Hawlihii Dhowaa","Recent Transactions":"Macaamilkii Dhowaa",
    "Top Categories":"Qaybaha Ugu Sarreeya","Top Listings":"Liisaska Ugu Sarreeya",
    "Top Owners":"Mulkiilayaasha Ugu Sarreeya","New Users":"Isticmaalayaal Cusub",
    "Growth":"Koritaan","Conversion":"Beddelaad","Daily":"Maalinle","Weekly":"Toddobaadle",
    "Monthly":"Bille","Yearly":"Sannadle","Revenue":"Dakhli","Bookings by category":"Dalabyada qaybaha",
    "Verified members":"Xubno xaqiijisan","Active listings":"Liisas firfircoon",
    "Jigjiga neighbourhoods":"Xaafadaha Jigjiga","Average rating":"Celceliska qiimaynta",

    // Listings / Items
    "Item":"Alaab","Items":"Alaabta","Brand":"Astaanta","Model":"Nooca",
    "Daily rental":"Kireynta maalinta","Weekly rental":"Kireynta toddobaadka",
    "Security deposit":"Dhigaalka damaanadda","Condition":"Xaaladda",
    "Availability":"Helitaan","Available":"La heli karo","Unavailable":"Lama heli karo",
    "Price":"Qiimaha","Quantity":"Tirada","Description":"Sharaxaad",
    "Owner":"Mulkiilaha","Owner Information":"Macluumaadka Mulkiilaha",
    "Rental Conditions":"Shuruudaha Kirada","Rental requirements":"Shuruudaha kireynta",
    "Request to Rent":"Codso Kiraysi","Request to Book":"Codso Buug",
    "Contact Owner":"La Xiriir Mulkiilaha","Rental Guarantee":"Dammaanadda Kirada",
    "Add Listing":"Ku dar Liis","New listing":"Liis cusub","Edit Listing":"Wax ka beddel Liiska",

    // Bookings / status
    "Booking":"Dalab","Confirmed":"La xaqiijiyay","Pending":"Sugaya","Completed":"Dhammaystiran",
    "Cancelled":"La joojiyay","Refunded":"La celiyay","In Progress":"Socda","Return by":"Soo celi",
    "Status":"Xaalad","Track":"Raac","Items you are currently renting from other people.":"Alaabta aad hadda ka kiraysatay dadka kale.",
    "Past items you rented and payments made.":"Alaabtii hore ee aad kiraysatay iyo lacagihii la bixiyay.",

    // Chatbot
    "Chat with us":"Nala sheekayso","Need help?":"Ma u baahan tahay caawimaad?",
    "Ask a question":"Su'aal weydii","Send message":"Dir fariinta",
    "Online — usually replies in minutes":"Khadka — caadi ahaan wuu jawaabaa daqiiqado gudahood",
    "Hi! How can we help?":"Salaan! Sideen ku caawin karnaa?",
    "Type your message":"Qor fariintaada",

    // Admin
    "Approve":"Ansixi","Reject":"Diid","Suspend":"Hakii","Ban":"Mamnuuc","Restore":"Soo celi",
    "Promote":"Dalaci","Demote":"Hoos u dhig","Assign role":"U xil saar dor",
    "Audit log":"Diiwaanka hawlaha","Manage categories":"Maamul qaybaha",
    "Add category":"Ku dar qayb","Edit category":"Wax ka beddel qaybta",

    // Misc UI
    "More":"Ka badan","Less":"Ka yar","Show more":"Muuji wax dheeraad ah","Show less":"Muuji wax yar",
    "Menu":"Menu","Open menu":"Fur menuga","Close menu":"Xidh menuga",
    "List":"Liis","Grid":"Shabag","Map":"Khariidad",
    "From":"Ka","To":"Ilaa","Total":"Wadar","Subtotal":"Wadar yar","Fee":"Kharash","Discount":"Qiimo dhimis",
    "Payment":"Lacag bixin","Method":"Hab","Card":"Kaadhka","Cash":"Lacag caddaan ah",
    "Required":"Loo baahan yahay","Optional":"Ikhtiyaari","Select":"Dooro","Choose file":"Dooro fayl"
  };

  function lang(){ try { return localStorage.getItem("cw_lang") || "en"; } catch(e){ return "en"; } }

  function originalText(node){
    if (!node.__cwFixOrig) node.__cwFixOrig = node.nodeValue;
    return node.__cwFixOrig;
  }
  function translateTextNode(node, target){
    var orig = originalText(node);
    if (target === "en") { node.nodeValue = orig; return; }
    var trimmed = orig.trim();
    if (!trimmed) return;
    var t = EXTRA[trimmed];
    if (t) node.nodeValue = orig.replace(trimmed, t);
  }
  function walkAndTranslate(root, target){
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:function(n){
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA)$/i.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest("[data-cw-no-translate]")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var n; while ((n = walker.nextNode())) translateTextNode(n, target);
    // Placeholders & titles
    root.querySelectorAll && root.querySelectorAll("[placeholder]").forEach(function(el){
      if (!el.__cwFixPh) el.__cwFixPh = el.getAttribute("placeholder");
      var orig = el.__cwFixPh, trimmed = (orig||"").trim();
      el.setAttribute("placeholder", target==="en" ? orig : (EXTRA[trimmed] ? orig.replace(trimmed, EXTRA[trimmed]) : orig));
    });
    root.querySelectorAll && root.querySelectorAll("[title]").forEach(function(el){
      if (!el.__cwFixTi) el.__cwFixTi = el.getAttribute("title");
      var orig = el.__cwFixTi, trimmed = (orig||"").trim();
      el.setAttribute("title", target==="en" ? orig : (EXTRA[trimmed] ? orig.replace(trimmed, EXTRA[trimmed]) : orig));
    });
  }

  function applyLanguageExtras(){ walkAndTranslate(document.body, lang()); }

  // ---------- User / avatar ----------
  function getUser(){
    try { return JSON.parse(sessionStorage.getItem("cw_user") || localStorage.getItem("cw_user") || "null"); }
    catch(e){ return null; }
  }
  function initials(name){
    if (!name) return "G";
    var p = name.trim().split(/\s+/);
    if (p.length === 1) return p[0].charAt(0).toUpperCase();
    return (p[0].charAt(0) + p[p.length-1].charAt(0)).toUpperCase();
  }
  function applyUser(){
    var u = getUser();
    var name = (u && u.name) ? u.name : "";
    var ini = initials(name);
    document.querySelectorAll(".cw-avatar, [data-user-initial]").forEach(function(el){
      // Only replace if it currently shows a generic initial or is the avatar bubble
      var txt = (el.textContent || "").trim();
      if (el.matches(".cw-avatar") || txt.length <= 2 || /^(User|Guest)$/i.test(txt)) {
        el.textContent = ini;
      }
    });
    if (name) {
      document.querySelectorAll("[data-user-name], .cw-user-name, .cw-admin-profile-name").forEach(function(el){
        el.textContent = name;
      });
      // Generic "User" / "Guest" labels in profile dropdowns
      document.querySelectorAll(".cw-navbar .dropdown-toggle, .cw-profile-name").forEach(function(el){
        var t = (el.textContent || "").trim();
        if (/^(User|Guest|Member)$/i.test(t)) el.textContent = name;
      });
    }
  }

  // ---------- Hide Sign In when logged in ----------
  function hideSignInIfLoggedIn(){
    if (!getUser()) return;
    document.querySelectorAll('a[href$="login.html"], a[href$="register.html"]').forEach(function(a){
      if (/sign\s*in|log\s*in|register/i.test(a.textContent || "")) {
        var li = a.closest("li");
        (li || a).style.display = "none";
      }
    });
  }

  // ---------- Dashboard layout cleanup ----------
  function isDashboardPage(){
    var g = document.body.dataset.cwGuard;
    if (g) return true;
    var p = location.pathname.toLowerCase();
    return /\/(admin|superadmin)\//.test(p) ||
           /(dashboard|profile|settings|messages|wishlist|my-listings|my-bookings|earnings|bookings|rental-history|add-item)\.html$/.test(p);
  }
  function hideDashboardTopNav(){
    if (!isDashboardPage()) return;
    document.querySelectorAll(".cw-navbar").forEach(function(nav){ nav.style.display = "none"; });
    // Hide the public bottom mobile nav too (dashboards use the three-dot drawer instead)
    document.querySelectorAll(".cw-mobnav").forEach(function(n){ n.remove(); });
  }

  // ---------- Deduplicate language switchers ----------
  function dedupeLangSwitchers(){
    var seen = false;
    document.querySelectorAll(".cw-lang-switch, .cw-lang-switcher, [data-cw-lang-switch]").forEach(function(el){
      if (seen) { el.remove(); return; }
      seen = true;
    });
  }

  // ---------- Re-translate after main.js applies ----------
  function runAll(){
    hideDashboardTopNav();
    dedupeLangSwitchers();
    hideSignInIfLoggedIn();
    applyUser();
    applyLanguageExtras();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runAll);
  } else {
    runAll();
  }

  // React to language switching
  window.addEventListener("cw:languagechange", function(){ setTimeout(applyLanguageExtras, 0); });
  // React to dynamic DOM additions (charts, cards rendered after load)
  var pending;
  var mo = new MutationObserver(function(){
    clearTimeout(pending);
    pending = setTimeout(function(){
      applyLanguageExtras();
      applyUser();
      hideSignInIfLoggedIn();
      dedupeLangSwitchers();
    }, 80);
  });
  if (document.body) mo.observe(document.body, { childList:true, subtree:true, characterData:false });
  else document.addEventListener("DOMContentLoaded", function(){ mo.observe(document.body, { childList:true, subtree:true }); });
})();
