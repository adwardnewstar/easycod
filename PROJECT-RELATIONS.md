# 项目关系说明

## 概览

四个项目共用同一个 **Supabase PostgreSQL 数据库**，各自承担不同角色：

| 项目 | 定位 | 技术栈 | 部署方式 |
|------|------|--------|----------|
| **easycod** | Web 材料样板管理后台 | HTML/CSS/JS + Supabase JS SDK | 本地服务器 / 待定 |
| **easyvoice** | 展馆智能讲解（语音助手） | HTML/CSS/JS + Netlify Functions | 待定（计划 GitHub Pages） |
| **easyorder** | 施工/建材现场微信小程序 | 微信小程序 + 云函数 | 微信小程序平台 |
| **easyproc** | 多级审批引擎 | Android App (Flutter/Kotlin) + HTML 管理后台 | 应用商店 + Web |

---

## 数据库结构

**共享数据库：** `vqoortdzgvllyxplduxq` (Supabase)

### 表空间划分

```
                            Supabase
                        vqoortdzgvllyxplduxq
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  产品表（easycod 维护）                                      │
│  ┌─────────────────────────────────────┐                   │
│  │ projects     项目/品类               │                   │
│  │ samples      样品/产品               │                   │
│  │ daily_codes  每日邀请码               │                   │
│  │ field_visibility  扫码可见性设置      │                   │
│  └──────────┬──────────────────────────┘                   │
│             │                                               │
│             ▼ easyorder 扫码查产品                           │
│  业务表（easyorder 写入）                                    │
│  ┌─────────────────────────────────────┐                   │
│  │ users          用户                  │                   │
│  │ clock_records  打卡记录              │                   │
│  │ apply_records  申请记录              │                   │
│  │ orders / order_items  订单           │                   │
│  │ settings       设置                  │                   │
│  │ admin_users    管理员                │                   │
│  │ operation_logs 操作日志              │                   │
│  └──────────┬──────────────────────────┘                   │
│             │                                               │
│             ▼ PG 触发器 trg_easyproc_sync 自动同步           │
│  审批表（easyproc 管理）                                     │
│  ┌─────────────────────────────────────┐                   │
│  │ ep_users             审批人用户       │                   │
│  │ ep_workflow_templates 流程模板       │                   │
│  │ ep_workflow_nodes    流程节点        │                   │
│  │ ep_workflow_node_assignees 节点审批人 │                   │
│  │ ep_approvals         审批实例        │                   │
│  │ ep_approval_mappings 来源映射        │                   │
│  │ ep_approval_logs     审批日志        │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  AI 配置表（easycod 维护，easyvoice 读取）                   │
│  ┌─────────────────────────────────────┐                   │
│  │ ev_knowledge_base       AI 知识库    │                   │
│  │ ev_personality          AI 人格      │                   │
│  │ ev_behavior             AI 行为规则   │                   │
│  │ ev_precipitation_rules  沉淀规则     │                   │
│  │ ev_functions            函数/工具     │                   │
│  │ ev_instincts            AI 本能      │                   │
│  │ ev_chat_logs            对话日志     │                   │
│  │ ev_errors               错误日志     │                   │
│  │ ev_emotion_log          情感/总结日志 │                   │
│  │ ev_sessions             AI 会话      │                   │
│  └─────────────────────────────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 项目间数据流

### easycod ↔ easyvoice
- **easycod** 在 Web 后台管理 AI 配置（知识库、人格、行为规则等）→ 写入 `ev_*` 表
- **easyvoice** 启动时读取 `ev_*` 表 → 加载 AI 人格、唤醒词、知识库等
- **关系：** easycod = 管理端，easyvoice = 消费端

### easycod ↔ easyorder
- **easycod** 管理产品数据（`samples`、`projects`）
- **easyorder** 小程序扫码 → 查 `samples` 表 → 展示产品信息 → 下单时写入 `orders`/`order_items`
- **关系：** easycod = 产品管理后台，easyorder = 现场业务前端

### easyorder → easyproc（单向同步）
- **easyorder** `apply_records` 表 INSERT 时 → **PG 触发器** `trg_easyproc_sync` 自动触发
- 同步创建审批实例到 `ep_approvals`
- **easyproc** 读取 `ep_approvals` → 审批人操作 → 写回审批结果
- **关系：** easyorder 零改动，easyproc 通过触发器 + `ep_*` 独立表实现解耦

---

## 认证体系

使用 **Supabase Auth** 统一认证，通过 `ep_users` 表统一管理所有项目的访问权限：

`ep_users` 表结构：
| 字段 | 说明 |
|------|------|
| `auth_user_id` | 关联 `auth.users`，登录用 Supabase Auth |
| `email` | 邮箱 |
| `display_name` | 显示名称 |
| `phone` | 电话 |
| `role` | 角色（审批人 / admin） |
| `easycod` | 是否有权使用 EasyCod |
| `easyorder` | 是否有权使用 EasyOrder |
| `easyproc` | 是否有权使用 EasyProc |
| `easyvoice` | 是否有权使用 EasyVoice |
| `is_active` | 是否启用 |

添加用户流程：Supabase Dashboard → Authentication 创建用户 → 在 EasyCod"审批人管理"页填入 Auth User ID 并设置项目开关。

### 当前 RLS 策略（开发模式）

| | 读取 (SELECT) | 写入 (INSERT/UPDATE/DELETE) |
|---|---|---|
| 所有 `ev_*` 表 | ✅ 公开 | ✅ 需登录 |
| 其他 `*` 表 | 各自独立策略 | 各自独立策略 |

---

## 快速参考

- **数据库地址：** `https://vqoortdzgvllyxplduxq.supabase.co`
- **Supabase Dashboard：** https://supabase.com/dashboard/project/vqoortdzgvllyxplduxq
- **表前缀：** `ev_` = AI 配置, `ep_` = 审批流程, 无前缀 = 业务/产品
