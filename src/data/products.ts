import iphone from "@/assets/phone-iphone.webp";
import samsung from "@/assets/phone-samsung.webp";
import redmi from "@/assets/phone-redmi.webp";
import oneplus from "@/assets/phone-oneplus.webp";
import oppo from "@/assets/phone-oppo.webp";
import laptop from "@/assets/laptop.webp";
import smartwatch from "@/assets/smartwatch.webp";
import earbuds from "@/assets/earbuds.webp";
import tablet from "@/assets/tablet.webp";

export type ProductLabel = "Hot Product" | "Top Selling" | "Customers Choice" | "High Demand" | "New Arrival";

export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  image: string;
  price: number;
  originalPrice: number;
  label?: ProductLabel;
}

export const formatBDT = (n: number) =>
  "৳" + n.toLocaleString("en-IN");

export const discountPct = (p: Product) =>
  Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);

const images = [iphone, samsung, redmi, oneplus, oppo, laptop, smartwatch, earbuds, tablet];

export const products: Product[] = [
  { id: "1", slug: "iphone-17-pro-max-256gb", name: "iPhone 17 Pro Max 256GB", brand: "Apple", image: iphone, price: 164444, originalPrice: 189000, label: "Hot Product" },
  { id: "2", slug: "samsung-galaxy-s26-ultra-12gb-512gb", name: "Samsung Galaxy S26 Ultra 12GB/512GB", brand: "Samsung", image: samsung, price: 123989, originalPrice: 145000, label: "Top Selling" },
  { id: "3", slug: "redmi-note-15-5g-8gb-256gb", name: "Redmi Note 15 5G 8GB/256GB", brand: "Xiaomi", image: redmi, price: 20990, originalPrice: 25990, label: "Customers Choice" },
  { id: "4", slug: "oneplus-15-16gb-512gb", name: "OnePlus 15 16GB/512GB", brand: "OnePlus", image: oneplus, price: 75490, originalPrice: 89990, label: "High Demand" },
  { id: "5", slug: "redmi-15c-6gb-128gb", name: "Redmi 15C 6GB/128GB", brand: "Xiaomi", image: redmi, price: 14489, originalPrice: 17990, label: "Top Selling" },
  { id: "6", slug: "oppo-find-x9-pro-16gb-512gb", name: "Oppo Find X9 Pro 16GB/512GB", brand: "Oppo", image: oppo, price: 94990, originalPrice: 109990, label: "Hot Product" },
  { id: "7", slug: "macbook-air-m4-13-inch-16gb-512gb", name: "MacBook Air M4 13-inch 16GB/512GB", brand: "Apple", image: laptop, price: 159900, originalPrice: 179900, label: "New Arrival" },
  { id: "8", slug: "nexio-galaxy-watch-pro-47mm", name: "Nexio Galaxy Watch Pro 47mm", brand: "Nexio", image: smartwatch, price: 18990, originalPrice: 24990, label: "Customers Choice" },
  { id: "9", slug: "airpods-pro-3-with-usb-c", name: "AirPods Pro 3 with USB-C", brand: "Apple", image: earbuds, price: 29900, originalPrice: 34900, label: "Hot Product" },
  { id: "10", slug: "ipad-pro-13-m4-256gb-wi-fi", name: "iPad Pro 13\" M4 256GB Wi-Fi", brand: "Apple", image: tablet, price: 134900, originalPrice: 149900, label: "New Arrival" },
  { id: "11", slug: "vivo-x300-pro-12gb-512gb", name: "Vivo X300 Pro 12GB/512GB", brand: "Vivo", image: oppo, price: 89990, originalPrice: 104990, label: "High Demand" },
  { id: "12", slug: "realme-gt-7-pro-16gb-256gb", name: "Realme GT 7 Pro 16GB/256GB", brand: "Realme", image: oneplus, price: 64990, originalPrice: 74990, label: "Top Selling" },
  { id: "13", slug: "xiaomi-pad-7-pro-12gb-256gb", name: "Xiaomi Pad 7 Pro 12GB/256GB", brand: "Xiaomi", image: tablet, price: 54990, originalPrice: 64990, label: "New Arrival" },
  { id: "14", slug: "galaxy-buds-3-pro-anc", name: "Galaxy Buds 3 Pro ANC", brand: "Samsung", image: earbuds, price: 19990, originalPrice: 24990, label: "Hot Product" },
  { id: "15", slug: "asus-rog-zephyrus-g16-rtx-4070", name: "ASUS ROG Zephyrus G16 RTX 4070", brand: "Asus", image: laptop, price: 234900, originalPrice: 269900, label: "Customers Choice" },
  { id: "16", slug: "apple-watch-ultra-3-titanium", name: "Apple Watch Ultra 3 Titanium", brand: "Apple", image: smartwatch, price: 99900, originalPrice: 114900, label: "New Arrival" },
];

export const flashSaleProducts = products.slice(0, 8);
export const bestDeals = products.slice(2, 10);
export const newArrivals = products.filter(p => p.label === "New Arrival").concat(products.slice(0, 4)).slice(0, 8);

void images;
