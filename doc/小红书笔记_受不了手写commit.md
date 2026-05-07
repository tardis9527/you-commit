# 小红书笔记合集

---

## 篇一（程序员吐槽向）

### 标题：受不了手写commit！自己做了个插件让AI代劳😤

正文：

程序员最痛苦的事是什么？

不是写代码，不是改bug，是写完代码之后……要写 commit message 💀

你告诉我，改了 15 个文件，你让我用一句话描述清楚？？

以前的我：
commit -m "fix"
commit -m "update"
commit -m "改了点东西"

三天后看 git log：这是谁写的？哦是我自己 🤡

忍不了了，自己动手做了个 VSCode 插件叫「YouCommit」🍊

现在的流程：
git add → 点一下 ✨ → AI 自动分析改了啥 → 规范的 commit message 直接蹦出来

而且是逐字打出来的那种！看着就很爽有没有！

支持这些格式：
✅ Conventional Commits（feat/fix/chore 那套）
✅ Gitmoji（用 emoji 做前缀，好看）
✅ 简洁模式 / 详细模式
✅ 中英文随便切

用法也简单：
① 有自己的 AI Key → 接 DeepSeek / 通义千问 / OpenAI 都行
② 没有也没关系 → 内置服务买个密钥直接用

VSCode 扩展商店搜「YouCommit」就能装，免费的！

评论区程序员举个手🙋‍♂️ 你们平时 commit message 都怎么写的哈哈哈

#程序员 #VSCode #开发工具 #程序员的日常 #git #AI工具 #效率工具 #程序员必备

---

## 篇二（before/after 对比向）

### 标题：用AI写commit message前 vs 后，代码人生都清爽了✨

正文：

Before 🫠
→ git log 一打开全是 "fix bug" "update" "修改"
→ 同事 code review：你这提交记录跟没写一样
→ 自己回头看：完全不记得当时改了啥

After 🥳
→ 每条 commit 格式统一，清清楚楚
→ feat: 新增用户登录模块
→ fix(api): 修复分页参数未传递的问题
→ 同事直呼专业（其实是 AI 写的嘿嘿）

怎么做到的？

我做了个 VSCode 插件叫「YouCommit」🍊
点一下按钮，AI 自动读你的代码改动，帮你生成规范的 commit message

不吹牛，用了之后 git log 看着都赏心悦目

而且还能：
🔥 自动 commit + 自动 push（懒人狂喜）
🔥 自定义 prompt 模板（强迫症福音）
🔥 流式输出，一个字一个字蹦出来（有种看AI在线营业的感觉）

商店搜 YouCommit 就行，拿走不谢～

#程序员 #git提交 #AI写代码 #开发效率 #VSCode插件 #程序员工具推荐

---

## 篇三（种草安利向）

### 标题：程序员姐妹们！这个插件谁用谁知道🍊

正文：

好好好今天必须安利一个我自己做的小工具

先说痛点：每次 git commit 是不是都在想"这次该怎么写"？

想了半天最后打了个 "update code" 交差 😂

我：受不了了，自己做了一个 → YouCommit

装在 VSCode 里，暂存完代码点一下，AI 就帮你把 commit message 写好了

重点是质量很高！不是那种敷衍的一句话，是真的会分析你的代码改动，按规范格式输出

举个真实例子 👇
我改了三个文件，加了个新功能，它给我生成的是：
feat(auth): 添加微信扫码登录支持

就问你专不专业！！

几个我超喜欢的细节：
💡 流式输出 — 一个字一个字打在输入框里，强迫症看了很舒服
💡 格式随便选 — conventional / gitmoji / 简洁 / 详细 都有
💡 零配置也能用 — 内置 AI 服务，不用自己搞 API Key
💡 有 Key 也行 — DeepSeek 通义千问 OpenAI 随便接

VSCode 商店搜「YouCommit」直接装

写代码的宝子们冲！真的能省很多时间！

#程序员女孩 #效率工具安利 #VSCode #AI工具推荐 #程序员好物分享

---

## 篇四（短平快爆款向）

### 标题：受不了手写commit❗自己做了个AI插件❗真香

正文：

程序员写代码 → 😎
程序员写 commit message → 🫠🫠🫠

做了个 VSCode 插件解救自己（和你们）

「YouCommit」🍊 用法就一步：
暂存代码 → 点 ✨ → commit message 自动出来

就这么简单，不骗人

亮点说三个：
1️⃣ AI 真的会读你的 diff，不是瞎编的
2️⃣ 逐字蹦出来，看着很解压
3️⃣ 还能自动 commit + push，懒到底

VSCode 搜 YouCommit 装就行
用完回来评论区告诉我好不好使 👇

#程序员 #AI #VSCode插件 #git #开发工具 #效率

---

## 篇五（技术科普向）

### 标题：AI自动写git commit message是什么体验？🤯

正文：

先看效果 👇

改了一堆代码 → 点一下按钮 → 两秒后：
「refactor(utils): 重构日期格式化工具函数，统一使用 dayjs 替代 moment」

这不比你想半天写个 "refactor" 强？😂

这是我做的一个 VSCode 插件「YouCommit」

原理很简单：
1. 读取 git 暂存区的 diff
2. 智能截断（lock 文件、min.js 这些自动跳过）
3. 把 diff + 分支信息丢给 AI
4. AI 按你选的格式生成 commit message
5. 流式输出，逐字填到 SCM 输入框

支持的格式：
📌 Conventional Commits — feat / fix / chore 标准格式
📌 Gitmoji — ✨ 🐛 🔥 表情前缀
📌 简洁模式 — 一行搞定
📌 详细模式 — 标题 + 改动列表
📌 自定义模板 — 你说了算

AI 渠道随便选：
DeepSeek / 通义千问 / OpenAI / 或者用内置服务零配置

对了，它还会根据分支名自动推断 commit 类型
比如你在 feature/login 分支，它就知道该用 feat: 开头

VSCode 商店搜「YouCommit」🍊
开源免费，欢迎 star ⭐

#AI #程序员 #git #commitMessage #VSCode #开发效率 #技术分享
