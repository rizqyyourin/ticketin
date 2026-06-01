export type Title = "Mr" | "Ms";

export interface Contact {
  id: string;
  title: Title;
  customerName: string;
  phone: string;
  email: string;
  organization: string;
}

const MOCK_DATA: { name: string; title: Title; org: string }[] = [
  { name: "Andi Pratama", title: "Mr", org: "PT Nusantara Tech" },
  { name: "Budi Santoso", title: "Mr", org: "CV Maju Jaya" },
  { name: "Citra Dewi", title: "Ms", org: "PT Sinar Harapan" },
  { name: "Doni Kurniawan", title: "Mr", org: "PT Garuda Mandiri" },
  { name: "Eka Wulandari", title: "Ms", org: "UD Berkah Abadi" },
  { name: "Fajar Nugroho", title: "Mr", org: "PT Teknologi Prima" },
  { name: "Gita Permata", title: "Ms", org: "CV Indo Digital" },
  { name: "Hendra Wijaya", title: "Mr", org: "PT Mitra Solusi" },
  { name: "Indah Rahayu", title: "Ms", org: "PT Karya Bangsa" },
  { name: "Joko Susilo", title: "Mr", org: "PT Bumi Perkasa" },
  { name: "Kartika Sari", title: "Ms", org: "CV Dharma Utama" },
  { name: "Lukman Hakim", title: "Mr", org: "PT Cahaya Nusantara" },
  { name: "Maya Anggraini", title: "Ms", org: "PT Sentosa Jaya" },
  { name: "Nanda Putra", title: "Mr", org: "CV Setia Kawan" },
  { name: "Olivia Susanti", title: "Ms", org: "PT Arjuna Sakti" },
  { name: "Prabowo Setiawan", title: "Mr", org: "PT Delta Persada" },
  { name: "Qori Natasya", title: "Ms", org: "CV Mulia Abadi" },
  { name: "Rizky Firmansyah", title: "Mr", org: "PT Surya Cemerlang" },
  { name: "Sinta Maharani", title: "Ms", org: "PT Karsa Utama" },
  { name: "Teguh Wibowo", title: "Mr", org: "CV Harapan Baru" },
  { name: "Umar Fauzi", title: "Mr", org: "PT Jaya Makmur" },
  { name: "Vina Ramadhani", title: "Ms", org: "PT Andalan Prima" },
  { name: "Wahyu Nugroho", title: "Mr", org: "CV Bina Karya" },
  { name: "Xenia Putri", title: "Ms", org: "PT Cipta Rasa" },
  { name: "Yoga Aditya", title: "Mr", org: "PT Maju Terus" },
  { name: "Zahra Amelia", title: "Ms", org: "CV Gemilang Jaya" },
  { name: "Agus Salim", title: "Mr", org: "PT Nusa Indah" },
  { name: "Bella Maharani", title: "Ms", org: "PT Tama Persada" },
  { name: "Chandra Kusuma", title: "Mr", org: "CV Karya Nyata" },
  { name: "Diana Lestari", title: "Ms", org: "PT Bintang Timur" },
  { name: "Evan Prasetyo", title: "Mr", org: "PT Putra Bangsa" },
  { name: "Fifi Yuliana", title: "Ms", org: "CV Sejahtera Abadi" },
  { name: "Gilang Ramadhan", title: "Mr", org: "PT Cakrawala Nusa" },
  { name: "Hani Kurniasih", title: "Ms", org: "PT Mega Karya" },
  { name: "Ivan Gunawan", title: "Mr", org: "CV Pilar Utama" },
  { name: "Julia Ratnasari", title: "Ms", org: "PT Sumber Rejeki" },
  { name: "Kevin Hermawan", title: "Mr", org: "PT Alam Raya" },
  { name: "Lina Marlina", title: "Ms", org: "CV Graha Indah" },
  { name: "Miko Saputra", title: "Mr", org: "PT Wahana Sakti" },
  { name: "Nina Fitriani", title: "Ms", org: "PT Insan Mandiri" },
  { name: "Oscar Sihombing", title: "Mr", org: "CV Tunas Jaya" },
  { name: "Putri Handayani", title: "Ms", org: "PT Daya Cipta" },
  { name: "Rafi Ananda", title: "Mr", org: "PT Prima Karya" },
  { name: "Shinta Permata", title: "Ms", org: "CV Mitra Utama" },
  { name: "Toni Setiabudi", title: "Mr", org: "PT Nusa Sakti" },
  { name: "Ulfa Nurjanah", title: "Ms", org: "PT Bahari Jaya" },
  { name: "Vito Kusuma", title: "Mr", org: "CV Eka Mandiri" },
  { name: "Winda Ariani", title: "Ms", org: "PT Karya Tama" },
  { name: "Yudi Prasetyo", title: "Mr", org: "CV Surya Abadi" },
  { name: "Zulkifli Anwar", title: "Mr", org: "PT Mitra Bangsa" },
];

function generateContacts(): Contact[] {
  return MOCK_DATA.map((d, i) => {
    const firstNameSlug = d.name.split(" ")[0].toLowerCase();
    const lastNameSlug = d.name.split(" ").slice(1).join("").toLowerCase();
    const orgSlug = d.org.replace(/^(PT|CV|UD)\s+/i, "").replace(/\s+/g, "").toLowerCase();
    return {
      id: String(i + 1),
      title: d.title,
      customerName: d.name,
      phone: `+62 8${String(11 + i).padStart(2, "0")}-${String(1000 + i * 37).slice(-4)}-${String(4000 + i * 53).slice(-4)}`,
      email: `${firstNameSlug}.${lastNameSlug}@${orgSlug}.co.id`,
      organization: d.org,
    };
  });
}

export const ALL_CONTACTS = generateContacts();

export const TITLE_STYLES: Record<Title, string> = {
  Mr: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
  Ms: "bg-pink-500/10 text-pink-500 border border-pink-500/20",
};
