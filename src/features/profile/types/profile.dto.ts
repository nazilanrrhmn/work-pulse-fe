export interface UserProfileDTO {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  nppBni: number;
  manager: string;
  departemenHead: string;
  divisi: string;
  departemen: string;
  kelompok: string;
  npp: string;
  status: string;
  signatureImagePath: string | null;
}
