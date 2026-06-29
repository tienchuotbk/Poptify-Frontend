import { NavMenu } from '@shopify/app-bridge-react';

/**
 * Nav của app render vào sidebar Shopify Admin (ngoài iframe) qua App Bridge NavMenu
 * (web component <ui-nav-menu>). Link đầu PHẢI có rel="home". Link active được Shopify
 * tự match theo URL hiện tại. Điều hướng do App Bridge xử lý (client-side, không reload).
 * Ref: https://shopify.dev/docs/api/app-home/app-bridge-web-components/app-nav
 */
export function AppNavigation() {
  return (
    <NavMenu>
      <a href="/" rel="home">
        Dashboard
      </a>
      <a href="/settings">App Settings</a>
      <a href="/popups">Popups</a>
      <a href="/announcement-bars">Announcement Bars</a>
      <a href="/product-sliders">Product Sliders</a>
    </NavMenu>
  );
}
