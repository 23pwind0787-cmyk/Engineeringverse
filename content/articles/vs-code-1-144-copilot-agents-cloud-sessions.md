---
title: "Visual Studio Code 1.144: Copilot Cloud Sessions, Copilot Fusion and an Agent-First Editor"
summary: "Released on 28 October 2026, Visual Studio Code 1.144 turns the editor into a hub for AI coding agents: Copilot tasks keep running in the cloud after you shut your laptop, Copilot Fusion routes work across models for you, and image generation, computer use and a new Markdown editor arrive alongside."
date: "2026-11-09"
category: "software-news"
tags:
  - "Visual Studio Code"
  - "GitHub Copilot"
  - "AI Coding"
  - "Software"
sourceName: "Microsoft — Visual Studio Code 1.144"
sourceUrl: "https://code.visualstudio.com/updates/v1_144"
---

## What VS Code 1.144 is

Microsoft released Visual Studio Code 1.144 as a Stable build on 28 October 2026, according to the official release notes on code.visualstudio.com. The release is built around one idea: the editor is no longer just where you type code, but the place where you coordinate AI coding agents — and those agents should keep working even when your computer is off.

For engineering students, this matters because VS Code is the editor most of us already use for coursework, lab reports and final-year projects. The update changes how the built-in GitHub Copilot agent behaves, how it picks models, and how you review what it changes. Some of the biggest features need a paid Copilot plan, so it is worth knowing which parts are free to try and which are not.

## Cloud sessions: agents that keep working after you shut your laptop

The headline change is session continuity. Cloud sessions let you run Copilot tasks from VS Code without keeping your development machine online: your repository and tools run in a managed environment on GitHub's infrastructure. You start a task by selecting **Cloud** and choosing a GitHub repository, then send follow-up instructions, respond to approval requests and review the agent's changes from the Chat view or the Agents window.

You can also reopen an existing cloud session from the sessions list to continue the same conversation, and check progress from GitHub.com or the GitHub Mobile app before returning to VS Code. One detail the notes are clear about: cloud sessions use a separate workspace, so local uncommitted changes are not automatically copied over.

Cloud sessions require a paid Copilot plan and are subject to organization policies — they are not part of the free tier, and the release notes do not state a price for any Copilot plan. VS Code itself remains free, as the release notes describe it as a free, open source editor.

## Manage all your environments in one place

A new **Remote Environments** dialog brings GitHub Environments, Dev Tunnels, WSL distributions and SSH hosts together in one place, so you can see the status of each remote, connect or disconnect, and choose which remotes appear in the pickers. There is also a new option to share your local agents with your other devices through GitHub Environments, so a session started on your computer can be continued from the GitHub iOS app, the Copilot desktop app, github.com or the Copilot CLI.

**Cloud Automations (Preview)** are enabled by default and run on GitHub infrastructure on a schedule or in response to repository events — for example, automatically triaging issues as they get assigned to you — even when your computer is off. You can limit which tools an automation may use and add filters for precise control, such as triggering only when you are assigned an issue with a specific label.

## Agent Host Protocol v1.0

Microsoft has published the first version of the **Agent Host Protocol (AHP)**, the open, extensible protocol VS Code uses to communicate with its agents locally and on remote machines, including for cloud automations. It is designed as an easy way to build custom interfaces for agents, or agent platforms that plug into any interface that speaks the protocol. The notes say libraries are published in six languages, though they do not name the languages in the release notes themselves.

## Copilot Fusion: let Copilot pick the model

Instead of picking a model for every task, you can select **Copilot Fusion** in the model picker and let Copilot intelligently route requests and orchestrate models for you. Copilot Fusion brings together multi-model orchestration and task-aware model selection: for a simple task one model completes it, while for harder tasks one model drafts a solution and other models review or critique it. Hovering over the effort level below a response shows which models were used.

