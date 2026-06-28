import { Component, type ReactNode } from 'react';
import { Banner, Page } from '@shopify/polaris';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Bắt lỗi render của subtree, hiển thị Banner. Message render qua text node (auto-escape).
 * KHÔNG log token/secret (chỉ message).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error.message);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <Page title="Đã xảy ra lỗi">
          <Banner tone="critical" title="Ứng dụng gặp sự cố">
            {this.state.error.message}
          </Banner>
        </Page>
      );
    }
    return this.props.children;
  }
}
