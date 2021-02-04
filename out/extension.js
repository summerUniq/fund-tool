"use strict";
// vscode 模块为 VS Code 内置，不需要通过 npm 安装
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const Provider_1 = require("./Provider");
// 激活插件
function activate(context) {
    // 获取interval配置
    let interval = vscode_1.workspace.getConfiguration().fund.interval;
    if (interval < 2) {
        interval = 2;
    }
    // 基金类
    const provider = new Provider_1.default();
    // 数据注册
    vscode_1.window.registerTreeDataProvider("fund-list", provider);
    // 定时更新
    setInterval(() => {
        provider.refresh();
    }, interval * 1000);
    // 事件
    context.subscriptions.push(vscode_1.commands.registerCommand("fund.refresh", () => {
        provider.refresh();
    }), vscode_1.commands.registerCommand("fund.add", () => {
        provider.addFund();
    }), vscode_1.commands.registerCommand("fund.item.remove", (fund) => {
        console.log(fund);
        const { code } = fund;
        provider.removeConfig(code);
        // provider.refresh();
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map