You choose an effort level to balance quality and cost: **Standard** for everyday coding work, **High** for more demanding tasks, and **Max** for the most complex tasks. You are billed for each model Copilot Fusion uses at its standard rate, and through 30 November 2026 paid Copilot plans receive a 30% discount when using Copilot Fusion. GitHub Copilot Fusion is now generally available, with the High and Max tiers offered on Copilot Pro+, Max, Business and Enterprise plans.

If you would rather judge for yourself, **model comparisons** (also called Agent Bake-Off) run the same prompt across models for side-by-side review. They are enabled by default for eligible new sessions in the Agents window, unless overridden by user settings or experiments. Model comparisons are not supported in Dev Containers.

## Image generation, computer use and canvases

Three more agent capabilities arrive in this release, each with a status label worth noting:

- **Image generation (Preview):** agents can generate images from your prompts with GPT Image 2.5 Flare — for a website, a chat background, a new icon or a website wireframe — and can modify an existing image supplied as chat context or generate variations. It uses AI credits in addition to those used by the conversation model, and you can set `chat.copilot.imageGeneration.watermark` to `true` to add a perceptible "Made with AI" watermark.
- **Computer Use (Experimental):** the agent can see and control apps on your computer, for tasks that happen in desktop apps rather than in code or the terminal. It works in Copilot harness sessions running on your own macOS or Windows machine, and the agent asks you to allow turning it on — or you can run `/computer on`.
- **Canvases (Preview):** shared, interactive surfaces where you and the agent can inspect and update the same artifact, first introduced in VS Code 1.142. This release makes canvases easier to find, manage and open, including a Canvases section in the Agent Customizations editor and a Browse filter for canvas-capable plugins.

## Assisted permissions and the working set

**Assisted permissions** are now generally available for Copilot sessions. The agent performs an LLM-based risk assessment for each tool call and automatically approves low-risk calls, while higher-risk calls — or calls whose risk cannot be determined — still require your explicit approval. Assisted permissions require Folder isolation and might be restricted by your organization.

The **Copilot harness** continues to be the default for new sessions in VS Code, built on the Copilot SDK. Its **working set (Experimental)** records edits made through agent tools so you can review and decide which changes to keep or undo, with inline **Keep** and **Undo** controls in the editor. Changes made through terminal commands do not appear in the working set.

**Copilot Memory** is now available in Copilot harness sessions and is enabled by default. Agents recall relevant repository facts and your preferences when a session starts and store new learnings as you work. Memories are stored as repository facts, which are shared with others who have access to the repository, or as user preferences, which apply across your repositories — and you can review and delete your memories on GitHub at any time.

## Connectors, a Markdown editor and a refreshed look

**Copilot connectors (Preview)** are GitHub-managed MCP servers that bring context from services such as Slack, Notion and Microsoft Learn into your agent sessions without local server setup. They are enabled by default on all Copilot plans and work only with the Copilot harness; for Business and Enterprise plans, an administrator must enable Editor preview features.

The release also adds a new **Markdown editor**, so instead of editing raw Markdown you can edit the rendered Markdown directly, while still being able to edit the source if you prefer — handy for the README files and documentation that accompany most student projects. And the overall look and feel of VS Code has been refreshed in both light and dark themes.

## What to try first

If you already use VS Code with Copilot, the practical starting points from this release are: try Copilot Fusion on a real assignment task and check which models it picked; run a model comparison once, to see how different models handle the same prompt; and turn on the working set's Keep/Undo controls so you review agent edits before accepting them.

Remember the free-versus-paid line in the notes: VS Code itself is free, and image generation, canvases and the Copilot harness are available to try, but cloud sessions require a paid Copilot plan, and Fusion's High and Max tiers are limited to the Pro+, Max, Business and Enterprise plans. No pricing for individual Copilot plans was stated in the release notes used for this article.

## Sources

- [Visual Studio Code 1.144 — Microsoft](https://code.visualstudio.com/updates/v1_144)
