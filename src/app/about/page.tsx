import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "EngineeringVerse is an independent student-run platform where engineering students learn, share, innovate, connect and grow.",
  alternates: { canonical: "https://engineeringverse.me/about" },
};

const pillars = [
  { title: "Learn", text: "Access books, past papers, notes and academic resources." },
  { title: "Share", text: "Upload OELs, lab reports, assignments and useful study material." },
  { title: "Innovate", text: "Showcase innovative projects, FYPs and research." },
  { title: "Connect", text: "Discover seminars, workshops and engineering events." },
  { title: "Grow", text: "Explore engineering software, new technologies and industry developments." },
];

export default function AboutPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">About Us</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        EngineeringVerse is an independent student-run platform for engineering students — a place to
        find, share, upload and access academic resources, projects, research and engineering knowledge.
      </p>
      <p className="mt-4 max-w-2xl text-muted">
        It started with UET Peshawar past papers and departments, and is growing into a central platform
        for engineering students across Pakistan and beyond.
      </p>

      <h2 className="mt-10 text-2xl font-bold tracking-tight">What we stand for</h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pillars.map((p) => (
          <li key={p.title} className="rounded-xl border border-line bg-surface p-5">
            <h3 className="font-semibold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.text}</p>
          </li>
        ))}
      </ul>

      <p className="mt-10 text-sm text-muted">
        EngineeringVerse is an independent project and is not officially affiliated with any university.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link href="/disciplines" className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Explore departments</Link>
        <Link href="/upload" className="rounded-lg border border-line bg-surface px-6 py-3 text-sm font-semibold hover:border-brand-500">Upload resources</Link>
      </div>
    </Container>
  );
}
