import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { campuses, kindLabel, type CampusName, type Discipline } from "@/lib/disciplines";
import { getDisciplines } from "@/lib/structure";

// Reads from Supabase when configured, so this route must not be
// prerendered under cacheComponents.
export const instant = false;

export const metadata: Metadata = {
  title: "Engineering Disciplines",
  description: "All UET Peshawar departments, centres and programmes, grouped by campus: Peshawar, Abbottabad, Bannu and Jalozai (Nowshera). Explore each field, its focus areas and typical career roles.",
  alternates: { canonical: "https://engineeringverse.me/disciplines" },
};

export default async function DisciplinesPage() {
  const all = await getDisciplines();
  const byCampus = (campus: CampusName): Discipline[] =>
    all.filter((d) => d.campus === campus);
  const shownCampuses = campuses.filter((c) => byCampus(c).length > 0);
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Engineering Disciplines</h1>
      <p className="mt-3 max-w-2xl text-muted">Departments, centres and programmes of UET Peshawar, grouped by campus. Each entry explains what the field covers and where it can take you. Centres and programmes are labelled as such and are not departments.</p>
      {shownCampuses.map((campus) => (
        <section key={campus} aria-labelledby={`campus-${campus}`} className="mt-12">
          <h2 id={`campus-${campus}`} className="text-2xl font-bold tracking-tight">{campus} Campus</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {byCampus(campus).map((d) => (
              <li key={d.slug}>
                <Link href={`/disciplines/${d.slug}`} className="flex h-full flex-col rounded-xl border border-line bg-surface p-6 transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{kindLabel[d.kind]}</p>
                  <h3 className="mt-1 text-lg font-semibold">{d.name}</h3>
                  <p className="mt-2 flex-1 text-sm text-muted">{d.summary}</p>
                  <span className="mt-4 text-sm font-semibold text-brand-700">Learn more →</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </Container>
  );
}
