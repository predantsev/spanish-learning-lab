import type { Route } from '../router/routes.ts';
import { CatalogScreen } from '../screens/Catalog.tsx';
import { HomeScreen } from '../screens/Home.tsx';
import { NotFound } from '../screens/NotFound.tsx';
import { PracticeSetScreen, ReviewScreen } from '../screens/Practice.tsx';

export function RouteView({ route }: { readonly route: Route; readonly search: string }) {
  switch (route.name) {
    case 'home':
      return <HomeScreen />;
    case 'catalog':
      return <CatalogScreen lessonId={route.lessonId} />;
    case 'review':
      return <ReviewScreen />;
    case 'practice':
      return <PracticeSetScreen key={route.setId} setId={route.setId} />;
    default:
      return <NotFound />;
  }
}
