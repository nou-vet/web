'use server';

import { createHmac } from 'node:crypto';
import { getRequestEvent } from 'solid-js/web';

import { env } from '~/server/env';
import { createFamilyInvite } from '~/server/queries/createFamilyInvite';
import { getRequestUser } from '~/server/queries/getUserSession';

export async function getFamilyInvite() {
  const user = await getRequestUser();
  const event = getRequestEvent();
  try {
    const invite = await createFamilyInvite(user.userId);
    const data = new TextEncoder().encode(invite.id);
    const code = createHmac('sha256', env.INVITES_SECRET)
      .update(data)
      .digest('hex');
    const url = `${new URL(event!.request.url).origin}/family/invite/${code}`;

    return {
      url,
      expirationUnix: invite.expiresAt * 1000,
    };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
