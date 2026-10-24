<script setup lang="ts">
    const AUDIO_NO_SUPPORTED_MESSAGE: string = "The browser does not allow this audio";
</script>

<template>
    <audio loop id="solar-system-background-music">
        <source src="/scenarios/solar_system/audios/background_music.mp3" type="audio/mpeg">
        <source src="/scenarios/solar_system/audios/background_music.ogg" type="audio/ogg">

        {{ AUDIO_NO_SUPPORTED_MESSAGE }}
    </audio>

    <audio id="hover-celestial-body">
        <source src="/scenarios/solar_system/audios/magic_star.mp3" type="audio/mpeg">
        <source src="/scenarios/solar_system/audios/magic_star.ogg" type="audio/ogg">

        {{ AUDIO_NO_SUPPORTED_MESSAGE }}
    </audio>

    <canvas id="solar-system-canvas"></canvas>
</template>
