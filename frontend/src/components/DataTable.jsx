import "../pages/AdminDashboard.css";

function DataTable({ columns, data, actions, loading, emptyMessage }) {
  if (loading) {
    return <div className="loading-message">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="no-users">
        <div>{emptyMessage || "No data found"}</div>
        <small>All items have been processed</small>
      </div>
    );
  }

  return (
    <div className="users-table-container">
      <table className="users-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {actions && (
                <td>
                  <div className="table-actions">
                    {actions
                      .filter(
                        (action) => !action.condition || action.condition(item)
                      )
                      .map((action, index) => (
                        <button
                          key={index}
                          onClick={() => action.onClick(item)}
                          className={`action-btn btn-small ${action.className}`}
                          title={action.title}
                        >
                          {action.icon}
                        </button>
                      ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
