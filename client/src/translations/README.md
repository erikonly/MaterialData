# Internationalization (i18n) Implementation

This directory contains the translation files for the Materials Database Platform.

## Supported Languages

- **Chinese (zh)** - Default language
- **English (en)** - Secondary language

## File Structure

```
translations/
├── zh.js          # Chinese translations
├── en.js          # English translations
└── README.md      # This file
```

## Usage

The internationalization system is implemented using React Context and provides:

1. **Language Context**: `LanguageContext` provides language state and translation functions
2. **Translation Hook**: `useLanguage()` hook for accessing translations in components
3. **Language Switcher**: `LanguageSwitcher` component for switching between languages
4. **Persistent Storage**: Language preference is saved to localStorage

### Basic Usage

```javascript
import { useLanguage } from "../contexts/LanguageContext";

const MyComponent = () => {
  const { t, language, switchLanguage } = useLanguage();

  return (
    <div>
      <h1>{t("database.title")}</h1>
      <p>{t("database.subtitle")}</p>
      <button onClick={() => switchLanguage("en")}>Switch to English</button>
    </div>
  );
};
```

### Translation with Parameters

```javascript
// Translation file
export default {
  messages: {
    welcome: "Welcome {{name}}!",
    itemCount: "Found {{count}} items",
  },
};

// Component usage
const message = t("messages.welcome", { name: "John" });
const count = t("messages.itemCount", { count: 42 });
```

## Translation Keys Structure

The translation keys are organized hierarchically:

- `common.*` - Common UI elements (buttons, labels, etc.)
- `nav.*` - Navigation items
- `database.*` - Interactive Database page
- `repository.*` - Data Repository page
- `comparison.*` - Material Comparison features
- `materialDetail.*` - Material Detail page
- `language.*` - Language switcher
- `errors.*` - Error messages

## Adding New Translations

1. Add the key-value pair to both `zh.js` and `en.js`
2. Use nested objects for organization
3. Use `{{parameter}}` syntax for dynamic values
4. Keep keys descriptive and hierarchical

Example:

```javascript
// zh.js
export default {
  newFeature: {
    title: '新功能',
    description: '这是一个新功能的描述',
    button: '点击这里'
  }
};

// en.js
export default {
  newFeature: {
    title: 'New Feature',
    description: 'This is a description of the new feature',
    button: 'Click Here'
  }
};
```

## Language Switching

Users can switch languages using:

1. The language switcher component in the header
2. Keyboard shortcuts (if implemented)
3. URL parameters (if implemented)

The selected language is automatically saved to localStorage and restored on page reload.

## Content Handling

- **UI Text**: All interface text is translated
- **Scientific Content**: Research papers, material names, and technical data remain in their original language (typically English)
- **Mixed Content**: Some content may be bilingual where appropriate

## Implementation Notes

- Default language is Chinese (zh)
- Fallback to English if Chinese translations fail to load
- Translation keys that don't exist will display the key name as fallback
- Console warnings are shown for missing translation keys in development
