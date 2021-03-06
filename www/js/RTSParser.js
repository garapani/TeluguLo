// $Id: RTSParser.js,v 1.6 2005/12/05 23:09:25 vnagarjuna Exp $ -->

// Copyright 2005 Nagarjuna Venna <vnagarjuna@yahoo.com>
// See http://lekhini.org/scripts/padma-license.txt

// See http://lekhini.org/license.txt

//Parser for RTS Text - returns syllables

function RTSParser(input) {
    this.index = 0;
    this.length = input.length;
    this.text = input;
}

function RTSParser_updateSymbolType(type) {
    if (this.state != Parser.state_CONSNT)
        return type;
    switch (type) {
        case Padma.type_accu:
            return Padma.type_gunintam;

        case Padma.type_hallu:
            return Padma.type_vattu;

        default:
            return type;
    }
}

function RTSParser_getNextMatch(length, index) {
    var result = { key: null, value: null }, key, value;
    var remaining = length - index, maxLookupLen = remaining > RTS.maxLookupLen ? RTS.maxLookupLen : remaining;

    for (var i = maxLookupLen; i > 0; i--) {
        key = this.text.substring(index, index + i);
        value = RTS.lookup(key);
        if (value == null)
            continue;
        //found a match
        if (value == Padma.syllbreak || RTS.isPossibleAnusvara(key)) {
            //if there is more text then if syllable break, see if it should be converted to pollu
            //or if is a possible anusvara see if it is one of the consonants that makes the n/m an anusvara
            if (length - index - i > 0) {
                var next = this.getNextMatch(length, index + i);
                if (value == Padma.syllbreak) {
                    if (next.value == null || Padma.getType(next.value) != Padma.type_hallu)
                        value = Padma.pollu;
                }
                else if (next.value != null && RTS.isAnusvara(value, next.value)) {
                    result.key = key;
                    result.value = Padma.anusvara;
                    return result;
                }
            }
            else if (value == Padma.syllbreak)
                value = Padma.pollu;
        }
        break;
    }
    result.key = key;
    result.value = value;
    return result;
}

function RTSParser_next() {
    var response = new Syllable(), done = false;

    var remaining = this.length - this.index;
    for (; remaining > 0; remaining = this.length - this.index) {
        if (this.cache.key == null) {
            var result = this.getNextMatch(this.length, this.index);
            this.handleInput(result.value, result.key, response);
        }
        else {
            var key = this.cache.key, value = this.cache.value;
            this.cache.key = this.cache.value = null;
            this.handleInput(value, key, response);
        }

        if (this.state == Parser.state_START)
            return response.getSyllable();
    }

    if (response.length != 0) {
        this.handleConsonantTermination(response);
        return response.getSyllable();
    }
    return null;
}

function RTSParser_handleConsonantTermination(current) {
    if (current.body == Padma.consnt_MA) {
        current.body = Padma.anusvara;
    }
    else current.body += Padma.pollu;
}

//This doesn't seem to work in extension mode, add any mods to relationships.js too
RTSParser.prototype = new Parser("");
RTSParser.prototype.next = RTSParser_next;
RTSParser.prototype.updateSymbolType = RTSParser_updateSymbolType;
RTSParser.prototype.handleConsonantTermination = RTSParser_handleConsonantTermination;
RTSParser.prototype.getNextMatch = RTSParser_getNextMatch;
