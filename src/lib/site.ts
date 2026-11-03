export const siteConfig = {
  name: "EngineeringVerse",
  tagline: "Explore Engineering. Master Technology. Build Your Future.",
  description:
    "EngineeringVerse is a worldwide hub for engineering students, graduates, engineers, researchers, freelancers and technology enthusiasts: disciplines, software, AI tools, learning resources, careers and past papers.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export type SectionKey =
  | "disciplines"
  | "software"
  | "ai-tools"
  | "learning"
  | "projects"
  | "careers"
  | "blog"
  | "past-papers";

export interface SiteSection {
  key: SectionKey;
  label: string;
  href: string;
  blurb: string;
  /** Short symbol shown on cards. Plain text avoids an icon dependency. */
  glyph: string;
  /** Which development stage delivers the full feature. */
  stage: number;
}

export const sections: SiteSection[] = [
  { key: "disciplines", label: "Engineering Disciplines", href: "/disciplines", blurb: "Understand each branch of engineering, what it covers and where it leads.", glyph: "⚙", stage: 1 },
  { key: "software", label: "Software Directory", href: "/software", blurb: "A curated directory of engineering software, organised by discipline.", glyph: "▦", stage: 6 },
  { key: "ai-tools", label: "AI Tools", href: "/ai-tools", blurb: "AI tools that help with research, design, coding and productivity.", glyph: "✦", stage: 6 },
  { key: "learning", label: "Learning Resources", href: "/learning", blurb: "Courses, references and study material to build real skills.", glyph: "▤", stage: 6 },
  { key: "projects", label: "Projects & Innovations", href: "/projects", blurb: "Showcase and discover engineering projects and new ideas.", glyph: "◈", stage: 6 },
  { key: "careers", label: "Engineering Careers", href: "/careers", blurb: "Career paths, skills and guidance for students and professionals.", glyph: "↗", stage: 6 },
  { key: "blog", label: "Engineering Blog", href: "/blog", blurb: "Articles and guides from the engineering community.", glyph: "✎", stage: 6 },
  { key: "past-papers", label: "UET Peshawar Past Papers", href: "/past-papers", blurb: "Search, preview and download past papers. Students can contribute their own.", glyph: "▣", stage: 4 },
];

export const navItems = [
  { label: "Home", href: "/" },
  ...sections.map((s) => ({
    label: s.key === "past-papers" ? "Past Papers" : s.label.replace("Engineering ", "").replace(" & Innovations", ""),
    href: s.href,
  })),
];
