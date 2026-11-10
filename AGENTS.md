# Moetopia 共享 UI

本仓是 `@moetopia/ui` 的唯一源码所有者。来源为 AIO 提交 `c9b5f7f7eb92149fc382ddd121c1ed52149627e0` 的 `packages/ui`，保留既有素材和故事。

使用 Vue、TypeScript、Reka、Tailwind、Storybook。组件不依赖 Nuxt、身份状态、业务 API。所有可复用视觉和交互在本仓维护；颜色由 `src/styles.css` 定义。默认不写代码注释，必要约束使用简短英文。

读写本地文件优先 FastCtx。修改前检查 Git 状态，保留已有改动。组件变更同步故事，通过 typecheck 和 Storybook 构建后提交。提交格式为 `type (scope): summary`，不推送或发布。

远程仓库未建立期间，消费者使用固定源码提交生成的 tarball；源码和包 SHA-256 记录在消费者 `vendor/ui-source.json`。禁止手改 tarball 或复制组件到业务仓。远程可用后改为固定 Git 提交依赖。
