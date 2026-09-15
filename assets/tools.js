/**
 * FOSS-Nav 工具数据
 * ============================================================
 *
 * 本文件是 FOSS-Nav 导航工具集页面的「唯一数据源」。
 * 新增工具时，只需在本数组 TOOLS 中追加一个新对象，无需改动其他文件。
 *
 * 字段说明：
 *   id           唯一标识（kebab-case），用于 hash 路由与 DOM id
 *   name         工具展示名
 *   tagline      一句话副标题（中文）
 *   taglineEn    一句话副标题（英文，可选）
 *   version      当前版本号
 *   license      协议（如 GPL-3.0、MIT、Apache-2.0）
 *   author       作者/团队
 *   status       状态徽章（active / beta / archived / wip）
 *   icon         工具 emoji（无第三方图标库依赖）
 *   accent       主题强调色（CSS 颜色），用于卡片顶边与按钮
 *   tagline_long 长描述（出现在 Hero 区域）
 *   tags         简短标签列表（用于 Hero 与卡片角标）
 *   stats        关键指标（显示在 Hero 区，3~4 个为宜）
 *   repos        仓库列表：{label, url}（可多个，如 V3 / V2）
 *   techStack    技术栈列表（前端 / 后端 / 渲染 / 通信 等）
 *   highlights   亮点特性（用于「核心功能」区块，6 条左右）
 *   panels       功能面板（用于「功能面板」区块，按工具实际 Tab 写）
 *   workflow     使用步骤（用于「使用流程」区块）
 *   versions     版本历史（按时间倒序，每条：{label, year, text}）
 *   archSpec     架构图（结构化 spec，渲染为 SVG，可选）
 *                 {
 *                   title:    标题,
 *                   subtitle: 副标题（可选）,
 *                   lanes:    [ { name, subtitle, tone, modules: [{name, desc, icon?}] } ],
 *                   flows:    [ { fromLane, toLane, label, reverse? } ],
 *                   legend:   [ { tone, label } ]  （可选）
 *                 }
 *   downloads    软件下载（可选）：放在「核心功能」之前
 *                 {
 *                   title, subtitle,
 *                   releasedAt, version,
 *                   items: [{
 *                     label, desc, filename, sizeText, sha256,
 *                     platform: 'x64'|'ia32', type: 'portable'|'installer',
 *                     recommended?: bool, url, accent?: '#hex'
 *                   }],
 *                   source: { label, url, hint },
 *                   requirements: [string]
 *                 }
 *   contact      联系方式列表：{icon, label, value, href?}
 *
 * ============================================================
 */

