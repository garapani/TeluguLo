// $Id: RTSTransformer.js,v 1.2 2005/09/25 14:52:28 vnagarjuna Exp $ -->

// Copyright 2005 Nagarjuna Venna <vnagarjuna@yahoo.com>
// See http://lekhini.org/scripts/padma-license.txt

// Changes Copyright 2006 Veeven <veeven at gmail dot com>
// See http://lekhini.org/license.txt

//RTS Modes
RTSTransformer.rtsEnglish = 0;
RTSTransformer.rtsTelugu = 1;


function RTSTransformer(input, output) {
    this.input = input;
    this.output = output;
    this.rtsMode = RTSTransformer.rtsEnglish;
}

function RTSTransformer_setRTSMode(mode) {
    if (mode != RTSTransformer.rtsEnglish && mode != RTSTransformer.rtsTelugu)
        return false;
    this.rtsMode = mode;
    return true;
}

function RTSTransformer_parse(text) {
    var parser = new RTSParser(text);
    var output = "";

    while (parser.more())
        output += this.toOutputFormat(parser.next());

    return output;
}

function RTSTransformer_convert(text) {
    if (this.rtsMode != RTSTransformer.rtsEnglish && this.rtsMode != RTSTransformer.rtsTelugu) {
        alert("Invalid RTS mode " + this.rtsMode);
        this.rtsMode = 0;
    }

    var output = "";
    var next = 0;

    do {
        var hash = text.indexOf('#', next);
        if (hash == next) {
            hash = text.indexOf('#', hash + 1);
            if (hash != -1) {
                //Mode remains unchanged because we process text between hashes here
                if (this.rtsMode == RTSTransformer.rtsEnglish)
                    output += this.parse(text.substring(next + 1, hash));
                else output += text.substring(next + 1, hash);
            }
            else {
                //mode changes because there is no terminating hash
                if (this.rtsMode == RTSTransformer.rtsEnglish) {
                    this.rtsMode = RTSTransformer.rtsTelugu;
                    output += this.parse(text.substring(next + 1));
                }
                else {
                    this.rtsMode = RTSTransformer.rtsEnglish;
                    output += text.substring(next + 1);
                }
            }
            next = hash + 1;
        }
        //don't change the mode yet because it will be done when it is matched the next time around
        else if (hash != -1) {
            if (this.rtsMode == RTSTransformer.rtsEnglish)
                output += text.substring(next, hash);
            else output += this.parse(text.substring(next, hash));
            next = hash;
        }
        //Mode reamins the same because there are no more hashes
        else {
            if (this.rtsMode == RTSTransformer.rtsEnglish)
                output += text.substring(next);
            else output += this.parse(text.substring(next));
        }
    } while (hash != -1 && hash < text.length);
    //alert(output);
    return output;
}

//This doesn't seem to work in extension mode, add any mods to relationships.js too
RTSTransformer.prototype = new Transformer(Transformer.method_RTS, Transformer.method_Unicode);
RTSTransformer.prototype.convert = RTSTransformer_convert;
RTSTransformer.prototype.setRTSMode = RTSTransformer_setRTSMode;
RTSTransformer.prototype.parse = RTSTransformer_parse;
