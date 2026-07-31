import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const CONNECTOR_ID = '6a600e70ee3817672e5197ce';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
    const response = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      return Response.json({ error: `Discord API error ${response.status}` }, { status: 400 });
    }
    const me = await response.json();
    const avatar = me.avatar
      ? `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.png?size=128`
      : null;
    return Response.json({
      id: me.id,
      username: me.global_name || me.username,
      avatar,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}