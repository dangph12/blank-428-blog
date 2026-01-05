declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    ticks?: number;
    gravity?: number;
    scalar?: number;
    startVelocity?: number;
    decay?: number;
    angle?: number;
  }

  function confetti(options?: ConfettiOptions): void;

  export default confetti;
}

declare module 'pace-js' {
  interface PaceOptions {
    restartOnPushState?: boolean;
    restartOnRequestAfter?: boolean;
  }

  interface PaceSource {
    elements?: any[];
  }

  interface Pace {
    start(options?: PaceOptions): void;
    stop(): void;
    restart(): void;
    on(event: string, callback: () => void): void;
    sources?: PaceSource[];
  }

  const Pace: Pace;
  export default Pace;
}

declare module 'lazysizes' {
  export interface LazySizesConfig {
    lazyClass?: string;
    loadingClass?: string;
    loadedClass?: string;
  }

  export interface LazySizes {
    cfg?: LazySizesConfig;
  }

  const lazySizes: any;
  export default lazySizes;
}

interface Window {
  lazySizes?: {
    cfg?: {
      lazyClass?: string;
      loadingClass?: string;
      loadedClass?: string;
    };
  };
}
