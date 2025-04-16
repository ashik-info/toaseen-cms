import {
  AfterContentInit,
  Component,
  Inject,
  OnInit,
  PLATFORM_ID,
  Renderer2,
} from '@angular/core';
import { CapService, ICap } from '../services/cap.service';
import { environment } from 'src/environments/environment';
import {
  ICapItem,
  IPlacedOrder,
  OrderService,
} from '../services/order.service';
import { IAccount } from '../services/account.service';
import { FacebookPixelService } from '../services/facebook-pixel.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
interface ICapModel extends ICap {
  quantity: number;
  isSelectedItem: boolean;
}
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit, AfterContentInit {
  public caps: Array<ICapModel> = [];
  public fileUrl: string = environment.FILE_URL;
  public regularPrice = 300;
  public discountPrice = 250;
  isOpen: boolean = false;
  capsTotal = 0;
  deliveryCharge = 0;
  city = 'Outside';
  totalOrder = 0;
  products: { name: string; price: number }[] = [];
  capsData: Array<any> = [];
  galleryImages: Array<string> = [];
  constructor(
    private readonly capService: CapService,
    private readonly orderService: OrderService,
    private fbPixel: FacebookPixelService,
    private router: Router // private renderer: Renderer2, // @Inject(PLATFORM_ID) private platformId: object
  ) {}
  ngAfterContentInit(): void {
    // this.fbPixel.init();
  }
  ngOnInit(): void {
    this.fbPixel.init(this.fbPixel.pixelId);
    this.fbPixel.injectNoScript(this.fbPixel.pixelId);

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.fbPixel.track('PageView'));

    // if (isPlatformBrowser(this.platformId)) {
    //   // this.pixel.init('252558660');

    //   const noscript = this.renderer.createElement('noscript');
    //   noscript.innerHTML = `
    //     <img height="1" width="1" style="display:none"
    //       src="https://www.facebook.com/tr?id=${this.fbPixel.pixelId}&ev=PageView&noscript=1" />
    //   `;
    //   this.renderer.appendChild(document.body, noscript);
    // }
    // const noscript = this.renderer.createElement('noscript');
    // noscript.innerHTML = `
    //   <img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${this.fbPixel.pixelId}&ev=PageView&noscript=1" />
    // `;
    // this.renderer.appendChild(document.body, noscript);
    this.capService.getCaps().then(
      (res) =>
        (this.caps = res.items.map((item) => {
          // const data: ICapModel =
          return {
            ...item,
            image: `${this.fileUrl}${item.collectionId}/${item.id}/${item.image}`,
            quantity: 0,
            isSelectedItem: false,
          };
        }))
    );
    this.capService
      .getCapGallery()
      .then(
        (res) =>
          (this.galleryImages = res.items.map((item) =>
            item.images.map(
              (img) => `${this.fileUrl}${item.collectionId}/${item.id}/${img}`
            )
          )[0])
      );
  }
  trackButtonClick() {
    // this.fbPixel.trackEvent('ButtonClick', { buttonId: 'cta-button' });
  }
  updateQuantity(index: number, change: number) {
    const qty = this.caps[index].quantity + change;
    this.caps[index].quantity = qty && qty > 0 ? qty : 0;
    this.caps[index].isSelectedItem = Boolean(qty && qty > 0);
    this.calculateOrder();
    // console.log(
    //   this.caps.map((i) => ({ qty: i.quantity, select: i.isSelectedItem }))
    // );
  }

  get totalPrice(): number {
    return this.totalOrder;
  }

  closeModal() {
    this.isOpen = false;
  }

  selectCity(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.city = target.value;
    this.calculateOrder();
    // console.log('Selected City:', this.city);
  }
  getTotalCaps() {
    return this.caps
      .filter((i) => i.isSelectedItem)
      .map((c) => c.quantity)
      .reduce((a, b) => a + b, 0);
  }
  calculateOrder() {
    this.capsTotal = this.getTotalCaps() * this.discountPrice;
    if (this.getTotalCaps() >= 5) {
      this.deliveryCharge = 0;
    } else if (this.getTotalCaps() >= 3 && this.getTotalCaps() < 5) {
      this.deliveryCharge = 40;
    } else {
      if (this.city === 'Dhaka') {
        this.deliveryCharge = 70;
      } else if (this.city === 'Faridpur') {
        this.deliveryCharge = 60;
      } else if (this.city === 'Outside') {
        this.deliveryCharge = 100;
      }
    }

    this.totalOrder = this.capsTotal + this.deliveryCharge;
  }
  name = '';
  mobile = '';
  address = '';
  summary = '';
  order: IPlacedOrder = {
    consumer_id: '',
    order_items: [],
    total: 0,
    shipping_charge: 0,
    grand_total: 0,
  };
  cap_item: ICapItem = {
    quantity: 0,
    sale_price: 0,
    cap_id: '',
    product_name: '',
    image_url: '',
  };
  async placeOrder($event: Event) {
    // console.debug($event);
    // this.router.navigateByUrl('/invoice');
    this.fbPixel.track('track', $event);
    this.trackButtonClick();
    if (!this.name || !this.mobile || !this.address) {
      alert('Please fill in all customer details.');
      return;
    }
    let consumer: IAccount = {
      user_name: this.name,
      contact_number: this.mobile,
      shipping_address: this.address,
    };
    let selectedCaps = 0;
    let cartItems: ICapItem[] = [];
    let orderDetails = 'Order Details:\n';

    this.caps.forEach((cap, index) => {
      if (cap.isSelectedItem) {
        let qty = cap.quantity;
        cartItems.push({
          product_name: cap.title,
          cap_id: cap.id,
          quantity: qty,
          image_url: cap.image,
          sale_price: cap.discount_price,
        });
        selectedCaps += qty;
        orderDetails += `${cap.title}: ${qty} piece(s)\n`;
      }
    });
    this.order.total = this.capsTotal;
    this.order.shipping_charge = this.deliveryCharge;
    this.order.grand_total = this.totalOrder;
    // console.log(this.order, cartItems, consumer);

    if (selectedCaps === 0) {
      alert('Please select at least one cap to place an order.');
      return;
    }

    alert(
      `Thank you ${name}!\n\n${orderDetails}\n${this.summary}\nOrder placed successfully!`
    );
    this.orderService.placedOrder(consumer, cartItems, this.order);
  }
  title = 'toaseen-cms';
}
