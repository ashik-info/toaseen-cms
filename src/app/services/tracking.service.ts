import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';

export function isBrowser(platformId: Object): boolean {
  return isPlatformBrowser(platformId);
}

export function isServer(platformId: Object): boolean {
  return isPlatformServer(platformId);
}
export function getPlatformName(platformId: Object): 'browser' | 'server' {
  if (isPlatformBrowser(platformId)) return 'browser';
  return 'server'; // fallback to server for safety
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  private logEvent(label: string, payload: any) {
    if (!environment.PRODUCTION) {
      console.log(`[Tracking] ${label}`, payload);
    }
  }

  injectPixel(pixelId: string): void {
    if (isPlatformServer(this.platformId)) {
      const libScript = this.document.createElement('script');
      libScript.type = 'text/javascript';
      libScript.async = true;
      libScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      this.document.head.appendChild(libScript);

      const inlineScript = this.document.createElement('script');
      inlineScript.type = 'text/javascript';
      inlineScript.text = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];fbq('init', '${pixelId}');fbq('track', 'PageView');
      `;
      libScript.onload = () => this.document.head.appendChild(inlineScript);
    }
  }

  injectGTM(gtmId: string): void {
    if (isPlatformServer(this.platformId)) {
      const gtmScript = this.document.createElement('script');
      gtmScript.type = 'text/javascript';
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      this.document.head.appendChild(gtmScript);
    }
  }

  injectGTMNoScript(gtmId: string): void {
    if (isPlatformServer(this.platformId)) {
      const noscript = this.document.createElement('noscript');
      noscript.innerHTML = `
        <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
        height="0" width="0" style="display:none;visibility:hidden"></iframe>
      `;
      this.document.body.appendChild(noscript);
    }
  }

  pushEvent(event: string, data: Record<string, any> = {}): void {
    if (typeof window !== 'undefined') {
      (window as any).dataLayer = (window as any).dataLayer || [];
      const eventPayload = { event, ...data };
      window.dataLayer.push(eventPayload);
      this.logEvent(event, eventPayload);
    }
  }
}
