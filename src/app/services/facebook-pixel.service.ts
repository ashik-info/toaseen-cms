import { Injectable, Inject, PLATFORM_ID, inject } from '@angular/core';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class FacebookPixelService {
  private initialized = false;
  public readonly googleTagManagerID = environment.GOOGLE_TAG_MANAGER_ID;
  public readonly pixelId = '2011811352558660'; // Replace with your actual Pixel ID
  private loaded = false;
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}
  track(event: string, data?: Record<string, any>) {
    if (this.isBrowser && (window as any).fbq) {
      (window as any).fbq('track', event, data || {});
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
}
