# Dashboard 页 — 完整文档

## 文件结构

| 文件 | 说明 |
|------|------|
| `src/html/dashboard.html` | 仪表盘 HTML 骨架 |
| `src/js/dashboard.js` | 全部 JS 逻辑（数据加载 + 组件渲染） |
| `src/css/dashboard.css` | 全部样式定义 |

---

## 页面布局

```
┌─ #dashboardSection ───────────────────────────┐
│  ┌─ .dash-topbar ───────────────────────────┐ │
│  │  [搜索框]              [头像] [设置] [退出]│ │
│  └───────────────────────────────────────────┘ │
│  ┌─ .dash-welcome ───────────────────────────┐ │
│  │  Hello，用户！                             │ │
│  │  这里是你的概况汇总表                       │ │
│  └───────────────────────────────────────────┘ │
│  ┌─ .dash-main ──────────────────────────────┐ │
│  │  ┌─ .dash-top-row (grid 1fr 2fr) ──────┐  │ │
│  │  │ ┌─ .dash-left ──┐ ┌─ .dash-right ─┐│  │ │
│  │  │ │ 卡片 2×2 grid │ │  柱状图面板    ││  │ │
│  │  │ │ [到访人次    ] │ │  (JS 渲染)    ││  │ │
│  │  │ │ [今日邀请码  ] │ │               ││  │ │
│  │  │ │ [品类种数    ] │ │               ││  │ │
│  │  │ │ [总样板数    ] │ │               ││  │ │
│  │  │ └──────────────┘ └────────────────┘│  │ │
│  │  └────────────────────────────────────┘  │ │
│  │                                          │ │
│  │  ┌─ .dash-footer (flex 1.5fr / 2fr) ──┐  │ │
│  │  │ ┌─ .footer-left ──┐ ┌─ .footer-right┐│  │ │
│  │  │ │  饼图 2×2 grid  │ │  到访表      ││  │ │
│  │  │ │  ┌─────┐ ┌───┐ │ │  热力图      ││  │ │
│  │  │ │  │ ⭕  │ │⭕ │ │ │              ││  │ │
│  │  │ │  └─────┘ └───┘ │ │              ││  │ │
│  │  │ │  ┌─────┐       │ │              ││  │ │
│  │  │ │  │ ⭕  │       │ │              ││  │ │
│  │  │ │  └─────┘       │ │              ││  │ │
│  │  │ └────────────────┘ └──────────────┘│  │ │
│  │  └────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 组件详情

### 1. 统计卡片（左列 2×2）

- **到访人次** `#dashCardVisits`
- **今日邀请码** `#dashInviteCode`
- **品类种数** `#dashCardCategories`
- **总样板数** `#dashCardSamples`

### 2. 柱状图面板（右列）

- 按月统计到访/采购数据
- 支持切换显示模式（设置面板）
- 每根柱子显示数字标签
- X 轴月份 / Y 轴数值

### 3. 饼图 — 甜甜圈（底部左栏）

#### HTML 结构

```html
<div class="dash-mini-chart">
  <div class="mini-body">
    <div class="mini-donut">          ← flex:1，占左侧空间
      <span class="mini-donut-count">总数</span>
    </div>
    <div class="mini-legend">          ← flex:0 0 auto，内容宽度
      <div class="mini-title">标题</div>
      <span class="mini-legend-item">...</span>
      <span class="mini-legend-item">...</span>
    </div>
  </div>
</div>
```

#### 三个饼图

| 标题 | 数据源 | 分类字段 | 颜色映射 |
|------|--------|----------|----------|
| 订单状态 | orders | `status` | 未提交 #FF9800, 已收录 #4CAF50 |
| 申请类型 | apply | `type` | 运输 #2196F3, 参观 #9C27B0, 选样 #FF5722, 借还 #00BCD4, 其他 #607D8B |
| 打卡角色 | clock | `companyType` | 业主方 #4CAF50, 运营方 #2196F3, 品牌方 #FF9800, 其他 #607D8B |

#### 关键 CSS

- `.mini-donut`：`flex: 1; max-width: 120px; aspect-ratio: 1`，`::after` 伪元素 58% 白圆挖孔
- `.mini-donut-count`：absolute 居中 `translate(-50%, -50%)`
- `.mini-legend`：`flex: 0 0 auto; flex-direction: column` 纵向一列

### 4. 到访表（底部右栏上）

- 近30天到访记录
- 固定高度 175px，可滚动
- 表头 sticky 定位
- 白色边框轮廓 `1px solid rgba(255, 255, 255, 0.5)`

### 5. 热力图（底部右栏下）

- 按季度分组
- 5级颜色密度（lvl-0 ~ lvl-4）
- 圆角格子

---

## 卡片毛玻璃风格（统一）

所有卡片（统计卡片、柱状图面板、饼图卡片、热力图卡片）使用相同的毛玻璃效果：

```css
background: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.92) 0%,
  rgba(245, 250, 255, 0.7) 100%
);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1.5px solid rgba(255, 255, 255, 0.7);
border-radius: 10px / 12px;
box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
```

**父容器保持透明**，卡片之间间隙无色：

| 容器 | 背景 |
|------|------|
| `.dash-footer-left` | `background: transparent` |
| `.dash-charts-grid` | `background-color: rgba(255,255,255,0)` |
| `.dash-footer` | `padding: 0` |

---

## JS 核心方法

| 方法 | 功能 |
|------|------|
| `DashboardPage.prototype._loadData` | 从 Supabase 拉取4张表数据 |
| `DashboardPage.prototype._renderCards` | 渲染4个统计卡片 |
| `DashboardPage.prototype._renderBarChart` | 渲染柱状图 |
| `DashboardPage.prototype._miniDonut` | 生成单个甜甜圈（圆环 + 图例） |
| `DashboardPage.prototype._renderTodo` | 渲染到访表格 |
| `DashboardPage.prototype._renderHeatmap` | 渲染热力图 |
| `DashboardPage.prototype._renderInviteCode` | 生成今日邀请码 |

---

## 版本历史

| 版本 | 文件 | 改动 |
|------|------|------|
| v59→v82 | `dashboard.css` | 饼图布局演进（grid→flex、列→行、grid图例→纵向列表等） |
| v82→v93 | `dashboard.css` | 毛玻璃风格统一：饼图卡片加白框→父容器透明→卡片白色背景恢复→热力图边框同步 |
| v1 | `dashboard.js` | 首次创建 |
| v1 | `dashboard.html` | 首次创建 |
| v26 | `sidebar.css` | 侧边栏样式 |
| v17 | `style.css` | CSS 变量 + 布局调整 |
