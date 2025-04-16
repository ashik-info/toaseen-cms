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

@Injectable({ providedIn: 'root' })
export class OrderService {
  pb = new PocketBase(environment.API_URL);
  currentOrder = {} as RecordModel;
  cart_items: Array<ICap> = [];
  constructor(private readonly http: HttpClient, private router: Router) {
    this.pb.autoCancellation(false);
  }
  async placedOrder(
    consumer: IAccount,
    capItems: ICapItem[],
    order: IPlacedOrder
  ): Promise<any> {
    return await this.pb
      .collection('consumers')
      .getFirstListItem(`contact_number='${consumer.contact_number}'`)
      .then(async (account) => {
        if (account?.id) {
          return await this.pb
            .collection('consumers')
            .update(account.id, consumer)
            .then(async (res) => {
              const response_data = await Promise.all(
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
                    data: {
                      data: { consumer: res, cart_items: this.cart_items },
                    },
                  };
                  // console.log(orderdata);
                  return await this.pb
                    .collection('cap_orders')
                    .create(orderdata);
                } else {
                  return;
                }
              });
              if (response_data) {
                this.currentOrder = response_data;
              }
              return response_data;
            })
            .finally(() => {
              // console.debug(this.currentOrder);
              this.router.navigateByUrl(
                '/invoice/' +
                  this.currentOrder['data']?.data?.consumer?.contact_number
              );
            });
        } else {
          return await this.pb
            .collection('consumers')
            .create(consumer)
            .then(async (res) => {
              const response_data = await Promise.all(
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
                    data: {
                      data: { consumer: res, cart_items: this.cart_items },
                    },
                  };
                  // console.log(orderdata);
                  return await this.pb
                    .collection('cap_orders')
                    .create(orderdata);
                } else {
                  return;
                }
              });
              if (response_data) {
                this.currentOrder = response_data;
              }
              return response_data;
            })
            .finally(() => {
              // console.debug(this.currentOrder);
              this.router.navigateByUrl(
                '/invoice/' +
                  this.currentOrder['data']?.data?.consumer?.contact_number
              );
            });
        }
      });
  }
  async getOrderDetails(contact_number: string | null): Promise<any> {
    const record = await this.pb
      .collection('consumers')
      .getFirstListItem(`contact_number="${contact_number}"`)
      .then(async (res) => {
        return await this.pb
          .collection('cap_orders')
          .getFullList({
            sort: '-created',
            filter: `consumer_id = '${res.id}'`,
          })
          .then((res) => res[0]);
      });
    // console.debug(record);
    return record;
  }
  //   async getCapGallery(): Promise<Pages<IGallery[]>> {
  //     return await this.pb
  //       .collection<Pages<IGallery[]>>('cap_galleries')
  //       .getList();
  //   }
}
