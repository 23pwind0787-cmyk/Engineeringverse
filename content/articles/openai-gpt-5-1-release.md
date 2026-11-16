---
title: "GPT-5.1 Is Here: OpenAI's Warmer, Faster ChatGPT and a Stronger Coding Model"
summary: "OpenAI released GPT-5.1 on 12 November 2026, upgrading ChatGPT with two models — GPT-5.1 Instant, now warmer and more conversational with adaptive reasoning, and GPT-5.1 Thinking, faster on simple tasks and more persistent on hard ones — plus new tone controls and, for developers, a no-reasoning mode, 24-hour prompt caching and new apply_patch and shell tools. API pricing and rate limits are unchanged from GPT-5."
date: "2026-11-16"
category: "ai-tools"
tags:
  - "GPT-5.1"
  - "OpenAI"
  - "ChatGPT"
  - "AI coding"
  - "Software"
sourceName: "OpenAI — GPT-5.1: A smarter, more conversational ChatGPT"
sourceUrl: "https://openai.com/index/gpt-5-1/"
---

## What GPT-5.1 is

OpenAI released GPT-5.1 on 12 November 2026, upgrading the GPT-5 series in ChatGPT and in the API for developers. The name is deliberate: OpenAI says GPT-5.1 reflects meaningful improvements while remaining within the GPT-5 generation, and future iterative upgrades will follow the same pattern — so this is a refinement of GPT-5, not a new model generation.

For engineering students, this release matters in two ways. In ChatGPT, the model you already use for coursework, debugging and final-year project work is now warmer, better at following instructions and faster on everyday questions. In the API, GPT-5.1 is built for agentic and coding work, with new tools that let it edit files and run shell commands directly. The update arrives three months after GPT-5 launched in August 2026, and OpenAI says it was shaped by user feedback that great AI should be not only smart but enjoyable to talk to.

## Two models in ChatGPT: Instant and Thinking

The release brings two models to ChatGPT:

- **GPT-5.1 Instant** — ChatGPT's most-used model, now warmer by default and more conversational. OpenAI says it is more intelligent and better at following instructions, so it more reliably answers the question actually asked. For the first time, Instant can use adaptive reasoning, deciding when to think before responding to harder questions, which OpenAI says produces more thorough and accurate answers while still responding quickly. OpenAI reports significant improvements on maths and coding evaluations such as AIME 2025 and Codeforces.
- **GPT-5.1 Thinking** — the advanced reasoning model, now easier to understand and more efficient. It varies its thinking time more dynamically than GPT-5 Thinking: roughly twice as fast on the fastest tasks and twice as slow on the slowest ones, on a representative distribution of ChatGPT tasks. Its responses are also clearer, with less jargon and fewer undefined terms, and its default tone is warmer and more empathetic.

**GPT-5.1 Auto** continues to route each query to the model best suited for it, so in most cases you will not need to choose a model at all — OpenAI says what you will notice is answers that feel both smarter and more natural in tone.

## Rollout and the three-month transition

GPT-5.1 Instant and Thinking began rolling out on 12 November 2026, starting with paid ChatGPT users (Pro, Plus, Go and Business), then free and logged-out users over the following days. Enterprise and Education plans get a seven-day early-access toggle, off by default, after which GPT-5.1 becomes the sole default model. GPT-5 Pro will also be updated to GPT-5.1 Pro soon.

OpenAI is handling the transition more gently than the GPT-5 launch: GPT-5 (Instant and Thinking) will remain available in ChatGPT under the legacy models dropdown for paid subscribers for three months, so users have time to compare and adapt at their own pace. The announcement says future model introductions will follow the same approach, with sunset periods communicated clearly and with plenty of advance notice.

## New tone and personalization controls

Alongside the models, OpenAI is making it easier to shape ChatGPT's tone. The preset styles are now **Default, Friendly** (formerly Listener) **and Efficient** (formerly Robot), with three new options added: **Professional, Candid and Quirky**. The earlier **Cynical** and **Nerdy** options remain available unchanged under the same personalization dropdown. These settings apply across all models.

For users who want more granular control, OpenAI is experimenting with tuning ChatGPT's characteristics directly from personalization settings — how concise, warm or scannable its responses are, and how frequently it uses emojis — and ChatGPT can proactively offer to update these preferences during a conversation when it notices a pattern. That fine-tuning ability is starting to roll out gradually later in the week as an experiment, to a limited number of users. One practical change applies immediately: updates in personalization settings now take effect across all chats right away, including ongoing conversations, whereas before they only applied to conversations started afterwards.

## GPT-5.1 for developers: adaptive reasoning and a no-reasoning mode

