import { Page, Card, Text, BlockStack } from '@shopify/polaris';
import { DashboardOnboarding } from '../components/DashboardOnboarding';

export function DashboardPage() {
  return (
    <Page title="Dashboard">
      <BlockStack gap="400">
        <DashboardOnboarding />
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Poptify Admin
            </Text>
            <Text as="p" tone="subdued">
              Quản lý Popups, Announcement Bars và Product Sliders cho cửa hàng của bạn.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
