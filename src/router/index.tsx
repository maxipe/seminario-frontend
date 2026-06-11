/**
 * Configuración de rutas de MiniMax con React Router v6.
 * Rutas públicas renderizan dentro de PageWrapper (layout route).
 * /mi-cuenta está protegida con BuyerRoute (solo buyers).
 * /proveedor/dashboard está protegida con SupplierRoute (solo suppliers).
 * * (wildcard) renderiza NotFoundPage fuera del layout.
 */

import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import PageWrapper from '../components/layout/PageWrapper';
import ScrollToTop from '../components/layout/ScrollToTop';
import { BuyerRoute } from '../components/layout/BuyerRoute';
import { SupplierRoute } from '../components/layout/SupplierRoute';
import HomePage from '../pages/HomePage';
import ExplorePage from '../pages/ExplorePage';
import GroupDetailPage from '../pages/GroupDetailPage';
import HowItWorksPage from '../pages/HowItWorksPage';
import SuppliersPage from '../pages/SuppliersPage';
import SupplierProfilePage from '../pages/SupplierProfilePage';
import MyAccountPage from '../pages/MyAccountPage';
import SupplierDashboardPage from '../pages/SupplierDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';

function Layout() {
  return (
    <PageWrapper>
      <ScrollToTop />
      <Outlet />
    </PageWrapper>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/explorar', element: <ExplorePage /> },
      { path: '/grupos/:id', element: <GroupDetailPage /> },
      { path: '/como-funciona', element: <HowItWorksPage /> },
      { path: '/proveedores', element: <SuppliersPage /> },
      { path: '/proveedor/perfil/:id', element: <SupplierProfilePage /> },
      {
        path: '/mi-cuenta',
        element: (
          <BuyerRoute>
            <MyAccountPage />
          </BuyerRoute>
        ),
      },
      {
        path: '/proveedor/dashboard',
        element: (
          <SupplierRoute>
            <SupplierDashboardPage />
          </SupplierRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
