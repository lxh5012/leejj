(function ($) {
    'use strict';
    var containers = {},
        messages = {},
        notify = function (options) {
            if ($.type(options) === 'string') {
                options = { message: options };
            }
            if (arguments[1]) {
                options = $.extend(options, $.type(arguments[1]) === 'string' ? { status: arguments[1] } : arguments[1]);
            }
            return (new Message(options)).show();
        },
        closeAll = function (group, instantly) {
            var id;
            if (group) {
                for (id in messages) { if (group === messages[id].group) messages[id].close(instantly); }
            } else {
                for (id in messages) { messages[id].close(instantly); }
            }
        };
    var Message = function (options) {
        // var $this = this;
        this.options = $.extend({}, Message.defaults, options);
        this.uuid = 'ID' + (new Date().getTime()) + 'RAND' + (Math.ceil(Math.random() * 100000));
        // status icon
        var type = '';
        switch (options.status) {
            case 'danger':
                type = 'h-icon-all-close-circle';
                break;
            case 'success':
                type = 'h-icon-all-check-circle';
                break;
            case 'warning':
                type = 'h-icon-all-exclamation-circle';
                break;
            case 'info':
                type = 'h-icon-all-exclamation-circle';
                break;
            default:
                type = 'h-icon-all-info-cirlce';
                break
        }
        this.element = $([
            // @geedmo: alert-dismissable enables bs close icon
            '<div class="uk-notify-message alert-dismissable">',
                // '<a class="close">&times;</a>',
                '<i class="icon aufontAll ' + type + '"></i>',
                '<span class="notice-text">' + this.options.message + '</span>',
            '</div>'
        ].join('')).data('notifyMessage', this);
        // status
        if (this.options.status) {
            this.element.find('.icon').addClass('icon-' + this.options.status);
            this.element.css({'background': '#fff',});
            this.currentstatus = this.options.status;
        } else {
            this.element.find('.icon').addClass('icon-status');
        }
        this.group = this.options.group;
        messages[this.uuid] = this;
        if (!containers[this.options.pos]) {
            containers[this.options.pos] = $('<div class="uk-notify uk-notify-' + this.options.pos + '"></div>').appendTo('body').on('click', '.uk-notify-message', function () {
                $(this).data('notifyMessage').close();
            });
        }
    };
    $.extend(Message.prototype, {
        uuid: false,
        element: false,
        timout: false,
        currentstatus: '',
        group: false,
        show: function () {
            if (this.element.is(':visible')) return;
            var $this = this;
            containers[this.options.pos].show().prepend(this.element);
            var marginbottom = parseInt(this.element.css('margin-bottom'), 10);
            this.element.css({ 'opacity': 0, 'margin-top': -1 * this.element.outerHeight(), 'margin-bottom': 0 }).animate({ 'opacity': 1, 'margin-top': 0, 'margin-bottom': marginbottom }, function () {
                if ($this.options.timeout) {
                    var closefn = function () { $this.close(); };
                    $this.timeout = setTimeout(closefn, $this.options.timeout);
                    $this.element.hover(
                        function () { clearTimeout($this.timeout); },
                        function () { $this.timeout = setTimeout(closefn, $this.options.timeout); }
                    );
                }
            });
            return this;
        },
        close: function (instantly) {
            var $this = this,
                finalize = function () {
                    $this.element.remove();
                    if (!containers[$this.options.pos].children().length) {
                        containers[$this.options.pos].hide();
                    }
                    delete messages[$this.uuid];
                };
            if (this.timeout) clearTimeout(this.timeout);
            if (instantly) {
                finalize();
            } else {
                this.element.animate({ 'opacity': 0, 'margin-top': -1 * this.element.outerHeight(), 'margin-bottom': 0 }, function () {
                    finalize();
                });
            }
        },
        content: function (html) {
            var container = this.element.find('>div');
            if (!html) {
                return container.html();
            }
            container.html(html);
            return this;
        },
        status: function (status) {
            if (!status) {
                return this.currentstatus;
            }
            this.element.removeClass('alert alert-' + this.currentstatus).addClass('alert alert-' + status);
            this.currentstatus = status;
            return this;
        }
    });
    Message.defaults = {
        message: '',
        status: 'normal',
        timeout: 3000,
        group: null,
        pos: 'top-center'
    };

    $.notify = notify;
    $.notify.message = Message;
    $.notify.closeAll = closeAll;

    return notify;
}(jQuery));