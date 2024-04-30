import type { InteractionInput, ServiceResponse, GameserverResponse } from '../../modules/interfaces';
import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { nitrado } from '../../other/config.json';
import axios, { AxiosResponse } from 'axios';

export const data = new SlashCommandBuilder()
  .setName('asa-player-ban')
  .setDescription('Performs an in-game player action.')
  .addStringOption(option => option.setName('username').setDescription('Selected action will be performed on given tag.').setRequired(true))
  .addStringOption(option => option.setName('reason').setDescription('Required to submit ban action.').setRequired(true)
    .addChoices({ name: 'Breaking Rules', value: 'breaking rules' }, { name: 'Cheating', value: 'cheating' }, { name: 'Behavior', value: 'behavior' }, { name: 'Meshing', value: 'meshing' }, { name: 'Other', value: 'other reasons' }))

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await interaction.deferReply({ ephemeral: false });

  const platforms: string[] = ['arksa'];

  const input: InteractionInput = {
    username: interaction.options.getString('username'),
    reason: interaction.options.getString('reason'),
    admin: interaction.user.id,
  };

  const gameserver = async (services: ServiceResponse) => {
    const tasks = services.data.services.map(async service => {
      const url: string = `https://api.nitrado.net/services/${service.id}/gameservers`;
      const response: AxiosResponse<GameserverResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
      console.log(response.data.data.gameserver.query.server_name)
    });
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