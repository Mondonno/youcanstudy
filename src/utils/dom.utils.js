/**
 * DOM utility functions for creating elements
 */
/**
 * Create a DOM element with attributes and children
 */
export function el(tag, attrs, ...children) {
    const element = document.createElement(tag);
    if (attrs) {
        for (const key of Object.keys(attrs)) {
            const val = attrs[key];
            if (key === 'class' && val) {
                element.className = val;
            }
            else if (key === 'style' && val) {
                element.setAttribute('style', val);
            }
            else if (key.startsWith('on') && typeof val === 'function') {
                element[key.toLowerCase()] = val;
            }
            else if (val !== null && val !== undefined) {
                element.setAttribute(key, val);
            }
        }
    }
    for (const child of children) {
        if (child === null || child === undefined)
            continue;
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        }
        else {
            element.appendChild(child);
        }
    }
    return element;
}
/**
 * Clear all children from an element
 */
export function clearElement(element) {
    element.innerHTML = '';
}
/**
 * Set the content of an element
 */
export function setContent(element, ...children) {
    clearElement(element);
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        }
        else {
            element.appendChild(child);
        }
    }
}
