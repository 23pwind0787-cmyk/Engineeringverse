---
title: ".NET 11 Is Here: C# 15 Union Types, a Faster SDK and AI-Ready Tooling"
summary: "Microsoft released .NET 11 on 10 November 2026 at .NET Conf 2026. The release makes C# 15 the default language with union types and closed hierarchies, speeds up everyday SDK commands, adds AI building blocks for agents and MCP tools, and brings ASP.NET Core, .NET MAUI and Entity Framework Core 11 updates — while .NET 8 and .NET 9 reach end of support on the same day."
date: "2026-11-11"
category: "software-news"
tags:
  - ".NET 11"
  - "C# 15"
  - "ASP.NET Core"
  - "Software"
sourceName: "Microsoft — .NET Blog: Announcing .NET 11"
sourceUrl: "https://devblogs.microsoft.com/dotnet/announcing-dotnet-11/"
---

## What .NET 11 is

Microsoft released .NET 11 on 10 November 2026, announced on the official .NET Blog at the start of .NET Conf 2026 (10–13 November). The release covers C# 15, ASP.NET Core, .NET MAUI and Windows development, with what the announcement describes as hundreds of runtime optimisations, more responsive SDK tooling and less overhead in everyday commands.

For engineering students, .NET is worth knowing because it is the free, open-source, cross-platform framework behind many of the web apps, desktop tools and APIs built in C# — the language used in a lot of university coursework, final-year projects and industry placements. The new release is a Standard Term Support (STS) release with two years of support under Microsoft's .NET support policy. .NET 10 remains a supported long-term support (LTS) option, so there is no forced jump for existing projects.

One date matters immediately: .NET 8 and .NET 9 reached end of support on 10 November 2026. Projects still on those versions will no longer receive fixes, and Microsoft's announcement recommends moving to .NET 11 for the latest capabilities or to .NET 10 if its LTS lifecycle fits better.

## C# 15: union types and closed hierarchies

C# 15 is the default language version for projects targeting .NET 11. Its headline addition is **union types**: a value can be one of a declared set of case types, with conversions from those types and exhaustiveness checking in switch expressions. The announcement's example is a product lookup that returns either a `Product` or a `ProductNotFound` — the result type itself tells the caller which outcomes it must handle, without resorting to `object` or an unrelated base class.

**Closed hierarchies** are the companion feature: a `closed` class limits direct derivation to its declaring assembly, giving the compiler the information it needs to check patterns over the hierarchy. Unions fit cases where you combine existing types; closed hierarchies fit models where you own the inheritance relationship.

Smaller additions include extension indexers, labelled `break` and `continue`, and collection expression arguments that let you pass constructor or factory arguments without giving up collection expression syntax. The separate memory-safety work **remains in preview** — it is not part of the default C# 15 experience. F# 11 also ships with .NET 11, improving compiler memory use and reducing allocations in FSharp.Core collection operations.

## A faster SDK and everyday tooling

The SDK now enables a **Native AOT CLI host** by default, so commands such as help and version queries can run without starting the managed CLI, and tool launches can avoid that startup path too. The **MSBuild server** also stays warm between CLI invocations by default, reducing repeated startup work, and SDK installers on Linux and macOS are smaller through assembly deduplication.

Other tooling changes in the release include `#:include` for growing file-based apps across source files, creating and editing solution filters from the CLI, and `dotnet watch` gains Aspire app-host integration, crash recovery and device selection for mobile projects. For testing, `dotnet test` gains run-level timeouts, failure limits, clearer progress reporting and per-module results directories when using Microsoft.Testing.Platform. Container publishing adds reproducible image digests through `SOURCE_DATE_EPOCH` and avoids redundant layer uploads when the target manifest already exists.

A new toolchain manager, **dotnetup**, lets you install and update .NET SDKs and runtimes in your user account and manage side-by-side versions. It is currently in **public preview**. **.NET Skills** give coding agents task-specific guidance from the .NET team, and the **.NET Upgrade canvas** gives a visual view of a GitHub Copilot upgrade session, including assessment findings and dependency compatibility.

## Runtime and performance

Performance work in .NET 11 reaches both deployed code and the tools used to develop it. The announcement points to Stephen Toub's detailed "Performance Improvements in .NET 11" post for the full tour with benchmarks. The just-in-time (JIT) compiler removes more redundant bounds checks and branches, improves devirtualisation and folds more operations into constants. Native AOT interface dispatch uses a shared helper that reduces the code needed at interface call sites and improves throughput for interface-heavy workloads. Hardware support expands too, including FP16 instructions for `Half` operations on supported x64 and Arm64 hardware.

Diagnostics improve as well: in-process crash report logging can capture a managed stack trace, module information and runtime state before a process exits. Previously available on mobile platforms, this reporting path now also supports Linux and macOS. The announcement adds the honest caveat that throughput, startup time, memory use and deployment size depend on the workload and publishing options you choose — measure the effect on your own application.

**Runtime Async remains a preview feature.** It moves asynchronous suspension and resumption into the runtime instead of relying on compiler-generated state machines, giving profilers and debuggers a clearer live call stack. To try it in a project targeting `net11.0`, the announcement says to add `<Features>runtime-async=on</Features>` to a `PropertyGroup`; the .NET runtime libraries themselves are built with Runtime Async, but opting your application's code in is a separate choice.

## AI building blocks: MCP, agents and Blazor AI components

