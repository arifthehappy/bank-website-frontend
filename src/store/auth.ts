import { create } from "zustand";


interface Employee {
  employeeNumber: string | null;
  full_name: string | null;
  email: string | null;
  address: string | null;
  status: string | null;
  dateOfIssue: string | null;
  dateOfJoining: string | null;
  branch_name: string | null;
  designation: string | null;
  branchCode: string | null;
  connectionId: string | null;
  proverDid: string | null;
  createdAt: string | null;
}

interface ConnectionResponseState {
  connectionResponse: any;
  setConnectionResponse: (response: any) => void;
}

export const useConnectionResponse = create<ConnectionResponseState>((set) => ({
  connectionResponse: null,
  setConnectionResponse: (response) => set({ connectionResponse: response }),
}));


interface AuthState {
  isAuthenticated: boolean;
  employee: Employee | null;
  isLoading: boolean;
  error: string | null;
  connection: any | null;
  setEmployee: (employee: Employee) => void;
  clearEmployee: () => void;
  setConnection: (connection: any) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  employee: null,
  isLoading: false,
  error: null,
  connection: null,

  setEmployee: (employee) =>
    set({ isAuthenticated: true, employee }),

  clearEmployee: () =>
    set({ isAuthenticated: false, employee: null }),

  setConnection: (connection) =>
    set({ connection }),

  logout: () =>
    set({ isAuthenticated: false, employee: null, connection: null }),

  clearError: () =>
    set({ error: null }),
}));
