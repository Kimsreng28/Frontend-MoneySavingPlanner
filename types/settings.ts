export enum ThemePreference {
  LIGHT = "light",
  DARK = "dark",
  SYSTEM = "system",
}

export enum LanguagePreference {
  ENGLISH = "en",
  SPANISH = "es",
  FRENCH = "fr",
  GERMAN = "de",
  CHINESE = "zh",
  JAPANESE = "ja",
}

export enum CurrencyDisplay {
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  JPY = "JPY",
  CAD = "CAD",
  AUD = "AUD",
}

export enum DateFormat {
  MM_DD_YYYY = "MM/dd/yyyy",
  DD_MM_YYYY = "dd/MM/yyyy",
  YYYY_MM_DD = "yyyy-MM-dd",
}

export enum TimeFormat {
  TWELVE_HOUR = "12h",
  TWENTY_FOUR_HOUR = "24h",
}

export enum NotificationSound {
  NONE = "none",
  DEFAULT = "default",
  GENTLE = "gentle",
  ALERT = "alert",
}

export interface AppearanceSettings {
  themePreference: ThemePreference;
  languagePreference: LanguagePreference;
  currencyDisplay: CurrencyDisplay;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  compactView: boolean;
  reducedMotion: boolean;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notificationSound: boolean;
  soundPreference: NotificationSound;
  goalReminders: boolean;
  taskReminders: boolean;
  paymentReminders: boolean;
  milestoneCelebrations: boolean;
  weeklySummary: boolean;
  monthlyReport: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface PrivacySettings {
  profileVisibility: boolean;
  showAchievements: boolean;
  shareProgress: boolean;
  allowAnalytics: boolean;
  allowMarketing: boolean;
  dataExportPreferences?: Record<string, any>;
}

export interface SecuritySettings {
  loginAlerts: boolean;
  trustedDevicesOnly: boolean;
  trustedDevices?: string[];
  sessionTimeout: number;
}

export interface PreferencesSettings {
  dashboardWidgets: number;
  favoriteGoals: string[];
  pinnedTasks: string[];
  customCategories: Record<string, any>[];
}

export interface UserSettings {
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  preferences: PreferencesSettings;
}

export interface QuietHoursDto {
  enabled: boolean;
  start?: string;
  end?: string;
}

export interface ExportDataDto {
  includeProfile: boolean;
  includeGoals: boolean;
  includePlans: boolean;
  includeTasks: boolean;
  includeTransactions: boolean;
  dateRange: "all" | "year" | "month" | "custom";
  startDate?: Date;
  endDate?: Date;
  format: "json" | "csv" | "pdf";
}
