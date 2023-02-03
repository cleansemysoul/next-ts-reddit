export const secondsToFullTime = (seconds: number): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  }).format(new Date(seconds * 1000));
};
export const secondsToFullDate = (seconds: number): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(new Date(seconds * 1000));
};