const TOOLS = [
  {
    id: 'labtool-v3',
    name: 'LabTool-V3',
    tagline: '惯导实验室串口采数软件',
    taglineEn: 'Inertial Lab Serial Acquisition Toolkit',
    version: '0.2.0',
    license: 'GPL-3.0',
    author: 'TMRNic',
    status: 'active',
    icon: '🛰️',
    accent: '#3b82f6',

    tagline_long:
      '面向惯导 / GNSS 联合调试场景的可视化串口采数工具。基于 Electron + React + TypeScript + Vite 重构自 LabTool-V2 (Qt)，' +
      '支持可编辑协议帧、双路串口异步采集、NMEA / NovAtel 自动识别、三联实时曲线与 GNSS 轨迹绘制、原始 / 解析数据双轨落盘。',

    tags: ['Electron', 'React', 'TypeScript', 'Vite', 'GNSS', 'IMU'],

    stats: [
      { value: '10', unit: '种', label: '基础数据字段类型' },
      { value: '2', unit: '路', label: '异步串口 (IMU + GNSS)' },
      { value: '3', unit: '联', label: '实时曲线 (uPlot)' },
      { value: '3600', unit: '点', label: 'GNSS 轨迹滑动窗口' },
      { value: '3', unit: '语', label: 'i18n（简中 / 繁中 / English）' }
    ],

    repos: [
      { label: 'V3 (Electron) 仓库', url: 'https://github.com/FOSS-Nav/LabTool-v3' },
      { label: 'V2 (Qt) 仓库', url: 'https://gitee.com/tmrnic/lab-tool-v2' }
    ],

    techStack: [
      { group: '运行时', items: ['Electron 31', 'Node.js 20'] },
      { group: 'UI 层', items: ['React 18', 'TypeScript (strict)', 'Zustand', 'uPlot'] },
      { group: '构建链', items: ['electron-vite', 'electron-builder'] },
      { group: '硬件通信', items: ['serialport (原生模块)'] },
      { group: '解析层', items: ['DataView 自定义帧状态机', 'NMEA / NovAtel 解码器'] }
    ],

    highlights: [
      {
        icon: '📋',
        title: '可编辑协议帧 + 状态机解码',
        desc: '10 种基础数据类型（int8/16/32、uint8/16/32、float/double、24-bit/16-bit 非标），自由组合字节序、标度因数、帧头/时间戳/校验位；底层帧状态机支持流式解码、帧头自恢复、跨 chunk 粘包；CSV 配置可与 V2 互通。'
      },
      {
        icon: '🔌',
        title: '双路异步串口',
        desc: 'IMU 字节流 + GNSS 文本行流互不阻塞；同一 SerialManager 统一调度，10 ms tick 推送到渲染端，UI 永不卡顿。'
      },
      {
        icon: '🛰️',
        title: 'NMEA / NovAtel 自动识别',
        desc: '无需手动切换协议：识别 GPGGA / GPVTG 等 NMEA 标准语句，兼容 NovAtel OEM 板的 BESTVEL / BESTPOS 二进制 / ASCII 输出。'
      },
      {
        icon: '📈',
        title: '三联实时曲线',
        desc: 'uPlot Canvas 渲染，100 fps × 多通道无压力；横轴支持帧计数 / 时间戳（需帧内含 Time_Stamp 字段）。'
      },
      {
        icon: '🗺️',
        title: 'GNSS 实时轨迹',
        desc: 'WGS84 → 本地 E/N 投影，自动缩放与网格；当前点高亮、原点十字标定，3600 点滑动窗口保持流畅。'
      },
      {
        icon: '💾',
        title: '数据落盘双轨制',
        desc: '同时输出：解析后 IMU .txt + .bin、原始 IMU .bin、GNSS 原始 .txt；可选「带 GNSS 同步」模式注入 7 列 GNSS 数据。'
      },
      {
        icon: '🎨',
        title: '主题与多语言',
        desc: '浅色 / 深色 / 跟随系统三档主题；简体中文 / 繁體中文 / English 三语切换；偏好持久化到 localStorage。'
      },
      {
        icon: '🔧',
        title: '串口助手',
        desc: '内置「串口助手」面板：接收区实时滚动，发送区支持 HEX 字符串或纯文本（Enter 发送），常用于协议调试与设备握手。'
      }
    ],

    panels: [
      { icon: '📋', name: '协议帧', desc: '可表格化编辑协议字段，编译为字节级描述符' },
      { icon: '🔌', name: '串口',   desc: 'IMU 串口配置：COM 号 / 波特率 / 数据位 / 校验位' },
      { icon: '🛰️', name: 'GNSS',   desc: 'GNSS 串口配置：使能、量测类型（速度+位置 / 仅位置）' },
      { icon: '📊', name: '数据',   desc: '实时字段值表格 + 曲线分配（Plot1/2/3）' },
      { icon: '📈', name: '曲线',   desc: '三联实时波形，横轴可选帧 / 时间 / 帧计数' },
      { icon: '🗺️', name: '轨迹',   desc: 'GNSS 实时轨迹图（本地 E/N 投影）' },
      { icon: '🔧', name: '串口助手', desc: '接收区 + HEX / 文本发送，常用于协议调试' }
    ],

    workflow: [
      { title: '编辑协议帧',  desc: '打开「协议帧」面板，按需增删改表格行，设置帧头、字段类型、标度因数；可加载 V2 CSV 配置文件。' },
      { title: '编译描述符',  desc: '点击「确认数据帧」，将表格编译为字节级描述符（V2 中 on_confirmDataFrame_btn 的等价实现）。' },
      { title: '打开串口',    desc: '在「串口」面板配置 COM 号 + 波特率，点击「打开串口」；IMU 帧状态机开始解码。' },
      { title: '启用 GNSS',   desc: '若需联合调试，在「GNSS」面板勾选「使能 GNSS」并配置，GNSS 通道随 IMU 串口自动启动。' },
      { title: '观察曲线',    desc: '在数据面板勾选字段的「图1/图2/图3」，「实时波形」面板立即开始绘制三联曲线。' },
      { title: '捕获数据',    desc: '点击底部「捕获数据」按钮，选择基名与保存路径；停止后得到 .txt（解析）+ .bin（原始）双轨数据。' }
    ],

    versions: [
      {
        label: 'V3',
        year: '2025–',
        title: 'Electron + React + TypeScript 重构版',
        desc: '串口、解析、UI 完全重写。引入 Zustand 全局 store、uPlot 高速曲线、Canvas 2D 轨迹、contextBridge 安全 IPC，附三语 i18n 与暗色 / 浅色 / 跟随系统三档主题。'
      },
      {
        label: 'V2',
        year: '2024',
        title: 'Qt 5.15 + MinGW 8.1',
        desc: '加入 GNSS 解析（NMEA / NovAtel）与轨迹显示，引入 QCustomPlot 三联曲线，协议帧支持 10 种基础类型。'
      },
      {
        label: 'V1',
        year: '—',
        title: 'Qt 4 + QUC 控件',
        desc: '纯 IMU 采集，无 GNSS；首次支持「帧编辑 → 实时解析 → 文件落盘」全链路。'
      }
    ],

    downloads: {
      title: '下载 LabTool-V3',
      subtitle: 'Windows 平台 · GPL-3.0 · Electron + React + TypeScript',
      releasedAt: '2026-09-15',
      version: '0.2.0',
      items: [
        {
          label: 'x64 Portable',
          desc: '64 位单文件便携版 · 解压即用 · 适合大多数 Windows 10/11 用户',
          filename: 'LabTool-V3-0.2.0-x64-portable.exe',
          sizeText: '67.44 MB',
          sha256: '4f1ae8a2114893e5c37b5839852bfe384f289a7f369ff12bd84af766dc74e78b',
          platform: 'x64',
          type: 'portable',
          recommended: true,
          url: 'https://github.com/FOSS-Nav/LabTool-v3/releases/download/V3/LabTool-V3-0.2.0-x64-portable.exe',
          icon: '🟦'
        },
        {
          label: 'x64 Installer',
          desc: '64 位 NSIS 安装包 · 支持开始菜单 / 桌面快捷方式 / 控制面板卸载',
          filename: 'LabTool-V3-0.2.0-x64-setup.exe',
          sizeText: '67.67 MB',
          sha256: '44afc95553d1f8dd129f8e590f6c08ffd532b2353a4b32ab0f9e954e9d1877ff',
          platform: 'x64',
          type: 'installer',
          url: 'https://github.com/FOSS-Nav/LabTool-v3/releases/download/V3/LabTool-V3-0.2.0-x64-setup.exe',
          icon: '🟦'
        },
        {
          label: 'ia32 Portable',
          desc: '32 位便携版 · 老机器或精简系统备选',
          filename: 'LabTool-V3-0.2.0-ia32-portable.exe',
          sizeText: '63.45 MB',
          sha256: '905cb39d7fe9e2250e5841ce2101dd8e5d1fa5be2f0a4c640f42bb799957e6be',
          platform: 'ia32',
          type: 'portable',
          url: 'https://github.com/FOSS-Nav/LabTool-v3/releases/download/V3/LabTool-V3-0.2.0-ia32-portable.exe',
          icon: '🟩'
        },
        {
          label: 'ia32 Installer',
          desc: '32 位 NSIS 安装包',
          filename: 'LabTool-V3-0.2.0-ia32-setup.exe',
          sizeText: '63.68 MB',
          sha256: '4dcd085d9e1583fb39c6b5c5e763932758767095b1614385c3e0cec00612fe9f',
          platform: 'ia32',
          type: 'installer',
          url: 'https://github.com/FOSS-Nav/LabTool-v3/releases/download/V3/LabTool-V3-0.2.0-ia32-setup.exe',
          icon: '🟩'
        }
      ],
      source: {
        label: '查看源码 / 自行构建',
        url: 'https://github.com/FOSS-Nav/LabTool-v3',
        hint: '开发者可 clone 仓库后按 README 的 Windows / 命令行步骤构建（需 Node.js ≥ 20）'
      },
      releasePage: {
        label: 'Release 页面',
        url: 'https://github.com/FOSS-Nav/LabTool-v3/releases/tag/V3',
        hint: 'v0.2.0 正式发布页 · 含完整变更日志'
      },
      checksums: {
        label: 'SHA-256 校验和 (SHA256SUMS.txt)',
        url: 'https://github.com/FOSS-Nav/LabTool-v3/releases/download/V3/SHA256SUMS.txt',
        hint: '下载后在同目录执行 shasum -a 256 -c SHA256SUMS.txt 校验全部 6 个 exe'
      },
      requirements: [
        '操作系统：Windows 10 / 11（x64 或 x86 架构，按下载选择）',
        '硬件：约 200 MB 可用磁盘空间 · 无独立显卡要求',
        '串口：USB 转串口适配器（CH340 / CP2102 / FT232 等），系统已识别为 COMx 即可',
        '驱动：项目本身不打包串口驱动；首次连接若 Windows 提示未知设备，请安装适配器厂商驱动'
      ]
    },

    archSpec: {
      title: 'Electron 三进程架构 + 双向 IPC 数据流',
      subtitle: 'React · Zustand · uPlot · serialport · electron-vite',
      lanes: [
        {
          name: 'Renderer',
          subtitle: 'React + Zustand 渲染进程',
          tone: 'accent',
          modules: [
            { name: 'Header',     desc: 'IMU / GNSS LED + 主题 / 语言切换' },
            { name: 'ToolBox',    desc: '7 面板：Frame · Serial · GNSS · Data · Curve · Trace · Assistant' },
            { name: 'StatusBar',  desc: '时钟 / 帧数 / 录制状态' }
          ]
        },
        {
          name: 'Preload',
          subtitle: 'typed IPC 安全桥',
          tone: 'muted',
          modules: [
            { name: 'LabtoolAPI', desc: 'contextBridge.exposeInMainWorld 唯一入口' }
          ]
        },
        {
          name: 'Main',
          subtitle: 'Node 主进程',
          tone: 'accent',
          modules: [
            { name: 'SerialMgr',  desc: 'IMU 字节流 + GNSS 文本行流' },
            { name: 'Scheduler',  desc: '10 ms tick → WebContents.send' },
            { name: 'Recorder',   desc: '.txt（解析）+ .bin（原始）双轨' }
          ]
        }
      ],
      flows: [
        { fromLane: 0, toLane: 1, label: 'window.labtool.*  (typed)' },
        { fromLane: 1, toLane: 2, label: 'ipcRenderer.invoke / on' },
        { fromLane: 2, toLane: 0, label: 'WebContents.send  (FrameParsed)', reverse: true }
      ],
      legend: [
        { tone: 'accent', label: '业务进程 (Renderer · Main)' },
        { tone: 'muted',  label: '桥接进程 (Preload)' },
        { tone: 'flow',   label: '虚线 = 异步推送（主 → 渲染）' }
      ]
    },

    contact: [
      { icon: '📧', label: '作者邮箱', value: 'yangxiaokang495@163.com', href: 'mailto:yangxiaokang495@163.com' },
      { icon: '📦', label: '开源仓库', value: 'github.com/FOSS-Nav/LabTool-v3', href: 'https://github.com/FOSS-Nav/LabTool-v3' },
      { icon: '💬', label: '知乎主页', value: 'zhihu.com/people/qikitaka', href: 'https://www.zhihu.com/people/qikitaka' },
      { icon: '🌐', label: '个人网站', value: 'navspace.tech', href: 'http://www.navspace.tech' }
    ]
  }

  // ============================================================
  // ↓↓↓ 后续工具在此追加 ↓↓↓
  //
  // 复制上方对象结构，修改 id / name / tagline 等字段即可。
  // 字段缺失时渲染层会优雅降级（不显示该区块）。
  //
  // 示例占位（先注释掉，未来取消注释即可上线）：
  //
  // ,{
  //   id: 'next-tool',
  //   name: 'NextTool',
  //   tagline: '下一个工具的副标题',
  //   version: '0.1.0',
  //   license: 'GPL-3.0',
  //   author: 'TMRNic',
  //   status: 'wip',
  //   icon: '🧭',
  //   accent: '#10b981',
  //   tagline_long: '一句话描述这个工具解决什么问题。',
  //   tags: ['标签1', '标签2'],
  //   stats: [ { value: '10', unit: 'ms', label: '调度周期' } ],
  //   repos: [ { label: '仓库', url: 'https://...' } ],
  //   techStack: [ { group: '运行时', items: ['...'] } ],
  //   highlights: [ { icon: '✨', title: '亮点', desc: '...' } ],
  //   panels: [ { icon: '📋', name: '面板', desc: '...' } ],
  //   workflow: [ { title: '步骤', desc: '...' } ],
  //   versions: [ { label: 'V1', year: '2025', title: '...', desc: '...' } ],
  //   archSpec: {
  //     title: '...',
  //     lanes: [ { name: '层名', subtitle: '...', tone: 'accent', modules: [{ name: '模块', desc: '...' }] } ],
  //     flows: [ { fromLane: 0, toLane: 1, label: '...' } ]
  //   },
  //   contact: [ { icon: '📧', label: '邮箱', value: '...', href: 'mailto:...' } ]
  // }
  // ============================================================
];

/* 暴露到 window 供 app.js 使用（避免引入打包工具） */
window.__FOSS_NAV_TOOLS__ = TOOLS;
