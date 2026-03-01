import { Model } from "mongoose";

export abstract class Dal<T> {
    constructor(protected readonly model: Model<T>) {
    }
}