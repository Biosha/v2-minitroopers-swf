export const checkNameValide = (name: string | undefined) => {
  if (
    !name ||
    typeof name !== "string" ||
    name.length < 4 ||
    name.length > 22 ||
    !name.match(/^[a-zA-Z ]*$/)
  ) {
    return false;
  }

  if (hasForbiddenWord(name)) {
    return false;
  }

  return true;
};

const forbiddenName: string[] = [
  "admin",
  "api",
  "army",
  "discord",
  "eternaltwin",
  "false",
  "invite",
  "maintenance",
  "null",
  "oauth",
  "ranking",
  "true",
  "undefined",
  "war",
];
const hasForbiddenWord = (name: string) => {
  return forbiddenName.some((x) =>
    name.toLocaleLowerCase().includes(x.toLocaleLowerCase()),
  );
};

export const randomMinMax = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min) + min);
};