In the API, GPT-5.1 is designed to balance intelligence and speed for agentic and coding tasks. Its headline change is **adaptive reasoning**: the model dynamically adjusts how much time it spends thinking based on the complexity of the task. On straightforward tasks it spends fewer tokens thinking, giving snappier responses and lower token bills; on difficult tasks it stays persistent, exploring options and checking its work. OpenAI's example: asked to show an npm command to list globally installed packages, GPT-5.1 at medium reasoning effort answers in about 2 seconds and roughly 50 tokens, against about 10 seconds and 250 tokens for GPT-5.

Developers can also now run GPT-5.1 without reasoning at all, by setting `reasoning_effort` to `'none'`. This makes the model behave like a non-reasoning model for latency-sensitive use cases, while keeping GPT-5.1's intelligence and tool-calling ability. OpenAI says GPT-5.1 with no reasoning is better than GPT-5 with minimal reasoning at parallel tool calling, coding tasks, following instructions and using search tools, and it supports web search in the API. GPT-5.1 defaults to `'none'`; OpenAI recommends `'low'` or `'medium'` for more complex tasks and `'high'` when intelligence and reliability matter more than speed.

**Extended prompt caching** is also new: prompts can remain active in the cache for up to 24 hours, rather than the few minutes supported before, so more follow-up requests can reuse cached context in long multi-turn chats, coding sessions and knowledge-retrieval workflows. Prompt cache pricing remains unchanged — cached input tokens are 90% cheaper than uncached tokens, with no additional charge for cache writes or storage. To use it, add `prompt_cache_retention='24h'` on the Responses or Chat Completions API.

## Coding: better results and two new tools

GPT-5.1 builds on GPT-5's coding capabilities with what OpenAI describes as a more steerable coding personality, less overthinking, improved code quality, better user-facing update messages during sequences of tool calls, and more functional frontend designs, especially at low reasoning effort. On SWE-bench Verified — a benchmark where a model is given a code repository and an issue description and must generate a patch — GPT-5.1 reaches 76.3%, against 72.8% for GPT-5. The developer announcement's evaluation table also reports GPQA Diamond at 88.1% (GPT-5: 85.7%) and MMMU at 85.4% (GPT-5: 84.2%). One honest note from the same table: on AIME 2025, GPT-5.1 scores 94.0% against GPT-5's 94.6% — slightly lower, so the gains are not uniform across every benchmark.

OpenAI worked with coding companies including Cursor, Cognition, Augment Code, Factory and Warp on the release. Augment Code called the model "more deliberate with fewer wasted actions", Cline reported a 7% improvement on its diff-editing benchmark, and Warp is making GPT-5.1 the default for new users. JetBrains' Head of AI DevTools Ecosystem described it as "genuinely agentic" and "the most naturally autonomous model I've ever tested".

Two new tools arrive with GPT-5.1 in the Responses API:

- **`apply_patch`** — a freeform tool that lets the model create, update and delete files in a codebase using structured diffs, without the need for JSON escaping, so it can make code edits more reliably and iterate across multiple steps.
- **`shell`** — a tool that lets the model propose shell commands to run on a local machine, creating a plan-execute loop in which the model inspects the system, runs utilities and gathers information until it can finish the task. A developer's integration executes the commands and returns the outputs.

OpenAI is also releasing `gpt-5.1-codex` and `gpt-5.1-codex-mini` in the API, optimised for long-running, agentic coding tasks in Codex or Codex-like harnesses, while GPT-5.1 itself is the general-purpose model. In the API, GPT-5.1 Instant is added as `gpt-5.1-chat-latest` and GPT-5.1 Thinking as `gpt-5.1`.

## Availability and pricing

GPT-5.1 and `gpt-5.1-chat-latest` are available to developers on all paid API tiers. OpenAI states that **pricing and rate limits are the same as GPT-5**, and that it does not currently plan to deprecate GPT-5 in the API, with advanced notice promised if that changes. No ChatGPT plan price changes were stated in the announcements, and none are claimed here.

For students, the practical takeaway is simple: the free ChatGPT tier gets GPT-5.1 as the rollout reaches it, the legacy GPT-5 models stay available for three months if you want to compare, and if you are building a final-year project or coding agent on the API, the no-reasoning mode and the new `apply_patch` and `shell` tools are the features worth trying first.

## Sources

- [GPT-5.1: A smarter, more conversational ChatGPT — OpenAI](https://openai.com/index/gpt-5-1/)
- [Introducing GPT-5.1 for developers — OpenAI](https://openai.com/index/gpt-5-1-for-developers/)
