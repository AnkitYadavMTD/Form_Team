import Modal from "./Modal";
import "../pages/AdminDashboard.css";

function SubmissionModal({ form, submissions, onClose }) {
  if (!form) return null;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Submissions for "${form.title}"`}
    >
      <div>Modal is open</div>
      {submissions.length === 0 ? (
        <div className="no-submissions">
          <div>No submissions yet</div>
          <small>Share the public link to start collecting responses</small>
        </div>
      ) : (
        <div className="submissions-table-container">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Number</th>
                <th>PAN</th>
                {form.fields &&
                  form.fields.map((field) => (
                    <th key={field.id}>{field.label}</th>
                  ))}
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub.id}>
                  <td>{sub.data.name || ""}</td>
                  <td>{sub.data.number || ""}</td>
                  <td>{sub.data.pan || ""}</td>
                  {form.fields &&
                    form.fields.map((field) => {
                      const fieldKey = field.label
                        .toLowerCase()
                        .replace(/\s+/g, "_");
                      return (
                        <td key={field.id}>
                          {sub.data[fieldKey] || sub.data[field.label] || ""}
                        </td>
                      );
                    })}
                  <td>{new Date(sub.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );
}

export default SubmissionModal;
