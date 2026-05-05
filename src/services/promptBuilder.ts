import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigManager } from '../config';
import type { BranchInfo, CommitFormat, ContentRule, Language } from '../types';
import { log } from '../utils';

interface PromptContext {
  diff: string;
  branch: BranchInfo;
  filesChanged: string;
  filesStats: string;
}

const SYSTEM_BASE = `你是一个专业的 Git commit message 生成器。你的任务是根据用户提供的代码 diff，生成准确、规范的 commit message。

核心原则：
1. 只描述"做了什么改动"和"为什么改"，不描述代码实现细节
2. 第一行（标题行）不超过 72 个字符
3. 如果改动较多，用列表形式概括关键改动点
4. 只输出 commit message 本身，不要添加任何解释、注释或 markdown 代码块标记`;

const FORMAT_INSTRUCTIONS: Record<CommitFormat, string> = {
  conventional: `使用 Conventional Commits 规范格式：
<type>(<scope>): <description>

<body>

type 必须是以下之一：feat, fix, docs, style, refactor, perf, test, chore, ci, build, revert
scope 为可选，表示影响范围
description 为简短描述`,

  gitmoji: `使用 Gitmoji 格式：
<emoji> <description>

<body>

常用 emoji 对照：
✨ 新功能 | 🐛 修复 bug | 📝 文档 | 💄 样式 | ♻️ 重构 | ⚡ 性能 | ✅ 测试 | 🔧 配置 | 👷 CI | 🔨 构建 | ⏪ 回退
选择最匹配的一个 emoji 放在最前面`,

  simple: `使用简洁格式：一行简洁描述，不超过 72 个字符，不需要 body。直接描述做了什么改动。`,

  detailed: `使用详细格式：
<标题行>

## 改动内容
<用列表详细列举所有改动>

## 改动原因
<解释为什么做这个改动>`,

  custom: '',
};

const RULE_INSTRUCTIONS: Record<ContentRule, string> = {
  standard: '以标准模式生成：简要概括改动内容和原因，关键改动用列表形式列出。',
  brief: '以精简模式生成：只输出一行核心描述，不需要 body 部分。',
  verbose: '以详尽模式生成：逐文件列举改动，附带每个文件改动原因的推测。',
  custom: '',
};

const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  'zh-CN': '请使用中文生成 commit message。类型前缀（如 feat: / fix:）保持英文。',
  'en-US': 'Please generate the commit message in English.',
};

export class PromptBuilder {
  constructor(private readonly configManager: ConfigManager) {}

  buildSystemPrompt(): string {
    const config = this.configManager.getAll();
    const parts = [SYSTEM_BASE];

    if (config.commitFormat === 'custom' || config.contentRule === 'custom') {
      const customPrompt = this.loadCustomTemplate(config.customPromptPath);
      if (customPrompt) {
        return customPrompt;
      }
    }

    const formatInstruction = FORMAT_INSTRUCTIONS[config.commitFormat];
    if (formatInstruction) {
      parts.push(`\n格式要求：\n${formatInstruction}`);
    }

    const ruleInstruction = RULE_INSTRUCTIONS[config.contentRule];
    if (ruleInstruction) {
      parts.push(`\n内容规则：\n${ruleInstruction}`);
    }

    const langInstruction = LANGUAGE_INSTRUCTIONS[config.language];
    if (langInstruction) {
      parts.push(`\n语言要求：\n${langInstruction}`);
    }

    return parts.join('\n');
  }

  buildUserPrompt(context: PromptContext): string {
    const parts: string[] = [];

    if (context.branch.raw) {
      parts.push(`当前分支：${context.branch.raw}`);
      if (context.branch.type) {
        parts.push(`分支类型：${context.branch.type}（请优先使用此类型作为 commit 前缀）`);
      }
    }

    if (context.filesStats) {
      parts.push(`\n文件变更统计：\n${context.filesStats}`);
    }

    if (context.diff) {
      parts.push(`\n代码 diff：\n\`\`\`diff\n${context.diff}\n\`\`\``);
    }

    return parts.join('\n');
  }

  private loadCustomTemplate(templatePath: string): string | null {
    if (!templatePath) {
      return null;
    }

    try {
      let fullPath = templatePath;
      if (!path.isAbsolute(templatePath)) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
          fullPath = path.join(workspaceFolder.uri.fsPath, templatePath);
        }
      }

      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        log(`Loaded custom template: ${fullPath}`);
        return content;
      }

      log(`Custom template not found: ${fullPath}`);
      return null;
    } catch (error) {
      log(`Failed to load custom template: ${error}`);
      return null;
    }
  }
}
