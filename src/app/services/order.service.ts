import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PocketBase, { RecordModel } from 'pocketbase';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IAccount } from './account.service';
import { Router } from '@angular/router';
export interface IPlacedOrder {
  consumer_id: string;
  order_items: string[];
  total: number;
  shipping_charge: number;
  grand_total: number;
  data?: any;
}
export interface ICap extends ICapItem {
  id: string;
  collectionId: string;
  collectionName: string;
}
export interface ICapItem {
  product_name: string;
  quantity: number;
  sale_price: number;
  cap_id: string;
  image_url: string;
}

// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import PocketBase, { RecordModel } from 'pocketbase';
// import { environment } from 'src/environments/environment';
// import { IAccount, ICapItem, IPlacedOrder, ICap } from './interfaces';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private pb = new PocketBase(environment.API_URL);
  private cartItems: Array<ICap> = [];
  public currentOrder: RecordModel = {} as RecordModel;

  constructor(private readonly http: HttpClient, private router: Router) {
    this.pb.autoCancellation(false);
  }

  private async findConsumer(
    contactNumber: string
  ): Promise<RecordModel | null> {
    try {
      return await this.pb
        .collection('consumers')
        .getFirstListItem(`contact_number='${contactNumber}'`);
    } catch {
      return null;
    }
  }

  private async createConsumer(consumer: IAccount): Promise<RecordModel> {
    return await this.pb.collection('consumers').create(consumer);
  }

  private async createOrderItems(capItems: ICapItem[]): Promise<ICap[]> {
    const createdItems = await Promise.all(
      capItems.map(async (item) => {
        const orderItem = await this.pb.collection('cap_order_items').create({
          quantity: item.quantity,
          sale_price: item.sale_price,
          cap_id: item.cap_id,
        });

        return { ...orderItem, ...item };
      })
    );

    this.cartItems.push(...createdItems);
    return createdItems;
  }

  private async createOrder(
    consumerId: string,
    order: IPlacedOrder
  ): Promise<RecordModel | undefined> {
    if (!this.cartItems.length) return undefined;

    const orderData: IPlacedOrder = {
      ...order,
      consumer_id: consumerId,
      order_items: this.cartItems.map((item) => item.id),
      data: { data: { consumer_id: consumerId, cart_items: this.cartItems } },
    };

    return await this.pb.collection('cap_orders').create(orderData);
  }

  async placeOrder(
    consumer: IAccount,
    capItems: ICapItem[],
    order: IPlacedOrder
  ): Promise<void> {
    try {
      let consumerRecord = await this.findConsumer(consumer.contact_number);

      if (!consumerRecord) {
        consumerRecord = await this.createConsumer(consumer);
      }

      await this.createOrderItems(capItems);
      const orderRecord = await this.createOrder(consumerRecord.id, order);

      if (orderRecord) {
        this.currentOrder = orderRecord;
        this.router.navigateByUrl(
          `/invoice/${consumerRecord['contact_number']}`
        );
      }
    } catch (error) {
      console.error('Error placing order:', error);
    }
  }

  async getOrderDetails(
    contactNumber: string | null
  ): Promise<RecordModel | null> {
    if (!contactNumber) return null;

    try {
      const consumer = await this.pb
        .collection('consumers')
        .getFirstListItem(`contact_number="${contactNumber}"`);

      const orders = await this.pb.collection('cap_orders').getFullList({
        sort: '-created',
        filter: `consumer_id = '${consumer.id}'`,
      });

      return orders[0] || null;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  }
}
