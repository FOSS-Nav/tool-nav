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

  const renderArchitecture = (t) => {
    if (!t.architecture) return '';
    return `
      <section class="section" id="architecture">
        <div class="container">
          <div class="section-head">
            <h2>架构</h2>
            <p>数据 / 事件流如何穿越进程边界</p>
          </div>
          <div class="architecture">
            <pre>${escapeHtml(t.architecture)}</pre>
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
