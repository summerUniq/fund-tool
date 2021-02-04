import {
  workspace,
  TreeDataProvider,
  EventEmitter,
  Event,
  window,
} from "vscode";
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

  getTreeItem(info: FundInfo): FundItem {
    // 展示名称和涨幅
    return new FundItem(info);
  }

  getChildren(): Promise<FundInfo[]> {
    // 获取配置的基金代码
    const favorites: string[] = workspace
      .getConfiguration()
      .get("fund.favorites", []);
    console.log("favorites", favorites);

    // 获取基金数据
    return fundApi([...favorites]).then((res: FundInfo[]) =>
      res.sort((prev, next) => (prev.changeRate >= next.changeRate ? 1 : -1))
    );
  }

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
}
