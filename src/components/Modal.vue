<template>
    <div>
        <div dialog="v-dialog" tabindex="-1" :class="classes" :style="[{'z-index':dialogZIndex}]"
             @click.self="outsideClick" >

            <div :class="['v-dialog-dialog', {'v-dialog-default-animated': animate}]"
                 :style="{width:dialogWidth+'px',height:dialogHeight+'px',top:dialogTop+'px'}">
                <transition name="v-dialog--smooth" :appear="true" >
                    <div :class="['v-dialog-content']" v-show="show" >

                        <div class="v-dialog-header" ref="header" v-if="titleBar !== false">
                            <button type="button" class="v-dialog-btn__close" v-if="dialogCloseButton"
                                    @click="closeDialog(true)">
                                <i class="dlg-icon-font dlg-icon-close"></i>
                            </button>
                            <button type="button" class="v-dialog-btn__maximize"
                                    v-if="dialogMaxButton" @click="max(true)" >
                                <i :class="['dlg-icon-font', maximize?'dlg-icon-restore':'dlg-icon-max']"></i>
                            </button>
                            <h3 v-html="titleBar"></h3>
                        </div>

                        <div
                            class="v-dialog-body"
                            :style="{height: modalHeight, 'min-height': minHeight > -1 ? minHeight + 'px' : modalHeight, 'max-height': maxHeight > -1 ? maxHeight + 'px' : false}"
                        >
                            <component ref="component" :is="component" v-bind="params" v-on="handlers"></component>
                        </div>

                    </div>
                </transition>
            </div>
        </div>

        <transition name="v-dialog--fade" :appear="true" >
            <div class="v-dialog-overlay" :style="{'z-index':backdropZIndex}" v-if="backdrop && show"></div>
        </transition>
    </div>
</template>

<script>
    import mixins from '../mixins';
    export default {
        name: "DialogModal",
        mixins: [mixins],
        props: {
            /**
             * Component object or dynamic import
             */
            component: Object | Promise,
            /**
             * Send parameters to Component
             * you need use props to receive this params in component
             */
            params: Object,
            /**
             * Full screen dialog
             * @type boolean
             * @deprecated Use fullScreen option
             */
            fullWidth: {
                type: Boolean,
                default: false
            },
            /**
             * Show modal in full screen dialog (maximize)
             * @type boolean
             */
            fullScreen: {
                type: Boolean,
                default: false
            },
            dialogMaxButton: {
                type: Boolean,
                default: true
            },
            dialogCloseButton: {
                type: Boolean,
                default: true
            },
            /**
             * Triggered when user click on maximize or minimize button
             *
             * calling resizeCallback({boolean} maximize)
             */
            resizeCallback: Function,
        },
        data(){
            return {
                maximize: false,
                animate: false,
                handlers: {
                    close: this.modalClose,
                    vModalSetSize: this.setSize,
                    vModalChangeTitle: this.changeTitle,
                    vModalResizeModal: this.resizeModal,
                }
            };
        },
        computed: {
            classes(){
                return {
                    'v-dialog': true,
                    'v-dialog-modal': true,
                    'v-dialog--maximize': this.maximize,
                    'v-dialog--buzz-out': this.shake
                };
            },
            modalHeight(){
                if (this.bodyHeight){
                    return this.bodyHeight + 'px';
                }

                return '100%';
            },
        },
        methods: {
            /**
             * dialog max size
             *
             * Return false from onVModalBeforeResize abort resize
             */
            max(trigger){
                if (trigger && this.$refs.component && typeof this.$refs.component['onVModalBeforeResize'] == 'function'){
                    let result = this.$refs.component['onVModalBeforeResize'](!this.maximize);

                    if (result === false){
                        return;
                    }
                }

                if(!this.animate) this.animate = true;
                this.maximize = !this.maximize;

				if (this.maximize){
					this.bodyHeight = false;
				}
				else {
					this.bodyHeight = this.dialogHeight - this.$refs.header.offsetHeight;
				}

				this.adjust();

				if (trigger && typeof this.resizeCallback == 'function'){
                    this.resizeCallback(this.maximize);
                }
            },

            modalClose(data){
                this.closeDialog(false, data);
            },

            /**
             * Change modal title
             *
             * @param {string} caption
             */
            changeTitle(caption){
                this.titleBar = caption;
            },

            /**
             * Change modal mode
             *
             * max - Maximize modal
             * min - Minimize modal
             *
             * if not set switches modal
             *
             * @param {string=} type
             */
            resizeModal(type){
                if (type && ((this.maximize && type == 'max') || (!this.maximize && type == 'min'))){
                    return;
                }

                this.max(false);
            },

            /**
             * Change modal size if minimized
             *
             * @param {object} params
             * @param {number} params.width - Set modal width
             * @param {number} params.height - Set modal height
             */
            setSize(params){
                this.dialogWidth = params.width || this.dialogWidth;
                this.dialogHeight = params.height || this.dialogHeight;
            },
        },
        mounted(){
            this.$nextTick(()=>{
                if(this.titleBar){
                    const headerHeight = this.$refs.header.offsetHeight;
                    this.bodyHeight = this.dialogHeight - headerHeight;
                }
                else {
                    this.bodyHeight = this.dialogHeight;
                }

                /**
                 * fullWidth option deprecated.
                 */
                if (this.fullScreen || this.fullWidth){
                    this.max();
                }
                else {
                    this.adjust();
                }
            });
        }
    }
</script>
