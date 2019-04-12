
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const preferences = {
    defaultLanguageSetting: 'spanisch-deutsch',
}

const userPrefs = {};

const parseArguments = ({ argsText, defaultLanguageSetting }) => {
    const args = argsText.split(' ');
    console.log 
    let languageSetting = defaultLanguageSetting;
    let sourceLanguageCode = 'es';
    let term; 
    if (args.length > 1) {
        languageSetting = args[0];
        term = args[1];
    } else {
        term = args[0];
    }

    if (languageSetting.includes('englisch')) {
        sourceLanguageCode = 'en';
    }

    return {
        languageSetting,
        sourceLanguageCode,
        term,
    };
};



fastify.register(require('fastify-formbody'))



// Declare a route
fastify.post('/leo', async (request, reply) => {
    const { text, user_id } = request.body;
    console.log({ user_id });
    const defaultLanguageSetting = userPrefs[user_id] || preferences.defaultLanguageSetting;
    const { languageSetting, term, sourceLanguageCode } = parseArguments({ 
        argsText: text, 
        defaultLanguageSetting,
    });
    console.log({
        text,
        languageSetting,
        term,
        sourceLanguageCode
    });

    userPrefs[user_id] = languageSetting;

    const url = `https://dict.leo.org/${languageSetting}/${term}`;
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const results = $('[data-dz-ui=dictentry]');
    const response = [...results.map((index, dictEntry) => {
        const $dictEntry = $(dictEntry);
        const spanishText = $dictEntry.find(`td[lang="${sourceLanguageCode}"]`).text();
        const germanText = $dictEntry.find('td[lang="de"]').text();
        return `${spanishText} <-> ${germanText}`;
    }).get()].join('\n');

    return {
        text: `*Results for "${term}"*`,
        attachments: [{
            title: 'Leo',
            text: response
        }],
    };
})

// Run the server!
const start = async () => {
    await fastify.listen(4930)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
}
start()