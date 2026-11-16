---
title: "A Real Hoverboard, Palm-Sized: Spinning Magnets Float a 3D-Printed Board Over Copper"
summary: "Maker Jake Rogers has built a palm-sized, battery-powered hoverboard that levitates untethered over a copper plate — two counter-rotating rotors, each carrying twelve N52 magnets in a Halbach arrangement, spin fast enough that the eddy currents they induce in the copper push the board up. It works, though it is not steady yet, and the full-size HALO-1 is still only a concept."
date: "2026-11-16"
category: "technology-news"
tags:
  - "Hoverboard"
  - "Magnetic Levitation"
  - "3D Printing"
  - "Maker"
  - "Eddy Currents"
sourceName: "Interesting Engineering"
sourceUrl: "https://interestingengineering.com/innovation/3d-printed-hoverboard-prototype"
featuredImage: "https://upload.wikimedia.org/wikipedia/commons/9/91/Halbach_array.svg"
featuredImageCredit: "A Halbach array diagram — the magnet arrangement Rogers uses to concentrate the field downward. Diagram: Fluxus, CC0, via Wikimedia Commons"
---

A hoverboard that actually hovers — no wheels, no air cushion, no cable — has been built at palm size by US maker Jake Rogers. His battery-powered, 3D-printed prototype floats a few millimetres above a 6.35 mm copper plate on its own power, and he has set his sights on a full-size ride-on version called HALO-1. The prototype is real and demonstrated on video; HALO-1, for now, is only a concept.

## How it floats

The trick is eddy-current levitation. Spinning permanent magnets above a good conductor induce circulating eddy currents in the metal, and those currents create their own magnetic field that pushes back against the magnets — enough lift to float a lightweight board. The magnets are arranged in a Halbach configuration, which concentrates the magnetic field downward toward the copper and weakens it on the upper side.

Each of the board's two 3D-printed rotors carries a ring of twelve N52 neodymium magnets in that Halbach arrangement — twelve per rotor, 24 in total. The two rotors counter-rotate: a single-rotor test lifted but twisted uncontrollably from reaction torque, and the second motor spinning the opposite way cancels it. The board runs on two 3S LiPo packs in series (nominal 22.2 V), with an ESP32 controller, electronic speed controllers, a buck converter supplying 5 V to the ESP32, and an IMU, controlled over Wi-Fi. The shell is soft pink, printed with Polymaker filament.

The lift is extremely gap-sensitive. Rogers' own model gives about 4.3 N per rotor at 4,000 RPM with the magnet face 8 mm from the copper, but only about 0.9 N at roughly 15 mm. His other lift figures — 61 N on a 3.84 g magnet at 8,000 rpm, or 941 grams-force per rotor at 3,000 rpm with a 5 mm gap — are simulations, not measurements, and Rogers distrusts his own sensor readings because the board rattles so much while hovering. No hover duration or runtime has been published anywhere, so none is stated here.

## What is demonstrated, and what is not

What the video shows is genuine: the board floats untethered and glides around on the copper on its own power. What it does not show is a finished vehicle. Rogers himself says the board "isn't completely steady yet and still required help to stay level", and it can drift.

HALO-1 is further still from reality. Rogers' own site describes it plainly: "Eight motors. Full-size development. Requires a conductive surface. Rideability and payload are not yet validated. ~$5,000 estimated price · R&D concept. No delivery date." It is a Blender concept with a free waitlist and no deposit — not built. His actual next step is smaller, not bigger: a pocket-size fingerboard toy (11.2 cm, $250 target) before HALO-1.

Rogers' YouTube video, "I Built a REAL Hoverboard from Scratch", was posted in the week of 10 November 2026; Interesting Engineering covered it on 15 November.

## Sources

- Interesting Engineering — [3D-printed hoverboard prototype levitates over copper](https://interestingengineering.com/innovation/3d-printed-hoverboard-prototype)
- Jake Rogers, YouTube — [I Built a REAL Hoverboard from Scratch](https://www.youtube.com/watch?v=LDp9qqaX-sU)
- Jake Rogers' own site — [aprotohype.com](https://aprotohype.com/)
- Hackster.io — [This homemade hoverboard floats on magnets](https://www.hackster.io/news/this-homemade-hoverboard-floats-on-magnets-b78b1d63ba45)
- TechEBlog — [Real-life hoverboard project](https://www.techeblog.com/real-life-hoverboard-project)
