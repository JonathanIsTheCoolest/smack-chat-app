export const formatDate = (dateObj) => {
  const date = new Date(dateObj);
  const options = {
    weeday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  return date.toLocaleString('en-US', options);
}