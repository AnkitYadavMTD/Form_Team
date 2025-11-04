function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  className = "",
  ...props
}) {
  const inputClass = `form-input ${className}`;

  return (
    <div className="form-group">
      {label && (
        <label className="form-label">
          {icon && <span className="label-icon">{icon}</span>}
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {type === "textarea" ? (
        <textarea
          className={`${inputClass} form-textarea`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows="4"
          {...props}
        />
      ) : (
        <input
          type={type}
          className={inputClass}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          {...props}
        />
      )}
    </div>
  );
}

export default FormField;
