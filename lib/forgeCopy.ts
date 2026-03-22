export const forgeCTAs = {
  connect: "Forge the Link",
  deploy: "Strike Now",
  share: "Etch This Legacy",
  save: "Preserve in the Vault",
  confirm: "Seal the Forge",
  cancel: "Recall the Hammer",
};

export function getForgeCTA(key: keyof typeof forgeCTAs): string {
  return forgeCTAs[key] || key;
}
