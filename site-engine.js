// Satoritok Site Engine - 100% Interactivity
(function() {
  'use strict';

  function init() {
    initTheme();
    initAccordions();
    initNavigationAndLinks();
    initMobileMenu();
    initAudioPlayers();
  }

  // 1. Theme Switcher (Dark / Light Mode)
  function initTheme() {
    var savedTheme = localStorage.getItem('satori_theme');
    if (!savedTheme) {
      savedTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    var themeButtons = document.querySelectorAll('.theme-toggle:not(.language-toggle), button[aria-label*="тем"], button[aria-label*="Тем"], button[aria-label*="світл"], button[aria-label*="свет"], button[title*="тем"], button[title*="Тем"]');
    themeButtons.forEach(function(btn) {
      btn.style.cursor = 'pointer';
      btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        var isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('satori_theme', isDark ? 'dark' : 'light');
        updateThemeIcon(btn, isDark);
      };
    });
  }

  function updateThemeIcon(btn, isDark) {
    var svg = btn.querySelector('svg');
    if (!svg) return;
    if (isDark) {
      svg.innerHTML = '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>';
    } else {
      svg.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
    }
  }

  // 2. Accordions (Services & FAQ)
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

  // 3. Navigation, Back to home, Contact links
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
      if (href.includes('satori_tok')) {
        a.setAttribute('href', href.replace(/satori_tok/g, 'satori_tok'));
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      } else if (href.includes('tiktok.com/@satori_tok')) {
        a.setAttribute('href', 'https://t.me/+e1X953uUhg5hMDAy');
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // CTA buttons to @satori_tok
    document.querySelectorAll('.button-primary, a.button').forEach(function(btn) {
      var txt = (btn.textContent || '').trim().toLowerCase();
      if (txt.includes('купити') || txt.includes('купить') || txt.includes('buy account') || txt.includes('зв\'язатися') || txt.includes('связаться') || txt.includes('підтримка') || txt.includes('поддержка')) {
        var h = btn.getAttribute('href') || '';
        if (!h || h.startsWith('#')) {
          btn.setAttribute('href', 'https://t.me/satori_tok');
          btn.setAttribute('target', '_blank');
          btn.setAttribute('rel', 'noopener noreferrer');
        }
      }
    });
  }

  // 4. Mobile Menu
  function initMobileMenu() {
    var menuBtn = document.querySelector('button[aria-label*="меню"], button[aria-label*="menu"], .menu-toggle');
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

  // 5. Audio Players
  function initAudioPlayers() {
    document.querySelectorAll('.audio-card, [data-audio-player]').forEach(function(card) {
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
