(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The lead-to-cash path draws once when it scrolls into view.
  const path = document.querySelector(".rv-path");
  if (path) {
    if (reduce || !("IntersectionObserver" in window)) path.classList.add("is-in");
    else new IntersectionObserver(([e], o) => {
      if (e.isIntersecting) { path.classList.add("is-in"); o.disconnect(); }
    }, { threshold: 0.4 }).observe(path);
  }

  // Calendly: loaded only when the visitor nears the calendar (or taps the button),
  // so the video and first screen stay fast.
  const mount = document.querySelector("[data-calendly]");
  if (!mount) return;

  const base = mount.getAttribute("data-calendly") || "";
  const msg = mount.querySelector(".rv-cal-msg");
  const alt = document.querySelector("[data-calendly-link]");
  const say = (text, state) => { mount.dataset.state = state; if (msg) { msg.hidden = false; msg.textContent = text; } };

  if (!/^https:\/\/calendly\.com\/[^/\s]+/i.test(base) || /YOUR-/i.test(base)) {
    say("The booking calendar is not connected yet.", "unset");
    return;
  }
  if (alt) alt.href = base;

  // Dark-theme colours (Calendly honours these on paid plans), no event-type header,
  // and UTM values from the page URL carried through so bookings show their source.
  const here = new URLSearchParams(location.search);
  const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const url = new URL(base);
  url.searchParams.set("hide_event_type_details", "1");
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("background_color", "071624");
  url.searchParams.set("text_color", "f4f8fb");
  url.searchParams.set("primary_color", "f2b04a");
  const utm = {};
  utmKeys.forEach((k) => {
    const v = here.get(k);
    if (!v) return;
    url.searchParams.set(k, v);
    utm[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
  });

  const fail = () => say("The calendar didn't load. Use the link below to book in a new tab.", "error");

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    say("Loading the calendar…", "loading");
    const s = document.createElement("script");
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    s.onerror = fail;
    s.onload = () => {
      if (!window.Calendly) return fail();
      msg.hidden = true;
      window.Calendly.initInlineWidget({ url: url.toString(), parentElement: mount, utm });
      setTimeout(() => { if (!mount.querySelector("iframe")) fail(); }, 10000);
    };
    document.head.appendChild(s);
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries, o) => {
      if (entries.some((e) => e.isIntersecting)) { o.disconnect(); start(); }
    }, { rootMargin: "800px 0px" }).observe(mount);
  } else start();

  document.querySelectorAll('a[href="#book"]').forEach((a) => a.addEventListener("click", start));
})();
