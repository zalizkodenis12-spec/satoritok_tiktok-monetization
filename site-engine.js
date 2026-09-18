// Satoritok Interactive Engine v2.0
(function() {
  'use strict';

  function init() {
    initTheme();
    initPhone();
    initCalculator();
    initAccordions();
    initNavigationAndLinks();
    initMobileMenu();
    initAudioPlayers();
  }

  // 1. Theme Switcher (Dark <-> Light Mode)
  function initTheme() {
    var savedTheme = localStorage.getItem('satori_theme');
    // If not set, default to dark
    if (!savedTheme) {
      savedTheme = document.documentElement.classList.contains('dark') || document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'dark';
    }

    applyTheme(savedTheme);

    var themeButtons = document.querySelectorAll('.theme-toggle:not(.language-toggle), button[aria-label*="тем"], button[aria-label*="Тем"], button[aria-label*="світл"], button[aria-label*="свет"], button[title*="тем"], button[title*="Тем"]');
    themeButtons.forEach(function(btn) {
      btn.style.cursor = 'pointer';
      btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var current = document.documentElement.getAttribute('data-theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
        var nextTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem('satori_theme', nextTheme);
      };
    });
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
      updateAllThemeIcons(true);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
      updateAllThemeIcons(false);
    }
  }

  function updateAllThemeIcons(isDark) {
    var buttons = document.querySelectorAll('.theme-toggle:not(.language-toggle)');
    buttons.forEach(function(btn) {
      var svg = btn.querySelector('svg');
      if (!svg) return;
      if (isDark) {
        // Show sun icon (so user can switch to light) or moon icon
        svg.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
      } else {
        // Show moon icon (so user can switch to dark)
        svg.innerHTML = '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>';
      }
    });
  }

  // 2. Interactive Phone on First Screen
  function initPhone() {
    var phone = document.querySelector('.phone-stage, #phone-demo');
    if (!phone) return;

    // Tabs inside phone profile (grid, lock, repost, heart)
    var tabButtons = phone.querySelectorAll('.phone-profile-tabs button, .phone-tabs button, [role="tab"]');
    tabButtons.forEach(function(btn) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        tabButtons.forEach(function(b) {
          b.setAttribute('aria-selected', 'false');
          b.classList.remove('active');
        });
        btn.setAttribute('aria-selected', 'true');
        btn.classList.add('active');
      });
    });

    // Pink button inside phone ("Завантажити")
    var pinkBtn = phone.querySelector('.phone-pink');
    if (pinkBtn) {
      pinkBtn.style.cursor = 'pointer';
      pinkBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://t.me/satori_tok', '_blank');
      });
    }

    // Handle button (@satori_tok)
    var handleBtn = phone.querySelector('.profile-handle');
    if (handleBtn) {
      handleBtn.style.cursor = 'pointer';
      handleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://t.me/satori_tok', '_blank');
      });
    }
  }

  // 3. Calculator & Slider
  function initCalculator() {
    var calc = document.querySelector('#calculator, .calculator-section');
    if (!calc) return;

    var selectedCountry = 'fr';
    var prices = { fr: 200, de: 200, gb: 200, us: 250 };
    var countryNames = {
      fr: 'Франція (France)',
      de: 'Німеччина (Germany)',
      gb: 'Великобританія (UK)',
      us: 'США (USA)'
    };

    var viewsValue = 500000; // default 500k views
    var rpm = 0.80; // $0.80 per 1k views

    function updateCalcDisplay() {
      // 1. Calculate estimated earnings
      var monthlyEarnings = Math.round((viewsValue / 1000) * rpm);
      var amountEl = calc.querySelector('.calc-amount');
      if (amountEl) {
        amountEl.innerHTML = '$' + monthlyEarnings.toLocaleString() + ' <small>/ міс</small>';
      }

      // 2. Update config summary price & country
      var price = prices[selectedCountry] || 200;
      var priceDisplay = calc.querySelector('.config-total-price, .config-summary [data-price]');
      if (priceDisplay) {
        priceDisplay.textContent = '€' + price;
      }

      // 3. Update summary button link
      var orderBtn = calc.querySelector('.config-summary a.button, a[href*="t.me"]');
      if (orderBtn) {
        var cName = countryNames[selectedCountry] || 'Франція';
        var msg = encodeURIComponent('Привіт! Хочу придбати акаунт Satoritok (' + cName + ') за €' + price + '. Розкажіть деталі.');
        orderBtn.setAttribute('href', 'https://t.me/satori_tok?text=' + msg);
      }
    }

    // Country Radio items
    var countryItems = calc.querySelectorAll('[data-slot="radio-group-item"], label[for*="fr"], label[for*="de"], label[for*="gb"], label[for*="us"], .country-option');
    countryItems.forEach(function(item) {
      item.style.cursor = 'pointer';
      item.addEventListener('click', function() {
        var val = item.getAttribute('value') || (item.getAttribute('for') || '').replace(/.*-/, '');
        if (val && prices[val]) {
          selectedCountry = val;
          countryItems.forEach(function(ci) {
            ci.setAttribute('data-state', 'unchecked');
            ci.classList.remove('selected');
          });
          item.setAttribute('data-state', 'checked');
          item.classList.add('selected');
          updateCalcDisplay();
        }
      });
    });

    // Slider for views
    var sliders = calc.querySelectorAll('[data-slot="slider"], .view-slider');
    sliders.forEach(function(slider) {
      slider.style.cursor = 'pointer';
      var range = slider.querySelector('[data-slot="slider-range"]');
      var thumb = slider.querySelector('[data-slot="slider-thumb"]');
      if (thumb) thumb.style.display = 'block';

      function handleSlider(e) {
        var rect = slider.getBoundingClientRect();
        var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        var percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        
        // Map percent to 100k -> 5M views
        viewsValue = Math.round(100000 + percent * 4900000);
        
        if (range) range.style.right = ((1 - percent) * 100) + '%';
        if (thumb) thumb.parentElement.style.left = (percent * 100) + '%';

        // Update slider label if present
        var label = calc.querySelector('[aria-labelledby="monthly-views-label"], #monthly-views-value, .slider-val');
        if (label) {
          label.textContent = (viewsValue >= 1000000 ? (viewsValue / 1000000).toFixed(1) + 'M' : Math.round(viewsValue / 1000) + 'k') + ' переглядів';
        }

        updateCalcDisplay();
      }

      slider.addEventListener('click', handleSlider);
      var isDragging = false;
      slider.addEventListener('mousedown', function() { isDragging = true; });
      window.addEventListener('mouseup', function() { isDragging = false; });
      window.addEventListener('mousemove', function(e) { if (isDragging) handleSlider(e); });
    });

    updateCalcDisplay();
  }

  // 4. Accordions (Services & FAQ)
  function initAccordions() {
    document.addEventListener('click', function(e) {
      var trigger = e.target.closest('[data-slot="accordion-trigger"], .community-item-title, .faq-rule button, h3 button');
      if (!trigger) return;

      var item = trigger.closest('[data-slot="accordion-item"], .community-item, .faq-rule');
      if (!item) return;

      e.preventDefault();
      var content = item.querySelector('[data-slot="accordion-content"], [role="region"], div.overflow-hidden');
      if (!content) return;

      var isOpen = item.getAttribute('data-state') === 'open' || trigger.getAttribute('data-state') === 'open';
      if (isOpen) {
        closeItem(item, trigger, content);
      } else {
        openItem(item, trigger, content);
      }
    });

    // "Розкрити все" / "Раскрыть все" / "Expand all"
    document.addEventListener('click', function(e) {
      var target = e.target.closest('button, a');
      if (!target) return;
      var txt = (target.textContent || '').trim().toLowerCase();
      
      var isExpand = txt.includes('розкрити') || txt.includes('раскрыть') || txt.includes('expand all');
      var isCollapse = txt.includes('сховати') || txt.includes('скрыть') || txt.includes('collapse all');

      if (isExpand || isCollapse) {
        e.preventDefault();
        var parent = target.closest('section, .community-program, .faq-section, main') || document.body;
        var items = parent.querySelectorAll('[data-slot="accordion-item"], .community-item, .faq-rule');

        if (isExpand) {
          items.forEach(function(it) {
            var trg = it.querySelector('[data-slot="accordion-trigger"], button');
            var cnt = it.querySelector('[data-slot="accordion-content"], [role="region"], div.overflow-hidden');
            if (cnt) openItem(it, trg, cnt);
          });
          target.textContent = txt.includes('розкрити') ? 'Сховати все' : (txt.includes('expand') ? 'Collapse all' : 'Скрыть все');
        } else {
          items.forEach(function(it, idx) {
            var trg = it.querySelector('[data-slot="accordion-trigger"], button');
            var cnt = it.querySelector('[data-slot="accordion-content"], [role="region"], div.overflow-hidden');
            if (cnt) {
              if (idx === 0) openItem(it, trg, cnt);
              else closeItem(it, trg, cnt);
            }
          });
          target.textContent = txt.includes('сховати') ? 'Розкрити все' : (txt.includes('collapse') ? 'Expand all' : 'Раскрыть все');
        }
      }
    });
  }

  function openItem(item, trigger, content) {
    item.setAttribute('data-state', 'open');
    if (trigger) {
      trigger.setAttribute('data-state', 'open');
      trigger.setAttribute('aria-expanded', 'true');
      var svg = trigger.querySelector('svg.lucide-chevron-down');
      if (svg) svg.style.transform = 'rotate(180deg)';
    }
    content.removeAttribute('hidden');
    content.setAttribute('data-state', 'open');
    content.style.display = 'block';
    content.style.maxHeight = '2500px';
    content.style.opacity = '1';
    content.style.transition = 'all 0.3s ease';
  }

  function closeItem(item, trigger, content) {
    item.setAttribute('data-state', 'closed');
    if (trigger) {
      trigger.setAttribute('data-state', 'closed');
      trigger.setAttribute('aria-expanded', 'false');
      var svg = trigger.querySelector('svg.lucide-chevron-down');
      if (svg) svg.style.transform = 'rotate(0deg)';
    }
    content.setAttribute('data-state', 'closed');
    content.style.display = 'none';
  }

  // 5. Navigation, Back to home, Contact links
  function initNavigationAndLinks() {
    var path = window.location.pathname;
    var isUk = path.includes('uk') || path.includes('_1') || document.documentElement.lang === 'uk';
    var isEn = path.includes('en') || path.includes('_2') || document.documentElement.lang === 'en';
    var homeUrl = isUk ? 'uk.html' : (isEn ? 'en.html' : 'index.html');

    // "На головну" / "На главную"
    document.querySelectorAll('a, button').forEach(function(el) {
      var txt = (el.textContent || '').trim().toLowerCase();
      if (txt.includes('на главную') || txt.includes('на головну') || txt.includes('back to home')) {
        el.setAttribute('href', homeUrl);
        el.onclick = function(e) {
          e.preventDefault();
          window.location.href = homeUrl;
        };
      }
    });

    // All Telegram / Contact links
    document.querySelectorAll('a').forEach(function(a) {
      var href = a.getAttribute('href') || '';
      if (href.includes('dew1tt')) {
        a.setAttribute('href', href.replace(/dew1tt/g, 'satori_tok'));
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      } else if (href.includes('tiktok.com/@vladmonetization')) {
        a.setAttribute('href', 'https://t.me/+e1X953uUhg5hMDAy');
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // CTA buttons to @satori_tok
    document.querySelectorAll('.button-primary, a.button').forEach(function(btn) {
      var txt = (btn.textContent || '').trim().toLowerCase();
      if (txt.includes('купити') || txt.includes('купить') || txt.includes('забрати') || txt.includes('забрать') || txt.includes('buy account') || txt.includes('зв\'язатися') || txt.includes('связаться') || txt.includes('підтримка') || txt.includes('поддержка')) {
        var h = btn.getAttribute('href') || '';
        if (!h || h.startsWith('#')) {
          btn.setAttribute('href', 'https://t.me/satori_tok');
          btn.setAttribute('target', '_blank');
          btn.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  }

  // 6. Mobile Menu
  function initMobileMenu() {
    var menuBtn = document.querySelector('button[aria-label*="меню"], button[aria-label*="menu"], .mobile-toggle, .menu-toggle');
    var nav = document.querySelector('.site-nav, .mobile-menu, [data-mobile-menu]');
    if (menuBtn && nav) {
      menuBtn.onclick = function(e) {
        e.preventDefault();
        nav.classList.toggle('open');
        var isOpen = nav.classList.contains('open');
        menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };
    }
  }

  // 7. Audio Players
  function initAudioPlayers() {
    document.querySelectorAll('.audio-card, [data-audio-player], .voice-review').forEach(function(card) {
      var btn = card.querySelector('button');
      var audio = card.querySelector('audio');
      if (btn && audio) {
        btn.onclick = function(e) {
          e.preventDefault();
          if (audio.paused) {
            document.querySelectorAll('audio').forEach(function(a) { a.pause(); });
            audio.play();
            btn.classList.add('playing');
          } else {
            audio.pause();
            btn.classList.remove('playing');
          }
        };
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
