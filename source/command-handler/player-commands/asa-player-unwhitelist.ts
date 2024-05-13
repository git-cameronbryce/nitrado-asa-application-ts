import type { ServiceResponse, PlayerResponse, GameserverResponse } from '../../modules/interfaces';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { nitrado } from '../../other/config.json';
import axios, { AxiosResponse } from 'axios';

export const data = new SlashCommandBuilder()
  .setName('asa-player-unwhitelist')
  .setDescription('Performs an in-game player action.')
  .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true))

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await interaction.deferReply({ ephemeral: false });
  const platforms: string[] = ['arksa'];

  interface InteractionInput {
    username: string | null;
    admin: string;
  };

  const input: InteractionInput = {
    username: interaction.options.getString('username'),
    admin: interaction.user.id,
  };

  let total: number = 0;
  let outage: number = 0;
  let success: number = 0;
  const action = async (service: { id: number }) => {
    try {
      const url: string = `https://api.nitrado.net/services/${service.id}/gameservers/games/whitelist`;
      const response: AxiosResponse<PlayerResponse> = await axios.delete(url, { headers: { 'Authorization': nitrado.token }, data: { identifier: input.username } });
      if (response.status === 200) { success++ };
    } catch (error: any) {
      if (error.response.data.message === "The service is currently in state 3 but it expecting state 2.") { outage++ }
      if (error.response.data.message === "Can't add the user to the banlist.") { success++ };
    };
  };

  const gameserver = async (services: ServiceResponse) => {
    const tasks = services.data.services.map(async service => {
      const url: string = `https://api.nitrado.net/services/${service.id}/gameservers`;
      const response: AxiosResponse<GameserverResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
      if (response.status === 200 && platforms.includes(service.details.folder_short)) { (await action(service), total++) };
    });

    await Promise.all(tasks);

    const embed = new EmbedBuilder()
      .setDescription(`**Game Command Success**\nGameserver action completed.\nExecuted on \`${success}\` of \`${total}\` servers.`)
      .setThumbnail('https://i.imgur.com/CzGfRzv.png')
      .setColor('#2ecc71')

    await interaction.followUp({ embeds: [embed] });
  };

  const service = async () => {
    const url: string = 'https://api.nitrado.net/services';
    const response: AxiosResponse<ServiceResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
    if (response.status === 200) { await gameserver(response.data) };
  };

  await service();
};

export const options: CommandOptions = {
  userPermissions: ['Administrator'],
};