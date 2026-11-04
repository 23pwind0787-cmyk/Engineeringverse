---
title: "MATLAB and Simulink R2026b: New DOE App, Visual Inspection and Point Cloud Toolboxes, and Plain-Text Project Files"
summary: "Released on 23 September 2026, MATLAB and Simulink R2026b adds a graphical Design of Experiments app, new toolboxes for visual inspection and point-cloud perception, Simulink Variant Manager, and plain-text project and app files that work better with source control."
date: "2026-11-04"
category: "software-news"
tags:
  - "MATLAB"
  - "Simulink"
  - "Design of Experiments"
  - "AI"
  - "Simulation"
sourceName: "MathWorks — MathWorks Introduces Release 2026b of MATLAB and Simulink"
sourceUrl: "https://www.mathworks.com/company/newsroom/mathworks-introduces-release-2026b-of-matlab-and-simulink.html"
---

## What R2026b is

MathWorks released MATLAB and Simulink Release 2026b (R2026b) on 23 September 2026, according to MathWorks' own MATLAB blog. The announcement presents the release as a response to growing system complexity: modern engineered systems combine software, electronics, sensors and AI, so teams need better ways to manage product variants, validate designs and move from simulation to deployment.

For engineering students, the most immediately useful parts are not the headline product names. They are the workflow changes: a graphical app for designing experiments, project and app files saved as readable plain text, direct Google Sheets access, and closer MATLAB–Python working on the GPU. Each of those changes something students actually do every week.

## New products in R2026b

MathWorks names three new products in its announcement, with a fourth new toolbox described alongside them:

- **Simulink Variant Manager** helps teams manage growing numbers of product variants across complex models and system architectures, improving consistency, traceability and collaboration when developing product families and platform-based designs.
- **Visual Inspection Toolbox** combines artificial intelligence and image-processing techniques to streamline the development and deployment of visual inspection applications for manufacturing and industrial environments.
- **Polyspace Test Server** automates testing and code coverage analysis for C/C++ embedded software in continuous integration environments, covering unit and integration tests and structural coverage analysis on automation servers.
- **Point Cloud Toolbox** expands workflows for lidar-, camera-, radar- and SLAM-based applications, supporting perception systems for robotics, automation, transportation and other sensor-driven applications.

## Design of Experiments gets a graphical app

The change most relevant to coursework in experimental design is in the Statistics and Machine Learning Toolbox. R2026b adds interactive applications for design of experiments (DOE) and Gage R&R studies, for evaluating measurement-system variability and analysing experimental results.

MathWorks' blog adds the detail that matters in practice: alongside the existing programmatic DOE framework, R2026b introduces the DOE Explorer App, which exposes the entire DOE workflow in a graphical user interface. Students who previously had to build an experiment design in code can now work through the same workflow interactively, while still having the programmatic route available when a design needs to be scripted or repeated.

## Plain-text files for projects, apps and live scripts

R2026b improves project management, source-control workflows, interoperability and data access in MATLAB, with new TOML-based project files, package management through File Exchange, Google Sheets integration, and performance improvements for data-centric workflows.

The plain-text changes deserve attention because they affect group work and version control directly. App Designer apps could previously only use the binary `.mlapp` format, which is not source-control friendly; in R2026b, apps can be saved in a plain-text format combining `.m` and `.xml` files. Live scripts made a similar transition earlier, and in R2026b the plain-text format is now the default for live scripts, with the binary `.mlx` format becoming the option. Simulink data dictionaries can likewise be saved in JSON format for source-control workflows, and Simulink models can be published as reusable models that can be reused without rebuilding.

Package management is also new in this form: the blog demonstrates installing a File Exchange package from the command window with `mpminstall`, listing installed packages with `mpmlist`, and removing one with `mpmuninstall`. Google Sheets support means the standard functions `readtable`, `writetable`, `readmatrix`, `writematrix`, `readcell`, `writecell`, `readtimetable`, `writetimetable` and `sheetnames` work with a Google Sheets spreadsheet once MATLAB is connected to a Google account.

## Simulation, AI and GPU updates

In Simulink, the release enhances simulation performance and collaboration with the published models and JSON data dictionaries described above, plus AI-assisted profiling insights generated with Simulink Copilot. Simulink Design Verifier accelerates verification by distributing analysis across multiple CPU cores, with improved precision for models using floating-point and complex mathematical operations.

The Deep Learning Toolbox simplifies time-series AI workflows with the new Time Series Modeler app and strengthens interoperability by enabling co-execution of PyTorch models in MATLAB and Simulink. The Aerospace Toolbox expands mission design with high-fidelity orbit propagation, manoeuvre modelling, constellation design and support for lunar missions and other celestial bodies, while the Audio Toolbox expands acoustic modelling with Simscape integration, ray-based sound propagation for room and underwater acoustics, and objective audio quality and intelligibility metrics.

For GPU work, new features in the Parallel Computing Toolbox and Deep Learning Toolbox let MATLAB and Python GPU workflows share data without a round trip through host memory — for example, passing a GPU array to CuPy with `pycupyarray`, or to PyTorch with `arrayToTorchTensor`. A new GPU Monitor app shows GPU memory usage and utilisation in real time, covering all processes, not only MATLAB's. R2026b also adds a MATLAB Support for Python 3.13 package, and supports Python 3.14, although the blog notes the Python 3.14 support package was not yet available when it was written.

## Performance, including a beta improvement

Performance improvements in R2026b include examples quoted from the release notes in MathWorks' blog, such as up to 94x speed-up for `union` and `intersect` on vectors of polyshape objects, and up to 43x speed-up for several operations on datetime arrays. Those are specific examples, not a general promise for every workflow.

One system-wide improvement is labelled beta and should be treated as such: the Object Performance Improvement for MATLAB (Beta) can be turned on by installing the beta package. MathWorks describes it as a fundamental language performance improvement for workflows involving objects, while noting that the actual speed-up can vary dramatically depending on how code uses objects. Students should expect beta features to change before they settle into the standard workflow.

## What to check before upgrading

Pricing and availability by licence were not stated in the official announcement or blog post used for this article, and no price is claimed here. Whether a new toolbox or product is included depends on the licence in use, so check the official Release Highlights and release notes, and campus licence coverage where applicable, before assuming a feature is available. The release notes remain the full record: MathWorks' blog notes it selected only nine favourites from hundreds of updates.

## Sources

- [MathWorks Introduces Release 2026b of MATLAB and Simulink — MathWorks](https://www.mathworks.com/company/newsroom/mathworks-introduces-release-2026b-of-matlab-and-simulink.html)
- [A look at some of what's new in MATLAB R2026b — MathWorks MATLAB Blog](https://blogs.mathworks.com/matlab/2026/10/01/a-look-at-some-of-whats-new-in-matlab-r2026b/)
