export interface AuthState {
  token: string;
}

export const initialAuthState: AuthState = {
  token: null
};
