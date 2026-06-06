/* CityWide AI Chatbot — Gemini powered platform assistant
   Add your Gemini API key in config.js (window.CITYWIDE_GEMINI_KEY) */
(function () {
  if (window.__cwChatInit) return;
  window.__cwChatInit = true;

  var SYSTEM_PROMPT = [
    "You are CityWide AI Assistant.",
    "CityWide is a rental marketplace platform where users can rent and list items.",
    "",
    "Platform Information:",
    "- Users can rent vehicles, electronics, tools, construction equipment, cameras and other items.",
    "- Owners can list items for rent.",
    "- Users can browse categories and featured listings.",
    "- Featured listings are paid advertisements.",
    "- Users can search, contact owners and book rentals.",
    "- Payments are handled through Chapa.",
    "- Admins manage listings, bookings, advertisements, reports and users.",
    "- Super Admins manage platform-wide operations, analytics, revenue, growth and administrators.",
    "",
    "Your role: help users find items, explain how renting and listing works,",
    "explain payments, bookings, categories, featured advertisements, and provide",
    "general platform guidance and support. Be concise, friendly and helpful.",
    "If asked something outside CityWide, gently redirect to platform topics."
  ].join("\n");

  var SUGGESTIONS = [
    "How do I rent an item?",
    "How do I list my item?",
    "How does Chapa payment work?",
    "What are featured listings?"
  ];

  var history = []; // [{role, content}]

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
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
        '<div><h6>CityWide AI Assistant</h6><div class="cw-chat-sub">Powered by Gemini · Always online</div></div>' +
        '<button class="cw-chat-close" aria-label="Close"><i class="bi bi-x-lg"></i></button>' +
      '</div>' +
      '<div class="cw-chat-body" id="cwChatBody"></div>' +
      '<div class="cw-chat-suggestions" id="cwChatSugs"></div>' +
      '<form class="cw-chat-input" id="cwChatForm">' +
        '<textarea id="cwChatText" rows="1" placeholder="Ask about renting, listing, payments…"></textarea>' +
        '<button type="submit" id="cwChatSend"><i class="bi bi-send-fill"></i></button>' +
      '</form>';
    document.body.appendChild(panel);

    var body = panel.querySelector("#cwChatBody");
    var sugWrap = panel.querySelector("#cwChatSugs");
    var form = panel.querySelector("#cwChatForm");
    var input = panel.querySelector("#cwChatText");
    var sendBtn = panel.querySelector("#cwChatSend");

    function open() {
      panel.classList.add("is-open");
      if (!body.children.length) {
        addMsg("bot", "👋 Hi! I'm the CityWide AI Assistant. I can help you find items, understand how renting and listing works, explain Chapa payments, featured ads, bookings and more. What would you like to know?");
        renderSuggestions();
      }
      setTimeout(function(){ input.focus(); }, 200);
    }
    function close() { panel.classList.remove("is-open"); }

    fab.addEventListener("click", function () {
      panel.classList.contains("is-open") ? close() : open();
    });
    panel.querySelector(".cw-chat-close").addEventListener("click", close);

    function renderSuggestions() {
      sugWrap.innerHTML = "";
      SUGGESTIONS.forEach(function (s) {
        var b = el("button", null, s);
        b.type = "button";
        b.addEventListener("click", function(){ input.value = s; submit(); });
        sugWrap.appendChild(b);
      });
    }

    function addMsg(role, text, cls) {
      var m = el("div", "cw-msg " + role + (cls ? " " + cls : ""), escapeHtml(text));
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
      return m;
    }
    function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function(c){ return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]; }); }

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
      var key = window.CITYWIDE_GEMINI_KEY;
      if (!key || key === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
        addMsg("bot", "⚠️ The Gemini API key isn't configured yet. Open config.js and set window.CITYWIDE_GEMINI_KEY to your key from https://aistudio.google.com/app/apikey", "error");
        return;
      }
      sendBtn.disabled = true;
      var typing = addMsg("bot", "Thinking…", "typing");

      var contents = history.map(function(h){
        return { role: h.role === "user" ? "user" : "model", parts: [{ text: h.content }] };
      });

      var body = {
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
      };

      var model = window.CITYWIDE_GEMINI_MODEL || "gemini-2.0-flash";
      fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + encodeURIComponent(key), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
      .then(function(res){
        typing.remove();
        sendBtn.disabled = false;
        if (!res.ok) {
          var err = (res.j && res.j.error && res.j.error.message) || "Sorry, something went wrong.";
          addMsg("bot", "⚠️ " + err, "error");
          return;
        }
        var reply = "";
        try {
          reply = res.j.candidates[0].content.parts.map(function(p){ return p.text || ""; }).join("");
        } catch (e) { reply = "I didn't catch that. Could you rephrase?"; }
        history.push({ role: "model", content: reply });
        addMsg("bot", reply);
      })
      .catch(function(err){
        typing.remove();
        sendBtn.disabled = false;
        addMsg("bot", "⚠️ Network error: " + err.message, "error");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();
