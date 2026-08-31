import { RouteObject } from 'react-router';
import { lazy } from 'react';
import UniversitySelectorPage from './pages/university-selector';
import PrivacyPolicyPage from './pages/privacy';
import TermsOfUsePage from './pages/terms';
import ProdNotFoundPage from './pages/_404';

const NotFoundPage = ProdNotFoundPage;

const BentleyHomePage      = lazy(() => import('./pages/index'));
const LoginPage            = lazy(() => import('./pages/login'));
const SignupPage           = lazy(() => import('./pages/signup'));
const CheckInPage          = lazy(() => import('./pages/checkin'));
const DiscoverPage         = lazy(() => import('./pages/discover'));
const DiscoverEventsPage   = lazy(() => import('./pages/discover-events'));
const DashboardPage        = lazy(() => import('./pages/dashboard'));
const OfficerPage          = lazy(() => import('./pages/officer'));
const MyClubPage           = lazy(() => import('./pages/my-club'));
const ClubProfilePage      = lazy(() => import('./pages/club-profile'));
const AboutPage            = lazy(() => import('./pages/about'));
const TermsPage            = lazy(() => import('./pages/terms'));
const PrivacyPage          = lazy(() => import('./pages/privacy'));

export const routes: RouteObject[] = [
  { path: '/',                          element: <UniversitySelectorPage /> },
  { path: '/bentley',                   element: <BentleyHomePage /> },
  { path: '/login',                     element: <LoginPage /> },
  { path: '/signup',                    element: <SignupPage /> },
  { path: '/checkin/:token',            element: <CheckInPage /> },
  { path: '/bentley/discover',          element: <DiscoverPage /> },
  { path: '/bentley/discover/events',   element: <DiscoverEventsPage /> },
  { path: '/bentley/clubs/:id',         element: <ClubProfilePage /> },
  { path: '/dashboard',                 element: <DashboardPage /> },
  { path: '/officer',                   element: <OfficerPage /> },
  { path: '/my-club',                   element: <MyClubPage /> },
  { path: '/about',                     element: <AboutPage /> },
  { path: '/terms',                     element: <TermsPage /> },
  { path: '/privacy',                   element: <PrivacyPage /> },
  {
    path: '/privacy',
    element: <PrivacyPolicyPage />,
  },
  {
    path: '/terms',
    element: <TermsOfUsePage />,
  },
  { path: '*',                          element: <NotFoundPage /> },
];

export type Path =
  | '/'
  | '/bentley'
  | '/login'
  | '/signup'
  | '/checkin/:token'
  | '/bentley/discover'
  | '/bentley/discover/events'
  | '/bentley/clubs/:id'
  | '/my-club'
  | '/about'
  | '/terms'
  | '/privacy';

export type Params = Record<string, string | undefined>;
