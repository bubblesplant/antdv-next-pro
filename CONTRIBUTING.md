# 参与贡献 / Contributing

欢迎通过 Issue 和 Pull Request 改进 Antdv Next Pro，中文和英文均可。提交公开 Issue 或从个人 Fork 发起 PR，无需仓库写入权限。

## 提交 Issue

请先阅读[组件文档](https://bubblesplant.github.io/antdv-next-pro/)，并搜索[已有 Issue](https://github.com/bubblesplant/antdv-next-pro/issues)。然后在 [Issue 创建页](https://github.com/bubblesplant/antdv-next-pro/issues/new/choose)选择：

- **缺陷反馈 / Bug report**：描述预期与实际行为，提供最小复现、操作步骤及依赖版本。文档问题可以提供对应文档链接。
- **功能建议 / Feature request**：描述使用场景、当前限制、建议的 API 和替代方案。

新 Issue 会自动添加 `pending triage` 标签；维护者确认分类后移除此标签。较大的 API 或行为变更，建议先开 Issue 讨论。

## 本地开发

项目使用 Node.js 24 和 pnpm 12.4.1，版本分别记录在 `.node-version` 和根目录 `package.json` 的 `devEngines.packageManager` 中。

1. Fork [本仓库](https://github.com/bubblesplant/antdv-next-pro)，将自己的 Fork 克隆到本地。
2. 从最新的 `main` 创建功能分支。
3. 安装依赖并启动组件演练场或文档：

```bash
pnpm install --frozen-lockfile
pnpm dev
# 或启动文档站
pnpm docs:dev
```

- `packages/src`：组件库实现与公开类型。
- `packages/tests`：单元测试、浏览器测试和消费者类型检查。
- `apps/playground`：组件交互演示。
- `apps/docs`：中英文文档与示例。

## 检查改动

根据改动运行相关检查。首次运行浏览器测试前，安装 Chromium：

```bash
pnpm --filter @bubblesjs/antdv-next-pro exec playwright install chromium
```

完整检查与 CI 对应：

```bash
pnpm check
```

也可以分别执行：

```bash
pnpm format:check
pnpm lint:ox
pnpm lint:vue
pnpm typecheck
pnpm test:coverage
pnpm test:browser
pnpm build
pnpm --filter @bubblesjs/antdv-next-pro verify:package
```

需要自动修正格式时运行 `pnpm format`。修复缺陷或新增行为时，请补充相应测试；涉及公开 API 时同步更新中英文文档。

## 提交 Pull Request

将功能分支推送到自己的 Fork，再向本仓库的 `main` 发起 PR，按模板说明问题、方案、关联 Issue 和验证结果。修复已有问题时，在描述中填写 `Closes #123`。

PR 标题遵循 [Conventional Commits](https://www.conventionalcommits.org/)，例如：

```text
fix(pro-table): 修复分页后选中状态丢失
feat(schema-form): 支持新的字段配置
docs: 补充表单使用示例
ci: 调整贡献检查流程
```

支持的类型为 `build`、`chore`、`ci`、`docs`、`feat`、`fix`、`perf`、`refactor`、`revert`、`style` 和 `test`；scope 可选，冒号后的描述不能为空，也不能以大写英文字母开头。工作过程允许多次提交，CI 检查 PR 标题；本地提交钩子仍会检查提交信息。维护者建议使用 **Squash and merge**，以 PR 标题作为合并提交信息。

用户可见的组件、类型或行为变更，请运行 `pnpm changeset`，选择 `@bubblesjs/antdv-next-pro` 和相应版本级别，并提交生成的 Markdown 文件。纯文档、测试或工程配置改动可以不添加 changeset，在 PR 中说明原因即可。

PR 会自动执行格式、静态检查、类型检查、单元测试、浏览器测试和构建验证。来自 Fork 的 PR 使用只读权限运行这些检查，无需贡献者配置 npm Token 等密钥。首次贡献者的运行可能需要维护者在 Actions 页面批准；标题检查只读取 PR 信息，不执行 PR 中的代码。

## 维护者设置

将这些配置合并到默认分支 `main` 后，Issue 表单和 PR 模板会生效。仓库需要保持公开，并在 **Settings → General → Features** 中开启 **Issues**。

建议开启 **Squash merging**，将默认合并提交信息设置为 PR 标题，并在 `main` 的分支规则中要求以下检查通过：

- `Quality, tests, and package`
- `Validate PR title`

如 GitHub 要求批准首次外部贡献者的 Actions 运行，维护者审查后可在对应运行中批准。自动版本 PR 沿用现有 Changesets 发布流程；需要在 **Settings → Actions → General → Workflow permissions** 中允许 GitHub Actions 创建 PR，npm 发布仍需配置 `NPM_TOKEN`。
