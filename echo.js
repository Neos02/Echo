class Echo {

    static async initializeElements() {
        let elements = await this.getEchoElements();

        for(let e of elements) {
            let elementData = this.getElementData(e);

            this.createCustomElementClass(elementData)
        }
    }
    
    static createCustomElementClass(elementData) {
        const customElementClass = class CustomElement extends EchoElement {
            static get observedAttributes() {
                return elementData.attributes;
            }

            constructor() {
                super();

                this.elementHTML = elementData.elementHTML;
            }
        }

        this.createEchoElement(elementData.className, customElementClass);
    }

    static createEchoElement(tagName, elementClass) {
        // Get the class name in slug case
        tagName = tagName.replace(/([A-Z])/g, "-$1").toLowerCase().substring(1);

        if(tagName.indexOf("echo-") === -1) tagName = `echo-${tagName}`;

        customElements.define(tagName, elementClass);
    }

    static async getEchoElements() {
        let elements;

        await fetch('./echoElements.html')
            .then(response => response.text())
            .then(data => elements = data.split(/(?=<echo-element .+>)/));

        return elements;
    }

    static getElementData(element) {
        const template = document.createElement('template');
        
        template.innerHTML = element;
        
        let attributes = element.substring(0, element
            .search(/( ?)+>/))
            .replace('<echo-element', '')
            .replace(/echoname=\\?["'](\w+-?)+\\?["']/, '')
            .split(/ /)
            .filter(x => x.length > 0);

        return {
            className: template.content.firstChild.getAttribute('echoname').replace(/^\w/, c => c.toUpperCase()),
            attributes: attributes,
            elementHTML: template.content.firstChild.innerHTML
        };
    }

}

Echo.initializeElements();
