import Header from "./Header";
import Footer from "./Footer";

interface StaticPageProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function StaticPage({
  eyebrow = "Words",
  title,
  subtitle,
  children,
}: StaticPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12 md:py-16">
        <div className="animate-fade-in">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent-custom">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/60">
              {subtitle}
            </p>
          )}

          <div className="mt-10 space-y-6 text-sm leading-relaxed text-foreground/80">
            {children}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
