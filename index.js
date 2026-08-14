import { runNativeCommand } from "@deepseek-ai/dsh-native-command";

/**
 * `/douyin` — open the Douyin web app in the default browser.
 *
 * A host-side dsh command plugin: registering through `ctx.commands` makes
 * the command appear in the Web client's `/` menu and execute directly on a
 * bare `/douyin` submission (no model turn, no popup step).
 *
 * @module dsh-command-douyin
 */

/** Loader metadata: `commands` is required before `apply` runs. */
const name = "command-douyin";
const inject = ["commands"];

/** The fixed target: Douyin's web recommendation feed. */
const DOUYIN_URL = "https://www.douyin.com/?recommend=1";

/**
 * Map one platform to its shell-free default-browser opener.
 * @param platform - Node platform triple (defaults to `process.platform`).
 * @returns the native command and argv for the given platform.
 */
function openerFor(platform = process.platform) {
	switch (platform) {
		// ShellExecute on the URL: no cmd builtins, no quoting edge cases.
		case "win32": return { command: "rundll32", args: ["url.dll,FileProtocolHandler", DOUYIN_URL] };
		case "darwin": return { command: "open", args: [DOUYIN_URL] };
		default: return { command: "xdg-open", args: [DOUYIN_URL] };
	}
}

/**
 * Plugin body: register the global `/douyin` command for every composed
 * human-command adapter. The registration disposer rides the plugin fiber.
 * @param ctx - context carrying the `commands` registry service.
 */
function apply(ctx) {
	ctx.effect(function* () {
		yield ctx.commands.register({
			name: "douyin",
			description: "在默认浏览器中打开网页版抖音",
			handler: async (invocation) => {
				if (invocation.rawInput.trim().length > 0) {
					return { kind: "error", text: "Usage: /douyin (no arguments)" };
				}
				try {
					const { command, args } = openerFor();
					await runNativeCommand(command, args, invocation.signal);
					return { kind: "success", text: `已在默认浏览器中打开网页版抖音：${DOUYIN_URL}` };
				} catch (error) {
					if (invocation.signal.aborted) return { kind: "error", text: "已取消打开抖音。" };
					return { kind: "error", text: `打开抖音失败：${error instanceof Error ? error.message : String(error)}` };
				}
			},
		});
	}, "command-douyin: register /douyin");
}

export { DOUYIN_URL, apply, inject, name, openerFor };
