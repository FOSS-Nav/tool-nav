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
 *   architecture 架构图（text / ascii art，用于「架构」区块，可选）
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
      { value: '3600', unit: '点', label: 'GNSS 轨迹滑动窗口' }
    ],

    repos: [
      { label: 'V3 (Electron) 仓库', url: 'https://gitee.com/tmrnic/lab-tool-v3' },
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
        title: '可编辑协议帧',
        desc: '10 种基础数据类型（int8/16/32、uint8/16/32、float/double、24-bit/16-bit 非标），自由组合字节序、标度因数、帧头/时间戳/校验位；支持加载/保存为 CSV 配置（兼容 V2 格式）。'
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
        year: '2025+',
        title: 'Electron + React + TypeScript 重构版',
        desc: '串口、解析、UI 完全重写。引入 Zustand 全局 store、uPlot 高速曲线、Canvas 2D 轨迹，IPC 走 contextBridge 安全模型。'
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

    architecture:
      '┌────────── Renderer (React + Zustand) ──────────┐\n' +
      '│  App = Header + ToolBox + StatusBar              │\n' +
      '│  ToolBox: Frame / Serial / GNSS / Data /          │\n' +
      '│           Curve / Trace / Assistant               │\n' +
      '└──────────────────────────┬───────────────────────┘\n' +
      '                           │ window.labtool.* (typed)\n' +
      '                           ▼\n' +
      '┌────────── Preload (typed IPC) ──────────────────┐\n' +
      '│  LabtoolAPI (contextBridge)                      │\n' +
      '└──────────────────────────┬───────────────────────┘\n' +
      '                           │ ipcRenderer.invoke / on\n' +
      '                           ▼\n' +
      '┌────────── Main (Node) ──────────────────────────┐\n' +
      '│  SerialMgr ─→ Scheduler (10ms tick) ─→ Recorder │\n' +
      '│  (IMU+GNSS 双路)            └─→ WebContents.send │\n' +
      '└──────────────────────────────────────────────────┘',

    contact: [
      { icon: '📧', label: '作者邮箱', value: 'yangxiaokang495@163.com', href: 'mailto:yangxiaokang495@163.com' },
      { icon: '📦', label: '开源仓库', value: 'gitee.com/tmrnic/lab-tool-v3', href: 'https://gitee.com/tmrnic/lab-tool-v3' },
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
  //   contact: [ { icon: '📧', label: '邮箱', value: '...', href: 'mailto:...' } ]
  // }
  // ============================================================
];

/* 暴露到 window 供 app.js 使用（避免引入打包工具） */
window.__FOSS_NAV_TOOLS__ = TOOLS;
