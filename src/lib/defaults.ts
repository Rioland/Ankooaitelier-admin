import type { StoreSettings } from "@/db/schema";

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "Ankooaitelier",
  tagline: "Modern fashion, delivered across Nigeria.",
  whatsappNumber: "2348165452482",
  phone: "08165452482",
  email: "hello@ankoo.ng",
  address: "Lagos, Nigeria",
  hours: "Mon – Sat, 9am – 6pm",
  announcement: "Free delivery on orders above ₦100,000 · Order easily on WhatsApp",
  deliveryFee: 3500,
  freeShippingThreshold: 100000,
  instagram: "https://www.instagram.com/ankoo.ng?stkn=YjlhczFsMTExemY1&utm_source=qr",
  facebook: "https://facebook.com/",
  twitter: "https://x.com/",
  tiktok: "https://tiktok.com/",
  ceoName: "Bolu Felix",
  ceoAbout:
    "Fashion has always been more than just clothes for me. It's about how a man presents himself, how he carries his culture, and how he shows up for the moments that matter.\n\n" +
    "I created ANKOO because I wanted to build something that feels distinctly African, but still modern, refined and timeless.\n\n" +
    "From the fabrics we choose, to the way a garment is cut, to the final details — everything is intentional.\n\n" +
    "ANKOO is about creating pieces that become part of a man's story. ANKOO was born from a simple belief: what a man wears should mean something. It should reflect his identity, his culture, his confidence, and the moments he will remember.",
  ceoImage: "/ceo.jpeg",
};

export const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta",
  "Ebonyi","Edo","Ekiti","Enugu","FCT - Abuja","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina",
  "Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
  "Sokoto","Taraba","Yobe","Zamfara",
];
