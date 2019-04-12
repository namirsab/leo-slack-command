
// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const fetch = require('node-fetch');
const cheerio = require('cheerio');



fastify.register(require('fastify-formbody'))

// Declare a route
fastify.post('/leo', async (request, reply) => {
    console.log('hello');
    const { text } = request.body;
    const url = `https://dict.leo.org/spanisch-deutsch/${text}`;
    console.log(request)
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const results = $('[data-dz-ui=dictentry]');
    const response = [...results.map((index, dictEntry) => {
        const $dictEntry = $(dictEntry);
        const spanishText = $dictEntry.find('td[lang="es"]').text();
        const germanText = $dictEntry.find('td[lang="de"]').text();
        return `${spanishText} <-> ${germanText}`;
    }).get()].join('\n');

    return {
        text: `*Results for "${text}"*`,
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