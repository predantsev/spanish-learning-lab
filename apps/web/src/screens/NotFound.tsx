import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components/Common.tsx';
import { Link } from '../router/history.tsx';
import { paths } from '../router/routes.ts';

export function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="page">
      <PageHeader title={t('notFound.title')} lead={t('notFound.body')} />
      <Link to={paths.home()} className="btn btn-primary">
        {t('notFound.home')}
      </Link>
    </div>
  );
}
