import { useEffect, useState } from 'react'
import './App.css'

type Lang = 'en' | 'zh'
type ScenarioKey = 'balanced' | 'reconnect' | 'attention'

type Candle = {
  label: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

type PhaseBand = {
  start: number
  end: number
  range: string
  title: Bilingual
  reason: Bilingual
  impact: Bilingual
}

type DriverCard = {
  title: Bilingual
  value: string
  note: Bilingual
}

type Bilingual = {
  en: string
  zh: string
}

type Scenario = {
  id: ScenarioKey
  label: Bilingual
  hook: Bilingual
  description: Bilingual
  health: number
  delta: number
  responseMedian: string
  anomalyCount: number
  messageShift: string
  rhythmTag: Bilingual
  temperature: Bilingual
  dominantWindow: string
  seed: number
  candles: Candle[]
  phases: PhaseBand[]
  drivers: DriverCard[]
  messageLengths: number[]
  delayBands: { label: string; value: number; note: Bilingual }[]
  initiative: { you: number; partner: number }
  anomalies: { time: string; title: Bilingual; detail: Bilingual }[]
  suggestions: Bilingual[]
}

type ConversationCase = {
  messages: {
    speaker: 'you' | 'partner'
    time: string
    text: Bilingual
    tag: Bilingual
  }[]
  extracted: {
    title: Bilingual
    value: string
    note: Bilingual
  }[]
}

const LANGUAGE_KEY = 'lovequant-lang'
const scenarioOrder: ScenarioKey[] = ['balanced', 'reconnect', 'attention']

const metricCards = [
  {
    icon: '↗',
    title: { en: 'Message Frequency', zh: '消息频率趋势' },
    detail: {
      en: 'Watch how active the relationship becomes week over week.',
      zh: '观察互动活跃度如何按周变化。',
    },
  },
  {
    icon: '⏱',
    title: { en: 'Reply Delay', zh: '回复时延分布' },
    detail: {
      en: 'See how fast or slow each side responds over time.',
      zh: '看清双方回复节奏的快慢变化。',
    },
  },
  {
    icon: '≈',
    title: { en: 'Message Length', zh: '消息长度趋势' },
    detail: {
      en: 'Measure how much thought and energy goes into replies.',
      zh: '衡量每次回复投入了多少表达和注意力。',
    },
  },
  {
    icon: '⇄',
    title: { en: 'Initiative Balance', zh: '双方主动度对比' },
    detail: {
      en: 'Track whether the relationship feels balanced or one-sided.',
      zh: '追踪关系是否平衡，还是由一方在持续推动。',
    },
  },
  {
    icon: '▦',
    title: { en: 'Active Time Overlap', zh: '活跃时间热图' },
    detail: {
      en: 'Spot the windows where both people actually show up.',
      zh: '找出双方真正同时在线、同时投入的时间窗口。',
    },
  },
  {
    icon: '◔',
    title: { en: 'Health Score', zh: '关系健康评分' },
    detail: {
      en: 'Summarize the current state into one readable number.',
      zh: '把复杂关系状态浓缩成一个可读懂的总览分数。',
    },
  },
  {
    icon: '!',
    title: { en: 'Anomaly Alerts', zh: '异动预警提示' },
    detail: {
      en: 'Catch sudden drops, spikes, or unusual shifts early.',
      zh: '及时发现突然下降、异常波动或低谷前兆。',
    },
  },
  {
    icon: '✦',
    title: { en: 'AI Suggestions', zh: 'AI 互动建议' },
    detail: {
      en: 'Turn data signals into practical next actions for the couple.',
      zh: '把数据洞察转成更具体、更可执行的沟通建议。',
    },
  },
]

const accessModes = [
  {
    code: 'A',
    title: { en: 'Shared Thread Sync', zh: '共享会话同步' },
    summary: {
      en: 'Couples authorize a shared thread or workspace. Metadata from WeChat, WhatsApp, Telegram, Messenger, or LINE flows into the dashboard in real time.',
      zh: '情侣共同授权一个共享会话或工作区，微信、WhatsApp、Telegram、Messenger、LINE 等渠道的元数据会实时流入仪表盘。',
    },
    bullets: [
      {
        en: 'Shared authorization for the same relationship thread or workspace',
        zh: '针对同一段关系会话或工作区进行共享授权',
      },
      {
        en: 'Reads only timestamps, counts, and length statistics',
        zh: '仅读取时间戳、消息数量与长度统计',
      },
      {
        en: 'Best mode for a living, always-on dashboard across primary chat apps',
        zh: '最适合做跨主力聊天应用、持续更新的实时仪表盘',
      },
    ],
  },
  {
    code: 'B',
    title: { en: 'Manual Import / Export', zh: '手动导入 / 导出' },
    summary: {
      en: 'Paste summaries, import exported metadata, or forward snapshots from any app to update the metrics instantly.',
      zh: '通过粘贴摘要、导入导出数据，或从任意应用转发快照，立即更新指标。',
    },
    bullets: [
      {
        en: 'Fastest setup with the lowest platform dependency',
        zh: '接入最快，对平台依赖最低',
      },
      {
        en: 'Useful for WeChat, iMessage, Instagram DM, or partial-data use cases',
        zh: '适合微信、iMessage、Instagram DM 或更局部的数据场景',
      },
      {
        en: 'Report refresh target under one second',
        zh: '目标更新响应低于 1 秒',
      },
    ],
  },
  {
    code: 'C',
    title: { en: 'Presence + Window Signals', zh: '在线状态 + 时间窗口信号' },
    summary: {
      en: 'Use presence overlap and active-window data to build lightweight health signals for channels where full sync is not ideal.',
      zh: '对于不适合完整同步的渠道，可以基于在线重叠与活跃窗口数据建立轻量健康信号。',
    },
    bullets: [
      {
        en: 'Useful for iMessage, Instagram DM, lighter WeChat sessions, and cross-app presence',
        zh: '适合 iMessage、Instagram DM、轻量微信会话和跨应用在线状态场景',
      },
      {
        en: 'Best for overlap, timing, and rhythm signals',
        zh: '最适合做重叠时段、节奏与时序洞察',
      },
      {
        en: 'Pairs well with manual journaling or summaries',
        zh: '适合与手动摘要或记录方式搭配',
      },
    ],
  },
]

const flowSteps = [
  {
    step: '01',
    title: { en: 'Connect Sources', zh: '连接数据源' },
    body: {
      en: 'Attach exports, adapters, bots, or activity-window inputs from WeChat, WhatsApp, Telegram, iMessage, or other supported channels.',
      zh: '把微信、WhatsApp、Telegram、iMessage 等支持渠道的导出文件、适配器、Bot 或在线状态输入接到运行时。',
    },
  },
  {
    step: '02',
    title: { en: 'Process Signals', zh: '处理信号' },
    body: {
      en: 'The pipeline normalizes timestamps, counts, message length, overlap windows, and export snapshots into one comparable signal model.',
      zh: '运行时会把时间戳、消息条数、消息长度、重叠时段和导出快照统一整理成一套可比较的信号模型。',
    },
  },
  {
    step: '03',
    title: { en: 'Render Outputs', zh: '渲染输出' },
    body: {
      en: 'Open the dashboard or generate reports to inspect the K-line timeline, heatmap, anomalies, health score, and action prompts.',
      zh: '打开仪表盘或生成报告，即可查看 K 线时间轴、热力图、异常提示、健康评分和行动建议。',
    },
  },
]

const liveFeed = [
  {
    channel: 'WeChat',
    time: '21:04',
    event: { en: 'private thread exported', zh: '私聊会话已导出' },
    meta: { en: 'session: 42 messages', zh: '会话：42 条消息' },
  },
  {
    channel: 'iMessage',
    time: '21:07',
    event: { en: 'presence overlap opened', zh: '检测到在线重叠窗口' },
    meta: { en: 'window: 13 minutes', zh: '窗口：13 分钟' },
  },
  {
    channel: 'Engine',
    time: '21:11',
    event: { en: 'reply latency computed', zh: '已完成回复时延计算' },
    meta: { en: 'median: 9m', zh: '中位数：9 分钟' },
  },
  {
    channel: 'Bot',
    time: '21:13',
    event: { en: 'health score updated', zh: '健康评分已刷新' },
    meta: { en: 'score: 78 / 100', zh: '分数：78 / 100' },
  },
]

const pipelineStages = [
  {
    title: { en: 'Capture', zh: '采集' },
    note: { en: 'timestamp · count · length', zh: '时间 · 条数 · 长度' },
  },
  {
    title: { en: 'Normalize', zh: '整理' },
    note: { en: 'sessionize · dedupe · align', zh: '会话化 · 去重 · 对齐' },
  },
  {
    title: { en: 'Analyze', zh: '分析' },
    note: { en: 'frequency · latency · balance', zh: '频率 · 时延 · 平衡度' },
  },
  {
    title: { en: 'Output', zh: '输出' },
    note: { en: 'score · alert · AI advice', zh: '评分 · 预警 · AI 建议' },
  },
]

const selfHostPrinciples = [
  {
    title: { en: 'Self-Hosted Deploy', zh: '自托管部署' },
    body: {
      en: 'Run the stack on your own machine, server, or private cloud without relying on a hosted control plane.',
      zh: '整套系统可以部署在你自己的设备、服务器或私有云中，不依赖托管控制面板。',
    },
  },
  {
    title: { en: 'Bring Your Own Connectors', zh: '自带接入能力' },
    body: {
      en: 'Choose your own adapters for exports, APIs, bots, or manual imports depending on the messaging channel.',
      zh: '根据渠道情况，自由选择导出、API、Bot 或手动导入等接入方式。',
    },
  },
  {
    title: { en: 'Inspectable Pipeline', zh: '可审计分析链路' },
    body: {
      en: 'The ingestion, normalization, scoring, and reporting logic stays visible and modifiable because the project is open source.',
      zh: '因为项目是开源的，采集、整理、评分和输出逻辑都可以被查看和修改。',
    },
  },
  {
    title: { en: 'Retention Is Configurable', zh: '数据保留可配置' },
    body: {
      en: 'Storage format, retention window, export rules, and deletion policies are defined by the operator, not by a hosted vendor.',
      zh: '存储格式、保留周期、导出规则和删除策略都由部署者自己定义，而不是由托管平台决定。',
    },
  },
]

const reportOutputs = [
  {
    code: '01',
    title: { en: 'Weekly Health Report', zh: '每周健康报告' },
    body: {
      en: 'A compact summary of score, trend, imbalance, and shared active windows for both partners.',
      zh: '把评分、趋势、失衡程度和共同活跃窗口压缩成一份简明周报。',
    },
  },
  {
    code: '02',
    title: { en: 'Anomaly Digest', zh: '异常变化摘要' },
    body: {
      en: 'Highlights abrupt drops, reply-latency spikes, or collapsing overlap windows before they become patterns.',
      zh: '在异常下降、时延拉长或重叠窗口收缩变成长期模式前先给出摘要提醒。',
    },
  },
  {
    code: '03',
    title: { en: 'AI Action Cards', zh: 'AI 行动建议卡' },
    body: {
      en: 'Turns behavior changes into specific prompts such as reconnect windows, calmer follow-ups, or offline plans.',
      zh: '把行为变化转成更具体的建议，比如修复窗口、放缓跟进节奏或线下安排。',
    },
  },
]

const channelCoverage = [
  {
    name: 'WeChat',
    region: { en: 'China / everyday private chat', zh: '中国 / 高频日常私聊' },
    mode: { en: 'shared thread or exported metadata', zh: '共享会话或导出元数据' },
    note: {
      en: 'Best for dense daily rhythm, response timing, and habit stability.',
      zh: '适合高频日常节奏、回复时序和稳定性分析。',
    },
  },
  {
    name: 'WhatsApp',
    region: { en: 'Global / long-form couples chat', zh: '国际 / 长对话情侣沟通' },
    mode: { en: 'shared thread sync or manual import', zh: '共享线程同步或手动导入' },
    note: {
      en: 'Strong for message-length trend, timing overlap, and recovery signals.',
      zh: '适合消息长度趋势、时间重叠和修复期信号分析。',
    },
  },
  {
    name: 'Telegram',
    region: { en: 'Power users / organized threads', zh: '重度用户 / 结构化线程' },
    mode: { en: 'bot-assisted metadata sync', zh: 'Bot 辅助元数据同步' },
    note: {
      en: 'Ideal for always-on dashboards and multi-view reporting.',
      zh: '适合做持续更新仪表盘和多视图报告。',
    },
  },
  {
    name: 'iMessage',
    region: { en: 'iPhone couples / private thread', zh: 'iPhone 用户 / 私聊主线' },
    mode: { en: 'manual import or activity-window mode', zh: '手动导入或活跃窗口模式' },
    note: {
      en: 'Useful when the relationship mostly lives in one phone-native channel.',
      zh: '适合关系主要沉淀在手机原生私聊里的场景。',
    },
  },
  {
    name: 'Messenger',
    region: { en: 'Facebook network / mixed media chat', zh: 'Facebook 关系网 / 混合媒体聊天' },
    mode: { en: 'thread export or summary ingest', zh: '线程导出或摘要导入' },
    note: {
      en: 'Good for spotting frequency shifts and drop-off moments.',
      zh: '适合识别频率变化和互动下滑时刻。',
    },
  },
  {
    name: 'LINE',
    region: { en: 'Japan / Taiwan / SEA couples', zh: '日本 / 台湾 / 东南亚情侣' },
    mode: { en: 'manual sync or structured export', zh: '手动同步或结构化导出' },
    note: {
      en: 'Works well for stable routine analysis and overlap windows.',
      zh: '适合稳定作息分析和共同活跃窗口识别。',
    },
  },
  {
    name: 'Instagram DM',
    region: { en: 'lighter couples channel / casual mode', zh: '轻量情侣渠道 / 偏轻沟通' },
    mode: { en: 'presence and manual summary mode', zh: '在线状态与手动摘要模式' },
    note: {
      en: 'Useful when the relationship signal is lighter but still frequent.',
      zh: '适合关系信号较轻但依然频繁发生的沟通场景。',
    },
  },
]

function buildCandles(series: number[]) {
  return series.map((close, index) => {
    const previous = index === 0 ? close - 2 : series[index - 1]
    const open = Math.round(previous + (close - previous) * 0.34)
    const high = Math.max(open, close) + 3 + (index % 3)
    const low = Math.min(open, close) - 3 - (index % 2)
    const volume = 180 + Math.abs(close - previous) * 26 + (index % 5) * 18 + (high - low) * 8
    return {
      label: `${String(index + 1).padStart(2, '0')}`,
      open,
      high,
      low,
      close,
      volume,
    }
  })
}

const scenarios: Record<ScenarioKey, Scenario> = {
  balanced: {
    id: 'balanced',
    label: { en: 'BALANCED', zh: '平衡稳定' },
    hook: {
      en: 'The relationship is active, response timing is healthy, and initiative feels shared.',
      zh: '关系整体活跃，回复节奏健康，主动权也较为均衡。',
    },
    description: {
      en: 'This scenario represents a steady and healthy rhythm: active evenings, short reply latency, and a balanced flow of initiation on both sides.',
      zh: '这个场景展示的是稳定健康的关系节奏：晚间互动活跃、回复时延较短、双方主动度相对平衡。',
    },
    health: 84,
    delta: 4,
    responseMedian: '9m',
    anomalyCount: 2,
    messageShift: '+12%',
    rhythmTag: { en: 'steady', zh: '稳定' },
    temperature: { en: 'warm and stable', zh: '温暖稳定' },
    dominantWindow: '21:00 - 23:00',
    seed: 1924,
    candles: buildCandles([58, 60, 63, 65, 64, 67, 69, 68, 71, 73, 72, 75, 77, 79, 78, 80, 82, 81, 83, 84, 85, 84, 86, 87, 88, 87, 88, 89]),
    phases: [
      {
        start: 0,
        end: 6,
        range: 'Day 01-07',
        title: { en: 'Warm-Up Week', zh: '升温阶段' },
        reason: {
          en: 'Reply timing improves quickly after work, and evening overlap begins to stabilize.',
          zh: '下班后的回复时延快速改善，晚间重叠窗口开始稳定。',
        },
        impact: {
          en: 'The relationship heat line climbs because both sides keep reopening the same daily window.',
          zh: '因为双方持续打开同一个日常互动窗口，关系热度曲线开始上升。',
        },
      },
      {
        start: 7,
        end: 13,
        range: 'Day 08-14',
        title: { en: 'Midweek Compression', zh: '工作周压缩期' },
        reason: {
          en: 'Workload compresses message density slightly, but the delay band stays healthy and lengths remain above baseline.',
          zh: '工作负荷让消息密度略有压缩，但回复区间依然健康，消息长度也高于基线。',
        },
        impact: {
          en: 'The K-line wobbles but does not break because the relationship retains consistency rather than intensity alone.',
          zh: 'K 线虽有波动但没有破位，因为关系依然保持稳定性，而不只是短期强度。',
        },
      },
      {
        start: 14,
        end: 20,
        range: 'Day 15-21',
        title: { en: 'Shared Rituals Lock In', zh: '共同节奏锁定' },
        reason: {
          en: 'Repeated long-form exchanges and balanced openings create a stronger structural floor.',
          zh: '重复出现的长消息互动与均衡开场，为关系建立了更稳的结构性底部。',
        },
        impact: {
          en: 'Candles start closing near their highs because the relationship no longer depends on one good session.',
          zh: '蜡烛越来越接近高位收盘，因为关系不再依赖单次高质量聊天来维持。',
        },
      },
      {
        start: 21,
        end: 27,
        range: 'Day 22-28',
        title: { en: 'Stable Plateau', zh: '高位稳定期' },
        reason: {
          en: 'Message shift stays positive, overlap windows stay open, and initiative remains nearly even.',
          zh: '消息变化保持正向，共同活跃窗口持续打开，主动度也接近均衡。',
        },
        impact: {
          en: 'The last stage shows high but controlled heat: fewer spikes, more durable consistency.',
          zh: '最后阶段表现为高位但受控的热度，尖峰减少，而持续性增强。',
        },
      },
    ],
    drivers: [
      {
        title: { en: 'Why heat stays high', zh: '为什么热度持续偏高' },
        value: '21:00-23:00',
        note: {
          en: 'A repeatable evening overlap acts as the anchor of the whole curve.',
          zh: '可重复出现的晚间重叠窗口，是整条曲线的锚点。',
        },
      },
      {
        title: { en: 'What prevents a drop', zh: '为什么没有明显下滑' },
        value: '49 / 51',
        note: {
          en: 'Balanced initiation means the relationship is not carried by one side only.',
          zh: '主动度接近平衡，说明关系不是由单方在硬撑。',
        },
      },
      {
        title: { en: 'Most reliable signal', zh: '最可靠的信号' },
        value: '61 avg',
        note: {
          en: 'Message length remains above baseline even during workweek compression.',
          zh: '即使在工作周压缩期，消息长度也保持在基线之上。',
        },
      },
    ],
    messageLengths: [52, 55, 58, 57, 63, 66, 64],
    delayBands: [
      { label: '< 5m', value: 28, note: { en: 'Quick replies are consistently present.', zh: '快速回复持续稳定出现。' } },
      { label: '5 - 15m', value: 34, note: { en: 'This is the main reply band.', zh: '这是最主要的回复区间。' } },
      { label: '15 - 60m', value: 24, note: { en: 'Mostly tied to work or commuting time.', zh: '更多与工作或通勤时段有关。' } },
      { label: '> 1h', value: 14, note: { en: 'Long gaps are limited and predictable.', zh: '长时间空档较少且可预期。' } },
    ],
    initiative: { you: 49, partner: 51 },
    anomalies: [
      {
        time: 'Wed 22:18',
        title: { en: 'High-energy exchange', zh: '高质量互动' },
        detail: {
          en: 'Both sides sent above-average message length within the same session.',
          zh: '双方在同一会话内都发出了高于平均长度的消息。',
        },
      },
      {
        time: 'Sat 20:42',
        title: { en: 'Strong overlap window', zh: '重叠时段强化' },
        detail: {
          en: 'Shared active time remained open for more than 90 minutes.',
          zh: '共同活跃时段持续超过 90 分钟。',
        },
      },
    ],
    suggestions: [
      {
        en: 'Keep the current ritual intact and schedule one intentional offline plan this week.',
        zh: '保持当前互动节奏，并在本周安排一次有意识的线下见面。',
      },
      {
        en: 'Use the healthy evening window for deeper conversations rather than logistics.',
        zh: '把最健康的晚间窗口用于更深入的交流，而不只是事务沟通。',
      },
      {
        en: 'Track whether the strong overlap window remains stable for another week.',
        zh: '继续观察高质量重叠时段能否再稳定维持一周。',
      },
    ],
  },
  reconnect: {
    id: 'reconnect',
    label: { en: 'RECONNECTING', zh: '关系回暖' },
    hook: {
      en: 'The signals suggest recovery: message density is climbing and active windows are reopening.',
      zh: '信号显示关系正在回升：消息密度在上升，共同活跃窗口重新打开。',
    },
    description: {
      en: 'This scenario emphasizes re-connection. Message length expands again, response delay narrows, and the heatmap shows stronger evening overlap.',
      zh: '这个场景强调关系回暖：消息长度重新拉长、回复时延收窄、晚间热图明显重新升温。',
    },
    health: 76,
    delta: 8,
    responseMedian: '16m',
    anomalyCount: 3,
    messageShift: '+19%',
    rhythmTag: { en: 'recovering', zh: '修复中' },
    temperature: { en: 'warming up', zh: '逐步升温' },
    dominantWindow: '20:00 - 22:30',
    seed: 4471,
    candles: buildCandles([39, 41, 40, 43, 45, 47, 49, 48, 50, 53, 55, 57, 58, 60, 61, 64, 66, 68, 69, 71, 72, 74, 76, 77, 78, 79, 80, 82]),
    phases: [
      {
        start: 0,
        end: 6,
        range: 'Day 01-07',
        title: { en: 'Low Signal Base', zh: '低信号底部' },
        reason: {
          en: 'The relationship is still responsive enough to hold, but most windows are short and fragile.',
          zh: '关系仍有一定回应，但大多数互动窗口都很短且脆弱。',
        },
        impact: {
          en: 'The chart forms a shallow base instead of a collapse because both sides still leave a usable opening.',
          zh: '曲线形成的是浅底而非直接崩塌，因为双方都还留下了可修复的入口。',
        },
      },
      {
        start: 7,
        end: 13,
        range: 'Day 08-14',
        title: { en: 'Repair Attempts', zh: '修复尝试期' },
        reason: {
          en: 'Longer replies begin to reappear, and missed windows are followed by calmer re-engagement.',
          zh: '较长回复重新出现，错过的窗口后也开始有更平稳的再连接。',
        },
        impact: {
          en: 'Candles widen upward because the relationship starts generating not just contact, but quality contact.',
          zh: 'K 线开始向上拉宽，因为关系不只是恢复联系，而是恢复有质量的联系。',
        },
      },
      {
        start: 14,
        end: 20,
        range: 'Day 15-21',
        title: { en: 'Evening Windows Return', zh: '晚间窗口回归' },
        reason: {
          en: 'Shared evening availability comes back, which compresses delay and improves rhythm continuity.',
          zh: '共同晚间可用时段回归，时延随之收窄，节奏连续性也明显改善。',
        },
        impact: {
          en: 'The mid-stage closes consistently above the open, signaling recovery is becoming structural.',
          zh: '中段持续高于开盘收尾，说明修复已经开始变成结构性回升。',
        },
      },
      {
        start: 21,
        end: 27,
        range: 'Day 22-28',
        title: { en: 'Confidence Rebuild', zh: '信心重建期' },
        reason: {
          en: 'Frequency, overlap, and message length all trend higher together, which is harder to fake than one metric alone.',
          zh: '频率、重叠时段和消息长度一起变好，比单一指标上升更能说明关系在恢复。',
        },
        impact: {
          en: 'The final stage is not fully stable yet, but the slope is strong and broad-based.',
          zh: '最后阶段还没有完全稳定，但斜率足够明显，而且是多指标共同支撑。',
        },
      },
    ],
    drivers: [
      {
        title: { en: 'Main repair driver', zh: '主要修复驱动' },
        value: '+22%',
        note: {
          en: 'Longer replies signal emotional reinvestment instead of routine-only contact.',
          zh: '消息变长说明关系从“例行联系”重新回到“情绪投入”。',
        },
      },
      {
        title: { en: 'Most important shift', zh: '最关键变化' },
        value: '20:00+',
        note: {
          en: 'Evening availability returning is what turns scattered contact into repeatable rhythm.',
          zh: '晚间窗口回归，是零散互动重新变成稳定节奏的关键。',
        },
      },
      {
        title: { en: 'Why the slope matters', zh: '为什么斜率重要' },
        value: '+19%',
        note: {
          en: 'The curve rises week after week, not just from one isolated conversation.',
          zh: '这条曲线是按周连续抬升，而不是靠一次偶然聊天拉起来的。',
        },
      },
    ],
    messageLengths: [37, 42, 47, 53, 58, 64, 68],
    delayBands: [
      { label: '< 5m', value: 22, note: { en: 'Fast replies are returning.', zh: '快速回复开始回归。' } },
      { label: '5 - 15m', value: 31, note: { en: 'A healthier median is forming.', zh: '更健康的中位时延正在形成。' } },
      { label: '15 - 60m', value: 28, note: { en: 'Still visible, but shrinking.', zh: '仍然可见，但正在缩小。' } },
      { label: '> 1h', value: 19, note: { en: 'Long gaps are falling week over week.', zh: '长时间空档按周下降。' } },
    ],
    initiative: { you: 45, partner: 55 },
    anomalies: [
      {
        time: 'Thu 21:06',
        title: { en: 'Reply speed jump', zh: '回复速度回升' },
        detail: {
          en: 'Median delay dropped by 11 minutes inside the strongest window.',
          zh: '在最强活跃窗口内，中位回复时延下降了 11 分钟。',
        },
      },
      {
        time: 'Fri 19:40',
        title: { en: 'Long-form comeback', zh: '长消息回归' },
        detail: {
          en: 'Message length returned above the monthly baseline.',
          zh: '消息长度重新回到月度基线之上。',
        },
      },
      {
        time: 'Sun 21:55',
        title: { en: 'Shared peak', zh: '共同高峰出现' },
        detail: {
          en: 'The strongest overlap of the week aligned with a positive exchange.',
          zh: '本周最强的在线重叠与积极互动同时出现。',
        },
      },
    ],
    suggestions: [
      {
        en: 'Use the warming window to plan one low-pressure date or shared moment.',
        zh: '利用回暖窗口安排一次低压力的见面或共同活动。',
      },
      {
        en: 'Do not over-correct with too many follow-ups; let the renewed rhythm stabilize.',
        zh: '不要用过多追问去过度修正，让恢复中的节奏先稳定下来。',
      },
      {
        en: 'Track whether initiative remains balanced as frequency rises.',
        zh: '继续观察在频率上升时，主动度是否仍能保持平衡。',
      },
    ],
  },
  attention: {
    id: 'attention',
    label: { en: 'NEEDS ATTENTION', zh: '需要关注' },
    hook: {
      en: 'The relationship still has signal, but the dashboard shows stress in timing, balance, and consistency.',
      zh: '关系仍有连接，但时间节奏、平衡度和稳定性都出现了明显压力。',
    },
    description: {
      en: 'This scenario visualizes a relationship that needs attention. Reply delay stretches, initiative becomes uneven, and healthy overlap narrows.',
      zh: '这个场景表现的是一段需要额外关注的关系：回复延迟拉长、主动度失衡、健康重叠窗口收窄。',
    },
    health: 61,
    delta: -7,
    responseMedian: '41m',
    anomalyCount: 5,
    messageShift: '-18%',
    rhythmTag: { en: 'under pressure', zh: '承压中' },
    temperature: { en: 'cooling', zh: '降温中' },
    dominantWindow: '12:00 - 13:00',
    seed: 8382,
    candles: buildCandles([77, 75, 74, 72, 71, 69, 68, 66, 65, 63, 62, 60, 58, 57, 55, 53, 52, 50, 49, 47, 46, 45, 44, 43, 42, 41, 40, 39]),
    phases: [
      {
        start: 0,
        end: 6,
        range: 'Day 01-07',
        title: { en: 'Surface Stability', zh: '表面稳定期' },
        reason: {
          en: 'The relationship still looks functional at first glance because the older rhythm is still fading out rather than fully broken.',
          zh: '一开始关系看起来还算正常，因为旧节奏是在慢慢衰退，而不是立刻断裂。',
        },
        impact: {
          en: 'The first section slopes down gently, which is exactly why it is easy to miss in real life.',
          zh: '第一段是缓慢下滑，这也是现实中最容易被忽略的阶段。',
        },
      },
      {
        start: 7,
        end: 13,
        range: 'Day 08-14',
        title: { en: 'Delay Expansion', zh: '时延扩张期' },
        reason: {
          en: 'Replies start moving out of the short-response band and into the 15-60 minute default zone.',
          zh: '回复开始明显从短时回应区间移出，进入 15-60 分钟的默认时延区。',
        },
        impact: {
          en: 'Candles close lower because responsiveness degrades before frequency fully collapses.',
          zh: 'K 线持续走低，因为响应能力通常会先于消息频率下滑。',
        },
      },
      {
        start: 14,
        end: 20,
        range: 'Day 15-21',
        title: { en: 'Initiative Imbalance', zh: '主动度失衡期' },
        reason: {
          en: 'One side begins carrying most openings and follow-ups while the other side replies shorter and later.',
          zh: '一方开始承担大部分开场和跟进，另一方则表现为更短、更晚的回应。',
        },
        impact: {
          en: 'The middle stage loses structural support, so even normal days stop bouncing back.',
          zh: '中段失去结构性支撑，连看起来普通的日子都难以回弹。',
        },
      },
      {
        start: 21,
        end: 27,
        range: 'Day 22-28',
        title: { en: 'Cooling Lock-In', zh: '降温锁定期' },
        reason: {
          en: 'Overlap windows collapse into a narrow midday slot, and no strong recovery signal appears by the end of the window.',
          zh: '共同活跃窗口收缩到狭窄午间时段，直到周期末端也没有出现明显修复信号。',
        },
        impact: {
          en: 'The final stage shows broad weakness across timing, length, and initiative rather than one isolated issue.',
          zh: '最后阶段体现的是时延、长度和主动度的全面承压，而不是某一个单点问题。',
        },
      },
    ],
    drivers: [
      {
        title: { en: 'Primary pressure source', zh: '主要压力来源' },
        value: '41m',
        note: {
          en: 'Reply latency expands first, which drags the whole curve lower before outright silence appears.',
          zh: '回复时延先被拉长，在完全冷却前就已经把整体曲线拖低。',
        },
      },
      {
        title: { en: 'Why this matters', zh: '为什么值得警惕' },
        value: '62 / 38',
        note: {
          en: 'Initiative imbalance shows the relationship effort is no longer evenly distributed.',
          zh: '主动度差距说明维持关系的成本已经不再均匀分布。',
        },
      },
      {
        title: { en: 'Most visible breakdown', zh: '最明显的断裂点' },
        value: '12:00-13:00',
        note: {
          en: 'A once-broad connection window collapses into a single narrow slot.',
          zh: '原本宽泛的连接窗口，被收缩成一个单薄的午间时间槽。',
        },
      },
    ],
    messageLengths: [68, 64, 59, 52, 46, 38, 34],
    delayBands: [
      { label: '< 5m', value: 12, note: { en: 'Fast replies are rare now.', zh: '快速回复已经明显变少。' } },
      { label: '5 - 15m', value: 21, note: { en: 'Short windows still exist.', zh: '短时回应窗口仍然存在。' } },
      { label: '15 - 60m', value: 34, note: { en: 'Delay is now the default state.', zh: '时延已经成为默认状态。' } },
      { label: '> 1h', value: 33, note: { en: 'Long-response tails have grown.', zh: '长时回复尾部明显增长。' } },
    ],
    initiative: { you: 62, partner: 38 },
    anomalies: [
      {
        time: 'Tue 18:22',
        title: { en: 'Evening window faded', zh: '晚间窗口消退' },
        detail: {
          en: 'The strongest historical overlap no longer appears after work.',
          zh: '下班后原本最强的共同活跃窗口已经不再出现。',
        },
      },
      {
        time: 'Thu 12:14',
        title: { en: 'Midday-only activity', zh: '互动收缩到午间' },
        detail: {
          en: 'Most interactions collapsed into a short lunch window.',
          zh: '大部分互动收缩到午休的短暂窗口。',
        },
      },
      {
        time: 'Fri 22:05',
        title: { en: 'Length contraction', zh: '消息长度收缩' },
        detail: {
          en: 'Replies dropped below the rolling 30-day average.',
          zh: '回复长度跌破 30 天滚动平均线。',
        },
      },
      {
        time: 'Sat 16:33',
        title: { en: 'Initiative imbalance', zh: '主动度失衡' },
        detail: {
          en: 'One side carried more than 60% of openings this week.',
          zh: '本周有一方承担了超过 60% 的开场主动。',
        },
      },
      {
        time: 'Sun 23:11',
        title: { en: 'Recovery signal missing', zh: '回升信号缺失' },
        detail: {
          en: 'No rebound appeared in the final 24 hours.',
          zh: '最后 24 小时内没有出现明显回升信号。',
        },
      },
    ],
    suggestions: [
      {
        en: 'Use the report to start a calm conversation about timing and expectations.',
        zh: '可以借助这份报告，平静地开启一次关于节奏与期待的对话。',
      },
      {
        en: 'Look for one shared time block to rebuild consistency before pushing for intensity.',
        zh: '先找回一个稳定的共同时间段，再谈提升互动强度。',
      },
      {
        en: 'If imbalance remains for another week, focus on clarity rather than volume.',
        zh: '如果失衡继续维持一周，优先追求沟通清晰，而不是提高消息数量。',
      },
    ],
  },
}

const conversationCases: Record<ScenarioKey, ConversationCase> = {
  balanced: {
    messages: [
      {
        speaker: 'partner',
        time: '20:51',
        text: {
          en: 'Finished work. Want to grab dinner near your place?',
          zh: '刚下班，要不要在你家附近吃个饭？',
        },
        tag: { en: 'long-form opener', zh: '长消息开场' },
      },
      {
        speaker: 'you',
        time: '20:56',
        text: {
          en: 'Yes. I can be there in 25 minutes. Want me to book the table?',
          zh: '好啊，我 25 分钟能到，要不要我先订位？',
        },
        tag: { en: '5m reply', zh: '5 分钟回复' },
      },
      {
        speaker: 'partner',
        time: '21:02',
        text: {
          en: 'Perfect. Let’s do the window seats. I missed talking to you properly.',
          zh: '太好了，坐窗边吧。我最近很想好好和你聊聊。',
        },
        tag: { en: 'high investment', zh: '高投入回复' },
      },
      {
        speaker: 'you',
        time: '21:06',
        text: {
          en: 'Then tonight is for that. No work talk after 9 :)',
          zh: '那今晚就认真聊，9 点后不聊工作 :)',
        },
        tag: { en: 'balanced close', zh: '平衡收束' },
      },
    ],
    extracted: [
      {
        title: { en: 'Reply Delay', zh: '回复时延' },
        value: '5m',
        note: { en: 'Healthy response speed inside the main overlap window.', zh: '在主要重叠窗口内维持健康回复速度。' },
      },
      {
        title: { en: 'Message Length', zh: '消息长度' },
        value: '61 avg',
        note: { en: 'Both sides are writing above the weekly baseline.', zh: '双方消息长度都高于本周平均水平。' },
      },
      {
        title: { en: 'Initiative Balance', zh: '主动度' },
        value: '49 / 51',
        note: { en: 'Openers and follow-ups are evenly shared.', zh: '开场与跟进动作由双方均衡承担。' },
      },
      {
        title: { en: 'Health Score', zh: '健康评分' },
        value: '84/100',
        note: { en: 'The conversation pattern maps to a strong, stable state.', zh: '该对话模式对应稳定且偏强的关系状态。' },
      },
    ],
  },
  reconnect: {
    messages: [
      {
        speaker: 'you',
        time: '19:38',
        text: {
          en: 'I know this week felt off. Want to reset and talk tonight?',
          zh: '我知道这周有点不对劲，今晚要不要重新聊一聊？',
        },
        tag: { en: 'repair opener', zh: '修复型开场' },
      },
      {
        speaker: 'partner',
        time: '19:53',
        text: {
          en: 'Yes, sorry. I was overloaded. I do want to reconnect.',
          zh: '好，抱歉，这几天真的太忙了。我也想重新找回感觉。',
        },
        tag: { en: '15m reply', zh: '15 分钟回复' },
      },
      {
        speaker: 'you',
        time: '20:01',
        text: {
          en: 'No pressure. Maybe just a call first and then plan the weekend.',
          zh: '不用有压力，先打个电话，再看看周末要不要见面。',
        },
        tag: { en: 'low-pressure move', zh: '低压力推进' },
      },
      {
        speaker: 'partner',
        time: '20:08',
        text: {
          en: 'That actually sounds nice. I can do 9:30.',
          zh: '这样其实挺好的，我 9:30 可以。',
        },
        tag: { en: 'window reopening', zh: '窗口重新打开' },
      },
    ],
    extracted: [
      {
        title: { en: 'Reply Delay', zh: '回复时延' },
        value: '16m',
        note: { en: 'Latency is improving compared with the previous week.', zh: '相比前一周，时延明显改善。' },
      },
      {
        title: { en: 'Message Length', zh: '消息长度' },
        value: '+22%',
        note: { en: 'Longer replies indicate renewed engagement.', zh: '消息重新变长，说明投入度在回升。' },
      },
      {
        title: { en: 'Overlap Window', zh: '重叠时段' },
        value: '20:00+',
        note: { en: 'Evening availability is returning as a healthy signal.', zh: '晚间可互动时间重新出现，是积极信号。' },
      },
      {
        title: { en: 'Health Score', zh: '健康评分' },
        value: '76/100',
        note: { en: 'The system reads this as a recovering relationship state.', zh: '系统将其判断为关系修复中的状态。' },
      },
    ],
  },
  attention: {
    messages: [
      {
        speaker: 'you',
        time: '11:42',
        text: {
          en: 'Hey, are we still good for tonight?',
          zh: '嗨，我们今晚还照常吗？',
        },
        tag: { en: 'opener', zh: '主动开场' },
      },
      {
        speaker: 'partner',
        time: '12:27',
        text: {
          en: 'Maybe. Busy now.',
          zh: '可能吧，我现在有点忙。',
        },
        tag: { en: '45m reply', zh: '45 分钟回复' },
      },
      {
        speaker: 'you',
        time: '14:01',
        text: {
          en: 'Okay. Just let me know when you have a minute.',
          zh: '好，那你有空的时候告诉我一声。',
        },
        tag: { en: 'follow-up', zh: '继续跟进' },
      },
      {
        speaker: 'partner',
        time: '18:52',
        text: {
          en: 'Will text later.',
          zh: '晚点再说。',
        },
        tag: { en: 'short response', zh: '短句回复' },
      },
    ],
    extracted: [
      {
        title: { en: 'Reply Delay', zh: '回复时延' },
        value: '41m',
        note: { en: 'The response tail is stretching into the afternoon.', zh: '回复时延已经被拉长到午后区间。' },
      },
      {
        title: { en: 'Message Length', zh: '消息长度' },
        value: '-31%',
        note: { en: 'Short replies signal lower conversational investment.', zh: '短句比例升高，说明对话投入度下降。' },
      },
      {
        title: { en: 'Initiative Balance', zh: '主动度' },
        value: '62 / 38',
        note: { en: 'One side is carrying too much of the interaction load.', zh: '当前有一方承担了过多的互动压力。' },
      },
      {
        title: { en: 'Health Score', zh: '健康评分' },
        value: '61/100',
        note: { en: 'The pattern suggests attention is needed before the dip deepens.', zh: '当前模式提示需要尽快关注，避免继续下滑。' },
      },
    ],
  },
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const slots = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22']

function pick(lang: Lang, text: Bilingual) {
  return lang === 'en' ? text.en : text.zh
}

function createRng(seed: number) {
  let current = seed >>> 0
  return () => {
    current += 0x6d2b79f5
    let result = Math.imul(current ^ (current >>> 15), 1 | current)
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result)
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

function buildHeatmap(seed: number, mode: ScenarioKey) {
  const random = createRng(seed)
  const gaussian = (distance: number, spread: number) =>
    Math.exp(-((distance * distance) / (2 * spread * spread)))

  const raw = days.map((_, dayIndex) =>
    slots.map((_, slotIndex) => {
      let value = 0.02 + random() * 0.04

      const evening = gaussian(slotIndex - 10, 1.4)
      const lateEvening = gaussian(slotIndex - 11, 0.9)
      const afterWork = gaussian(slotIndex - 9, 1.2)
      const lunch = gaussian(slotIndex - 6, 0.9)
      const midday = gaussian(slotIndex - 7, 0.8)
      const lateNight = gaussian(slotIndex - 1, 0.9)

      if (mode === 'balanced') {
        value += evening * 0.74
        value += afterWork * 0.24
        value += lateEvening * (dayIndex >= 4 ? 0.16 : 0.06)
        value += dayIndex >= 3 ? 0.1 : 0.04
        value += dayIndex >= 5 ? 0.12 : 0
        value -= lateNight * 0.08
      }

      if (mode === 'reconnect') {
        const progress = dayIndex / Math.max(1, days.length - 1)
        value += evening * (0.18 + progress * 0.46)
        value += afterWork * (0.12 + progress * 0.22)
        value += lateEvening * (0.05 + progress * 0.18)
        value += progress * 0.1
        value -= dayIndex < 2 ? evening * 0.14 : 0
      }

      if (mode === 'attention') {
        const middayFocus = lunch * 0.62 + midday * 0.34
        value += middayFocus * (dayIndex === 1 || dayIndex === 3 || dayIndex === 4 ? 1 : 0.62)
        value -= evening * 0.46
        value -= afterWork * 0.28
        value -= dayIndex >= 5 ? 0.08 : 0
        value += dayIndex === 2 ? lunch * 0.08 : 0
      }

      return value
    }),
  )

  const flat = raw.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)

  return raw.map((row) =>
    row.map((value) => {
      const normalized = (value - min) / Math.max(0.001, max - min)
      const contrasted = Math.pow(normalized, 1.24)
      return Number(Math.max(0.03, Math.min(1, contrasted)).toFixed(3))
    }),
  )
}

function buildSignalPaths(seed: number) {
  const random = createRng(seed)
  return Array.from({ length: 4 }, (_, index) => {
    const base = 56 + index * 72
    const amplitude = 24 + random() * 34
    const frequency = 1.15 + random() * 1.2
    const offset = random() * Math.PI * 2

    const points = Array.from({ length: 12 }, (_, pointIndex) => {
      const x = 18 + pointIndex * 62
      const y =
        base +
        Math.sin(pointIndex / frequency + offset) * amplitude +
        (random() - 0.5) * 16
      return `${x},${y.toFixed(1)}`
    })

    return {
      id: `${seed}-${index}`,
      opacity: 0.14 + index * 0.08,
      width: 1.1 + index * 0.45,
      points: points.join(' '),
    }
  })
}

function pathFromValues(values: number[], width: number, height: number, padding = 22) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const innerWidth = width - padding * 2
  const innerHeight = height - padding * 2

  return values
    .map((value, index) => {
      const x = padding + (innerWidth * index) / Math.max(1, values.length - 1)
      const ratio = (value - min) / Math.max(1, max - min)
      const y = height - padding - innerHeight * ratio
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join(' ')
}

function movingAverage(values: number[], period: number) {
  return values.map((_, index) => {
    if (index < period - 1) return null
    const slice = values.slice(index - period + 1, index + 1)
    const average = slice.reduce((sum, value) => sum + value, 0) / period
    return Number(average.toFixed(2))
  })
}

function SectionLead({
  index,
  kicker,
  title,
  summary,
}: {
  index: string
  kicker: string
  title: string
  summary: string
}) {
  return (
    <div className="section-lead">
      <span className="section-index">{index}</span>
      <p className="section-kicker">{kicker}</p>
      <h2>{title}</h2>
      <p className="section-summary">{summary}</p>
    </div>
  )
}

function CandleChart({
  candles,
  phases,
  activePhase,
  lang,
}: {
  candles: Candle[]
  phases: PhaseBand[]
  activePhase: number
  lang: Lang
}) {
  const width = 1080
  const height = 560
  const paddingX = 64
  const paddingY = 40
  const volumeHeight = 92
  const chartGap = 16
  const allValues = candles.flatMap((candle) => [candle.low, candle.high])
  const min = Math.min(...allValues) - 4
  const max = Math.max(...allValues) + 4
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingY * 2 - volumeHeight - chartGap
  const volumeTop = paddingY + chartHeight + chartGap
  const step = chartWidth / candles.length
  const trendValues = candles.map((candle) => candle.close)
  const ma5 = movingAverage(trendValues, 5)
  const ma10 = movingAverage(trendValues, 10)
  const volumeMax = Math.max(...candles.map((candle) => candle.volume))

  const scaleY = (value: number) =>
    paddingY + chartHeight - ((value - min) / (max - min)) * chartHeight

  const pathForSeries = (values: Array<number | null>) => {
    let started = false

    return values
      .map((value, index) => {
        if (value === null) return ''
        const x = paddingX + step * index + step / 2
        const y = scaleY(value)
        const command = started ? 'L' : 'M'
        started = true
        return `${command} ${x.toFixed(2)} ${y.toFixed(2)}`
      })
      .filter(Boolean)
      .join(' ')
  }

  const trendPath = pathForSeries(trendValues)
  const trendArea = `${trendPath} L ${width - paddingX} ${paddingY + chartHeight} L ${paddingX} ${paddingY + chartHeight} Z`
  const ma5Path = pathForSeries(ma5)
  const ma10Path = pathForSeries(ma10)
  const latest = candles[candles.length - 1]
  const latestPriceY = scaleY(latest.close)

  return (
    <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="relationship heat K-line chart">
      {[0, 1, 2, 3, 4].map((row) => {
        const y = paddingY + (chartHeight / 4) * row
        return <line key={row} className="grid-line" x1={paddingX} y1={y} x2={width - paddingX} y2={y} />
      })}

      {phases.map((phase, index) => {
        const x = paddingX + step * phase.start
        const phaseWidth = step * (phase.end - phase.start + 1)
        return (
          <g key={phase.range}>
            <rect
              x={x}
              y={paddingY - 6}
              width={phaseWidth}
              height={chartHeight + 10}
              className={index === activePhase ? 'phase-band active' : 'phase-band'}
            />
            <text
              x={x + phaseWidth / 2}
              y={20}
              textAnchor="middle"
              className={index === activePhase ? 'phase-axis-label active' : 'phase-axis-label'}
            >
              {lang === 'en' ? pick(lang, phase.title) : phase.range}
            </text>
          </g>
        )
      })}

      <path d={trendArea} className="hero-trend-area" />
      <path d={trendPath} className="hero-trend-line" />
      <path d={ma5Path} className="market-line ma-fast" />
      <path d={ma10Path} className="market-line ma-slow" />

      <line
        className="price-marker-line"
        x1={paddingX}
        y1={latestPriceY}
        x2={width - paddingX}
        y2={latestPriceY}
      />
      <text x={width - paddingX + 10} y={latestPriceY + 4} className="price-marker-tag">
        {latest.close}
      </text>

      {candles.map((candle, index) => {
        if (index % 3 !== 0 && index !== candles.length - 1) return null
        const x = paddingX + step * index + step / 2
        const y = scaleY(candle.close)
        return <circle key={`close-dot-${candle.label}`} cx={x} cy={y} r="4.4" className="chart-overlay-dot" />
      })}

      {candles.map((candle, index) => {
        const x = paddingX + step * index + step / 2
        const bodyWidth = step * 0.58
        const openY = scaleY(candle.open)
        const closeY = scaleY(candle.close)
        const highY = scaleY(candle.high)
        const lowY = scaleY(candle.low)
        const isUp = candle.close >= candle.open
        const rectY = Math.min(openY, closeY)
        const rectHeight = Math.max(6, Math.abs(closeY - openY))

        return (
          <g key={candle.label}>
            <line
              x1={x}
              y1={highY}
              x2={x}
              y2={lowY}
              className={isUp ? 'wick up' : 'wick down'}
            />
            <rect
              x={x - bodyWidth / 2}
              y={rectY}
              width={bodyWidth}
              height={rectHeight}
              rx={bodyWidth / 4}
              className={isUp ? 'candle up' : 'candle down'}
            />
            {(index % 7 === 0 || index === candles.length - 1) && (
              <text x={x} y={height - 10} textAnchor="middle" className="axis-label">
                {candle.label}
              </text>
            )}
          </g>
        )
      })}

      {candles.map((candle, index) => {
        const x = paddingX + step * index + step / 2
        const barWidth = step * 0.54
        const barHeight = (candle.volume / volumeMax) * volumeHeight
        return (
          <rect
            key={`volume-${candle.label}`}
            x={x - barWidth / 2}
            y={volumeTop + volumeHeight - barHeight}
            width={barWidth}
            height={barHeight}
            rx={2}
            className={candle.close >= candle.open ? 'volume-bar up' : 'volume-bar down'}
          />
        )
      })}

      {[max, max - (max - min) * 0.25, max - (max - min) * 0.5, max - (max - min) * 0.75, min].map((value) => (
        <text
          key={`price-${value}`}
          x={width - paddingX + 10}
          y={scaleY(value) + 4}
          className="price-axis-label"
        >
          {value.toFixed(0)}
        </text>
      ))}

      <text x={paddingX} y={volumeTop + volumeHeight + 16} className="volume-axis-label">
        {lang === 'en' ? 'VOL' : '量能'}
      </text>
    </svg>
  )
}

function KlinePhaseRail({
  phases,
  activePhase,
  drivers,
  lang,
  onSelectPhase,
}: {
  phases: PhaseBand[]
  activePhase: number
  drivers: DriverCard[]
  lang: Lang
  onSelectPhase: (index: number) => void
}) {
  const current = phases[activePhase]

  return (
    <div className="phase-rail">
      <div className="phase-current">
        <p className="band-label">{lang === 'en' ? 'Current phase' : '当前阶段'}</p>
        <h3>{pick(lang, current.title)}</h3>
        <p>{pick(lang, current.reason)}</p>
        <p className="phase-impact">{pick(lang, current.impact)}</p>
      </div>

      <div className="phase-list">
        {phases.map((phase, index) => (
          <button
            key={phase.range}
            className={index === activePhase ? 'phase-button active' : 'phase-button'}
            type="button"
            onClick={() => onSelectPhase(index)}
            aria-pressed={index === activePhase}
          >
            <span>{phase.range}</span>
            <strong>{pick(lang, phase.title)}</strong>
            <p>{pick(lang, phase.reason)}</p>
          </button>
        ))}
      </div>

      <div className="driver-list">
        {drivers.map((driver) => (
          <div className="driver-row" key={driver.title.en}>
            <span>{pick(lang, driver.title)}</span>
            <strong>{driver.value}</strong>
            <p>{pick(lang, driver.note)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SignalMini({ values }: { values: number[] }) {
  const width = 220
  const height = 84
  const path = pathFromValues(values, width, height, 10)
  const area = `${path} L ${width - 10} ${height - 10} L 10 ${height - 10} Z`

  return (
    <svg className="mini-signal" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      {[0, 1, 2].map((row) => {
        const y = 10 + row * 22
        return <line key={row} className="mini-grid" x1="10" y1={y} x2={width - 10} y2={y} />
      })}
      <path d={area} className="mini-area" />
      <path d={path} className="mini-path" />
    </svg>
  )
}

function MessageTrend({ values }: { values: number[] }) {
  const width = 420
  const height = 216
  const path = pathFromValues(values, width, height)
  const area = `${path} L ${width - 22} ${height - 22} L 22 ${height - 22} Z`
  const labels = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']

  return (
    <svg className="mini-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="message length trend">
      {[0, 1, 2, 3].map((row) => {
        const y = 22 + row * 48
        return <line key={row} className="grid-line subtle" x1="22" y1={y} x2={width - 22} y2={y} />
      })}
      <path d={area} className="chart-overlay-area" />
      <path d={path} className="chart-overlay-line" />
      {values.map((value, index) => {
        const innerWidth = width - 44
        const min = Math.min(...values)
        const max = Math.max(...values)
        const ratio = (value - min) / Math.max(1, max - min)
        const x = 22 + (innerWidth * index) / Math.max(1, values.length - 1)
        const y = height - 22 - ratio * (height - 44)
        return (
          <g key={`${value}-${index}`}>
            <circle cx={x} cy={y} r="4.5" className="chart-overlay-dot" />
            {(index === 0 || index === 3 || index === values.length - 1) && (
              <text x={x} y={height - 8} textAnchor="middle" className="axis-label mini-axis-label">
                {labels[index]}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function DelayDistribution({
  bands,
  lang,
}: {
  bands: { label: string; value: number; note: Bilingual }[]
  lang: Lang
}) {
  return (
    <div className="delay-list">
      {bands.map((band) => (
        <div className="delay-row" key={band.label}>
          <div className="delay-head">
            <span>{band.label}</span>
            <strong>{band.value}%</strong>
          </div>
          <div className="delay-bar">
            <div className="delay-fill" style={{ width: `${band.value}%` }} />
          </div>
          <p>{pick(lang, band.note)}</p>
        </div>
      ))}
    </div>
  )
}

function InitiativeBalance({
  you,
  partner,
  lang,
}: {
  you: number
  partner: number
  lang: Lang
}) {
  return (
    <div className="initiative-wrap">
      <div className="initiative-bar">
        <div className="initiative-you" style={{ width: `${you}%` }}>
          {lang === 'en' ? `You ${you}%` : `你 ${you}%`}
        </div>
        <div className="initiative-ta" style={{ width: `${partner}%` }}>
          {lang === 'en' ? `Partner ${partner}%` : `TA ${partner}%`}
        </div>
      </div>
      <div className="initiative-caption">
        <span>{lang === 'en' ? 'initiative balance' : '主动度平衡'}</span>
        <strong>{Math.abs(you - partner)}% gap</strong>
      </div>
    </div>
  )
}

function Heatmap({
  seed,
  scenario,
  lang,
}: {
  seed: number
  scenario: ScenarioKey
  lang: Lang
}) {
  const data = buildHeatmap(seed, scenario)
  const peak = data.flatMap((row, rowIndex) =>
    row.map((value, colIndex) => ({ rowIndex, colIndex, value })),
  ).sort((a, b) => b.value - a.value)[0]

  return (
    <div className="heatmap-grid">
      <div className="heatmap-legend">
        <span>{lang === 'en' ? 'low overlap' : '低重叠'}</span>
        <div className="heatmap-scale" aria-hidden="true">
          {Array.from({ length: 5 }, (_, index) => (
            <i key={index} style={{ opacity: 0.24 + index * 0.18 }} />
          ))}
        </div>
        <span>{lang === 'en' ? 'hot zone' : '高热区'}</span>
        <strong>
          {lang === 'en'
            ? `peak: ${days[peak.rowIndex]} ${slots[peak.colIndex]}:00`
            : `高峰：${days[peak.rowIndex]} ${slots[peak.colIndex]}:00`}
        </strong>
      </div>
      <div className="heatmap-axis top">
        <span></span>
        {slots.map((slot) => (
          <span key={slot}>{slot}</span>
        ))}
      </div>
      {data.map((row, rowIndex) => (
        <div className="heatmap-row" key={days[rowIndex]}>
          <span className="heatmap-day">{days[rowIndex]}</span>
          {row.map((value, colIndex) => (
            <div
              className={
                value > 0.88 ? 'heat-cell super' : value > 0.68 ? 'heat-cell peak' : value > 0.4 ? 'heat-cell warm' : 'heat-cell'
              }
              key={`${rowIndex}-${colIndex}`}
              style={{
                opacity: 0.16 + value * 1.02,
                transform: `scale(${0.86 + value * 0.24})`,
                background:
                  value > 0.88
                    ? `linear-gradient(135deg, rgba(255, 98, 61, ${0.46 + value * 0.22}), rgba(255, 212, 94, ${0.44 + value * 0.18}) 48%, rgba(216, 255, 88, ${0.62 + value * 0.12}))`
                    : value > 0.68
                      ? `linear-gradient(135deg, rgba(29, 45, 82, ${0.26 + value * 0.28}), rgba(50, 92, 255, ${0.42 + value * 0.34}) 52%, rgba(216, 255, 88, ${0.22 + value * 0.46}))`
                      : `linear-gradient(135deg, rgba(7, 17, 31, ${0.14 + value * 0.24}), rgba(50, 92, 255, ${0.16 + value * 0.34}) 52%, rgba(199, 255, 77, ${0.1 + value * 0.34}))`,
                boxShadow:
                  value > 0.88
                    ? `0 0 0 1px rgba(255, 228, 156, 0.26), 0 0 ${24 + value * 24}px rgba(255, 98, 61, 0.3), 0 0 ${12 + value * 20}px rgba(216, 255, 88, 0.28)`
                    : value > 0.68
                      ? `0 0 0 1px rgba(199, 255, 77, 0.22), 0 0 ${14 + value * 18}px rgba(50, 92, 255, 0.26)`
                      : 'inset 0 0 0 1px rgba(255, 255, 255, 0.06)',
              }}
              title={`${days[rowIndex]} ${slots[colIndex]}:00`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

function Gauge({ score, delta }: { score: number; delta: number }) {
  const angle = Math.round((score / 100) * 270)
  return (
    <div className="gauge-shell">
      <div
        className="gauge-core"
        style={{
          background: `conic-gradient(var(--coral) 0deg ${angle}deg, rgba(19, 32, 51, 0.08) ${angle}deg 270deg, transparent 270deg 360deg)`,
        }}
      >
        <div className="gauge-inner">
          <span>HEALTH</span>
          <strong>{score}</strong>
          <em className={delta >= 0 ? 'positive' : 'negative'}>{delta >= 0 ? `+${delta}` : delta}</em>
        </div>
      </div>
    </div>
  )
}

function SignalField({ seed }: { seed: number }) {
  const paths = buildSignalPaths(seed)

  return (
    <svg className="signal-field" viewBox="0 0 720 320" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="signalGradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ff7a59" />
          <stop offset="50%" stopColor="#96c7b7" />
          <stop offset="100%" stopColor="#8b7288" />
        </linearGradient>
      </defs>
      {paths.map((path) => (
        <polyline
          key={path.id}
          points={path.points}
          fill="none"
          stroke="url(#signalGradient)"
          strokeWidth={path.width}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={path.opacity}
        />
      ))}
      {paths.map((path, index) => {
        const lastPoint = path.points.split(' ').at(-1)?.split(',') ?? ['680', '120']
        return (
          <circle
            key={`${path.id}-dot`}
            cx={Number(lastPoint[0])}
            cy={Number(lastPoint[1])}
            r={7 + index * 2}
            fill="url(#signalGradient)"
            opacity={0.16 + index * 0.1}
          />
        )
      })}
    </svg>
  )
}

function App() {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'en'
    const saved = window.localStorage.getItem(LANGUAGE_KEY)
    return saved === 'zh' ? 'zh' : 'en'
  })
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('balanced')
  const [activeFeed, setActiveFeed] = useState(0)
  const [selectedPhase, setSelectedPhase] = useState<number | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  const active = scenarios[activeScenario]
  const latestCandle = active.candles[active.candles.length - 1]
  const previousCandle = active.candles[active.candles.length - 2] ?? latestCandle
  const latestDelta = latestCandle.close - previousCandle.close
  const latestDeltaPct = ((latestDelta / Math.max(1, previousCandle.close)) * 100).toFixed(1)
  const activeFlow = activeFeed % flowSteps.length
  const activePipeline = activeFeed % pipelineStages.length
  const activePhase = selectedPhase ?? (activeFeed % active.phases.length)
  const activeCase = conversationCases[activeScenario]
  const activeMessage = activeFeed % activeCase.messages.length
  const activeChannel = (activeFeed + scenarioOrder.indexOf(activeScenario) * 2) % channelCoverage.length
  const activeMode = activeFeed % accessModes.length
  const metricSignals = [
    { value: active.messageShift, values: active.candles.slice(-8).map((candle) => candle.close) },
    { value: active.responseMedian, values: active.delayBands.map((band) => band.value) },
    { value: `${Math.round(active.messageLengths.reduce((sum, value) => sum + value, 0) / active.messageLengths.length)} avg`, values: active.messageLengths },
    { value: `${active.initiative.you}/${active.initiative.partner}`, values: [42, 45, 46, 48, active.initiative.you, active.initiative.partner] },
    { value: active.dominantWindow, values: [22, 28, 31, 42, 54, 68, 74] },
    { value: `${active.health}/100`, values: [active.health - 11, active.health - 8, active.health - 5, active.health - 2, active.health] },
    { value: `${active.anomalyCount}`, values: [1, 2, 1, 3, active.anomalyCount, Math.max(1, active.anomalyCount - 1)] },
    { value: lang === 'en' ? 'AI' : 'AI', values: [26, 34, 42, 55, 66, 72, 80] },
  ]
  const tapeItems = [
    lang === 'en' ? `health ${active.health}/100` : `健康 ${active.health}/100`,
    lang === 'en' ? `median ${active.responseMedian}` : `中位 ${active.responseMedian}`,
    lang === 'en' ? `shift ${active.messageShift}` : `变化 ${active.messageShift}`,
    lang === 'en'
      ? `initiative ${active.initiative.you}/${active.initiative.partner}`
      : `主动度 ${active.initiative.you}/${active.initiative.partner}`,
    lang === 'en' ? `window ${active.dominantWindow}` : `窗口 ${active.dominantWindow}`,
    lang === 'en' ? 'wechat + whatsapp + telegram + imessage' : '微信 + whatsapp + telegram + imessage',
    lang === 'en' ? 'messenger + line + instagram dm' : 'messenger + line + instagram dm',
    lang === 'en' ? 'open-source self-hosted runtime' : '开源自托管运行时',
    lang === 'en' ? 'metadata + export + presence modes' : '元数据 + 导出 + 在线状态模式',
    lang === 'en' ? 'weekly report + alerts + ai actions' : '周报 + 预警 + AI 建议',
  ]

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_KEY, lang)
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN'
    document.title =
      lang === 'en'
        ? 'LoveQuant · Relationship Health Dashboard'
        : 'LoveQuant · 恋爱健康仪表盘'
  }, [lang])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveScenario((current) => {
        const index = scenarioOrder.indexOf(current)
        return scenarioOrder[(index + 1) % scenarioOrder.length]
      })
    }, 5200)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveFeed((current) => (current + 1) % liveFeed.length)
    }, 1800)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(scrollable > 0 ? window.scrollY / scrollable : 0)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>('.reveal-block'))
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    )

    targets.forEach((target) => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  const chooseScenario = (scenario: ScenarioKey) => {
    setActiveScenario(scenario)
    setActiveFeed(scenarioOrder.indexOf(scenario))
    setSelectedPhase(null)
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <main className="app-shell" data-scenario={activeScenario}>
      <div className="page-noise" />
      <div className="scroll-progress">
        <div className="scroll-progress-bar" style={{ transform: `scaleX(${scrollProgress})` }} />
      </div>

      <header className="masthead reveal-block">
        <div className="masthead-top">
          <div className="project-line">
            <span className="project-mark">LoveQuant</span>
            <span>{lang === 'en' ? 'open-source relationship intelligence' : '开源关系智能'}</span>
            <span>{lang === 'en' ? 'message signal board' : '消息信号终端'}</span>
          </div>
          <div className="lang-toggle" role="tablist" aria-label="Language switcher">
            <button
              className={lang === 'en' ? 'lang-button active' : 'lang-button'}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              EN
            </button>
            <button
              className={lang === 'zh' ? 'lang-button active' : 'lang-button'}
              onClick={() => setLang('zh')}
              aria-pressed={lang === 'zh'}
            >
              中文
            </button>
          </div>
        </div>

        <div className="masthead-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              {lang === 'en'
                ? 'DON’T GUESS THE RELATIONSHIP. READ THE SIGNAL.'
                : '别凭感觉，用数据读懂关系。'}
            </p>
            <h1>
              {lang === 'en'
                ? 'Relationship signals, staged like a real market screen.'
                : '把关系信号做成像真实行情屏一样的展示界面。'}
            </h1>
            <p className="hero-lead">
              {lang === 'en'
                ? 'LoveQuant turns conversations from WeChat, WhatsApp, Telegram, iMessage, LINE, Messenger, Instagram DM, or exported histories into candlesticks, overlap heatmaps, anomaly markers, and report-ready guidance.'
                : 'LoveQuant 把微信、WhatsApp、Telegram、iMessage、LINE、Messenger、Instagram DM 以及聊天导出记录，转成 K 线、重叠热力图、异常标记和可读报告建议。'}
            </p>
            <p className="hero-note">
              {lang === 'en'
                ? 'Read relationship momentum through candlesticks, heat zones, delay bands, anomaly markers, and report-ready action prompts.'
                : '用 K 线、热区、时延带、异常标记和行动提示，读懂一段关系是在升温、回暖，还是开始承压。'}
            </p>

            <div className="hero-tags">
              <span>WeChat</span>
              <span>WhatsApp</span>
              <span>Telegram</span>
              <span>iMessage</span>
              <span>LINE</span>
              <span>Messenger</span>
              <span>Instagram DM</span>
            </div>

            <nav className="hero-nav" aria-label={lang === 'en' ? 'Jump to sections' : '跳转到分区'}>
              <button type="button" className="hero-link" onClick={() => scrollToSection('signals-section')}>
                {lang === 'en' ? 'Signals' : '信号'}
              </button>
              <button type="button" className="hero-link" onClick={() => scrollToSection('parser-section')}>
                {lang === 'en' ? 'Parser' : '解析'}
              </button>
              <button type="button" className="hero-link" onClick={() => scrollToSection('dashboard-section')}>
                {lang === 'en' ? 'Terminal' : '终端'}
              </button>
              <button type="button" className="hero-link" onClick={() => scrollToSection('runtime-section')}>
                {lang === 'en' ? 'Runtime' : '运行链路'}
              </button>
            </nav>
          </div>

          <div className="hero-side">
            <div className="hero-preview">
              <div className="hero-preview-head">
                <div>
                  <p className="band-label">{lang === 'en' ? 'Live market preview' : '实时行情预览'}</p>
                  <strong>{lang === 'en' ? '28D relationship heat' : '28 日关系热度'}</strong>
                </div>
                <div className={latestDelta >= 0 ? 'market-pulse positive' : 'market-pulse negative'}>
                  <strong>{latestCandle.close}</strong>
                  <span>{`${latestDelta >= 0 ? '+' : ''}${latestDeltaPct}%`}</span>
                </div>
              </div>
              <div className="hero-preview-chart">
                <CandleChart
                  candles={active.candles}
                  phases={active.phases}
                  activePhase={activePhase}
                  lang={lang}
                />
              </div>
            </div>

            <div className="scenario-rail">
              {Object.values(scenarios).map((scenario) => (
                <button
                  key={scenario.id}
                  type="button"
                  className={scenario.id === activeScenario ? 'scenario-row active' : 'scenario-row'}
                  onClick={() => chooseScenario(scenario.id)}
                >
                  <div className="scenario-top">
                    <strong>{pick(lang, scenario.label)}</strong>
                    <span>{scenario.health}/100</span>
                  </div>
                  <p>{pick(lang, scenario.hook)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <section className="stage-band reveal-block">
        <SignalField seed={active.seed} />
        <div className="stage-strip">
          <div className="stage-strip-item">
            <span>{lang === 'en' ? 'close' : '收盘'}</span>
            <strong>{latestCandle.close}</strong>
          </div>
          <div className="stage-strip-item">
            <span>{lang === 'en' ? 'change' : '涨跌幅'}</span>
            <strong>{`${latestDelta >= 0 ? '+' : ''}${latestDeltaPct}%`}</strong>
          </div>
          <div className="stage-strip-item">
            <span>{lang === 'en' ? 'health' : '健康'}</span>
            <strong>{active.health}/100</strong>
          </div>
          <div className="stage-strip-item">
            <span>{lang === 'en' ? 'latency' : '时延'}</span>
            <strong>{active.responseMedian}</strong>
          </div>
          <div className="stage-strip-item">
            <span>{lang === 'en' ? 'window' : '主窗口'}</span>
            <strong>{active.dominantWindow}</strong>
          </div>
          <div className="stage-strip-item">
            <span>{lang === 'en' ? 'state' : '状态'}</span>
            <strong>{pick(lang, active.temperature)}</strong>
          </div>
        </div>

        <div className="stage-grid">
          <div className="stage-chart">
            <div className="stage-chart-head">
              <div>
                <p className="band-label">{lang === 'en' ? 'Relationship heat / K-line' : '关系热度 / K 线'}</p>
                <h2>{lang === 'en' ? '28-day relationship heat market' : '28 日关系热度行情图'}</h2>
                <p>{pick(lang, active.description)}</p>
              </div>
              <div className={latestDelta >= 0 ? 'market-pulse positive' : 'market-pulse negative'}>
                <strong>{latestCandle.close}</strong>
                <span>{`${latestDelta >= 0 ? '+' : ''}${latestDeltaPct}%`}</span>
              </div>
            </div>

            <div className="market-strip">
              <div className="market-stat">
                <span>{lang === 'en' ? 'open' : '开'}</span>
                <strong>{latestCandle.open}</strong>
              </div>
              <div className="market-stat">
                <span>{lang === 'en' ? 'high' : '高'}</span>
                <strong>{latestCandle.high}</strong>
              </div>
              <div className="market-stat">
                <span>{lang === 'en' ? 'low' : '低'}</span>
                <strong>{latestCandle.low}</strong>
              </div>
              <div className="market-stat">
                <span>{lang === 'en' ? 'close' : '收'}</span>
                <strong>{latestCandle.close}</strong>
              </div>
              <div className="market-stat">
                <span>{lang === 'en' ? 'volume' : '量能'}</span>
                <strong>{Math.round(latestCandle.volume)}</strong>
              </div>
            </div>

            <div className="chart-legend">
              <span className="chart-legend-item ma-fast">MA5</span>
              <span className="chart-legend-item ma-slow">MA10</span>
              <span className="chart-legend-item up">
                {lang === 'en' ? 'bull candles' : '上涨 K 线'}
              </span>
              <span className="chart-legend-item down">
                {lang === 'en' ? 'pullback candles' : '回落 K 线'}
              </span>
              <span className="chart-legend-item volume">
                {lang === 'en' ? 'volume' : '量能'}
              </span>
            </div>

            <CandleChart
              candles={active.candles}
              phases={active.phases}
              activePhase={activePhase}
              lang={lang}
            />
          </div>

          <KlinePhaseRail
            phases={active.phases}
            activePhase={activePhase}
            drivers={active.drivers}
            lang={lang}
            onSelectPhase={setSelectedPhase}
          />
        </div>
      </section>

      <section className="signal-tape reveal-block" aria-label={lang === 'en' ? 'Live signals' : '实时信号'}>
        <div className="signal-tape-track">
          {[...tapeItems, ...tapeItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </section>

      <section id="signals-section" className="idea-section reveal-block">
        <SectionLead
          index="01"
          kicker={lang === 'en' ? 'SIGNAL STACK' : '信号栈'}
          title={
            lang === 'en'
              ? 'What LoveQuant reads from conversations.'
              : 'LoveQuant 能从对话里读出什么。'
          }
          summary={
            lang === 'en'
              ? 'LoveQuant turns raw message rhythm into one readable signal language: heat, timing, investment, balance, overlap, anomalies, and actions.'
              : 'LoveQuant 会把原始聊天节奏，转成一套可读的信号语言：热度、时延、投入、平衡、重叠、异常和行动建议。'
          }
        />

        <div className="section-body">
          <div className="metric-table">
            {metricCards.map((metric, index) => (
              <article className="metric-row" key={metric.title.en}>
                <div className="metric-code">
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <strong>{metric.icon}</strong>
                </div>
                <div className="metric-main">
                  <h3>{pick(lang, metric.title)}</h3>
                  <p>{pick(lang, metric.detail)}</p>
                </div>
                <div className="metric-viz">
                  <strong>{metricSignals[index].value}</strong>
                  <SignalMini values={metricSignals[index].values} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="parser-section" className="idea-section reveal-block">
        <SectionLead
          index="02"
          kicker={lang === 'en' ? 'PARSER DEMO' : '解析示例'}
          title={
            lang === 'en'
              ? 'Raw messages, extracted signals, and live runtime flow on one screen.'
              : '让原始消息、提取后的信号和实时链路出现在同一块屏幕上。'
          }
          summary={
            lang === 'en'
              ? 'LoveQuant keeps the message layer, parsed signal layer, and runtime layer on one screen so the insight feels traceable.'
              : 'LoveQuant 会把消息层、解析后的信号层和运行时层放在同一块屏幕上，让结论可追踪、可理解。'
          }
        />

        <div className="section-body">
          <div className="parser-terminal">
            <div className="terminal-head">
              <p className="band-label">{lang === 'en' ? 'Recent messages / parser / engine' : '最近消息 / 解析器 / 引擎'}</p>
              <div className="terminal-head-tags">
                <span>{liveFeed[activeFeed % liveFeed.length].channel}</span>
                <span>{liveFeed[activeFeed % liveFeed.length].time}</span>
                <span>{pick(lang, active.rhythmTag)}</span>
              </div>
            </div>

            <div className="parser-grid">
              <div className="terminal-column">
                <p className="terminal-label">{lang === 'en' ? 'Recent chat panel' : '最近聊天面板'}</p>
                <div className="conversation-thread">
                  {activeCase.messages.map((message, index) => (
                    <div
                      key={`${message.time}-${message.text.en}`}
                      className={
                        index === activeMessage
                          ? `conversation-bubble ${message.speaker} active`
                          : `conversation-bubble ${message.speaker}`
                      }
                    >
                      <div className="conversation-meta">
                        <span>{message.time}</span>
                        <em>{pick(lang, message.tag)}</em>
                      </div>
                      <p>{pick(lang, message.text)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="terminal-column">
                <p className="terminal-label">{lang === 'en' ? 'Extracted signal panel' : '提取后的信号面板'}</p>
                <div className="extraction-sheet">
                  {activeCase.extracted.map((item, index) => (
                    <div
                      key={item.title.en}
                      className={index === activeMessage ? 'extraction-item active' : 'extraction-item'}
                    >
                      <div className="extraction-head">
                        <span>{pick(lang, item.title)}</span>
                        <strong>{item.value}</strong>
                      </div>
                      <p>{pick(lang, item.note)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="terminal-column">
                <p className="terminal-label">{lang === 'en' ? 'Live runtime feed' : '实时运行时事件'}</p>
                <div className="console-list">
                  {liveFeed.map((item, index) => (
                    <div
                      className={index === activeFeed ? 'event-row active' : 'event-row'}
                      key={`${item.channel}-${item.time}-${item.event.en}`}
                    >
                      <span>{item.channel}</span>
                      <div>
                        <strong>{item.time}</strong>
                        <p>{pick(lang, item.event)}</p>
                      </div>
                      <em>{pick(lang, item.meta)}</em>
                    </div>
                  ))}
                </div>

                <div className="pipeline-line">
                  {pipelineStages.map((stage, index) => (
                    <div
                      className={index === activePipeline ? 'pipeline-step active' : 'pipeline-step'}
                      key={stage.title.en}
                    >
                      <strong>{pick(lang, stage.title)}</strong>
                      <span>{pick(lang, stage.note)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="dashboard-section" className="idea-section reveal-block">
        <SectionLead
          index="03"
          kicker={lang === 'en' ? 'REFERENCE TERMINAL' : '参考终端'}
          title={
            lang === 'en'
              ? 'The main analytics surface should feel like one terminal, not ten detached cards.'
              : '主分析界面应该像一块终端屏，而不是十张互不相干的卡片。'
          }
          summary={pick(lang, active.description)}
        />

        <div className="section-body">
          <div className="dashboard-terminal">
            <div className="dashboard-topline">
              <div className="stage-strip-item">
                <span>{lang === 'en' ? 'trend' : '趋势'}</span>
                <strong>{active.messageShift}</strong>
              </div>
              <div className="stage-strip-item">
                <span>{lang === 'en' ? 'median delay' : '中位时延'}</span>
                <strong>{active.responseMedian}</strong>
              </div>
              <div className="stage-strip-item">
                <span>{lang === 'en' ? 'initiative' : '主动度'}</span>
                <strong>{`${active.initiative.you}/${active.initiative.partner}`}</strong>
              </div>
              <div className="stage-strip-item">
                <span>{lang === 'en' ? 'anomalies' : '异动'}</span>
                <strong>{active.anomalyCount}</strong>
              </div>
            </div>

            <div className="dashboard-major">
              <div className="heat-zone">
                <div className="insight-title">
                  <div>
                    <p className="band-label">{lang === 'en' ? 'Shared time overlap' : '共同在线时段'}</p>
                    <h3>{lang === 'en' ? '7-day overlap heatmap' : '7 日重叠热力图'}</h3>
                  </div>
                </div>
                <Heatmap seed={active.seed} scenario={activeScenario} lang={lang} />
              </div>

              <div className="heat-side">
                <div className="gauge-zone">
                  <div className="insight-title">
                    <div>
                      <p className="band-label">{lang === 'en' ? 'Health score' : '健康评分'}</p>
                      <h3>{lang === 'en' ? 'Relationship health' : '关系健康总览'}</h3>
                    </div>
                  </div>
                  <Gauge score={active.health} delta={active.delta} />
                  <div className="score-strip">
                    <div>
                      <span>{lang === 'en' ? 'state' : '状态'}</span>
                      <strong>{pick(lang, active.temperature)}</strong>
                    </div>
                    <div>
                      <span>{lang === 'en' ? 'window' : '窗口'}</span>
                      <strong>{active.dominantWindow}</strong>
                    </div>
                    <div>
                      <span>{lang === 'en' ? 'gap' : '差值'}</span>
                      <strong>{Math.abs(active.initiative.you - active.initiative.partner)}%</strong>
                    </div>
                  </div>
                </div>

                <div className="metric-zone">
                  <div className="insight-title">
                    <div>
                      <p className="band-label">{lang === 'en' ? 'Reply delay' : '回复时延'}</p>
                      <h3>{lang === 'en' ? 'Delay distribution' : '时延结构'}</h3>
                    </div>
                  </div>
                  <DelayDistribution bands={active.delayBands} lang={lang} />
                </div>

                <div className="metric-zone">
                  <div className="insight-title">
                    <div>
                      <p className="band-label">{lang === 'en' ? 'Initiative balance' : '主动度平衡'}</p>
                      <h3>{lang === 'en' ? 'Who is carrying the rhythm' : '谁在支撑关系节奏'}</h3>
                    </div>
                  </div>
                  <InitiativeBalance
                    you={active.initiative.you}
                    partner={active.initiative.partner}
                    lang={lang}
                  />
                </div>
              </div>
            </div>

            <div className="insight-grid">
              <div className="insight-column">
                <div className="insight-title">
                  <div>
                    <p className="band-label">{lang === 'en' ? 'Message investment' : '消息投入程度'}</p>
                    <h3>{lang === 'en' ? 'Length trend' : '消息长度趋势'}</h3>
                  </div>
                </div>
                <MessageTrend values={active.messageLengths} />
              </div>

              <div className="insight-column">
                <div className="insight-title">
                  <div>
                    <p className="band-label">{lang === 'en' ? 'Anomaly markers' : '异常标记'}</p>
                    <h3>{lang === 'en' ? 'What changed recently' : '最近哪里发生了变化'}</h3>
                  </div>
                </div>
                <div className="alert-list">
                  {active.anomalies.map((anomaly) => (
                    <div className="alert-row" key={`${anomaly.time}-${anomaly.title.en}`}>
                      <span>{anomaly.time}</span>
                      <strong>{pick(lang, anomaly.title)}</strong>
                      <p>{pick(lang, anomaly.detail)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="insight-column">
                <div className="insight-title">
                  <div>
                    <p className="band-label">{lang === 'en' ? 'Report guidance' : '报告建议'}</p>
                    <h3>{lang === 'en' ? 'Next-step prompts' : '下一步行动提示'}</h3>
                  </div>
                </div>
                <div className="suggestion-list">
                  {active.suggestions.map((suggestion, index) => (
                    <div className="suggestion-row" key={suggestion.en}>
                      <span>{`0${index + 1}`}</span>
                      <p>{pick(lang, suggestion)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="runtime-section" className="idea-section reveal-block">
        <SectionLead
          index="04"
          kicker={lang === 'en' ? 'OPEN-SOURCE RUNTIME MAP' : '开源运行链路'}
          title={
            lang === 'en'
              ? 'Run LoveQuant on your own stack, across the channels couples actually use.'
              : '把 LoveQuant 跑在你自己的栈里，接进情侣真正会用的聊天渠道。'
          }
          summary={
            lang === 'en'
              ? 'Connect mainstream chat sources, run the scoring engine in your own environment, and keep extending the reports, alerts, and action surfaces.'
              : '接入主流聊天来源，在你自己的环境里运行评分引擎，并继续扩展报告、预警和行动建议这些输出界面。'
          }
        />

        <div className="section-body">
          <div className="runtime-map">
            <div className="runtime-column">
              <div className="runtime-head">
                <span>01</span>
                <div>
                  <strong>{lang === 'en' ? 'Sources' : '输入源'}</strong>
                  <p>{lang === 'en' ? 'Mainstream couple channels and export paths.' : '主流情侣沟通渠道与导出路径。'}</p>
                </div>
              </div>

              {channelCoverage.map((channel, index) => (
                <div
                  key={channel.name}
                  className={index === activeChannel ? 'runtime-row active' : 'runtime-row'}
                >
                  <div>
                    <strong>{channel.name}</strong>
                    <span>{pick(lang, channel.region)}</span>
                  </div>
                  <p>{pick(lang, channel.note)}</p>
                  <em>{pick(lang, channel.mode)}</em>
                </div>
              ))}
            </div>

            <div className="runtime-column">
              <div className="runtime-head">
                <span>02</span>
                <div>
                  <strong>{lang === 'en' ? 'Runtime engine' : '运行时引擎'}</strong>
                  <p>{lang === 'en' ? 'Normalize, score, detect, and surface.' : '整理、评分、检测、输出。'}</p>
                </div>
              </div>

              {accessModes.map((mode, index) => (
                <div key={mode.code} className={index === activeMode ? 'runtime-row active' : 'runtime-row'}>
                  <div>
                    <strong>{pick(lang, mode.title)}</strong>
                    <span>{mode.code}</span>
                  </div>
                  <p>{pick(lang, mode.summary)}</p>
                </div>
              ))}

              {flowSteps.map((step, index) => (
                <div key={step.step} className={index === activeFlow ? 'runtime-row active' : 'runtime-row'}>
                  <div>
                    <strong>{`${step.step} · ${pick(lang, step.title)}`}</strong>
                    <span>{pipelineStages[index] ? pick(lang, pipelineStages[index].title) : ''}</span>
                  </div>
                  <p>{pick(lang, step.body)}</p>
                </div>
              ))}
            </div>

            <div className="runtime-column">
              <div className="runtime-head">
                <span>03</span>
                <div>
                  <strong>{lang === 'en' ? 'Outputs and extension surface' : '输出与扩展面'}</strong>
                  <p>{lang === 'en' ? 'The project should end in readable artifacts, not hidden internals.' : '项目最后应该落到清晰可读的输出界面，而不是隐藏在内部逻辑里。'}</p>
                </div>
              </div>

              {reportOutputs.map((item) => (
                <div className="runtime-row" key={item.code}>
                  <div>
                    <strong>{pick(lang, item.title)}</strong>
                    <span>{item.code}</span>
                  </div>
                  <p>{pick(lang, item.body)}</p>
                </div>
              ))}

              <div className="runtime-foot">
                {selfHostPrinciples.map((item) => (
                  <div className="runtime-note" key={item.title.en}>
                    <strong>{pick(lang, item.title)}</strong>
                    <p>{pick(lang, item.body)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
