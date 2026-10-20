type RouteLoadingProps = {
  variant?: "page" | "form" | "dashboard";
};

function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-lg bg-white/10 ${className}`} />;
}

export default function RouteLoading({ variant = "page" }: RouteLoadingProps) {
  if (variant === "dashboard") {
    return (
      <main aria-busy="true" aria-label="Loading dashboard" className="min-h-screen bg-background p-4 text-white sm:p-6">
        <div className="mx-auto grid max-w-[1800px] gap-4 lg:grid-cols-[15%_minmax(0,1fr)_25%]">
          <Skeleton className="hidden min-h-[calc(100vh-3rem)] lg:block" />
          <section className="space-y-4 py-2">
            <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-72 max-w-full" /></div>
            <Skeleton className="h-12 w-full" />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton className="h-28" key={index} />)}</div>
            <div className="grid gap-4 xl:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
            <Skeleton className="h-64" />
          </section>
          <Skeleton className="hidden min-h-[calc(100vh-3rem)] lg:block" />
        </div>
      </main>
    );
  }

  if (variant === "form") {
    return (
      <main aria-busy="true" aria-label="Loading page" className="grid min-h-[70vh] place-items-center bg-background px-4 py-12 text-white">
        <section className="w-full max-w-2xl space-y-5 rounded-2xl border border-white/10 bg-secondary/40 p-6 sm:p-8">
          <div className="space-y-2"><Skeleton className="h-3 w-28" /><Skeleton className="h-8 w-60 max-w-full" /><Skeleton className="h-4 w-full max-w-lg" /></div>
          <div className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <Skeleton className="h-12" key={index} />)}</div>
          <Skeleton className="h-12 w-40" />
        </section>
      </main>
    );
  }

  return (
    <main aria-busy="true" aria-label="Loading page" className="min-h-screen bg-background px-5 py-24 text-white">
      <section className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-12 w-52" />
        <Skeleton className="h-[28rem] w-full rounded-2xl" />
        <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton className="h-32" key={index} />)}</div>
      </section>
    </main>
  );
}
