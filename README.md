# 万选吃饭 · smart-eats

一键决定吃什么 —— 吉隆坡 (KL) 的极简选餐 web app。打开网页，按一个大按钮，它根据你们的口味偏好随机推一家餐厅，不再纠结。

## 两种模式

1. **只吃饭** — 以当前定位（或选一个区）为中心，在半径内随机推一家。
2. **吃完有 plan** — 输入起点 + 接下来要去的目的地，推荐一家最顺路、绕路最少的餐厅。

口味偏好（喜欢的菜系、特别喜欢、不吃的、是否只看营业中、默认半径）**云端共享**，两支手机同步。

## 技术栈

- Next.js 16 (App Router) + TypeScript + Tailwind v4，mobile-first PWA
- 餐厅数据 / 路线：**GrabMaps 直连 REST**（`https://maps.grab.com/api/v1`，Bearer 鉴权）
- 共享偏好：Upstash Redis（可选；未配置时退回非持久的内存存储）
- 纯领域逻辑（选店、绕路排序、地理计算）有 Vitest 单测覆盖

数据源经 `PlacesProvider` 接口隔离（`lib/grab/`），将来可替换为 Google / OSM 而不动 UI。

## 本地开发

```bash
cp .env.example .env   # 填入 GRAB_MAPS_API_KEY
npm install
npm run dev            # http://localhost:3000
npm test               # 单元测试
```

## 环境变量

| 变量 | 必需 | 说明 |
|---|---|---|
| `GRAB_MAPS_API_KEY` | ✅ | GrabMaps Platform key（仅服务端使用）|
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | – | 云端共享偏好；缺省用内存存储 |
| `APP_PASSCODE` | – | 可选访问口令 |

## 部署

部署在 Vercel。在项目 Settings → Environment Variables 配置上面的变量后，push 到默认分支即自动部署。

## 已知限制

Grab POI 是「店」级数据（名字、菜系类目、地址、营业时间），没有菜单/食材或评分/价位。因此「不吃 XX」按店名/菜系关键词近似排除，而非真实菜品过滤。
