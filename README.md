# FOSS-Nav · 开源导航工具集

> 一个收录**导航 / 惯导 / GNSS** 相关开源工具的索引站。
>
> 站内每个工具都有独立介绍页（功能特性、功能面板、使用流程、技术栈、版本历史、联系方式）。

---

## 📑 收录工具

| 图标 | 名称           | 版本    | 简介                                | 仓库                                                                       |
| :--: | -------------- | ------- | ----------------------------------- | -------------------------------------------------------------------------- |
| 🛰️ | **LabTool-V3** | `0.2.0` | 惯导实验室串口采数软件（Electron + React + TS） | [V3](https://gitee.com/tmrnic/lab-tool-v3) · [V2 (Qt)](https://gitee.com/tmrnic/lab-tool-v2) |

> 后续工具在此追加。

---

## 🚀 快速开始

```bash
# 1. 直接在浏览器打开
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux

# 2. 或起一个本地静态服务器（推荐，hash 路由更稳）
npx serve .            # 任意静态服务器都行
# 然后访问 http://localhost:3000
```

**零依赖** —— 页面纯静态，不需要 Node / 构建步骤。
只需要一个能托管静态文件的服务器（或本地双击 `index.html`）。

---

## 📁 项目结构

```
tool-nav/
├── index.html             # 主页面（壳 + 引用资源）
├── ReadMe.md              # 本文件
└── assets/
    ├── tools.js           # ★ 工具数据（唯一数据源）
    ├── app.js             # 渲染逻辑 / 路由 / 主题切换
    └── styles.css         # 样式（CSS 变量驱动的主题）
```

### 数据驱动

整个页面是**数据驱动**的：所有工具信息都集中在 `assets/tools.js` 的 `TOOLS` 数组中。
新增一个工具，只需在数组里追加一个对象，HTML/CSS/JS 都不用动。

`TOOLS` 数组元素的字段说明：

| 字段           | 类型                              | 说明                                                |
| -------------- | --------------------------------- | --------------------------------------------------- |
| `id`           | `string`                          | 唯一标识（kebab-case），用于 hash 路由              |
| `name`         | `string`                          | 工具展示名                                          |
| `tagline`      | `string`                          | 一句话副标题（中文）                                |
| `taglineEn`    | `string?`                         | 英文副标题（可选）                                  |
| `version`      | `string`                          | 当前版本号                                          |
| `license`      | `string`                          | 协议（GPL-3.0 / MIT / Apache-2.0 …）                |
| `author`       | `string`                          | 作者 / 团队                                         |
| `status`       | `'active' \| 'beta' \| 'wip' \| 'archived'` | 状态徽章                                  |
| `icon`         | `string`（emoji）                 | 工具图标                                            |
| `accent`       | `string`（CSS 颜色）              | 工具强调色，用于卡片顶边                            |
| `tagline_long` | `string`                          | 长描述（Hero 区）                                   |
| `tags`         | `string[]`                        | 简短标签（Hero 区右侧 / 卡片角标）                  |
| `stats`        | `{value, unit?, label}[]`         | 关键指标（Hero 区下方卡片）                         |
| `repos`        | `{label, url}[]`                  | 仓库列表（多个：V3 / V2 / 文档 …）                  |
| `techStack`    | `{group, items[]}[]`              | 技术栈（按组）                                      |
| `highlights`   | `{icon, title, desc}[]`           | 核心功能（每张卡片一项）                            |
| `panels`       | `{icon, name, desc}[]`            | 功能面板（左侧 Tab）                                |
| `workflow`     | `{title, desc}[]`                 | 使用步骤                                            |
| `versions`     | `{label, year, title, desc}[]`    | 版本历史（按时间倒序，首个标 latest）               |
| `architecture` | `string?`                         | 架构图（ASCII art）                                 |
| `contact`      | `{icon, label, value, href?}[]`   | 联系方式                                            |

> 所有字段都是**可选的**，渲染层会优雅降级（缺哪个区块就不显示哪个区块）。

---

## ➕ 添加新工具

打开 `assets/tools.js`，在 `TOOLS` 数组中追加一个对象即可。文件末尾已提供模板：

```js
,{
  id: 'next-tool',
  name: 'NextTool',
  tagline: '下一个工具的副标题',
  version: '0.1.0',
  license: 'GPL-3.0',
  author: 'TMRNic',
  status: 'wip',
  icon: '🧭',
  accent: '#10b981',
  tagline_long: '一句话描述这个工具解决什么问题。',
  tags: ['标签1', '标签2'],
  stats: [ { value: '10', unit: 'ms', label: '调度周期' } ],
  repos: [ { label: '仓库', url: 'https://...' } ],
  techStack: [ { group: '运行时', items: ['...'] } ],
  highlights: [ { icon: '✨', title: '亮点', desc: '...' } ],
  panels: [ { icon: '📋', name: '面板', desc: '...' } ],
  workflow: [ { title: '步骤', desc: '...' } ],
  versions: [ { label: 'V1', year: '2025', title: '...', desc: '...' } ],
  contact: [ { icon: '📧', label: '邮箱', value: '...', href: 'mailto:...' } ]
}
```

保存后刷新页面，新工具就会出现在顶部 tabs，并自动获得自己的详情页（通过 `#/<id>` 访问）。

---

## 🎨 主题

- 支持 **浅色 / 深色** 两套主题
- 通过右上角 `🌙 / ☀` 按钮切换
- 主题偏好持久化到 `localStorage['foss-nav-theme']`
- 所有颜色通过 CSS 变量（`--bg` / `--fg` / `--accent` …）驱动，便于二次定制

---

## 🧭 路由

URL hash 即工具 id：

- `index.html` 或 `index.html#/` → 默认显示第一个工具
- `index.html#/labtool-v3` → 显示 LabTool-V3
- 切换工具时 hash 自动更新，刷新页面能保留选中状态

---

## 📜 许可证

本仓库（导航站页面代码）：**GPL-3.0**

站内收录的工具按各自仓库协议发布 —— 详情见各工具仓库。
