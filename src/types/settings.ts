export type SettingsDialogName = "password" | "delete" | null;

export type SettingsCloudProvider = "google-drive" | "onedrive";

/**
 * Textos que necesita la lógica de la vista de ajustes. La vista resuelve la
 * sección de i18n y el hook no conoce el idioma.
 */
export interface SettingsActionMessages {
  signOutError: string;
  providerUnavailable: string;
  connectionFailed: string;
  connectionSuccess: string;
  connected: string;
  connect: string;
  disconnect: string;
  syncNotConnected: string;
  googleDrive: string;
  onedrive: string;
}

export interface CloudSyncCard {
  provider: SettingsCloudProvider;
  label: string;
  statusText: string;
  actionLabel: string;
  isConnected: boolean;
  isHighlighted: boolean;
  isDisabled: boolean;
  isProviderEnabled: boolean;
}

export interface CloudProviderStatusSnapshot {
  provider: SettingsCloudProvider;
  enabled: boolean;
  connected: boolean;
  accountLabel?: string;
}

export interface CloudSyncCardsOptions {
  messages: SettingsActionMessages;
  connectedProvider: SettingsCloudProvider | null;
  isLoading: boolean;
  workingProvider: SettingsCloudProvider | null;
}

export interface SignOutState {
  isWorking: boolean;
  error: string | null;
  submit: () => Promise<void>;
}

export interface CloudSyncSettingsState {
  cards: CloudSyncCard[];
  error: string | null;
  isLoading: boolean;
  workingProvider: SettingsCloudProvider | null;
  toggle: (card: CloudSyncCard) => Promise<void>;
}

export interface AutoSyncSettingsState {
  enabled: boolean;
  toggle: () => void;
}

export interface ChangePasswordMessages {
  mismatch: string;
  updateFailed: string;
}

export interface DeletePracticeDataMessages {
  deleteFailed: string;
  confirmationWord: string;
}
