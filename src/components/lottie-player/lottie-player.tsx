import { Component, Prop, h, Method, EventEmitter, Event } from '@stencil/core';
import lottie from 'lottie-web/build/player/lottie_svg';
import { parseSrc } from '../../utils/parse-src';
// import { PlayerEvents } from '../../utils/player-events';
import { PlayerState } from '../../utils/player-state';
import { PlayMode } from '../../utils/player-mode';

@Component({
    tag: 'lottie-player',
    styleUrl: 'lottie-player.css',
    shadow: true
})
export class LottiePlayer {

    container!: HTMLElement;

    /**
     * Play mode.
     */
    @Prop() mode: PlayMode = PlayMode.Normal;
    /**
     * Autoplay animation on load
     */
    @Prop() autoplay = false;
    /**
     * Background color.
     */
    @Prop({ reflect: true }) background? = 'transparent';
    /**
     * Show controls.
     */
    @Prop() controls = false;
    /**
     * Number of times to loop animation.
     */
    @Prop() count?: number;
    /**
     * Direction of animation
     */
    @Prop() direction = 1;
    /**
     * Whether to play on mouse hover
     */
    @Prop() hover = false;
    /**
     * Whether to loop animation
     */
    @Prop({ reflect: true }) loop = false;
    /**
     * Renderer to use.
     */
    @Prop() renderer: 'svg' = 'svg';
    /**
     * Animation speed.
     */
    @Prop() speed = 1;
    /**
     * Bodymovin JSON data or URL to json.
     */
    @Prop() src?: string;
    /**
     * Player state.
     */
    @Prop() currentState: PlayerState = PlayerState.Loading;

    @Prop() seeker: any;

    @Prop() intermission = 1;

    @Event() error: EventEmitter;

    @Event() frame: EventEmitter;

    @Event() complete: EventEmitter;

    @Event() looped: EventEmitter;

    @Event() ready: EventEmitter;

    @Event() loaded: EventEmitter;

    @Event() playing: EventEmitter;

    @Event() paused: EventEmitter;

    @Event() stopped: EventEmitter;

    @Event() freezed: EventEmitter;

    private _io?: any;
    private _lottie?: any;
    private _prevState?: any;
    private _counter = 0;

    componentDidLoad() {
        // Add intersection observer for detecting component being out-of-view.
        if ('IntersectionObserver' in window) {
            this._io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
                if (entries[0].isIntersecting) {
                    if (this.currentState === PlayerState.Frozen) {
                        this.play();
                    }
                } else if (this.currentState === PlayerState.Playing) {
                    this.freeze();
                }
            });

