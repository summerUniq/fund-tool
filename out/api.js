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
const https = require("https");
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
//# sourceMappingURL=api.js.map