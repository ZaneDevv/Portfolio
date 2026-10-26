import type { PoolingMethod } from './PoolingMethodType.ts';

// ----------------------------------------------
// CLASSES
// ----------------------------------------------

export class HTMLObjectPooling
{
    // ----------------------------------------------
    // ATTRIBUTES
    // ----------------------------------------------

    private savedElements: HTMLElement[] = [];
    private usingElements: HTMLElement[] = [];

    private readonly poolMethod?: PoolingMethod;
    private readonly unpoolMethod?: PoolingMethod;

    private readonly unpoolTime: number = -1;

    // ----------------------------------------------
    // CONSTRUCTORS
    // ----------------------------------------------

    constructor(element: HTMLElement, defaultAmount: number, unpoolTime: number, poolMethod: PoolingMethod | undefined, unpoolMethod: PoolingMethod | undefined)
    {
        for (let i = 0; i < defaultAmount; i++)
            this.savedElements.push(this.copyElement(element));

        this.poolMethod = poolMethod;
        this.unpoolMethod = unpoolMethod;

        this.unpoolTime = unpoolTime;
    }

    // ----------------------------------------------
    // METHODS
    // ----------------------------------------------

    private copyElement(element: HTMLElement) : HTMLElement
    {
        const newElement = element.cloneNode(true) as HTMLElement;
        newElement.className = newElement.id;
        newElement.id = "";

        if (element.parentElement)
            element.parentElement.appendChild(newElement);

        return newElement;
    }

    public pool() : void
    {
        const element: HTMLElement = this.savedElements.length <= 1 ? this.copyElement(this.savedElements[0]) : this.savedElements.pop()!;
        this.usingElements.push(element);

        if (this.poolMethod)
            this.poolMethod(element);

        if (this.unpoolTime > 0)
            setTimeout(() => this.unpool(element), this.unpoolTime * 1e3);
    }

    public unpool(element: HTMLElement | number) : void
    {
        const index: number = typeof element === "number" ? element : this.usingElements.indexOf(element);
        const targetElement: HTMLElement | undefined = this.usingElements[index];

        if (!targetElement)
            return;

        if (this.unpoolMethod)
            this.unpoolMethod(targetElement);

        this.savedElements.push(targetElement);
        this.usingElements.splice(index, 1);
    }
}