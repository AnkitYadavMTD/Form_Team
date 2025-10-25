# Task: Add 6 Predefined Form Templates to AdminCreateForm

## Steps to Complete

1. **Define 6 Form Templates**

   - Create objects for Contact, Registration, Survey, Feedback, Event Registration, and Job Application templates.
   - Each template includes predefined fields with label, type, required, and icon.

2. **Add Template Selection UI**

   - Add a dropdown or button group at the top of the form for selecting templates.
   - Include an option for "Custom" to allow manual field addition.

3. **Implement Template Selection Logic**

   - Add state for selectedTemplate.
   - When a template is selected, populate customFields with the template's fields.
   - Allow users to modify fields after selection (add/remove).

4. **Update Form Fields Preview**

   - Ensure the fields preview updates when a template is selected.
   - Maintain the ability to add custom fields on top of templates.

5. **Test Template Functionality**

   - Verify that selecting a template pre-populates fields correctly.
   - Test adding/removing fields after template selection.
   - Ensure form submission works with template fields.

6. **Update UI Styling**
   - Adjust CSS if needed for the new template selection UI.
   - Ensure responsive design for template options.
