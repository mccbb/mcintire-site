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

  // Booking calendar (Google appointment schedule): the iframe is added only when the
  // visitor nears it, or taps a booking button, so the video and first screen stay fast.
  const mount = document.querySelector("[data-embed]");
  if (!mount) return;

  const msg = mount.querySelector(".rv-cal-msg");
  const say = (text, state) => { mount.dataset.state = state; if (msg) { msg.hidden = false; msg.textContent = text; } };

  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    say("Loading the calendar…", "loading");
    const frame = document.createElement("iframe");
    frame.title = "Book a 30-minute conversation with Mac Cobb";
    frame.src = mount.getAttribute("data-embed");
    let loaded = false;
    frame.addEventListener("load", () => { loaded = true; if (msg) msg.hidden = true; mount.dataset.state = "ready"; });
    mount.appendChild(frame);
    setTimeout(() => { if (!loaded) say("The calendar didn't load. Use the link below to book in a new tab.", "error"); }, 12000);
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries, o) => {
      if (entries.some((e) => e.isIntersecting)) { o.disconnect(); start(); }
    }, { rootMargin: "800px 0px" }).observe(mount);
  } else start();

  document.querySelectorAll('a[href="#book"]').forEach((a) => a.addEventListener("click", start));
})();
