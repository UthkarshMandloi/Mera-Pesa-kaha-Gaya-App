// src/constants/colors.ts

export const colors = {
  // Base theme
  background: '#F8F9FA',
  surface: '#FFFFFF',
  textPrimary: '#212529',
  textSecondary: '#6C757D',

  // Core Actions
  primary: '#007BFF',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',

  // Accounts
  cash: '#17A2B8',
  bank: '#6610F2',

  // The Vault (Hidden Mode)
  vaultBackground: '#121212',
  vaultPrimary: '#BB86FC',
  vaultText: '#E0E0E0',
} as const;

// This creates a type based on the keys of your colors object
export type ColorType = keyof typeof colors;