# 智能眼镜三维知识探索

第一章现有独立交互展台 `src/explorer/chapter-one.html`：细化三维外观、三种教学组合、组件透视与分层观察、组件热点、生活场景以及网络状态示例。第一章书页和通用探索器的第一章入口均可进入；其他章节继续使用原来的探索器。其模型为原创教学几何，并非实物扫描或品牌产品拆解。

本次试点只扩展 `books/smartglasses/`。其他书籍、语言版本、丛书首页、公共主题及 GitHub Actions 工作流均不修改。

## 读者使用

- 本书关于页增加探索入口，各章节及小节通过本书专用 `explorer-link-v2.js` 注入入口。
- 例如 `ch02/13.html` 对应 2.4，进入探索后自动选中第二章、显示眼镜及显示光学组件。
- 从序章到第九章，各章原书配图随章节切换显示，可点击查看大图。
- 探索页可切换章节、眼镜类型，旋转缩放、展开模型，选择组件，读取关联小节，再返回本书页面。
- URL 保存章节、小节、组件与类型，可直接收藏或分享。
- 无 WebGL 时仍提供组件按钮、阅读与原文链接。
- AI 部分生成可复制的提问上下文，包含来源链接与书稿 SHA-256；尚未接入在线回答。

## 结构与后续书籍

`src/explorer/app.js` 负责书稿导航和状态，`viewer.js` 负责三维交互；眼镜几何独立在 `smartglasses-model.js`，组件描述和类型适用范围在 `knowledge.js`。`tools/generate_explorer.py` 存放这本书的明确阅读关联，读取 `SUMMARY.md` 与 57 个小节 Markdown，生成 `src/explorer/book.json`。数据包含 `bookId`、稳定的小节编号、组件 ID 和原文相对 URL。

当前是一本书的试点，不会扫描或批量改写其他书。以后扩展时可以提取通用阅读器与渲染器，再为每本书提供独立模型和映射；本轮不引入全系列迁移。

## 构建与验证

需要 mdBook 0.4.40（与仓库现有 CI 一致）及 Python 3.9+。从仓库根目录执行：

```sh
python3 -m unittest discover -s books/smartglasses/tests -v
# 可选：Node.js 22+ 验证第一章三种模型的几何与能力边界
node --test books/smartglasses/tests/chapter-one-model.test.mjs
python3 books/smartglasses/tools/build_preview.py
python3 -m http.server 3473 --bind 127.0.0.1 --directory public
```

访问 `http://127.0.0.1:3473/smartglasses/ch02/13.html`，点击“三维探索本章结构”。也可以在构建后双击 `tools/启动预览.command`。

本书新增 mdBook 预处理器，构建时自动生成数据并原样传回正文，不改写书稿。命令按现有 CI 约定从仓库根目录调用。若目录小节发生增删，生成器会失败并要求维护关联，防止悄悄发布过期地图。手工再生成：

```sh
python3 books/smartglasses/tools/generate_explorer.py
```

现有工作流从根目录执行 `mdbook build books/<slug>`，Ubuntu 环境含 Python 3，无需修改全系列发布工作流。仅本书注册此预处理器和入口脚本。

## 范围与局限

模型由程序生成，为不按比例的教学结构，不能作为具体品牌、型号或器件布局的依据。三种视图是能力组合示意，不表示所有同类产品必备这些器件。组件对应阅读主题，不构成经过拆解核验的 BOM；处理器与存储合并表达，空间感知也不是完整硬件清单。

没有新增后端、密钥、账号、收费服务或 AI API。交互本身不上传书稿或提问。原书的 Giscus 留言保持原有行为。Three.js 0.170.0 已随模块本地打包，许可证在 `src/explorer/vendor/THREE-LICENSE.txt`。
