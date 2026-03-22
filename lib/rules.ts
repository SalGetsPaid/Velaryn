export type Rule = {
  id: string;
  name: string;
  condition: (state: any) => boolean;
  action: (state: any) => any;
};
