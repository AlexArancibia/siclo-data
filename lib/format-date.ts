export function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}`;
}

export const getDefaultMonthDateRange = () => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const format = (date: any) => date.toISOString().split("T")[0];

  return {
    from: format(firstDay),
    to: format(today),
  };
};