import { Howl } from 'howler';
import onSound from '$lib/assets/on.wav';
import offSound from '$lib/assets/off.wav';
import timeSound from '$lib/assets/time.mp3';

/**
 * All audio effects are downloaded from https://mixkit.co/
 */

const on = new Howl({
	src: [onSound],
	volume: 0.05
});

const off = new Howl({
	src: [offSound],
	volume: 0.03
});

const time = new Howl({
	src: [timeSound],
	volume: 0.2,
	loop: true
});
export const playOn = () => on.play();
export const playOff = () => off.play();
export const playTime = () => time.play();
export const stopTime = () => time.stop();
