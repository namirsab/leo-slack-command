# Leo Slack Command

Slack command that allows usage of the Leo dictionary https://dict.leo.org/ as a slack command.

## Usage

```
/leo [<languageCode>] <term>
```

* `langaugeCode`: *OPTIONAL* Language to translate from or to, depending on the term.
    * es (Spanish)
    * en (English)
    * it (Italian)
    * pt (Portuguese)
    * fr (French)
    * ch (Chinese)
    * ru (Russian)
    * pl (Polish)

The language code get's saved. It only needs to be used once, and the command will remember afterwards.

* `term`: Term to translate. If the term is in german, it will be translated to the specified language, and viceversa.