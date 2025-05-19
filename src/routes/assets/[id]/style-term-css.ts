const style = `*{margin:0;padding:0;box-sizing:border-box}
    html,body{height:100%;width:100%;background:#000;font-family:monospace;overflow:hidden}

    /* splash container fills the whole window */
    #splash{
        position:fixed;inset:0;
        display:flex;justify-content:center;align-items:center;
        transition:transform .6s ease,opacity .6s ease;
        cursor:pointer;                /* opera‑style hand */
    }
    /* GIF takes 100 % of viewport but keeps ratio */
    #pluggy{
        width:100vw;height:100vh;object-fit:contain;image-rendering:pixelated;
        animation:breath 4s ease-in-out infinite;
        pointer-events:none;            /* hover events stay on #splash */
    }
    @keyframes breath{
        0%{transform:translateY(0)}
        50%{transform:translateY(-6px)}
        100%{transform:translateY(0)}
    }
    /* floating tooltip */
    #hint{
        position:fixed;                 /* fixed so it follows viewport directly */
        padding:3px 6px;font-size:13px;
        background:#000c;color:lime;border-radius:4px;
        pointer-events:none;opacity:0;transition:opacity .25s;
        transform:translate(12px,12px); /* small offset from cursor */
    }

    /* tiny terminal ------------------------------------------------------- */
    #termWrap{
        position:block;inset:0;display:none;background:#000;
        width: 100%;
        background-color: #101010;
        color: #0f0;
        height: 100%;
        font-family: monospace;
        font-size: 14px;
        overflow-y: auto
    }
    #output{;padding:10px;overflow-y:auto;white-space:pre-wrap; color: #0f0}
    #inputBar{display:flex;padding:8px;border-top:1px solid #333}
    #cmd{flex:1;background:#000;border:none;color:#0f0;font-family:inherit;outline:none}


#output a{
    content: "🔗";
    margin-right: .5em;
    text-decoration: none !important;
}

#output a, #output a:visited {
    color: #364dff;
}




            #output {
                width: 100%;
                display: block;
               
                word-break: break-word
            }

            #inputBar {
                width: 100%;
                display: block;
                order: 2;
        
            }

            #output a,#output a:visited {
                color: #364dff
            }

            #output a::before {
                content: "🔗";
                margin-right: .5em;
                text-decoration: none!important
            }

            #output a:hover {
                color: #ff0
            }

            #inputBar {
                display: inline-block;
                vertical-align: top;
                margin-right: .5em
            }

            #cmd {
                font-family: monospace;
                background-color: #101010;
                color: #0f0;
                font-size: 14px;
                height: 100%;
                word-wrap: break-word;
                border: 0;
                display: inline-block;
                width: calc(100% - 2em);
                vertical-align: top
            }

            #cmd:focus {
                outline: 0
            }`;

            export default style;