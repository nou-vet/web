import { Title } from '@solidjs/meta';
import {
  createAsync,
  useAction,
  useSubmission,
  type RouteDefinition,
} from '@solidjs/router';
import { Match, Show, Suspense, Switch } from 'solid-js';
import {
  Button,
  ButtonLink,
  Drawer,
  Form,
  Icon,
  Menu,
  MenuItem,
  Text,
  TextField,
} from '@nou/ui';

import { getFamilyMembers, updateFamily } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { cacheTranslations, createTranslator } from '~/server/i18n';

import { AppHeader } from '~/lib/app-header';
import FamilyInviteDialog from '~/lib/family-invite/invite-dialog';
import { WaitingFamilyConfirmation } from '~/lib/family-invite/waiting-family-confirmation';

export const route = {
  load() {
    return Promise.all([
      cacheTranslations('family'),
      getUserFamily(),
      getFamilyMembers(),
    ]);
  },
} satisfies RouteDefinition;

function FamilyPage() {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const familyMembers = createAsync(async () => {
    const members = await getFamilyMembers();
    return members;
  });
  const isOwner = () => user()?.family.isOwner || false;
  const awaitingUser = () =>
    // The API also filters non-approved users from non-owners, but just in case
    isOwner() ? familyMembers()?.find((user) => !user.isApproved) : null;
  const members = () =>
    familyMembers()?.filter((user) => user.isApproved) ?? [];
  return (
    <>
      <Title>
        <Show when={user()?.family?.name} fallback={t('meta.title-new-user')}>
          {(familyName) => (
            <>
              {t('meta.title', {
                familyName: familyName(),
              })}
            </>
          )}
        </Show>
      </Title>
      <div class="bg-background min-h-full">
        <AppHeader>
          <ButtonLink href="/app" icon variant="ghost">
            <Icon use="chevron-left" />
          </ButtonLink>
        </AppHeader>
        <div class="flex flex-col gap-6">
          <FamilyHeader familyName={user()?.family.name} isOwner={isOwner()} />
          <section class="container flex flex-col gap-8">
            <Suspense>
              <Show when={awaitingUser()}>
                {(user) => <WaitingFamilyConfirmation user={user()} />}
              </Show>
            </Suspense>
            <Switch>
              <Match when={members().length > 0}>Render users!</Match>
              {/* technically it's not possible for non-owners to not see other members */}
              <Match when={isOwner() && members().length === 0}>
                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
                  <div class="order-2 flex flex-1 flex-col gap-2 sm:order-none">
                    <Text with="headline-2" as="h2">
                      {t('no-members-header')}
                    </Text>
                    <Text as="p">{t('no-members-description')}</Text>
                    <Button popoverTarget="family-invite">
                      {t('invite-cta')}
                    </Button>
                    <Suspense>
                      <FamilyInviteDialog id="family-invite" />
                    </Suspense>
                  </div>
                  <img
                    src="/assets/images/andriyko-podilnyk-dWSl8REfpoQ-unsplash.jpg?w=600&format=webp&imagetools"
                    alt=""
                    class="bg-primary/5 flex-2 mb-4 w-full rounded-3xl object-cover sm:max-w-[60vw]"
                  />
                </div>
              </Match>
            </Switch>
          </section>
        </div>
      </div>
    </>
  );
}

export default FamilyPage;

function FamilyHeader(props: {
  familyName: string | null | undefined;
  isOwner: boolean;
}) {
  const t = createTranslator('family');
  return (
    <section class="container">
      <div class="flex flex-col gap-4 md:max-w-[50vw]">
        <div class="flex-[2]">
          <FamilyNameForm />
        </div>
        <Show when={props.isOwner}>
          <div class="mb-2 flex flex-row gap-2">
            <Button
              class="gap-2"
              variant="tonal"
              size="sm"
              popoverTarget="family-invite"
            >
              <Icon use="user-circle-plus" />
              {t('action-add-users')}
            </Button>
            <Button
              size="sm"
              variant="tonal"
              popoverTarget="family-menu"
              class="gap-2"
            >
              <Icon use="dots-three-outline-vertical" />
              {t('action-more')}
            </Button>
            <Menu id="family-menu" placement="bottom-end">
              <MenuItem
                tone="destructive"
                popoverTarget="family-delete"
                as="button"
                type="button"
              >
                <Icon use="trash-simple" />
                {t('action-disassemble')}
              </MenuItem>
            </Menu>
            <DeleteFamilyDialog />
          </div>
        </Show>
      </div>
    </section>
  );
}

const DeleteFamilyDialog = () => {
  const t = createTranslator('family');

  return (
    <Drawer
      placement="center"
      id="family-delete"
      aria-labelledby="family-delete-headline"
      class="md:max-w-[600px]"
    >
      {(open) => (
        <Show when={open()}>
          <div class="flex flex-col gap-8">
            <Text
              with="headline-2"
              as="header"
              id="family-delete-headline"
              class="text-center md:text-start"
            >
              {t('delete-family-headline')}
            </Text>
            <div class="grid items-center gap-8 md:grid-cols-[1fr,2fr]">
              <div class="border-outline bg-primary-container/20 max-w-[200px] justify-self-center overflow-hidden rounded-full border-4">
                <img
                  src="/assets/images/family-breakup.png?w=300&format=webp"
                  class="max-w-full"
                  alt=""
                />
              </div>
              <div class="flex flex-col gap-4">
                <Text as="p">{t('delete-family-description')}</Text>
                <div class="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    popoverTarget="family-delete"
                    popoverTargetAction="hide"
                  >
                    {t('delete-family-cancel')}
                  </Button>
                  <Button variant="outline" tone="destructive">
                    {t('delete-family-cta')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Show>
      )}
    </Drawer>
  );
};

const FamilyNameForm = () => {
  const t = createTranslator('family');
  const user = createAsync(() => getUserFamily());
  const updateFamilyAction = useAction(updateFamily);
  const updateFamilySubmission = useSubmission(updateFamily);
  return (
    <Form
      onFocusOut={async (e) => {
        const form = new FormData(e.currentTarget);
        const newName = form.get('family-name')?.toString().trim();
        if (newName !== user()?.family.name) {
          await updateFamilyAction(form);
        }
      }}
      autocomplete="off"
      validationErrors={updateFamilySubmission.result?.errors}
      aria-disabled={updateFamilySubmission.pending}
    >
      <TextField
        as="textarea"
        variant="ghost"
        placeholder={t('no-name')}
        label={t('update-name-label')}
        aria-description={t('update-name-description')}
        name="family-name"
        aria-disabled={updateFamilySubmission.pending}
        suffix={<Icon use="pencil" size="sm" />}
        class="[&_textarea]:placeholder:text-on-surface w-full [&_textarea]:resize-none [&_textarea]:text-3xl [&_textarea]:font-semibold"
      >
        {user()?.family.name ?? ''}
      </TextField>
    </Form>
  );
};
