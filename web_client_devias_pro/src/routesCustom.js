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
    path: '/algorithms',
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/algorithms',
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
    // todo Notice that I have commented out the parts of TopBar and Navbar (rendered by the DashboardLayout) that use a user.
    // this way even unauthenticated users can view the DashboardLayout. Re-enable them when you implement authentication
    layout: DashboardLayout,
    routes: [
      {
        exact: true,
        path: '/',
        component: AlgorithmsListView
      },
      {
        component: () => <Redirect to="/404" />
      }
    ]
  }
]

export default routes
