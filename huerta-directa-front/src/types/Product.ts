export interface Product {
  idProduct: number;
  nameProduct: string;
  category: string;
  price: number;
  unit: string;
  descriptionProduct: string;
  stock: number;
  imageProduct?: string;
  discountOffer?: number;
}