/**
 * UET Peshawar departments, centres and programmes, grouped by campus.
 *
 * Source of truth: the official UET Peshawar campus pages
 * (uetpeshawar.edu.pk), each updated 8 January 2026:
 * - Peshawar Campus: /peshawar-campus/
 * - Abbottabad Campus: /abbottabad-campus/
 * - Bannu Campus: /bannu-campus/
 * - Jalozai Campus (Nowshera Campus): /jalozai-campus/
 *
 * Centres and programmes are listed separately from departments and are
 * never presented as departments. Degree, subject, fee, merit and seat
 * information is NOT included here: that is configurable Stage 3 data.
 * The overviews, focus areas and typical roles below are general
 * editorial descriptions of each field, not official UET statements.
 *
 * A discipline offered at more than one campus has one entry per campus,
 * so campus-specific pages keep distinct URLs.
 */
export type CampusName = "Peshawar" | "Abbottabad" | "Bannu" | "Jalozai (Nowshera)";

export type EntryKind = "department" | "centre" | "programme";

export interface Discipline {
  slug: string;
  name: string;
  campus: CampusName;
  kind: EntryKind;
  summary: string;
  overview: string;
  focusAreas: string[];
  typicalRoles: string[];
}

export const kindLabel: Record<EntryKind, string> = {
  department: "Department",
  centre: "Centre",
  programme: "Programme",
};

export const campuses: CampusName[] = ["Peshawar", "Abbottabad", "Bannu", "Jalozai (Nowshera)"];

