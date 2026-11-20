---
title: "Optimizely Signup Flaw Let Attackers Poison 178 Organisations' Websites in a Single Day"
summary: "On 16 November 2026, attackers exploited a flaw in Optimizely's Experimentation account signup flow to inject malicious JavaScript into customer projects — 188 infected files belonging to 178 organisations, including CNN, the BBC and HSBC. The payload skimmed payment cards, swapped crypto wallet addresses and delivered iOS exploit kits before Optimizely cleaned every file by 23:11 UTC."
date: "2026-11-20"
category: "technology-news"
tags:
  - "Cybersecurity"
  - "Supply Chain Attack"
  - "Optimizely"
  - "JavaScript"
  - "Data Breach"
sourceName: "BleepingComputer"
sourceUrl: "https://www.bleepingcomputer.com/news/security/optimizely-supply-chain-attack-delivers-malware-to-cnn-fox-news-bbc-salesforce-sites/"
featuredImage: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Programming_code.jpg"
featuredImageCredit: "Programming code on a screen — not the malicious script itself. Photo: CC BY-SA 4.0, via Wikimedia Commons"
---

A/B testing tools sit on some of the world's biggest websites, with permission to run JavaScript on every page. On Monday 16 November 2026, attackers turned that trust against Optimizely's customers: a flaw in the company's Experimentation platform let them inject malicious code into the projects of 178 organisations, including CNN, the BBC and HSBC, in a single day.

## A flaw in the signup flow, not the CDN

The vulnerability was in Optimizely's Experimentation account signup flow — ZeroFox calls it the "account setup function". It let an unauthorised party write malicious code into the Project JavaScript field of customer projects: a vendor-side authorisation and workflow flaw. The tampered files were still served from Optimizely's own trusted CDN, cdn.optimizely.com, under its valid certificate — this was not CDN cache poisoning. No CVE or CVSS has been assigned, because the flaw sits in Optimizely's own signup workflow rather than in a versioned product.

The first malicious injection was seen at 04:21 UTC, and all infected files were cleaned by 23:11 UTC the same day. The payload was rebuilt 26 times during the day.

## 178 organisations — a confirmed count, probably an undercount

Security researcher Scott Helme of Report URI analysed 1,611 Optimizely snippets and found the malicious code in 188 files belonging to 178 organisations. So 178 counts organisations whose snippets were confirmed infected — and Report URI says the true number is likely higher, since it could only check the snippets it found in time. The confirmed list includes CNN, the BBC, HSBC (BleepingComputer specifies HSBC Insurance), Zoom, Fox News, Salesforce, GitLab, IKEA, Equifax, Ledger, KLM/Air France — and Optimizely itself.

## What the payload did

The injected loader pulled a `track.js` file from an attacker domain, and then:

- **Swapped cryptocurrency wallet addresses** for the attacker's own — those wallets received about $7,040 by 19:25 UTC on 16 November.
- **Skimmed payment-card details** typed into sites' own form fields. Cards entered into hosted payment iframes were out of reach.
- **Stole cookies and page screenshots** — a detail many summaries omit.
- **Delivered the Coruna and DarkSword iOS exploit kits** to iPhone and iPad visitors on older iOS versions.

## Optimizely's response

Optimizely confirmed to BleepingComputer that "an unauthorized party exploited a vulnerability in the Experimentation account signup flow" to add malicious JavaScript to customer projects. It blocked access to the vulnerable path, deployed a fix, removed the injected code from affected projects, ended active sessions, revoked tokens, reset access for affected accounts, blocked code delivery in Cloudflare, and notified all affected customers. Its official incident notice was posted at status.optimizely.com at 01:02 UTC on 17 November, with an initial-findings report published by 18 November.

Hudson Rock has linked the same actor to related poisoned scripts served through Kissmetrics, StorifyMe and minute-ly from 13 November — the Optimizely wave was the 16 November escalation. Researchers have labelled the campaign "OPTIMJACK" (a campaign name, not an actor name); the attacker has not been identified.
