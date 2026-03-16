(function(){
  const AIRBNB_URL = "https://www.airbnb.it/rooms/1003542985765959264?utm_source=github&utm_medium=landing&utm_campaign=planB_milan";
  const CTA_VARIANTS = [
    {
      id: "availability",
      title: "Check live availability on Airbnb",
      text: "See live dates and pricing anytime.",
      button: "Check availability"
    },
    {
      id: "dates_prices",
      title: "See live dates & prices on Airbnb",
      text: "Open the official listing for up-to-date pricing.",
      button: "See dates & prices"
    },
    {
      id: "plan_b",
      title: "Book your Plan B stay in Milan",
      text: "Go straight to the official Airbnb listing.",
      button: "Book on Airbnb"
    }
  ];

  function getVariant(){
    const key = "cta_variant_v1";
    let id = sessionStorage.getItem(key);
    let variant = CTA_VARIANTS.find(v => v.id === id);
    if (!variant) {
      variant = CTA_VARIANTS[Math.floor(Math.random() * CTA_VARIANTS.length)];
      sessionStorage.setItem(key, variant.id);
    }
    return variant;
  }

  const variant = getVariant();

  // Mobile menu
  const burger = document.querySelector('[data-burger]');
  const mobile = document.querySelector('[data-mobile]');
  if (burger && mobile) {
    burger.addEventListener('click', () => {
      const isOpen = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!isOpen));
      mobile.style.display = isOpen ? 'none' : 'block';
    });
    mobile.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.setAttribute('aria-expanded','false');
        mobile.style.display = 'none';
      });
    });
  }

  // Apply variant to all bottom banners
  document.querySelectorAll('.site-cta-banner').forEach((banner, index) => {
    const title = banner.querySelector('h3');
    const text = banner.querySelector('p');
    const button = banner.querySelector('a[href*="airbnb.it/rooms/1003542985765959264"]');
    if (title) title.textContent = variant.title;
    if (text) text.textContent = variant.text;
    if (button) {
      button.textContent = variant.button;
      button.setAttribute('data-booking-link', 'airbnb');
      button.setAttribute('data-booking-placement', index === 0 ? 'bottom-banner' : 'banner');
      button.setAttribute('data-cta-variant', variant.id);
    }
  });

  // Floating CTA bar
  const dismissed = sessionStorage.getItem('floating_airbnb_cta_closed_v1') === '1';
  if (!dismissed) {
    const shell = document.createElement('div');
    shell.className = 'floating-airbnb-cta is-visible';
    shell.innerHTML = `
      <div class="floating-airbnb-cta__inner">
        <div class="floating-airbnb-cta__copy">
          <div class="floating-airbnb-cta__title">${variant.title}</div>
          <div class="floating-airbnb-cta__text">${variant.text}</div>
        </div>
        <div class="floating-airbnb-cta__actions">
          <a class="btn" href="${AIRBNB_URL}" target="_blank" rel="noopener" data-booking-link="airbnb" data-booking-placement="floating-bar" data-cta-variant="${variant.id}">${variant.button}</a>
          <button class="floating-airbnb-cta__close" type="button" aria-label="Close">×</button>
        </div>
      </div>
    `;
    document.body.appendChild(shell);
    document.body.classList.add('has-floating-cta');
    const closeBtn = shell.querySelector('.floating-airbnb-cta__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        sessionStorage.setItem('floating_airbnb_cta_closed_v1', '1');
        shell.remove();
        document.body.classList.remove('has-floating-cta');
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'booking_cta_close', {
            cta_variant: variant.id,
            page_path: location.pathname
          });
        }
      });
    }
  }

  // Impression event once per page load
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'booking_cta_impression', {
      cta_variant: variant.id,
      page_path: location.pathname
    });
  }

  // Track Airbnb booking clicks
  function trackBookingClick(el) {
    if (typeof window.gtag !== 'function') return;
    const href = el.getAttribute('href') || '';
    const text = (el.textContent || '').trim().slice(0, 120);
    const placement = el.getAttribute('data-booking-placement') || 'generic';
    const ctaVariant = el.getAttribute('data-cta-variant') || variant.id;
    window.gtag('event', 'booking_click', {
      link_url: href,
      link_text: text,
      booking_platform: 'airbnb',
      placement: placement,
      cta_variant: ctaVariant,
      page_path: location.pathname,
      page_title: document.title,
      transport_type: 'beacon'
    });
  }

  document.querySelectorAll('a[href*="airbnb.it/rooms/1003542985765959264"]').forEach(link => {
    link.setAttribute('data-booking-link', 'airbnb');
    if (!link.hasAttribute('data-cta-variant')) {
      link.setAttribute('data-cta-variant', variant.id);
    }
    link.addEventListener('click', () => trackBookingClick(link));
    link.addEventListener('auxclick', () => trackBookingClick(link));
  });
})();