---
title: "Moth Quantum Reports 1,568 Values Stored and Read Back on IBM's Phoenix Chip"
summary: "UK-based Moth Quantum says its Tessellated QPIXL (Tessa) method encoded and retrieved 1,568 values on IBM's 120-qubit Phoenix processor — 12.25 times the previous record of 128. The result is reported in a preprint, not a peer-reviewed paper, and the recovered image was visibly degraded: the headline fidelity figures of 19% to 92% apply to discrete symbols like music notes and DNA sequences, not to images."
date: "2026-11-17"
category: "technology-news"
tags:
  - "Quantum Computing"
  - "IBM"
  - "Moth Quantum"
  - "Data Encoding"
  - "QPIXL"
sourceName: "Moth Quantum"
sourceUrl: "https://mothquantum.com/news/2026/11/16/tessa-loading-data-onto-real-quantum-chips"
featuredImage: "https://upload.wikimedia.org/wikipedia/commons/9/91/IBM_Quantum_System_One.jpg"
featuredImageCredit: "An IBM quantum computer (System One) — not the Phoenix processor used in the experiment. Photo: OJB Quantum, CC BY 4.0, via Wikimedia Commons"
---

Loading classical data onto a quantum processor and getting it back out again is one of the field's quiet bottlenecks: quantum algorithms need data in, but encoding it usually costs more qubits and circuit depth than the computation itself is worth. UK-based Moth Quantum now reports a large step in that direction — 1,568 values encoded and read back on a real IBM chip — though the result comes with important caveats about fidelity and peer review.

## What was actually done

The experiment ran on IBM's Phoenix processor (the 120-qubit Nighthawk r2 chip) on 26 September 2026, with 8,192 measurement shots per basis. The team encoded two values per pixel — brightness as a polar angle, hue as a phase — of a 28×28 pixel-art cat image, giving 1,568 values in total. A second chip, Fez (the 156-qubit Heron r2), reached 882 values under the same two-value scheme, so the 1,568 headline number is Phoenix-only.

The method is called Tessellated QPIXL, or Tessa. It lays out a checkerboard of data qubits and neighbouring address qubits across the chip's physical coupling graph, so it needs no SWAP gates and no ancilla qubits. Encoding 784 values took 19 layers of two-qubit gates, and the circuit depth stays constant as chips grow — the scaling property the team is most interested in.

The previous record under the same definition — experiments loading freely chosen numeric lists onto physical processors and retrieving individual values — was 128 values, set by QCrank on 12 trapped-ion qubits. Tessa's 1,568 is 12.25 times that. The "record" is scoped to the paper's own definition, not an independently adjudicated one: a separate Fez run recovered 1,024 pixels from 13 qubits, but through a trained tensor-network approximation, so it is excluded under that definition.

## The fidelity caveat

The 19%–92% accuracy range in the headlines needs unpicking. It applies to discrete-symbol recovery — the percentage of symbols recovered exactly correct — not to images:

- **Music:** 347 flute notes, only 18.7% of pitches recovered accurately.
- **DNA and protein sequences** (32,768 shots per basis, 16 October 2026): the mitochondrial protein MT-CO3 reached 92.3% (92.1% without dynamic-range recovery) — the high end of the range; p53 reached 71.5%, Sonic hedgehog 76.2%, and the SUR1 gene only 21.0–22.6%. Long sequences fail badly.
- **Images** are not measured as a percentage at all: the 1,568-value colour image had a brightness correlation of 0.69 with the original — visibly degraded — with mean absolute errors of 0.152 for brightness and 0.092 for hue. Single-value images did better, reaching correlations of 0.95–0.96.

No error mitigation was used in any test, and Moth notes it could improve future results. Phoenix's noise error ran 2.6 times the model prediction.

## Preprint, not peer review — yet

The work is reported by Daniel Bultrini in *"Tessa: Encoding Classical Data Across an Entire Quantum Processor"*, arXiv:2611.18440, submitted 13 November 2026 and announced by Moth Quantum on 16 November 2026. It is a preprint, not a peer-reviewed paper, and the code and raw hardware data are public in Moth's GitHub repository; no independent hardware replication has been reported yet. As a demonstration that a whole processor can be used as a data store, it is a genuine advance — but the recovered data is noisy, and the record claim is Moth's framing of its own definition.
