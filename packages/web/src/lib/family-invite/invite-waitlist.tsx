import { createAsync, revalidate, useMatch } from '@solidjs/router';
import { Match, onMount, Show, Suspense, Switch } from 'solid-js';
import { Avatar, Button, ButtonLink, Card, Icon, Text } from '@nou/ui';
import { UTCDate } from '@date-fns/utc';
import { differenceInMinutes } from 'date-fns/differenceInMinutes';

import { getFamilyMembers } from '~/server/api/family';
import { getUserFamily } from '~/server/api/user';
import { createTranslator } from '~/server/i18n';

import { FamilyNameForm } from './family-name-form';
import { WaitingFamilyConfirmation } from './waiting-family-confirmation';

export const InviteWaitlist = (props: { onNext: () => void }) => {
  const t = createTranslator('family');

  const user = createAsync(() => getUserFamily());

  // ensure we call update
  onMount(() => {
    revalidate(getFamilyMembers.key);
  });

  const recentMember = createAsync(async () => {
    const members = await getFamilyMembers();
    return (
      members.find((member) => member.role === 'waiting') ||
      members.find((member) => {
        return (
          differenceInMinutes(new UTCDate(), new UTCDate(member.joinedAt)) < 60
        );
      })
    );
  });

  return (
    <div class="flex flex-col gap-6">
      <Suspense
        fallback={
          // TODO: Create Skeleton component
          <div class="bg-on-surface/12 h-[200px] w-full animate-pulse self-center rounded-3xl" />
        }
      >
        <Switch>
          <Match when={!recentMember()}>
            <div class="flex flex-col items-center justify-center gap-6">
              <Icon
                use="video-conference"
                size="lg"
                class="text-on-primary-container"
              />
              <Text class="text-balance text-center">
                {t('invite.waitlist-empty')}
              </Text>
            </div>
          </Match>
          <Match when={recentMember()!.role === 'waiting' && recentMember()}>
            {(user) => <WaitingFamilyConfirmation user={user()} />}
          </Match>
          <Match when={recentMember()!.role === 'member' && recentMember()}>
            {(member) => (
              <NewlyJoinedMember
                familyName={user()?.family?.name}
                user={member()}
                onNavigate={() => {
                  props.onNext();
                }}
              />
            )}
          </Match>
        </Switch>
        <Button
          onClick={() => {
            props.onNext();
          }}
        >
          {t('invite.waitlist-done')}
        </Button>
      </Suspense>
    </div>
  );
};

const NewlyJoinedMember = (props: {
  familyName: string | null | undefined;
  user: {
    id: number;
    name: string | null;
    avatarUrl: string | null;
  };
  onNavigate: () => void;
}) => {
  const t = createTranslator('family');
  const isFamilyUrl = useMatch(() => '/app/family');

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-row items-end gap-4">
        <div class="flex-[2]">
          <FamilyNameForm familyName={props.familyName} />
        </div>
        <Show when={!isFamilyUrl()}>
          <ButtonLink
            href="/app/family"
            onClick={props.onNavigate}
            icon
            variant="ghost"
          >
            <Icon use="arrow-up-right" size="md" />
          </ButtonLink>
        </Show>
      </div>
      <Card
        variant="outlined"
        class="flex flex-col gap-4"
        style={{ 'view-transition-name': `family-member-${props.user.id}` }}
      >
        {/* TODO: Chip? Tag component? */}
        <div class="bg-primary-container text-on-primary-container -me-2 -mt-2 flex cursor-default flex-row items-center gap-2 self-end rounded-full p-2">
          <Icon use="check-fat" size="xs" />
          <Text with="label-sm">{t('waitlist.just-joined')}</Text>
        </div>

        <ButtonLink
          href={`/app/family/${props.user.id}`}
          variant="ghost"
          class="-m-3 flex flex-row items-center justify-start gap-4 rounded-xl p-3"
          onClick={props.onNavigate}
        >
          <Avatar
            avatarUrl={props.user.avatarUrl || ''}
            name={props.user.name || ''}
            size="xl"
          />
          <Text with="body-xl">{props.user.name}</Text>
          <Icon
            use="carret-right"
            size="md"
            class="text-on-surface/80 ms-auto"
          />
        </ButtonLink>
      </Card>
    </div>
  );
};
