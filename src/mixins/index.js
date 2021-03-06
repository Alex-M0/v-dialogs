import {commonConstants} from "../constants";

export default {
    props: {
        /**
         * Dialog background layer
         * @type boolean
         */
        backdrop: {
            type: Boolean,
            default: true
        },
        /**
         * The message show in dialog (work on alert, mask, toast mode)
         * @type string
         */
        message: String,
        /**
         * Dialog title bar text or title bar show control
         * @type string | boolean
         *
         * @example title: false// close title bar
         */
        titleBar: {
            type: [String, Boolean],
            default: 'Dialog'
        },
        contentClass: String,
        /**
         * Dialog width
         * @type number
         */
        width: {
            type: Number,
            default: 700
        },
        /**
         * Dialog height
         * @type number
         */
        height: {
            type: Number,
            default: 400
        },
        /**
         * Dialog min height
         * @type number
         */
        minHeight: {
            type: Number,
            default: -1
        },
        /**
         * Dialog max height
         * @type number
         */
        maxHeight: {
            type: Number,
            default: -1
        },
        i18n: Object,
        /**
         * Dialog inner key
         * @private
         */
        dialogKey: String,
        /**
         * Use custom class in Dialog
         * only work on Modal mode
         */
        customClass: '',
        /**
         * auto close dialog seconds
         * @type number | boolean
         */
        closeTime: {
            type: [Boolean, Number],
            default: false
        },
        /**
		 * Close dialog callback, trigger by some case:
         * click the close button in top right corner(Modal,Toast mode)
         * click 'cancel' button in Alert mode ('confirm' message type)
         *
         * @type function
         */
        cancelCallback: Function,
        dialogIndex: {
            type: Number,
            required: true
        },
        /**
         * Close dialog by press "Escape" button
         */
        escapeClose: {
            type: Boolean,
            default: true
        },
    },
    inject: ['type'],
    data(){
        return {
            bodyHeight: 50,
            dialogTop: 0,
            dialogZIndex: 0,
            backdropZIndex: 0,
            resizeTimeout: null,
            shake: false,
            show: false,
            dialogWidth: 0,
            dialogHeight: 0,
        };
    },

    beforeMount() {
        this.dialogWidth = this.width;
        this.dialogHeight = this.height;
    },

    methods: {
        /**
         * backdrop click animate
         */
        outsideClick(){
            this.shake = true;
            setTimeout(()=>{
                this.shake = false;
            }, 750);
        },
        /**
         * adjust position and size
         */
        adjust(){
            if (this.type == 'modal' && this.maximize){
                this.dialogTop = 0;
                return;
            }

            const browserHeight = window.innerHeight || document.documentElement.clientHeight;
            const dialogTop = (browserHeight - this.dialogHeight) / 2;

            if (dialogTop < 0){
                this.dialogTop = 0;
            }
            else {
                this.dialogTop = dialogTop;
            }
        },
        /**
         * Close current dialog
         * @param trigger [boolean] whether close dialog and trigger callback function
		 * @param data [object] return data when dialog close(only for modal)
         *
         * Return false from onVModalBeforeClose abort close dialog, return Object.data send to close event
         */
        closeDialog(trigger, data){
            if (this.$refs.component && typeof this.$refs.component['onVModalBeforeClose'] == 'function'){
                let result = this.$refs.component['onVModalBeforeClose'](trigger);

                if (result === false){
                    return;
                }

                if (typeof result == 'object' && typeof result.data != 'undefined'){
                    data = result.data;
                }
            }

            this.show = false;
            setTimeout(()=>{
                this.$emit('close',this.dialogKey, trigger, data);
            }, 200);
        },
        calcLayerLevel(){
            //z-index step number
            const step = 50;
            this.dialogZIndex = commonConstants.baseZIndex + (step * this.dialogIndex);
            this.backdropZIndex = this.dialogZIndex - 10;
        },
        autoClose(){
            //auto close dialog
            if(this.type !== 'modal' && this.closeTime){
                setTimeout(()=>{
                    this.closeDialog(false);
                }, this.closeTime * 1000);
            }
        },
        resizeThrottler(){
            // ignore resize events as long as an actualResizeHandler execution is in the queue
            if ( !this.resizeTimeout ) {
                this.resizeTimeout = setTimeout(()=>{
                    this.resizeTimeout = null;
                    this.adjust();
                    // The actualResizeHandler will execute at a rate of 15fps
                }, 100);
            }
        },

        onKeyupEvent(e){
            if (e.key == 'Escape'){
                this.closeDialog(true);
            }
        }
    },
    mounted(){
        this.show = true;
        this.calcLayerLevel();
        this.autoClose();

        if (this.escapeClose){
            this.$el.addEventListener('keyup', this.onKeyupEvent);
        }

        if(this.type !== 'toast'){
            window.addEventListener('resize', this.resizeThrottler, false);
        }
    },
    destroyed(){
        if (this.escapeClose){
          this.$el.removeEventListener('keyup', this.onKeyupEvent);
        }

        if(this.type !== 'toast'){
            window.removeEventListener('resize', this.resizeThrottler, false);
        }
    }
};
