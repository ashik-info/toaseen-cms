import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, Inject } from '@angular/core';
import { AfterContentInit, Component, OnInit, Renderer2 } from '@angular/core';
import { CapService, ICap } from '../services/cap.service';
import { environment } from 'src/environments/environment';
import {
  ICapItem,
  IPlacedOrder,
  OrderService,
} from '../services/order.service';
import { IAccount } from '../services/account.service';
import { FacebookPixelService } from '../services/facebook-pixel.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { PlaceOrderDialogComponent } from './place-order-dialog.component';
import {
  isBrowser,
  isServer,
  TrackingService,
} from '../services/tracking.service';
interface ICapModel extends ICap {
  quantity: number;
  isSelectedItem: boolean;
}
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [FormsModule, CommonModule, PlaceOrderDialogComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit, AfterContentInit {
  isDialogVisible = false;
  dialogHeader = '';
  dialogMessage = '';
  dialogType: 'success' | 'error' = 'success';
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
    @Inject(PLATFORM_ID) private platformId: Object,
    private readonly capService: CapService,
    private readonly orderService: OrderService,
    private readonly tracking: TrackingService,
    private fbPixel: FacebookPixelService,
    private router: Router // private renderer: Renderer2, // @Inject(PLATFORM_ID) private platformId: object
  ) {}
  ngAfterContentInit(): void {
    // this.fbPixel.init();
  }
  ngOnInit(): void {
    if (isBrowser(this.platformId)) {
      this.tracking.pushEvent('pageView', {
        pagePath: window.location.pathname,
        pageTitle: document.title,
      });

      this.router.events
        .pipe(
          filter(
            (event): event is NavigationEnd => event instanceof NavigationEnd
          )
        )
        .subscribe((event) => {
          this.tracking.pushEvent('pageView', {
            pagePath: event.urlAfterRedirects,
            pageTitle: document.title,
          });
        });
    }

    if (isServer(this.platformId)) {
      // Example of deferred server-only logic like animation preload or SEO hints
      console.log(
        'Running on server, defer animations or load static previews'
      );
    }

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
  onCTAClick<T>(data: T) {
    this.tracking.pushEvent('ctaClick', { data });
  }

  onFormSubmit() {
    this.tracking.pushEvent('formSubmit', { formName: 'Contact Us' });
  }

  onUserLogin() {
    this.tracking.pushEvent('userLogin', { userType: 'Standard User' });
  }
  trackButtonClick() {
    // this.fbPixel.trackEvent('ButtonClick', { buttonId: 'cta-button' });
  }
  updateQuantity(index: number, change: number) {
    const qty = this.caps[index].quantity + change;
    this.caps[index].quantity = qty && qty > 0 ? qty : 0;
    this.caps[index].isSelectedItem = Boolean(qty && qty > 0);
    this.onCTAClick({
      id: this.caps[index].id,
      title: this.caps[index].title,
      quantity: this.caps[index].quantity,
      discountPrice: this.caps[index].discount_price,
    });
    this.calculateOrder();
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
      // alert('Please fill in all customer details.');
      // সতর্কবাণী
      // অনুগ্রহ করে আপনার নাম, যোগাযোগ নম্বর এবং শিপিং ঠিকানা পূরণ করুন।
      this.dialogHeader = 'Warning';
      this.dialogMessage = `Please fill your name, contact number and shipping address.`;
      this.dialogType = 'error';
      this.isDialogVisible = true;
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
      // alert('Please select at least one cap to place an order.');
      this.dialogHeader = 'Warning';
      this.dialogMessage = `Please select at least one cap to place an order.`;
      this.dialogType = 'error';
      this.isDialogVisible = true;
      return;
    }

    this.dialogHeader = 'Order Placed';
    this.dialogMessage = `Thank you, ${name}!\n\n${orderDetails}\n${this.summary}\nOrder placed successfully!`;
    this.dialogType = 'success';
    this.isDialogVisible = true;
    await this.orderService.placeOrder(consumer, cartItems, this.order);
    this.onCTAClick({
      label: 'Placed Order',
      data: consumer,
    });
  }
  title = 'toaseen-cms';
}
