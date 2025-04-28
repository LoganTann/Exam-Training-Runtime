const css = `
.input-group {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  height: 200px;
  padding: 20px;
  border: 2px dashed #222245;
  cursor: pointer;
}
.input-group:hover {
  background: #eee;
}
.drop-title {
  font-size: 1.2rem;
  font-weight: bold;
}

input[type=file] {
  width: 350px;
  max-width: 100%;
  padding: 8px;
  border: 1px solid #222245;
}
input[type=file]::file-selector-button {
  cursor: pointer;
  padding: 8px 16px;
  margin: 6px 8px;
}
`;

export default class InputFileComponent extends HTMLElement {
    static register() {
        customElements.define("c-input-file", InputFileComponent);
    }
    static find(id) {
        const found = document.getElementById(id);
        if (found instanceof InputFileComponent) {
            return found;
        }
        throw new Error(`Err: #${id} should be a InputFileComponent instance`);
    }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    name = "file";
    accept = undefined;
    required = false;

    async getFileContent() {
      const file = this._refs.input?.files[0];
      if (!file) {
        throw new Error(`Err: When attempting to read #c-input-file--${this.name}, could not find an uploaded file`);
      }
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = e => reject(e);
        reader.readAsText(file);
      });
    }

    _refs = {
        input: null,
        inputGroup: null
    };

    connectedCallback() {
        const inputId = `c-input-file--${this.name}`;
        const acceptAttr = this.accept ? `accept="${this.accept}"` : "";
        const requiredAttr = this.required ? "required" : "";
        this.shadowRoot.innerHTML = `
            <label for="${inputId}" part="input-group" class="input-group">
                <span class="drop-title">
                    <slot>Drop a file</slot>
                </span>
                <span>or</span>
                <input type="file" part="input" id="${inputId}" ${acceptAttr} ${requiredAttr}>
            </label>
            <style>${css}</style>
        `;
        this._refs.inputGroup = this.shadowRoot.querySelector(`[part="input-group"]`);
        this._refs.input = /** @type {HTMLInputElement} */ this.shadowRoot.querySelector(`[part="input"]`);

        this._refs.inputGroup.addEventListener("dragover", (e) => e.preventDefault(), false);
        this._refs.inputGroup.addEventListener('drop', (e) => this.handleDrop(e));
        this._refs.input.addEventListener('change', (e) => this.handleFileSelect(e));
    }


    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files;
        if (this._refs.input && files.length > 0) {
            this._refs.input.files = files;
        }
        this.dispatchEvent(new CustomEvent('file-uploaded'));
    }

    handleFileSelect() {
        this.dispatchEvent(new CustomEvent('file-uploaded'));
    }
}
