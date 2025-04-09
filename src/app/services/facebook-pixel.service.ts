// src/app/services/facebook-pixel.service.ts
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class FacebookPixelService {
  private initialized = false;
  private readonly pixelId = '2011811352558660'; // Replace with your actual Pixel ID

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  init(): void {
    if (this.initialized || !this.pixelId || !isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.initializeFBQ();
    this.loadScript();
  }

  private initializeFBQ(): void {
    window.fbq = window.fbq || function() {
      if (!window._fbq) window._fbq = window.fbq;
      if (window.fbq!.callMethod) {
        window.fbq!.callMethod.apply(window.fbq, arguments);
      } else {
        (window.fbq!.queue = window.fbq!.queue || []).push(arguments);
      }
    };
    window.fbq.push = window.fbq.push || function() {};
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];
  }

  private loadScript(): void {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.fbq!('init', this.pixelId);
      window.fbq!('track', 'PageView');
      this.initialized = true;
    };
    script.onerror = () => console.warn('Facebook Pixel failed to load test');
    document.head.appendChild(script);
  }

  trackEvent(eventName: string, data?: Record<string, any>): void {
    console.debug(eventName, data)
    if (isPlatformBrowser(this.platformId) && window.fbq) {
      window.fbq('track', eventName, data);
    }
  }
}