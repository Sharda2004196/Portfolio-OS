// Next.js only ships ambient declarations for CSS *modules* (`*.module.css`),
// not for plain global stylesheets. This declaration lets TypeScript accept the
// side-effect import of `./globals.css` (fixes TS2882 / noUncheckedSideEffectImports).
declare module '*.css';
