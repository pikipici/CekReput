import { createContext, useContext, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

type Language = 'en' | 'id'

interface LanguageContextType {
  language: Language
  changeLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n, t } = useTranslation()

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang)
  }

  const value: LanguageContextType = {
    language: i18n.language as Language,
    changeLanguage,
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
