import type { ServiceResponse } from '../../modules/interfaces';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { nitrado } from '../../other/config.json';
import axios, { AxiosResponse } from 'axios';

export const data = new SlashCommandBuilder()
  .setName('asa-gameserver-restart')
  .setDescription('Performs an in-game server action.')
  .addStringOption(option => option.setName('identifier').setDescription('Selected action will be performed on given server.').setRequired(true))

export async function run({ interaction, client, handler }: SlashCommandProps) {
  await interaction.deferReply({ ephemeral: false });
  const platforms: string[] = ['arksa'];

  interface InteractionInput {
    identifier: string | null;
    admin: string;
  };

  interface GameserverRestart {
    status: string;
    message: string;
  };

  const input: InteractionInput = {
    identifier: interaction.options.getString('identifier'),
    admin: interaction.user.id
  };

  const successful = async () => {

  };

  const gameserver = async () => {
    try {
      const url: string = `https://api.nitrado.net/services/${input.identifier}/gameservers/restart`;
      const response: AxiosResponse<GameserverRestart> = await axios.post(url, { identifier: input.identifier }, { headers: { 'Authorization': nitrado.token } });
      if (response.status === 200) { await successful() };
    } catch (error: any) {
      if (error.response.data.message === "This service doesn't belong to you!") { console.log('Does not belong to you.') };
    };
  };

  const service = async () => {
    const url: string = 'https://api.nitrado.net/services';
    const response: AxiosResponse<ServiceResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
    if (response.status === 200) { await gameserver() };
  };

  await service();
};

export const options: CommandOptions = {
  userPermissions: ['Administrator'],
};