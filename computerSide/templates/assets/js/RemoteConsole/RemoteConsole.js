class RemoteConsole{

  constructor(styles= null){
    this.GENERAL_STYLE= `
      font-family: Consolas;
      padding: .5rem;
      width: 100%;
      overflow: scroll;
    `;
    this.INFO_MESSAGE_STYLE= `
      color: white;
    `;
    this.WARN_MESSAGE_STYLE= `
      color: Gold;
    `;
    this.ERROR_MESSAGE_STYLE= `
      color: Tomato;
    `;

    if (styles){
      this.GENERAL_STYLE=        styles.GENERAL_STYLE        ? styles.GENERAL_STYLE       : this.GENERAL_STYLE;
      this.INFO_MESSAGE_STYLE=   styles.INFO_MESSAGE_STYLE   ? styles.INFO_MESSAGE_STYLE  : this.INFO_MESSAGE_STYLE;
      this.WARN_MESSAGE_STYLE=   styles.WARN_MESSAGE_STYLE   ? styles.WARN_MESSAGE_STYLE  : this.WARN_MESSAGE_STYLE;
      this.ERROR_MESSAGE_STYLE=  styles.ERROR_MESSAGE_STYLE  ? styles.ERROR_MESSAGE_STYLE : this.ERROR_MESSAGE_STYLE;
    }

    this._init();
  }

  _init(){
    /**
     * Initializes the styled container console element
     * @private
     */

    this.domElement= document.createElement("div");
    this.domElement.setAttribute("style", this.GENERAL_STYLE);
    this.scroll= 0;
  }

  _hasScrolledUp() {
    return this.domElement.scrollTop < this.scroll;
  }
  
  _scrollToBottom() {
    this.domElement.scrollTop = this.domElement.scrollHeight;
  }

  log(message){
    /**
     * Adds an info message to the console
     */
    
    const messageParagraph= document.createElement("p");
    messageParagraph.innerText= `[ INFO ]\t${message}`;
    messageParagraph.setAttribute("style", this.INFO_MESSAGE_STYLE);
    messageParagraph.style.borderBottom= "1px solid rgba(255, 255, 255, 0.5)";
    messageParagraph.style.padding= ".5rem 0";
    messageParagraph.style.width= "100%";

    this.domElement.appendChild(messageParagraph);
    
    if (!this._hasScrolledUp()){
      this._scrollToBottom();
      this.scroll= this.domElement.scrollTop;
    }
  }
  
  warn(message){
    /**
     * Adds a warning message to the console
    */
    const messageParagraph= document.createElement("p");
    messageParagraph.innerText= `[ WARN ]\t${message}`;
    messageParagraph.setAttribute("style", this.WARN_MESSAGE_STYLE);
    messageParagraph.style.borderBottom= "1px solid rgba(255, 215, 00, 0.5)";
    messageParagraph.style.padding= ".5rem 0";
    messageParagraph.style.width= "100%";
    
    this.domElement.appendChild(messageParagraph);
    
    if (!this._hasScrolledUp()){
      this._scrollToBottom();
      this.scroll= this.domElement.scrollTop;
    }
  }
  
  error(message){
    /**
     * Adds an error message to the console
    */
    const messageParagraph= document.createElement("p");
    messageParagraph.innerText= `[ ERROR ]\t${message}`;
    messageParagraph.setAttribute("style", this.ERROR_MESSAGE_STYLE);
    messageParagraph.style.borderBottom= "1px solid rgba(255, 99, 71, 0.5)";
    messageParagraph.style.padding= ".5rem 0";
    messageParagraph.style.width= "100%";
    
    this.domElement.appendChild(messageParagraph);
    
    if (!this._hasScrolledUp()){
      this._scrollToBottom();
      this.scroll= this.domElement.scrollTop;
    }
  }
}