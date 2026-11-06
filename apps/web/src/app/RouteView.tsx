import type { Route } from '../router/routes.ts';
import { CatalogScreen } from '../screens/Catalog.tsx';
import { ExerciseScreen } from '../screens/exercise/ExerciseScreen.tsx';
import { HomeScreen } from '../screens/Home.tsx';
import { LessonScreen } from '../screens/Lesson.tsx';
import { ListeningScreen } from '../screens/Listening.tsx';
import { MaterialsScreen } from '../screens/Materials.tsx';
import { NotFound } from '../screens/NotFound.tsx';
import { CollectionScreen, PhrasesScreen } from '../screens/Phrases.tsx';
import { PracticeSetScreen, ReviewScreen } from '../screens/Practice.tsx';
import { ProgressScreen } from '../screens/Progress.tsx';
import { AgentsScreen, RecoveryScreen, SettingsScreen } from '../screens/Settings.tsx';

export function RouteView({ route }: { readonly route: Route; readonly search: string }) {
  switch (route.name) {
    case 'home':
      return <HomeScreen />;
    case 'catalog':
      return <CatalogScreen lessonId={route.lessonId} />;
    case 'lesson':
      return <LessonScreen key={route.lessonId} lessonId={route.lessonId} stepId={route.stepId} />;
    case 'exercise':
      return <ExerciseScreen key={route.taskRevisionId} taskRevisionId={route.taskRevisionId} />;
    case 'review':
      return <ReviewScreen />;
    case 'practice':
      return <PracticeSetScreen key={route.setId} setId={route.setId} />;
    case 'listening':
      return <ListeningScreen />;
    case 'phrases':
      return <PhrasesScreen phraseId={route.phraseId} />;
    case 'collection':
      return <CollectionScreen key={route.collectionId} collectionId={route.collectionId} />;
    case 'materials':
      return <MaterialsScreen key={route.topicId} topicId={route.topicId} />;
    case 'progress':
      return <ProgressScreen />;
    case 'settings':
      return <SettingsScreen />;
    case 'settings-agents':
      return <AgentsScreen />;
    case 'settings-recovery':
      return <RecoveryScreen />;
    case 'not-found':
      return <NotFound />;
  }
}
