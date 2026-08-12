export type PikoCodexStatus = {
  accountType: string | null;
  available: boolean;
  connected: boolean;
  email: string | null;
  error: string | null;
  planType: string | null;
};

export type PikoDeviceLogin = {
  loginId: string;
  type: "chatgptDeviceCode";
  userCode: string;
  verificationUrl: string;
};

export type PikoBrowserLogin = {
  authUrl: string;
  loginId: string;
  type: "chatgpt";
};
