# LoveQuant Init

## 当前确认的产品设计

### 产品名

`LoveQuant`

### Slogan

`别凭感觉，用数据读懂关系`

### 产品定位

用跨平台沟通数据量化亲密关系的健康趋势，帮助情侣发现沟通盲区、识别变化，并更理性地改善关系质量。

### 核心理念

不要凭感觉猜关系状态，而是把聊天行为中的元数据转成可读懂的关系图表，让两个人都能更清醒地看见投入、变化与节奏。

## 8 大核心指标

| 指标 | 洞察价值 | 可视化形式 |
| --- | --- | --- |
| 消息频率趋势 | 互动活跃度变化 | K 线图 |
| 回复时延分布 | 响应优先级变化 | 分布图 |
| 消息长度趋势 | 对话投入程度 | 趋势图 |
| 双方主动度对比 | 关系平衡健康度 | 对比图 |
| 活跃时间热图 | 共同在线时段 | 热力图 |
| 关系健康评分 | 整体趋势总览 | 仪表盘 |
| 异动预警提示 | 及时发现低谷期 | 标注图 |
| AI 互动建议 | 针对性行动指南 | 建议卡 |

## 三种接入方案

### 方案 A

`共享会话同步`

- 双方共同授权共享会话或工作区
- Bot 仅读取消息元数据，不存储消息文本
- 适配微信、WhatsApp、Telegram、Messenger、LINE 等主流私聊渠道

### 方案 B

`手动导入 / 导出`

- 用户主动转发摘要、导入导出数据或输入对话摘要
- Bot 即时生成指标更新
- 适合微信、iMessage、Instagram DM 等更轻量或更谨慎的场景

### 方案 C

`在线状态 + 时间窗口信号`

- 基于双方公开的在线状态和活跃窗口数据
- 生成活跃度、时间重叠和节奏变化指标

## 平台覆盖

- 微信 `WeChat`
- WhatsApp
- Telegram
- iMessage
- Messenger
- LINE
- Instagram DM
- 手动导出 / 手动摘要模式

## 用户使用流程

1. 双方设置
   - 各自授权 `@LoveQuantBot`
   - Bot 返回“指标同步开启”
2. 日常对话
   - 正常聊天即可
   - 后台仅静默采集元数据
3. 查看仪表盘
   - 发送 `@lovequant report`
   - 返回健康评分、K 线图、预警提示和 AI 建议

## 开源自托管原则

- 自托管部署：可运行在自己的设备、服务器或私有云
- 自带接入能力：根据平台选择导出、API、Bot 或手动导入
- 分析链路可审计：采集、整理、评分与输出逻辑均可查看和修改
- 数据保留可配置：存储格式、保留周期和删除策略由部署者自己决定

## Demo 目标

当前前端 demo 需要完整展示以下内容：

- 大胆、记忆点强的品牌首屏
- 8 指标产品框架
- 3 种接入方案
- 主流情侣沟通渠道覆盖
- 从授权到实时分析再到结果输出的完整流程
- 微信、WhatsApp、Telegram、iMessage、Messenger、LINE、Instagram DM 等主流渠道语境
- 默认英文、中文辅助说明
- 开源自托管能力与报告输出能力
- 成品级仪表盘视觉，而不是单纯原型图

## 产物目录

- `init/README.md`
- `init/themes/private-signal.md`
- `init/DESIGN_PHILOSOPHY.md`
- `init/ALGORITHMIC_PHILOSOPHY.md`
- `init/art/relationship-signal-viewer.html`
- `init/assets/market-poster.png`
- `init/assets/market-teaser.gif`
- `init/lovequant-demo/`
