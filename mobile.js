// 손님용 모바일 메뉴: menu.json(src/publish.js mobileData)을 읽어 위쪽 탭(전체 / 카테고리별)으로 보여 줌
(function () {
  var list = document.getElementById('list'), tabs = document.getElementById('tabs');
  var data = null;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  // 가격 표기: 메뉴판과 같음 (src/look.js formatPrice)
  function price(p) {
    var fmt = data.look.price || 'won';
    if (fmt === 'short') return String(Math.round(p / 100) / 10);
    var n = p.toLocaleString('ko-KR');
    return fmt === 'symbol' ? '₩' + n : n + '원';
  }
  function item(i) {
    if (i.line) return el('div', 'line', i.name || '');
    var row = el('div', 'item' + (i.soldOut ? ' sold' : ''));
    var body = el('div', 'body'), name = el('div', 'name', i.name);
    if (i.featured) name.appendChild(el('span', 'badge', data.look.featuredLabel || '추천'));
    if (i.soldOut) name.appendChild(el('span', 'badge out', data.look.soldOutLabel || '품절'));
    body.appendChild(name);
    if (i.desc) body.appendChild(el('div', 'desc', i.desc));
    var p = el('div', 'price');
    var sale = typeof i.sale === 'number' && i.sale >= 0 && i.sale < i.price;
    if (sale) { p.appendChild(el('s', null, price(i.price))); p.appendChild(document.createTextNode(price(i.sale))); } else p.textContent = price(i.price);
    body.appendChild(p);
    row.appendChild(body);
    if (i.image) { var img = el('img'); img.src = i.image; img.alt = ''; img.loading = 'lazy'; row.appendChild(img); }
    return row;
  }
  // sel: 카테고리 순번 (-1이면 전체). 주소 끝 #1처럼 남겨 새로고침·뒤로 가기에도 그대로
  function show(sel) {
    [].forEach.call(tabs.children, function (b, k) { b.setAttribute('aria-pressed', String(k - 1 === sel)); });
    list.textContent = '';
    data.categories.forEach(function (c, k) {
      if (sel !== -1 && k !== sel) return;
      var h = el('h2', null, c.name);
      if (c.hours) h.appendChild(el('small', null, c.hours));
      list.appendChild(h);
      c.items.forEach(function (i) { list.appendChild(item(i)); });
    });
    if (!data.categories.length) list.appendChild(el('p', 'empty', '준비 중입니다'));
  }
  function fromHash() {
    var k = parseInt(location.hash.slice(1), 10);
    return k >= 0 && k < data.categories.length ? k : -1;
  }

  // Pages가 몇 분씩 캐시하므로 매번 새로 받음
  fetch('menu.json?t=' + Date.now(), { cache: 'no-store' }).then(function (r) {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  }).then(function (d) {
    data = d;
    var root = document.documentElement.style;
    ['bg', 'card', 'text', 'muted', 'accent'].forEach(function (k) { if (d.look[k]) root.setProperty('--' + k, d.look[k]); });
    document.title = d.shop + ' 메뉴';
    document.getElementById('shop').textContent = d.shop;
    if (d.logo) { var logo = document.getElementById('logo'); logo.src = d.logo; logo.hidden = false; }
    ['전체'].concat(d.categories.map(function (c) { return c.name; })).forEach(function (name, k) {
      var b = el('button', null, name);
      b.type = 'button';
      b.onclick = function () { location.hash = k ? String(k - 1) : ''; show(k - 1); window.scrollTo(0, 0); };
      tabs.appendChild(b);
    });
    window.addEventListener('hashchange', function () { show(fromHash()); });
    show(fromHash());
  }).catch(function () {
    list.textContent = '';
    list.appendChild(el('p', 'empty', '메뉴를 불러오지 못했습니다. 잠시 뒤 다시 열어 주세요.'));
  });
})();
