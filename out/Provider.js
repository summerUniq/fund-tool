"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const api_1 = require("./api");
const TreeItem_1 = require("./TreeItem");
class DataProvider {
    constructor() {
        // 实例化一个实例，更新数据
        this.refreshEvent = new vscode_1.EventEmitter();
        // 获取实例的更新数据的属性
        this.onDidChangeTreeData = this.refreshEvent
            .event;
    }
    refresh() {
        // 更新视图
        setTimeout(() => {
            this.refreshEvent.fire(null);
        }, 200);
    }
    getTreeItem(info) {
        // 展示名称和涨幅
        return new TreeItem_1.default(info);
    }
    getChildren() {
        // 获取配置的基金代码
        const favorites = vscode_1.workspace
            .getConfiguration()
            .get("fund.favorites", []);
        console.log("favorites", favorites);
        // 获取基金数据
        return api_1.default([...favorites]).then((res) => res.sort((prev, next) => (prev.changeRate >= next.changeRate ? 1 : -1)));
    }
    // 更新配置
    updateConfig(funds) {
        const config = vscode_1.workspace.getConfiguration();
        console.log(config);
        const favorities = Array.from(
        // 通过set 去重
        new Set([...config.get("fund.favorites", []), ...funds]));
        config.update("fund.favorites", favorities, true);
    }
    addFund() {
        return __awaiter(this, void 0, void 0, function* () {
            // 弹窗输入框
            const res = yield vscode_1.window.showInputBox({
                value: "",
                valueSelection: [5, -1],
                prompt: "添加基金到自选",
                placeHolder: "Add Fund To Favorite",
                validateInput: (inputCode) => {
                    const codeArr = inputCode.split(/[\W]/);
                    const hasError = codeArr.some((code) => {
                        return code !== "" && !/^\d+$/.test(code);
                    });
                    return hasError ? "基金代码输入错误" : null;
                },
            });
            if (!!res) {
                const codeArr = res.split(/[\W]/) || [];
                const results = yield api_1.default([...codeArr]);
                if (results && results.length > 0) {
                    const codes = results.map((i) => i.code);
                    this.updateConfig(codes);
                    this.refresh();
                }
                else {
                    vscode_1.window.showWarningMessage("stocks not found");
                }
            }
        });
    }
    removeConfig(code) {
        const config = vscode_1.workspace.getConfiguration();
        const favourites = [...config.get("fund.favorites", [])];
        const index = favourites.indexOf(code);
        if (index === -1) {
            return;
        }
        favourites.splice(index, 1);
        config.update("fund.favorites", favourites, true);
    }
}
exports.default = DataProvider;
//# sourceMappingURL=Provider.js.map