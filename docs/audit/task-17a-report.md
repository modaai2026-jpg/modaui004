# MODAUI Task 17A 审计报告 - Global Configuration Governance Protocol

## 1. 目标概述
引入“全局配置治理协议”，确保所有新增功能必须通过统一配置注册中心注册，并且在平台设置中心可被发现、审计和监控。

核心规范：
- Feature → Register → Config Center → Permission → Audit Log → Monitoring
- 任何新增功能缺少其中一项，均视为 BLOCKED

## 2. 实现内容

### 2.1 数据模型
- 新增 `config_registry` 数据表至 `ModaDB`。
- 新增 `DBConfigRegistryItem` 类型，包含：
  - `module`
  - `key`
  - `category`
  - `type`
  - `default_value`
  - `current_value`
  - `tenant_scope`
  - `description`
  - `uiPath`
  - `updated_by`
  - `updated_at`

### 2.2 后端接口
新增以下平台治理接口：
- `GET /api/platform/config-registry`
- `POST /api/platform/config-registry`
- `GET /api/platform/config-registry/report`

### 2.3 审计脚本
新增 `scripts/config_governance_audit.cjs`：
- 扫描 `data/modadb.json` 中的配置注册表
- 比对 `platformSettings` 中的配置项
- 检测孤立注册项与未注册配置项
- 报告配置覆盖率并阻断低于 95% 的情况

### 2.4 文档与治理入口
- 新增任务审计报告：`docs/audit/task-17a-report.md`
- 将配置治理列为与 RBAC、支付系统同级的核心平台规范

## 3. 验证亮点
- 已将关键全局设置纳入配置注册中心，避免散落在多个页面、环境变量或硬编码常量中。
- 系统现已支持直接查询注册表并生成配置发现/覆盖率报告。
- 若出现“功能存在但无配置入口”或“配置存在但调度不可见”的情况，审计脚本将返回 BLOCKED。

## 4. 结论
Task 17A 已落实：
- 统一的 `Platform Settings Center` 现在变成了配置治理的总入口
- `config_registry` 成为了唯一可审计的“功能注册中心”
- 新增治理脚本能够自动检测隐藏配置与注册缺失

推荐后续迭代：
- 将更多模块的设置项写入 `config_registry` 并同步到 `PlatformAdminView` 的中央配置面板
- 将 `config_registry/report` 集成到部署前检查流水线

## 5. 验证结果
- `npm run build` 通过，前端和后端代码成功编译。
- `scripts/config_governance_audit.cjs` 已执行并验证 `data/modadb.json` 中的 `platformSettings` 与 `config_registry` 覆盖关系。
- 当前本地数据状态包含有效 `platformSettings` 与 `config_registry` 条目，避免因空设置或注册缺失导致 Governance BLOCKED。
- 后端 `/api/platform/settings` 路径已经同步 `config_registry`，并可通过 `config_registry/report` 生成覆盖率审计数据。
