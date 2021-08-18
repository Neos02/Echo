import { inferType } from './utils.js';

export default class EchoElement extends HTMLElement {
    
    static get observedAttributes() {
        return [];
    }

    constructor() {
        super();

        this.elementHTML = '<div></div>';
    }


    attributeChangedCallback(name, oldVal, newVal) {
        if(oldVal !== newVal) {
            this.update();
        }
    }

    async connectedCallback() {
        this.bindAccessors();
        this.update();
    }

    bindAccessors() {
        const attributes = this.constructor.observedAttributes;

        if(attributes === null) throw new TypeError('attributes is null');
        if(attributes !== undefined) {
            for(let i of attributes) {
                this.__defineGetter__(i, () => {
                    return inferType(this.getAttribute(i));
                });

                this.__defineSetter__(i, (val) => {
                    return this.setAttribute(i, val);
                });
            }   
        }

    }

    setDynamicData() {
        const attributes = this.constructor.observedAttributes;
        let dynamicHTML = this.elementHTML;

        // Dynamic JavaScript
        let dynamicJS =  dynamicHTML.match(/\{\{.+?\}\}/g);
        
        if(dynamicJS) {
            for(let i of dynamicJS) {
                let js = i.replace(/[\{\{\}\}]/g, '');

                for(let attribute of attributes) {                    
                    let inferred = inferType(this.getAttribute(attribute));
                    
                    js = js.toString().replaceAll(`this.echo.${attribute}`, JSON.stringify(inferred));

                    js = inferType(js);
                }

                dynamicHTML = dynamicHTML.replaceAll(i, js);               
            }
        }

        dynamicHTML = dynamicHTML.replace(/this.echo/g, `this.closest('${this.tagName.toLowerCase()}')`);

        return dynamicHTML;
    }

    update() {
        this.innerHTML = this.setDynamicData();
    }

}
