export interface UserData {
  id: string;
  email: string;
  created_at: string;
}

export interface AccessCodeData {
  id: string;
  code: string;
  used: boolean;
  created_at: string;
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
