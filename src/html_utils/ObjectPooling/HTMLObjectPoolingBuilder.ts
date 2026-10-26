import { HTMLObjectPooling } from './HTMLObjectPooling.ts';
import type { PoolingMethod } from './PoolingMethodType.ts';

// ----------------------------------------------
// CLASSES
// ----------------------------------------------

export class HTMLObjectPoolingBuilder
{
    // ----------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------

    private element?: HTMLElement = undefined;
    private defaultAmount: number = 5;

    private poolMethod?: PoolingMethod;
    private unpoolMethod?: PoolingMethod;

    private unpoolTime: number = -1;

    // ----------------------------------------------
    // CLASSES
    // ----------------------------------------------

    public setElement(element: HTMLElement) : HTMLObjectPoolingBuilder
    {
        this.element = element;
        return this;
    }

    public setDefaultAmount(amount: number) : HTMLObjectPoolingBuilder
    {
        this.defaultAmount = Math.abs(amount);
        return this;
    }

    public setPoolMethod(poolMethod: PoolingMethod) : HTMLObjectPoolingBuilder
    {
        this.poolMethod = poolMethod;
        return this;
    }

    public setUnpoolMethod(unpoolMethod: PoolingMethod) : HTMLObjectPoolingBuilder
    {
        this.unpoolMethod = unpoolMethod;
        return this;
    }

    public setUnpoolTime(unpoolTime: number) : HTMLObjectPoolingBuilder
    {
        this.unpoolTime = unpoolTime;
        return this;
    }

    public build() : HTMLObjectPooling | undefined
    {
        if (!this.element)
        {
            console.error("Element was not set!");
            return undefined;
        }

        return new HTMLObjectPooling(this.element, this.defaultAmount, this.unpoolTime, this.poolMethod, this.unpoolMethod);
    }
}