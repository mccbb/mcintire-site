(() => {
  // Header gets a solid background and hairline once the page has moved
  const bar = document.querySelector(".bar");
  const sentinel = document.createElement("div");
  sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:24px;pointer-events:none";
  document.body.prepend(sentinel);
  new IntersectionObserver(([e]) => {
    bar.toggleAttribute("data-scrolled", !e.isIntersecting);
  }).observe(sentinel);

  // In-page jumps scroll smoothly without writing #hash into the address bar,
  // so a refresh never lands on a section.
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      // Let Cmd/Ctrl/Shift-click and middle-click behave like normal links
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      const y = id === "#top" ? 0 : el.getBoundingClientRect().top + scrollY - 72;
      scrollTo({ top: y, behavior: reduce.matches ? "auto" : "smooth" });
    });
  });
})();
