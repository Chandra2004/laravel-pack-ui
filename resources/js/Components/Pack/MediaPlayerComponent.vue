<script>
/**
 * Komponen MediaPlayerComponent.vue
 * Facade utama dan alias resmi untuk MediaPlayer
 */
export { default as MediaPlayer } from './MediaPlayer.vue';
</script>

<script setup>
import MediaPlayer from './MediaPlayer.vue';
import { ref } from 'vue';

defineOptions({
    inheritAttrs: false,
});

const playerRef = ref(null);

defineExpose({
    playerRef,
    get mediaElement() { return playerRef.value?.mediaElement; },
    get playerContainer() { return playerRef.value?.playerContainer; },
    play: () => playerRef.value?.play(),
    pause: () => playerRef.value?.pause(),
    togglePlay: () => playerRef.value?.togglePlay(),
    seek: (t) => playerRef.value?.seek(t),
    forward: (s) => playerRef.value?.forward(s),
    rewind: (s) => playerRef.value?.rewind(s),
    setVolume: (v) => playerRef.value?.setVolume(v),
    mute: () => playerRef.value?.mute(),
    unmute: () => playerRef.value?.unmute(),
    toggleMute: () => playerRef.value?.toggleMute(),
    setPlaybackRate: (r) => playerRef.value?.setPlaybackRate(r),
    setQuality: (q) => playerRef.value?.setQuality(q),
    toggleFullscreen: () => playerRef.value?.toggleFullscreen(),
    togglePiP: () => playerRef.value?.togglePiP(),
    toggleTheater: () => playerRef.value?.toggleTheater(),
    get currentTime() { return playerRef.value?.currentTime; },
    get duration() { return playerRef.value?.duration; },
    get isPlaying() { return playerRef.value?.isPlaying; },
    get isBuffering() { return playerRef.value?.isBuffering; },
    get isMuted() { return playerRef.value?.isMuted; },
    get volume() { return playerRef.value?.volume; },
    get playbackRate() { return playerRef.value?.playbackRate; },
    get activeQuality() { return playerRef.value?.activeQuality; },
    get isFullscreen() { return playerRef.value?.isFullscreen; },
    get isPiP() { return playerRef.value?.isPiP; },
    get isTheater() { return playerRef.value?.isTheater; },
    get hlsInstance() { return playerRef.value?.hlsInstance?.(); },
    get isHlsActive() { return playerRef.value?.isHlsActive; },
    get availableQualities() { return playerRef.value?.availableQualities; },
    get showQualityMenu() { return playerRef.value?.showQualityMenu; },
    get isHdQuality() { return playerRef.value?.isHdQuality; },
    get qualityToast() { return playerRef.value?.qualityToast; },
    get qualitySources() { return playerRef.value?.qualitySources?.(); },
    get currentActiveSrc() { return playerRef.value?.currentActiveSrc; },
    get spectrumData() { return playerRef.value?.spectrumData; },
    get peaksData() { return playerRef.value?.peaksData; },
    get activeSpectrumMode() { return playerRef.value?.activeSpectrumMode; },
    setSpectrumMode: (mode) => playerRef.value?.setSpectrumMode?.(mode),
    get isLooping() { return playerRef.value?.isLooping; },
    toggleLoop: () => playerRef.value?.toggleLoop?.(),
    get isShuffle() { return playerRef.value?.isShuffle; },
    get isFavorited() { return playerRef.value?.isFavorited; },
    toggleShuffle: () => playerRef.value?.toggleShuffle?.(),
    toggleFavorite: () => playerRef.value?.toggleFavorite?.(),
});
</script>

<template>
    <MediaPlayer ref="playerRef" v-bind="$attrs">
        <template v-for="(_, slot) in $slots" #[slot]="slotProps">
            <slot :name="slot" v-bind="slotProps" />
        </template>
    </MediaPlayer>
</template>
