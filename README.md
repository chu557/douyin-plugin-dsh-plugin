# dsh-command-douyin

DSH 插件：注册 `/douyin` 命令，在默认浏览器中打开网页版抖音（<https://www.douyin.com/?recommend=1>）。

在任意会话输入框输入 `/douyin` 并回车（或在 `/` 菜单中选择），命令直接执行、无需模型回合，浏览器会自动打开抖音网页版。

## 工作原理

- 宿主端命令插件：通过 `ctx.commands`（`@deepseek-ai/dsh-commands`）注册全局命令，Web 客户端的 `/` 菜单自动发现。
- 打开浏览器使用 `@deepseek-ai/dsh-native-command` 的 `runNativeCommand`（无 shell 的 `execFile`）：
  - Windows：`rundll32 url.dll,FileProtocolHandler <url>`
  - macOS：`open <url>`
  - Linux：`xdg-open <url>`
- 无参数；带参数返回 `Usage: /douyin (no arguments)`。

## 安装（web profile）

1. 把本插件包以**真实目录**复制到共享 node_modules（Node ESM 会按真实路径解析依赖，junction/符号链接会导致 `@deepseek-ai/dsh-native-command` 解析失败）：

   ```powershell
   Copy-Item -Recurse -Force "<本目录>" "$env:DSH_HOME\profiles\node_modules\dsh-command-douyin"
   ```

2. 在 `$env:DSH_HOME\profiles\web\cordis.patch.yml` 中加入：

   ```yaml
   - insert:
       - id: command-douyin
         name: 'dsh-command-douyin'
   ```

3. **重启 `dsh web`**（补丁层在启动时合成；运行中的实例不会热挂载新 bundle/补丁行）。

4. 验证：

   ```sh
   dsh --profile web --dump-config   # 树中应出现 id: command-douyin 一行
   ```

   启动后在输入框输入 `/douyin` 并回车即可。

## 备选：正式 bundle 安装（需要 pnpm 可用，且同样需重启）

```sh
dsh plugin --profile web add link:<本目录的绝对路径>
```

该命令会在 profile 的 `package.json` 中登记依赖并把 `dsh-command-douyin` 追加进 `dsh.profile.bundles`。注意：`link:` 依赖经 pnpm 安装为链接形式，同样存在 ESM 按真实路径解析的问题；如遇加载失败，改用上面的真实目录复制方式。
