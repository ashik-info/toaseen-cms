import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../services/order.service';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [OrderService],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss',
})
export class OrderDetailsComponent implements OnInit {
  orderDetails = {} as any;
  orderData = {} as any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private readonly orderService: OrderService
  ) {}
  async ngOnInit(): Promise<void> {
    // console.debug(this.orderService.currentOrder);
    this.activatedRoute.paramMap.subscribe((params) => {
      // console.debug(params.get('contact-number'));
      if (Boolean(params.get('contact-number'))) {
        const contactNumber = params.get('contact-number');
        this.orderService.getOrderDetails(contactNumber).then((res) => {
          if (res !== null) {
            this.orderDetails = res['data']?.data;
            this.orderData = res;
          }
          // console.debug(this.orderDetails['data']?.data)
        });
      }
    });
  }
  getImageUrl(capID: string, imgPath: string) {
    return `${environment.FILE_URL}${environment.CAP_COLLECTION_ID}/${capID}/${imgPath}`;
  }
}
