import EchoElement from './echoElement.js';
import { readFile } from './utils.js';

class Echo {

    static async initializeElements() {
        let elements = await this.getEchoElements();

        elements.forEach(element => {
            let elementData = this.getElementData(element);

            this.createElementClass(elementData)
        });
    }
    
    static createElementClass(elementData) {
        const elementClass = class CustomElement extends EchoElement {
            static get observedAttributes() {
                return elementData.attributes;
            }

            constructor() {
                super();

                this.elementHTML = elementData.elementHTML;
            }
        }

        this.createEchoElement(elementData.className, elementClass);
    }

    static createEchoElement(tagName, elementClass) {
        // Get the class name in slug case
        tagName = tagName.replace(/([A-Z])/g, "-$1").toLowerCase().substring(1);

        if(tagName.indexOf("echo-") === -1) tagName = `echo-${tagName}`;

        customElements.define(tagName, elementClass);
    } 

    static async getEchoElements() {
        return (await readFile('./echoElements.html')).split(/(?=<echo-element .+>)/);
    }

    static getElementData(element) {
        const template = document.createElement('template');
        
        template.innerHTML = element;

        let className = template.content.firstChild.getAttribute('echoname').replace(/^\w/, c => c.toUpperCase());

        template.content.firstChild.removeAttribute('echoname');
        
        let attributes = element.substring(0, element
            .search(/( ?)+>/))
            .replace('<echo-element', '')
            .replace(/echo-name=\\?["'](\w+-?)+\\?["']/, '')
            .split(/ /)
            .filter(x => x.length > 0 && !x.includes('echoname='));

        return {
            className,
            attributes,
            elementHTML: template.content.firstChild.innerHTML
        };
    }

}

Echo.initializeElements();
