// src/global.d.ts
interface Window {
    fbq?: {
      (cmd: 'init', pixelId: string): void;
      (cmd: 'track', eventName: string, options?: Record<string, any>): void;
    //   (cmd: 'trackCustom', customEventName: string, options?: Record<string, any>): void;
      callMethod?: Function;
      queue?: any[];
      loaded?: boolean;
      version?: string;
      push?: Function;
      _fbq?: any;
    };
    _fbq?: any;
  }