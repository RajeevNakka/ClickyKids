import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, changeLanguage } from '../../i18n';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
    const { i18n, t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

    const handleLanguageChange = (langCode) => {
        changeLanguage(langCode);
        setIsOpen(false);
    };

    return (
        <div className="language-switcher">
            <button
                className="language-btn"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={t('settings.language')}
            >
                <span className="lang-flag">{currentLang.flag}</span>
                <span className="lang-code">{currentLang.code.toUpperCase()}</span>
            </button>

            {isOpen && (
                <div className="language-dropdown">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            className={`language-option ${lang.code === i18n.language ? 'active' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="lang-flag">{lang.flag}</span>
                            <span className="lang-native">{lang.nativeName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LanguageSwitcher;
