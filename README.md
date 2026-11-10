# Moetopia UI

Moetopia 生态共享 Vue 组件、品牌变量和通用布局的唯一源码仓。来源：AIO c9b5f7f7eb92149fc382ddd121c1ed52149627e0 的 packages/ui，不包含身份会话或业务接口。

使用 pnpm install、pnpm typecheck、pnpm build-storybook 检查，pnpm storybook 预览。消费者导入 @moetopia/ui 和 @moetopia/ui/styles.css；Tailwind 消费者应在自己的样式入口声明应用源码 @source，共享包不扫描业务仓路径。

当前远程仓未发布；本地用 pnpm pack --pack-destination <output> 生成包，记录来源提交与 SHA-256。消费者仅安装归档，禁止直接改包或导入相邻源码。建立远程后以固定 Git 提交消费。

规范见 [AGENTS](AGENTS.md)。品牌和插画沿用来源素材，不代表游戏素材许可。本仓未新增 LICENSE 或作素材再授权承诺。
