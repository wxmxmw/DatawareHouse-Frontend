# DataWareHouse-frontEnd

Amazon 电影数据仓库系统前端项目，基于 React + TypeScript + Vite + Ant Design + ECharts 开发。

## 项目结构

```text
DataWareHouse-frontEnd/
├── src/
│   ├── api/                # API 接口定义
│   │   ├── client.ts       # Axios 实例
│   │   ├── stats.ts        # 统计分析接口
│   │   ├── lineage.ts      # 数据血缘接口
│   │   ├── system.ts       # 系统日志接口
│   │   └── governance.ts   # 数据治理接口 (预留)
│   ├── components/         # 公共组件
│   │   ├── EnginePanel.tsx # 引擎结果展示面板
│   │   └── ExecutionTimeChart.tsx # 耗时对比图表
│   ├── pages/              # 页面组件
│   │   ├── Dashboard.tsx   # 仪表盘 (核心统计功能)
│   │   ├── Lineage.tsx     # 血缘分析页
│   │   ├── Logs.tsx        # 系统日志页
│   │   ├── Governance.tsx  # 数据治理页 (预留)
│   │   ├── ETLSummary.tsx  # ETL 统计摘要
│   │   └── Models.tsx      # 模型管理 (预留)
│   ├── App.tsx             # 路由配置
│   └── main.tsx            # 入口文件
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 接口实现情况

本项目已实现 `Amazon 电影数据仓库系统 API 接口文档 v1.0` 中要求的所有接口，并预留了部分扩展接口。

### 1. 统计分析与性能对比 (Stats) - [文档 2.1 - 2.9]

所有接口均支持 `pg`, `spark`, `neo4j` 引擎切换与性能对比。

| 接口描述           | API 路径                  | 对应前端方法          | 状态      |
| :----------------- | :------------------------ | :-------------------- | :-------- |
| 按时间查询电影数量 | `/stats/movies-by-time` | `getMoviesByTime`   | ✅ 已实现 |
| 电影版本统计       | `/stats/movie-versions` | `getMovieVersions`  | ✅ 已实现 |
| 导演作品统计       | `/stats/director-works` | `getDirectorWorks`  | ✅ 已实现 |
| 演员参演统计       | `/stats/actor-works`    | `getActorWorks`     | ✅ 已实现 |
| 经常合作组合       | `/stats/collaborations` | `getCollaborations` | ✅ 已实现 |
| 电影类别统计       | `/stats/genres`         | `getGenres`         | ✅ 已实现 |
| 高评分电影查询     | `/stats/high-rated`     | `getHighRated`      | ✅ 已实现 |
| 多条件组合筛选     | `/stats/complex-filter` | `postComplexFilter` | ✅ 已实现 |
| 最受关注组合排行   | `/stats/popular-combos` | `getPopularCombos`  | ✅ 已实现 |

### 2. 数据血缘 (Lineage) - [文档 3.1 - 3.2]

| 接口描述     | API 路径                     | 对应前端方法          | 状态      |
| :----------- | :--------------------------- | :-------------------- | :-------- |
| 电影血缘追踪 | `/lineage/movie/{movieId}` | `getLineageMovie`   | ✅ 已实现 |
| 溯源总览统计 | `/lineage/summary`         | `getLineageSummary` | ✅ 已实现 |

### 3. 系统日志 (System) - [文档 4.1]

| 接口描述     | API 路径         | 对应前端方法 | 状态      |
| :----------- | :--------------- | :----------- | :-------- |
| 查询历史日志 | `/system/logs` | `getLogs`  | ✅ 已实现 |

### 4. 扩展/预留接口 (Placeholder)

以下接口未在 v1.0 文档中定义，目前作为占位符以支持后续功能扩展：

| 模块       | API 路径                       | 描述         |
| :--------- | :----------------------------- | :----------- |
| System     | `/system/models`             | 模型管理接口 |
| Governance | `/governance/quality-report` | 数据质量报告 |
| Governance | `/governance/metadata`       | 元数据管理   |

## 运行方式

1. **安装依赖**

   ```bash
   npm install
   ```
2. **启动开发服务器**

   ```bash
   npm run dev
   ```
   启动后访问 `http://localhost:5173`。
3. **构建生产版本（可选）**

   ```bash
   npm run build
   ```
