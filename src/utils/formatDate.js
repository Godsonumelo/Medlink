export function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

export function formatTime(dateString) {
  const options = { hour: "2-digit", minute: "2-digit" };
  return new Date(dateString).toLocaleTimeString("en-US", options);
}

export function formatDateTime(dateString) {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function getRelativeTime(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
}
