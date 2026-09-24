import type { StoreSettings } from "@/db/schema";

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Ankooaitelier",
  tagline: "Modern fashion, delivered across Nigeria.",
  whatsappNumber: "2348000000000",
  phone: "+234 800 000 0000",
  email: "hello@ankoo.ng",
  address: "Lagos, Nigeria",
  hours: "Mon – Sat, 9am – 6pm",
  announcement: "Free delivery on orders above ₦100,000 · Order easily on WhatsApp",
  deliveryFee: 3500,
  freeShippingThreshold: 100000,
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  twitter: "https://x.com/",
  tiktok: "https://tiktok.com/",
};

export const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina",
  "Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
  "Sokoto","Taraba","Yobe","Zamfara",
];