export const disciplines: Discipline[] = [
  // ---- Peshawar Campus ----
  {
    slug: "electrical-peshawar",
    name: "Electrical Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Power systems, electronics, control and communications.",
    overview:
      "Electrical engineers work with the generation, transmission and use of electrical energy, as well as the electronic and control systems that make modern technology work.",
    focusAreas: ["Power systems", "Electronics", "Control systems", "Signal processing", "Renewable energy"],
    typicalRoles: ["Power engineer", "Electronics designer", "Control engineer", "Protection engineer"],
  },
  {
    slug: "mining-peshawar",
    name: "Mining Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Safe, efficient extraction of minerals and natural resources.",
    overview:
      "Mining engineers plan and manage the extraction of minerals while managing geotechnical risk, ventilation, safety and environmental impact.",
    focusAreas: ["Mine planning", "Rock mechanics", "Mine ventilation", "Mineral processing", "Mine safety"],
    typicalRoles: ["Mine planning engineer", "Production engineer", "Geotechnical engineer", "Safety officer"],
  },
  {
    slug: "computer-systems-peshawar",
    name: "Computer System Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Hardware, software and embedded systems that power computing.",
    overview:
      "This discipline spans computer architecture, embedded systems, networks and software engineering, connecting hardware with the software that runs on it.",
    focusAreas: ["Embedded systems", "Computer architecture", "Networks", "Software engineering", "Artificial intelligence"],
    typicalRoles: ["Software engineer", "Embedded engineer", "Network engineer", "Machine learning engineer"],
  },
  {
    slug: "industrial-peshawar",
    name: "Industrial Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Optimising processes, production systems, quality and safety.",
    overview:
      "Industrial engineers improve how systems of people, materials, information and equipment work together, focusing on efficiency, quality, safety and cost.",
    focusAreas: ["Production planning and control", "Operations research", "Simulation", "Quality engineering", "Ergonomics and safety"],
    typicalRoles: ["Production planner", "Quality engineer", "Process improvement analyst", "Supply chain analyst"],
  },
  {
    slug: "chemical-peshawar",
    name: "Chemical Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Turning raw materials into useful products through chemical processes.",
    overview:
      "Chemical engineers design and operate processes that transform materials and energy, from fuels and pharmaceuticals to food and advanced materials.",
    focusAreas: ["Process design", "Reaction engineering", "Mass and heat transfer", "Process control", "Process safety"],
    typicalRoles: ["Process engineer", "Plant operations engineer", "Safety engineer", "Research engineer"],
  },
  {
    slug: "mechanical-peshawar",
    name: "Mechanical Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Machines, energy systems, thermal-fluid processes and mechanical design.",
    overview:
      "Mechanical engineering applies mechanics, thermodynamics and materials science to design and improve machines and energy systems across nearly every industry.",
    focusAreas: ["Machine design", "Thermodynamics and heat transfer", "Fluid mechanics", "Manufacturing", "Mechatronics"],
    typicalRoles: ["Design engineer", "Maintenance engineer", "HVAC engineer", "Manufacturing engineer"],
  },
  {
    slug: "civil-peshawar",
    name: "Civil Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Design and construction of infrastructure such as buildings, bridges, roads and water systems.",
    overview:
      "Civil engineers plan, design and oversee the built environment. The field combines structural analysis, materials, geotechnics and project delivery to create safe, durable infrastructure.",
    focusAreas: ["Structural engineering", "Geotechnical engineering", "Transportation", "Water resources", "Construction management"],
    typicalRoles: ["Structural designer", "Site engineer", "Transportation planner", "Project engineer"],
  },
  {
    slug: "agricultural-peshawar",
    name: "Agricultural Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Engineering for farming: irrigation, machinery, soil and water, and food systems.",
    overview:
      "Agricultural engineers apply engineering to agriculture, working on irrigation and drainage, farm machinery, soil and water conservation, and the handling and processing of farm produce.",
    focusAreas: ["Irrigation and drainage", "Farm machinery", "Soil and water conservation", "Post-harvest processing", "Precision agriculture"],
    typicalRoles: ["Irrigation engineer", "Agricultural machinery engineer", "Soil and water engineer", "Food process engineer"],
  },
  {
    slug: "computer-science-peshawar",
    name: "Computer Science",
    campus: "Peshawar",
    kind: "department",
    summary: "Computing theory, software, data and intelligent systems.",
    overview:
      "Computer science covers algorithms, programming, data, networks and intelligent systems, and underpins the software used in almost every field of engineering and everyday life.",
    focusAreas: ["Algorithms and data structures", "Software development", "Databases", "Networks and security", "Artificial intelligence"],
    typicalRoles: ["Software developer", "Data scientist", "Systems analyst", "Security analyst"],
  },
  {
    slug: "mechatronics-peshawar",
    name: "Mechatronics Engineering",
    campus: "Peshawar",
    kind: "department",
    summary: "Mechanics, electronics, computing and control combined in smart machines.",
    overview:
      "Mechatronics brings together mechanical systems, electronics, computing and control to build automated and robotic systems, from industrial robots to smart devices.",
    focusAreas: ["Robotics", "Embedded control", "Sensors and actuators", "Automation", "Machine vision"],
    typicalRoles: ["Automation engineer", "Robotics engineer", "Controls engineer", "Embedded systems engineer"],
  },
  {
    slug: "architecture-peshawar",
    name: "Architecture",
    campus: "Peshawar",
    kind: "department",
    summary: "Designing buildings and spaces that are functional, safe and inspiring.",
    overview:
      "Architecture combines design, technology and an understanding of people and place to shape buildings and the spaces between them, balancing beauty, function and sustainability.",
    focusAreas: ["Architectural design", "Building technology", "Urban design", "Sustainable design", "History and theory"],
    typicalRoles: ["Architect", "Urban designer", "Interior designer", "Building information modelling specialist"],
  },
  {
    slug: "uspcase-peshawar",
    name: "US-Pakistan Center for Advanced Studies in Energy (USPCAS-E)",
    campus: "Peshawar",
    kind: "centre",
    summary: "A research centre for advanced studies in energy systems and sustainability.",
    overview:
      "USPCAS-E is a dedicated centre for advanced study and research in energy, supporting work on power, renewable energy and energy policy alongside partner universities and industry.",
    focusAreas: ["Renewable energy", "Power and energy systems", "Energy policy and management", "Energy efficiency", "Applied energy research"],
    typicalRoles: ["Energy researcher", "Renewable energy analyst", "Energy systems engineer", "Policy researcher"],
  },
  {
    slug: "niuip-peshawar",
    name: "National Institute of Urban Infrastructure Planning (NIUIP)",
    campus: "Peshawar",
    kind: "centre",
    summary: "An institute for urban infrastructure planning and development research.",
    overview:
      "NIUIP works on the planning of urban infrastructure, bringing together engineering, planning and policy to support cities that grow in a planned and sustainable way.",
    focusAreas: ["Urban planning", "Infrastructure systems", "Transport planning", "Water and sanitation planning", "Urban policy"],
    typicalRoles: ["Urban planner", "Infrastructure planner", "Transport planner", "Development researcher"],
  },
  {
    slug: "software-engineering-peshawar",
    name: "Software Engineering",
    campus: "Peshawar",
    kind: "programme",
    summary: "Building reliable software through disciplined design, testing and teamwork.",
    overview:
      "Software engineering applies engineering discipline to software: requirements, design, construction, testing and maintenance, so that large systems are built reliably and kept working over time.",
    focusAreas: ["Software design and architecture", "Testing and quality assurance", "Web and mobile development", "Databases", "Project management"],
    typicalRoles: ["Software engineer", "Quality assurance engineer", "Web developer", "DevOps engineer"],
  },
  {
    slug: "artificial-intelligence-peshawar",
    name: "Artificial Intelligence",
    campus: "Peshawar",
    kind: "programme",
    summary: "Machines that learn from data: machine learning, language, vision and robotics.",
    overview:
      "Artificial intelligence studies how computers can learn from data and perform tasks such as understanding language, recognising images and making decisions, with applications across engineering, health, agriculture and industry.",
    focusAreas: ["Machine learning", "Deep learning", "Natural language processing", "Computer vision", "Data science"],
    typicalRoles: ["Machine learning engineer", "Data scientist", "AI researcher", "Computer vision engineer"],
  },
  {
    slug: "cyber-security-peshawar",
    name: "Cyber Security",
    campus: "Peshawar",
    kind: "programme",
    summary: "Protecting systems, networks and data from attack and misuse.",
    overview:
      "Cyber security covers the protection of computers, networks and data: understanding threats, building defences, detecting attacks and responding when systems are compromised.",
    focusAreas: ["Network security", "Cryptography", "Ethical hacking and penetration testing", "Digital forensics", "Security governance"],
    typicalRoles: ["Security analyst", "Penetration tester", "Security engineer", "Incident responder"],
  },
  // ---- Abbottabad Campus ----
  {
    slug: "electronics-abbottabad",
    name: "Electronics Engineering",
    campus: "Abbottabad",
    kind: "department",
    summary: "Electronic circuits, devices, embedded systems and communications.",
    overview:
      "Electronics engineering covers the design of circuits and devices that sense, process and communicate information, from everyday gadgets to industrial and medical equipment.",
    focusAreas: ["Electronic circuits", "Digital systems", "Embedded systems", "Communication systems", "Signal processing"],
    typicalRoles: ["Electronics design engineer", "Embedded engineer", "Telecom engineer", "Test engineer"],
  },
  {
    slug: "architecture-crp-abbottabad",
    name: "Architecture, City & Regional Planning",
    campus: "Abbottabad",
    kind: "department",
    summary: "Architecture and the planning of cities and regions at every scale.",
    overview:
      "This department combines architecture with city and regional planning, covering the design of buildings together with the planning of neighbourhoods, cities and regions.",
    focusAreas: ["Architectural design", "City planning", "Regional planning", "Urban design", "Sustainable development"],
    typicalRoles: ["Architect", "City planner", "Regional planner", "Urban designer"],
  },
  {
    slug: "computer-science-abbottabad",
    name: "Computer Science",
    campus: "Abbottabad",
    kind: "department",
    summary: "Computing theory, software, data and intelligent systems.",
    overview:
      "Computer science covers algorithms, programming, data, networks and intelligent systems, and underpins the software used in almost every field of engineering and everyday life.",
    focusAreas: ["Algorithms and data structures", "Software development", "Databases", "Networks and security", "Artificial intelligence"],
    typicalRoles: ["Software developer", "Data scientist", "Systems analyst", "Security analyst"],
  },
  {
    slug: "software-engineering-abbottabad",
    name: "Software Engineering",
    campus: "Abbottabad",
    kind: "programme",
    summary: "Building reliable software through disciplined design, testing and teamwork.",
    overview:
      "Software engineering applies engineering discipline to software: requirements, design, construction, testing and maintenance, so that large systems are built reliably and kept working over time.",
    focusAreas: ["Software design and architecture", "Testing and quality assurance", "Web and mobile development", "Databases", "Project management"],
    typicalRoles: ["Software engineer", "Quality assurance engineer", "Web developer", "DevOps engineer"],
  },
  // ---- Bannu Campus ----
  {
    slug: "electrical-bannu",
    name: "Electrical Engineering",
    campus: "Bannu",
    kind: "department",
    summary: "Power systems, electronics, control and communications.",
    overview:
      "Electrical engineers work with the generation, transmission and use of electrical energy, as well as the electronic and control systems that make modern technology work.",
    focusAreas: ["Power systems", "Electronics", "Control systems", "Signal processing", "Renewable energy"],
    typicalRoles: ["Power engineer", "Electronics designer", "Control engineer", "Protection engineer"],
  },
  {
    slug: "civil-bannu",
    name: "Civil Engineering",
    campus: "Bannu",
    kind: "department",
    summary: "Design and construction of infrastructure such as buildings, bridges, roads and water systems.",
    overview:
      "Civil engineers plan, design and oversee the built environment. The field combines structural analysis, materials, geotechnics and project delivery to create safe, durable infrastructure.",
    focusAreas: ["Structural engineering", "Geotechnical engineering", "Transportation", "Water resources", "Construction management"],
    typicalRoles: ["Structural designer", "Site engineer", "Transportation planner", "Project engineer"],
  },
  {
    slug: "computer-science-bannu",
    name: "Computer Science",
    campus: "Bannu",
    kind: "department",
    summary: "Computing theory, software, data and intelligent systems.",
    overview:
      "Computer science covers algorithms, programming, data, networks and intelligent systems, and underpins the software used in almost every field of engineering and everyday life.",
    focusAreas: ["Algorithms and data structures", "Software development", "Databases", "Networks and security", "Artificial intelligence"],
    typicalRoles: ["Software developer", "Data scientist", "Systems analyst", "Security analyst"],
  },
  {
    slug: "artificial-intelligence-bannu",
    name: "Artificial Intelligence",
    campus: "Bannu",
    kind: "programme",
    summary: "Machines that learn from data: machine learning, language, vision and robotics.",
    overview:
      "Artificial intelligence studies how computers can learn from data and perform tasks such as understanding language, recognising images and making decisions, with applications across engineering, health, agriculture and industry.",
    focusAreas: ["Machine learning", "Deep learning", "Natural language processing", "Computer vision", "Data science"],
    typicalRoles: ["Machine learning engineer", "Data scientist", "AI researcher", "Computer vision engineer"],
  },
  // ---- Jalozai Campus (Nowshera Campus) ----
  {
    slug: "electrical-jalozai",
    name: "Electrical Engineering",
    campus: "Jalozai (Nowshera)",
    kind: "department",
    summary: "Power systems, electronics, control and communications.",
    overview:
      "Electrical engineers work with the generation, transmission and use of electrical energy, as well as the electronic and control systems that make modern technology work.",
    focusAreas: ["Power systems", "Electronics", "Control systems", "Signal processing", "Renewable energy"],
    typicalRoles: ["Power engineer", "Electronics designer", "Control engineer", "Protection engineer"],
  },
  {
    slug: "civil-jalozai",
    name: "Civil Engineering",
    campus: "Jalozai (Nowshera)",
    kind: "department",
    summary: "Design and construction of infrastructure such as buildings, bridges, roads and water systems.",
    overview:
      "Civil engineers plan, design and oversee the built environment. The field combines structural analysis, materials, geotechnics and project delivery to create safe, durable infrastructure.",
    focusAreas: ["Structural engineering", "Geotechnical engineering", "Transportation", "Water resources", "Construction management"],
    typicalRoles: ["Structural designer", "Site engineer", "Transportation planner", "Project engineer"],
  },
  {
    slug: "mechanical-jalozai",
    name: "Mechanical Engineering",
    campus: "Jalozai (Nowshera)",
    kind: "department",
    summary: "Machines, energy systems, thermal-fluid processes and mechanical design.",
    overview:
      "Mechanical engineering applies mechanics, thermodynamics and materials science to design and improve machines and energy systems across nearly every industry.",
    focusAreas: ["Machine design", "Thermodynamics and heat transfer", "Fluid mechanics", "Manufacturing", "Mechatronics"],
    typicalRoles: ["Design engineer", "Maintenance engineer", "HVAC engineer", "Manufacturing engineer"],
  },
  {
    slug: "industrial-jalozai",
    name: "Industrial Engineering",
    campus: "Jalozai (Nowshera)",
    kind: "department",
    summary: "Optimising processes, production systems, quality and safety.",
    overview:
      "Industrial engineers improve how systems of people, materials, information and equipment work together, focusing on efficiency, quality, safety and cost.",
    focusAreas: ["Production planning and control", "Operations research", "Simulation", "Quality engineering", "Ergonomics and safety"],
    typicalRoles: ["Production planner", "Quality engineer", "Process improvement analyst", "Supply chain analyst"],
  },
  {
    slug: "computer-science-jalozai",
    name: "Computer Science",
    campus: "Jalozai (Nowshera)",
    kind: "department",
    summary: "Computing theory, software, data and intelligent systems.",
    overview:
      "Computer science covers algorithms, programming, data, networks and intelligent systems, and underpins the software used in almost every field of engineering and everyday life.",
    focusAreas: ["Algorithms and data structures", "Software development", "Databases", "Networks and security", "Artificial intelligence"],
    typicalRoles: ["Software developer", "Data scientist", "Systems analyst", "Security analyst"],
  },
];

export const getDiscipline = (slug: string) => disciplines.find((d) => d.slug === slug);

export const disciplinesByCampus = (campus: CampusName) =>
  disciplines.filter((d) => d.campus === campus);
