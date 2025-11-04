export const generatePublicUrl = (formId) => {
  return `${window.location.origin}/form/${formId}`;
};

export const formColumns = [
  { key: "id", label: "ID" },
  { key: "title", label: "Title" },
  {
    key: "redirect_url",
    label: "Redirect URL",
    render: (form) => <span className="url-cell">{form.redirect_url}</span>,
  },
  {
    key: "public_link",
    label: "Public Link",
    render: (form) => (
      <span className="url-cell">{generatePublicUrl(form.id)}</span>
    ),
  },
];

export const formActions = (
  fetchSubmissions,
  exportSubmissions,
  copyPublicLink,
  deleteForm,
  copiedId
) => [
  {
    onClick: (form) =>
      fetchSubmissions(typeof form === "object" ? form.id : form),
    className: "btn-primary",
    icon: "👁️",
    title: "View Submissions",
  },
  {
    onClick: (form) =>
      exportSubmissions(typeof form === "object" ? form.id : form),
    className: "btn-success",
    icon: "📊",
    title: "Export Excel",
  },
  {
    onClick: (form) =>
      copyPublicLink(typeof form === "object" ? form.id : form),
    className: copiedId === null ? "btn-info" : "btn-copied",
    icon: copiedId === null ? "🔗" : "✓",
    title: copiedId === null ? "Copy Link" : "Copied!",
  },
  {
    onClick: (form) => deleteForm(typeof form === "object" ? form.id : form),
    className: "btn-danger",
    icon: "🗑️",
    title: "Delete Form",
  },
];
