import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import PocketBase from 'pocketbase';
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
export interface Pages<T> {
    page:       number;
    perPage:    number;
    totalItems: number;
    totalPages: number;
    items:      T;
}

export interface ICap {
    collectionId:   string;
    collectionName: string;
    created:        Date;
    description:    string;
    discount_price: number;
    id:             string;
    image:          string;
    img_url:        string;
    regular_price:  number;
    stock_qty:      number;
    title:          string;
    updated:        Date;
}
export interface IGallery {
    collectionId:   string;
    collectionName: string;
    created:        Date;
    id:             string;
    images:         string[];
    updated:        Date;
}

@Injectable({providedIn:"root"})
export class CapService {
    pb = new PocketBase(environment.API_URL);
    constructor(
        private readonly http:HttpClient
    ){}
    async getCaps():Promise<Pages<ICap[]>>{
        return await this.pb.collection<Pages<ICap[]>>('caps').getList()
    }
    async getCapGallery():Promise<Pages<IGallery[]>>{
        return await this.pb.collection<Pages<IGallery[]>>("cap_galleries").getList()
    }
}