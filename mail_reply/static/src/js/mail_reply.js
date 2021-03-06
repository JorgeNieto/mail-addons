odoo.define("mail_reply.reply", function(require) {
    "use strict";

    var core = require("web.core");
    var chat_manager = require("mail_base.base").chat_manager;

    var ChatAction = core.action_registry.get("mail.chat.instant_messaging");

    ChatAction.include({
        _selectMessage: function(message_id) {
            this._super.apply(this, arguments);
            var message = chat_manager.get_message(message_id);
            var subject = "";
            if (message.record_name) {
                subject = "Re: " + message.record_name;
            } else if (message.subject) {
                subject = "Re: " + message.subject;
            }
            this.extended_composer.set_subject(subject);
        },

        _onPostMessage: function(message) {
            var self = this;
            var options = this.selected_message ? {} : {channel_id: this.channel.id};
            if (this.selected_message) {
                message.subtype = "mail.mt_comment";
                message.subtype_id = false;
                message.message_type = "comment";
                message.content_subtype = "html";

                options.model = this.selected_message.model;
                options.res_id = this.selected_message.res_id;
                options.parent_id = this.selected_message.id;
            }
            chat_manager.post_message(message, options).then(function() {
                if (self.selected_message) {
                    self._renderSnackbar(
                        "mail.chat.MessageSentSnackbar",
                        {record_name: self.selected_message.record_name},
                        5000
                    );
                    self._unselectMessage();
                } else {
                    self.thread.scroll_to();
                }
            });
        },
    });

    return chat_manager;
});
