import type { InteractionInput, ServiceResponse, GameserverResponse, TokenResponse, GameserverSettings } from '../../modules/interfaces';
import type { SlashCommandProps, CommandOptions } from 'commandkit';
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { nitrado } from '../../other/config.json';
import axios, { AxiosResponse } from 'axios';
import { Rcon } from 'rcon-client';
import ini from 'ini';


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

  // const url = ``;

  const extraction = async (token: TokenResponse) => {
    const url: string = token.data.token.url;
    const response = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
    console.log(ini.parse(response.data))
  };

  const token = async (gameserver: GameserverResponse) => {
    const url: string = `https://api.nitrado.net/services/${gameserver.data.gameserver.service_id}/gameservers/file_server/download?file=/games/${gameserver.data.gameserver.username}/ftproot/arksa/ShooterGame/Saved/Config/WindowsServer/GameUserSettings.ini`
    const response: AxiosResponse<TokenResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
    if (response.status === 200) { await extraction(response.data); }
  };

  const gameserver = async (service: ServiceResponse) => {
    const tasks = service.data.services.map(async service => {
      if (platforms.includes(service.details.folder_short)) {
        try {
          const url: string = `https://api.nitrado.net/services/${service.id}/gameservers`;
          const response: AxiosResponse<GameserverResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
          if (response.status === 200) { await token(response.data) };
        } catch (error) { null };
      };
    });

    await Promise.all(tasks);
  };

  const service = async () => {
    const url: string = 'https://api.nitrado.net/services';
    const response: AxiosResponse<ServiceResponse> = await axios.get(url, { headers: { 'Authorization': nitrado.token } });
    response.status === 200 ? await gameserver(response.data) : console.log('Error');
  };

  await service();
};

export const options: CommandOptions = {
  userPermissions: ['Administrator'],
};