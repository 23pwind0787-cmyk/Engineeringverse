export const siteConfig = {
  name: "EngineeringVerse",
  tagline: "Learn. Build. Innovate. Share.",
  description:
    "EngineeringVerse connects engineering minds through knowledge, creativity and innovation — departments, academic resources, innovative projects, seminars and engineering software news.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

/** Main navigation, per the redesign brief. Past papers no longer have
// a standalone nav item — they live inside their department pages. */
export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Departments", href: "/disciplines" },
  { label: "Projects & FYPs", href: "/projects" },
  { label: "Seminars & Events", href: "/seminars" },
  { label: "Software & News", href: "/blog" },
  { label: "Community", href: "/community" },
  { label: "Upload Resources", href: "/upload" },
  { label: "About Us", href: "/about" },
];
