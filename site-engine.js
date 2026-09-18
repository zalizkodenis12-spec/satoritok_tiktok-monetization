// Satoritok Complete Interactive Engine v3.0
(function() {
  'use strict';

  function init() {
    initTheme();
    initRewardsCalculator();
    initConfigurator();
    initServicesPhones();
    initHeroPhone();
    initAccordions();
    initNavigationAndLinks();
    initMobileMenu();
    initAudioPlayers();
  }

  // ==========================================
  // 1. THEME SWITCHER (Dark <-> Light Mode)
  // ==========================================
  function initTheme() {
    var savedTheme = localStorage.getItem('satori_theme') || 'dark';
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
        svg.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
      } else {
        svg.innerHTML = '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>';
      }
    });
  }

  // ==========================================
  // 2. REWARDS CALCULATOR & SCENARIOS (Screenshot 1)
  // ==========================================
  function initRewardsCalculator() {
    var calc = document.querySelector('.calculator');
    if (!calc) return;

    var amountDisplay = calc.querySelector('.calc-amount');
    var viewsDisplay = calc.querySelector('.calc-settings .text-right, .calc-settings [class*="font-semibold"], .calc-settings span:first-child + span');
    var slider = calc.querySelector('.view-slider, [data-slot="slider"]');
    var scenarioButtons = calc.querySelectorAll('.scenario, button.scenario');
    var bars = calc.querySelectorAll('.monthly-bar');

    var currentViews = 100000;
    var baseRewards = 400;

    function setAmount(amount, viewsText, percent) {
      if (amountDisplay) {
        var isUk = document.documentElement.lang === 'uk';
        var suffix = isUk ? ' / міс' : ' / мес';
        amountDisplay.innerHTML = '$' + Number(amount).toLocaleString() + '<small>' + suffix + '</small>';
      }
      if (slider) {
        var range = slider.querySelector('[data-slot="slider-range"]');
        var thumb = slider.querySelector('[data-slot="slider-thumb"]');
        if (range && percent !== undefined) range.style.right = ((1 - percent) * 100) + '%';
        if (thumb && percent !== undefined) thumb.parentElement.style.left = (percent * 100) + '%';
      }
      // Update bars animation/height proportionally
      if (bars.length > 0) {
        var multiplier = amount / 400;
        bars.forEach(function(bar, i) {
          var originalH = parseFloat(bar.getAttribute('data-orig-h') || bar.style.height || '2%');
          if (!bar.getAttribute('data-orig-h')) bar.setAttribute('data-orig-h', originalH);
          bar.style.height = Math.min(95, Math.max(5, originalH * multiplier)) + '%';
        });
      }
    }

    // Scenario buttons (Осторожный, Средний, Высокий)
    scenarioButtons.forEach(function(btn, idx) {
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        scenarioButtons.forEach(function(b) {
          b.classList.remove('is-active', 'border-primary', 'bg-primary/10');
          b.style.borderColor = '';
        });
        btn.classList.add('is-active');
        btn.style.borderColor = 'var(--cyan)';

        if (idx === 0) {
          setAmount(420, '100K', 0.05);
        } else if (idx === 1) {
          setAmount(1180, '1.5M', 0.35);
        } else {
          setAmount(3750, '5M', 0.75);
        }
      });
    });

    // Slider interaction
    if (slider) {
      slider.style.cursor = 'pointer';
      var thumb = slider.querySelector('[data-slot="slider-thumb"]');
      if (thumb) thumb.style.display = 'block';

      function onSliderMove(e) {
        var rect = slider.getBoundingClientRect();
        var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        
        // 100k to 10M
        var views = Math.round(100000 + pct * 9900000);
        // Formula: between $400 and $6500
        var rewards = Math.round(400 + Math.pow(pct, 0.8) * 6100);

        scenarioButtons.forEach(function(b) { b.style.borderColor = ''; });
        setAmount(rewards, views >= 1000000 ? (views / 1000000).toFixed(1) + 'M' : Math.round(views / 1000) + 'K', pct);
      }

      slider.addEventListener('click', onSliderMove);
      var isDragging = false;
      slider.addEventListener('mousedown', function() { isDragging = true; });
      window.addEventListener('mouseup', function() { isDragging = false; });
      window.addEventListener('mousemove', function(e) { if (isDragging) onSliderMove(e); });
    }

    // 30 Daily bars interaction
    bars.forEach(function(bar, idx) {
      bar.style.cursor = 'pointer';
      bar.addEventListener('click', function(e) {
        e.preventDefault();
        bars.forEach(function(b) {
          b.setAttribute('aria-pressed', 'false');
          b.style.backgroundColor = '';
        });
        bar.setAttribute('aria-pressed', 'true');
        bar.style.backgroundColor = 'var(--cyan)';

        // Show note below
        var note = calc.querySelector('.interactive-reward-chart + p, .calc-chart + p');
        var dayEarnings = (parseFloat(bar.style.height || '2') * 1.85).toFixed(2);
        if (note) {
          note.innerHTML = 'День ' + (idx + 1) + ': <strong>$' + dayEarnings + '</strong> дохода за этот день';
        }
      });
    });
  }

  // ==========================================
  // 3. ACCOUNT CONFIGURATOR (Screenshots 2 & 3)
  // ==========================================
  function initConfigurator() {
    var configSection = document.querySelector('.config-section, .config-grid');
    if (!configSection) return;

    var selectedRegion = 'fr';
    var followersCount = 10000;
    var needVerification = false;
    var isUrgent = false;

    var basePrices = { fr: 265, de: 265, gb: 265, us: 315 };
    var regionNames = {
      fr: 'Франция',
      de: 'Германия',
      gb: 'Британия',
      us: 'США'
    };
    var regionFlags = {
      fr: 'fonts/fr.svg',
      de: 'fonts/de.svg',
      gb: 'fonts/gb.svg',
      us: 'fonts/us.svg'
    };

    var summary = configSection.querySelector('.config-summary');

    function updateConfigState() {
      // Calculate total price
      var base = basePrices[selectedRegion] || 265;
      // Extra followers: +€15 per 10k above 10k
      var extraFollowersCost = Math.round(((followersCount - 10000) / 10000) * 15);
      var verificationCost = needVerification ? 100 : 0;
      var subtotal = base + extraFollowersCost + verificationCost;
      var total = isUrgent ? Math.round(subtotal * 1.2) : subtotal;

      // Update Summary Side
      if (summary) {
        // Country Name & Flag
        var countryEl = summary.querySelector('.summary-country, h3');
        if (countryEl) countryEl.textContent = regionNames[selectedRegion] || 'Франция';

        // Followers line
        var packageLine = summary.querySelector('.summary-package span:last-child, .summary-line:nth-child(2) span:last-child');
        if (packageLine) packageLine.textContent = followersCount.toLocaleString() + ' подписчиков';

        // Verification line
        var verifLine = summary.querySelector('.summary-line:nth-child(3) span:last-child, [data-summary-verification]');
        if (verifLine) verifLine.textContent = needVerification ? 'Да (+€100)' : 'Нет';

        // Price
        var priceEl = summary.querySelector('.config-price strong, .config-price span:first-child');
        if (priceEl) priceEl.textContent = '€' + total;

        var priceSub = summary.querySelector('.config-price span:last-child');
        if (priceSub) priceSub.textContent = followersCount.toLocaleString() + ' подписчиков • ' + (regionNames[selectedRegion] || 'Франция');

        // Order Note
        var noteEl = summary.querySelector('.config-order-note');
        if (noteEl) {
          noteEl.textContent = isUrgent ? 'Передача за 3–5 часов с момента покупки (Срочно).' : 'Передача за 12–24 часа с момента покупки.';
        }

        // Button link to Telegram
        var orderBtn = summary.querySelector('a.button-primary, a.button');
        if (orderBtn) {
          var msg = 'Привет! Хочу заказать аккаунт Satoritok:\n' +
            '• Регион: ' + regionNames[selectedRegion] + '\n' +
            '• Подписчики: ' + followersCount.toLocaleString() + '\n' +
            '• Верификация личности: ' + (needVerification ? 'Да' : 'Нет') + '\n' +
            '• Срок: ' + (isUrgent ? 'Срочно (3-5 ч)' : 'Обычный (12-24 ч)') + '\n' +
            '• Итого: €' + total;
          orderBtn.setAttribute('href', 'https://t.me/satori_tok?text=' + encodeURIComponent(msg));
          orderBtn.setAttribute('target', '_blank');
        }
      }
    }

    // Step 01: Regions
    var regionOptions = configSection.querySelectorAll('.region-option, label.region-option');
    regionOptions.forEach(function(opt) {
      opt.style.cursor = 'pointer';
      opt.addEventListener('click', function(e) {
        e.preventDefault();
        var inp = opt.querySelector('input');
        var val = (inp && inp.value) || opt.getAttribute('data-value');
        if (!val) {
          var txt = opt.textContent.toLowerCase();
          if (txt.includes('франц')) val = 'fr';
          else if (txt.includes('герм')) val = 'de';
          else if (txt.includes('брит')) val = 'gb';
          else if (txt.includes('сша') || txt.includes('usa')) val = 'us';
        }
        if (val) {
          selectedRegion = val;
          regionOptions.forEach(function(r) {
            r.classList.remove('is-selected');
            var i = r.querySelector('input');
            if (i) i.checked = false;
          });
          opt.classList.add('is-selected');
          if (inp) inp.checked = true;
          updateConfigState();
        }
      });
    });

    // Step 02: Followers slider
    var followersSlider = configSection.querySelector('.control-step:nth-child(2) [data-slot="slider"], .followers-slider');
    var followersDisplay = configSection.querySelector('.control-step:nth-child(2) .font-mono, .control-step:nth-child(2) .step-value, .control-step:nth-child(2) .text-xl, .control-step:nth-child(2) strong');
    if (followersSlider) {
      followersSlider.style.cursor = 'pointer';
      var fThumb = followersSlider.querySelector('[data-slot="slider-thumb"]');
      var fRange = followersSlider.querySelector('[data-slot="slider-range"]');
      if (fThumb) fThumb.style.display = 'block';

      function handleFollowers(e) {
        var rect = followersSlider.getBoundingClientRect();
        var clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
        var pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        
        // 10 000 to 100 000 in steps of 1000
        followersCount = Math.round((10000 + pct * 90000) / 1000) * 1000;
        
        if (fRange) fRange.style.right = ((1 - pct) * 100) + '%';
        if (fThumb) fThumb.parentElement.style.left = (pct * 100) + '%';
        if (followersDisplay) followersDisplay.textContent = followersCount.toLocaleString();

        updateConfigState();
      }

      followersSlider.addEventListener('click', handleFollowers);
      var isDragF = false;
      followersSlider.addEventListener('mousedown', function() { isDragF = true; });
      window.addEventListener('mouseup', function() { isDragF = false; });
      window.addEventListener('mousemove', function(e) { if (isDragF) handleFollowers(e); });
    }

    // Step 03: Verification (Да / Нет)
    var binaryOptions = configSection.querySelectorAll('.binary-option, label.binary-option');
    binaryOptions.forEach(function(opt) {
      opt.style.cursor = 'pointer';
      opt.addEventListener('click', function(e) {
        e.preventDefault();
        binaryOptions.forEach(function(b) {
          b.classList.remove('is-selected');
          var i = b.querySelector('input');
          if (i) i.checked = false;
        });
        opt.classList.add('is-selected');
        var inp = opt.querySelector('input');
        if (inp) inp.checked = true;
        
        needVerification = opt.textContent.trim().toLowerCase().startsWith('да') || (inp && inp.value === 'yes');
        updateConfigState();
      });
    });

    // Step 04: Urgency (12-24 ч / 3-5 ч)
    var deliveryOptions = configSection.querySelectorAll('.delivery-option, label.delivery-option');
    deliveryOptions.forEach(function(opt) {
      opt.style.cursor = 'pointer';
      opt.addEventListener('click', function(e) {
        e.preventDefault();
        deliveryOptions.forEach(function(d) {
          d.classList.remove('is-selected');
          var i = d.querySelector('input');
          if (i) i.checked = false;
        });
        opt.classList.add('is-selected');
        var inp = opt.querySelector('input');
        if (inp) inp.checked = true;

        isUrgent = opt.textContent.includes('3–5') || opt.textContent.includes('3-5') || (inp && inp.value === 'urgent');
        updateConfigState();
      });
    });

    // Copy parameters button
    var copyBtn = summary ? summary.querySelector('.copy-config, button.copy-config') : null;
    if (copyBtn) {
      copyBtn.style.cursor = 'pointer';
      copyBtn.addEventListener('click', function(e) {
        e.preventDefault();
        var textToCopy = 'Satoritok Аккаунт:\n' +
          'Регион: ' + regionNames[selectedRegion] + '\n' +
          'Подписчики: ' + followersCount.toLocaleString() + '\n' +
          'Верификация: ' + (needVerification ? 'Да' : 'Нет') + '\n' +
          'Срок: ' + (isUrgent ? '3-5 часов' : '12-24 часа');
        navigator.clipboard.writeText(textToCopy).then(function() {
          var orig = copyBtn.textContent;
          copyBtn.textContent = '✓ Скопировано!';
          setTimeout(function() { copyBtn.textContent = orig; }, 2000);
        });
      });
    }

    updateConfigState();
  }

  // ==========================================
  // 4. SERVICES PHONES & SCREENS (Screenshots 4 & 5)
  // ==========================================
  function initServicesPhones() {
    // Phone 1: Tax Help / USA Verification
    var taxStage = document.querySelector('.service-phone-stage, .service-preview');
    if (taxStage) {
      var tabs = document.querySelectorAll('.service-preview-link, [role="tablist"] button, .service-toggle button');
      var screen1 = taxStage.querySelector('.identity-screen, [data-screen="identity"], .service-screen-0');
      var screen2 = taxStage.querySelector('.tax-screen, [data-screen="tax"], .service-screen-1');
      var gotItBtn = taxStage.querySelector('.service-phone button, .phone-viewport button, button.phone-pink');

      function switchTaxScreen(screenIndex) {
        tabs.forEach(function(t, i) {
          if (i === screenIndex) {
            t.setAttribute('data-state', 'active');
            t.classList.add('active', 'bg-background', 'text-foreground');
          } else {
            t.setAttribute('data-state', 'inactive');
            t.classList.remove('active', 'bg-background', 'text-foreground');
          }
        });
        if (screenIndex === 1) {
          if (screen1) screen1.style.display = 'none';
          if (screen2) screen2.style.display = 'block';
        } else {
          if (screen1) screen1.style.display = 'block';
          if (screen2) screen2.style.display = 'none';
        }
      }

      tabs.forEach(function(t, idx) {
        t.style.cursor = 'pointer';
        t.addEventListener('click', function(e) {
          e.preventDefault();
          switchTaxScreen(idx);
        });
      });

      if (gotItBtn) {
        gotItBtn.style.cursor = 'pointer';
        gotItBtn.addEventListener('click', function(e) {
          e.preventDefault();
          // Animate checkmark or toggle next step
          gotItBtn.textContent = '✓ Verified!';
          setTimeout(function() { gotItBtn.textContent = 'Got it >'; }, 1500);
        });
      }
    }

    // Phone 2: CRP Activation Phone
    var actStage = document.querySelector('.activation-phone-stage');
    if (actStage) {
      var benefitCards = actStage.querySelectorAll('.activation-benefit');
      benefitCards.forEach(function(card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
          e.preventDefault();
          benefitCards.forEach(function(c) { c.classList.remove('is-selected'); });
          card.classList.add('is-selected');
        });
      });

      var joinBtn = actStage.querySelector('.activation-join, .phone-pink');
      if (joinBtn) {
        joinBtn.style.cursor = 'pointer';
        joinBtn.addEventListener('click', function(e) {
          e.preventDefault();
          joinBtn.textContent = '✓ Заявка отправлена!';
          joinBtn.style.backgroundColor = 'var(--cyan)';
          joinBtn.style.color = '#000';
          setTimeout(function() {
            window.open('https://t.me/satori_tok?text=' + encodeURIComponent('Привет! Хочу обсудить активацию Creator Rewards Program.'), '_blank');
          }, 600);
        });
      }

      // Input Followers
      var followersInp = document.querySelector('#activation-followers, input[type="number"]');
      if (followersInp) {
        followersInp.addEventListener('input', function() {
          var val = parseInt(followersInp.value) || 0;
          var checkNote = document.querySelector('.activation-status-note, .text-muted-foreground');
          if (checkNote && val >= 10000) {
            checkNote.textContent = '✓ Требование по подписчикам выполнено (10k+). Можно подключать CRP!';
            checkNote.style.color = 'var(--cyan)';
          }
        });
      }
    }
  }

  // ==========================================
  // 5. HERO 3D PHONE (First Screen)
  // ==========================================
  function initHeroPhone() {
    var phone = document.querySelector('.phone-stage, #phone-demo');
    if (!phone) return;

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

    var pinkBtn = phone.querySelector('.phone-pink');
    if (pinkBtn) {
      pinkBtn.style.cursor = 'pointer';
      pinkBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://t.me/satori_tok', '_blank');
      });
    }

    var handleBtn = phone.querySelector('.profile-handle');
    if (handleBtn) {
      handleBtn.style.cursor = 'pointer';
      handleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.open('https://t.me/satori_tok', '_blank');
      });
    }
  }

  // ==========================================
  // 6. ACCORDIONS (Services & FAQ)
  // ==========================================
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

  // ==========================================
  // 7. NAVIGATION & TELEGRAM LINKS
  // ==========================================
  function initNavigationAndLinks() {
    var path = window.location.pathname;
    var isUk = path.includes('uk') || path.includes('_1') || document.documentElement.lang === 'uk';
    var isEn = path.includes('en') || path.includes('_2') || document.documentElement.lang === 'en';
    var homeUrl = isUk ? 'uk.html' : (isEn ? 'en.html' : 'index.html');

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

  // ==========================================
  // 8. MOBILE MENU
  // ==========================================
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

  // ==========================================
  // 9. AUDIO PLAYERS
  // ==========================================
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
