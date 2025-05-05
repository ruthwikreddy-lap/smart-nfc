
export interface UserData {
  id: string;
  email: string | null;
  created_at: string;
  name?: string | null;
  title?: string | null;
  bio?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

export interface PageData {
  id: string;
  path: string;
  user_id?: string;
  created_at: string;
  user_email?: string;
}

export interface ExcelPortfolioData {
  name: string;
  title: string;
  bio: string;
  email?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}
