import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppProvider } from '@shopify/polaris';
import enTranslations from '@shopify/polaris/locales/en.json';
import { ErrorBoundary } from './ErrorBoundary';

function Boom(): never {
  throw new Error('boom-xyz');
}

describe('ErrorBoundary', () => {
  it('renders a Banner with the error message when a child throws', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <AppProvider i18n={enTranslations}>
        <ErrorBoundary>
          <Boom />
        </ErrorBoundary>
      </AppProvider>,
    );
    expect(screen.getByText('boom-xyz')).toBeInTheDocument();
    spy.mockRestore();
  });
});
