# Botium Connector for Webspeech Input/Output

[![NPM](https://nodei.co/npm/botium-connector-webspeech.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/fbmessengerbots-connector-webspeech/)

[![Codeship Status for codeforequity-at/botium-connector-webspeech](https://app.codeship.com/projects/88b80180-20bb-0138-59ee-1ed6ecea113b/status?branch=master)](https://app.codeship.com/projects/382617)
[![npm version](https://badge.fury.io/js/botium-connector-webspeech.svg)](https://badge.fury.io/js/botium-connector-webspeech)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

This is a [Botium](https://github.com/codeforequity-at/botium-core) connector for using audio input and output via [Webspeech API](https://de.wikipedia.org/wiki/Web_Speech_API)

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles ? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works ?
Botium starts a web browser and utilizes the integrated Webspeech controls to start a conversation with whoever is sitting in front of the workstation. This can be a human, but also an Alexa or Google device.

Botium is able to use the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for running the test conversations.
* For the user part of the conversation, the Web Speech API outputs voice to the system speaker
* For the chatbot part of the conversation, the Web Speech API listens for voice with the system microphone

Naturally, a browser supporting the SpeechRecognition and the SpeechSynthesis of the Web Speech API is a precondition - see [here](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API#Browser_compatibility) for an overview - a not too old Chrome is a good choice.

**For obvious reasons, this Botium connector only works on a workstation with graphical user interface, not in a typical CI/CD environment**

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

## Requirements

* __Node.js and NPM__
* a __Web Browser__ (Currently, the only desktop browser to [support Webspeech API is Google Chrome](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition#Browser_compatibility))
* a __project directory__ on your workstation to hold test cases and Botium configuration

## Install Botium and Webspeech Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-webspeech
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-webspeech
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

_Already integrated into Botium Box, no setup required_

## Connecting with Botium

```
{
  "botium": {
    "Capabilities": {
      "PROJECTNAME": "<whatever>",
      "CONTAINERMODE": "webspeech"
    }
  }
}
```

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __webspeech__ to activate this connector.

```
const Capabilities = {
  WEBSPEECH_SERVER_PORT: 'WEBSPEECH_SERVER_PORT',
  WEBSPEECH_LANGUAGE: 'WEBSPEECH_LANGUAGE',
  WEBSPEECH_PITCH: 'WEBSPEECH_PITCH',
  WEBSPEECH_RATE: 'WEBSPEECH_RATE',
  WEBSPEECH_VOLUME: 'WEBSPEECH_VOLUME',
  WEBSPEECH_VOICE: 'WEBSPEECH_VOICE',
  WEBSPEECH_CLOSEBROWSER: 'WEBSPEECH_CLOSEBROWSER',
  WEBSPEECH_BROWSER_APP: 'WEBSPEECH_BROWSER_APP'
}

const Defaults = {
  [Capabilities.WEBSPEECH_SERVER_PORT]: 46050,
  [Capabilities.WEBSPEECH_LANGUAGE]: 'en-US',
  [Capabilities.WEBSPEECH_CLOSEBROWSER]: true,
  [Capabilities.WEBSPEECH_BROWSER_APP]: 'chrome'  
}
```

### WEBSPEECH_SERVER_PORT
_Default: 46050_

Botium opens up a temporary local web server to inject some Botium code into the browser. The port number can be choosen, but usually the default settings are fine.

### WEBSPEECH_BROWSER_APP

Botium uses the [opn](https://github.com/sindresorhus/opn) library to open the system default application for opening a web site. What browser is actually opened depends on system settings. To force a specific browser to be opened, the "app" option of the opn-library can be changed (for example, "chrome" on Windows).

### WEBSPEECH_CLOSEBROWSER
_Default: true_

Sometimes it can be useful to leave the browser window open after running a test case (attention: when running multiple test cases, lots of browser windows will stay open). Mainly for debugging purposes - you can open the Javascript console of the browser of WebSpeech API is failing.

### WEBSPEECH_LANGUAGE
_Default: "en-US"_

The language to use in speech recognition and speech synthesis.
See:
* https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition/lang
* https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance/lang

### WEBSPEECH_PITCH, WEBSPEECH_RATE, WEBSPEECH_VOLUME, WEBSPEECH_VOICE

With these capabilities the SpeechSynthesis can be adapted.
See: 
* https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance






