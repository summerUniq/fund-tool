除了定时更新，我们还需要提供手动更新的能力。修改 `package.json`，注册命令。

```

```

##### 初始化

使用vscode官方的插件模板，可以直接通过Yeoman来生成插件模板

先全局安装 yo 和 generator-code，运行命令 `yo code`

```javascript
# 全局安装 yo 模块

npm install -g yo generator-code
```

安装后

```
yo code启动按照提示填写信息
```

![](../img/基金插件1.png)

一个项目就初始化好了

package.json

```json
{
	"name": "fund-tool",
	"displayName": "fund-tool",
	"description": "",
	"version": "0.0.1",
	"engines": {
		"vscode": "^1.52.0"
	},
	"categories": [
		"Other"
	],
	"activationEvents": [
		"onCommand:fund-tool.helloWorld"
	],
	"main": "./dist/extension.js",
	"contributes": {
		"commands": [
			{
				"command": "fund-tool.helloWorld",
				"title": "Hello World"
			}
		]
	},
	"scripts": {
		"vscode:prepublish": "npm run package",
		"compile": "webpack --config ./build/node-extension.webpack.config.js",
		"watch": "webpack --watch --config ./build/node-extension.webpack.config.js",
		"package": "webpack --mode production --devtool hidden-source-map --config ./build/node-							extension.webpack.config.js",
		"test-compile": "tsc -p ./",
		"test-watch": "tsc -watch -p ./",
		"pretest": "npm run test-compile && npm run lint",
		"lint": "eslint src --ext ts",
		"test": "node ./out/test/runTest.js"
	},
	"devDependencies": {
		"@types/vscode": "^1.52.0",
		"@types/glob": "^7.1.3",
		"@types/mocha": "^8.0.4",
		"@types/node": "^12.11.7",
		"eslint": "^7.15.0",
		"@typescript-eslint/eslint-plugin": "^4.9.0",
		"@typescript-eslint/parser": "^4.9.0",
		"glob": "^7.1.6",
		"mocha": "^8.1.3",
		"typescript": "^4.1.2",
		"vscode-test": "^1.4.1",
		"ts-loader": "^8.0.11",
		"webpack": "^5.10.0",
		"webpack-cli": "^4.2.0"
	}
}

```



```
contributes：插件相关配置
activationEvents：激活事件
main：插件的入口文件，与 Npm 包表现一致。
name 、 publisher：name 是插件名，publisher 是发布者。 ${publisher}.${name} 构成插件 ID。
比较值得关注的就是 contributes 和 activationEvents 这两个配置。
```

##### 创建视图

我们首先在我们的应用中创建一个视图容器，视图容器简单来说一个单独的侧边栏，在 `package.json` 的 `contributes.viewsContainers` 中进行配置。

```javascript
"contributes": {
		"commands": [
			{
				"command": "fund-tool.helloWorld",
				"title": "Hello World"
			}
		],
		"viewsContainers": {
			"activitybar": [{
				"id": "fund-tool",
				"title": "FUND WATCH",
				"icon": "images/fund.svg"
			}]
		}
	},
```

然后我们还需要添加一个视图，在 `package.json` 的 `contributes.views` 中进行配置，该字段为一个对象，它的 Key 就是我们视图容器的 id，值为一个数组，表示一个视图容器内可添加多个视图。

```javascript
"contributes": {
		"commands": [
			{
				"command": "fund-tool.helloWorld",
				"title": "Hello World"
			}
		],
		"viewsContainers": {
			"activitybar": [{
				"id": "fund-tool",
				"title": "FUND WATCH",
				"icon": "images/fund.svg"
			}]
		},
		"views": {
			"fund-tool" : [
				{
					"name": "自选基金",
					"id": "fund-list"
				}
			]
		}
	},
```

如果你不希望在自定义的视图容器中添加，可以选择 VS Code 自带的视图容器。

- `explorer`: 显示在资源管理器侧边栏
- `debug`: 显示在调试侧边栏
- `scm`: 显示在源代码侧边栏

```
		"explorer": [{
				"name": "自选基金",
				"id": "fund-list"
			}]
```

##### 运行插件

使用 `Yeoman` 生成的模板自带 VS Code 运行能力。

![](..\img\基金插件2.jpg)

##### 添加配置

我们需要获取基金的列表，当然需要一些基金代码，而这些代码我们可以放到 VS Code 的配置中。

```json
	"contributes": {
		// 胚子
		"configuration":{
			"type": "object", // 配置类型，对象
			"title": "fund",
			"properties": {
				"fund.favorites": {
					"type":"array",
					"default":[
						"163407",
						"161017"
					],
					"description": "自选基金列表，值为基金代码"
				},
				"fund.interval":{
					"type": "number",
					"default": 2,
					"description": "刷新时间，单位为秒，默认2秒"
				}
			}
		}
	},
```

##### 视图数据

我们回看之前注册的视图，VS Code 中称为树视图。

```json
		"views": {
			"fund-tool" : [
				{
					"name": "自选基金",
					"id": "fund-list"
				}
			]
		},
```

我们需要通过 vscode 提供的 `registerTreeDataProvider` 为视图提供数据。打开生成的 `src/extension.ts` 文件，修改代码如下：

```js
// vscode 模块为 VS Code 内置，不需要通过 npm 安装

import { ExtensionContext, commands, window, workspace } from "vscode";

import Provider from "./Provider";

// 激活插件

export function activate(context: ExtensionContext) {
  // 基金类

  const provider = new Provider();

  // 数据注册

  window.registerTreeDataProvider("fund-list", provider);
}

export function deactivate() {}

```

这里我们通过 VS Code 提供的 `window.registerTreeDataProvider` 来注册数据，传入的第一个参数表示视图 ID，第二个参数是 `TreeDataProvider` 的实现。

`TreeDataProvider` 有两个必须实现的方法：

- `getChildren`：该方法接受一个 element，返回 element 的子元素，如果没有element，则返回的是根节点的子元素，我们这里因为是单列表，所以不会接受 element 元素；
- `getTreeItem`：该方法接受一个 element，返回视图单行的 UI 数据，需要对 `TreeItem` 进行实例化；

我们通过 VS Code 的资源管理器来展示下这两个方法：

// provide.ts

```javascript
import { workspace, TreeDataProvider, TreeItem } from "vscode";

export default class DataProvider implements TreeDataProvider<string> {
  refresh() {
    // 更新视图
  }

  getTreeItem(element: string): TreeItem {
    return new TreeItem(element);
  }

  getChildren(): string[] {
    // 获取配置的基金
    const favorites: string[] = workspace.getConfiguration().fund.favorites
    // 依据代码排序
    return favorites;
  }
}
```

现在运行之后，可能会发现视图上没有数据，这是因为没有配置激活事件。

```javascript
  "activationEvents": [
     "onView:fund-list"
  ],
```

##### 请求数据

我们已经成功将基金代码展示在视图上，接下来就需要请求基金数据了。网上有很多基金相关 api，这里我们使用天天基金网的数据。

通过请求可以看到，天天基金网通过 JSONP 的方式获取基金相关数据，我们只需要构造一个 url，并传入当前时间戳即可。

```
const url = `https://fundgz.1234567.com.cn/js/${code}.js?rt=${time}`
```

VS Code 中请求数据，需要使用内部提供的 `https` 模块，下面我们新建一个 `api.ts`。

```javascript
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

interface FundInfo {
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
```

接下来修改视图数据。

```javascript
import { workspace, TreeDataProvider, TreeItem } from "vscode";
import fundApi, { FundInfo } from "./api";

export default class DataProvider implements TreeDataProvider<FundInfo> {
  refresh() {
    // 更新视图
  }

  getTreeItem(info: FundInfo): TreeItem {
    // 展示名称和涨幅
    const { name, changeRate } = info;
    return new TreeItem(`${name} ${changeRate}`);
  }

  getChildren(): Promise<FundInfo[]> {
    // 获取配置的基金代码
    const favorites: string[] = workspace.getConfiguration().fund.favorites;
    // 获取基金数据
    return fundApi([...favorites]).then((res: FundInfo[]) =>
      res.sort((prev, next) => (prev.changeRate >= next.changeRate? 1: -1))
    );
  }
}

```

##### 美化格式

前面我们都是通过直接实例化 `TreeItem` 的方式来实现 UI 的，现在我们需要重新构造一个 `TreeItem`。

```javascript
import {TreeItem} from "vscode";
import { FundInfo } from "./api";
export default class FundItem extends TreeItem {
  info: FundInfo;
  tooltip: string;
  constructor(info: FundInfo) {
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
```

美化后

![](..\img\基金插件3.jpg)

##### 更新数据

`TreeDataProvider` 需要提供一个 `onDidChangeTreeData` 属性，该属性是 EventEmitter 的一个实例，然后通过触发 EventEmitter 实例进行数据的更新，每次调用 refresh 方法相当于重新调用了 `getChildren` 方法。

```javascript
import { workspace, TreeDataProvider, EventEmitter, Event } from "vscode";
import fundApi, { FundInfo } from "./api";
import FundItem from "./TreeItem";

export default class DataProvider implements TreeDataProvider<FundInfo> {
  // 实例化一个实例，更新数据
  private refreshEvent: EventEmitter<FundInfo | null> = new EventEmitter<FundInfo | null>();
  // 获取实例的更新数据的属性
  readonly onDidChangeTreeData: Event<FundInfo | null> = this.refreshEvent
    .event;
  refresh() {
    // 更新视图
    setTimeout(() => {
      this.refreshEvent.fire(null);
    }, 200);
  }
....
}

```

我们回到 `extension.ts`，添加一个定时器，让数据定时更新。

```javascript
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
}

export function deactivate() {}

```

除了定时更新，我们还需要提供手动更新的能力。修改 `package.json`，注册命令。

```json
 "contributes": {
  "commands": [
    {
      "command": "fund.refresh",
      "title": "刷新",
      "icon": {
        "light": "images/light/refresh.svg",
        "dark": "images/dark/refresh.svg"
      }
    }
  ],
  "menus": {
    "view/title": [{
      "when": "view == fund-list",
      "command": "fund.refresh",
      "group": "navigation"
    }]
  }
  }
```

- `commands`：用于注册命令，指定命令的名称、图标，以及 command 用于 extension 中绑定相应事件；
- `menus`：用于标记命令展示的位置；
- `when`：定义展示的视图，具体语法可以查阅官方文档；
- group：定义菜单的分组；
- command：定义命令调用的事件；

![](../img\基金插件5.png)

配置好命令后，回到 `extension.ts` 中。

```javascript
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
    })
  );
}

