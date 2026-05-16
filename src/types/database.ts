export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Profile = {
  id: string;
  full_name: string;
  age: number;
  sex: string;
  phone: string | null;
  address: string | null;
  role: "user" | "admin";
  created_at: string;
  email?: string;
};

export type Brigade = {
  id: string;
  title: string;
  event_type: string;
  description: string | null;
  event_date: string;
  event_time: string;
  location_name: string;
  location_address: string;
  cover_image_url: string | null;
  requirements: string[];
  created_at: string;
};

export type BrigadeVolunteer = {
  brigade_id: string;
  user_id: string;
  status: "registered" | "completed";
  registered_at: string;
};

export type AdminEmail = {
  email: string;
  name: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      brigades: {
        Row: Brigade;
        Insert: Omit<Brigade, "id" | "created_at">;
        Update: Partial<Omit<Brigade, "id" | "created_at">>;
      };
      brigade_volunteers: {
        Row: BrigadeVolunteer;
        Insert: Omit<BrigadeVolunteer, "registered_at">;
        Update: Partial<Omit<BrigadeVolunteer, "brigade_id" | "user_id">>;
      };
      admin_emails: {
        Row: AdminEmail;
        Insert: AdminEmail;
        Update: Partial<AdminEmail>;
      };
    };
  };
};
