
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync');
const Memory = require('lowdb/adapters/Memory')

const adapter = new FileSync('db.json');
const db = low(adapter)

const languageCodeToLanguageSetting = {
    es: 'spanisch',
    en: 'englisch',
    pt: 'portugiesisch',
    it: 'italienisch',
    ch: 'chinesisch',
    ru: 'russisch',
    pl: 'polnisch',
}

// Arguments as /leo pt hallo
const parseArguments = ({ argsText, defaultSourceLanguageCode = 'es' }) => {
    const args = argsText.split(' ');
    let sourceLanguageCode = defaultSourceLanguageCode;
    let term; 
    if (args.length > 1) {
        sourceLanguageCode = args[0];
        term = args[1];
    } else {
        term = args[0];
    }

    const fromLanguage = languageCodeToLanguageSetting[sourceLanguageCode];

    return {
        fromLanguage,
        sourceLanguageCode,
        term,
    };
};

async function fetchTranslations({ fromLanguage, term, sourceLanguageCode }) {
    const url = `https://dict.leo.org/${fromLanguage}-deutsch/${term}`;
    console.log({ url });
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);
    const results = $('[data-dz-ui=dictentry]');
    const response = [...results.map((index, dictEntry) => {
        const $dictEntry = $(dictEntry);
        const spanishText = $dictEntry.find(`td[lang="${sourceLanguageCode}"]`).text();
        const germanText = $dictEntry.find('td[lang="de"]').text();
        return `${spanishText} <-> ${germanText}`;
    }).get()].join('\n');
    return response;
}

fastify.register(require('fastify-formbody'))

// Declare a route
fastify.post('/leo', async (request, reply) => {
    const { text, user_id } = request.body;
    
    const defaultSourceLanguageCode = db.get(user_id).value();

    const { fromLanguage, term, sourceLanguageCode } = parseArguments({ 
        argsText: text, 
        defaultSourceLanguageCode,
    });
    
    
    const translations = await fetchTranslations({ 
        fromLanguage, 
        term, 
        sourceLanguageCode,
    });
    
    // Override user preference
    db.set(user_id, sourceLanguageCode).write();

    console.log({
        fromLanguage,
        term,
        sourceLanguageCode,
    })
    
    return {
        text: `*Results for "${term}"*`,
        attachments: [{
            title: 'Leo',
            text: translations
        }],
    };
})

// Run the server!
const start = async () => {
    await fastify.listen(4930)
    fastify.log.info(`server listening on ${fastify.server.address().port}`)
}

start()