.NET 11 leans into AI-powered, agentic applications with three pieces the announcement names together: **Microsoft.Extensions.AI (MEAI)** for model access, **MCP** for tool integration and **Microsoft Agent Framework (MAF)** for agents and workflows.

The .NET 11 SDK includes an **MCP server template** built on the official MCP C# SDK, with a working sample tool, so you can start exposing your own functionality as tools for AI applications without first installing a separate template package:

```
dotnet new mcpserver -o MyMcpServer
```

MEAI provides abstractions such as `IChatClient` and `IEmbeddingGenerator`, letting you compose model access with dependency injection, caching and OpenTelemetry using familiar .NET patterns. These libraries are available as NuGet packages rather than features that require moving all of your application code to a new framework version. MAF builds on these abstractions with agents that call tools and maintain conversation state, plus workflows that coordinate agents and application code.

For web interfaces to agents, the new `Microsoft.AspNetCore.Components.AI` package includes components for streaming chat, tool rendering, approval flows and shared UI state. **The Blazor AI components package is experimental and remains prerelease throughout .NET 11** — an opportunity to try the direction and give feedback, not a stable part of the ASP.NET Core shared framework. The AG-UI hosting integration for connecting a remote agent to a Blazor UI is currently prerelease as well.

## ASP.NET Core, Blazor and Entity Framework Core 11

ASP.NET Core supports C# unions wherever it uses `System.Text.Json`, including JSON request and response bodies in Minimal APIs and MVC, with generated OpenAPI documents describing the union's alternatives with an `anyOf` schema. Validation becomes more practical for rules that need I/O: **asynchronous validation** works with the new asynchronous DataAnnotations APIs, so a validator can await a database lookup or a remote call instead of blocking a thread. **OpenAPI 3.2 is now the default** for generated documents, and SignalR connections can refresh authentication without reconnecting.

Blazor adds a `CacheView` component that caches the rendered output of a component subtree during static server-side rendering, and interactive server apps can opt into automatically pausing a circuit when a browser tab becomes inactive — after a configurable delay, pausing frees the server memory and SignalR connection held by an inactive user. The feature requires an additional package and explicit configuration; upgrading does not silently change circuit behaviour.

**Entity Framework Core 11** removes unnecessary joins in more reference-navigation and split-query scenarios, improves `GroupBy` translation and translates the new LINQ `FullJoin` operator on relational providers that support it. For SQL Server applications, EF Core adds support for vector indexes and approximate vector search — but **the SQL Server features and corresponding EF APIs are experimental**, so check the vector search documentation and limitations before evaluating them. EF Core 11 requires .NET 11, and the announcement advises checking your database provider's compatibility and the EF Core 11 breaking changes when upgrading.

## Libraries, .NET MAUI and Windows desktop

The .NET libraries add capabilities that previously required extra setup or custom helpers: built-in **Zstandard compression** in `System.IO.Compression`, one-shot `Process` API methods to run a process and capture its output and exit status, four new in-memory stream adapters (`ReadOnlyMemoryStream`, `WritableMemoryStream`, `ReadOnlySequenceStream` and `StringStream`), `System.Text.Json` support for C# unions and JSON Lines output, and a LINQ `FullJoin` operator that preserves unmatched elements from both inputs — useful for reconciliation work such as comparing two inventories.

**.NET MAUI** makes CoreCLR the default runtime across its platforms, bringing mobile and desktop apps onto the same runtime foundation as other .NET workloads. XAML Incremental Hot Reload is a **preview feature** that updates live instances of pages and controls without requiring you to navigate away and back, and it is enabled by default in Debug builds. Windows uses the new `CollectionView2` handler by default, while Android Shell adopts a handler-based architecture. One migration note: the optional `Microsoft.Maui.Controls.Compatibility` package no longer ships, so apps that still reference it need to migrate off it.

For Windows desktop, WinUI 3 remains the recommended native UI framework for new apps, delivered through the Windows App SDK. Windows Forms adds an opt-in modern visual styles mode you can select at the application or control level, plus ways to react to system visual and accessibility settings. WPF updates focus on reliability, including fixes for Fluent window backdrops, window manager failures and weak-event cleanup.

## Get started and plan your upgrade

Install the .NET 11 SDK from Microsoft's download page and use a compatible, up-to-date Visual Studio 2026 installation or Visual Studio Code with C# Dev Kit. To create and run a console app:

```
dotnet new console -n HelloDotnet11 -f net11.0
dotnet run --project HelloDotnet11
```

For an existing application, the announcement's upgrade plan is: update the SDK selection in `global.json` if your repository pins it, update target frameworks to .NET 11 while preserving platform-specific suffixes, review the .NET 11 breaking changes — including the updated minimum CPU requirements — and then run your tests and measure the application under a representative workload. Installing a new SDK alone does not retarget your app, and if you are upgrading from a .NET 11 release candidate, update to the final SDK, runtime and compatible package versions rather than staying on a prerelease build.

.NET is free and open source, and the announcement credits the release to over 7,000 contributors, with more than 589,000 unique packages on NuGet and over 1.1 trillion package downloads. No pricing was stated in the announcement, and none is claimed here — the framework itself is free to download and use.

## Sources

- [Announcing .NET 11 — Microsoft .NET Blog](https://devblogs.microsoft.com/dotnet/announcing-dotnet-11/)
- [.NET Conf 2026 — dot.net/conf](https://devblogs.microsoft.com/dotnet/get-ready-for-dotnet-conf-2026/)
