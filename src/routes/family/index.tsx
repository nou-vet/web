import { Title } from '@solidjs/meta';
import { createTranslator } from '~/i18n';

function FamilyPage() {
  const t = createTranslator('family');

  return (
    <>
      <Title>{t('family.meta.title')}</Title>
      <section>"Welcome"</section>
    </>
  );
}

export default FamilyPage;
