// ─── Types ────────────────────────────────────────────────────────────────────

export type UserStatus = "active" | "inactive";
export type QueueStatus = "active" | "inactive";
export type RoleStatus = "active" | "inactive";

export interface User {
  id: string;
  userId: string;
  username: string;
  email: string;
  phone: string;
  status: UserStatus;
}

export interface Queue {
  id: string;
  queueId: string;
  name: string;
  members: string[]; // user IDs
  status: QueueStatus;
}

export interface Role {
  id: string;
  roleId: string;
  name: string;
  permissions: Record<string, boolean>;
  status: RoleStatus;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const MODULES = [
  "Service Request",
  "Contact",
  "User Management",
  "Queue",
  "Dashboard",
  "Settings",
];

export const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
  inactive: "bg-zinc-500/10 text-zinc-400 border border-zinc-400/20",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const MOCK_USERS: User[] = [
  { id: "1",  userId: "USR001", username: "andi.pratama",    email: "andi@nusantaratech.co.id",   phone: "+62 811-0001-0001", status: "active" },
  { id: "2",  userId: "USR002", username: "budi.santoso",    email: "budi@majujaya.co.id",         phone: "+62 812-0002-0002", status: "active" },
  { id: "3",  userId: "USR003", username: "citra.dewi",      email: "citra@sinarharapan.co.id",    phone: "+62 813-0003-0003", status: "inactive" },
  { id: "4",  userId: "USR004", username: "doni.kurniawan",  email: "doni@garudamandiri.co.id",    phone: "+62 814-0004-0004", status: "active" },
  { id: "5",  userId: "USR005", username: "eka.wulandari",   email: "eka@berkahahadi.co.id",       phone: "+62 815-0005-0005", status: "active" },
  { id: "6",  userId: "USR006", username: "fajar.nugroho",   email: "fajar@tekprima.co.id",        phone: "+62 816-0006-0006", status: "inactive" },
  { id: "7",  userId: "USR007", username: "gita.permata",    email: "gita@indodigital.co.id",      phone: "+62 817-0007-0007", status: "active" },
  { id: "8",  userId: "USR008", username: "hendra.wijaya",   email: "hendra@mitrasolusi.co.id",    phone: "+62 818-0008-0008", status: "active" },
  { id: "9",  userId: "USR009", username: "indah.rahayu",    email: "indah@karyabangsa.co.id",     phone: "+62 819-0009-0009", status: "inactive" },
  { id: "10", userId: "USR010", username: "joko.susilo",     email: "joko@bumiperkasa.co.id",      phone: "+62 821-0010-0010", status: "active" },
  { id: "11", userId: "USR011", username: "kartika.sari",    email: "kartika@dharmautama.co.id",   phone: "+62 822-0011-0011", status: "active" },
  { id: "12", userId: "USR012", username: "lukman.hakim",    email: "lukman@cahayanus.co.id",      phone: "+62 823-0012-0012", status: "active" },
  { id: "13", userId: "USR013", username: "maya.anggraini",  email: "maya@sentosajaya.co.id",      phone: "+62 824-0013-0013", status: "inactive" },
  { id: "14", userId: "USR014", username: "nanda.putra",     email: "nanda@setiakawan.co.id",      phone: "+62 825-0014-0014", status: "active" },
  { id: "15", userId: "USR015", username: "olivia.susanti",  email: "olivia@arjunasakti.co.id",    phone: "+62 826-0015-0015", status: "active" },
];

export const MOCK_QUEUES: Queue[] = [
  { id: "1", queueId: "QUE001", name: "Technical Support",  members: ["USR001", "USR002", "USR004"], status: "active" },
  { id: "2", queueId: "QUE002", name: "Billing Team",       members: ["USR003", "USR005"],           status: "active" },
  { id: "3", queueId: "QUE003", name: "Account Issues",     members: ["USR006", "USR007", "USR008", "USR009"], status: "inactive" },
  { id: "4", queueId: "QUE004", name: "General Inquiry",    members: ["USR010", "USR011"],           status: "active" },
  { id: "5", queueId: "QUE005", name: "Escalation Team",    members: ["USR012", "USR013", "USR014", "USR015"], status: "active" },
  { id: "6", queueId: "QUE006", name: "VIP Support",        members: ["USR001", "USR004", "USR008"], status: "inactive" },
];

export const MOCK_ROLES: Role[] = [
  {
    id: "1", roleId: "ROLE001", name: "Admin", status: "active",
    permissions: { "Service Request": true, "Contact": true, "User Management": true, "Queue": true, "Dashboard": true, "Settings": true },
  },
  {
    id: "2", roleId: "ROLE002", name: "Agent", status: "active",
    permissions: { "Service Request": true, "Contact": true, "User Management": false, "Queue": true, "Dashboard": true, "Settings": false },
  },
  {
    id: "3", roleId: "ROLE003", name: "Supervisor", status: "active",
    permissions: { "Service Request": true, "Contact": true, "User Management": true, "Queue": true, "Dashboard": true, "Settings": false },
  },
  {
    id: "4", roleId: "ROLE004", name: "Read Only", status: "inactive",
    permissions: { "Service Request": false, "Contact": false, "User Management": false, "Queue": false, "Dashboard": true, "Settings": false },
  },
  {
    id: "5", roleId: "ROLE005", name: "Billing Staff", status: "active",
    permissions: { "Service Request": true, "Contact": true, "User Management": false, "Queue": false, "Dashboard": true, "Settings": false },
  },
];
