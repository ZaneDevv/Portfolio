import { HTMLObjectPooling } from "../ObjectPooling/HTMLObjectPooling.ts";
import { HTMLObjectPoolingBuilder } from "../ObjectPooling/HTMLObjectPoolingBuilder.ts";

// ----------------------------------------------
// CLASSES
// ----------------------------------------------

export class SFX
{
    // ----------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------

    private readonly audioPooling?: HTMLObjectPooling = undefined;

    // ----------------------------------------------
    // CLASSES
    // ----------------------------------------------

    constructor(audio: HTMLAudioElement)
    {
        this.audioPooling = new HTMLObjectPoolingBuilder()
                                .setElement(audio)
                                .setDefaultAmount(5)
                                .setUnpoolTime(audio.duration)
                                .setPoolMethod(element => (element as HTMLAudioElement).play())
                                .build();
    }

    // ----------------------------------------------
    // CLASSES
    // ----------------------------------------------

    public play()
    {
        this.audioPooling?.pool();
    }
}