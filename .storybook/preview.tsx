import type { Preview } from '@storybook/react'
import React from 'react'
import { HeroUIProvider } from '@heroui/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../src/lib/i18n/client'
import '../src/app/globals.css'

// グローバルデコレーター
const withProviders = (Story: any) => (
  <I18nextProvider i18n={i18n}>
    <HeroUIProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Story />
      </div>
    </HeroUIProvider>
  </I18nextProvider>
)

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#0f0f0f',
        },
      ],
    },
  },
  decorators: [withProviders],
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'ja',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'ja', title: '日本語' },
          { value: 'en', title: 'English' },
        ],
        showName: true,
      },
    },
  },
}

export default preview