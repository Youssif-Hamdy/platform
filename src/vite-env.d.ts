/// <reference types="vite/client" />

// Ambient module declarations for Atropos (no bundled TS types)
declare module 'atropos/react' {
  import type { ComponentType } from 'react';
  const Atropos: ComponentType<any>;
  export default Atropos;
}

declare module 'atropos/css';
