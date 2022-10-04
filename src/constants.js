const AVATARS_FUNCTION = (namingConvention, quantity) => {
  const avatars = [];
  for (let x = 0; x <= quantity; x++) {
    avatars.push(`${namingConvention}${x}.png`)
  }
  return avatars;
}

export const AVATARS_DARK = AVATARS_FUNCTION('/smack_chat_assets/dark', 27);
export const AVATARS_LIGHT = AVATARS_FUNCTION('/smack_chat_assets/light', 27);