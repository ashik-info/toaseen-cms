import { Component, OnInit } from '@angular/core';
import { CapService, ICap } from './services/cap.service';
import { environment } from 'src/environments/environment';
import { ICapItem, IPlacedOrder, OrderService } from './services/order.service';
import { IAccount } from './services/account.service';
interface ICapModel extends ICap {
  quantity: number;
  isSelectedItem: boolean;
}
// const data: Array<ICapModel> = [
//   {
//     name: 'Canvas Black',
//     img: '../../assets/images/canvas_black.jpeg',
//     description: 'Elegant and versatile with a timeless look.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Canvas Blue',
//     img: '../../assets/images/canvas_blue.jpeg',
//     description: 'Fresh and vibrant, perfect for casual wear.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Canvas Khaki',
//     img: '../../assets/images/canvas_khaki.jpeg',
//     description:
//       'Subtle and stylish, ideal for both formal and casual occasions.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Canvas Olive',
//     img: '../../assets/images/canvas_olive.jpeg',
//     description: 'Rich color that adds a modern twist to your outfit.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Denim Black',
//     img: '../../assets/images/denim_black.jpeg',
//     description: 'Bold and edgy, with a unique denim texture.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Denim Sky Blue',
//     img: '../../assets/images/denim_skyblue.jpeg',
//     description: 'Light and breezy, great for summer outings.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Denim Blue',
//     img: '../../assets/images/denim_blue.jpeg',
//     description: 'Classic blue with a contemporary style.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
//   {
//     name: 'Denim Deep Blue',
//     img: '../../assets/images/denim_deepblue.jpeg',
//     description: 'Rich deep tone perfect for making a statement.',
//     quantity: 1,
//     isSelectedItem: false,
//   },
// ];
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
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
    private readonly orderService: OrderService
  ) {}
  ngOnInit(): void {
    this.capService.getCaps().then(
      (res) =>
        (this.caps = res.items.map((item) => {
          // const data: ICapModel =
          return {
            ...item,
            image: `${this.fileUrl}${item.collectionId}/${item.id}/${item.image}`,
            quantity: 1,
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
  updateQuantity(index: number, change: number) {
    const qty = this.caps[index].quantity + change;
    this.caps[index].quantity = qty ? qty : 1;
    this.caps[index].isSelectedItem = Boolean(qty);
    this.calculateOrder();
    console.log(
      this.caps.map((i) => ({ qty: i.quantity, select: i.isSelectedItem }))
    );
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
    console.log('Selected City:', this.city);
  }
  calculateOrder() {
    let totalCaps = 1;

    this.caps.forEach((cap, index) => {
      if (cap.isSelectedItem) {
        let qty = cap.quantity;
        totalCaps += qty;
        this.capsTotal += qty * this.discountPrice;
      }
    });

    if (totalCaps === 0) {
      // document.getElementById('orderSummary').innerHTML =
      //   '<p>Please select at least one cap.</p>';
      return;
    }

    if (totalCaps >= 5) {
      this.deliveryCharge = 0;
    } else if (totalCaps >= 3) {
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
  };
  placeOrder() {
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
          cap_id: cap.id,
          quantity: qty,
          sale_price: cap.discount_price,
        });
        selectedCaps += qty;
        orderDetails += `${cap.title}: ${qty} piece(s)\n`;
      }
    });
    this.order.total = this.capsTotal;
    this.order.shipping_charge = this.deliveryCharge;
    this.order.grand_total = this.totalOrder;
    console.log(this.order, cartItems, consumer);
    
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
