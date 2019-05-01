<template>
    <div>
        <div dialog="v-dialog" tabindex="-1" :class="classes" :style="[{'z-index':dialogZIndex}]"
             @click.self="outsideClick" >

            <div :class="['v-dialog-dialog', {'v-dialog-default-animated': animate}]"
                 :style="{width:width+'px',height:height+'px',top:dialogTop+'px'}">
                <transition name="v-dialog--smooth" :appear="true" >
                    <div :class="['v-dialog-content']" v-show="show" >

                        <div class="v-dialog-header" ref="header" v-if="titleBar !== false">
                            <button type="button" class="v-dialog-btn__close" v-if="dialogCloseButton"
                                    @click="closeDialog(true)">
                                <i class="dlg-icon-font dlg-icon-close"></i>
                            </button>
                            <button type="button" class="v-dialog-btn__maximize"
                                    v-if="dialogMaxButton" @click="max" >
                                <i :class="['dlg-icon-font', maximize?'dlg-icon-restore':'dlg-icon-max']"></i>
                            </button>
                            <h3 v-text="titleBar" :title="titleBar"></h3>
                        </div>

                        <div class="v-dialog-body" :style="{height: bodyHeight ? bodyHeight+'px': '100%'}" >
                            <component :is="component" v-bind="params" @close="modalClose"></component>
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
            component: Object,
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
            }
        },
        data(){
            return {
                maximize: false,
                animate: false
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
            }
        },
        methods: {
            /**
             * dialog max size
             */
            max(){
                if(!this.animate) this.animate = true;
                this.maximize = !this.maximize;
				
				if (this.maximize){
					this.bodyHeight = false;
				}
				else {
					this.bodyHeight = this.height - this.$refs.header.offsetHeight;
				}

				this.adjust();
            },

            modalClose(data){
                this.closeDialog(false, data);
            }
        },
        mounted(){
            this.$nextTick(()=>{
                if(this.titleBar){
                    const headerHeight = this.$refs.header.offsetHeight;//this.$refs.header.getBoundingClientRect().height;
                    this.bodyHeight = this.height - headerHeight;
                }else this.bodyHeight = this.height;

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