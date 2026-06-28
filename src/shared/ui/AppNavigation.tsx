import { Navigation } from '@shopify/polaris';
import { useLocation, useNavigate } from 'react-router-dom';

const ITEMS = [
  { label: 'Dashboard', path: '/' },
  { label: 'App Settings', path: '/settings' },
  { label: 'Popups', path: '/popups' },
  { label: 'Announcement Bars', path: '/announcement-bars' },
  { label: 'Product Sliders', path: '/product-sliders' },
];

/** Điều hướng client-side (onClick navigate) — không reload trang. */
export function AppNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Navigation location={location.pathname}>
      <Navigation.Section
        items={ITEMS.map((it) => ({
          label: it.label,
          selected: location.pathname === it.path,
          onClick: () => navigate(it.path),
        }))}
      />
    </Navigation>
  );
}
