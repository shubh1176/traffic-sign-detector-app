import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppSettings, SettingsService } from '../services/settings.service';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const settingsService = SettingsService.getInstance();
  const [settings, setSettings] = useState<AppSettings>(settingsService.getSettings());

  useEffect(() => {
    settingsService.loadSettings();
    setSettings(settingsService.getSettings());
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    settingsService.updateSettings(newSettings);
    settingsService.saveSettings();
    setSettings(settingsService.getSettings());
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 