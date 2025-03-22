import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IAccount } from './account.service';
export interface IPlacedOrder {
  consumer_id: string;
  order_items: string[];
  total: number;
  shipping_charge: number;
  grand_total: number;
  data?: any;
}
export interface ICapItem {
  id?: string;
  collectionId?: string;
  collectionName?: string;
  created?: Date;
  updated?: Date;
  quantity: number;
  sale_price: number;
  cap_id: string;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  pb = new PocketBase(environment.API_URL);
  constructor(private readonly http: HttpClient) {}
  async placedOrder(
    consumer: IAccount,
    capItems: ICapItem[],
    order: IPlacedOrder
  ): Promise<any> {
    return await this.pb
      .collection('consumers')
      .create(consumer)
      .then(async (res) => {
        let cart_items: Array<any> = [];
        return await Promise.all(
          capItems.map(async (item) => {
            return await this.pb
              .collection('cap_order_items')
              .create(item)
              .then((res) => cart_items.push(res));
          })
        ).then(async (res2) => {
          const orderdata: IPlacedOrder = {
            ...order,
            consumer_id: res.id,
            order_items: cart_items.map((i) => i.id),
            data: { data: { consumer: res, cart_items } },
          };
          return await this.pb.collection('cap_orders').create(orderdata);
        });
      });
  }

  //   async getCapGallery(): Promise<Pages<IGallery[]>> {
  //     return await this.pb
  //       .collection<Pages<IGallery[]>>('cap_galleries')
  //       .getList();
  //   }
}
