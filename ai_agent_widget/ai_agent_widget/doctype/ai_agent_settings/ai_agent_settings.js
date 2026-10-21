frappe.ui.form.on("AI Agent Settings", {
    async copy_active_api_key(frm) {
        if (frm.is_dirty()) {
            frappe.msgprint(__("Save your changes before revealing the saved API key."));
            return;
        }

        const response = await frappe.call({
            method: "ai_agent_widget.ai_agent_widget.doctype.ai_agent_settings.ai_agent_settings.get_active_api_key",
            type: "POST",
        });
        const key = response.message;
        if (!key) return;

        const dialog = new frappe.ui.Dialog({
            title: __("Saved API Key for {0}", [frm.doc.provider]),
            fields: [{ fieldtype: "HTML", fieldname: "key_preview" }],
            primary_action_label: __("Copy Key"),
            primary_action: async () => {
                let copied = false;
                try {
                    await navigator.clipboard.writeText(key);
                    copied = true;
                } catch (error) {
                    input.trigger("focus");
                    input[0].select();
                    copied = document.execCommand("copy");
                }
                if (copied) {
                    frappe.show_alert({ message: __("API key copied"), indicator: "green" });
                    dialog.hide();
                } else {
                    frappe.msgprint(__("Select the key shown in the dialog and copy it manually."));
                }
            },
        });
        dialog.show();

        const preview = dialog.fields_dict.key_preview.$wrapper;
        preview.append($("<label>").text(__("API Key")));
        const input = $("<input>", {
            type: "text",
            class: "form-control",
            readonly: true,
            autocomplete: "off",
            spellcheck: false,
        }).val(key);
        preview.append(input);
        dialog.$wrapper.on("hidden.bs.modal", () => input.val(""));
    },
});
