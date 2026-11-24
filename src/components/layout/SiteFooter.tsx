import { Container } from "./Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <Container className="flex flex-col gap-3 py-8 text-sm text-muted md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} All-Encompassing Global Consult Limited</p>
        <p className="max-w-[52ch]">Course results are comparisons, not admission or visa decisions. Universities make their own decisions.</p>
      </Container>
    </footer>
  );
}
