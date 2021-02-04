import * as https from "https";

// 发起GET请求
const request = async (url: string): Promise<string> => {
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
};

export interface FundInfo {
  now: string;
  name: string;
  code: string;
  lastClose: string;
  changeRate: string;
  changeAmount: string;
}

// 根据基金代码请求基金数据
export default function fundApi(codes: string[]): Promise<FundInfo[]> {
  const time = Date.now();
  // 请求列表
  const promises: Promise<string>[] = codes.map((code) => {
    const url = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${time}`;
    return request(url);
  });
  return Promise.all(promises).then((results) => {
    const resultArr: FundInfo[] = [];
    results.forEach((rsp: string) => {
      const match = rsp.match(/jsonpgz\((.+)\)/);
      if (!match || !match[1]) {
        return;
      }
      const str = match[1];
      const obj = JSON.parse(str);
      const info: FundInfo = {
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
