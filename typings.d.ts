export interface loggedUser {
  username: string;
  email: string;
  dpurl: string;
  admin: boolean;
}

export interface UserData {
  id?: number;
  username: string;
  room: string;
  email: string;
  dpUrl: string;
  message: string;
  date: string;
  time: string;
  sender: string;
}

export type Room = [
  string,
  {
    admin: string;
    user: {
      username: string;
      email: string;
      dpurl: string;
      admin: boolean;
    };
    messages: {
      sender: string;
      message: string;
      date: string;
      time: string;
    }[];
  }
];

