import React, {
  Suspense,
  Fragment,
  lazy
} from 'react';
import {
  Switch,
  Redirect,
  Route
} from 'react-router-dom';
import DashboardLayout from 'src/layouts/DashboardLayout';
import DocsLayout from 'src/layouts/DocsLayout';
import MainLayout from 'src/layouts/MainLayout';
import HomeView from 'src/views/home/HomeView';
import LoadingScreen from 'src/components/LoadingScreen';
import AuthGuard from 'src/components/AuthGuard';
import GuestGuard from 'src/components/GuestGuard';
import HomePageCustom from "./homePageCustom";
import AlgorithmCreateUpdate from "./features/algorithms/AlgorithmCreateUpdate";
import AlgorithmsListView from "./features/algorithms/AlgorithmsListView";
import Circle from "./features/algorithms/Circle";

export const renderRoutes = (routes = []) => (
  <Suspense fallback={<LoadingScreen />}>
    <Switch>
      {routes.map((route, i) => {
        const Guard = route.guard || Fragment;
        const Layout = route.layout || Fragment;
        const Component = route.component;

        return (
          <Route
            key={i}
            path={route.path}
            exact={route.exact}
            render={(props) => (
              <Guard>
                <Layout>
                  {route.routes
                    ? renderRoutes(route.routes)
                    : <Component {...props} />}
                </Layout>
              </Guard>
            )}
          />
        );
      })}
    </Switch>
  </Suspense>
);

const routes = [
  {
    exact: true,
    path: '/404',
    component: lazy(() => import('src/views/errors/NotFoundView'))
  },
  {
    exact: true,
    guard: GuestGuard,
    path: '/login',
    component: lazy(() => import('src/views/auth/LoginView'))
  },
  {
    exact: true,
    path: '/login-unprotected',
    component: lazy(() => import('src/views/auth/LoginView'))
  },
  {
    exact: true,
    guard: GuestGuard,
    path: '/register',
    component: lazy(() => import('src/views/auth/RegisterView'))
  },
  {
    exact: true,
    path: '/register-unprotected',
    component: lazy(() => import('src/views/auth/RegisterView'))
  },
  {
    path: '/algorithms',
    guard: AuthGuard,
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/algorithms/list',
        component: AlgorithmsListView
      },
      {
        exact: true,
        path: '/algorithms/create',
        component: AlgorithmCreateUpdate
      },
      {
        exact: true,
        path: '/algorithms/:algorithmId',
        component: AlgorithmCreateUpdate
      }
    ]
  },
  {
    path: '*',
    // guard: AuthGuard,
    // Notice that I have changed TopBar and Navbar (rendered by the DashboardLayout) so that they can be rendered
    // without a logged in user (without a user object)
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/',
        component: AlgorithmsListView
      },
      {
        exact: true,
        path: '/animation',
        component: Circle
      },
      {
        component: () => <Redirect to="/404" />
      }
    ]
  }
]

export default routes
