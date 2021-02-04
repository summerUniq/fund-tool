module.exports =
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


// vscode 模块为 VS Code 内置，不需要通过 npm 安装
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode_1 = __webpack_require__(1);
const Provider_1 = __webpack_require__(2);
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


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");;

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const vscode_1 = __webpack_require__(1);
const api_1 = __webpack_require__(3);
const TreeItem_1 = __webpack_require__(5);
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


/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const https = __webpack_require__(4);
// 发起GET请求
const request = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let chunks = "";
            if (!res || res.statusCode !== 200) {
                reject(new Error("网络请求错误!"));
                return;
            }
            res.on("data", (chunk) => (chunks += chunk.toString("utf8")));
            res.on("end", () => resolve(chunks));
        });
    });
});
// 根据基金代码请求基金数据
function fundApi(codes) {
    const time = Date.now();
    // 请求列表
    const promises = codes.map((code) => {
        const url = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${time}`;
        return request(url);
    });
    return Promise.all(promises).then((results) => {
        const resultArr = [];
        results.forEach((rsp) => {
            const match = rsp.match(/jsonpgz\((.+)\)/);
            if (!match || !match[1]) {
                return;
            }
            const str = match[1];
            const obj = JSON.parse(str);
            const info = {
                now: obj.gsz,
                name: obj.name,
                code: obj.fundcode,
                lastClose: obj.dwjz,
                changeRate: obj.gszzl,
                changeAmount: (obj.gsz - obj.dwjz).toFixed(4),
            };
            resultArr.push(info);
        });
        return resultArr;
    });
}
exports.default = fundApi;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("https");;

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const vscode_1 = __webpack_require__(1);
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


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })()
;
//# sourceMappingURL=extension.js.map