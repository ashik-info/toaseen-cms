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
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  pb = new PocketBase(environment.API_URL);

  cart_items: Array<ICap> = [];
  constructor(private readonly http: HttpClient) {
    this.pb.autoCancellation(false);
  }
  async placedOrder(
    consumer: IAccount,
    capItems: ICapItem[],
    order: IPlacedOrder
  ): Promise<any> {
    // console.log;

    return await this.pb
      .collection('consumers')
      .create(consumer)
      .then(async (res) => {
        return await Promise.all(
          capItems.map(async (item) => {
            return await this.pb
              .collection('cap_order_items')
              .create({
                quantity: item.quantity,
                sale_price: item.sale_price,
                cap_id: item.cap_id,
              })
              .then(async (res) => {
                // console.log(res);
                Promise.all([res]).then(() =>
                  this.cart_items.push({
                    ...res,
                    ...item,
                  })
                );
                // console.log(cart_items)
                return res;
              });
          })
        ).then(async () => {
          if (this.cart_items.length) {
            const orderdata: IPlacedOrder = {
              ...order,
              consumer_id: res.id,
              order_items: this.cart_items.map((i) => i.id),
              data: { data: { consumer: res, cart_items: this.cart_items } },
            };
            console.log(orderdata);
            return await this.pb.collection('cap_orders').create(orderdata);
          } else {
            return;
          }
        });
      });
  }

  //   async getCapGallery(): Promise<Pages<IGallery[]>> {
  //     return await this.pb
  //       .collection<Pages<IGallery[]>>('cap_galleries')
  //       .getList();
  //   }
}
