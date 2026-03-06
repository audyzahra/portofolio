document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // Footer year
  // =========================
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // =========================
  // Burger menu
  // =========================
  const burger = document.getElementById("burger");
  const navMenu = document.getElementById("navMenu");

  if (burger && navMenu) {
    burger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = navMenu.classList.toggle("open");
      burger.classList.toggle("open", isOpen);
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("click", (e) => {
      const target = e.target;
      if (!navMenu.contains(target) && !burger.contains(target)) {
        navMenu.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  // =========================
  // Smooth scroll
  // =========================
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      if (navMenu) navMenu.classList.remove("open");
      if (burger) {
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  });

  // =========================
  // Active nav on scroll
  // =========================
  const sections = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      return href ? document.querySelector(href) : null;
    })
    .filter(Boolean);

  if (sections.length) {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (!visible) return;

        const activeId = `#${visible.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === activeId);
        });
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: [0.15, 0.3, 0.6],
      }
    );

    sections.forEach((section) => obs.observe(section));
  }

  // =========================
  // Toast + Copy Email
  // =========================
  const toast = document.getElementById("toast");
  const copyBtn = document.getElementById("copyEmail");
  const emailText = document.getElementById("emailText");

  function showToast(text) {
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 1600);
  }

  if (copyBtn && emailText) {
    copyBtn.addEventListener("click", async () => {
      const value = emailText.textContent.trim();

      if (!value) {
        showToast("Email tidak tersedia");
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        showToast("Email disalin ✅");
      } catch (err) {
        showToast("Gagal menyalin email");
      }
    });
  }

  // =========================
  // Cleanup duplicate lightbox
  // =========================
  (function cleanupDuplicateLightbox() {
    document.querySelectorAll(".lightbox").forEach((el) => {
      if (el.id !== "lightbox") el.remove();
    });
  })();

  // =========================
  // Lightbox
  // =========================
  (function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const imgEl = document.getElementById("lbImg");
    const capEl = document.getElementById("lbCap");
    const btnPrev = document.getElementById("lbPrev");
    const btnNext = document.getElementById("lbNext");

    if (!lightbox || !imgEl || !capEl || !btnPrev || !btnNext) {
      console.error("Elemen lightbox tidak lengkap.");
      return;
    }

    const clickableItems = Array.from(
      document.querySelectorAll(".shot, .cert-shot")
    );

    if (!clickableItems.length) return;

    let groupItems = [];
    let currentIndex = 0;

    function getCaption(el) {
      return (
        el.getAttribute("data-caption") ||
        el.querySelector(".shot-cap, .cert-cap")?.textContent?.trim() ||
        ""
      );
    }

    function getGroupForItem(el) {
      const projectGallery = el.closest(".project-gallery");
      if (projectGallery) {
        return Array.from(projectGallery.querySelectorAll(".shot"));
      }

      const projectImages = el.closest(".project-images");
      if (projectImages) {
        return Array.from(projectImages.querySelectorAll(".shot"));
      }

      const certSection = el.closest("#certificates");
      if (certSection) {
        return Array.from(certSection.querySelectorAll(".cert-shot"));
      }

      const projectCard = el.closest(".project-card");
      if (projectCard) {
        return Array.from(projectCard.querySelectorAll(".shot"));
      }

      return clickableItems;
    }

    function openAt(index) {
      if (!groupItems.length) return;

      currentIndex = (index + groupItems.length) % groupItems.length;
      const currentItem = groupItems[currentIndex];
      const src = currentItem.getAttribute("href");
      const caption = getCaption(currentItem);

      if (!src) return;

      imgEl.src = src;
      imgEl.alt = caption ? `Preview - ${caption}` : "Preview";
      capEl.textContent = caption;

      lightbox.classList.add("show");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeLightbox() {
      lightbox.classList.remove("show");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      imgEl.src = "";
      imgEl.alt = "Preview";
      capEl.textContent = "";
    }

    function nextItem() {
      if (!groupItems.length) return;
      openAt(currentIndex + 1);
    }

    function prevItem() {
      if (!groupItems.length) return;
      openAt(currentIndex - 1);
    }

    clickableItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        groupItems = getGroupForItem(item);
        currentIndex = Math.max(0, groupItems.indexOf(item));
        openAt(currentIndex);
      });
    });

    btnNext.addEventListener("click", (e) => {
      e.stopPropagation();
      nextItem();
    });

    btnPrev.addEventListener("click", (e) => {
      e.stopPropagation();
      prevItem();
    });

    lightbox.addEventListener("click", (e) => {
      const target = e.target;
      if (target?.getAttribute?.("data-close") === "true") {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("show")) return;

      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextItem();
      if (e.key === "ArrowLeft") prevItem();
    });
  })();

  // =========================
  // Tabs Project 3
  // =========================
  document.querySelectorAll(".project-tabs").forEach((tabs) => {
    const buttons = tabs.querySelectorAll(".tab-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tab;
        const card = tabs.closest(".project-card");
        if (!card || !target) return;

        buttons.forEach((btn) => {
          btn.classList.remove("active");
          btn.setAttribute("aria-selected", "false");
        });

        button.classList.add("active");
        button.setAttribute("aria-selected", "true");

        card.querySelectorAll(".tab-panel").forEach((panel) => {
          panel.classList.remove("show");
        });

        const activePanel = card.querySelector(`#${target}`);
        if (activePanel) {
          activePanel.classList.add("show");
        }
      });
    });
  });
});
/* =========================
   Activity slider
   ========================= */
(function initActivitySlider() {
  const slider = document.getElementById("activitySlider");
  const prevBtn = document.getElementById("activityPrev");
  const nextBtn = document.getElementById("activityNext");

  if (!slider || !prevBtn || !nextBtn) return;

  const slides = Array.from(slider.querySelectorAll(".activity-slide"));
  if (!slides.length) return;

  let current = 0;

  function updateSlider() {
    slider.style.transform = `translateX(-${current * 100}%)`;
  }

  prevBtn.addEventListener("click", () => {
    current = (current - 1 + slides.length) % slides.length;
    updateSlider();
  });

  nextBtn.addEventListener("click", () => {
    current = (current + 1) % slides.length;
    updateSlider();
  });
})();