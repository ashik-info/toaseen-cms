import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
export interface IAccount {
  user_name: string;
  contact_number: string;
  shipping_address: string;
}
@Injectable({ providedIn: 'root' })
export class AccountService {
  pb = new PocketBase(environment.API_URL);
  constructor(private readonly http: HttpClient) {}
  async createAccount(payload:IAccount): Promise<IAccount> {
    return await this.pb.collection<IAccount>('caps').create(payload);
  }
  
//   async getCapGallery(): Promise<Pages<IGallery[]>> {
//     return await this.pb
//       .collection<Pages<IGallery[]>>('cap_galleries')
//       .getList();
//   }
}
