/* CityWide AI Chatbot - Gemini powered platform assistant */
(function () {
  if (window.__cwChatInit) return;
  window.__cwChatInit = true;

  var SYSTEM_PROMPT_EN = [
    "You are CityWide AI Assistant.",
    "CityWide is a rental marketplace platform where users can rent and list items.",
    "Help users find items, explain renting, listing, Chapa payments, bookings, categories, featured advertisements, and platform support.",
    "Answer the user's exact question in English. Be concise, friendly and helpful.",
    "If the question is outside CityWide, still answer briefly, then connect it back to renting or using the platform when useful."
  ].join("\n");
  var SYSTEM_PROMPT_SO = [
    "Waxaad tahay Kaaliyaha AI ee CityWide.",
    "CityWide waa suuq kireysi ah oo dadka u oggolaanaya inay alaab kireystaan ama liis geliyaan.",
    "Ka jawaab su'aasha isticmaalaha si toos ah adigoo isticmaalaya Af-Soomaali cad, kooban, saaxiibtinimo leh.",
    "Ka caawi isticmaalayaasha kireynta, liis gelinta, lacag bixinta Chapa, dalabyada, qaybaha, xayeysiisyada muuqda, iyo taageerada guud.",
    "Haddii su'aashu ka baxsan tahay CityWide, si kooban uga jawaab kadibna marka ay habboon tahay ku xir isticmaalka platform-ka."
  ].join("\n");

  var SUGGESTIONS = {
    en: ["How do I rent an item?", "How do I list my item?", "How does Chapa payment work?", "What are featured listings?"],
    so: ["Sideen alaab u kiraystaa?", "Sideen alaabtayda u liis gareeyaa?", "Sidee lacag bixinta Chapa u shaqaysaa?", "Waa maxay liisaska muuqda?"]
  };
  var UI = {
    en: {
      title:"CityWide AI Assistant",
      sub:"Powered by Gemini · Always online",
      placeholder:"Ask about renting, listing, payments...",
      welcome:"Hi! I'm the CityWide AI Assistant. I can help you find items, understand renting and listing, explain Chapa payments, featured ads, bookings and more. What would you like to know?",
      thinking:"Thinking...",
      noKey:"The Gemini API key is not configured yet. Open config.js and set window.CITYWIDE_GEMINI_KEY.",
      generic:"I did not catch that. Could you rephrase?",
      network:"Network error: "
    },
    so: {
      title:"Kaaliyaha AI ee CityWide",
      sub:"Gemini ayaa awood siiya · Had iyo jeer diyaar",
      placeholder:"Weydii kireysi, liis gelin, lacag bixin...",
      welcome:"Salaan! Waxaan ahay Kaaliyaha AI ee CityWide. Waxaan kaa caawin karaa helidda alaab, fahamka kireynta iyo liis gelinta, lacag bixinta Chapa, xayeysiisyada muuqda, dalabyada iyo wax ka badan. Maxaad rabtaa inaad ogaato?",
      thinking:"Waan ka shaqeynayaa...",
      noKey:"Furaha Gemini API weli lama dejin. Fur config.js oo geli window.CITYWIDE_GEMINI_KEY.",
      generic:"Si fiican uma fahmin. Fadlan dib u qor su'aasha.",
      network:"Khalad shabakad: "
    }
  };

  var history = [];
  function lang(){ try { return localStorage.getItem("cw_lang") === "so" ? "so" : "en"; } catch(e){ return "en"; } }
  function copy(){ return UI[lang()]; }
  function systemPrompt(){ return lang() === "so" ? SYSTEM_PROMPT_SO : SYSTEM_PROMPT_EN; }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]; });
  }
  function localReply(text) {
    var q = String(text || "").toLowerCase();
    if (lang() === "so") {
      if (q.indexOf("liis") >= 0) return "Si aad alaab u liis geliso, guji List Item, geli magaca, qaybta, qiimaha maalintii, sawirrada, iyo shuruudaha kirada. Kadib admin ayaa dib u eegi kara liiska.";
      if (q.indexOf("chapa") >= 0 || q.indexOf("lacag") >= 0) return "Lacag bixinta Chapa waa demo halkan. Fikradda waa in lacagta lagu hayo si ammaan ah ilaa wareejinta alaabtu dhammaato.";
      if (q.indexOf("muuqda") >= 0 || q.indexOf("featured") >= 0) return "Liisaska muuqda waa alaab la hormariyay si ay dadka si fudud ugu arkaan bogga hore ama natiijooyinka raadinta.";
      return "Si aad alaab u kiraysato, fur Browse, dooro alaabta, eeg faahfaahinta, kadib guji Request to Rent. Codsiga demo-ga wuxuu ka muuqanayaa Admin Dashboard.";
    }
    if (q.indexOf("list") >= 0) return "To list your item, open List Item, add the title, category, daily price, photos, and rental conditions. The admin can then review the listing.";
    if (q.indexOf("chapa") >= 0 || q.indexOf("payment") >= 0) return "Chapa payment is demo-only here. The intended flow is safe payment holding until the rental handoff is complete.";
    if (q.indexOf("featured") >= 0) return "Featured listings are promoted items that can appear more prominently on the homepage or browsing results.";
    return "To rent an item, open Browse, choose an item, view its details, and click Request to Rent. The demo request appears in the Admin Dashboard.";
  }

  function build() {
    var fab = el("button", "cw-chat-fab");
    fab.title = "Chat with CityWide AI";
    fab.innerHTML = '<i class="bi bi-stars"></i>';
    document.body.appendChild(fab);

    var panel = el("div", "cw-chat-panel");
    panel.innerHTML =
      '<div class="cw-chat-header">' +
        '<div class="cw-chat-avatar"><i class="bi bi-stars"></i></div>' +
        '<div><h6 data-cw-chat-title></h6><div class="cw-chat-sub" data-cw-chat-sub></div></div>' +
        '<button class="cw-chat-close" aria-label="Close"><i class="bi bi-x-lg"></i></button>' +
      '</div>' +
      '<div class="cw-chat-body" id="cwChatBody"></div>' +
      '<div class="cw-chat-suggestions" id="cwChatSugs"></div>' +
      '<form class="cw-chat-input" id="cwChatForm">' +
        '<textarea id="cwChatText" rows="1"></textarea>' +
        '<button type="submit" id="cwChatSend"><i class="bi bi-send-fill"></i></button>' +
      '</form>';
    document.body.appendChild(panel);

    var body = panel.querySelector("#cwChatBody");
    var sugWrap = panel.querySelector("#cwChatSugs");
    var form = panel.querySelector("#cwChatForm");
    var input = panel.querySelector("#cwChatText");
    var sendBtn = panel.querySelector("#cwChatSend");

    function addMsg(role, text, cls) {
      var m = el("div", "cw-msg " + role + (cls ? " " + cls : ""), escapeHtml(text));
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
      return m;
    }
    function renderSuggestions() {
      sugWrap.innerHTML = "";
      SUGGESTIONS[lang()].forEach(function (s) {
        var b = el("button", null, s);
        b.type = "button";
        b.addEventListener("click", function(){ input.value = s; submit(); });
        sugWrap.appendChild(b);
      });
    }
    function syncLanguage(){
      var c = copy();
      panel.querySelector("[data-cw-chat-title]").textContent = c.title;
      panel.querySelector("[data-cw-chat-sub]").textContent = c.sub;
      input.setAttribute("placeholder", c.placeholder);
      renderSuggestions();
    }
    function open() {
      panel.classList.add("is-open");
      if (!body.children.length) addMsg("bot", copy().welcome);
      renderSuggestions();
      setTimeout(function(){ input.focus(); }, 200);
    }
    function close() { panel.classList.remove("is-open"); }

    fab.addEventListener("click", function () { panel.classList.contains("is-open") ? close() : open(); });
    panel.querySelector(".cw-chat-close").addEventListener("click", close);

    function submit() {
      var text = input.value.trim();
      if (!text) return;
      input.value = "";
      sugWrap.style.display = "none";
      addMsg("user", text);
      history.push({ role: "user", content: text });
      askGemini();
    }
    form.addEventListener("submit", function(e){ e.preventDefault(); submit(); });
    input.addEventListener("keydown", function(e){
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
    });

    function askGemini() {
      var key = String(window.CITYWIDE_GEMINI_KEY || "").trim();
      var latestQuestion = history[history.length - 1] && history[history.length - 1].content;
      if (!key || key === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
        console.error("[CityWide chatbot] Missing Gemini API key. Set window.CITYWIDE_GEMINI_KEY in js/config.js.");
        addMsg("bot", copy().noKey, "error");
        addMsg("bot", localReply(latestQuestion));
        sugWrap.style.display = "";
        return;
      }
      sendBtn.disabled = true;
      var typing = addMsg("bot", copy().thinking, "typing");
      var contents = history.map(function(h){
        return { role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] };
      });
      var payload = {
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents: contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      };
      var model = window.CITYWIDE_GEMINI_MODEL || "gemini-2.0-flash";
      var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(key);
      console.groupCollapsed("[CityWide chatbot] Gemini request");
      console.log("Endpoint:", "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent");
      console.log("Model:", model);
      console.log("Language:", lang());
      console.log("Payload:", payload);
      console.groupEnd();
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
      .then(function(r){
        return r.text().then(function(text){
          var json = null;
          try { json = text ? JSON.parse(text) : null; }
          catch(e) { console.error("[CityWide chatbot] Gemini returned non-JSON response:", text); }
          return { ok: r.ok, status: r.status, statusText: r.statusText, j: json, raw: text };
        });
      })
      .then(function(res){
        typing.remove();
        sendBtn.disabled = false;
        if (!res.ok) {
          var apiMessage = (res.j && res.j.error && res.j.error.message) || res.raw || (res.status + " " + res.statusText);
          console.error("[CityWide chatbot] Gemini API error", res);
          addMsg("bot", "Gemini API error: " + apiMessage, "error");
          sugWrap.style.display = "";
          return;
        }
        var reply = "";
        try { reply = res.j.candidates[0].content.parts.map(function(p){ return p.text || ""; }).join(""); }
        catch (e) {
          console.error("[CityWide chatbot] Could not parse Gemini response", res.j, e);
          reply = "";
        }
        if (!reply.trim()) {
          addMsg("bot", "Gemini returned an empty response. Check console for the raw API payload.", "error");
          sugWrap.style.display = "";
          return;
        }
        console.log("[CityWide chatbot] Gemini response:", res.j);
        history.push({ role: "model", content: reply });
        addMsg("bot", reply);
        sugWrap.style.display = "";
      })
      .catch(function(err){
        typing.remove();
        sendBtn.disabled = false;
        console.error("[CityWide chatbot] Gemini fetch failed", err);
        addMsg("bot", copy().network + err.message, "error");
        sugWrap.style.display = "";
      });
    }
    window.addEventListener("cw:languagechange", syncLanguage);
    syncLanguage();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();
