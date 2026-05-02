"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

type Locale = "id" | "en";

type TranslationDict = {
  [key: string]: string;
};

const translations: { id: TranslationDict; en: TranslationDict } = {
  id: {
    // Hero Scrollytelling
    hero_title_1: "Faste Coffee",
    hero_subtitle_1: "Dibuat untuk Energi Harianmu",
    hero_title_2: "Dibuat dari biji kopi premium",
    hero_subtitle_2: "Rasa kaya, aroma berani",
    hero_title_3: "Dari kebun ke cangkirmu",
    hero_subtitle_3: "Dipanggang segar setiap hari",
    hero_title_4: "Rasakan budaya kopi modern",
    hero_subtitle_4: "Cepat / Segar / Kaya Rasa",
    hero_title_5: "Awali harimu dengan Faste Coffee",
    hero_title_6: "Pesan kopimu sekarang",
    scrollytelling_badge: "Scrollytelling Kopi Premium",

    // Navbar
    home: "Beranda",
    about: "Tentang",
    menu: "Menu",
    contact: "Kontak",
    cart: "Keranjang",
    close: "Tutup",
    social: "Sosial",

    // Hero
    explore_menu: "Jelajahi Menu",

    // About
    about_faste: "Tentang Faste",
    about_heading: "Kopi premium untuk orang-orang yang bergerak dengan penuh tujuan.",
    about_description:
      "Faste Coffee memadukan ritual kopi kontemporer dengan kehangatan roastery craft, menciptakan brand yang terasa berkelas, efisien, dan sangat manusiawi.",
    about_reveal:
      "Faste Coffee adalah brand kopi modern yang berdedikasi menghadirkan kopi premium dengan kecepatan dan konsistensi. Dari biji pilihan hingga cangkir yang diseduh sempurna, kami mendefinisikan ulang pengalaman minum kopimu.",
    about_feature_1: "Biji pilihan terbaik",
    about_feature_2: "Dipanggang segar setiap hari",
    about_feature_3: "Dibuat untuk mobilitas modern",

    // CTA
    next_cup: "Cangkir Berikutnya",
    cta_heading: "Siap untuk kopi berikutnya?",
    cta_description:
      "Rasakan Faste Coffee hari ini dan ubah rutinitas harianmu menjadi sesuatu yang lebih kaya, hangat, dan berkesan.",
    cta_button: "Pesan Sekarang",

    // Stats
    daily_proof: "Bukti Harian",
    stats_heading:
      "Dibangun dengan konsistensi, diukur lewat cangkir, pelanggan setia, dan ritual yang terus berulang.",
    cups_served: "Cangkir Terjual",
    signature_drinks: "Minuman Signature",
    premium_beans: "Biji Kopi Premium",
    daily_customers: "Pelanggan Harian",

    // Testimonials
    testimonials: "Testimoni",
    testimonials_heading:
      "Begini rasanya sebuah ritual saat semuanya terasa pas.",
    show_testimonial: "Tampilkan testimoni",
    testi_quote_1: "Faste Coffee terasa seperti seseorang mendesain pagi saya. Pelayanan cepat, cangkir yang indah, dan rasanya selalu pas.",
    testi_role_1: "Ahli Strategi Kreatif",
    testi_quote_2: "Espressonya bersih, cappuccinonya seimbang, dan seluruh pengalaman brand terasa premium tanpa terkesan berlebihan.",
    testi_role_2: "Desainer Produk",
    testi_quote_3: "Memiliki kecepatan cafe grab-and-go, namun dengan detail dari specialty bar. Kombinasi itulah yang membuat saya terus kembali.",
    testi_role_3: "Pelanggan Harian",

    // Menu
    popular_menu: "Menu Populer",
    menu_subtitle:
      "Minuman signature yang terasa familiar, elevated, dan layak untuk berhenti sejenak.",
    menu_description:
      "Menu premium yang presented seperti sebuah design object: warm, tactile, dan built untuk invite exploration.",
    all_drinks: "Semua Minuman",
    add_to_cart: "Tambah ke Keranjang",
    drink_item: "Minuman",
    in_cart: "Di Keranjang",
    fresh_drink: "Minuman signature segar",
    decrease: "Kurangi",
    increase: "Tambah",
    brand_layers: "Lapisan Brand",
    brand_layers_title: "Lifestyle cues yang mengubah cangkir menjadi budaya.",
    brand_layers_desc:
      "Empat editorial cards yang membawa dunia visual di sekitar produk.",
    brand_card_title_1: "Biji Kopi",
    brand_card_desc_1: "Crema pekat, body bulat, dan biji kopi yang dipilih untuk rasa manis berlapis.",
    brand_card_title_2: "Proses Brewing",
    brand_card_desc_2: "Ekstraksi terukur, panas terkalibrasi, dan ritme yang bisa Anda rasakan.",
    brand_card_title_3: "Vibe Coffee Shop",
    brand_card_desc_3: "Cahaya hangat, material taktil, dan tempo yang dibuat untuk ritual harian.",
    brand_card_title_4: "Keahlian Barista",
    brand_card_desc_4: "Tangan yang cepat, teknik bersih, dan sentuhan akhir yang tetap terasa personal.",

    // Cart
    your_cart: "Keranjang Anda",
    empty_cart: "Keranjang masih kosong.",
    add_items: "Tambahkan minuman dari menu",
    proceed_checkout: "Lanjut ke Pembayaran",
    remove: "Hapus",
    subtotal: "Subtotal",
    service_fee: "Biaya Layanan",
    total: "Total",

    // Checkout
    checkout: "Pembayaran",
    finalize_order: "Selesaikan pesanan Anda dengan alur kasir kopi yang lebih bersih.",
    review_drinks: "Tinjau minuman Anda, sesuaikan jumlah, dan konfirmasi pesanan. Riwayat pembelian dari checkout ini juga akan masuk ke admin panel.",
    back_to_menu: "Kembali ke Menu",
    order_created: "Pesanan Dibuat",
    my_order: "Pesanan Saya",
    view_past_order: "Lihat pesananmu yang lalu",
    have_previous_order: "Kamu punya pesanan sebelumnya dengan nomor",
    order_items: "Item Pesanan",
    cups_in_order: "cup dalam pesanan Anda",
    ready_no_order: "Halaman checkout Anda sudah siap, tetapi belum ada pesanan.",
    add_first: "Tambahkan beberapa minuman dari menu terlebih dahulu, lalu kembali ke sini untuk melihat ringkasan pesanan dan formulir pelanggan.",
    adjust_quantity: "Sesuaikan jumlah di sini sebelum mengonfirmasi pembelian.",
    line_total: "Total Baris",
    per_cup: "per cup",
    payment_summary: "Ringkasan Pembayaran",
    order_recap: "Rekap pesanan",
    customer_details: "Detail Pelanggan",
    checkout_form: "Formulir checkout",
    full_name: "Nama Lengkap",
    name_placeholder: "Nama pemesan",
    phone_number: "Nomor Telepon",
    phone_placeholder: "08xxxxxxxxxx",
    pickup_note: "Catatan Pickup (Opsional)",
    pickup_placeholder: "Contoh: tanpa gula, pickup jam 14:00",
    payment_method: "Metode Pembayaran",
    payment_proof: "Bukti Pembayaran",
    qris: "QRIS",
    qris_desc: "Scan QR untuk pembayaran instan.",
    bank_transfer: "Transfer Bank",
    bank_transfer_desc: "Transfer ke rekening admin Faste Coffee.",
    cash: "Tunai",
    cash_desc: "Bayar langsung saat pesanan diambil.",
    e_wallet: "E-Wallet",
    e_wallet_desc: "Konfirmasi lewat dompet digital.",
    qris_payment: "Pembayaran QRIS",
    scan_to_pay: "Scan untuk membayar",
    amount: "Jumlah",
    total_payment: "Total pembayaran",
    waiting_scan: "Menunggu scan",
    qris_simulation: "Popup ini bisa dipakai untuk simulasi QRIS. Saat merchant QR resmi sudah ada, kita tinggal ganti visual QR di sini.",
    qris_selected: "QRIS dipilih",
    qris_modal_info: "Popup QR akan muncul untuk proses scan pembayaran.",
    open_qris: "Buka QRIS",
    transfer_to_admin: "Transfer ke rekening admin",
    cash_info: "Pembayaran dilakukan saat pesanan diambil di Kasir.",
    ewallet_info: "Siapkan konfirmasi pembayaran dari e-wallet pilihanmu sebelum mengambil pesanan.",
    payment_proof_label: "Bukti Pembayaran",
    payment_proof_instruction: "Upload JPG, PNG, atau WEBP. Maksimal 4 MB.",
    payment_proof_required: " Bukti pembayaran wajib untuk metode non-cash.",
    payment_proof_optional: " Untuk cash, upload bukti bersifat opsional.",
    payment_proof_error_format: "Format bukti pembayaran harus JPG, PNG, atau WEBP.",
    payment_proof_error_size: "Ukuran bukti pembayaran maksimal 4 MB.",
    place_order: "Pesan Sekarang",
    submitting: "Mengirimkan...",
    checkout_post_info: "Setelah checkout berhasil, order ini akan muncul di halaman history pembelian pada admin panel.",
    error_name_phone: "Nama dan nomor telepon wajib diisi.",
    error_empty_cart: "Cart masih kosong.",
    error_payment_method: "Pilih metode pembayaran terlebih dahulu.",
    error_payment_proof: "Upload bukti pembayaran untuk metode yang dipilih.",
    error_generic: "Gagal membuat pesanan.",
    error_backend: "Tidak bisa terhubung ke backend checkout.",

    // Order Status
    order_received: "Pesanan Diterima",
    order_received_desc: "Order sudah masuk ke sistem dan menunggu diproses.",
    order_brewing: "Pesanan Sedang Dibuat",
    order_brewing_desc: "Barista sedang menyiapkan minuman pesananmu.",
    order_ready_for_pickup: "Pesanan Siap Diambil",
    order_ready_for_pickup_desc: "Pesanan selesai dan sudah siap diambil di counter.",
    order_completed: "Selesai",
    order_placed: "Pesanan masuk",

    // Success
    pesanan_berhasil: "Pesanan berhasil masuk.",
    nomor_order: "Nomor order",
    status_saat_ini: "Status Saat Ini",
    buat_pesanan_baru: "Buat Pesanan Baru",
    pesan_lagi: "Pesan Lagi",

    // Footer
    copyright: "Hak Cipta 2026 Faste Coffee",
    footer_description:
      "Diseduh untuk energi harianmu. Diracik untuk rutinitas modern, rasa premium, dan ritme yang tetap terasa manusiawi.",

    // Misc
    view_website: "Lihat Website",
    location_jakarta: "Jakarta - Brew Bar & Roastery Harian",
    open_cart: "Buka keranjang",
  },
  en: {
    // Hero Scrollytelling
    hero_title_1: "Faste Coffee",
    hero_subtitle_1: "Brewed for Your Daily Energy",
    hero_title_2: "Crafted from premium beans",
    hero_subtitle_2: "Rich flavor, bold aroma",
    hero_title_3: "From farm to your cup",
    hero_subtitle_3: "Freshly roasted every day",
    hero_title_4: "Experience modern coffee culture",
    hero_subtitle_4: "Fast / Fresh / Flavorful",
    hero_title_5: "Start your day with Faste Coffee",
    hero_title_6: "Order your coffee now",

    // Navbar
    home: "Home",
    about: "About",
    menu: "Menu",
    contact: "Contact",
    cart: "Cart",
    close: "Close",
    social: "Social",

    // Hero
    explore_menu: "Explore Menu",
    scrollytelling_badge: "Premium Coffee Scrollytelling",

    // About
    about_faste: "About Faste",
    about_heading: "Premium coffee for people who move with intention.",
    about_description:
      "Faste Coffee pairs a contemporary coffee ritual with the warmth of a craft roastery, creating a brand that feels elevated, efficient, and deeply human.",
    about_reveal:
      "Faste Coffee is a modern coffee brand dedicated to delivering premium quality coffee with speed and consistency. From carefully selected beans to perfectly brewed cups, we redefine your coffee experience.",
    about_feature_1: "Selected-origin beans",
    about_feature_2: "Roasted for daily freshness",
    about_feature_3: "Built for the modern commute",

    // CTA
    next_cup: "Next Cup",
    cta_heading: "Ready for your next coffee?",
    cta_description:
      "Experience Faste Coffee today and turn your everyday run into something richer, warmer, and more cinematic.",
    cta_button: "Order Now",

    // Stats
    daily_proof: "Daily Proof",
    stats_heading:
      "Built on consistency, measured in cups, regulars, and repeat rituals.",
    cups_served: "Cups Served",
    signature_drinks: "Signature Drinks",
    premium_beans: "Premium Beans",
    daily_customers: "Daily Customers",

    // Testimonials
    testimonials: "Testimonials",
    testimonials_heading:
      "What the ritual feels like when it lands exactly right.",
    show_testimonial: "Show testimonial",
    testi_quote_1: "Faste Coffee feels like someone designed my morning for me. Quick service, beautiful cups, and the flavor always lands.",
    testi_role_1: "Creative Strategist",
    testi_quote_2: "The espresso is clean, the cappuccino is balanced, and the whole brand experience feels premium without trying too hard.",
    testi_role_2: "Product Designer",
    testi_quote_3: "It has the speed of a grab-and-go cafe, but the detail of a specialty bar. That combination is why I keep coming back.",
    testi_role_3: "Daily Customer",

    // Menu
    popular_menu: "Popular Menu",
    menu_subtitle:
      "Signature drinks designed to feel familiar, elevated, and worth the pause.",
    menu_description:
      "A premium menu presented like a design object: warm, tactile, and built to invite exploration.",
    all_drinks: "All Drinks",
    add_to_cart: "Add to Cart",
    drink_item: "Drink",
    in_cart: "In Cart",
    fresh_drink: "Freshly prepared signature drink",
    decrease: "Decrease",
    increase: "Increase",
    brand_layers: "Brand Layers",
    brand_layers_title: "Lifestyle cues that turn a cup into a culture.",
    brand_layers_desc:
      "Four editorial cards carrying the visual world around the product.",
    brand_card_title_1: "Coffee Beans",
    brand_card_desc_1: "Dense crema, round body, and beans sourced for layered sweetness.",
    brand_card_title_2: "Brewing Process",
    brand_card_desc_2: "Measured extraction, calibrated heat, and rhythm you can taste.",
    brand_card_title_3: "Coffee Shop Vibe",
    brand_card_desc_3: "Warm light, tactile materials, and a pace made for everyday rituals.",
    brand_card_title_4: "Barista Craft",
    brand_card_desc_4: "Fast hands, clean technique, and a finish that still feels personal.",

    // Cart
    your_cart: "Your Cart",
    empty_cart: "Cart is still empty.",
    add_items: "Add drinks from the menu",
    proceed_checkout: "Proceed to Checkout",
    remove: "Remove",
    subtotal: "Subtotal",
    service_fee: "Service Fee",
    total: "Total",

    // Checkout
    checkout: "Checkout",
    finalize_order: "Finalize your order with a cleaner coffee counter flow.",
    review_drinks: "Review your drinks, adjust quantities, and confirm the order. Riwayat pembelian dari checkout ini juga akan masuk ke admin panel.",
    back_to_menu: "Back to Menu",
    order_created: "Order Created",
    my_order: "My Order",
    view_past_order: "View your past order",
    have_previous_order: "You have a previous order with number",
    order_items: "Order Items",
    cups_in_order: "cups in your order",
    ready_no_order: "Your checkout page is ready, but there is no order yet.",
    add_first: "Add a few drinks from the menu first, then return here to see the order summary and customer form.",
    adjust_quantity: "Adjust quantity here before confirming the purchase.",
    line_total: "Line Total",
    per_cup: "per cup",
    payment_summary: "Payment Summary",
    order_recap: "Order recap",
    customer_details: "Customer Details",
    checkout_form: "Checkout form",
    full_name: "Full Name",
    name_placeholder: "Customer name",
    phone_number: "Phone Number",
    phone_placeholder: "08xxxxxxxxxx",
    pickup_note: "Pickup Note (Optional)",
    pickup_placeholder: "Example: no sugar, pickup at 2:00 PM",
    payment_method: "Payment Method",
    payment_proof: "Payment Proof",
    qris: "QRIS",
    qris_desc: "Scan QR for instant payment.",
    bank_transfer: "Bank Transfer",
    bank_transfer_desc: "Transfer to Faste Coffee admin account.",
    cash: "Cash",
    cash_desc: "Pay directly when the order is picked up.",
    e_wallet: "E-Wallet",
    e_wallet_desc: "Confirm via digital wallet.",
    qris_payment: "QRIS Payment",
    scan_to_pay: "Scan to pay",
    amount: "Amount",
    total_payment: "Total payment",
    waiting_scan: "Waiting for scan",
    qris_simulation: "This popup can be used for QRIS simulation. Once a real official merchant QR is available, we can just change the QR visual here.",
    qris_selected: "QRIS selected",
    qris_modal_info: "A QR popup will appear for the payment scan process.",
    open_qris: "Open QRIS",
    transfer_to_admin: "Transfer to admin account",
    cash_info: "Payment is made when the order is picked up at the Cashier.",
    ewallet_info: "Prepare payment confirmation from your chosen e-wallet before picking up the order.",
    payment_proof_label: "Payment Proof",
    payment_proof_instruction: "Upload JPG, PNG, or WEBP. Max 4 MB.",
    payment_proof_required: " Payment proof is mandatory for non-cash methods.",
    payment_proof_optional: " For cash, uploading proof is optional.",
    payment_proof_error_format: "Payment proof format must be JPG, PNG, or WEBP.",
    payment_proof_error_size: "Maximum payment proof size is 4 MB.",
    place_order: "Place Order",
    submitting: "Submitting...",
    checkout_post_info: "After a successful checkout, this order will appear on the purchase history page in the admin panel.",
    error_name_phone: "Name and phone number are required.",
    error_empty_cart: "Cart is still empty.",
    error_payment_method: "Select a payment method first.",
    error_payment_proof: "Upload payment proof for the selected method.",
    error_generic: "Failed to create order.",
    error_backend: "Cannot connect to the checkout backend.",

    // Order Status
    order_received: "Order Received",
    order_received_desc: "The order has been received and is waiting to be processed.",
    order_brewing: "Brewing",
    order_brewing_desc: "The barista is preparing your drinks.",
    order_ready_for_pickup: "Ready for Pickup",
    order_ready_for_pickup_desc: "Your order is complete and ready at the counter.",
    order_completed: "Completed",
    order_placed: "Order Placed",

    // Success
    pesanan_berhasil: "Order Placed Successfully.",
    nomor_order: "Order Number",
    status_saat_ini: "Current Status",
    buat_pesanan_baru: "Make New Order",
    pesan_lagi: "Order Again",

    // Footer
    copyright: "Copyright 2026 Faste Coffee",
    footer_description:
      "Brewed for your daily energy. Crafted for modern routines, premium taste, and a pace that still feels human.",

    // Misc
    view_website: "View Website",
    location_jakarta: "Jakarta - Brew Bar & Daily Roastery",
    open_cart: "Open cart",
  },
};

type LocaleContextType = {
  locale: Locale;
  t: (key: string) => string;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: "id",
  t: (key) => key,
  setLocale: () => {},
});

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check cookie on mount
    const match = document.cookie.match(/locale=([^;]+)/);
    if (match && (match[1] === "id" || match[1] === "en")) {
      setLocale(match[1] as Locale);
    }
    setMounted(true);
  }, []);

  const t = (key: string): string => {
    return translations[locale][key] ?? translations.en[key] ?? key;
  };

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    // Set cookie
    const date = new Date();
    date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000);
    document.cookie = `locale=${newLocale};expires=${date.toUTCString()};path=/`;
    // Reload to apply changes
    window.location.reload();
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LocaleContext.Provider value={{ locale, t, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}
