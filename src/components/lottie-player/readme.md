# my-component



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute       | Description                         | Type                                                                                                                                 | Default               |
| -------------- | --------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `autoplay`     | `autoplay`      | Autoplay animation on load          | `boolean`                                                                                                                            | `false`               |
| `background`   | `background`    | Background color.                   | `string`                                                                                                                             | `'transparent'`       |
| `controls`     | `controls`      | Show controls.                      | `boolean`                                                                                                                            | `false`               |
| `count`        | `count`         | Number of times to loop animation.  | `number`                                                                                                                             | `undefined`           |
| `currentState` | `current-state` | Player state.                       | `PlayerState.Error \| PlayerState.Frozen \| PlayerState.Loading \| PlayerState.Paused \| PlayerState.Playing \| PlayerState.Stopped` | `PlayerState.Loading` |
| `direction`    | `direction`     | Direction of animation              | `number`                                                                                                                             | `1`                   |
| `hover`        | `hover`         | Whether to play on mouse hover      | `boolean`                                                                                                                            | `false`               |
| `intermission` | `intermission`  |                                     | `number`                                                                                                                             | `1`                   |
| `loop`         | `loop`          | Whether to loop animation           | `boolean`                                                                                                                            | `false`               |
| `mode`         | `mode`          | Play mode.                          | `PlayMode.Bounce \| PlayMode.Normal`                                                                                                 | `PlayMode.Normal`     |
| `renderer`     | `renderer`      | Renderer to use.                    | `"svg"`                                                                                                                              | `'svg'`               |
| `seeker`       | `seeker`        |                                     | `any`                                                                                                                                | `undefined`           |
| `speed`        | `speed`         | Animation speed.                    | `number`                                                                                                                             | `1`                   |
| `src`          | `src`           | Bodymovin JSON data or URL to json. | `string`                                                                                                                             | `undefined`           |


## Events

| Event      | Description | Type               |
| ---------- | ----------- | ------------------ |
| `complete` |             | `CustomEvent<any>` |
| `error`    |             | `CustomEvent<any>` |
| `frame`    |             | `CustomEvent<any>` |
| `freezed`  |             | `CustomEvent<any>` |
| `loaded`   |             | `CustomEvent<any>` |
| `looped`   |             | `CustomEvent<any>` |
| `paused`   |             | `CustomEvent<any>` |
| `playing`  |             | `CustomEvent<any>` |
| `ready`    |             | `CustomEvent<any>` |
| `stopped`  |             | `CustomEvent<any>` |


## Methods

### `getLottie() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `pause() => Promise<void>`

Stop playing animation.

#### Returns

Type: `Promise<void>`



### `play() => Promise<void>`

Start playing animation.

#### Returns

Type: `Promise<void>`



### `seek(value: string | number) => Promise<void>`

Seek to a given frame.

#### Returns

Type: `Promise<void>`



### `setDirection(value: number) => Promise<void>`

Animation play direction.

#### Returns

Type: `Promise<void>`



### `setLooping(value: boolean) => Promise<void>`

Sets the looping of the animation.

#### Returns

Type: `Promise<void>`



### `setSpeed(value?: number) => Promise<void>`

Sets animation play speed

#### Returns

Type: `Promise<void>`



### `stop() => Promise<void>`

Stops animation play.

#### Returns

Type: `Promise<void>`



### `toggleLooping() => Promise<void>`

Toggles animation looping.

#### Returns

Type: `Promise<void>`



### `togglePlay() => Promise<void>`

Toggle playing state.

#### Returns

Type: `Promise<void>`




## CSS Custom Properties

| Name                                        | Description               |
| ------------------------------------------- | ------------------------- |
| `--lottie-player-seeker-thumb-color`        | Seeker thumb color        |
| `--lottie-player-seeker-track-color`        | Seeker track color        |
| `--lottie-player-toolbar-background-color`  | Toolbar background color  |
| `--lottie-player-toolbar-height`            | Toolbar height            |
| `--lottie-player-toolbar-icon-active-color` | Toolbar icon active color |
| `--lottie-player-toolbar-icon-color`        | Toolbar icon color        |
| `--lottie-player-toolbar-icon-hover-color`  | Toolbar icon hover color  |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
