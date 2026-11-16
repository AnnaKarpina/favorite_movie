/* =========================================================
   Movie — одностраничный шаблон
   ========================================================= */
(() => {
  "use strict";

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Прогресс-бар ---------- */
  const progressBar = document.getElementById("scrollProgress");
  const updateProgress = () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
    progressBar.style.width = `${scrolled * 100}%`;
  };
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Header + To-top ---------- */
  const header = document.getElementById("header");
  const toTop = document.getElementById("toTop");

  const onScrollHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 20);
    toTop.classList.toggle("is-visible", y > 500);
  };
  document.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  toTop.addEventListener("click", () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" })
  );

  /* ---------- Мобильное меню ---------- */
  const burger = document.getElementById("burger");
  const nav = document.getElementById("nav");

  const closeNav = () => {
    burger.classList.remove("is-open");
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", closeNav)
  );

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  /* ---------- Reveal при скролле ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = Number(entry.target.dataset.delay || 0);
            setTimeout(
              () => entry.target.classList.add("is-visible"),
              prefersReducedMotion ? 0 : delay
            );
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));

    document.querySelectorAll(".cast-grid .reveal, .gallery .reveal, .awards-grid .reveal")
      .forEach((el, i) => { el.dataset.delay = (i * 80) % 400; });
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Ripple-эффект ---------- */
  document.querySelectorAll("[data-ripple]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const span = document.createElement("span");
      span.className = "ripple";
      span.style.width = span.style.height = `${size}px`;
      span.style.left = `${e.clientX - rect.left - size / 2}px`;
      span.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(span);
      span.addEventListener("animationend", () => span.remove());
    });
  });

  /* ---------- Параллакс фона героя ---------- */
  const heroImage = document.getElementById("heroImage");
  if (heroImage && !prefersReducedMotion) {
    document.addEventListener("scroll", () => {
      const y = window.scrollY;
      if (y < window.innerHeight) {
        heroImage.style.transform = `translateY(${y * 0.25}px) scale(1.08)`;
      }
    }, { passive: true });
  }

  /* ---------- Эффект летящих искр ---------- */
  const sparkTargets = document.querySelectorAll('.poster, .cast-card__photo, .scene__image');

  if (!prefersReducedMotion) {
    let lastSparkTime = 0;

    sparkTargets.forEach(target => {
      target.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastSparkTime < 40) return;
        lastSparkTime = now;

        if (target.querySelectorAll('.spark').length > 20) return;

        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const spark = document.createElement('span');
        spark.className = Math.random() > 0.5 ? 'spark' : 'spark spark--purple';

        spark.style.left = `${x}px`;
        spark.style.top = `${y}px`;

        const size = 2 + Math.random() * 3;
        spark.style.width = `${size}px`;
        spark.style.height = `${size}px`;

        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 60;

        spark.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        spark.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);

        target.appendChild(spark);

        spark.addEventListener('animationend', () => {
          spark.remove();
        });
      });
    });
  }

  /* ---------- Модалка трейлера (ИСПРАВЛЕНО под <video>) ---------- */
  const trailerModal = document.getElementById("trailerModal");
  const trailerVideo = document.getElementById("trailerVideo");
  const openTrailerBtns = document.querySelectorAll("[data-open-trailer]");
  let lastFocused = null;
  let trailerLoaded = false;

  const openModal = () => {
    lastFocused = document.activeElement;

    if (trailerVideo && !trailerLoaded && trailerVideo.dataset.src) {
      trailerVideo.src = trailerVideo.dataset.src;
      trailerLoaded = true;
    }

    trailerModal.hidden = false;
    document.body.style.overflow = "hidden";
    trailerModal.querySelector(".modal__close")?.focus();
  };

  const closeModal = () => {
    trailerModal.hidden = true;
    if (trailerVideo) trailerVideo.pause();
    document.body.style.overflow = "";
    lastFocused?.focus?.();
  };

  openTrailerBtns.forEach((btn) => btn.addEventListener("click", openModal));
  trailerModal.querySelectorAll("[data-close-modal]").forEach((el) =>
    el.addEventListener("click", closeModal)
  );
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !trailerModal.hidden) closeModal();
  });

  /* ---------- Лайтбокс галереи ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const galleryItems = [...document.querySelectorAll("[data-lightbox]")];
  let currentIndex = 0;

  const showLightbox = (index) => {
    if (!galleryItems.length) return;
    currentIndex = (index + galleryItems.length) % galleryItems.length;
    const src = galleryItems[currentIndex].dataset.lightbox;
    lightboxImg.src = src;
    lightboxImg.alt = `Кадр ${currentIndex + 1}`;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightbox.querySelector(".lightbox__close")?.focus();
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    lightboxImg.src = "";
    document.body.style.overflow = "";
  };

  galleryItems.forEach((item, i) =>
    item.addEventListener("click", () => showLightbox(i))
  );
  lightbox.querySelector("[data-close-lightbox]").addEventListener("click", closeLightbox);
  lightbox.querySelector("[data-lightbox-prev]").addEventListener("click", () =>
    showLightbox(currentIndex - 1)
  );
  lightbox.querySelector("[data-lightbox-next]").addEventListener("click", () =>
    showLightbox(currentIndex + 1)
  );

  document.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showLightbox(currentIndex - 1);
    if (e.key === "ArrowRight") showLightbox(currentIndex + 1);
  });

  /* ---------- Плавный переход по якорям ---------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (href.length <= 1) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = header.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({
        top,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    });
  });
})();