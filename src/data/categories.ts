import { Smartphone, Tablet, Laptop, Watch, Headphones, Speaker, Cable, Tv, Cpu, Battery, ShieldCheck, Music } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface MenuCategory {
  name: string;
  subcategories: string[];
}

export const megaMenuCategories: MenuCategory[] = [
  { name: "Phones", subcategories: ["Samsung", "iPhone", "Xiaomi", "Oppo", "Vivo", "Realme", "Infinix", "Tecno", "OnePlus", "Google Pixel"] },
  { name: "Tablet", subcategories: ["iPad", "Samsung Tab", "Xiaomi Pad", "Lenovo Tab", "Huawei MatePad", "Honor Pad"] },
  { name: "Laptop", subcategories: ["MacBook", "Asus", "Lenovo", "HP", "Dell", "Acer", "MSI", "Gaming Laptops"] },
  { name: "Smart Watch", subcategories: ["Apple Watch", "Samsung Watch", "Xiaomi Watch", "Huawei", "Amazfit", "Garmin"] },
  { name: "Gadget", subcategories: ["Power Bank", "Smart Bulb", "Smart Plug", "VR Headset", "Drones", "Action Camera"] },
  { name: "Accessories", subcategories: ["Phone Case", "Screen Protector", "Charger", "Cable", "Adapter", "Stand"] },
  { name: "Sounds", subcategories: ["Earbuds", "AirPods", "Headphones", "Bluetooth Speaker", "Soundbar", "Home Theater"] },
  { name: "Smart TV", subcategories: ["Samsung TV", "Sony TV", "LG TV", "Xiaomi TV", "Hisense", "TCL"] },
];

export interface ShopCategory {
  name: string;
  icon: LucideIcon;
  count: number;
}

export const shopCategories: ShopCategory[] = [
  { name: "Phones", icon: Smartphone, count: 248 },
  { name: "Tablet", icon: Tablet, count: 64 },
  { name: "Laptop", icon: Laptop, count: 142 },
  { name: "Smart Watch", icon: Watch, count: 86 },
  { name: "AirPods", icon: Headphones, count: 34 },
  { name: "Sounds", icon: Speaker, count: 92 },
  { name: "Accessories", icon: Cable, count: 312 },
  { name: "Gadgets", icon: Cpu, count: 178 },
  { name: "Earbuds", icon: Music, count: 56 },
  { name: "Phone Cases", icon: ShieldCheck, count: 420 },
  { name: "Screen Protectors", icon: ShieldCheck, count: 198 },
  { name: "Power Banks", icon: Battery, count: 74 },
  { name: "Smart TV", icon: Tv, count: 48 },
];
