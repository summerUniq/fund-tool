// vscode 模块为 VS Code 内置，不需要通过 npm 安装

import { ExtensionContext, commands, window, workspace } from "vscode";

import Provider from "./Provider";

// 激活插件

export function activate(context: ExtensionContext) {
  // 获取interval配置
  let interval = workspace.getConfiguration().fund.interval;
  if (interval < 2) {
    interval = 2;
  }
  // 基金类
  const provider = new Provider();

  // 数据注册
  window.registerTreeDataProvider("fund-list", provider);
  // 定时更新
  setInterval(() => {
    provider.refresh();
  }, interval * 1000);
  // 事件
  context.subscriptions.push(
    commands.registerCommand("fund.refresh", () => {
      provider.refresh();
    }),
    commands.registerCommand("fund.add", () => {
      provider.addFund();
    }),
    commands.registerCommand("fund.item.remove", (fund) => {
      console.log(fund);
      
      const { code } = fund;
      provider.removeConfig(code);
      // provider.refresh();
    })
  );
}

export function deactivate() {}
