
export default class OpenSourceModalComponent extends HTMLElement {
    static register() {
        customElements.define("c-oss-modal", OpenSourceModalComponent);
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
        `;
    }

    setModalContent() {
    }
}


function getLicences() {
    return {
        "https://logantann.github.io/Exam-Training-Runtime/": `
    Copyright (c) 2025 Logan TANN, all rights reserved
    Based on the code of Veljko Vuckovic (refloow.com), MIT Licensed -- See com.github.refloow.Exam-Quiz-Test.LICENSE
    
    This source code is publicly readable and may be freely executed.
    
    **However, it is strictly forbidden to copy, redistribute, modify or use this code.**
    
    Conditions :
    
    - ✅ Execution: You are free to execute this code.
    - ✅ Access: You are free to read the source code.
    - 🛑 Copy and Modification Prohibition: You may not reuse or modify the source code of this project.
    - 🛑 Redistribution: You may not redistribute this code, in whole or in part, in any form whatsoever.
    - 🛑 No Liability: The author makes no commitment to maintain or update this code. The user assumes all risks associated with the execution and use of this code.
    - 🛑 Employer's Rights: The author's employer reserves the right to acquire all rights to this code at any time, or to make it private, without notice.
    
    By using this code, you agree to these conditions.
    `,
        "https://github.com/Refloow/Exam-Quiz-Test": `
    MIT License
    
    Copyright (c) 2025 Veljko Vuckovic (refloow.com)
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
    `
    };
} 