export function deactivate() {}

```

现在我们就可以手动刷新了。

![](..\img\基金插件4.jpg)

##### 新增基金

我们新增一个按钮用于新增基金。

```json
 "contributes": {
  "commands": [
    {
      "command": "fund.add",
      "title": "新增",
      "icon": {
        "light": "images/add-light.svg",
        "dark": "images/add-dark.svg"
      }
    },
    {
      "command": "fund.refresh",
      "title": "刷新",
      "icon": {
        "light": "images/refresh-light.svg",
        "dark": "images/refresh-dark.svg"
      }
    }
  ],
  "menus": {
    "view/title": [{
      "when": "view == fund-list",
      "command": "fund.refresh",
      "group": "navigation"
    },
    {
      "when": "view == fund-list",
      "command": "fund.add",
      "group": "navigation"
    }
  ]
  }
  }
```

在 `extension.ts` 中注册事件。

```js
  // 事件
  context.subscriptions.push(
    commands.registerCommand("fund.refresh", () => {
      provider.refresh();
    }),
    commands.registerCommand("fund.add", () => {
      provider.refresh();
    })
  );
```

实现新增功能，修改 `Provider.ts`。

```javascript
// 更新配置
  updateConfig(funds: string[]) {
    const config = workspace.getConfiguration();
    console.log(config);

    const favorities = Array.from(
      // 通过set 去重
      new Set([...config.get("fund.favorites", []), ...funds])
    );
    config.update("fund.favorites", favorities, true);
  }

  async addFund() {
    // 弹窗输入框
    const res = await window.showInputBox({
      value: "",
      valueSelection: [5, -1],
      prompt: "添加基金到自选",
      placeHolder: "Add Fund To Favorite",
      validateInput: (inputCode: string) => {
        const codeArr = inputCode.split(/[\W]/);
        const hasError = codeArr.some((code) => {
          return code !== "" && !/^\d+$/.test(code);
        });

        return hasError ? "基金代码输入错误" : null;
      },
    });
    if (!!res) {
      const codeArr = res.split(/[\W]/) || [];
      const results = await fundApi([...codeArr]);
      if (results && results.length > 0) {
        const codes = results.map((i) => i.code);
        this.updateConfig(codes);
        this.refresh();
      } else {
        window.showWarningMessage("stocks not found");
      }
    }
  }
```

![](..\img\基金插件6.png)

##### 删除基金

最后新增一个按钮，用来删除基金。

```javascript
 "contributes": {
    "commands": [
      {
        "command": "fund.item.remove",
        "title": "删除",
       "icon": {
          "dark": "images/delete-dark.svg",
          "light": "images/delete-light.svg"
        }
      }
    ],
    "menus": {
      "view/item/context": [
        {
          "command": "fund.item.remove",
          "group": "inline",
          "when": "view == fund-list"
        }
      ]
    },
```

在extension.ts中注册事件

```javascript
 // 事件
  context.subscriptions.push(
    commands.registerCommand('fund.item.remove', (fund)=> {
      const {code} =fund
      provider.removeConfig(code)
      provider.refresh()
    })
  );
```

实现删除功能，修改 `Provider.ts`。

```javascript
 removeConfig(code: string) {
    const config = workspace.getConfiguration();
    const favourites:string[] = [...config.get("fund.favorites", [])];
    const index = favourites.indexOf(code);
    if (index === -1) {
      return;
    }
    favourites.splice(index, 1);
    config.update("fund.favorites", favourites, true);
  }
```

可以删除了

![](..\img\基金插件7.png)