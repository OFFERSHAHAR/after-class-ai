const sections = Array.from(document.querySelectorAll(".slide[id]"));
const links = Array.from(document.querySelectorAll(".deck-header nav a"));

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    links.forEach((link) => {
      link.toggleAttribute("aria-current", link.getAttribute("href") === `#${visible.target.id}`);
    });
  },
  { threshold: [0.35, 0.6] }
);

sections.forEach((section) => observer.observe(section));
