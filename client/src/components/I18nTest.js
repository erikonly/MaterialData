import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const I18nTest = () => {
  const { t, language, switchLanguage } = useLanguage();

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Internationalization Test</h2>
      
      <div className="space-y-3">
        <p><strong>Current Language:</strong> {language}</p>
        
        <div className="space-y-2">
          <p><strong>Database Title:</strong> {t('database.title')}</p>
          <p><strong>Repository Title:</strong> {t('repository.title')}</p>
          <p><strong>Common Search:</strong> {t('common.search')}</p>
          <p><strong>Loading:</strong> {t('common.loading')}</p>
        </div>
        
        <div className="space-y-2">
          <p><strong>With Parameters:</strong></p>
          <p>{t('database.materialsLoaded', { count: 42 })}</p>
          <p>{t('repository.selected', { count: 3 })}</p>
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => switchLanguage('zh')}
            className={`px-3 py-1 rounded text-sm ${
              language === 'zh' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            中文
          </button>
          <button 
            onClick={() => switchLanguage('en')}
            className={`px-3 py-1 rounded text-sm ${
              language === 'en' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            English
          </button>
        </div>
      </div>
    </div>
  );
};

export default I18nTest;