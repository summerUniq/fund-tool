"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class FundItem extends vscode_1.TreeItem {
    constructor(info) {
        const icon = Number(info.changeRate) >= 0 ? "📈" : "📉";
        super(`${icon}${info.name}     ${info.changeRate}%`);
        let sliceName = info.name;
        if (sliceName.length > 8) {
            sliceName = `${sliceName.slice(0, 8)}...`;
        }
        const tips = [
            `代码： ${info.code}`,
            `名称：${sliceName} `,
            `--------------------------------`,
            `单位净值：                 ${info.now}`,
            `涨跌幅：                   ${info.changeRate}%`,
            `涨跌额：                   ${info.changeAmount}`,
            `昨收:                      ${info.lastClose}`,
        ];
        this.info = info;
        // tooltip鼠标悬停时，展示的内容
        this.tooltip = tips.join(`\r\n`);
    }
}
exports.default = FundItem;
//# sourceMappingURL=TreeItem.js.map