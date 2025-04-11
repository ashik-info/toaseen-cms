// src/app/services/facebook-pixel.service.ts
import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FacebookPixelService {
  private initialized = false;
  public readonly pixelId = '2011811352558660'; // Replace with your actual Pixel ID
  private loaded = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  init(pixelId: string): void {
    if (!this.isBrowser || this.loaded) return;
    this.loaded = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    (window as any).fbq = function (...args: any[]) {
      (window as any).fbq.callMethod
        ? (window as any).fbq.callMethod.apply(window.fbq, args)
        : (window as any).fbq.queue.push(args);
    };

    (window as any).fbq.push = (window as any).fbq;
    (window as any).fbq.loaded = true;
    (window as any).fbq.version = '2.0';
    (window as any).fbq.queue = [];

    (window as any).fbq('init', pixelId);
    (window as any).fbq('track', 'PageView');
  }

  track(event: string, data?: Record<string, any>) {
    if (this.isBrowser && (window as any).fbq) {
      (window as any).fbq('track', event, data || {});
    }
  }

  injectNoScript(pixelId: string) {
    if (!this.isBrowser) return;

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <img height="1" width="1" style="display:none"
      src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/>`;
    document.body.appendChild(noscript);
  }
  // constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // async init(): Promise<void> {
  //   if (
  //     this.initialized ||
  //     !this.pixelId ||
  //     !isPlatformBrowser(this.platformId)
  //   ) {
  //     return;
  //   }

  //   this.initializeFBQ();
  //   await this.loadScript();
  // }

  // private initializeFBQ(): void {
  //   window.fbq =
  //     window.fbq ||
  //     function () {
  //       if (!window._fbq) window._fbq = window.fbq;
  //       if (window.fbq!.callMethod) {
  //         window.fbq!.callMethod.apply(window.fbq, arguments);
  //       } else {
  //         (window.fbq!.queue = window.fbq!.queue || []).push(arguments);
  //       }
  //     };
  //   window.fbq.push = window.fbq.push || function () {};
  //   window.fbq.loaded = true;
  //   window.fbq.version = '2.0';
  //   window.fbq.queue = [];
  // }
  //   private loadScript() {
  //     if (!isPlatformBrowser(this.platformId)) return;

  //     const injectTo = document.head || document.body;

  //     if (!injectTo) {
  //       console.warn('No DOM injection point available');
  //       return;
  //     }

  //     const script = document.createElement('script');
  //     script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  //     script.onload = () => this.initializeFBQ();
  //     script.onerror = () => this.handleLoadError();

  //     injectTo.appendChild(script);
  //   }

  //   private handleLoadError() {
  //     console.warn('FB Pixel blocked, using fallback');
  //     // Alternative tracking method here
  //   }
  // private async loadScript(): Promise<void> {
  //   const script = document.createElement('script');
  //   console.log(script);
  //   script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  //   // script.async = true;
  //   // script.defer = true;
  //   script.onload = () => {
  //     window.fbq!('init', this.pixelId);
  //     window.fbq!('track', 'PageView');
  //     this.initialized = true;
  //   };
  //   script.onerror = (e) =>
  //     console.warn('Facebook Pixel failed to load test', e);
  //   // this.initializeFBQ();
  //   console.log(script);
  //   document.head.appendChild(script);
  // }

  // trackEvent(eventName: string, data?: Record<string, any>): void {
  //   console.debug(eventName, data);
  //   if (isPlatformBrowser(this.platformId) && window.fbq) {
  //     window.fbq('track', eventName, data);
  //   }
  // }
}
