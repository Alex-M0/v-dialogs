/**
 * v-dialogs-forked
 */
import container from './Container';

const Plugin = {
    install: function (Vue, options = {}) {
        const Dialog = Vue.component(container.name, container);
        const dlg = new Dialog(options.extends);

        dlg.$mount(document.body.appendChild(document.createElement('div')));

        /**
         * Added custom language to plugin
         * ....
         * languages: {
         *     uk: {
         *         ....
         *     }
         * }
         * ....
         */
        if (typeof options.languages == 'object'){
            dlg.addLanguage(options.languages);
        }

        const mergeParams = (p) => {
            const params = {};

            params.language = typeof options.language === 'string' ? options.language : 'cn';

            if (typeof options.dialogCloseButton === 'boolean'){
                params.dialogCloseButton = options.dialogCloseButton;
            }

            if (typeof options.dialogMaxButton === 'boolean'){
                params.dialogMaxButton = options.dialogMaxButton;
            }

            return Object.assign({}, params, p);
        };

        const paramSet = (args) => {
            let params = {};

            if (args.length === 3 && typeof args[2] === 'object'){
                params = args[2];
            }

            if (args.length === 2 && typeof args[1] === 'object'){
                params = args[1];
            }

            if (typeof args[1] === 'function'){
                params.callback = args[1];
            }

            params = mergeParams(params);
            params.message = typeof args[0] === 'string' ? args[0] : '';

            return params;
        };

        const instanceName = options.instanceName || '$dlg';

        Object.defineProperty(Vue.prototype, instanceName, {
            writable : false,
            value: {
                modal(component, params = {}) {
                    if (!component) return;
                    params = mergeParams(params);
                    params.component = component;

                    return dlg.addModal(params);
                },
                /**
                 * Open a Alert dialog
                 *
                 * @param message[string](required)
                 * @param callback[function](optional)
                 * @param params[object](optional)
                 * @returns dialog key[string]
                 *
                 * //open a information type Alert dialog
                 * this.$dlg.alert('some message...')
                 * //open a information type Alert dialog and do something after dialog close
                 * this.$dlg.alert('some message...', ()=>{ do something... })
                 * //open a Alert dialog with options
                 * this.$dlg.alert('some message...', { messageType: 'error' })
                 * //open a Alert dialog with callback and options
                 * this.$dlg.alert('some message...', ()=>{ do something... }, { messageType: 'error' })
                 */
                alert() {
                    if (!arguments.length || !arguments[0]){
                        return;
                    }

                    return dlg.addAlert(paramSet(arguments));
                },
                mask() {
                    return dlg.addMask(paramSet(arguments));
                },
                toast() {
                    if (!arguments.length || !arguments[0]){
                        return;
                    }

                    return dlg.addToast(paramSet(arguments));
                },
                close(key) {
                    dlg.close(key);
                },
                closeAll(callback) {
                    dlg.closeAll(callback);
                },
            }
        });
    }
};

export default Plugin;