/* 马哥赢创 · 方法论手册 交互层
   阅读进度 / 侧栏 scrollspy / 入场动画 / 翻转自测卡 / 交互清单(localStorage) / 一键复制 / Tweaks */
(function () {
  'use strict';

  /* ---------- 阅读进度条 ---------- */
  var pbar = document.getElementById('pbar');
  function prog() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (pbar) pbar.style.width = p + '%';
  }

  /* ---------- 侧栏 scrollspy ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var secs = links.map(function (a) {
    var id = a.getAttribute('href').slice(1);
    return document.getElementById(id);
  });
  function spy() {
    var y = window.scrollY + 140;
    var cur = -1;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i] && secs[i].offsetTop <= y) cur = i;
    }
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
    var ring = document.querySelector('.ring');
    if (ring) {
      var h = document.documentElement;
      var p = Math.round(((h.scrollTop) / (h.scrollHeight - h.clientHeight || 1)) * 100);
      ring.style.setProperty('--p', p);
      var b = ring.querySelector('b'); if (b) b.textContent = p + '%';
    }
  }

  var tick = false;
  function onScroll() {
    if (tick) return;
    tick = true;
    requestAnimationFrame(function () { prog(); spy(); tick = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  /* ---------- 入场动画 ---------- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('vis'); });
  }

  /* ---------- 翻转自测卡 ---------- */
  document.querySelectorAll('.flip').forEach(function (f) {
    f.addEventListener('click', function () { f.classList.toggle('on'); });
  });

  /* ---------- 交互清单（localStorage 记忆） ---------- */
  var KEY = 'mage-manual-ck-' + (document.body.getAttribute('data-book') || 'book');
  var store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { store = {}; }
  var items = Array.prototype.slice.call(document.querySelectorAll('.ckgroup li'));
  function ckPaint() {
    var done = 0;
    items.forEach(function (li, i) {
      var on = !!store[i];
      li.classList.toggle('done', on);
      if (on) done++;
    });
    var cnt = document.querySelector('.ckbar .cnt');
    var bar = document.querySelector('.cktrack i');
    if (cnt) cnt.textContent = done + ' / ' + items.length;
    if (bar) bar.style.width = (items.length ? (done / items.length) * 100 : 0) + '%';
    /* 侧栏章节打勾 */
    var ckSec = document.querySelector('.ckgroup');
    if (ckSec) {
      var a = document.querySelector('.toc a[href="#' + (ckSec.closest('section') || { id: '' }).id + '"]');
      if (a) a.classList.toggle('done', done === items.length && items.length > 0);
    }
  }
  items.forEach(function (li, i) {
    li.addEventListener('click', function () {
      store[i] = !store[i];
      try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) {}
      ckPaint();
    });
  });
  ckPaint();

  /* ---------- 一键复制提示词 ---------- */
  document.querySelectorAll('.cp').forEach(function (btn) {
    btn.addEventListener('click', function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      var pre = btn.closest('.fbox').querySelector('pre');
      var txt = pre.innerText;
      function ok() {
        btn.textContent = '已复制 ✓'; btn.classList.add('ok');
        setTimeout(function () { btn.textContent = '复制'; btn.classList.remove('ok'); }, 1600);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(ok, function () { fallback(); });
      } else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  /* ---------- Tweaks 面板 ---------- */
  var twBtn = document.getElementById('twBtn');
  var twPanel = document.getElementById('twPanel');
  if (twBtn && twPanel) {
    twBtn.addEventListener('click', function () { twPanel.classList.toggle('on'); });
    document.addEventListener('click', function (e) {
      if (!twPanel.contains(e.target) && e.target !== twBtn && !twBtn.contains(e.target)) {
        twPanel.classList.remove('on');
      }
    });
    /* 字号 */
    var fsSeg = twPanel.querySelectorAll('[data-fs]');
    var curFs = localStorage.getItem('mage-manual-fs') || 'm';
    function setFs(v) {
      curFs = v;
      document.documentElement.style.setProperty('--fs', v === 's' ? '14.5px' : v === 'l' ? '17.5px' : '16px');
      fsSeg.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-fs') === v); });
      localStorage.setItem('mage-manual-fs', v);
    }
    fsSeg.forEach(function (b) {
      b.addEventListener('click', function () { setFs(b.getAttribute('data-fs')); });
    });
    setFs(curFs);
    /* 马哥说 */
    var saySw = twPanel.querySelector('[data-say]');
    if (saySw) {
      var sayOn = localStorage.getItem('mage-manual-say') !== '0';
      function setSay(v) {
        sayOn = v;
        document.body.classList.toggle('nosay', !v);
        saySw.classList.toggle('on', v);
        localStorage.setItem('mage-manual-say', v ? '1' : '0');
      }
      saySw.addEventListener('click', function () { setSay(!sayOn); });
      setSay(sayOn);
    }
    /* 重置清单 */
    var rst = twPanel.querySelector('[data-reset]');
    if (rst) rst.addEventListener('click', function () {
      store = {};
      try { localStorage.removeItem(KEY); } catch (e) {}
      ckPaint();
    });
  }

  /* ---------- 回顶 ---------- */
  var topBtn = document.getElementById('topBtn');
  if (topBtn) topBtn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  prog(); spy();
})();

/* ============================================================
   移动端增强层
   ============================================================ */
(function () {
  'use strict';
  var mq = window.matchMedia('(max-width:960px)');

  /* ---------- 吸顶栏高度 -> CSS 变量（锚点跳转不被遮挡） ---------- */
  var side = document.querySelector('.side');
  function measure() {
    if (side && mq.matches) {
      document.documentElement.style.setProperty('--stickyh', side.offsetHeight + 'px');
    }
  }
  measure();
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  if (window.ResizeObserver && side) new ResizeObserver(measure).observe(side);
  /* 字体加载完会改变高度，再量一次 */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

  /* ---------- 目录胶囊：高亮项自动滚到可见区 ---------- */
  var tocBox = document.querySelector('.toc');
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a'));
  var lastOn = null;
  function followPill() {
    if (!mq.matches || !tocBox) return;
    var on = tocBox.querySelector('a.on');
    if (!on || on === lastOn) return;
    lastOn = on;
    /* 用视口坐标差算相对偏移，不依赖 offsetParent（.toc 无定位上下文，offsetLeft 不可靠） */
    var boxR = tocBox.getBoundingClientRect();
    var onR = on.getBoundingClientRect();
    var rel = onR.left - boxR.left + tocBox.scrollLeft;      /* 胶囊在滚动内容里的起点 */
    var want = rel - (tocBox.clientWidth - onR.width) / 2;   /* 居中 */
    var max = tocBox.scrollWidth - tocBox.clientWidth;
    want = Math.max(0, Math.min(want, max));
    if (Math.abs(want - tocBox.scrollLeft) > 8) {
      if (tocBox.scrollTo) tocBox.scrollTo({ left: want, behavior: 'smooth' });
      else tocBox.scrollLeft = want;
    }
  }
  var t = false;
  window.addEventListener('scroll', function () {
    if (t) return; t = true;
    requestAnimationFrame(function () { followPill(); t = false; });
  }, { passive: true });
  followPill();

  /* ---------- 表格横向滑动提示（手机上看不出能滑） ---------- */
  document.querySelectorAll('.tw').forEach(function (w) {
    var tb = w.querySelector('table');
    if (!tb) return;
    function check() {
      var over = w.scrollWidth - w.clientWidth > 12;
      var hint = w.previousElementSibling;
      var has = hint && hint.classList && hint.classList.contains('scrollhint');
      if (over && mq.matches && !has) {
        var d = document.createElement('div');
        d.className = 'scrollhint';
        d.textContent = '← 左右滑动看完整表格 →';
        w.parentNode.insertBefore(d, w);
      } else if ((!over || !mq.matches) && has) {
        hint.remove();
      }
    }
    check();
    window.addEventListener('resize', check);
    w.addEventListener('scroll', function () {
      if (w.scrollLeft > 20) {
        var h = w.previousElementSibling;
        if (h && h.classList.contains('scrollhint')) h.style.display = 'none';
      }
    }, { passive: true });
  });

  /* ---------- 双册切换悬浮导航（手机端跨册跳转） ---------- */
  /* id 必须与 HTML <body data-book="..."> 完全一致：book1=jiegou, book2=qiguan */
  var BOOKS = [
    { id: 'jiegou', file: 'book1.html', no: '第一册', name: '爆款短视频结构方法论', tag: '开头 · 中间 · 结尾 · 引流' },
    { id: 'qiguan', file: 'book2.html', no: '第二册', name: 'AIGC 视觉奇观开头实操手册', tag: '首帧图 · 提示词 · 奇观配方' }
  ];
  var cur = document.body.getAttribute('data-book');
  var others = BOOKS.filter(function (b) { return b.id !== cur; });
  /* 常驻插入，由 CSS 控制显隐 —— 横竖屏切换/放大缩小都正确响应 */
  if (others.length) {
    var nav = document.createElement('div');
    nav.className = 'booknav';
    nav.innerHTML = others.map(function (b) {
      return '<a class="bnav" href="' + b.file + '">' +
             '<span class="bn1">' + b.no + '</span>' +
             '<span class="bn2">' + b.name + '</span>' +
             '<span class="bn3">' + b.tag + '</span></a>';
    }).join('');
    document.body.appendChild(nav);
  }

  /* ---------- 长按复制：手机上没有右键，给出提示 ---------- */
  var firstPre = document.querySelector('.fbox pre');
  if (firstPre && mq.matches && !localStorage.getItem('mage-longpress-tip')) {
    firstPre.addEventListener('touchstart', function once() {
      var tip = document.createElement('div');
      tip.className = 'lptip';
      tip.textContent = '提示：右上角「复制」可一键复制，也可长按选中文字';
      document.body.appendChild(tip);
      setTimeout(function () { tip.classList.add('out'); }, 3600);
      setTimeout(function () { tip.remove(); }, 4100);
      localStorage.setItem('mage-longpress-tip', '1');
      firstPre.removeEventListener('touchstart', once);
    }, { once: true, passive: true });
  }
})();
