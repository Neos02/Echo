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
                try {
                    this.setAttribute(i, `${this.getAttribute(i)}`);
                } catch(e) {
                    throw new Error('default echo attributes are not yet supported');
                }

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
        
        // Set setters by looking for this.echo
        dynamicHTML = dynamicHTML.replaceAll(`this.echo`, `this.closest('${this.tagName.toLowerCase()}')`);

        // Dynamic JavaScript
        let dynamicJS =  dynamicHTML.match(/\{\{.+?\}\}/g);
        
        if(dynamicJS) {
            for(let i of dynamicJS) {
                let js = i.replace(/[\{\{\}\}]/g, '')

                
                for(let j of attributes) {
                    let getter = `this.closest('${this.tagName.toLowerCase()}').getAttribute('${j}')`;
                    
                    if(!isNaN(+eval(getter))) {
                        getter = +eval(getter);
                    }
                    
                    let attr = eval(getter);                    ;
                    let inferred = inferType(attr);
                    
                    attr = typeof inferred === 'string' ? `'${attr}'` : attr;
                    
                    js = js.replaceAll(`this.closest('${this.tagName.toLowerCase()}').${j}`, `${attr}`);
                }

                try {
                    dynamicHTML = dynamicHTML.replaceAll(i, inferType(eval(js)));
                } catch(e) {

                    js = js.replace(/^'/, '')
                           .replace(/'$/, '');
                    
                    dynamicHTML = dynamicHTML.replaceAll(i, inferType(js));
                }                
            }
        }

        return dynamicHTML;
    }

    update() {
        this.innerHTML = this.setDynamicData();
    }

}

function inferType(obj) {
    let attr;
                                        
    try {
        attr = JSON.parse(obj);
    } catch(e) {
        attr = decodeURI(obj);
    }

    return attr;
}
