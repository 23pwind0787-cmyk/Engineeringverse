---
title: "Penn's CoilLCE Artificial Muscles Give Soft Robots Their First Feedback Control"
summary: "University of Pennsylvania researchers have built CoilLCE artificial muscle fibres — liquid crystal elastomer and graphene with an embedded copper coil that acts as both heater and sensor — and demonstrated the first feedback control on an LCE actuator. In lab demos, a robotic hand pressed piano keys with tunable force and artificial eyes shifted and held their gaze. The work is lab-scale, published in Advanced Functional Materials."
date: "2026-11-17"
category: "technology-news"
tags:
  - "Robotics"
  - "Artificial Muscles"
  - "Soft Robotics"
  - "Liquid Crystal Elastomers"
  - "University of Pennsylvania"
sourceName: "Penn Engineering"
sourceUrl: "https://www.engineering.upenn.edu/stories/artificial-muscles-give-robots-precise-control/"
featuredImage: "https://upload.wikimedia.org/wikipedia/commons/3/34/Pneumatic_artificial_muscle.jpg"
featuredImageCredit: "A pneumatic artificial muscle — not the CoilLCE fibre, which has no freely licensed image. Photo: public domain via Wikimedia Commons"
---

Soft robots move the way muscles do — by contracting — but until now their artificial muscles have mostly been open-loop: you heat them, they contract, and you hope they land where you wanted. Researchers at the University of Pennsylvania have changed that with CoilLCE, an artificial muscle fibre that can sense its own state and hold a position under feedback control. It is, the team says, the first time feedback control has been demonstrated on a liquid crystal elastomer (LCE) actuator.

## One coil, two jobs

A CoilLCE fibre is a composite of liquid crystal elastomer and graphene, with an ultrathin copper coil — 50-micrometre wire — embedded inside it. The fibres are 0.55–0.73 mm in diameter, comparable to small human muscle bundles. The coil does two jobs at once: run current through it and Joule heating triggers the LCE to contract; read its electrical resistance and you get a temperature signal. Because temperature and strain track each other monotonically in this material, that resistance reading is enough to close the loop. As co-author Xuelin Wu puts it: "We used the resistance of the embedded copper coil as a feedback signal and adjusted the heating power in real time to keep the resistance near a target value."

That lets a CoilLCE fibre hold intermediate contraction states — not just fully on or fully off — without any separate sensor. The team demonstrated state-hopping with about 2% accuracy, and a fibre holding a set strain for over 20 minutes.

## The numbers

The paper's figures show why the graphene matters. With only 0.25 wt.% graphene loading, the composite reaches a toughness of 632 MJ/m³, more than three times pure LCE (192 MJ/m³). Antagonistic actuation strain — the fibre working against an opposing fibre, as real muscles do — reached 16.1 ± 0.7%, against 11.2 ± 0.8% for pure LCE, an enhancement of about 44%. Overall actuation strain exceeds 40%, strain rates reach up to 30% per second, and work capacity is 343 J/kg.

## Piano keys and eye movements

The team demonstrated the control in two lab-scale rigs. In one, a 3D-printed robotic hand pressed individual piano keys with tunable force and speed — sensors under the keys measured how hard each note landed. It was a controlled press, not a performance. In the other, four pairs of antagonistic CoilLCE fibres drove artificial eyeballs on freely rotating ball joints inside 3D-printed shells, shifting and holding their gaze.

The work was led by Shu Yang (Joseph Bordogna Professor of Materials Science and Engineering) and Cynthia Sung (Associate Professor of Mechanical Engineering and Applied Mechanics), with PhD student Ziyun Zhang as co-lead author and master's student Xuelin Wu. Funding came from the Army Research Office (MURI), the NSF, the NSF Graduate Research Fellowship Program and the National GEM Consortium. It is published as "Multistage, Self-Sensing Artificial Muscles With Coordination From Liquid Crystal Elastomer-Graphene Composite Fibers" in *Advanced Functional Materials* (2026, DOI: 10.1002/adfm.78054).

## Lab-scale for now

This is a laboratory demonstration, not a humanoid robot, and there is no deployment or commercial timeline. The next challenge is integrating many muscles into larger systems — a humanoid face, for example, needs dozens of coordinated small muscles — with AI and computer vision coordination as a future interest, not something demonstrated here. But the core result stands on its own: an artificial muscle that can feel where it is and stay there.
