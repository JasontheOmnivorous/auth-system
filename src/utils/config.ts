interface Config {
  emailHost: string;
  emailUserName: string;
  emailPort: number;
  emailPassword: string;
}

export const config: Config = {
  emailHost: process.env.EMAIL_HOST || "",
  emailUserName: process.env.EMAIL_USERNAME || "",
  emailPort: Number(process.env.EMAIL_PORT) || 0,
  emailPassword: process.env.EMAIL_PASSWORD || "",
};