            this._io.observe(this.container);
        }

        // Add listener for Visibility API's change event.
        if (typeof document.hidden !== 'undefined') {
            document.addEventListener('visibilitychange', () => this.onVisibilityChange());
        }

        // Setup lottie player
        if (this.src) {
            this.load(this.src);
        }
    }

    load(src: string | object) {
        const options: any = {
            container: this.container,
            loop: false,
            autoplay: false,
            renderer: this.renderer,
            rendererSettings: {
                scaleMode: 'noScale',
                clearCanvas: false,
                progressiveLoad: true,
                hideOnTransparent: true,
            },
        };

        try {
            const srcParsed = parseSrc(src);
            const srcAttrib = typeof srcParsed === 'string' ? 'path' : 'animationData';

            // Clear previous animation, if any
            if (this._lottie) {
                this._lottie.destroy();
            }

            // Initialize lottie player and load animation
            this._lottie = lottie.loadAnimation({
                ...options,
                [srcAttrib]: srcParsed
            });
        } catch (err) {
            this.currentState = PlayerState.Error;
            this.error.emit();
            return;
        }

        if (this._lottie) {
            // Calculate and save the current progress of the animation
            this._lottie.addEventListener('enterFrame', () => {
                this.seeker = (this._lottie.currentFrame / this._lottie.totalFrames) * 100;

                this.frame.emit({
                    frame: this._lottie.currentFrame,
                    seeker: this.seeker
                });
            });

            // Handle animation play complete
            this._lottie.addEventListener('complete', () => {
                if (this.currentState !== PlayerState.Playing) {
                    this.complete.emit();
                    return;
                }

                if (!this.loop || (this.count && this._counter >= this.count)) {
                    this.complete.emit();
                    return;
                }

                if (this.mode === PlayMode.Bounce) {
                    if (this.count) {
                        this._counter += 0.5;
                    }

                    setTimeout(() => {
                        this.looped.emit();

                        if (this.currentState === PlayerState.Playing) {
                            this._lottie.setDirection(this._lottie.playDirection * -1);
                            this._lottie.play();
                        }
                    }, this.intermission);
                } else {
                    if (this.count) {
                        this._counter += 1;
                    }

                    window.setTimeout(() => {
                        this.looped.emit();

                        if (this.currentState === PlayerState.Playing) {
                            this._lottie.stop();
                            this._lottie.play();
                        }
                    }, this.intermission);
                }
            });

            // Handle lottie-web ready event
            this._lottie.addEventListener('DOMLoaded', () => {
                this.ready.emit();
            });

            // Handle animation data load complete
            this._lottie.addEventListener('data_ready', () => {
                this.loaded.emit();
            });

            // Set error state when animation load fail event triggers
            this._lottie.addEventListener('data_failed', () => {
                this.currentState = PlayerState.Error;
                this.error.emit();
            });

            // Set handlers to auto play animation on hover if enabled
            this.container.addEventListener('mouseenter', () => {
                if (this.hover && this.currentState !== PlayerState.Playing) {
                    this.play();
                }
            });
            this.container.addEventListener('mouseleave', () => {
                if (this.hover && this.currentState === PlayerState.Playing) {
                    this.stop();
                }
            });

            // Set initial playback speed and direction
            this.setSpeed(this.speed);
            this.setDirection(this.direction);

            // Start playing if autoplay is enabled
            if (this.autoplay) {
                this.play();
            }
        }
    }

    /**
     * Start playing animation.
     */
    @Method()
    async play() {
        if (!this._lottie) {
            return;
        }
        this._lottie.play();
        this.currentState = PlayerState.Playing;
        this.playing.emit();
    }

    /**
     * Stop playing animation.
     */
    @Method()
    async pause() {
        if (!this._lottie) {
            return;
        }
        this._lottie.pause();
        this.currentState = PlayerState.Paused;
        this.paused.emit();
    }

    /**
     * Stops animation play.
     */
    @Method()
    async stop() {
        if (!this._lottie) {
            return
        }
        this._counter = 0;
        this._lottie.stop();
        this.currentState = PlayerState.Stopped;
        this.stopped.emit();
    }

    /**
     * Seek to a given frame.
     */
    @Method()
    async seek(value: number | string) {
        if (!this._lottie) {
            return;
        }

        // Extract frame number from either number or percentage value
        const matches = value.toString().match(/^([0-9]+)(%?)$/);
        if (!matches) {
            return;
        }

        // Calculate and set the frame number
        const frame = matches[2] === '%'
            ? this._lottie.totalFrames * Number(matches[1]) / 100
            : matches[1];

        // Set seeker to new frame number
        this.seeker = frame;

        // Send lottie player to the new frame
        if (this.currentState === PlayerState.Playing) {
            this._lottie.goToAndPlay(frame, true);
        } else {
            this._lottie.goToAndStop(frame, true);
            this._lottie.pause();
        }
    }

    /**
     * Freeze animation play.
     * This internal state pauses animation and is used to differentiate between
     * user requested pauses and component instigated pauses.
     */
    freeze() {
        if (!this._lottie) {
            return;
        }
        this._lottie.pause;
        this.currentState = PlayerState.Frozen;
        this.freezed.emit();
    }

    @Method()
    async getLottie() {
        return this._lottie;
    }

    /**
     * Sets animation play speed
     * @param value Playback speed.
     */
    @Method()
    async setSpeed(value = 1) {
        if (!this._lottie) {
            return;
        }
        this._lottie.setSpeed(value);
    }

    /**
     * Animation play direction.
     * @param value Direction values.
    */
    @Method()
    async setDirection(value: number) {
        if (!this._lottie) {
            return;
        }
        this._lottie.setDirection(value);
    }

    /**
     * Sets the looping of the animation.
     *
     * @param value Whether to enable looping. Boolean true enables looping.
     */
    @Method()
    async setLooping(value: boolean) {
        if (this._lottie) {
            this.loop = value;
            this._lottie.loop = value;
        }
    }

    /**
     * Toggle playing state.
     */
    @Method()
    async togglePlay() {
        return this.currentState === PlayerState.Playing
            ? this.pause()
            : this.play();
    }

    /**
     * Toggles animation looping.
     */
    @Method()
    async toggleLooping() {
        this.setLooping(!this.loop);
    }

    renderButtonIcon(isPlaying) {
        if (isPlaying) {
            return (
                <svg width="24" height="24"><path d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z" /></svg>
            );
        }
        return (
            <svg width="24" height="24"><path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" /></svg>
        );
    }

    renderControls() {
        const isPlaying = this.currentState === PlayerState.Playing;
        const isPaused = this.currentState === PlayerState.Paused;
        const isStopped = this.currentState === PlayerState.Stopped;
        return (
            <div class='toolbar'>
                <button class={{
                    active: isPlaying || isPaused
                }} onClick={() => this.togglePlay()}>
                    {this.renderButtonIcon(isPlaying)}
                </button>
                <button class={{
                    active: isStopped
                }} onClick={() => this.stop()}>
                    <svg width="24" height="24"><path d="M6 6h12v12H6V6z" /></svg>
                </button>

                <input class="seeker" type="range" min="0" step="1" max="100" value={this.seeker}
                    onInput={e => this.handleSeekChange(e)}
                    onMouseDown={() => { this._prevState = this.currentState; this.freeze(); }}
                    onMouseUp={() => { this._prevState === PlayerState.Playing && this.play(); }}
                />
                <button class={{
                    'active': this.loop
                }} onClick={() => this.toggleLooping()}>
                    <svg width="24" height="24">
                        <path d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z" />
                    </svg>
                </button>

                <a href="https://www.lottiefiles.com/" target="_blank">
                    <svg width="24" height="24" viewBox="0 0 320 320" fill-rule="nonzero"><rect fill="#adadad" x=".5" y=".5" width="100%" height="100%" rx="26.73" /><path d="M251.304 65.44a16.55 16.55 0 0 1 13.927 18.789c-1.333 9.04-9.73 15.292-18.762 13.954-15.992-2.37-39.95 22.534-66.77 73.74-34.24 65.37-66.113 96.517-99.667 94.032-9.102-.674-15.93-8.612-15.258-17.723s8.592-15.96 17.695-15.286c16.57 1.227 40.908-24.737 67.97-76.4 34.46-65.79 66.764-96.157 100.866-91.105z" fill="#fff" /></svg>
                </a>
            </div>
        )
    }

    render() {
        return (
            <div class={{
                main: true,
                controls: this.controls
            }}>
                <div class="animation" style={{
                    background: this.background
                }}
                    ref={ref => this.container=ref}>
                    {this.currentState === PlayerState.Error ? <div class="error">⚠️</div> : undefined}
                </div>
                {this.controls ? this.renderControls() : undefined}
            </div>
        )
    }

    /**
    * Handle visibility change events.
    */
    private onVisibilityChange() {
        if (document.hidden === true && this.currentState === PlayerState.Playing) {
            this.freeze();
        } else if (this.currentState === PlayerState.Frozen) {
            this.play();
        }
    }

    /**
    * Handles click and drag actions on the progress track.
    */
    private handleSeekChange(e: any): void {
        if (!this._lottie || isNaN(e.target.value)) {
            return;
        }

        const frame: number = ((e.target.value / 100) * this._lottie.totalFrames);

        this.seek(frame);
    }

}
