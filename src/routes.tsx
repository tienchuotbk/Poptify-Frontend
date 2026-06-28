import { type RouteObject } from 'react-router-dom';
import { AppLayout } from './App';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { AppSettingsPage } from './features/app-settings/pages/AppSettingsPage';
import { PopupsPage } from './features/popups/pages/PopupsPage';
import { PopupFormPage } from './features/popups/pages/PopupFormPage';
import { AnnouncementBarsPage } from './features/announcement-bars/pages/AnnouncementBarsPage';
import { AnnouncementBarFormPage } from './features/announcement-bars/pages/AnnouncementBarFormPage';
import { ProductSlidersPage } from './features/product-sliders/pages/ProductSlidersPage';
import { ProductSliderFormPage } from './features/product-sliders/pages/ProductSliderFormPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'settings', element: <AppSettingsPage /> },
      { path: 'popups', element: <PopupsPage /> },
      { path: 'popups/new', element: <PopupFormPage /> },
      { path: 'popups/:id/edit', element: <PopupFormPage /> },
      { path: 'announcement-bars', element: <AnnouncementBarsPage /> },
      { path: 'announcement-bars/new', element: <AnnouncementBarFormPage /> },
      { path: 'announcement-bars/:id/edit', element: <AnnouncementBarFormPage /> },
      { path: 'product-sliders', element: <ProductSlidersPage /> },
      { path: 'product-sliders/new', element: <ProductSliderFormPage /> },
      { path: 'product-sliders/:id/edit', element: <ProductSliderFormPage /> },
    ],
  },
];
