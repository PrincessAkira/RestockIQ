export const formatDate = (isoDateStr) => {
  const date = new Date(isoDateStr);
  return date.toLocaleString("en-ZW", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};
