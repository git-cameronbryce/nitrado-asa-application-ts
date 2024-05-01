export interface GameserverResponse {
  data: {
    gameserver: {
      status: string;
      query: {
        server_name: string;
        player_current: number;
        player_max: number;
      };
    };
  };
};

export interface ServiceResponse {
  data: {
    services: {
      id: number;
      status: string;
      details: {
        folder_short: string
      };
      suspending_in: number;
    }[];
  };
};

export interface PlayerResponse {
  data: {
    message: string;
    data: {
      identifier: string[];
    };
  };
};