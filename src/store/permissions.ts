import {create} from "zustand";

export interface PermissionCredential {
  credential_type: string;
  employee_number: string;
  permissions_map: Record<string, string[]>;
  delegation_allowed: boolean;
  valid_from: string;
  valid_until: string;
  delegated_by: string;
  delegation_id: string;
  delegated_by_employee_number: string;
  delegation_proof: string;
}

export interface PermissionsState {
  credentials: PermissionCredential[];
  addCredential: (credential: PermissionCredential) => void;
  removeCredential: (index: number) => void;
  clearCredentials: () => void;
}

export const usePermissionsStore = create<PermissionsState>((set) => ({
  credentials: [],
  addCredential: (credential) =>
    set((state) => ({ credentials: [...state.credentials, credential] })),
  removeCredential: (index) =>
    set((state) => ({
      credentials: state.credentials.filter((_, i) => i !== index),
    })),
  clearCredentials: () => set({ credentials: [] }),
}));