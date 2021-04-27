export default class EchoElement extends HTMLElement {
    
    static get observedAttributes() {
        return [];
    }

    constructor() {
        super();

        this.elementHTML = '<div></div>';
    }


    attributeChangedCallback(name, oldVal, newVal) {
        this.update();
    }

    async connectedCallback() {
        this.bindAccessors();
        this.update();
    }

    bindAccessors() {
        const attributes = this.constructor.observedAttributes;

        if(attributes === null) throw new TypeError(`attributes is null`);
        if(attributes !== undefined) {
            for(let i of attributes) {
                this.setAttribute(i, this.getAttribute(i));

                this.__defineGetter__(i, () => {
                    return this.getAttribute(i);
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
        
        // Set setters by looking for echo.varname
        dynamicHTML = dynamicHTML.replaceAll(`echo`, `this.closest('${this.tagName.toLowerCase()}')`);

        for(let i of attributes) {
            // Set getters by looking for {varname}
            dynamicHTML = dynamicHTML.replaceAll(`{${i}}`, this.getAttribute(i));
        }

        // Dynamic JavaScript
        let dynamicJS =  dynamicHTML.match(/\{.+\}/g);
        
        if(dynamicJS) {
            for(let i of dynamicJS) {
                dynamicHTML = dynamicHTML.replaceAll(i, `${eval(i.replace(/\{|\}/g, ''))}`);
            }
        }

        return dynamicHTML;
    }

    update() {
        this.innerHTML = this.setDynamicData();
    }

}
