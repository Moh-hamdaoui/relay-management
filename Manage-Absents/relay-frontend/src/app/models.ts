export interface Absence {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  created_at: string;
  reason?: string;
}

export interface User {
  id: string;
  firstname: string;
  surname: string;
  email: string;
}

export interface Coverage {
  id: string;
  covering_user_id: string | null;
  responsibility_id: string;
  unavailability_id: string;
}

export interface Responsibility {
  id: string;
  user_id: string;
  description: string;
}