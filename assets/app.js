/* ============================================================
 * FOSS-Nav 渲染逻辑
 * ============================================================
 *
 * 职责：
 *   1. 读取 window.__FOSS_NAV_TOOLS__（见 tools.js）
 *   2. 渲染顶部工具 tabs 与对应内容区
 *   3. 处理主题切换、hash 路由
 *
 * 设计：
 *   - 无第三方依赖
 *   - 任何字段缺失时优雅降级（不抛错、不留空白）
 *   - 新增工具时仅修改 tools.js
 *
 * ============================================================ */

(function () {
  'use strict';

  const TOOLS = window.__FOSS_NAV_TOOLS__ || [];
  const $tabs  = document.getElementById('toolTabs');
  const $main  = document.getElementById('toolContent');
  const $theme = document.getElementById('themeToggle');

  /* ---------- 工具函数 ---------- */

  const escapeHtml = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[c]);

  const safe = (v, fallback = '') => (v === undefined || v === null ? fallback : v);

  /** 将 accent 颜色应用到 CSS 变量，影响当前工具卡片装饰色 */
  const applyAccent = (color) => {
    if (!color) return;
    document.documentElement.style.setProperty('--card-accent', color);
  };

  /* ---------- 主题切换 ---------- */

  const THEME_KEY = 'foss-nav-theme';

  const getStoredTheme = () => {
    try { return localStorage.getItem(THEME_KEY); } catch { return null; }
  };

  const setStoredTheme = (t) => {
    try { localStorage.setItem(THEME_KEY, t); } catch { /* ignore */ }
  };

  const resolveTheme = (mode) => {
    if (mode === 'light' || mode === 'dark') return mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const applyTheme = (mode) => {
    const resolved = resolveTheme(mode);
    document.documentElement.setAttribute('data-theme', mode);
    if ($theme) $theme.textContent = mode === 'dark' ? '☀' : '🌙';
    $theme?.setAttribute('aria-label', `当前主题：${mode}（点击切换）`);
  };

  const initTheme = () => {
    const stored = getStoredTheme() || 'light';
    applyTheme(stored);

    // 跟随系统模式时监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      const cur = getStoredTheme() || 'light';
      if (cur === 'system' || !cur) applyTheme(cur);
    });
  };

  const toggleTheme = () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    setStoredTheme(next);
  };

  /* ---------- 路由 ---------- */

  const getInitialId = () => {
    const hash = (location.hash || '').replace(/^#\/?/, '');
    if (hash && TOOLS.some((t) => t.id === hash)) return hash;
    return TOOLS[0]?.id || null;
  };

  let currentId = null;

  const navigate = (id, opts = {}) => {
    const tool = TOOLS.find((t) => t.id === id);
    if (!tool) return;
    currentId = id;
    if (!opts.skipHash) {
      const newHash = '#/' + id;
      if (location.hash !== newHash) {
        history.replaceState(null, '', newHash);
      }
    }
    applyAccent(tool.accent);
    renderTabs();
    renderTool(tool);
    if (opts.scrollTop) window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ---------- 渲染：顶部 tabs ---------- */

  const renderTabs = () => {
    if (!$tabs) return;
    if (TOOLS.length === 0) {
      $tabs.innerHTML = '';
      return;
    }
    $tabs.innerHTML = TOOLS.map((t) => `
      <button
        class="tool-tab ${t.id === currentId ? 'active' : ''}"
        data-tool="${escapeHtml(t.id)}"
        title="${escapeHtml(t.tagline || t.name)}"
      >
        <span class="tool-tab-icon">${escapeHtml(safe(t.icon, '🔧'))}</span>
        <span>${escapeHtml(t.name)}</span>
      </button>
    `).join('');
    $tabs.querySelectorAll('.tool-tab').forEach((el) => {
      el.addEventListener('click', () => navigate(el.dataset.tool, { scrollTop: true }));
    });
  };

  /* ---------- 渲染：单工具内容 ---------- */

  const renderHero = (t) => `
    <section class="hero" id="overview">
      <div class="container">
        <div class="hero-inner">
          <div>
            <div class="hero-meta">
              ${t.status ? `<span class="badge status-${escapeHtml(t.status)}">● ${statusLabel(t.status)}</span>` : ''}
              ${t.version ? `<span class="badge version">v${escapeHtml(t.version)}</span>` : ''}
              ${t.license ? `<span class="badge">${escapeHtml(t.license)}</span>` : ''}
              ${t.author ? `<span class="badge">@${escapeHtml(t.author)}</span>` : ''}
            </div>
            <h1 class="hero-title">${escapeHtml(t.name)}</h1>
            <p class="hero-tagline">${escapeHtml(t.tagline || '')}</p>
            <p class="hero-desc">${escapeHtml(t.tagline_long || '')}</p>

            ${renderActions(t)}

            ${renderStats(t)}
          </div>

          ${renderHeroAside(t)}
        </div>
      </div>
    </section>
  `;

  const statusLabel = (s) => ({
    active:   '活跃维护',
    beta:     '公开测试',
    wip:      '开发中',
    archived: '已归档'
  }[s] || s);

  const renderActions = (t) => {
    const repos = t.repos || [];
    if (repos.length === 0) return '';
    const primary = repos[0];
    const others = repos.slice(1);
    return `
      <div class="hero-actions">
        ${primary ? `
          <a class="btn btn-primary" href="${escapeHtml(primary.url)}" target="_blank" rel="noopener">
            📦 ${escapeHtml(primary.label)}
          </a>` : ''}
        ${others.map((r) => `
          <a class="btn btn-secondary" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">
            🔗 ${escapeHtml(r.label)}
          </a>
        `).join('')}
        ${t.docs ? `
          <a class="btn btn-tertiary" href="${escapeHtml(t.docs)}" target="_blank" rel="noopener">
            📘 使用文档
          </a>` : ''}
      </div>
    `;
  };

  const renderStats = (t) => {
    const stats = t.stats || [];
    if (stats.length === 0) return '';
    return `
      <div class="hero-stats">
        ${stats.map((s) => `
          <div class="stat-card">
            <div class="stat-value">
              ${escapeHtml(s.value)}<span class="stat-unit">${escapeHtml(s.unit || '')}</span>
            </div>
            <div class="stat-label">${escapeHtml(s.label)}</div>
          </div>
        `).join('')}
      </div>
    `;
  };

  const renderHeroAside = (t) => {
    const tags = t.tags || [];
    if (tags.length === 0) return '';
    return `
      <aside class="hero-tags">
        <h3 class="hero-tags-title">技术标签</h3>
        <div class="tag-cloud">
          ${tags.map((tag, i) => `
            <span class="tag ${i < 3 ? 'is-accent' : ''}">${escapeHtml(tag)}</span>
          `).join('')}
        </div>
      </aside>
    `;
  };

  /* --- downloads --- */

  /* 软件下载区块：放在「核心功能」之前
     - 推荐下载走 hero 大卡（带渐变 + 推荐徽章）
     - 其余 3 个走 grid 二级卡
     - SHA-256 配复制按钮（事件代理，boot 里挂） */
  const renderDownloadCard = (item, isHero, meta) => {
    const ver     = (meta && meta.version) || (t.version) || '';
    const released = (meta && meta.releasedAt) || (t.downloads && t.downloads.releasedAt) || '—';
    const platformLabel = item.platform === 'x64' ? 'Windows x64' : 'Windows x86 / ia32';
    const typeLabel     = item.type === 'portable' ? 'Portable · 免安装' : 'Installer · NSIS 安装包';
    const shortSha      = (item.sha256 || '').slice(0, 12) + '…' + (item.sha256 || '').slice(-6);
    const dataSha       = escapeHtml(item.sha256 || '');

    return `
      <div class="dl-card${isHero ? ' dl-card-hero' : ''}">
        ${isHero && item.recommended ? '<div class="dl-badge">⭐ 推荐下载</div>' : ''}
        <div class="dl-card-top">
          <div class="dl-icon">${escapeHtml(item.icon || '⬇')}</div>
          <div class="dl-titles">
            <h3 class="dl-label">${escapeHtml(item.label || '')}</h3>
            <div class="dl-meta">
              <span class="dl-chip dl-chip-platform">${escapeHtml(platformLabel)}</span>
              <span class="dl-chip dl-chip-type">${escapeHtml(typeLabel)}</span>
            </div>
          </div>
        </div>
        <p class="dl-desc">${escapeHtml(item.desc || '')}</p>
        <div class="dl-filename">
          <code>${escapeHtml(item.filename || '')}</code>
        </div>
        <div class="dl-stats">
          <span class="dl-stat"><b>${escapeHtml(item.sizeText || '')}</b><i>大小</i></span>
          <span class="dl-stat"><b>v${escapeHtml(ver)}</b><i>版本</i></span>
          <span class="dl-stat"><b>${escapeHtml(released)}</b><i>发布</i></span>
        </div>
        <a class="dl-btn ${isHero ? 'dl-btn-primary' : 'dl-btn-secondary'}"
           href="${escapeHtml(item.url)}" rel="noopener">
          <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M8 1.5a.75.75 0 01.75.75v6.69l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 8.03a.75.75 0 011.06-1.06l1.97 1.97V2.25A.75.75 0 018 1.5z"/>
            <path fill="currentColor" d="M2.5 12.25a.75.75 0 011.5 0v.75a.75.75 0 00.75.75h6.5a.75.75 0 00.75-.75v-.75a.75.75 0 011.5 0v.75A2.25 2.25 0 0110.75 15h-6.5A2.25 2.25 0 012 13v-.75z"/>
          </svg>
          下载 .exe
        </a>
        <div class="dl-sha">
          <span class="dl-sha-label">SHA-256</span>
          <code class="dl-sha-text" title="${dataSha}">${escapeHtml(shortSha)}</code>
          <button class="dl-sha-copy js-copy-sha" type="button"
                  data-sha="${dataSha}" aria-label="复制 SHA-256">
            <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
              <path fill="currentColor" d="M5.75 1.5a1.75 1.75 0 00-1.75 1.75v.5H3.5A1.75 1.75 0 001.75 5.5v8A1.75 1.75 0 003.5 15.25h7a1.75 1.75 0 001.75-1.75v-.5h.5a1.75 1.75 0 001.75-1.75v-7A1.75 1.75 0 0012.75 2.5h-7zM5 3.25a.25.25 0 01.25-.25h7a.25.25 0 01.25.25v7a.25.25 0 01-.25.25h-.5V5.5A1.75 1.75 0 0010 3.75H5v-.5zM3.5 5h6.5a.25.25 0 01.25.25v7.5a.25.25 0 01-.25.25h-6.5a.25.25 0 01-.25-.25v-7.5A.25.25 0 013.5 5z"/>
            </svg>
            <span>复制</span>
          </button>
        </div>
      </div>
    `;
  };

  const renderDownloads = (t) => {
    const d = t.downloads;
    if (!d || !Array.isArray(d.items) || d.items.length === 0) return '';

    const hero = d.items.find((x) => x.recommended) || d.items[0];
    const others = d.items.filter((x) => x !== hero);
    const meta  = { version: d.version, releasedAt: d.releasedAt };

    const sourceHtml = d.source ? `
      <a class="dl-source" href="${escapeHtml(d.source.url || '#')}" target="_blank" rel="noopener">
        <svg viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
          <path fill="currentColor" fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
        </svg>
        <div class="dl-source-text">
          <span class="dl-source-label">${escapeHtml(d.source.label || '查看源码')}</span>
          ${d.source.hint ? `<span class="dl-source-hint">${escapeHtml(d.source.hint)}</span>` : ''}
        </div>
        <span class="dl-source-arrow">↗</span>
      </a>
    ` : '';

    /* 额外链接卡组：Release 页 / SHA256SUMS.txt —— 共用 dl-source 样式 */
    const extraLinks = [d.releasePage, d.checksums].filter(Boolean);
    const extraHtml = extraLinks.length ? `
      <div class="dl-extras">
        ${extraLinks.map((l) => `
          <a class="dl-source dl-source-compact" href="${escapeHtml(l.url || '#')}" target="_blank" rel="noopener">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M2 2.75A2.75 2.75 0 014.75 0h6.5A2.75 2.75 0 0114 2.75v10.5A2.75 2.75 0 0111.25 16h-6.5A2.75 2.75 0 012 13.25V2.75zM4.75 1.5a1.25 1.25 0 00-1.2 1.5h8.9a1.25 1.25 0 00-1.2-1.5h-6.5zM3.5 4.5v8.75c0 .69.56 1.25 1.25 1.25h6.5c.69 0 1.25-.56 1.25-1.25V4.5h-9zM5 6.5h6v1H5v-1zm0 2.5h6v1H5V9zm0 2.5h4v1H5v-1z"/>
            </svg>
            <div class="dl-source-text">
              <span class="dl-source-label">${escapeHtml(l.label || '')}</span>
              ${l.hint ? `<span class="dl-source-hint">${escapeHtml(l.hint)}</span>` : ''}
            </div>
            <span class="dl-source-arrow">↗</span>
          </a>
        `).join('')}
      </div>
    ` : '';

    const reqHtml = (d.requirements || []).length ? `
      <div class="dl-req">
        <h4 class="dl-req-title">运行要求</h4>
        <ul class="dl-req-list">
          ${d.requirements.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    return `
      <section class="section" id="downloads">
        <div class="container">
          <div class="section-head">
            <h2>${escapeHtml(d.title || '下载')}</h2>
            <p>${escapeHtml(d.subtitle || '')}</p>
          </div>
          <div class="dl-hero">
            ${renderDownloadCard(hero, true, meta)}
          </div>
          ${others.length ? `
            <h3 class="dl-subhead">其他下载</h3>
            <div class="dl-grid">
              ${others.map((it) => renderDownloadCard(it, false, meta)).join('')}
            </div>
          ` : ''}
          ${sourceHtml}
          ${extraHtml}
          ${reqHtml}
        </div>
      </section>
    `;
  };

  /* --- features --- */

  const renderFeatures = (t) => {
    const items = t.highlights || [];
    if (items.length === 0) return '';
    return `
      <section class="section" id="features">
        <div class="container">
          <div class="section-head">
            <h2>核心功能</h2>
            <p>${escapeHtml(t.name)} 能为你做什么</p>
          </div>
          <div class="grid grid-3">
            ${items.map((h) => `
              <article class="card feature-card">
                <div class="feature-icon">${escapeHtml(h.icon || '✨')}</div>
                <h3 class="feature-title">${escapeHtml(h.title)}</h3>
                <p class="feature-desc">${escapeHtml(h.desc)}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  /* --- panels --- */

  const renderPanels = (t) => {
    const items = t.panels || [];
    if (items.length === 0) return '';
    return `
      <section class="section" id="panels">
        <div class="container">
          <div class="section-head">
            <h2>功能面板</h2>
            <p>界面左侧 Tab 切换，对应工具内部的导航</p>
          </div>
          <div class="grid grid-3">
            ${items.map((p) => `
              <article class="card panel-card">
                <div class="panel-icon">${escapeHtml(p.icon || '📋')}</div>
                <div class="panel-body">
                  <div class="panel-name">${escapeHtml(p.name)}</div>
                  <p class="panel-desc">${escapeHtml(p.desc)}</p>
                </div>
              </article>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  /* --- workflow --- */

  const renderWorkflow = (t) => {
    const steps = t.workflow || [];
    if (steps.length === 0) return '';
    return `
      <section class="section" id="workflow">
        <div class="container">
          <div class="section-head">
            <h2>使用流程</h2>
            <p>从打开软件到拿到数据，按这 6 步走</p>
          </div>
          <div class="workflow">
            ${steps.map((s, i) => `
              <div class="workflow-step">
                <div class="workflow-num">${i + 1}</div>
                <div class="workflow-body">
                  <h3 class="workflow-title">${escapeHtml(s.title)}</h3>
                  <p class="workflow-desc">${escapeHtml(s.desc)}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  /* --- tech stack --- */

  const renderTech = (t) => {
    const groups = t.techStack || [];
    if (groups.length === 0) return '';
    return `
      <section class="section" id="tech">
        <div class="container">
          <div class="section-head">
            <h2>技术栈</h2>
            <p>构建 ${escapeHtml(t.name)} 用到的关键技术</p>
          </div>
          <div class="grid grid-${groups.length >= 4 ? '4' : (groups.length === 3 ? '3' : '2')}">
            ${groups.map((g) => `
              <div class="tech-group">
                <h3 class="tech-group-name">${escapeHtml(g.group)}</h3>
                <div class="tech-group-items">
                  ${(g.items || []).map((it) => `<span class="tech-item">${escapeHtml(it)}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  /* --- versions --- */

  const renderVersions = (t) => {
    const versions = t.versions || [];
    if (versions.length === 0) return '';
    return `
      <section class="section" id="versions">
        <div class="container">
          <div class="section-head">
            <h2>版本历史</h2>
            <p>从最初版本到当前的演进</p>
          </div>
          <div class="version-list">
            ${versions.map((v, i) => `
              <div class="version-item ${i === 0 ? 'is-latest' : ''}">
                <div class="version-meta">
                  <div class="version-label">${escapeHtml(v.label || '')}</div>
                  <div class="version-year">${escapeHtml(v.year || '')}</div>
                </div>
                <div>
                  <h3 class="version-title">${escapeHtml(v.title || '')}</h3>
                  <p class="version-desc">${escapeHtml(v.desc || '')}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  };

  /* --- architecture --- */

  /* 将结构化 archSpec 渲染为一张 SVG 架构图。
     横向 swim-lane：每条 lane = 一个进程/层，模块 = 圆角色块；
     进程间通信 = 直线箭头（实线） / 异步推送 = 虚线弧形（reverse）。
     所有颜色走 CSS 变量，自动随主题切换。 */
  const renderArchDiagram = (spec) => {
    if (!spec || !Array.isArray(spec.lanes) || spec.lanes.length === 0) return '';

    /* 布局参数（viewBox 坐标） */
    const W = 920;
    const TITLE_H = 64;
    const LANE_X = 20;
    const LANE_W = W - LANE_X * 2;          // 880
    const LANE_LABEL_W = 124;               // 左侧进程名宽度
    const LANE_PAD = 14;                    // lane 内左右内边距
    const LANE_GAP = 56;                    // lane 之间给箭头留的垂直间距
    const MOD_W = 220;                      // 模块宽
    const MOD_H = 96;                       // 模块高
    const MOD_GAP = 18;                     // 模块水平间距
    const LEGEND_H = 56;

    /* lane 高度：根据模块数量自适应（一行最多 3 个） */
    const laneHeights = spec.lanes.map((lane) => {
      const rows = Math.max(1, Math.ceil((lane.modules || []).length / 3));
      return Math.max(110, rows * (MOD_H + 14) + 24);
    });

    const lanesTotalH = laneHeights.reduce((a, b) => a + b, 0)
                      + LANE_GAP * (spec.lanes.length - 1);
    const H = TITLE_H + lanesTotalH + 30 + LEGEND_H + 16;

    /* 模块水平排布：3 个满铺；不足居中 */
    const moduleAreaW = LANE_W - LANE_LABEL_W - LANE_PAD * 2 - 20;
    const placeModules = (lane) => {
      const mods = lane.modules || [];
      const totalW = mods.length * MOD_W + Math.max(0, mods.length - 1) * MOD_GAP;
      const startX = LANE_X + LANE_LABEL_W + LANE_PAD
                   + Math.max(0, (moduleAreaW - totalW) / 2);
      return mods.map((m, i) => ({
        x: startX + i * (MOD_W + MOD_GAP),
        m
      }));
    };

    const parts = [];

    /* 容器 SVG */
    parts.push(
      `<svg class="arch-diagram" viewBox="0 0 ${W} ${H}" ` +
      `xmlns="http://www.w3.org/2000/svg" role="img" ` +
      `aria-label="${escapeHtml(spec.title || '架构图')}">`
    );

    /* defs：箭头 marker + 渐变 + 滤镜 */
    parts.push(`<defs>
      <marker id="arch-arrow" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="ad-flow-arrow" />
      </marker>
      <marker id="arch-arrow-dashed" viewBox="0 0 10 10" refX="9" refY="5"
              markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" class="ad-flow-arrow" />
      </marker>
      <linearGradient id="arch-accent-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" class="ad-grad-accent-top" />
        <stop offset="100%" class="ad-grad-accent-bot" />
      </linearGradient>
      <linearGradient id="arch-muted-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" class="ad-grad-muted-top" />
        <stop offset="100%" class="ad-grad-muted-bot" />
      </linearGradient>
      <filter id="arch-shadow" x="-10%" y="-10%" width="120%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
        <feOffset dy="1.5" result="offsetblur" />
        <feComponentTransfer><feFuncA type="linear" slope="0.18" /></feComponentTransfer>
        <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>`);

    /* 标题 */
    parts.push(
      `<text class="ad-title" x="${W / 2}" y="28" text-anchor="middle">` +
      `${escapeHtml(spec.title || '')}</text>`
    );
    if (spec.subtitle) {
      parts.push(
        `<text class="ad-subtitle" x="${W / 2}" y="50" text-anchor="middle">` +
        `${escapeHtml(spec.subtitle)}</text>`
      );
    }

    /* 渲染每条 lane */
    const laneBounds = [];
    let cursorY = TITLE_H;
    spec.lanes.forEach((lane, idx) => {
      const lh = laneHeights[idx];
      const lx = LANE_X;
      const ly = cursorY;

      /* 泳道底色 + 描边 */
      parts.push(
        `<rect class="ad-lane-bg" x="${lx}" y="${ly}" width="${LANE_W}" height="${lh}" rx="12" />`
      );

      /* 进程名（左侧） */
      parts.push(
        `<text class="ad-lane-name" x="${lx + 18}" y="${ly + 30}">` +
        `${escapeHtml(lane.name || '')}</text>`
      );
      if (lane.subtitle) {
        parts.push(
          `<text class="ad-lane-sub" x="${lx + 18}" y="${ly + 52}">` +
          `${escapeHtml(lane.subtitle)}</text>`
        );
      }

      /* 进程名左侧色条 */
      parts.push(
        `<rect class="ad-lane-bar ${lane.tone === 'muted' ? 'ad-bar-muted' : 'ad-bar-accent'}" ` +
        `x="${lx + 1}" y="${ly + 14}" width="3" height="${lh - 28}" rx="1.5" />`
      );

      /* 模块 */
      const tone = lane.tone || 'accent';
      const placed = placeModules(lane);
      placed.forEach(({ x: mx, m }, j) => {
        const my = ly + (lh - MOD_H) / 2;
        parts.push(`<g class="ad-module ad-tone-${tone}">`);
        parts.push(
          `<rect class="ad-module-bg" x="${mx}" y="${my}" width="${MOD_W}" height="${MOD_H}" rx="10" ` +
          `filter="url(#arch-shadow)" />`
        );
        /* 顶部色条 */
        parts.push(
          `<rect class="ad-module-bar" x="${mx + 14}" y="${my + 14}" width="3" height="20" rx="1.5" />`
        );
        parts.push(
          `<text class="ad-module-name" x="${mx + 24}" y="${my + 28}">` +
          `${escapeHtml(m.name || '')}</text>`
        );
        if (m.icon) {
          parts.push(
            `<text class="ad-module-icon" x="${mx + MOD_W - 14}" y="${my + 28}" text-anchor="end">` +
            `${escapeHtml(m.icon)}</text>`
          );
        }
        /* 描述（两行截断） */
        const desc = (m.desc || '').slice(0, 50);
        parts.push(
          `<text class="ad-module-desc" x="${mx + 14}" y="${my + 56}">` +
          `<tspan>${escapeHtml(desc)}</tspan></text>`
        );
        parts.push(
          `<text class="ad-module-meta" x="${mx + 14}" y="${my + 76}">` +
          `module #${idx + 1}.${j + 1}</text>`
        );
        parts.push(`</g>`);
      });

      laneBounds.push({ y: ly, h: lh });
      cursorY += lh + LANE_GAP;
    });

    /* 进程间流：箭头 + 标签 */
    if (Array.isArray(spec.flows)) {
      const arrowX = W - 44;
      spec.flows.forEach((flow) => {
        const from = laneBounds[flow.fromLane];
        const to = laneBounds[flow.toLane];
        if (!from || !to) return;

        const reverse = !!flow.reverse;
        const yFrom = reverse ? from.y + 18 : from.y + from.h;
        const yTo   = reverse ? to.y + to.h - 18 : to.y;

        if (reverse) {
          /* 右侧弧形回环 */
          const r = 30;
          const path = `M ${arrowX} ${yFrom} ` +
                       `C ${arrowX + r} ${yFrom}, ${arrowX + r} ${yTo}, ${arrowX} ${yTo}`;
          parts.push(
            `<path class="ad-flow-line ad-dashed" d="${path}" ` +
            `marker-end="url(#arch-arrow-dashed)" />`
          );
          const midY = (yFrom + yTo) / 2;
          parts.push(
            `<rect class="ad-flow-label-bg" x="${arrowX - 168}" y="${midY - 12}" ` +
            `width="160" height="24" rx="12" />`
          );
          parts.push(
            `<text class="ad-flow-label" x="${arrowX - 88}" y="${midY + 4}" text-anchor="middle">` +
            `${escapeHtml(flow.label || '')}</text>`
          );
        } else {
          /* 直线垂直箭头 */
          parts.push(
            `<line class="ad-flow-line" x1="${arrowX}" y1="${yFrom + 4}" ` +
            `x2="${arrowX}" y2="${yTo - 6}" marker-end="url(#arch-arrow)" />`
          );
          const midY = (yFrom + yTo) / 2;
          parts.push(
            `<rect class="ad-flow-label-bg" x="${arrowX - 168}" y="${midY - 12}" ` +
            `width="160" height="24" rx="12" />`
          );
          parts.push(
            `<text class="ad-flow-label" x="${arrowX - 88}" y="${midY + 4}" text-anchor="middle">` +
            `${escapeHtml(flow.label || '')}</text>`
          );
        }
      });
    }

    /* 图例 */
    if (Array.isArray(spec.legend) && spec.legend.length) {
      const ly = H - LEGEND_H + 4;
      const itemW = (LANE_W - 20) / spec.legend.length;
      spec.legend.forEach((item, i) => {
        const x = LANE_X + 10 + i * itemW;
        const swatchClass =
          item.tone === 'muted' ? 'ad-bar-muted'
          : item.tone === 'flow' ? 'ad-bar-flow'
          : 'ad-bar-accent';
        parts.push(
          `<rect class="${swatchClass}" x="${x}" y="${ly + 6}" width="14" height="14" rx="3" />`
        );
        parts.push(
          `<text class="ad-legend-text" x="${x + 22}" y="${ly + 17}">` +
          `${escapeHtml(item.label || '')}</text>`
        );
      });
    }

    parts.push(`</svg>`);
    return parts.join('');
  };

  const renderArchitecture = (t) => {
    const hasSpec = t.archSpec && Array.isArray(t.archSpec.lanes) && t.archSpec.lanes.length;
    if (!hasSpec) return '';
    return `
      <section class="section" id="architecture">
        <div class="container">
          <div class="section-head">
            <h2>架构</h2>
            <p>数据 / 事件流如何穿越进程边界</p>
          </div>
          <div class="architecture">
            ${renderArchDiagram(t.archSpec)}
          </div>
        </div>
      </section>
    `;
  };

  /* --- contact --- */

  const renderContact = (t) => {
    const items = t.contact || [];
    if (items.length === 0) return '';
    return `
      <section class="section" id="contact">
        <div class="container">
          <div class="section-head">
            <h2>反馈与交流</h2>
            <p>Bug 反馈、功能建议、合作交流都欢迎</p>
          </div>
          <div class="contact-list">
            ${items.map((c) => {
              const inner = `
                <div class="contact-icon">${escapeHtml(c.icon || '🔗')}</div>
                <div class="contact-body">
                  <div class="contact-label">${escapeHtml(c.label)}</div>
                  <div class="contact-value">${escapeHtml(c.value)}</div>
                </div>
              `;
              if (c.href) {
                return `<a class="contact-item" href="${escapeHtml(c.href)}" target="_blank" rel="noopener">${inner}</a>`;
              }
              return `<div class="contact-item">${inner}</div>`;
            }).join('')}
          </div>
        </div>
      </section>
    `;
  };

  /* --- empty state (没有 sections 时) --- */

  const renderEmpty = () => `
    <section class="section">
      <div class="container">
        <div class="empty-state">
          <div class="empty-state-icon">🧭</div>
          <h3 class="empty-state-title">工具详情待补充</h3>
          <p class="empty-state-desc">本工具已登记在 FOSS-Nav，但详细介绍尚未填写。请稍后再来，或前往仓库查看。</p>
        </div>
      </div>
    </section>
  `;

  /* ---------- 渲染：组合 ---------- */

  const renderTool = (t) => {
    if (!$main) return;
    const sections = [
      renderHero(t),
      renderDownloads(t),
      renderFeatures(t),
      renderPanels(t),
      renderWorkflow(t),
      renderTech(t),
      renderArchitecture(t),
      renderVersions(t),
      renderContact(t)
    ].filter(Boolean);

    if (sections.length === 0) {
      $main.innerHTML = renderEmpty();
      return;
    }

    $main.innerHTML = sections.join('');
    document.title = `${t.name} · ${t.tagline || ''} · FOSS-Nav`;
  };

  /* ---------- 启动 ---------- */

  const boot = () => {
    if (TOOLS.length === 0) {
      if ($tabs) $tabs.innerHTML = '';
      if ($main) $main.innerHTML = renderEmpty();
      return;
    }
    initTheme();
    if ($theme) $theme.addEventListener('click', toggleTheme);

    /* SHA-256 复制按钮（事件代理，永久挂载） */
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.js-copy-sha');
      if (!btn) return;
      const sha = btn.getAttribute('data-sha') || '';
      if (!sha) return;
      const done = () => {
        const lbl = btn.querySelector('span');
        if (!lbl) return;
        const orig = lbl.textContent;
        lbl.textContent = '✓ 已复制';
        btn.classList.add('is-copied');
        setTimeout(() => { lbl.textContent = orig; btn.classList.remove('is-copied'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(sha).then(done).catch(() => {
          /* 退化：用临时 textarea + execCommand */
          const ta = document.createElement('textarea');
          ta.value = sha;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); }
          catch (err) { console.warn('copy failed', err); }
          document.body.removeChild(ta);
        });
      }
    });

    window.addEventListener('hashchange', () => {
      const id = getInitialId();
      if (id && id !== currentId) navigate(id, { skipHash: true, scrollTop: true });
    });
    navigate(getInitialId(), { skipHash: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
