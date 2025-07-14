"use client";

export function FontStyles() {
  return (
    <>
      <style jsx global>{`
        body {
          font-family:
            var(--font-geist-sans),
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            sans-serif;
        }

        code,
        pre,
        kbd,
        samp {
          font-family:
            var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono",
            Consolas, "Liberation Mono", Menlo, monospace;
        }
      `}</style>
    </>
  );
}
