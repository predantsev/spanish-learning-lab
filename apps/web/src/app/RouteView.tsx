import type { Route } from '../router/routes.ts';
import { NotFound } from '../screens/NotFound.tsx';

export function RouteView({ route }: { readonly route: Route; readonly search: string }) {
  switch (route.name) {
    default:
      return <NotFound />;
  }
}
