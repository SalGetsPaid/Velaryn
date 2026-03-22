export type ForgeBuildType = "quote" | "ideology" | "tip" | "insight";

export type DailyForgeBuild = {
  id: number;
  type: ForgeBuildType;
  title: string;
  body: string;
  author?: string;
  cta?: string;
};
