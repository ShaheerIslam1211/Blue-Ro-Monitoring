import React, { useEffect } from 'react';
import './translate.css';

// Custom language names like German etc for users to change languages easily.......
const customLanguageNames = {
  en: 'English',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  fr: 'French',
  ur: 'Urdu',
  de: 'German',
};

const GTranslate = () => {
  useEffect(() => {
    window.gtranslateSettings = {
      default_language: 'en',
      native_language_names: false,
      detect_browser_language: true,
      languages: ['en', 'zh-CN', 'zh-TW', 'fr', 'ur', 'de'],
      wrapper_selector: '.gtranslate_wrapper',
      flag_size: 16,
      switcher_horizontal_position: 'right',
      switcher_vertical_position: 'top',
      flag_style: '3d',
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.gtranslate.net/widgets/latest/dwf.js';
    script.defer = true;
    document.body.appendChild(script);

    // Here we caN modify language names in the GTranslate popup
    const modifyLanguageNames = () => {
      const interval = setInterval(() => {
        const languageElements = document.querySelectorAll('.gt_languages a');
        if (languageElements.length > 0) {
          languageElements.forEach((el) => {
            const langCode = el.getAttribute('data-gt-lang');
            if (customLanguageNames[langCode]) {
              const nameSpan = el.querySelector('span');
              if (nameSpan) {
                nameSpan.textContent = customLanguageNames[langCode];
              }
            }
          });
          clearInterval(interval);
        }
      }, 100);
    };

    script.onload = modifyLanguageNames;

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div className="gtranslate_wrapper"></div>;
};

export default GTranslate;
